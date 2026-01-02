/**
 * Компонент таблицы
 */

export class Table {
    constructor(options = {}) {
        this.columns = options.columns || [];
        this.data = options.data || [];
        this.actions = options.actions || [];
        this.emptyMessage = options.emptyMessage || 'Нет данных для отображения';
        this.selectable = options.selectable || false;
        this.onRowClick = options.onRowClick || null;
        this.className = options.className || '';
    }

    /**
     * Рендерит таблицу
     */
    render() {
        if (this.data.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <h3>${this.emptyMessage}</h3>
                </div>
            `;
        }

        return `
            <div class="table-container ${this.className}">
                <table class="table">
                    <thead>
                        <tr>
                            ${this.selectable ? '<th><input type="checkbox" class="select-all"></th>' : ''}
                            ${this.columns.map(col => `
                                <th ${col.sortable ? 'class="sortable"' : ''} data-key="${col.key}">
                                    ${col.label}
                                    ${col.sortable ? '<span class="sort-icon">↕️</span>' : ''}
                                </th>
                            `).join('')}
                            ${this.actions.length > 0 ? '<th>Действия</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.data.map((row, index) => this.renderRow(row, index)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Рендерит строку таблицы
     */
    renderRow(row, index) {
        return `
            <tr data-index="${index}" ${this.onRowClick ? 'class="clickable"' : ''}>
                ${this.selectable ? `
                    <td><input type="checkbox" class="row-select" data-index="${index}"></td>
                ` : ''}
                ${this.columns.map(col => `
                    <td>${this.renderCell(row, col)}</td>
                `).join('')}
                ${this.actions.length > 0 ? `
                    <td class="actions-cell">
                        ${this.actions.map(action => `
                            <button 
                                class="icon-btn ${action.className || ''}" 
                                data-action="${action.name}" 
                                data-index="${index}"
                                title="${action.label}"
                            >
                                ${action.icon}
                            </button>
                        `).join('')}
                    </td>
                ` : ''}
            </tr>
        `;
    }

    /**
     * Рендерит ячейку
     */
    renderCell(row, column) {
        const value = this.getCellValue(row, column.key);
        
        if (column.render) {
            return column.render(value, row);
        }
        
        if (column.type === 'badge') {
            return this.renderBadge(value, column.badgeMap);
        }
        
        if (column.type === 'boolean') {
            return value ? '✅' : '❌';
        }
        
        if (column.type === 'number') {
            return this.formatNumber(value, column.decimals);
        }
        
        if (column.type === 'date') {
            return this.formatDate(value);
        }
        
        return value || '—';
    }

    /**
     * Получает значение ячейки
     */
    getCellValue(row, key) {
        if (key.includes('.')) {
            // Поддержка вложенных свойств (например: "user.name")
            return key.split('.').reduce((obj, k) => obj?.[k], row);
        }
        return row[key];
    }

    /**
     * Рендерит badge
     */
    renderBadge(value, badgeMap = {}) {
        const badge = badgeMap[value] || { text: value, className: 'badge-primary' };
        return `<span class="badge ${badge.className}">${badge.text}</span>`;
    }

    /**
     * Форматирует число
     */
    formatNumber(value, decimals = 2) {
        if (value === null || value === undefined) return '—';
        return Number(value).toFixed(decimals);
    }

    /**
     * Форматирует дату
     */
    formatDate(value) {
        if (!value) return '—';
        const date = new Date(value);
        return date.toLocaleDateString('ru-RU');
    }

    /**
     * Подключает обработчики событий
     */
    attachEvents(container) {
        // Клик по строке
        if (this.onRowClick) {
            const rows = container.querySelectorAll('tbody tr');
            rows.forEach((row, index) => {
                row.addEventListener('click', (e) => {
                    // Игнорируем клики по чекбоксам и кнопкам
                    if (e.target.closest('.row-select') || e.target.closest('.icon-btn')) {
                        return;
                    }
                    this.onRowClick(this.data[index], index);
                });
            });
        }

        // Кнопки действий
        this.actions.forEach(action => {
            const buttons = container.querySelectorAll(`[data-action="${action.name}"]`);
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    action.onClick(this.data[index], index);
                });
            });
        });

        // Выбор всех строк
        const selectAll = container.querySelector('.select-all');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                const checkboxes = container.querySelectorAll('.row-select');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            });
        }

        // Сортировка
        const sortableHeaders = container.querySelectorAll('th.sortable');
        sortableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const key = header.dataset.key;
                this.sort(key);
            });
        });
    }

    /**
     * Сортирует данные
     */
    sort(key) {
        // Простая сортировка (можно расширить)
        this.data.sort((a, b) => {
            const aVal = this.getCellValue(a, key);
            const bVal = this.getCellValue(b, key);
            
            if (typeof aVal === 'string') {
                return aVal.localeCompare(bVal);
            }
            
            return aVal > bVal ? 1 : -1;
        });
    }

    /**
     * Получает выбранные строки
     */
    getSelected(container) {
        const selected = [];
        const checkboxes = container.querySelectorAll('.row-select:checked');
        
        checkboxes.forEach(checkbox => {
            const index = parseInt(checkbox.dataset.index);
            selected.push(this.data[index]);
        });
        
        return selected;
    }

    /**
     * Обновляет данные таблицы
     */
    updateData(newData) {
        this.data = newData;
    }
}

