/**
 * Редактор модуля
 */

import { Module } from '../models/Module.js';
import { Detail } from '../models/Detail.js';
import { Hardware } from '../models/Hardware.js';
import { Modal } from '../components/Modal.js';
import { Form, FormBuilder } from '../components/Form.js';
import { showNotification } from '../utils/helpers.js';
import { Validator, ValidationSchemas } from '../utils/validation.js';
import { FormulaParser, FormulaHelper } from '../core/formulas.js';
import { Calculator } from '../core/calculator.js';

export class ModuleEditor {
    constructor(state, db, moduleId = null) {
        this.state = state;
        this.db = db;
        this.moduleId = moduleId;
        this.module = null;
        this.currentTab = 'basic';
        this.calculator = new Calculator();
        
        this.init();
    }

    async init() {
        if (this.moduleId) {
            // Редактирование существующего модуля
            this.module = this.state.getModuleById(this.moduleId);
            if (!this.module) {
                showNotification('error', 'Модуль не найден');
                return;
            }
        } else {
            // Создание нового модуля
            this.module = new Module({
                code: '',
                name: '',
                category: 'lower',
                defaultSizes: {
                    width: 600,
                    height: 890,
                    depth: 560
                },
                corpus: {
                    material: 'LDSP',
                    thickness: 19,
                    backWall: {
                        material: 'HDF',
                        thickness: 3
                    }
                },
                details: [],
                facades: [],
                hardware: [],
                fasteners: [],
                operations: [
                    {
                        id: 'cutting',
                        name: 'Распил ЛДСП',
                        unit: 'рез',
                        pricePerUnit: 0.5
                    },
                    {
                        id: 'edging',
                        name: 'Кромкование',
                        unit: 'м/п',
                        pricePerUnit: 1.5
                    },
                    {
                        id: 'assembly',
                        name: 'Сборка модуля',
                        unit: 'шт',
                        quantity: 1,
                        pricePerUnit: 15
                    }
                ]
            });
        }

        this.show();
    }

    show() {
        const modal = new Modal({
            title: this.moduleId ? `✏️ Редактирование: ${this.module.name}` : '➕ Создание нового модуля',
            content: this.render(),
            size: 'large',
            closeOnOverlay: false,
            buttons: [
                {
                    text: '💾 Сохранить модуль',
                    className: 'btn btn-primary',
                    onClick: () => this.save(modal)
                },
                {
                    text: 'Отмена',
                    className: 'btn btn-outline',
                    onClick: () => modal.close()
                }
            ]
        });

        modal.show();
        this.attachEvents(modal);
    }

    render() {
        return `
            <div class="module-editor">
                <!-- TABS -->
                <div class="tabs">
                    <button class="tab ${this.currentTab === 'basic' ? 'active' : ''}" data-tab="basic">
                        📋 Основное
                    </button>
                    <button class="tab ${this.currentTab === 'sizes' ? 'active' : ''}" data-tab="sizes">
                        📐 Размеры
                    </button>
                    <button class="tab ${this.currentTab === 'details' ? 'active' : ''}" data-tab="details">
                        🔧 Детали (${this.module.details.length})
                    </button>
                    <button class="tab ${this.currentTab === 'facades' ? 'active' : ''}" data-tab="facades">
                        🚪 Фасады (${this.module.facades?.length || 0})
                    </button>
                    <button class="tab ${this.currentTab === 'hardware' ? 'active' : ''}" data-tab="hardware">
                        🔩 Фурнитура (${this.module.hardware.length})
                    </button>
                    <button class="tab ${this.currentTab === 'preview' ? 'active' : ''}" data-tab="preview">
                        👁️ Предпросмотр
                    </button>
                </div>

                <!-- TAB CONTENTS -->
                <div class="tab-contents" style="margin-top: 1.5rem;">
                    ${this.renderTabContent()}
                </div>
            </div>
        `;
    }

