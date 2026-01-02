/**
 * Библиотека формул для расчета размеров деталей
 */

export class FormulaParser {
    constructor() {
        this.variables = {};
    }

    /**
     * Устанавливает переменные для формул
     */
    setVariables(vars) {
        this.variables = { ...vars };
    }

    /**
     * Добавляет переменную
     */
    setVariable(name, value) {
        this.variables[name] = value;
    }

    /**
     * Парсит и вычисляет формулу
     */
    parse(formula) {
        if (typeof formula === 'number') {
            return formula;
        }

        if (typeof formula !== 'string') {
            return 0;
        }

        try {
            // Заменяем переменные на их значения
            let expression = formula;
            
            for (const [key, value] of Object.entries(this.variables)) {
                // Заменяем переменную на её значение
                // Используем \b для границ слов, чтобы не заменять части слов
                const regex = new RegExp(`\\b${key}\\b`, 'g');
                expression = expression.replace(regex, value);
            }

            // Вычисляем математическое выражение
            const result = this.evaluate(expression);
            
            return Math.round(result * 100) / 100; // Округляем до 2 знаков
        } catch (error) {
            console.error('Ошибка парсинга формулы:', formula, error);
            return 0;
        }
    }

    /**
     * Безопасное вычисление математического выражения
     */
    evaluate(expression) {
        // Удаляем пробелы
        expression = expression.replace(/\s+/g, '');

        // Проверяем что выражение содержит только разрешенные символы
        if (!/^[\d+\-*/().]+$/.test(expression)) {
            throw new Error('Недопустимые символы в выражении');
        }

        // Используем Function для безопасного вычисления
        // (более безопасная альтернатива eval)
        try {
            return new Function(`return ${expression}`)();
        } catch (error) {
            throw new Error('Ошибка вычисления выражения');
        }
    }

    /**
     * Проверяет является ли значение формулой
     */
    static isFormula(value) {
        if (typeof value !== 'string') return false;
        
        return (
            value.includes('+') ||
            value.includes('-') ||
            value.includes('*') ||
            value.includes('/') ||
            value.includes('(') ||
            /[a-zA-Z]/.test(value) // Содержит буквы (переменные)
        );
    }

    /**
     * Извлекает переменные из формулы
     */
    static extractVariables(formula) {
        if (!FormulaParser.isFormula(formula)) {
            return [];
        }

        // Находим все слова (переменные) в формуле
        const matches = formula.match(/\b[a-zA-Z_]\w*\b/g);
        
        if (!matches) return [];
        
        // Убираем дубликаты
        return [...new Set(matches)];
    }

    /**
     * Валидирует формулу
     */
    validateFormula(formula, availableVariables = []) {
        if (!FormulaParser.isFormula(formula)) {
            return { valid: true, errors: [] };
        }

        const errors = [];
        const variables = FormulaParser.extractVariables(formula);

        // Проверяем что все переменные доступны
        variables.forEach(variable => {
            if (!availableVariables.includes(variable) && !(variable in this.variables)) {
                errors.push(`Неизвестная переменная: ${variable}`);
            }
        });

        // Проверяем синтаксис (пробуем вычислить с тестовыми значениями)
        try {
            const testVars = {};
            variables.forEach(v => {
                testVars[v] = 100; // Тестовое значение
            });
            
            const testParser = new FormulaParser();
            testParser.setVariables(testVars);
            testParser.parse(formula);
        } catch (error) {
            errors.push(`Синтаксическая ошибка: ${error.message}`);
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }
}

/**
 * Предопределенные формулы для типовых расчетов
 */
export class CommonFormulas {
    /**
     * Формулы для нижних модулей
     */
    static lower = {
        // Боковины
        sidewall_length: 'height',
        sidewall_width: 'depth',
        
        // Дно/верх
        bottom_length: 'width - (thickness * 2)',
        bottom_width: 'depth',
        
        // Перемычки
        crossbar_length: 'width - (thickness * 2)',
        crossbar_width: 100, // Стандартная ширина
        
        // Полки
        shelf_length: 'width - (thickness * 2)',
        shelf_width: 'depth',
        
        // Задняя стенка
        back_wall_length: 'height - 5',
        back_wall_width: 'width - 5',
        
        // Фасады
        facade_width: 'width - 3',
        facade_height: 'height - 35', // Минус цоколь
    };

    /**
     * Формулы для верхних модулей
     */
    static upper = {
        // Боковины (обычно меньше по глубине)
        sidewall_length: 'height',
        sidewall_width: 'depth',
        
        // Дно/верх
        bottom_length: 'width - (thickness * 2)',
        bottom_width: 'depth',
        
        // Полки
        shelf_length: 'width - (thickness * 2)',
        shelf_width: 'depth',
        
        // Задняя стенка
        back_wall_length: 'height - 5',
        back_wall_width: 'width - 5',
        
        // Фасады
        facade_width: 'width - 3',
        facade_height: 'height - 3',
    };

