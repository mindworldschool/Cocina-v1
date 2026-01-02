/**
 * Работа с хранилищем данных (LocalStorage)
 * В будущем можно заменить на IndexedDB
 */

export class Database {
    constructor() {
        this.storageKey = 'kitchenCalculator';
        this.data = {
            modules: [],
            projects: [],
            prices: [],
            settings: {}
        };
    }

    async init() {
        console.log('🗄️ Инициализация базы данных...');
        
        // Загружаем данные из localStorage
        const stored = localStorage.getItem(this.storageKey);
        
        if (stored) {
            try {
                this.data = JSON.parse(stored);
                console.log('✅ Данные загружены из localStorage');
            } catch (error) {
                console.error('❌ Ошибка парсинга данных:', error);
                await this.loadDefaultData();
            }
        } else {
            console.log('📦 Загрузка данных по умолчанию...');
            await this.loadDefaultData();
        }
    }

    async loadDefaultData() {
        // Загружаем дефолтные модули из JSON файла
        try {
            const response = await fetch('data/default-modules.json');
            if (response.ok) {
                const defaultModules = await response.json();
                this.data.modules = defaultModules;
                console.log(`✅ Загружено ${defaultModules.length} модулей по умолчанию`);
            }
        } catch (error) {
            console.warn('⚠️ Не удалось загрузить default-modules.json');
            // Создаем один тестовый модуль
            this.data.modules = [this.createTestModule()];
        }

        this.save();
    }

    createTestModule() {
        return {
            id: 'module_001',
            code: 'N1D',
            name: 'Нижний 1 дверь',
            category: 'lower',
            defaultSizes: {
                width: 600,
                height: 890,
                depth: 560
            },
            details: [
                {
                    id: 'sidewall',
                    name: 'Боковина',
                    length: 'height',
                    width: 'depth',
                    quantity: 2,
                    material: 'LDSP',
                    edging: { top: 1, bottom: 1, left: 1, right: 0 }
                },
                {
                    id: 'bottom',
                    name: 'Дно',
                    length: 'width - (thickness * 2)',
                    width: 'depth',
                    quantity: 1,
                    material: 'LDSP',
                    edging: { top: 1, bottom: 0, left: 1, right: 1 }
                }
            ],
            hardware: [
                {
                    id: 'hinge',
                    name: 'Петля накладная',
                    article: 'BLUM-71T3550',
                    quantity: 2
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            console.log('💾 Данные сохранены');
            return true;
        } catch (error) {
            console.error('❌ Ошибка сохранения:', error);
            return false;
        }
    }

    // ============================================
    // МОДУЛИ
    // ============================================

    async getAllModules() {
        return this.data.modules;
    }

    async getModuleById(id) {
        return this.data.modules.find(m => m.id === id);
    }

    async createModule(module) {
        const newModule = {
            ...module,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.data.modules.push(newModule);
        this.save();
        return newModule;
    }

    async updateModule(id, updates) {
        const index = this.data.modules.findIndex(m => m.id === id);
        if (index !== -1) {
            this.data.modules[index] = {
                ...this.data.modules[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save();
            return this.data.modules[index];
        }
        return null;
    }

    async deleteModule(id) {
        this.data.modules = this.data.modules.filter(m => m.id !== id);
        this.save();
        return true;
    }

    // ============================================
    // ПРОЕКТЫ
    // ============================================

    async getAllProjects() {
        return this.data.projects;
    }

    async getProjectById(id) {
        return this.data.projects.find(p => p.id === id);
    }

    async createProject(project) {
        const newProject = {
            ...project,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.data.projects.push(newProject);
        this.save();
        return newProject;
    }

    async updateProject(id, updates) {
        const index = this.data.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.data.projects[index] = {
                ...this.data.projects[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save();
            return this.data.projects[index];
        }
        return null;
    }

    async deleteProject(id) {
        this.data.projects = this.data.projects.filter(p => p.id !== id);
        this.save();
        return true;
    }

    // ============================================
    // ПРАЙС-ЛИСТ
    // ============================================

    async getAllPrices() {
        return this.data.prices;
    }

    async getPriceByArticle(article) {
        return this.data.prices.find(p => p.article === article);
    }

    async updatePrice(article, price, name = '') {
        const index = this.data.prices.findIndex(p => p.article === article);
        
        if (index !== -1) {
            this.data.prices[index].price = price;
            this.data.prices[index].lastUpdated = new Date().toISOString();
        } else {
            this.data.prices.push({
                article,
                name,
                price,
                lastUpdated: new Date().toISOString()
            });
        }
        
        this.save();
        return true;
    }

    // ============================================
    // УТИЛИТЫ
    // ============================================

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    async importData(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.data = imported;
            this.save();
            return true;
        } catch (error) {
            console.error('❌ Ошибка импорта:', error);
            return false;
        }
    }

    async clearAll() {
        this.data = {
            modules: [],
            projects: [],
            prices: [],
            settings: {}
        };
        this.save();
        console.log('🗑️ Все данные удалены');
    }
}
