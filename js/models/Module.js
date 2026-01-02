/**
 * Класс модуля кухни
 */

export class Module {
    constructor(data = {}) {
        this.id = data.id || null;
        this.code = data.code || '';
        this.name = data.name || '';
        this.category = data.category || 'lower'; // lower | upper | tall | corner
        
        this.defaultSizes = data.defaultSizes || {
            width: 600,
            height: 890,
            depth: 560
        };
        
        this.sizeRanges = data.sizeRanges || {
            width: { min: 300, max: 1200, step: 50 },
            height: { min: 700, max: 2400, step: 10 },
            depth: { min: 300, max: 600, step: 10 }
        };
        
        this.corpus = data.corpus || {
            material: 'LDSP',
            thickness: 19,
            backWall: {
                material: 'HDF',
                thickness: 3
            }
        };
        
        this.details = data.details || [];
        this.facades = data.facades || [];
        this.hardware = data.hardware || [];
        this.fasteners = data.fasteners || [];
        this.operations = data.operations || [];
        this.additionalParts = data.additionalParts || [];
        this.options = data.options || [];
        
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    // ============================================
    // ВАЛИДАЦИЯ
    // ============================================

    validate() {
        const errors = [];

        if (!this.code) {
            errors.push('Код модуля обязателен');
        }

        if (!this.name) {
            errors.push('Название модуля обязательно');
        }

        if (!this.category) {
            errors.push('Категория модуля обязательна');
        }

        if (!this.defaultSizes.width || this.defaultSizes.width <= 0) {
            errors.push('Ширина должна быть больше 0');
        }

        if (!this.defaultSizes.height || this.defaultSizes.height <= 0) {
            errors.push('Высота должна быть больше 0');
        }

        if (!this.defaultSizes.depth || this.defaultSizes.depth <= 0) {
            errors.push('Глубина должна быть больше 0');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    // ============================================
    // РАБОТА С ДЕТАЛЯМИ
    // ============================================

    addDetail(detail) {
        this.details.push(detail);
        this.updatedAt = new Date().toISOString();
    }

    removeDetail(detailId) {
        this.details = this.details.filter(d => d.id !== detailId);
        this.updatedAt = new Date().toISOString();
    }

    updateDetail(detailId, updates) {
        const index = this.details.findIndex(d => d.id === detailId);
        if (index !== -1) {
            this.details[index] = { ...this.details[index], ...updates };
            this.updatedAt = new Date().toISOString();
        }
    }

    getDetail(detailId) {
        return this.details.find(d => d.id === detailId);
    }

    // ============================================
    // РАБОТА С ФАСАДАМИ
    // ============================================

    addFacade(facade) {
        this.facades.push(facade);
        this.updatedAt = new Date().toISOString();
    }

    removeFacade(facadeId) {
        this.facades = this.facades.filter(f => f.id !== facadeId);
        this.updatedAt = new Date().toISOString();
    }

    updateFacade(facadeId, updates) {
        const index = this.facades.findIndex(f => f.id === facadeId);
        if (index !== -1) {
            this.facades[index] = { ...this.facades[index], ...updates };
            this.updatedAt = new Date().toISOString();
        }
    }

    // ============================================
    // РАБОТА С ФУРНИТУРОЙ
    // ============================================

    addHardware(hardware) {
        this.hardware.push(hardware);
        this.updatedAt = new Date().toISOString();
    }

    removeHardware(hardwareId) {
        this.hardware = this.hardware.filter(h => h.id !== hardwareId);
        this.updatedAt = new Date().toISOString();
    }

    updateHardware(hardwareId, updates) {
        const index = this.hardware.findIndex(h => h.id === hardwareId);
        if (index !== -1) {
            this.hardware[index] = { ...this.hardware[index], ...updates };
            this.updatedAt = new Date().toISOString();
        }
    }

    // ============================================
    // КЛОНИРОВАНИЕ
    // ============================================

    clone() {
        const cloned = new Module({
            ...this.toJSON(),
            id: null,
            code: this.code + '_copy',
            name: this.name + ' (копия)',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return cloned;
    }

    // ============================================
    // СЕРИАЛИЗАЦИЯ
    // ============================================

    toJSON() {
        return {
            id: this.id,
            code: this.code,
            name: this.name,
            category: this.category,
            defaultSizes: this.defaultSizes,
            sizeRanges: this.sizeRanges,
            corpus: this.corpus,
            details: this.details,
            facades: this.facades,
            hardware: this.hardware,
            fasteners: this.fasteners,
            operations: this.operations,
            additionalParts: this.additionalParts,
            options: this.options,
            notes: this.notes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    static fromJSON(json) {
        return new Module(json);
    }

    // ============================================
    // ПОЛУЧЕНИЕ ИНФОРМАЦИИ
    // ============================================

    getDetailsCount() {
        return this.details.length;
    }

    getFacadesCount() {
        return this.facades.length;
    }

    getHardwareCount() {
        return this.hardware.length;
    }

    getTotalDetailsCount() {
        return this.details.reduce((sum, d) => sum + (d.quantity || 0), 0);
    }

    // ============================================
    // КАТЕГОРИИ
    // ============================================

    static getCategories() {
        return {
            lower: 'Нижний',
            upper: 'Верхний',
            tall: 'Пенал',
            corner: 'Угловой'
        };
    }

    static getCategoryName(category) {
        const categories = Module.getCategories();
        return categories[category] || 'Модуль';
    }

    getCategoryName() {
        return Module.getCategoryName(this.category);
    }
}
