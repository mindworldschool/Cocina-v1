/**
 * Компонент формы
 */

export class Form {
    constructor(options = {}) {
        this.fields = options.fields || [];
        this.onSubmit = options.onSubmit || null;
        this.onCancel = options.onCancel || null;
        this.submitText = options.submitText || 'Сохранить';
        this.cancelText = options.cancelText || 'Отмена';
        this.showCancel = options.showCancel !== false;
        this.data = options.data || {};
    }

    /**
     * Рендерит форму
     */
    render() {
        const formId = 'form_' + Date.now();
        
        const fieldsHTML = this.fields.map(field => this.renderField(field)).join('');
        
        return `
            <form id="${formId}" class="form">
                ${fieldsHTML}
                
                <div class="form-actions" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
                    ${this.showCancel ? `
                        <button type="button" class="btn btn-outline" data-action="cancel">
                            ${this.cancelText}
                        </button>
                    ` : ''}
                    <button type="submit" class="btn btn-primary">
                        ${this.submitText}
                    </button>
                </div>
            </form>
        `;
    }

    /**
     * Рендерит отдельное поле
     */
    renderField(field) {
        const value = this.data[field.name] || field.defaultValue || '';
        const required = field.required ? 'required' : '';
        const disabled = field.disabled ? 'disabled' : '';
        
        let inputHTML = '';
        
        switch (field.type) {
            case 'text':
            case 'email':
            case 'number':
                inputHTML = `
                    <input 
                        type="${field.type}" 
                        id="${field.name}" 
                        name="${field.name}" 
                        class="form-input" 
                        value="${value}"
                        placeholder="${field.placeholder || ''}"
                        ${required}
                        ${disabled}
                        ${field.min !== undefined ? `min="${field.min}"` : ''}
                        ${field.max !== undefined ? `max="${field.max}"` : ''}
                        ${field.step !== undefined ? `step="${field.step}"` : ''}
                    >
                `;
                break;
                
            case 'textarea':
                inputHTML = `
                    <textarea 
                        id="${field.name}" 
                        name="${field.name}" 
                        class="form-textarea"
                        placeholder="${field.placeholder || ''}"
                        rows="${field.rows || 3}"
                        ${required}
                        ${disabled}
                    >${value}</textarea>
                `;
                break;
                
            case 'select':
                const options = field.options || [];
                const optionsHTML = options.map(opt => {
                    const optValue = typeof opt === 'object' ? opt.value : opt;
                    const optLabel = typeof opt === 'object' ? opt.label : opt;
                    const selected = optValue == value ? 'selected' : '';
                    return `<option value="${optValue}" ${selected}>${optLabel}</option>`;
                }).join('');
                
                inputHTML = `
                    <select 
                        id="${field.name}" 
                        name="${field.name}" 
                        class="form-select"
                        ${required}
                        ${disabled}
                    >
                        ${field.placeholder ? `<option value="">${field.placeholder}</option>` : ''}
                        ${optionsHTML}
                    </select>
                `;
                break;
                
            case 'checkbox':
                const checked = value ? 'checked' : '';
                inputHTML = `
                    <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                        <input 
                            type="checkbox" 
                            id="${field.name}" 
                            name="${field.name}" 
                            value="1"
                            ${checked}
                            ${disabled}
                        >
                        <span>${field.checkboxLabel || field.label}</span>
                    </label>
                `;
                break;
                
            case 'radio':
                const radioOptions = field.options || [];
                inputHTML = radioOptions.map(opt => {
                    const optValue = typeof opt === 'object' ? opt.value : opt;
                    const optLabel = typeof opt === 'object' ? opt.label : opt;
                    const checked = optValue == value ? 'checked' : '';
                    return `
                        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; margin-bottom: 0.5rem;">
                            <input
                                type="radio"
                                name="${field.name}"
                                value="${optValue}"
                                ${checked}
                                ${disabled}
                            >
                            <span>${optLabel}</span>
                        </label>
                    `;
                }).join('');
                break;

            case 'edging-editor':
                const edgingValue = value || { top: 0, bottom: 0, left: 0, right: 0 };
                inputHTML = `
                    <div class="edging-editor" data-field="${field.name}">
                        <div class="edging-preview">
                            <div class="edging-visual">
                                <button type="button" class="edging-btn edging-top ${edgingValue.top ? 'active' : ''}" data-side="top" title="Верхняя кромка">
                                    ⬆️
                                </button>
                                <div class="edging-middle">
                                    <button type="button" class="edging-btn edging-left ${edgingValue.left ? 'active' : ''}" data-side="left" title="Левая кромка">
                                        ⬅️
                                    </button>
                                    <div class="edging-center">
                                        <svg width="80" height="60" viewBox="0 0 80 60">
                                            <rect x="10" y="10" width="60" height="40" fill="#e0e0e0" stroke="#999" stroke-width="1"/>
                                            <!-- Верхняя кромка -->
                                            <rect class="edge-top" x="10" y="10" width="60" height="3" fill="${edgingValue.top ? '#2563eb' : 'transparent'}"/>
                                            <!-- Нижняя кромка -->
                                            <rect class="edge-bottom" x="10" y="47" width="60" height="3" fill="${edgingValue.bottom ? '#2563eb' : 'transparent'}"/>
                                            <!-- Левая кромка -->
                                            <rect class="edge-left" x="10" y="10" width="3" height="40" fill="${edgingValue.left ? '#2563eb' : 'transparent'}"/>
                                            <!-- Правая кромка -->
                                            <rect class="edge-right" x="67" y="10" width="3" height="40" fill="${edgingValue.right ? '#2563eb' : 'transparent'}"/>
                                        </svg>
                                    </div>
                                    <button type="button" class="edging-btn edging-right ${edgingValue.right ? 'active' : ''}" data-side="right" title="Правая кромка">
                                        ➡️
                                    </button>
                                </div>
                                <button type="button" class="edging-btn edging-bottom ${edgingValue.bottom ? 'active' : ''}" data-side="bottom" title="Нижняя кромка">
                                    ⬇️
                                </button>
                            </div>
                            <div class="edging-info" style="margin-top: 1rem; font-size: 0.875rem; color: var(--color-text-muted);">
                                <strong>Выбрано кромок:</strong> <span class="edging-count">${Object.values(edgingValue).filter(v => v).length}</span>
                                <button type="button" class="btn btn-sm btn-outline" style="margin-left: 1rem;" data-action="edging-toggle-all">
                                    Выбрать все / Снять все
                                </button>
                            </div>
                        </div>
                        <!-- Скрытые inputs для хранения значений -->
                        <input type="hidden" name="${field.name}[top]" value="${edgingValue.top}">
                        <input type="hidden" name="${field.name}[bottom]" value="${edgingValue.bottom}">
                        <input type="hidden" name="${field.name}[left]" value="${edgingValue.left}">
                        <input type="hidden" name="${field.name}[right]" value="${edgingValue.right}">
                    </div>
                `;
                break;
                
            default:
                inputHTML = `<input type="text" class="form-input" name="${field.name}" value="${value}">`;
        }
        
        // Для checkbox не показываем label отдельно
        const showLabel = field.type !== 'checkbox';
        
        return `
            <div class="form-group">
                ${showLabel ? `
                    <label class="form-label" for="${field.name}">
                        ${field.label}
                        ${field.required ? '<span style="color: var(--color-danger);">*</span>' : ''}
                    </label>
                ` : ''}
                ${inputHTML}
                ${field.help ? `<div class="form-help">${field.help}</div>` : ''}
                <div class="form-error" id="error-${field.name}"></div>
            </div>
        `;
    }

