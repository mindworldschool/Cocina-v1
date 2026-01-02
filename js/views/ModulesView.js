/**
 * Представление библиотеки модулей
 */

import { showNotification } from '../utils/helpers.js';
import { Modal } from '../components/Modal.js';
import { ModuleEditor } from './ModuleEditor.js';

export class ModulesView {
    constructor(state, db) {
        this.state = state;
        this.db = db;
        this.container = document.getElementById('modules-list');
        this.searchInput = document.getElementById('search-modules');
        this.categoryFilter = document.getElementById('filter-category');
        
        this.init();
    }

    init() {
        console.log('📦 Инициализация ModulesView');
        
        // Подписываемся на изменения
        this.state.subscribe('modules', () => this.render());
        
        // События
        this.initEvents();
        
        // Первый рендер
        this.render();
    }

    initEvents() {
        // Поиск
        this.searchInput.addEventListener('input', (e) => {
            this.filterModules();
        });

        // Фильтр по категории
        this.categoryFilter.addEventListener('change', () => {
            this.filterModules();
        });

        // Кнопка добавления модуля
        const addBtn = document.getElementById('btn-add-module');
        addBtn.addEventListener('click', () => {
            this.showAddModuleModal();
        });
    }

    filterModules() {
        const query = this.searchInput.value.toLowerCase();
        const category = this.categoryFilter.value;
        
        let modules = this.state.getModules();
        
        // Фильтр по категории
        if (category) {
            modules = modules.filter(m => m.category === category);
        }
        
        // Поиск
        if (query) {
            modules = modules.filter(m => 
                m.name.toLowerCase().includes(query) ||
                m.code.toLowerCase().includes(query)
            );
        }
        
        this.renderModules(modules);
    }

    render() {
        const modules = this.state.getModules();
        this.renderModules(modules);
    }

