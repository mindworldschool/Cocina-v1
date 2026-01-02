/**
 * Вспомогательные функции
 */

// ============================================
// УВЕДОМЛЕНИЯ
// ============================================

export function showNotification(type, message, duration = 3000) {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.25rem;">${icons[type] || icons.info}</span>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Автоматическое удаление
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// ============================================
// ФОРМАТИРОВАНИЕ
// ============================================

export function formatCurrency(amount, currency = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

export function formatNumber(number, decimals = 2) {
    return Number(number).toFixed(decimals);
}

export function formatDate(date, format = 'full') {
    const d = new Date(date);
    
    if (format === 'short') {
        return d.toLocaleDateString('ru-RU');
    }
    
    if (format === 'time') {
        return d.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    return d.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ============================================
// ГЕНЕРАЦИЯ ID
// ============================================

export function generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCode(name) {
    // Генерирует код из названия
    // Например: "Нижний 1 дверь" -> "N1D"
    const words = name.split(' ');
    return words.map(w => w[0].toUpperCase()).join('');
}

// ============================================
// ВАЛИДАЦИЯ
// ============================================

export function validateRequired(value, fieldName = 'Поле') {
    if (!value || value.toString().trim() === '') {
        return `${fieldName} обязательно для заполнения`;
    }
    return null;
}

export function validateNumber(value, min = null, max = null, fieldName = 'Значение') {
    const num = Number(value);
    
    if (isNaN(num)) {
        return `${fieldName} должно быть числом`;
    }
    
    if (min !== null && num < min) {
        return `${fieldName} не может быть меньше ${min}`;
    }
    
    if (max !== null && num > max) {
        return `${fieldName} не может быть больше ${max}`;
    }
    
    return null;
}

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
        return 'Некорректный email адрес';
    }
    return null;
}

// ============================================
// РАБОТА С ОБЪЕКТАМИ
// ============================================

export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function isEmpty(obj) {
    if (!obj) return true;
    return Object.keys(obj).length === 0;
}

export function pick(obj, keys) {
    const result = {};
    keys.forEach(key => {
        if (key in obj) {
            result[key] = obj[key];
        }
    });
    return result;
}

export function omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => {
        delete result[key];
    });
    return result;
}

// ============================================
// РАБОТА С МАССИВАМИ
// ============================================

export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
}

export function sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        
        if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });
}

export function uniqueBy(array, key) {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}

// ============================================
// РАБОТА СО СТРОКАМИ
// ============================================

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str, length = 50) {
    if (str.length <= length) return str;
    return str.substr(0, length) + '...';
}

export function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// РАБОТА С DOM
// ============================================

export function createElement(tag, className = '', innerHTML = '') {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
}

export function removeElement(element) {
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

export function toggleClass(element, className) {
    element.classList.toggle(className);
}

// ============================================
// ЗАГРУЗКА И СКАЧИВАНИЕ
// ============================================

export function downloadJSON(data, filename = 'data.json') {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
}

export function downloadCSV(data, filename = 'data.csv') {
    // Простой CSV экспорт
    const csv = data.map(row => 
        Object.values(row).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(url);
}

export async function loadJSON(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                resolve(json);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// ============================================
// ХРАНИЛИЩЕ
// ============================================

export function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error('Ошибка записи в localStorage:', error);
        return false;
    }
}

export function getStorage(key, defaultValue = null) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
        console.error('Ошибка чтения из localStorage:', error);
        return defaultValue;
    }
}

export function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Ошибка удаления из localStorage:', error);
        return false;
    }
}

// ============================================
// МАТЕМАТИКА
// ============================================

export function round(number, decimals = 2) {
    return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

export function clamp(number, min, max) {
    return Math.min(Math.max(number, min), max);
}

export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function percentage(value, total) {
    return total === 0 ? 0 : (value / total) * 100;
}

// ============================================
// ЦВЕТА
// ============================================

export function getCategoryColor(category) {
    const colors = {
        lower: '#2563eb',
        upper: '#f59e0b',
        tall: '#10b981',
        corner: '#8b5cf6'
    };
    return colors[category] || '#64748b';
}

export function getCategoryIcon(category) {
    const icons = {
        lower: '🟦',
        upper: '🟨',
        tall: '🟩',
        corner: '🟧'
    };
    return icons[category] || '📦';
}

export function getCategoryName(category) {
    const names = {
        lower: 'Нижний',
        upper: 'Верхний',
        tall: 'Пенал',
        corner: 'Угловой'
    };
    return names[category] || 'Модуль';
}
