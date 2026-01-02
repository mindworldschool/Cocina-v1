/**
 * Класс детали корпуса
 */

export class Detail {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.length = data.length || 0; // Может быть числом или формулой (строкой)
        this.width = data.width || 0;   // Может быть числом или формулой (строкой)
        this.quantity = data.quantity || 1;
        this.material = data.material || 'LDSP'; // LDSP | MDF | HDF
        this.thickness = data.thickness || null; // Если null - берется из модуля
        
        // Кромкование (какие стороны нужно кромковать)
        this.edging = data.edging || {
            top: 1,    // 1 = нужна кромка, 0 = не нужна
            bottom: 0,
            left: 1,
            right: 1
        };
        
        this.edgingType = data.edgingType || 'PVC_04'; // PVC_04 | PVC_1 | PVC_2 | ABS
        
        this.optional = data.optional || false; // Опциональная деталь
        this.notes = data.notes || '';
    }

    // ============================================
    // ВАЛИДАЦИЯ
    // ============================================

    validate() {
        const errors = [];

        if (!this.name) {
            errors.push('Название детали обязательно');
        }

        if (!this.length) {
            errors.push('Длина детали обязательна');
        }

        if (!this.width) {
            errors.push('Ширина детали обязательна');
        }

        if (!this.quantity || this.quantity <= 0) {
            errors.push('Количество должно быть больше 0');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // ============================================
    // РАСЧЕТ РАЗМЕРОВ
    // ============================================

    isFormula(value) {
        return typeof value === 'string' && (
            value.includes('+') ||
            value.includes('-') ||
            value.includes('*') ||
            value.includes('/') ||
            value.includes('(')
        );
    }

    hasFormula() {
        return this.isFormula(this.length) || this.isFormula(this.width);
    }

    // ============================================
    // КРОМКОВАНИЕ
    // ============================================

    getEdgingLength(calculatedLength, calculatedWidth) {
        let total = 0;
        
        if (this.edging.top) total += calculatedWidth;
        if (this.edging.bottom) total += calculatedWidth;
        if (this.edging.left) total += calculatedLength;
        if (this.edging.right) total += calculatedLength;
        
        return total;
    }

    getEdgingSides() {
        const sides = [];
        if (this.edging.top) sides.push('top');
        if (this.edging.bottom) sides.push('bottom');
        if (this.edging.left) sides.push('left');
        if (this.edging.right) sides.push('right');
        return sides;
    }

    getEdgingCount() {
        return (
            (this.edging.top ? 1 : 0) +
            (this.edging.bottom ? 1 : 0) +
            (this.edging.left ? 1 : 0) +
            (this.edging.right ? 1 : 0)
        );
    }

    // ============================================
    // ПЛОЩАДЬ И ПЕРИМЕТР
    // ============================================

    calculateArea(calculatedLength, calculatedWidth) {
        return (calculatedLength * calculatedWidth * this.quantity) / 1000000; // в м²
    }

    calculatePerimeter(calculatedLength, calculatedWidth) {
        return (calculatedLength + calculatedWidth) * 2;
    }

    // ============================================
    // КОЛИЧЕСТВО РЕЗОВ
    // ============================================

    getCutsCount() {
        // Каждая деталь = 4 реза (если прямоугольная)
        return 4 * this.quantity;
    }

    // ============================================
    // СЕРИАЛИЗАЦИЯ
    // ============================================

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            length: this.length,
            width: this.width,
            quantity: this.quantity,
            material: this.material,
            thickness: this.thickness,
            edging: this.edging,
            edgingType: this.edgingType,
            optional: this.optional,
            notes: this.notes
        };
    }

    static fromJSON(json) {
        return new Detail(json);
    }

    // ============================================
    // КЛОНИРОВАНИЕ
    // ============================================

    clone() {
        return new Detail(this.toJSON());
    }

    // ============================================
    // МАТЕРИАЛЫ
    // ============================================

    static getMaterials() {
        return {
            LDSP: 'ЛДСП',
            MDF: 'МДФ',
            HDF: 'ХДФ',
            Plywood: 'Фанера'
        };
    }

    static getMaterialName(material) {
        const materials = Detail.getMaterials();
        return materials[material] || material;
    }

    getMaterialName() {
        return Detail.getMaterialName(this.material);
    }

    // ============================================
    // ТИПЫ КРОМКИ
    // ============================================

    static getEdgingTypes() {
        return {
            PVC_04: 'ПВХ 0.4 мм',
            PVC_1: 'ПВХ 1 мм',
            PVC_2: 'ПВХ 2 мм',
            ABS: 'ABS кромка'
        };
    }

    static getEdgingTypeName(type) {
        const types = Detail.getEdgingTypes();
        return types[type] || type;
    }

    getEdgingTypeName() {
        return Detail.getEdgingTypeName(this.edgingType);
    }
}
