/**
 * Движок расчетов для модулей кухни
 */

import { FormulaParser, CommonFormulas } from './formulas.js';

export class Calculator {
    constructor() {
        this.parser = new FormulaParser();
    }

    /**
     * Рассчитывает модуль с заданными размерами
     */
    calculateModule(module, customSizes = null) {
        const sizes = customSizes || module.defaultSizes;
        const corpus = module.corpus;

        // Устанавливаем переменные для парсера
        const variables = CommonFormulas.createStandardVariables(sizes, corpus);
        this.parser.setVariables(variables);

        // Рассчитываем все компоненты
        const calculatedDetails = this.calculateDetails(module.details);
        const calculatedFacades = this.calculateFacades(module.facades || []);
        const calculatedHardware = this.calculateHardware(module.hardware || [], calculatedDetails, calculatedFacades);
        const calculatedFasteners = this.calculateFasteners(module.fasteners || [], calculatedDetails);

        // Рассчитываем материалы
        const materials = this.calculateMaterials(calculatedDetails, calculatedFacades, corpus);

        // Рассчитываем работы
        const operations = this.calculateOperations(module.operations || [], calculatedDetails, calculatedFacades);

        // Рассчитываем общую стоимость
        const costs = this.calculateCosts(materials, calculatedHardware, calculatedFasteners, operations);

        return {
            sizes,
            details: calculatedDetails,
            facades: calculatedFacades,
            hardware: calculatedHardware,
            fasteners: calculatedFasteners,
            materials,
            operations,
            costs
        };
    }

    /**
     * Рассчитывает детали корпуса
     */
    calculateDetails(details) {
        return details.map(detail => {
            const length = this.parser.parse(detail.length);
            const width = this.parser.parse(detail.width);
            const quantity = detail.quantity;

            // Площадь одной детали
            const areaOne = (length * width) / 1000000; // м²
            
            // Общая площадь
            const areaTotal = areaOne * quantity;

            // Длина кромки одной детали
            const edgingOne = this.calculateEdgingLength(detail, length, width);
            
            // Общая длина кромки
            const edgingTotal = edgingOne * quantity;

            // Количество резов
            const cuts = 4 * quantity; // 4 реза на прямоугольную деталь

            return {
                ...detail,
                calculated: {
                    length,
                    width,
                    quantity,
                    areaOne,
                    areaTotal,
                    edgingOne,
                    edgingTotal,
                    cuts
                }
            };
        });
    }

    /**
     * Рассчитывает длину кромки для детали
     */
    calculateEdgingLength(detail, length, width) {
        let total = 0;
        
        if (detail.edging.top) total += width;
        if (detail.edging.bottom) total += width;
        if (detail.edging.left) total += length;
        if (detail.edging.right) total += length;
        
        return total;
    }

    /**
     * Рассчитывает фасады
     */
    calculateFacades(facades) {
        return facades.map(facade => {
            const width = this.parser.parse(facade.width);
            const height = this.parser.parse(facade.height);
            const quantity = facade.quantity;

            // Площадь
            const areaOne = (width * height) / 1000000;
            const areaTotal = areaOne * quantity;

            // Периметр (для кромки)
            const perimeterOne = (width + height) * 2;
            const perimeterTotal = perimeterOne * quantity;

            return {
                ...facade,
                calculated: {
                    width,
                    height,
                    quantity,
                    areaOne,
                    areaTotal,
                    perimeterOne,
                    perimeterTotal
                }
            };
        });
    }

    /**
     * Рассчитывает фурнитуру
     */
    calculateHardware(hardware, calculatedDetails, calculatedFacades) {
        return hardware.map(item => {
            let quantity = item.quantity;

            // Если есть формула - вычисляем количество
            if (item.formula) {
                try {
                    // Создаем контекст для формулы
                    const context = {
                        facades: {
                            count: calculatedFacades.length,
                            door: calculatedFacades.filter(f => f.type === 'door'),
                            drawer: calculatedFacades.filter(f => f.type === 'drawer')
                        },
                        details: {
                            count: calculatedDetails.length
                        },
                        shelves: {
                            count: calculatedDetails.filter(d => d.name.toLowerCase().includes('полк')).length
                        }
                    };

                    // Простой парсер для формул фурнитуры
                    quantity = this.parseHardwareFormula(item.formula, context);
                } catch (error) {
                    console.error('Ошибка расчета количества фурнитуры:', error);
                }
            }

            // Стоимость
            const cost = quantity * item.pricePerUnit;

            return {
                ...item,
                calculated: {
                    quantity,
                    pricePerUnit: item.pricePerUnit,
                    cost
                }
            };
        });
    }