    /**
     * Подключает обработчики событий
     */
    attachEvents(container) {
        const form = container.querySelector('form');
        if (!form) return;

        // Submit
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (this.validate(form)) {
                const data = this.getData(form);
                if (this.onSubmit) {
                    this.onSubmit(data);
                }
            }
        });

        // Cancel
        const cancelBtn = form.querySelector('[data-action="cancel"]');
        if (cancelBtn && this.onCancel) {
            cancelBtn.addEventListener('click', () => {
                this.onCancel();
            });
        }

        // Real-time validation
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });

        // Edging editor
        this.attachEdgingEvents(form);
    }

    /**
     * Подключает события для редактора кромки
     */
    attachEdgingEvents(form) {
        const edgingEditors = form.querySelectorAll('.edging-editor');

        edgingEditors.forEach(editor => {
            const fieldName = editor.dataset.field;

            // Кнопки кромок
            const edgingBtns = editor.querySelectorAll('.edging-btn[data-side]');
            edgingBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const side = btn.dataset.side;
                    this.toggleEdging(editor, side);
                });
            });

            // Кнопка "Выбрать все / Снять все"
            const toggleAllBtn = editor.querySelector('[data-action="edging-toggle-all"]');
            if (toggleAllBtn) {
                toggleAllBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleAllEdging(editor);
                });
            }
        });
    }

    /**
     * Переключает кромку на одной стороне
     */
    toggleEdging(editor, side) {
        const btn = editor.querySelector(`.edging-btn[data-side="${side}"]`);
        const input = editor.querySelector(`input[name$="[${side}]"]`);
        const svgEdge = editor.querySelector(`.edge-${side}`);

        if (!input || !btn) return;

        // Переключаем состояние
        const newValue = input.value === '1' ? '0' : '1';
        input.value = newValue;

        // Обновляем UI
        btn.classList.toggle('active');

        if (svgEdge) {
            svgEdge.setAttribute('fill', newValue === '1' ? '#2563eb' : 'transparent');
        }

        // Обновляем счетчик
        this.updateEdgingCount(editor);
    }

    /**
     * Переключает все кромки сразу
     */
    toggleAllEdging(editor) {
        const inputs = editor.querySelectorAll('input[type="hidden"]');
        const anyActive = Array.from(inputs).some(inp => inp.value === '1');

        const newValue = anyActive ? '0' : '1';

        inputs.forEach(input => {
            const side = input.name.match(/\[(\w+)\]$/)[1];
            input.value = newValue;

            const btn = editor.querySelector(`.edging-btn[data-side="${side}"]`);
            const svgEdge = editor.querySelector(`.edge-${side}`);

            if (btn) {
                btn.classList.toggle('active', newValue === '1');
            }

            if (svgEdge) {
                svgEdge.setAttribute('fill', newValue === '1' ? '#2563eb' : 'transparent');
            }
        });

        this.updateEdgingCount(editor);
    }

    /**
     * Обновляет счетчик выбранных кромок
     */
    updateEdgingCount(editor) {
        const countSpan = editor.querySelector('.edging-count');
        if (!countSpan) return;

        const inputs = editor.querySelectorAll('input[type="hidden"]');
        const count = Array.from(inputs).filter(inp => inp.value === '1').length;

        countSpan.textContent = count;
    }

    /**
     * Валидация формы
     */
    validate(form) {
        let isValid = true;
        
        this.fields.forEach(field => {
            const input = form.querySelector(`[name="${field.name}"]`);
            if (input && !this.validateField(input, field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * Валидация отдельного поля
     */
    validateField(input, fieldConfig = null) {
        const field = fieldConfig || this.fields.find(f => f.name === input.name);
        if (!field) return true;

        const errorElement = document.getElementById(`error-${field.name}`);
        if (!errorElement) return true;

        // Очищаем предыдущую ошибку
        errorElement.textContent = '';
        input.classList.remove('error');

        let error = null;

        // Required
        if (field.required) {
            if (input.type === 'checkbox') {
                if (!input.checked) {
                    error = `${field.label} обязательно`;
                }
            } else if (!input.value || input.value.trim() === '') {
                error = `${field.label} обязательно для заполнения`;
            }
        }

        // Number validation
        if (!error && field.type === 'number' && input.value) {
            const num = Number(input.value);
            
            if (isNaN(num)) {
                error = `${field.label} должно быть числом`;
            } else if (field.min !== undefined && num < field.min) {
                error = `${field.label} не может быть меньше ${field.min}`;
            } else if (field.max !== undefined && num > field.max) {
                error = `${field.label} не может быть больше ${field.max}`;
            }
        }

        // Email validation
        if (!error && field.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                error = 'Некорректный email адрес';
            }
        }

        // Custom validation
        if (!error && field.validate) {
            error = field.validate(input.value);
        }

        // Показываем ошибку
        if (error) {
            errorElement.textContent = error;
            input.classList.add('error');
            return false;
        }

        return true;
    }

    /**
     * Получает данные из формы
     */
    getData(form) {
        const data = {};

        this.fields.forEach(field => {
            if (field.type === 'edging-editor') {
                // Специальная обработка для редактора кромки
                const topInput = form.querySelector(`[name="${field.name}[top]"]`);
                const bottomInput = form.querySelector(`[name="${field.name}[bottom]"]`);
                const leftInput = form.querySelector(`[name="${field.name}[left]"]`);
                const rightInput = form.querySelector(`[name="${field.name}[right]"]`);

                data[field.name] = {
                    top: topInput ? parseInt(topInput.value) : 0,
                    bottom: bottomInput ? parseInt(bottomInput.value) : 0,
                    left: leftInput ? parseInt(leftInput.value) : 0,
                    right: rightInput ? parseInt(rightInput.value) : 0
                };
            } else {
                const input = form.querySelector(`[name="${field.name}"]`);

                if (!input) return;

                if (field.type === 'checkbox') {
                    data[field.name] = input.checked;
                } else if (field.type === 'number') {
                    data[field.name] = input.value ? Number(input.value) : null;
                } else {
                    data[field.name] = input.value;
                }
            }
        });

        return data;
    }

    /**
     * Устанавливает данные в форму
     */
    setData(form, data) {
        Object.entries(data).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            
            if (!input) return;
            
            if (input.type === 'checkbox') {
                input.checked = !!value;
            } else {
                input.value = value || '';
            }
        });
    }

    /**
     * Сбрасывает форму
     */
    reset(form) {
        form.reset();
        
        // Очищаем ошибки
        const errors = form.querySelectorAll('.form-error');
        errors.forEach(error => error.textContent = '');
        
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => input.classList.remove('error'));
    }
}