    /**
     * Формулы для пеналов
     */
    static tall = {
        // Боковины (на всю высоту)
        sidewall_length: 'height',
        sidewall_width: 'depth',
        
        // Дно
        bottom_length: 'width - (thickness * 2)',
        bottom_width: 'depth',
        
        // Полки (может быть несколько)
        shelf_length: 'width - (thickness * 2)',
        shelf_width: 'depth',
        
        // Задняя стенка
        back_wall_length: 'height - 5',
        back_wall_width: 'width - 5',
    };

    /**
     * Формулы для ящиков
     */
    static drawer = {
        // Фасады ящиков (деление высоты)
        drawer_facade_width: 'width - 3',
        drawer_facade_height_2: '(height - 35 - 2) / 2', // Для 2 ящиков
        drawer_facade_height_3: '(height - 35 - 4) / 3', // Для 3 ящиков
        drawer_facade_height_4: '(height - 35 - 6) / 4', // Для 4 ящиков
        
        // Передние планки
        front_plank_length: 'width - (thickness * 2)',
        front_plank_width: 50, // Стандартная ширина
    };

    /**
     * Получить формулы для категории
     */
    static getFormulasForCategory(category) {
        const formulas = {
            lower: CommonFormulas.lower,
            upper: CommonFormulas.upper,
            tall: CommonFormulas.tall,
            corner: CommonFormulas.lower // Угловые используют формулы нижних
        };
        
        return formulas[category] || CommonFormulas.lower;
    }

    /**
     * Создать стандартный набор переменных
     */
    static createStandardVariables(sizes, corpus) {
        return {
            width: sizes.width,
            height: sizes.height,
            depth: sizes.depth,
            thickness: corpus.thickness || 19,
        };
    }
}

/**
 * Помощник для работы с формулами
 */
export class FormulaHelper {
    /**
     * Форматирует формулу для отображения
     */
    static formatFormula(formula) {
        if (typeof formula === 'number') {
            return formula.toString();
        }
        
        if (!FormulaParser.isFormula(formula)) {
            return formula;
        }

        // Заменяем переменные на читаемые названия
        const readable = {
            width: 'Ширина',
            height: 'Высота',
            depth: 'Глубина',
            thickness: 'Толщина'
        };

        let formatted = formula;
        for (const [key, value] of Object.entries(readable)) {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            formatted = formatted.replace(regex, value);
        }

        return formatted;
    }

    /**
     * Создает описание формулы
     */
    static describeFormula(formula, variables = {}) {
        if (typeof formula === 'number') {
            return `Фиксированное значение: ${formula} мм`;
        }

        const formatted = FormulaHelper.formatFormula(formula);
        const parser = new FormulaParser();
        parser.setVariables(variables);
        
        try {
            const result = parser.parse(formula);
            return `${formatted} = ${result} мм`;
        } catch (error) {
            return formatted;
        }
    }

    /**
     * Проверяет все формулы в модуле
     */
    static validateModuleFormulas(module) {
        const errors = [];
        const availableVars = ['width', 'height', 'depth', 'thickness'];

        // Проверяем детали
        module.details.forEach((detail, index) => {
            if (FormulaParser.isFormula(detail.length)) {
                const parser = new FormulaParser();
                const validation = parser.validateFormula(detail.length, availableVars);
                if (!validation.valid) {
                    errors.push(`Деталь #${index + 1} (${detail.name}) - длина: ${validation.errors.join(', ')}`);
                }
            }

            if (FormulaParser.isFormula(detail.width)) {
                const parser = new FormulaParser();
                const validation = parser.validateFormula(detail.width, availableVars);
                if (!validation.valid) {
                    errors.push(`Деталь #${index + 1} (${detail.name}) - ширина: ${validation.errors.join(', ')}`);
                }
            }
        });

        // Проверяем фасады
        module.facades?.forEach((facade, index) => {
            if (FormulaParser.isFormula(facade.width)) {
                const parser = new FormulaParser();
                const validation = parser.validateFormula(facade.width, availableVars);
                if (!validation.valid) {
                    errors.push(`Фасад #${index + 1} (${facade.name}) - ширина: ${validation.errors.join(', ')}`);
                }
            }

            if (FormulaParser.isFormula(facade.height)) {
                const parser = new FormulaParser();
                const validation = parser.validateFormula(facade.height, availableVars);
                if (!validation.valid) {
                    errors.push(`Фасад #${index + 1} (${facade.name}) - высота: ${validation.errors.join(', ')}`);
                }
            }
        });

        return {
            valid: errors.length === 0,
            errors
        };
    }
}