    /**
     * Парсер формул для фурнитуры
     */
    parseHardwareFormula(formula, context) {
        let expression = formula;

        // Заменяем точечные обращения
        const replacements = {
            'facades.count': context.facades.count,
            'facades.door.count': context.facades.door.length,
            'facades.drawer.count': context.facades.drawer.length,
            'details.count': context.details.count,
            'shelves.count': context.shelves.count
        };

        for (const [key, value] of Object.entries(replacements)) {
            expression = expression.replace(new RegExp(key, 'g'), value);
        }

        // Вычисляем
        return this.parser.evaluate(expression);
    }

    /**
     * Рассчитывает крепеж
     */
    calculateFasteners(fasteners, calculatedDetails) {
        return fasteners.map(item => {
            const quantity = item.quantity;
            const cost = quantity * (item.pricePerUnit || 0);

            return {
                ...item,
                calculated: {
                    quantity,
                    pricePerUnit: item.pricePerUnit || 0,
                    cost
                }
            };
        });
    }

    /**
     * Рассчитывает материалы
     */
    calculateMaterials(calculatedDetails, calculatedFacades, corpus) {
        const materials = {
            ldsp: {
                name: 'ЛДСП (корпус)',
                area: 0,
                sheets: 0,
                sheetSize: '2750x1830',
                sheetArea: 5.0325, // м²
                price: 0
            },
            hdf: {
                name: 'ХДФ (задняя стенка)',
                area: 0,
                sheets: 0,
                sheetSize: '2750x1700',
                sheetArea: 4.675,
                price: 0
            },
            mdf: {
                name: 'МДФ (фасады)',
                area: 0,
                price: 0
            },
            edging: {
                name: 'Кромка',
                length: 0, // м/п
                types: {}
            }
        };

        // ЛДСП и ХДФ из деталей
        calculatedDetails.forEach(detail => {
            if (detail.material === 'LDSP') {
                materials.ldsp.area += detail.calculated.areaTotal;
                
                // Кромка
                if (detail.edgingType) {
                    if (!materials.edging.types[detail.edgingType]) {
                        materials.edging.types[detail.edgingType] = {
                            name: detail.edgingType,
                            length: 0
                        };
                    }
                    materials.edging.types[detail.edgingType].length += detail.calculated.edgingTotal / 1000; // в метры
                }
            } else if (detail.material === 'HDF') {
                materials.hdf.area += detail.calculated.areaTotal;
            }
        });

        // МДФ из фасадов
        calculatedFacades.forEach(facade => {
            if (facade.material === 'MDF') {
                materials.mdf.area += facade.calculated.areaTotal;
                
                // Кромка фасадов
                if (facade.edgingType) {
                    if (!materials.edging.types[facade.edgingType]) {
                        materials.edging.types[facade.edgingType] = {
                            name: facade.edgingType,
                            length: 0
                        };
                    }
                    materials.edging.types[facade.edgingType].length += facade.calculated.perimeterTotal / 1000;
                }
            }
        });

        // Рассчитываем количество листов (с запасом 10%)
        materials.ldsp.sheets = Math.ceil(materials.ldsp.area / materials.ldsp.sheetArea * 1.1);
        materials.hdf.sheets = Math.ceil(materials.hdf.area / materials.hdf.sheetArea * 1.1);

        // Общая длина кромки
        materials.edging.length = Object.values(materials.edging.types)
            .reduce((sum, type) => sum + type.length, 0);

        return materials;
    }

    /**
     * Рассчитывает работы
     */
    calculateOperations(operations, calculatedDetails, calculatedFacades) {
        return operations.map(operation => {
            let quantity = operation.quantity || 0;

            if (operation.id === 'cutting') {
                // Распил - количество резов
                quantity = calculatedDetails.reduce((sum, d) => sum + d.calculated.cuts, 0);
            } else if (operation.id === 'edging') {
                // Кромкование - м/п
                quantity = calculatedDetails.reduce((sum, d) => sum + d.calculated.edgingTotal, 0) / 1000;
                quantity += calculatedFacades.reduce((sum, f) => sum + f.calculated.perimeterTotal, 0) / 1000;
            } else if (operation.id === 'assembly') {
                // Сборка - обычно 1 модуль
                quantity = 1;
            }

            const cost = quantity * operation.pricePerUnit;

            return {
                ...operation,
                calculated: {
                    quantity: Math.round(quantity * 100) / 100,
                    pricePerUnit: operation.pricePerUnit,
                    cost: Math.round(cost * 100) / 100
                }
            };
        });
    }

