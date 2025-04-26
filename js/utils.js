/**
 * 工具函数库
 */

// 通用工具函数
const utils = {
    /**
     * 格式化日期时间
     * @param {string|Date} dateTime - 日期时间字符串或Date对象
     * @param {string} format - 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
     * @returns {string} 格式化后的日期时间字符串
     */
    formatDateTime(dateTime, format = 'YYYY-MM-DD HH:mm:ss') {
        if (!dateTime) return '';
        
        const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
        
        if (isNaN(date.getTime())) return '';
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },
    
    /**
     * 防抖函数
     * @param {Function} func - 要执行的函数
     * @param {number} delay - 延迟时间（毫秒）
     * @returns {Function} 防抖处理后的函数
     */
    debounce(func, delay = 300) {
        let timer = null;
        
        return function(...args) {
            const context = this;
            
            if (timer) clearTimeout(timer);
            
            timer = setTimeout(() => {
                func.apply(context, args);
                timer = null;
            }, delay);
        };
    },
    
    /**
     * 节流函数
     * @param {Function} func - 要执行的函数
     * @param {number} limit - 时间间隔（毫秒）
     * @returns {Function} 节流处理后的函数
     */
    throttle(func, limit = 300) {
        let inThrottle = false;
        
        return function(...args) {
            const context = this;
            
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                
                setTimeout(() => {
                    inThrottle = false;
                }, limit);
            }
        };
    },
    
    /**
     * 格式化文件大小
     * @param {number} bytes - 文件大小（字节）
     * @param {number} decimals - 小数位数，默认为2
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    
    /**
     * 将颜色从十六进制转换为RGB
     * @param {string} hex - 十六进制颜色值
     * @returns {Object|null} RGB颜色对象 {r, g, b}
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },
    
    /**
     * 将RGB颜色转换为十六进制
     * @param {number} r - 红色分量 (0-255)
     * @param {number} g - 绿色分量 (0-255)
     * @param {number} b - 蓝色分量 (0-255)
     * @returns {string} 十六进制颜色值
     */
    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    },
    
    /**
     * 深拷贝对象
     * @param {*} obj - 要拷贝的对象
     * @returns {*} 深拷贝后的对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        // 处理 Date 对象
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        // 处理 Array 对象
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        
        // 处理普通对象
        const clonedObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                clonedObj[key] = this.deepClone(obj[key]);
            }
        }
        
        return clonedObj;
    },
    
    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    
    /**
     * 检查元素是否在视口内
     * @param {Element} element - DOM元素
     * @returns {boolean} 元素是否在视口内
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    /**
     * 滚动到指定元素
     * @param {Element|string} element - DOM元素或选择器
     * @param {Object} options - 滚动选项
     * @param {number} options.offset - 偏移量，默认为0
     * @param {string} options.behavior - 滚动行为，默认为'smooth'
     */
    scrollToElement(element, options = {}) {
        const { offset = 0, behavior = 'smooth' } = options;
        
        const targetElement = typeof element === 'string'
            ? document.querySelector(element)
            : element;
        
        if (!targetElement) return;
        
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior
        });
    }
};

// 导出工具函数
window.utils = utils;

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

// 页面加载完成后初始化页面
document.addEventListener('DOMContentLoaded', initPage); 