/**
 * 工具函数
 */

/**
 * 显示消息提示
 * @param {string} message 消息内容
 * @param {string} type 消息类型（success, error, info, warning）
 * @param {number} duration 显示时长（毫秒）
 */
function showMessage(message, type = 'info', duration = 3000) {
    const messageElement = document.getElementById('message');
    
    if (!messageElement) {
        console.error('消息元素不存在');
        return;
    }
    
    // 清除之前的类型
    messageElement.className = 'message';
    messageElement.classList.add(`message-${type}`);
    
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // 定时隐藏
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, duration);
}

/**
 * 显示加载指示器
 */
function showLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'flex';
    }
}

/**
 * 隐藏加载指示器
 */
function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

/**
 * 获取URL参数
 * @param {string} name 参数名
 * @returns {string} 参数值
 */
function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

/**
 * 格式化日期
 * @param {string|Date} date 日期对象或日期字符串
 * @param {string} format 格式（默认：YYYY-MM-DD HH:mm:ss）
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return '';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 防抖函数
 * @param {Function} func 需要防抖的函数
 * @param {number} wait 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait = 300) {
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

/**
 * 颜色转换：十六进制转RGB
 * @param {string} hex 十六进制颜色
 * @returns {Object} RGB对象 {r, g, b}
 */
function hexToRgb(hex) {
    // 移除#号
    hex = hex.replace(/^#/, '');
    
    // 转换3位颜色为6位
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
}

/**
 * 颜色转换：RGB转十六进制
 * @param {number} r 红色（0-255）
 * @param {number} g 绿色（0-255）
 * @param {number} b 蓝色（0-255）
 * @returns {string} 十六进制颜色
 */
function rgbToHex(r, g, b) {
    return '#' + [r, g, b]
        .map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        })
        .join('');
}

/**
 * 初始化侧边栏切换
 */
function initSidebar() {
    const toggleButton = document.getElementById('toggle-sidebar');
    const sidebar = document.getElementById('sidebar');
    
    if (toggleButton && sidebar) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

/**
 * 页面初始化
 */
function initPage() {
    // 初始化侧边栏
    initSidebar();
    
    // 初始化退出登录按钮
    const logoutButton = document.getElementById('logout-button');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                // 清除登录信息
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // 跳转到登录页面
                window.location.href = 'login.html';
            }
        });
    }
}

// 导出工具函数
window.utils = {
    showMessage,
    showLoading,
    hideLoading,
    getUrlParam,
    formatDate,
    debounce,
    hexToRgb,
    rgbToHex,
    initSidebar,
    initPage
};

// 页面加载完成后初始化页面
document.addEventListener('DOMContentLoaded', initPage); 