    /**
     * Рассчитывает общую стоимость
     */
    calculateCosts(materials, hardware, fasteners, operations) {
        const costs = {
            materials: 0,
            hardware: 0,
            fasteners: 0,
            operations: 0,
            total: 0
        };

        // Материалы (нужно добавить цены)
        costs.materials = materials.ldsp.price + materials.hdf.price + materials.mdf.price;

        // Фурнитура
        costs.hardware = hardware.reduce((sum, item) => sum + item.calculated.cost, 0);

        // Крепеж
        costs.fasteners = fasteners.reduce((sum, item) => sum + item.calculated.cost, 0);

        // Работы
        costs.operations = operations.reduce((sum, item) => sum + item.calculated.cost, 0);

        // Итого
        costs.total = costs.materials + costs.hardware + costs.fasteners + costs.operations;

        return costs;
    }

    /**
     * Рассчитывает весь проект
     */
    calculateProject(project, modulesLibrary) {
        const calculatedModules = [];
        
        project.modules.forEach(moduleInProject => {
            // Находим модуль в библиотеке
            const moduleTemplate = modulesLibrary.find(m => m.id === moduleInProject.moduleId);
            
            if (!moduleTemplate) {
                console.warn('Модуль не найден:', moduleInProject.moduleId);
                return;
            }

            // Рассчитываем модуль с указанными размерами
            const calculated = this.calculateModule(moduleTemplate, moduleInProject.sizes);
            
            calculatedModules.push({
                ...moduleInProject,
                template: moduleTemplate,
                calculation: calculated
            });
        });

        // Суммируем по всем модулям
        const totals = this.calculateProjectTotals(calculatedModules);

        return {
            modules: calculatedModules,
            totals
        };
    }

    /**
     * Подсчитывает общие итоги по проекту
     */
    calculateProjectTotals(calculatedModules) {
        const totals = {
            materials: {
                ldsp: { area: 0, sheets: 0 },
                hdf: { area: 0, sheets: 0 },
                mdf: { area: 0 },
                edging: { length: 0, types: {} }
            },
            hardware: {},
            operations: {
                cutting: { quantity: 0, cost: 0 },
                edging: { quantity: 0, cost: 0 },
                assembly: { quantity: 0, cost: 0 }
            },
            costs: {
                materials: 0,
                hardware: 0,
                operations: 0,
                total: 0
            }
        };

        calculatedModules.forEach(module => {
            const calc = module.calculation;
            const qty = module.quantity || 1;

            // Материалы
            totals.materials.ldsp.area += calc.materials.ldsp.area * qty;
            totals.materials.ldsp.sheets += calc.materials.ldsp.sheets * qty;
            
            totals.materials.hdf.area += calc.materials.hdf.area * qty;
            totals.materials.hdf.sheets += calc.materials.hdf.sheets * qty;
            
            totals.materials.mdf.area += calc.materials.mdf.area * qty;
            
            totals.materials.edging.length += calc.materials.edging.length * qty;

            // Типы кромки
            Object.entries(calc.materials.edging.types).forEach(([type, data]) => {
                if (!totals.materials.edging.types[type]) {
                    totals.materials.edging.types[type] = { name: data.name, length: 0 };
                }
                totals.materials.edging.types[type].length += data.length * qty;
            });

            // Фурнитура
            calc.hardware.forEach(item => {
                if (!totals.hardware[item.article]) {
                    totals.hardware[item.article] = {
                        name: item.name,
                        article: item.article,
                        quantity: 0,
                        cost: 0
                    };
                }
                totals.hardware[item.article].quantity += item.calculated.quantity * qty;
                totals.hardware[item.article].cost += item.calculated.cost * qty;
            });

            // Работы
            calc.operations.forEach(operation => {
                if (totals.operations[operation.id]) {
                    totals.operations[operation.id].quantity += operation.calculated.quantity * qty;
                    totals.operations[operation.id].cost += operation.calculated.cost * qty;
                }
            });

            // Стоимость
            totals.costs.materials += calc.costs.materials * qty;
            totals.costs.hardware += calc.costs.hardware * qty;
            totals.costs.operations += calc.costs.operations * qty;
        });

        totals.costs.total = totals.costs.materials + totals.costs.hardware + totals.costs.operations;

        return totals;
    }
}
