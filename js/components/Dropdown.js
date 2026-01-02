/**
 * Компонент выпадающего списка
 */

export class Dropdown {
    constructor(options = {}) {
        this.items = options.items || [];
        this.onSelect = options.onSelect || null;
        this.placeholder = options.placeholder || 'Выберите...';
        this.searchable = options.searchable || false;
        this.multiple = options.multiple || false;
        this.selected = options.selected || (this.multiple ? [] : null);
        this.className = options.className || '';
    }

    /**
     * Рендерит dropdown
     */
    render() {
        const selectedText = this.getSelectedText();
        
        return `
            <div class="dropdown ${this.className}" data-dropdown>
                <button type="button" class="dropdown-toggle" data-toggle>
                    <span class="dropdown-text">${selectedText}</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                
                <div class="dropdown-menu" data-menu>
                    ${this.searchable ? `
                        <div class="dropdown-search">
                            <input 
                                type="text" 
                                class="dropdown-search-input" 
                                placeholder="Поиск..."
                                data-search
                            >
                        </div>
                    ` : ''}
                    
                    <div class="dropdown-items" data-items>
                        ${this.renderItems()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Рендерит элементы списка
     */
    renderItems(filter = '') {
        const items = this.filterItems(filter);
        
        if (items.length === 0) {
            return '<div class="dropdown-empty">Ничего не найдено</div>';
        }
        
        return items.map((item, index) => {
            const value = typeof item === 'object' ? item.value : item;
            const label = typeof item === 'object' ? item.label : item;
            const isSelected = this.isSelected(value);
            
            return `
                <div 
                    class="dropdown-item ${isSelected ? 'selected' : ''}" 
                    data-value="${value}"
                    data-index="${index}"
                >
                    ${this.multiple ? `
                        <input 
                            type="checkbox" 
                            ${isSelected ? 'checked' : ''}
                            class="dropdown-checkbox"
                        >
                    ` : ''}
                    <span class="dropdown-label">${label}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Фильтрует элементы
     */
    filterItems(filter) {
        if (!filter) return this.items;
        
        const lowerFilter = filter.toLowerCase();
        return this.items.filter(item => {
            const label = typeof item === 'object' ? item.label : item;
            return label.toLowerCase().includes(lowerFilter);
        });
    }

    /**
     * Получает текст выбранного элемента
     */
    getSelectedText() {
        if (this.multiple) {
            if (this.selected.length === 0) {
                return this.placeholder;
            }
            return `Выбрано: ${this.selected.length}`;
        } else {
            if (!this.selected) {
                return this.placeholder;
            }
            
            const item = this.items.find(i => {
                const value = typeof i === 'object' ? i.value : i;
                return value === this.selected;
            });
            
            return typeof item === 'object' ? item.label : item;
        }
    }

    /**
     * Проверяет выбран ли элемент
     */
    isSelected(value) {
        if (this.multiple) {
            return this.selected.includes(value);
        } else {
            return this.selected === value;
        }
    }

    /**
     * Подключает обработчики событий
     */
    attachEvents(container) {
        const dropdown = container.querySelector('[data-dropdown]');
        const toggle = dropdown.querySelector('[data-toggle]');
        const menu = dropdown.querySelector('[data-menu]');
        const itemsContainer = dropdown.querySelector('[data-items]');
        
        // Открытие/закрытие
        toggle.addEventListener('click', () => {
            const isOpen = menu.classList.contains('show');
            this.closeAllDropdowns();
            
            if (!isOpen) {
                menu.classList.add('show');
            }
        });

        // Поиск
        if (this.searchable) {
            const searchInput = dropdown.querySelector('[data-search]');
            searchInput.addEventListener('input', (e) => {
                itemsContainer.innerHTML = this.renderItems(e.target.value);
                this.attachItemEvents(itemsContainer);
            });
        }

        // Клик вне dropdown
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) {
                menu.classList.remove('show');
            }
        });

        // События на элементах
        this.attachItemEvents(itemsContainer);
    }

    /**
     * Подключает события на элементы списка
     */
    attachItemEvents(container) {
        const items = container.querySelectorAll('.dropdown-item');
        
        items.forEach(item => {
            item.addEventListener('click', () => {
                const value = item.dataset.value;
                
                if (this.multiple) {
                    // Множественный выбор
                    if (this.selected.includes(value)) {
                        this.selected = this.selected.filter(v => v !== value);
                    } else {
                        this.selected.push(value);
                    }
                    
                    // Обновляем UI
                    item.classList.toggle('selected');
                    const checkbox = item.querySelector('.dropdown-checkbox');
                    if (checkbox) checkbox.checked = !checkbox.checked;
                    
                    // Обновляем текст
                    const text = container.closest('[data-dropdown]').querySelector('.dropdown-text');
                    text.textContent = this.getSelectedText();
                } else {
                    // Одиночный выбор
                    this.selected = value;
                    
                    // Закрываем меню
                    const menu = container.closest('[data-menu]');
                    menu.classList.remove('show');
                    
                    // Обновляем текст
                    const text = container.closest('[data-dropdown]').querySelector('.dropdown-text');
                    text.textContent = this.getSelectedText();
                    
                    // Обновляем selected класс
                    container.querySelectorAll('.dropdown-item').forEach(i => {
                        i.classList.remove('selected');
                    });
                    item.classList.add('selected');
                }
                
                // Callback
                if (this.onSelect) {
                    this.onSelect(this.selected);
                }
            });
        });
    }

    /**
     * Закрывает все dropdown на странице
     */
    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
            menu.classList.remove('show');
        });
    }

    /**
     * Устанавливает выбранное значение
     */
    setValue(value) {
        this.selected = value;
    }

    /**
     * Получает выбранное значение
     */
    getValue() {
        return this.selected;
    }
}