/**
 * Создает быстрые формы
 */
export class FormBuilder {
    static createModuleBasicForm(module = null) {
        return new Form({
            fields: [
                {
                    name: 'code',
                    label: 'Код модуля',
                    type: 'text',
                    placeholder: 'Например: N1D',
                    required: true,
                    help: 'Уникальный код для идентификации модуля'
                },
                {
                    name: 'name',
                    label: 'Название',
                    type: 'text',
                    placeholder: 'Например: Нижний 1 дверь',
                    required: true
                },
                {
                    name: 'category',
                    label: 'Категория',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'lower', label: 'Нижний' },
                        { value: 'upper', label: 'Верхний' },
                        { value: 'tall', label: 'Пенал' },
                        { value: 'corner', label: 'Угловой' }
                    ]
                },
                {
                    name: 'notes',
                    label: 'Примечания',
                    type: 'textarea',
                    placeholder: 'Дополнительная информация о модуле',
                    rows: 3
                }
            ],
            data: module || {},
            submitText: module ? 'Сохранить изменения' : 'Создать модуль'
        });
    }

    static createModuleSizesForm(module = null) {
        const defaultSizes = module?.defaultSizes || { width: 600, height: 890, depth: 560 };
        
        return new Form({
            fields: [
                {
                    name: 'width',
                    label: 'Ширина по умолчанию (мм)',
                    type: 'number',
                    required: true,
                    min: 100,
                    max: 2000,
                    step: 10
                },
                {
                    name: 'height',
                    label: 'Высота по умолчанию (мм)',
                    type: 'number',
                    required: true,
                    min: 100,
                    max: 3000,
                    step: 10
                },
                {
                    name: 'depth',
                    label: 'Глубина по умолчанию (мм)',
                    type: 'number',
                    required: true,
                    min: 100,
                    max: 1000,
                    step: 10
                }
            ],
            data: defaultSizes,
            submitText: 'Сохранить размеры'
        });
    }

    static createDetailForm(detail = null) {
        return new Form({
            fields: [
                {
                    name: 'name',
                    label: 'Название детали',
                    type: 'text',
                    placeholder: 'Например: Боковина',
                    required: true
                },
                {
                    name: 'length',
                    label: 'Длина (мм или формула)',
                    type: 'text',
                    placeholder: 'Например: height или 890',
                    required: true,
                    help: 'Можно указать число или формулу (width, height, depth, thickness)'
                },
                {
                    name: 'width',
                    label: 'Ширина (мм или формула)',
                    type: 'text',
                    placeholder: 'Например: depth или 560',
                    required: true
                },
                {
                    name: 'quantity',
                    label: 'Количество',
                    type: 'number',
                    required: true,
                    min: 1,
                    defaultValue: 1
                },
                {
                    name: 'material',
                    label: 'Материал',
                    type: 'select',
                    required: true,
                    options: [
                        { value: 'LDSP', label: 'ЛДСП' },
                        { value: 'MDF', label: 'МДФ' },
                        { value: 'HDF', label: 'ХДФ' },
                        { value: 'Plywood', label: 'Фанера' }
                    ]
                },
                {
                    name: 'edging',
                    label: 'Кромка (выберите стороны)',
                    type: 'edging-editor',
                    help: 'Нажмите на стрелки или центр детали, чтобы выбрать кромку на нужных сторонах'
                },
                {
                    name: 'edgingType',
                    label: 'Тип кромки',
                    type: 'select',
                    options: [
                        { value: 'PVC_04', label: 'ПВХ 0.4 мм' },
                        { value: 'PVC_1', label: 'ПВХ 1 мм' },
                        { value: 'PVC_2', label: 'ПВХ 2 мм' },
                        { value: 'ABS', label: 'ABS кромка' }
                    ]
                },
                {
                    name: 'optional',
                    label: 'Опциональная деталь',
                    type: 'checkbox',
                    checkboxLabel: 'Эта деталь опциональная (можно добавить/убрать)'
                },
                {
                    name: 'notes',
                    label: 'Примечания',
                    type: 'textarea',
                    rows: 2
                }
            ],
            data: detail || {},
            submitText: detail ? 'Сохранить' : 'Добавить деталь'
        });
    }

    static createHardwareForm(hardware = null) {
        return new Form({
            fields: [
                {
                    name: 'name',
                    label: 'Название',
                    type: 'text',
                    placeholder: 'Например: Петля накладная',
                    required: true
                },
                {
                    name: 'article',
                    label: 'Артикул',
                    type: 'text',
                    placeholder: 'Например: BLUM-71T3550',
                    required: true,
                    help: 'Используется для поиска цены в прайс-листе'
                },
                {
                    name: 'quantity',
                    label: 'Количество',
                    type: 'number',
                    required: true,
                    min: 0,
                    defaultValue: 1
                },
                {
                    name: 'formula',
                    label: 'Формула расчета (опционально)',
                    type: 'text',
                    placeholder: 'Например: facades.count * 2',
                    help: 'Оставьте пустым для фиксированного количества'
                },
                {
                    name: 'category',
                    label: 'Категория',
                    type: 'select',
                    options: [
                        { value: 'hinge', label: 'Петли' },
                        { value: 'slide', label: 'Направляющие' },
                        { value: 'handle', label: 'Ручки' },
                        { value: 'leg', label: 'Ножки' },
                        { value: 'fastener', label: 'Крепеж' },
                        { value: 'system', label: 'Системы хранения' },
                        { value: 'other', label: 'Прочее' }
                    ]
                },
                {
                    name: 'unit',
                    label: 'Единица измерения',
                    type: 'select',
                    options: [
                        { value: 'шт', label: 'штук' },
                        { value: 'пара', label: 'пар' },
                        { value: 'комплект', label: 'комплектов' },
                        { value: 'м/п', label: 'метров погонных' }
                    ]
                },
                {
                    name: 'optional',
                    label: 'Опциональная фурнитура',
                    type: 'checkbox',
                    checkboxLabel: 'Эта фурнитура опциональная'
                },
                {
                    name: 'notes',
                    label: 'Примечания',
                    type: 'textarea',
                    rows: 2
                }
            ],
            data: hardware || {},
            submitText: hardware ? 'Сохранить' : 'Добавить фурнитуру'
        });
    }
}