    renderModules(modules) {
        if (modules.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <div class="empty-state-icon">📦</div>
                    <h3>Нет модулей</h3>
                    <p>Начните с создания первого модуля</p>
                    <button class="btn btn-primary" onclick="document.getElementById('btn-add-module').click()">
                        ➕ Создать модуль
                    </button>
                </div>
            `;
            return;
        }

        this.container.innerHTML = modules.map(module => this.renderModuleCard(module)).join('');
        
        // Добавляем события на карточки
        this.attachCardEvents();
    }

    renderModuleCard(module) {
        const categoryIcons = {
            lower: '🟦',
            upper: '🟨',
            tall: '🟩',
            corner: '🟧'
        };

        const categoryNames = {
            lower: 'Нижний',
            upper: 'Верхний',
            tall: 'Пенал',
            corner: 'Угловой'
        };

        const detailsCount = module.details?.length || 0;
        const hardwareCount = module.hardware?.length || 0;

        return `
            <div class="module-card" data-id="${module.id}">
                <div class="module-card-header">
                    <div class="module-icon ${module.category}">
                        ${categoryIcons[module.category] || '📦'}
                    </div>
                    <div class="module-actions">
                        <button class="icon-btn" data-action="edit" data-id="${module.id}" title="Редактировать">
                            ✏️
                        </button>
                        <button class="icon-btn" data-action="clone" data-id="${module.id}" title="Клонировать">
                            📋
                        </button>
                        <button class="icon-btn danger" data-action="delete" data-id="${module.id}" title="Удалить">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="module-card-body">
                    <div class="module-code">${module.code}</div>
                    <h3 class="module-title">${module.name}</h3>
                    
                    <div class="module-sizes">
                        <span title="Ширина">📏 ${module.defaultSizes.width}</span>
                        <span title="Высота">📐 ${module.defaultSizes.height}</span>
                        <span title="Глубина">📊 ${module.defaultSizes.depth}</span>
                    </div>
                    
                    <span class="badge badge-primary">${categoryNames[module.category] || 'Модуль'}</span>
                </div>
                
                <div class="module-card-footer">
                    <div class="module-stat">
                        <span class="module-stat-label">Детали</span>
                        <span class="module-stat-value">${detailsCount}</span>
                    </div>
                    <div class="module-stat">
                        <span class="module-stat-label">Фурнитура</span>
                        <span class="module-stat-value">${hardwareCount}</span>
                    </div>
                </div>
            </div>
        `;
    }

    attachCardEvents() {
        // Клик по карточке
        this.container.querySelectorAll('.module-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Игнорируем если клик по кнопке действия
                if (e.target.closest('.icon-btn')) return;
                
                const id = card.dataset.id;
                this.showModuleDetails(id);
            });
        });

        // Кнопки действий
        this.container.querySelectorAll('.icon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                
                switch (action) {
                    case 'edit':
                        this.editModule(id);
                        break;
                    case 'clone':
                        this.cloneModule(id);
                        break;
                    case 'delete':
                        this.deleteModule(id);
                        break;
                }
            });
        });
    }

    showModuleDetails(id) {
        const module = this.state.getModuleById(id);
        if (!module) return;

        const modal = new Modal({
            title: `${module.code} | ${module.name}`,
            content: this.renderModuleDetails(module),
            size: 'large',
            buttons: [
                {
                    text: '✏️ Редактировать',
                    className: 'btn btn-primary',
                    onClick: () => {
                        modal.close();
                        this.editModule(id);
                    }
                },
                {
                    text: 'Закрыть',
                    className: 'btn btn-outline',
                    onClick: () => modal.close()
                }
            ]
        });

        modal.show();
    }

    renderModuleDetails(module) {
        return `
            <div class="module-details">
                <h4>📐 Размеры по умолчанию</h4>
                <div class="form-row" style="margin-bottom: 1.5rem;">
                    <div>
                        <strong>Ширина:</strong> ${module.defaultSizes.width} мм
                    </div>
                    <div>
                        <strong>Высота:</strong> ${module.defaultSizes.height} мм
                    </div>
                    <div>
                        <strong>Глубина:</strong> ${module.defaultSizes.depth} мм
                    </div>
                </div>

                <h4>🔧 Детали корпуса (${module.details?.length || 0})</h4>
                <div style="margin-bottom: 1.5rem;">
                    ${module.details?.map(d => `
                        <div style="padding: 0.75rem; background: var(--color-bg); border-radius: var(--radius-md); margin-bottom: 0.5rem;">
                            <strong>${d.name}</strong><br>
                            <small>Размеры: ${d.length} × ${d.width} | Кол-во: ${d.quantity}</small>
                        </div>
                    `).join('') || '<p>Нет деталей</p>'}
                </div>

                <h4>🔩 Фурнитура (${module.hardware?.length || 0})</h4>
                <div>
                    ${module.hardware?.map(h => `
                        <div style="padding: 0.75rem; background: var(--color-bg); border-radius: var(--radius-md); margin-bottom: 0.5rem;">
                            <strong>${h.name}</strong><br>
                            <small>Артикул: ${h.article} | Кол-во: ${h.quantity}</small>
                        </div>
                    `).join('') || '<p>Нет фурнитуры</p>'}
                </div>
            </div>
        `;
    }

    showAddModuleModal() {
    new ModuleEditor(this.state, this.db);
}

editModule(id) {
    new ModuleEditor(this.state, this.db, id);
}

    async cloneModule(id) {
        const module = this.state.getModuleById(id);
        if (!module) return;

        const clone = {
            ...module,
            id: undefined,
            code: module.code + '_copy',
            name: module.name + ' (копия)'
        };

        try {
            const newModule = await this.db.createModule(clone);
            this.state.addModule(newModule);
            showNotification('success', `Модуль "${module.name}" успешно клонирован`);
        } catch (error) {
            showNotification('error', 'Ошибка клонирования модуля');
        }
    }

    async deleteModule(id) {
        const module = this.state.getModuleById(id);
        if (!module) return;

        if (!confirm(`Удалить модуль "${module.name}"?`)) return;

        try {
            await this.db.deleteModule(id);
            this.state.deleteModule(id);
            showNotification('success', 'Модуль удален');
        } catch (error) {
            showNotification('error', 'Ошибка удаления модуля');
        }
    }

    destroy() {
        // Отписываемся от событий
        this.state.unsubscribe('modules', this.render);
    }
}
