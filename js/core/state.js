/**
 * Управление состоянием приложения
 */

export class State {
    constructor() {
        this.data = {
            modules: [],
            projects: [],
            prices: [],
            settings: {
                currency: 'EUR',
                language: 'ru',
                materialDefaults: {
                    ldspThickness: 19,
                    hdfThickness: 3,
                    edgingType: 'PVC_04'
                }
            }
        };
        
        this.listeners = {
            modules: [],
            projects: [],
            prices: []
        };
    }

    // ============================================
    // МОДУЛИ
    // ============================================

    getModules() {
        return this.data.modules;
    }

    getModuleById(id) {
        return this.data.modules.find(m => m.id === id);
    }

    getModulesByCategory(category) {
        return this.data.modules.filter(m => m.category === category);
    }

    setModules(modules) {
        this.data.modules = modules;
        this.notifyListeners('modules');
    }

    addModule(module) {
        this.data.modules.push(module);
        this.notifyListeners('modules');
    }

    updateModule(id, updates) {
        const index = this.data.modules.findIndex(m => m.id === id);
        if (index !== -1) {
            this.data.modules[index] = { 
                ...this.data.modules[index], 
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.notifyListeners('modules');
        }
    }

    deleteModule(id) {
        this.data.modules = this.data.modules.filter(m => m.id !== id);
        this.notifyListeners('modules');
    }

    // ============================================
    // ПРОЕКТЫ
    // ============================================

    getProjects() {
        return this.data.projects;
    }

    getProjectById(id) {
        return this.data.projects.find(p => p.id === id);
    }

    setProjects(projects) {
        this.data.projects = projects;
        this.notifyListeners('projects');
    }

    addProject(project) {
        this.data.projects.push(project);
        this.notifyListeners('projects');
    }

    updateProject(id, updates) {
        const index = this.data.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            this.data.projects[index] = { 
                ...this.data.projects[index], 
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.notifyListeners('projects');
        }
    }

    deleteProject(id) {
        this.data.projects = this.data.projects.filter(p => p.id !== id);
        this.notifyListeners('projects');
    }

    // ============================================
    // ПРАЙС-ЛИСТ
    // ============================================

    getPrices() {
        return this.data.prices;
    }

    getPriceByArticle(article) {
        return this.data.prices.find(p => p.article === article);
    }

    setPrices(prices) {
        this.data.prices = prices;
        this.notifyListeners('prices');
    }

    updatePrice(article, price) {
        const index = this.data.prices.findIndex(p => p.article === article);
        if (index !== -1) {
            this.data.prices[index].price = price;
            this.data.prices[index].lastUpdated = new Date().toISOString();
        } else {
            this.data.prices.push({
                article,
                price,
                lastUpdated: new Date().toISOString()
            });
        }
        this.notifyListeners('prices');
    }

    // ============================================
    // НАСТРОЙКИ
    // ============================================

    getSettings() {
        return this.data.settings;
    }

    updateSettings(settings) {
        this.data.settings = { ...this.data.settings, ...settings };
    }

    // ============================================
    // ПОДПИСКИ
    // ============================================

    subscribe(type, callback) {
        if (this.listeners[type]) {
            this.listeners[type].push(callback);
        }
    }

    unsubscribe(type, callback) {
        if (this.listeners[type]) {
            this.listeners[type] = this.listeners[type].filter(cb => cb !== callback);
        }
    }

    notifyListeners(type) {
        if (this.listeners[type]) {
            this.listeners[type].forEach(callback => callback(this.data[type]));
        }
    }

    // ============================================
    // ПОИСК И ФИЛЬТРАЦИЯ
    // ============================================

    searchModules(query) {
        const lowerQuery = query.toLowerCase();
        return this.data.modules.filter(module => 
            module.name.toLowerCase().includes(lowerQuery) ||
            module.code.toLowerCase().includes(lowerQuery)
        );
    }

    filterModulesByCategory(category) {
        if (!category) return this.data.modules;
        return this.data.modules.filter(m => m.category === category);
    }
}
