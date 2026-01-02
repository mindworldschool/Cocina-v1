/**
 * Kitchen Calculator Pro
 * Главный файл приложения
 */

import { State } from './core/state.js';
import { Database } from './core/database.js';
import { ModulesView } from './views/ModulesView.js';
import { showNotification } from './utils/helpers.js';

class App {
    constructor() {
        this.state = new State();
        this.db = new Database();
        this.currentView = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Kitchen Calculator Pro запускается...');
        
        try {
            // Инициализация базы данных
            await this.db.init();
            console.log('✅ База данных инициализирована');
            
            // Загрузка данных в State
            await this.loadData();
            
            // Инициализация UI
            this.initUI();
            
            // Загрузка первого view
            this.showView('modules');
            
            console.log('✅ Приложение готово к работе!');
            showNotification('success', 'Приложение загружено успешно!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            showNotification('error', 'Ошибка загрузки приложения');
        }
    }

    async loadData() {
        // Загружаем модули
        const modules = await this.db.getAllModules();
        this.state.setModules(modules);
        console.log(`📦 Загружено модулей: ${modules.length}`);
        
        // Загружаем проекты
        const projects = await this.db.getAllProjects();
        this.state.setProjects(projects);
        console.log(`📁 Загружено проектов: ${projects.length}`);
        
        // Загружаем прайс-лист
        const prices = await this.db.getAllPrices();
        this.state.setPrices(prices);
        console.log(`💰 Загружено цен: ${prices.length}`);
    }

    initUI() {
        // Навигация
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.showView(view);
            });
        });

        console.log('✅ UI инициализирован');
    }

    showView(viewName) {
        // Скрываем все views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Убираем активный класс со всех кнопок
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Показываем нужный view
        const viewElement = document.getElementById(`view-${viewName}`);
        if (viewElement) {
            viewElement.classList.add('active');
        }

        // Активируем кнопку
        const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        // Инициализируем view
        this.initView(viewName);
    }

    initView(viewName) {
        // Уничтожаем предыдущий view если есть
        if (this.currentView && this.currentView.destroy) {
            this.currentView.destroy();
        }

        // Создаем новый view
        switch (viewName) {
            case 'modules':
                this.currentView = new ModulesView(this.state, this.db);
                break;
            case 'projects':
                // this.currentView = new ProjectsView(this.state, this.db);
                this.showPlaceholder('projects', '📁', 'Проекты в разработке');
                break;
            case 'pricelist':
                // this.currentView = new PriceListView(this.state, this.db);
                this.showPlaceholder('pricelist', '💰', 'Прайс-лист в разработке');
                break;
            case 'settings':
                this.showPlaceholder('settings', '⚙️', 'Настройки в разработке');
                break;
        }

        console.log(`📄 Загружен view: ${viewName}`);
    }

    showPlaceholder(viewName, icon, text) {
        const container = document.getElementById(`view-${viewName}`);
        const content = container.querySelector('.view-header').nextElementSibling;
        
        if (content && !content.classList.contains('empty-state')) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">${icon}</div>
                    <h3>${text}</h3>
                    <p>Этот раздел будет добавлен в следующих версиях</p>
                </div>
            `;
        }
    }
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
