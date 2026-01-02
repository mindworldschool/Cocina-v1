/**
 * Класс фурнитуры
 */

export class Hardware {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.article = data.article || ''; // Артикул для поиска цены
        this.quantity = data.quantity || 1;
        this.formula = data.formula || null; // Формула для расчета количества
        this.category = data.category || 'other'; // hinge | slide | handle | leg | fastener | other
        this.unit = data.unit || 'шт'; // шт | пара | комплект | м/п
        this.optional = data.optional || false;
        this.pricePerUnit = data.pricePerUnit || 0;
        this.notes = data.notes || '';
        this.parameters = data.parameters || {}; // Дополнительные параметры
    }

    // ============================================
    // ВАЛИДАЦИЯ
    // ============================================

    validate() {
        const errors = [];

        if (!this.name) {
            errors.push('Название фурнитуры обязательно');
        }

        if (!this.article && !this.optional) {
            errors.push('Артикул обязателен');
        }

        if (!this.quantity || this.quantity < 0) {
            errors.push('Количество должно быть >= 0');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // ============================================
    // РАСЧЕТ КОЛИЧЕСТВА
    // ============================================

    hasFormula() {
        return this.formula !== null && this.formula !== '';
    }

    // ============================================
    // СТОИМОСТЬ
    // ============================================

    calculateCost(actualQuantity = null) {
        const qty = actualQuantity !== null ? actualQuantity : this.quantity;
        return qty * this.pricePerUnit;
    }

    getTotalCost() {
        return this.calculateCost();
    }

    // ============================================
    // СЕРИАЛИЗАЦИЯ
    // ============================================

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            article: this.article,
            quantity: this.quantity,
            formula: this.formula,
            category: this.category,
            unit: this.unit,
            optional: this.optional,
            pricePerUnit: this.pricePerUnit,
            notes: this.notes,
            parameters: this.parameters
        };
    }

    static fromJSON(json) {
        return new Hardware(json);
    }

    // ============================================
    // КЛОНИРОВАНИЕ
    // ============================================

    clone() {
        return new Hardware(this.toJSON());
    }

    // ============================================
    // КАТЕГОРИИ ФУРНИТУРЫ
    // ============================================

    static getCategories() {
        return {
            hinge: 'Петли',
            slide: 'Направляющие',
            handle: 'Ручки',
            leg: 'Ножки',
            fastener: 'Крепеж',
            system: 'Системы хранения',
            other: 'Прочее'
        };
    }

    static getCategoryName(category) {
        const categories = Hardware.getCategories();
        return categories[category] || 'Прочее';
    }

    getCategoryName() {
        return Hardware.getCategoryName(this.category);
    }

    // ============================================
    // ЕДИНИЦЫ ИЗМЕРЕНИЯ
    // ============================================

    static getUnits() {
        return {
            'шт': 'штук',
            'пара': 'пар',
            'комплект': 'комплектов',
            'м/п': 'метров погонных',
            'м²': 'квадратных метров',
            'кг': 'килограмм'
        };
    }

    static getUnitName(unit) {
        const units = Hardware.getUnits();
        return units[unit] || unit;
    }

    getUnitName() {
        return Hardware.getUnitName(this.unit);
    }
}
