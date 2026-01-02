/**
 * Компонент модального окна
 */

export class Modal {
    constructor(options = {}) {
        this.options = {
            title: options.title || 'Модальное окно',
            content: options.content || '',
            size: options.size || 'medium', // small | medium | large
            buttons: options.buttons || [],
            onClose: options.onClose || null,
            closeOnOverlay: options.closeOnOverlay !== false
        };

        this.element = null;
        this.overlay = null;
    }

    show() {
        this.create();
        this.render();
        this.attachEvents();
        
        // Анимация появления
        requestAnimationFrame(() => {
            this.overlay.style.opacity = '1';
        });
    }

    create() {
        // Создаем overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.style.opacity = '0';
        this.overlay.style.transition = 'opacity 0.2s ease';

        // Создаем модальное окно
        this.element = document.createElement('div');
        this.element.className = `modal modal-${this.options.size}`;

        this.overlay.appendChild(this.element);
    }

    render() {
        const { title, content, buttons } = this.options;

        this.element.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" data-action="close">✕</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${buttons.length > 0 ? `
                <div class="modal-footer">
                    ${buttons.map((btn, index) => `
                        <button class="${btn.className || 'btn'}" data-action="button-${index}">
                            ${btn.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;

        document.getElementById('modal-container').appendChild(this.overlay);
    }

    attachEvents() {
        // Закрытие по клику на overlay
        if (this.options.closeOnOverlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        }

        // Кнопка закрытия
        const closeBtn = this.element.querySelector('[data-action="close"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Кнопки действий
        this.options.buttons.forEach((btn, index) => {
            const btnElement = this.element.querySelector(`[data-action="button-${index}"]`);
            if (btnElement && btn.onClick) {
                btnElement.addEventListener('click', () => btn.onClick(this));
            }
        });

        // Закрытие по Escape
        this.handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        };
        document.addEventListener('keydown', this.handleEscape);
    }

    close() {
        // Анимация исчезновения
        this.overlay.style.opacity = '0';
        
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            
            // Удаляем обработчик Escape
            document.removeEventListener('keydown', this.handleEscape);
            
            // Вызываем callback
            if (this.options.onClose) {
                this.options.onClose();
            }
        }, 200);
    }

    updateContent(content) {
        const body = this.element.querySelector('.modal-body');
        if (body) {
            body.innerHTML = content;
        }
    }

    updateTitle(title) {
        const header = this.element.querySelector('.modal-header h3');
        if (header) {
            header.textContent = title;
        }
    }

    showLoading() {
        this.updateContent(`
            <div style="text-align: center; padding: 2rem;">
                <div class="loading"></div>
                <p style="margin-top: 1rem; color: var(--color-text-muted);">Загрузка...</p>
            </div>
        `);
    }
}

// Статические методы для быстрых диалогов
Modal.confirm = function(title, message, onConfirm) {
    const modal = new Modal({
        title,
        content: `<p>${message}</p>`,
        buttons: [
            {
                text: 'Отмена',
                className: 'btn btn-outline',
                onClick: (modal) => modal.close()
            },
            {
                text: 'Подтвердить',
                className: 'btn btn-primary',
                onClick: (modal) => {
                    if (onConfirm) onConfirm();
                    modal.close();
                }
            }
        ]
    });
    modal.show();
    return modal;
};

Modal.alert = function(title, message) {
    const modal = new Modal({
        title,
        content: `<p>${message}</p>`,
        buttons: [
            {
                text: 'ОК',
                className: 'btn btn-primary',
                onClick: (modal) => modal.close()
            }
        ]
    });
    modal.show();
    return modal;
};