    renderTabContent() {
        switch (this.currentTab) {
            case 'basic':
                return this.renderBasicTab();
            case 'sizes':
                return this.renderSizesTab();
            case 'details':
                return this.renderDetailsTab();
            case 'facades':
                return this.renderFacadesTab();
            case 'hardware':
                return this.renderHardwareTab();
            case 'preview':
                return this.renderPreviewTab();
            default:
                return '<p>Вкладка не найдена</p>';
        }
    }

    // ============================================
    // TAB: ОСНОВНОЕ
    // ============================================

    renderBasicTab() {
        const form = FormBuilder.createModuleBasicForm(this.module);
        return `
            <div class="tab-content active" id="tab-basic">
                <h3>Основная информация</h3>
                <div id="basic-form-container">${form.render()}</div>
            </div>
        `;
    }

    // ============================================
    // TAB: РАЗМЕРЫ
    // ============================================

    renderSizesTab() {
        return `
            <div class="tab-content active" id="tab-sizes">
                <h3>Размеры по умолчанию</h3>
                
                <div class="form-group">
                    <label class="form-label">Ширина (мм)</label>
                    <input type="number" class="form-input" id="size-width" value="${this.module.defaultSizes.width}" min="100" max="2000" step="10">
                </div>

                <div class="form-group">
                    <label class="form-label">Высота (мм)</label>
                    <input type="number" class="form-input" id="size-height" value="${this.module.defaultSizes.height}" min="100" max="3000" step="10">
                </div>

                <div class="form-group">
                    <label class="form-label">Глубина (мм)</label>
                    <input type="number" class="form-input" id="size-depth" value="${this.module.defaultSizes.depth}" min="100" max="1000" step="10">
                </div>

                <h3 style="margin-top: 2rem;">Корпус</h3>

                <div class="form-group">
                    <label class="form-label">Материал корпуса</label>
                    <select class="form-select" id="corpus-material">
                        <option value="LDSP" ${this.module.corpus.material === 'LDSP' ? 'selected' : ''}>ЛДСП</option>
                        <option value="MDF" ${this.module.corpus.material === 'MDF' ? 'selected' : ''}>МДФ</option>
                        <option value="Plywood" ${this.module.corpus.material === 'Plywood' ? 'selected' : ''}>Фанера</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Толщина материала (мм)</label>
                    <input type="number" class="form-input" id="corpus-thickness" value="${this.module.corpus.thickness}" min="10" max="25">
                </div>

                <div class="form-group">
                    <label class="form-label">Материал задней стенки</label>
                    <select class="form-select" id="backwall-material">
                        <option value="HDF" ${this.module.corpus.backWall.material === 'HDF' ? 'selected' : ''}>ХДФ</option>
                        <option value="LDSP" ${this.module.corpus.backWall.material === 'LDSP' ? 'selected' : ''}>ЛДСП</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Толщина задней стенки (мм)</label>
                    <input type="number" class="form-input" id="backwall-thickness" value="${this.module.corpus.backWall.thickness}" min="3" max="19">
                </div>

                <button class="btn btn-secondary" id="btn-apply-sizes">
                    ✅ Применить размеры
                </button>
            </div>
        `;
    }

    // ============================================
    // TAB: ДЕТАЛИ
    // ============================================

