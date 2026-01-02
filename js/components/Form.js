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
            const input = form.querySelector(`[name="${field.name}"]`);
            
            if (!input) return;
            
            if (field.type === 'checkbox') {
                data[field.name] = input.checked;
            } else if (field.type === 'number') {
                data[field.name] = input.value ? Number(input.value) : null;
            } else {
                data[field.name] = input.value;
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
