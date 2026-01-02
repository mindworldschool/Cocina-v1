/**
 * Валидация данных
 */

export class Validator {
    /**
     * Валидирует обязательное поле
     */
    static required(value, fieldName = 'Поле') {
        if (value === null || value === undefined || value === '') {
            return `${fieldName} обязательно для заполнения`;
        }
        
        if (typeof value === 'string' && value.trim() === '') {
            return `${fieldName} не может быть пустым`;
        }
        
        return null;
    }

    /**
     * Валидирует число
     */
    static number(value, options = {}) {
        const { min, max, fieldName = 'Значение' } = options;
        
        const num = Number(value);
        
        if (isNaN(num)) {
            return `${fieldName} должно быть числом`;
        }
        
        if (min !== undefined && num < min) {
            return `${fieldName} не может быть меньше ${min}`;
        }
        
        if (max !== undefined && num > max) {
            return `${fieldName} не может быть больше ${max}`;
        }
        
        return null;
    }

    /**
     * Валидирует целое число
     */
    static integer(value, options = {}) {
        const numError = Validator.number(value, options);
        if (numError) return numError;
        
        const { fieldName = 'Значение' } = options;
        
        if (!Number.isInteger(Number(value))) {
            return `${fieldName} должно быть целым числом`;
        }
        
        return null;
    }

    /**
     * Валидирует положительное число
     */
    static positive(value, fieldName = 'Значение') {
        const numError = Validator.number(value, { fieldName });
        if (numError) return numError;
        
        if (Number(value) <= 0) {
            return `${fieldName} должно быть больше нуля`;
        }
        
        return null;
    }

    /**
     * Валидирует email
     */
    static email(value, fieldName = 'Email') {
        if (!value) return null; // Пустое значение проверяется через required
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(value)) {
            return `${fieldName} имеет некорректный формат`;
        }
        
        return null;
    }

    /**
     * Валидирует телефон
     */
    static phone(value, fieldName = 'Телефон') {
        if (!value) return null;
        
        // Простая проверка: только цифры, пробелы, +, -, ()
        const phoneRegex = /^[\d\s+\-()]+$/;
        
        if (!phoneRegex.test(value)) {
            return `${fieldName} имеет некорректный формат`;
        }
        
        if (value.replace(/\D/g, '').length < 10) {
            return `${fieldName} слишком короткий`;
        }
        
        return null;
    }

    /**
     * Валидирует длину строки
     */
    static length(value, options = {}) {
        const { min, max, fieldName = 'Значение' } = options;
        
        if (!value) return null;
        
        const length = value.length;
        
        if (min !== undefined && length < min) {
            return `${fieldName} должно содержать минимум ${min} символов`;
        }
        
        if (max !== undefined && length > max) {
            return `${fieldName} должно содержать максимум ${max} символов`;
        }
        
        return null;
    }

    /**
     * Валидирует уникальность
     */
    static unique(value, existingValues, fieldName = 'Значение') {
        if (!value) return null;
        
        if (existingValues.includes(value)) {
            return `${fieldName} должно быть уникальным`;
        }
        
        return null;
    }

    /**
     * Валидирует код модуля
     */
    static moduleCode(value) {
        const requiredError = Validator.required(value, 'Код модуля');
        if (requiredError) return requiredError;
        
        const lengthError = Validator.length(value, { min: 2, max: 10, fieldName: 'Код модуля' });
        if (lengthError) return lengthError;
        
        // Только буквы, цифры, подчеркивание, дефис
        if (!/^[A-Za-z0-9_-]+$/.test(value)) {
            return 'Код может содержать только буквы, цифры, подчеркивание и дефис';
        }
        
        return null;
    }

    /**
     * Валидирует артикул
     */
    static article(value) {
        const requiredError = Validator.required(value, 'Артикул');
        if (requiredError) return requiredError;
        
        const lengthError = Validator.length(value, { min: 3, max: 50, fieldName: 'Артикул' });
        if (lengthError) return lengthError;
        
        return null;
    }

    /**
     * Валидирует размер модуля
     */
    static moduleSize(value, options = {}) {
        const { dimension = 'размер' } = options;
        
        const requiredError = Validator.required(value, dimension);
        if (requiredError) return requiredError;
        
        const positiveError = Validator.positive(value, dimension);
        if (positiveError) return positiveError;
        
        const integerError = Validator.integer(value, { fieldName: dimension });
        if (integerError) return integerError;
        
        return null;
    }

    /**
     * Валидирует формулу
     */
    static formula(value, availableVariables = []) {
        if (!value) return 'Формула не может быть пустой';
        
        // Если это число - всё ок
        if (!isNaN(Number(value))) {
            return null;
        }
        
        // Проверяем что формула содержит только допустимые символы
        if (!/^[\w\s+\-*/().]+$/.test(value)) {
            return 'Формула содержит недопустимые символы';
        }
        
        // Извлекаем переменные
        const variables = value.match(/\b[a-zA-Z_]\w*\b/g) || [];
        
        // Проверяем что все переменные известны
        const unknownVars = variables.filter(v => !availableVariables.includes(v));
        if (unknownVars.length > 0) {
            return `Неизвестные переменные: ${unknownVars.join(', ')}`;
        }
        
        return null;
    }

    /**
     * Валидирует объект по схеме
     */
    static validateObject(obj, schema) {
        const errors = {};
        
        for (const [field, rules] of Object.entries(schema)) {
            const value = obj[field];
            
            for (const rule of rules) {
                const error = rule(value);
                if (error) {
                    errors[field] = error;
                    break; // Первая ошибка останавливает проверку поля
                }
            }
        }
        
        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    }
}

/**
 * Схемы валидации для основных сущностей
 */
export class ValidationSchemas {
    static module = {
        code: [
            (value) => Validator.required(value, 'Код модуля'),
            (value) => Validator.moduleCode(value)
        ],
        name: [
            (value) => Validator.required(value, 'Название'),
            (value) => Validator.length(value, { min: 3, max: 100, fieldName: 'Название' })
        ],
        category: [
            (value) => Validator.required(value, 'Категория')
        ]
    };

    static detail = {
        name: [
            (value) => Validator.required(value, 'Название детали'),
            (value) => Validator.length(value, { min: 2, max: 100, fieldName: 'Название' })
        ],
        length: [
            (value) => Validator.required(value, 'Длина')
        ],
        width: [
            (value) => Validator.required(value, 'Ширина')
        ],
        quantity: [
            (value) => Validator.required(value, 'Количество'),
            (value) => Validator.positive(value, 'Количество'),
            (value) => Validator.integer(value, { fieldName: 'Количество' })
        ]
    };

    static hardware = {
        name: [
            (value) => Validator.required(value, 'Название'),
            (value) => Validator.length(value, { min: 3, max: 100, fieldName: 'Название' })
        ],
        article: [
            (value) => Validator.required(value, 'Артикул'),
            (value) => Validator.article(value)
        ],
        quantity: [
            (value) => Validator.required(value, 'Количество'),
            (value) => Validator.number(value, { min: 0, fieldName: 'Количество' })
        ]
    };

    static project = {
        name: [
            (value) => Validator.required(value, 'Название проекта'),
            (value) => Validator.length(value, { min: 3, max: 200, fieldName: 'Название' })
        ],
        clientName: [
            (value) => Validator.required(value, 'Имя клиента'),
            (value) => Validator.length(value, { min: 2, max: 100, fieldName: 'Имя клиента' })
        ],
        clientEmail: [
            (value) => Validator.email(value, 'Email клиента')
        ]
    };
}