    renderDetailsTab() {
        return `
            <div class="tab-content active" id="tab-details">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Детали корпуса</h3>
                    <button class="btn btn-primary btn-sm" id="btn-add-detail">
                        ➕ Добавить деталь
                    </button>
                </div>

                ${this.module.details.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔧</div>
                        <h3>Нет деталей</h3>
                        <p>Добавьте первую деталь корпуса</p>
                    </div>
                ` : `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Длина</th>
                                    <th>Ширина</th>
                                    <th>Кол-во</th>
                                    <th>Материал</th>
                                    <th>Кромка</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.module.details.map((detail, index) => this.renderDetailRow(detail, index)).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    }

    renderDetailRow(detail, index) {
        const edgingSides = [];
        if (detail.edging?.top) edgingSides.push('⬆️');
        if (detail.edging?.bottom) edgingSides.push('⬇️');
        if (detail.edging?.left) edgingSides.push('⬅️');
        if (detail.edging?.right) edgingSides.push('➡️');

        return `
            <tr data-detail-index="${index}">
                <td>
                    ${detail.name}
                    ${detail.optional ? '<span class="badge badge-warning">Опция</span>' : ''}
                </td>
                <td><code>${detail.length}</code></td>
                <td><code>${detail.width}</code></td>
                <td>${detail.quantity}</td>
                <td>${Detail.getMaterialName(detail.material)}</td>
                <td>${edgingSides.join(' ')}</td>
                <td>
                    <button class="icon-btn" data-action="edit-detail" data-index="${index}" title="Редактировать">
                        ✏️
                    </button>
                    <button class="icon-btn" data-action="clone-detail" data-index="${index}" title="Клонировать">
                        📋
                    </button>
                    <button class="icon-btn danger" data-action="delete-detail" data-index="${index}" title="Удалить">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }

    // ============================================
    // TAB: ФАСАДЫ
    // ============================================

    renderFacadesTab() {
        const facades = this.module.facades || [];
        
        return `
            <div class="tab-content active" id="tab-facades">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Фасады</h3>
                    <button class="btn btn-primary btn-sm" id="btn-add-facade">
                        ➕ Добавить фасад
                    </button>
                </div>

                ${facades.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">🚪</div>
                        <h3>Нет фасадов</h3>
                        <p>Добавьте фасады для модуля</p>
                    </div>
                ` : `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Ширина</th>
                                    <th>Высота</th>
                                    <th>Кол-во</th>
                                    <th>Тип</th>
                                    <th>Материал</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${facades.map((facade, index) => this.renderFacadeRow(facade, index)).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    }

    renderFacadeRow(facade, index) {
        const typeNames = {
            door: 'Дверь',
            drawer: 'Ящик',
            flap: 'Откидная'
        };

        return `
            <tr data-facade-index="${index}">
                <td>${facade.name}</td>
                <td><code>${facade.width}</code></td>
                <td><code>${facade.height}</code></td>
                <td>${facade.quantity}</td>
                <td>${typeNames[facade.type] || facade.type}</td>
                <td>${facade.material}</td>
                <td>
                    <button class="icon-btn" data-action="edit-facade" data-index="${index}" title="Редактировать">
                        ✏️
                    </button>
                    <button class="icon-btn danger" data-action="delete-facade" data-index="${index}" title="Удалить">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }

    // ============================================
    // TAB: ФУРНИТУРА
    // ============================================

    renderHardwareTab() {
        return `
            <div class="tab-content active" id="tab-hardware">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3>Фурнитура</h3>
                    <button class="btn btn-primary btn-sm" id="btn-add-hardware">
                        ➕ Добавить фурнитуру
                    </button>
                </div>

                ${this.module.hardware.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">🔩</div>
                        <h3>Нет фурнитуры</h3>
                        <p>Добавьте фурнитуру для модуля</p>
                    </div>
                ` : `
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Артикул</th>
                                    <th>Кол-во</th>
                                    <th>Формула</th>
                                    <th>Категория</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.module.hardware.map((hw, index) => this.renderHardwareRow(hw, index)).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>
        `;
    }