/**
 * Билдер таблиц для быстрого создания
 */
export class TableBuilder {
    /**
     * Таблица модулей
     */
    static createModulesTable(modules, actions = {}) {
        return new Table({
            columns: [
                { 
                    key: 'code', 
                    label: 'Код',
                    render: (value) => `<code>${value}</code>`
                },
                { 
                    key: 'name', 
                    label: 'Название',
                    sortable: true
                },
                { 
                    key: 'category', 
                    label: 'Категория',
                    type: 'badge',
                    badgeMap: {
                        'lower': { text: 'Нижний', className: 'badge-primary' },
                        'upper': { text: 'Верхний', className: 'badge-warning' },
                        'tall': { text: 'Пенал', className: 'badge-success' },
                        'corner': { text: 'Угловой', className: 'badge-danger' }
                    }
                },
                { 
                    key: 'defaultSizes.width', 
                    label: 'Ширина',
                    render: (value) => `${value} мм`
                },
                { 
                    key: 'details', 
                    label: 'Детали',
                    render: (value) => value?.length || 0
                },
                { 
                    key: 'hardware', 
                    label: 'Фурнитура',
                    render: (value) => value?.length || 0
                }
            ],
            data: modules,
            actions: [
                {
                    name: 'view',
                    icon: '👁️',
                    label: 'Просмотр',
                    onClick: actions.onView || (() => {})
                },
                {
                    name: 'edit',
                    icon: '✏️',
                    label: 'Редактировать',
                    onClick: actions.onEdit || (() => {})
                },
                {
                    name: 'delete',
                    icon: '🗑️',
                    label: 'Удалить',
                    className: 'danger',
                    onClick: actions.onDelete || (() => {})
                }
            ],
            emptyMessage: 'Нет модулей для отображения'
        });
    }

    /**
     * Таблица проектов
     */
    static createProjectsTable(projects, actions = {}) {
        return new Table({
            columns: [
                { 
                    key: 'name', 
                    label: 'Название',
                    sortable: true
                },
                { 
                    key: 'clientName', 
                    label: 'Клиент',
                    sortable: true
                },
                { 
                    key: 'status', 
                    label: 'Статус',
                    type: 'badge',
                    badgeMap: {
                        'draft': { text: 'Черновик', className: 'badge-secondary' },
                        'in-progress': { text: 'В работе', className: 'badge-warning' },
                        'completed': { text: 'Завершен', className: 'badge-success' },
                        'archived': { text: 'Архив', className: 'badge-muted' }
                    }
                },
                { 
                    key: 'modules', 
                    label: 'Модулей',
                    render: (value) => value?.length || 0
                },
                { 
                    key: 'createdAt', 
                    label: 'Создан',
                    type: 'date'
                }
            ],
            data: projects,
            actions: [
                {
                    name: 'open',
                    icon: '📂',
                    label: 'Открыть',
                    onClick: actions.onOpen || (() => {})
                },
                {
                    name: 'edit',
                    icon: '✏️',
                    label: 'Редактировать',
                    onClick: actions.onEdit || (() => {})
                },
                {
                    name: 'delete',
                    icon: '🗑️',
                    label: 'Удалить',
                    className: 'danger',
                    onClick: actions.onDelete || (() => {})
                }
            ],
            emptyMessage: 'Нет проектов'
        });
    }

    /**
     * Таблица материалов
     */
    static createMaterialsTable(materials) {
        return new Table({
            columns: [
                { key: 'name', label: 'Материал', sortable: true },
                { 
                    key: 'area', 
                    label: 'Площадь (м²)',
                    type: 'number',
                    decimals: 3
                },
                { 
                    key: 'sheets', 
                    label: 'Листов',
                    type: 'number',
                    decimals: 0
                },
                { 
                    key: 'price', 
                    label: 'Стоимость',
                    render: (value) => `${value.toFixed(2)} €`
                }
            ],
            data: materials,
            emptyMessage: 'Нет материалов'
        });
    }

    /**
     * Таблица фурнитуры
     */
    static createHardwareTable(hardware) {
        return new Table({
            columns: [
                { key: 'name', label: 'Название', sortable: true },
                { 
                    key: 'article', 
                    label: 'Артикул',
                    render: (value) => `<code>${value}</code>`
                },
                { 
                    key: 'quantity', 
                    label: 'Количество',
                    type: 'number',
                    decimals: 0
                },
                { key: 'unit', label: 'Ед. изм.' },
                { 
                    key: 'price', 
                    label: 'Цена',
                    render: (value) => `${value.toFixed(2)} €`
                },
                { 
                    key: 'total', 
                    label: 'Итого',
                    render: (value) => `${value.toFixed(2)} €`
                }
            ],
            data: hardware,
            emptyMessage: 'Нет фурнитуры'
        });
    }
}
