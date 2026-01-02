/**
 * Экспорт данных в различные форматы
 */

export class ExportManager {
    /**
     * Экспорт в JSON
     */
    static exportJSON(data, filename = 'data.json') {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        this.downloadBlob(blob, filename);
    }

    /**
     * Экспорт в CSV
     */
    static exportCSV(data, columns, filename = 'data.csv') {
        // Заголовки
        const headers = columns.map(col => col.label).join(',');
        
        // Строки данных
        const rows = data.map(row => {
            return columns.map(col => {
                const value = this.getCellValue(row, col.key);
                return `"${value || ''}"`;
            }).join(',');
        });
        
        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        this.downloadBlob(blob, filename);
    }

    /**
     * Экспорт в HTML (простой отчет)
     */
    static exportHTML(content, filename = 'report.html') {
        const html = `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Отчет</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }
                    th {
                        background-color: #f4f4f4;
                        font-weight: bold;
                    }
                    h1, h2, h3 {
                        color: #333;
                    }
                    .print-btn {
                        background: #2563eb;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    @media print {
                        .print-btn { display: none; }
                    }
                </style>
            </head>
            <body>
                <button class="print-btn" onclick="window.print()">🖨️ Печать</button>
                ${content}
            </body>
            </html>
        `;
        
        const blob = new Blob([html], { type: 'text/html' });
        this.downloadBlob(blob, filename);
    }

    /**
     * Экспорт сметы в HTML
     */
    static exportEstimate(project, calculation) {
        const html = `
            <h1>Смета: ${project.name}</h1>
            <p><strong>Клиент:</strong> ${project.clientName}</p>
            <p><strong>Дата:</strong> ${new Date().toLocaleDateString('ru-RU')}</p>
            
            <h2>Модули</h2>
            <table>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Размеры</th>
                        <th>Кол-во</th>
                    </tr>
                </thead>
                <tbody>
                    ${project.modules.map(m => `
                        <tr>
                            <td>${m.name || 'Модуль'}</td>
                            <td>${m.sizes?.width || 0} × ${m.sizes?.height || 0} × ${m.sizes?.depth || 0}</td>
                            <td>${m.quantity || 1}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h2>Материалы</h2>
            <table>
                <thead>
                    <tr>
                        <th>Материал</th>
                        <th>Количество</th>
                        <th>Стоимость</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>ЛДСП</td>
                        <td>${calculation.totals.materials.ldsp.area.toFixed(3)} м² (${calculation.totals.materials.ldsp.sheets} листов)</td>
                        <td>—</td>
                    </tr>
                    <tr>
                        <td>ХДФ</td>
                        <td>${calculation.totals.materials.hdf.area.toFixed(3)} м² (${calculation.totals.materials.hdf.sheets} листов)</td>
                        <td>—</td>
                    </tr>
                    <tr>
                        <td>МДФ фасады</td>
                        <td>${calculation.totals.materials.mdf.area.toFixed(3)} м²</td>
                        <td>—</td>
                    </tr>
                    <tr>
                        <td>Кромка</td>
                        <td>${calculation.totals.materials.edging.length.toFixed(2)} м/п</td>
                        <td>—</td>
                    </tr>
                </tbody>
            </table>
            
            <h2>Фурнитура</h2>
            <table>
                <thead>
                    <tr>
                        <th>Название</th>
                        <th>Артикул</th>
                        <th>Количество</th>
                        <th>Стоимость</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.values(calculation.totals.hardware).map(hw => `
                        <tr>
                            <td>${hw.name}</td>
                            <td>${hw.article}</td>
                            <td>${hw.quantity}</td>
                            <td>${hw.cost.toFixed(2)} €</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <h2>Итого</h2>
            <table>
                <tr>
                    <td><strong>Материалы:</strong></td>
                    <td>${calculation.totals.costs.materials.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td><strong>Фурнитура:</strong></td>
                    <td>${calculation.totals.costs.hardware.toFixed(2)} €</td>
                </tr>
                <tr>
                    <td><strong>Работы:</strong></td>
                    <td>${calculation.totals.costs.operations.toFixed(2)} €</td>
                </tr>
                <tr style="font-weight: bold; font-size: 1.2em;">
                    <td>ВСЕГО:</td>
                    <td>${calculation.totals.costs.total.toFixed(2)} €</td>
                </tr>
            </table>
        `;
        
        this.exportHTML(html, `Смета_${project.name}_${Date.now()}.html`);
    }

    /**
     * Вспомогательные методы
     */
    static getCellValue(row, key) {
        if (key.includes('.')) {
            return key.split('.').reduce((obj, k) => obj?.[k], row);
        }
        return row[key];
    }

    static downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Импорт JSON
     */
    static async importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Ошибка парсинга JSON'));
                }
            };
            reader.onerror = () => reject(new Error('Ошибка чтения файла'));
            reader.readAsText(file);
        });
    }
}