    renderHardwareRow(hardware, index) {
        return `
            <tr data-hardware-index="${index}">
                <td>
                    ${hardware.name}
                    ${hardware.optional ? '<span class="badge badge-warning">Опция</span>' : ''}
                </td>
                <td><code>${hardware.article}</code></td>
                <td>${hardware.quantity}</td>
                <td>${hardware.formula ? `<code>${hardware.formula}</code>` : '—'}</td>
                <td>${Hardware.getCategoryName(hardware.category)}</td>
                <td>
                    <button class="icon-btn" data-action="edit-hardware" data-index="${index}" title="Редактировать">
                        ✏️
                    </button>
                    <button class="icon-btn" data-action="clone-hardware" data-index="${index}" title="Клонировать">
                        📋
                    </button>
                    <button class="icon-btn danger" data-action="delete-hardware" data-index="${index}" title="Удалить">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    }

    // ============================================
    // TAB: ПРЕДПРОСМОТР
    // ============================================

    renderPreviewTab() {
        // Рассчитываем модуль
        const calculation = this.calculator.calculateModule(this.module);

        return `
            <div class="tab-content active" id="tab-preview">
                <h3>Предпросмотр расчета</h3>
                <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">
                    Расчет выполнен с размерами по умолчанию
                </p>

                <!-- ДЕТАЛИ -->
                <h4>🔧 Детали корпуса</h4>
                <div class="table-container" style="margin-bottom: 2rem;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Название</th>
                                <th>Размеры (мм)</th>
                                <th>Кол-во</th>
                                <th>Площадь (м²)</th>
                                <th>Кромка (м/п)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${calculation.details.map(detail => `
                                <tr>
                                    <td>${detail.name}</td>
                                    <td>${Math.round(detail.calculated.length)} × ${Math.round(detail.calculated.width)}</td>
                                    <td>${detail.calculated.quantity}</td>
                                    <td>${detail.calculated.areaTotal.toFixed(3)}</td>
                                    <td>${(detail.calculated.edgingTotal / 1000).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- МАТЕРИАЛЫ -->
                <h4>📊 Материалы</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="card">
                        <h5>🟤 ЛДСП</h5>
                        <p>Площадь: <strong>${calculation.materials.ldsp.area.toFixed(3)} м²</strong></p>
                        <p>Листов: <strong>${calculation.materials.ldsp.sheets} шт</strong></p>
                    </div>
                    <div class="card">
                        <h5>🟡 ХДФ</h5>
                        <p>Площадь: <strong>${calculation.materials.hdf.area.toFixed(3)} м²</strong></p>
                        <p>Листов: <strong>${calculation.materials.hdf.sheets} шт</strong></p>
                    </div>
                    <div class="card">
                        <h5>🎨 МДФ фасады</h5>
                        <p>Площадь: <strong>${calculation.materials.mdf.area.toFixed(3)} м²</strong></p>
                    </div>
                    <div class="card">
                        <h5>🔲 Кромка</h5>
                        <p>Всего: <strong>${calculation.materials.edging.length.toFixed(2)} м/п</strong></p>
                    </div>
                </div>

                <!-- ФУРНИТУРА -->
                ${calculation.hardware.length > 0 ? `
                    <h4>🔩 Фурнитура</h4>
                    <div class="table-container" style="margin-bottom: 2rem;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Артикул</th>
                                    <th>Количество</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${calculation.hardware.map(hw => `
                                    <tr>
                                        <td>${hw.name}</td>
                                        <td><code>${hw.article}</code></td>
                                        <td>${hw.calculated.quantity} ${hw.unit}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}

                <!-- РАБОТЫ -->
                <h4>💼 Работы</h4>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Операция</th>
                                <th>Количество</th>
                                <th>Стоимость</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${calculation.operations.map(op => `
                                <tr>
                                    <td>${op.name}</td>
                                    <td>${op.calculated.quantity.toFixed(2)} ${op.unit}</td>
                                    <td>${op.calculated.cost.toFixed(2)} €</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    // ============================================
    // СОБЫТИЯ
    // ============================================

    attachEvents(modal) {
        const modalBody = modal.element.querySelector('.modal-body');

        // Переключение табов
        modalBody.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.currentTab = tab.dataset.tab;
                this.updateTabContent(modal);
            });
        });

        // События для текущей вкладки
        this.attachTabEvents(modalBody);
    }

    attachTabEvents(container) {
        switch (this.currentTab) {
            case 'basic':
                this.attachBasicEvents(container);
                break;
            case 'sizes':
                this.attachSizesEvents(container);
                break;
            case 'details':
                this.attachDetailsEvents(container);
                break;
            case 'facades':
                this.attachFacadesEvents(container);
                break;
            case 'hardware':
                this.attachHardwareEvents(container);
                break;
        }
    }

    attachBasicEvents(container) {
        const formContainer = container.querySelector('#basic-form-container');
        if (!formContainer) return;

        const form = FormBuilder.createModuleBasicForm(this.module);
        form.onSubmit = (data) => {
            Object.assign(this.module, data);
            showNotification('success', 'Основная информация сохранена');
        };
        form.attachEvents(formContainer);
    }

    attachSizesEvents(container) {
        const applyBtn = container.querySelector('#btn-apply-sizes');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                this.module.defaultSizes = {
                    width: Number(container.querySelector('#size-width').value),
                    height: Number(container.querySelector('#size-height').value),
                    depth: Number(container.querySelector('#size-depth').value)
                };

                this.module.corpus.material = container.querySelector('#corpus-material').value;
                this.module.corpus.thickness = Number(container.querySelector('#corpus-thickness').value);
                this.module.corpus.backWall.material = container.querySelector('#backwall-material').value;
                this.module.corpus.backWall.thickness = Number(container.querySelector('#backwall-thickness').value);

                showNotification('success', 'Размеры применены');
            });
        }
    }

    attachDetailsEvents(container) {
        // Добавить деталь
        const addBtn = container.querySelector('#btn-add-detail');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddDetailModal();
            });
        }

        // Действия с деталями
        container.querySelectorAll('[data-action="edit-detail"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.showEditDetailModal(index);
            });
        });

        container.querySelectorAll('[data-action="clone-detail"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const detail = this.module.details[index];
                const clone = new Detail({
                    ...detail,
                    id: null,
                    name: detail.name + ' (копия)'
                });
                this.module.details.push(clone);
                showNotification('success', 'Деталь клонирована');
                this.updateCurrentTab();
            });
        });

        container.querySelectorAll('[data-action="delete-detail"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                if (confirm('Удалить деталь?')) {
                    this.module.details.splice(index, 1);
                    showNotification('success', 'Деталь удалена');
                    this.updateCurrentTab();
                }
            });
        });
    }

    attachFacadesEvents(container) {
        const addBtn = container.querySelector('#btn-add-facade');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddFacadeModal();
            });
        }

        container.querySelectorAll('[data-action="delete-facade"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                if (confirm('Удалить фасад?')) {
                    this.module.facades.splice(index, 1);
                    showNotification('success', 'Фасад удален');
                    this.updateCurrentTab();
                }
            });
        });
    }

    attachHardwareEvents(container) {
        // Добавить фурнитуру
        const addBtn = container.querySelector('#btn-add-hardware');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showAddHardwareModal();
            });
        }

        // Действия с фурнитурой
        container.querySelectorAll('[data-action="edit-hardware"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.showEditHardwareModal(index);
            });
        });

        container.querySelectorAll('[data-action="clone-hardware"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                const hardware = this.module.hardware[index];
                const clone = new Hardware({
                    ...hardware,
                    id: null
                });
                this.module.hardware.push(clone);
                showNotification('success', 'Фурнитура клонирована');
                this.updateCurrentTab();
            });
        });

        container.querySelectorAll('[data-action="delete-hardware"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                if (confirm('Удалить фурнитуру?')) {
                    this.module.hardware.splice(index, 1);
                    showNotification('success', 'Фурнитура удалена');
                    this.updateCurrentTab();
                }
            });
        });
    }

    // ============================================
    // МОДАЛЬНЫЕ ОКНА
    // ============================================

    showAddDetailModal() {
        const form = FormBuilder.createDetailForm();
        
        const detailModal = new Modal({
            title: '➕ Добавить деталь',
            content: `<div id="detail-form-container">${form.render()}</div>`,
            buttons: []
        });

        form.onSubmit = (data) => {
            const detail = new Detail({
                ...data,
                id: 'detail_' + Date.now(),
                edging: {
                    top: 1,
                    bottom: 0,
                    left: 1,
                    right: 1
                }
            });

            this.module.details.push(detail);
            showNotification('success', 'Деталь добавлена');
            detailModal.close();
            this.updateCurrentTab();
        };

        form.onCancel = () => detailModal.close();

        detailModal.show();
        form.attachEvents(document.getElementById('detail-form-container'));
    }

    showEditDetailModal(index) {
        const detail = this.module.details[index];
        const form = FormBuilder.createDetailForm(detail);
        
        const detailModal = new Modal({
            title: '✏️ Редактировать деталь',
            content: `<div id="detail-form-container">${form.render()}</div>`,
            buttons: []
        });

        form.onSubmit = (data) => {
            Object.assign(this.module.details[index], data);
            showNotification('success', 'Деталь обновлена');
            detailModal.close();
            this.updateCurrentTab();
        };

        form.onCancel = () => detailModal.close();

        detailModal.show();
        form.attachEvents(document.getElementById('detail-form-container'));
    }

    showAddFacadeModal() {
        showNotification('info', 'Добавление фасадов будет реализовано в следующей версии');
    }

    showAddHardwareModal() {
        const form = FormBuilder.createHardwareForm();
        
        const hardwareModal = new Modal({
            title: '➕ Добавить фурнитуру',
            content: `<div id="hardware-form-container">${form.render()}</div>`,
            buttons: []
        });

        form.onSubmit = (data) => {
            const hardware = new Hardware({
                ...data,
                id: 'hardware_' + Date.now()
            });

            this.module.hardware.push(hardware);
            showNotification('success', 'Фурнитура добавлена');
            hardwareModal.close();
            this.updateCurrentTab();
        };

        form.onCancel = () => hardwareModal.close();

        hardwareModal.show();
        form.attachEvents(document.getElementById('hardware-form-container'));
    }

    showEditHardwareModal(index) {
        const hardware = this.module.hardware[index];
        const form = FormBuilder.createHardwareForm(hardware);
        
        const hardwareModal = new Modal({
            title: '✏️ Редактировать фурнитуру',
            content: `<div id="hardware-form-container">${form.render()}</div>`,
            buttons: []
        });

        form.onSubmit = (data) => {
            Object.assign(this.module.hardware[index], data);
            showNotification('success', 'Фурнитура обновлена');
            hardwareModal.close();
            this.updateCurrentTab();
        };

        form.onCancel = () => hardwareModal.close();

        hardwareModal.show();
        form.attachEvents(document.getElementById('hardware-form-container'));
    }

    // ============================================
    // ОБНОВЛЕНИЕ КОНТЕНТА
    // ============================================

    updateTabContent(modal) {
        const modalBody = modal.element.querySelector('.modal-body');
        modalBody.innerHTML = this.render();
        this.attachEvents(modal);
    }

    updateCurrentTab() {
        const container = document.querySelector('.tab-contents');
        if (container) {
            container.innerHTML = this.renderTabContent();
            this.attachTabEvents(container);
        }
    }

    // ============================================
    // СОХРАНЕНИЕ
    // ============================================

    async save(modal) {
        // Валидация
        const validation = this.module.validate();
        if (!validation.valid) {
            showNotification('error', validation.errors.join(', '));
            return;
        }

        try {
            if (this.moduleId) {
                // Обновление
                await this.db.updateModule(this.moduleId, this.module.toJSON());
                this.state.updateModule(this.moduleId, this.module.toJSON());
                showNotification('success', 'Модуль обновлен');
            } else {
                // Создание
                const newModule = await this.db.createModule(this.module.toJSON());
                this.state.addModule(newModule);
                showNotification('success', 'Модуль создан');
            }

            modal.close();
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            showNotification('error', 'Ошибка сохранения модуля');
        }
    }
}
