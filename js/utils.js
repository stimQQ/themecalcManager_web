/**
 * 通用工具函数库
 * 提供UI交互、表单验证等常用功能
 */

const utils = {
    /**
     * 显示加载指示器
     * @param {string} message - 加载时显示的消息
     */
    showLoading: function(message = '加载中...') {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const loadingMessage = loadingIndicator.querySelector('.loading-message');
        
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
        
        loadingIndicator.style.display = 'flex';
    },
    
    /**
     * 隐藏加载指示器
     */
    hideLoading: function() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = 'none';
    },
    
    /**
     * 显示消息通知
     * @param {string} type - 消息类型: 'success', 'error', 'warning', 'info'
     * @param {string} message - 消息内容
     * @param {number} duration - 显示时长(毫秒)
     * @param {Function} callback - 消息关闭后的回调函数
     * @returns {HTMLElement} 消息元素
     */
    showMessage: function(type, message, duration = 3000, callback) {
        const container = document.getElementById('messagesContainer');
        
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${this.getIconForMessageType(type)}</span>
                <span class="message-text">${message}</span>
            </div>
            <button class="message-close">&times;</button>
        `;
        
        // 添加到容器并显示
        container.appendChild(messageEl);
        
        // 添加关闭按钮事件
        const closeBtn = messageEl.querySelector('.message-close');
        closeBtn.addEventListener('click', () => {
            this.removeMessage(messageEl, callback);
        });
        
        // 设置自动关闭
        if (duration > 0) {
            setTimeout(() => {
                this.removeMessage(messageEl, callback);
            }, duration);
        }
        
        // 渐入效果
        setTimeout(() => {
            messageEl.classList.add('message-show');
        }, 10);
        
        return messageEl;
    },
    
    /**
     * 移除消息元素
     * @param {HTMLElement} messageEl - 消息元素
     * @param {Function} callback - 消息关闭后的回调函数
     */
    removeMessage: function(messageEl, callback) {
        if (!messageEl || messageEl.classList.contains('message-removing')) {
            return;
        }
        
        messageEl.classList.add('message-removing');
        messageEl.classList.remove('message-show');
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
            
            if (typeof callback === 'function') {
                callback();
            }
        }, 300); // 与CSS过渡时间匹配
    },
    
    /**
     * 根据消息类型获取对应的图标
     * @param {string} type - 消息类型
     * @returns {string} 图标HTML
     */
    getIconForMessageType: function(type) {
        switch (type) {
            case 'success':
                return '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg>';
            case 'error':
                return '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg>';
            case 'warning':
                return '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z"></path></svg>';
            case 'info':
            default:
                return '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path></svg>';
        }
    },
    
    /**
     * 显示表单字段错误
     * @param {HTMLElement} inputEl - 输入元素
     * @param {string} errorMessage - 错误消息
     */
    showFieldError: function(inputEl, errorMessage) {
        if (!inputEl) return;
        
        inputEl.classList.add('error');
        
        // 查找错误消息元素
        const errorEl = document.getElementById(`${inputEl.id}-error`) || 
                       inputEl.parentNode.querySelector('.field-error');
        
        if (errorEl) {
            errorEl.textContent = errorMessage;
            errorEl.style.display = 'block';
        }
    },
    
    /**
     * 清除表单字段错误
     * @param {HTMLElement} inputEl - 输入元素
     */
    clearFieldError: function(inputEl) {
        if (!inputEl) return;
        
        inputEl.classList.remove('error');
        
        // 查找错误消息元素
        const errorEl = document.getElementById(`${inputEl.id}-error`) || 
                       inputEl.parentNode.querySelector('.field-error');
        
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.style.display = 'none';
        }
    },
    
    /**
     * 验证电子邮件格式
     * @param {string} email - 电子邮件
     * @returns {boolean} 是否有效
     */
    isValidEmail: function(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },
    
    /**
     * 格式化日期时间
     * @param {Date|string|number} date - 日期对象、字符串或时间戳
     * @param {string} format - 格式化模板，例如 'YYYY-MM-DD HH:mm:ss'
     * @returns {string} 格式化后的日期字符串
     */
    formatDate: function(date, format = 'YYYY-MM-DD HH:mm:ss') {
        if (!date) return '';
        
        const d = new Date(date);
        
        if (isNaN(d.getTime())) {
            return '';
        }
        
        const pad = (num) => String(num).padStart(2, '0');
        
        const replacements = {
            'YYYY': d.getFullYear(),
            'MM': pad(d.getMonth() + 1),
            'DD': pad(d.getDate()),
            'HH': pad(d.getHours()),
            'mm': pad(d.getMinutes()),
            'ss': pad(d.getSeconds())
        };
        
        return format.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => replacements[match]);
    },
    
    /**
     * 防抖函数 - 延迟执行，如果在延迟时间内再次调用则重新计时
     * @param {Function} func - 要执行的函数
     * @param {number} wait - 延迟时间(毫秒)
     * @returns {Function} 防抖处理后的函数
     */
    debounce: function(func, wait = 300) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    },
    
    /**
     * 节流函数 - 确保函数在给定时间窗口内最多执行一次
     * @param {Function} func - 要执行的函数
     * @param {number} limit - 时间窗口(毫秒)
     * @returns {Function} 节流处理后的函数
     */
    throttle: function(func, limit = 300) {
        let inThrottle;
        return function(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * 格式化文件大小
     * @param {number} bytes 字节数
     * @param {number} decimals 小数位数
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes, decimals = 2) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    },
    
    /**
     * 复制文本到剪贴板
     * @param {string} text 要复制的文本
     * @returns {Promise<boolean>} 是否复制成功
     */
    copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        this.showMessage('复制成功', 'success');
                        resolve(true);
                    })
                    .catch(err => {
                        console.error('剪贴板复制失败:', err);
                        this.showMessage('复制失败', 'error');
                        reject(err);
                    });
            } else {
                // 后备方法
                try {
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    this.showMessage('复制成功', 'success');
                    resolve(true);
                } catch (err) {
                    console.error('剪贴板复制失败:', err);
                    this.showMessage('复制失败', 'error');
                    reject(err);
                }
            }
        });
    },
    
    /**
     * 简单的表单验证
     * @param {HTMLFormElement} form 表单元素
     * @param {Object} rules 验证规则
     * @returns {boolean} 是否验证通过
     */
    validateForm(form, rules) {
        if (!form || !(form instanceof HTMLFormElement)) {
            console.error('参数必须是有效的表单元素');
            return false;
        }
        
        let isValid = true;
        const formData = new FormData(form);
        
        // 清除所有错误提示
        const errorElements = form.querySelectorAll('.form-error');
        errorElements.forEach(el => el.remove());
        
        // 验证每个字段
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData.get(field);
            const inputElement = form.querySelector(`[name="${field}"]`);
            
            if (!inputElement) continue;
            
            // 移除当前错误提示
            const formGroup = inputElement.closest('.form-group');
            if (formGroup) {
                const existingError = formGroup.querySelector('.form-error');
                if (existingError) existingError.remove();
            }
            
            // 验证规则
            let fieldValid = true;
            let errorMessage = '';
            
            // 必填验证
            if (rule.required && !value) {
                fieldValid = false;
                errorMessage = rule.messages?.required || '此字段为必填项';
            }
            // 最小长度验证
            else if (rule.minLength && value.length < rule.minLength) {
                fieldValid = false;
                errorMessage = rule.messages?.minLength || `最少需要 ${rule.minLength} 个字符`;
            }
            // 最大长度验证
            else if (rule.maxLength && value.length > rule.maxLength) {
                fieldValid = false;
                errorMessage = rule.messages?.maxLength || `最多允许 ${rule.maxLength} 个字符`;
            }
            // 模式验证
            else if (rule.pattern && !rule.pattern.test(value)) {
                fieldValid = false;
                errorMessage = rule.messages?.pattern || '输入格式不正确';
            }
            // 自定义验证函数
            else if (rule.validator && !rule.validator(value, formData)) {
                fieldValid = false;
                errorMessage = rule.messages?.validator || '验证失败';
            }
            
            // 显示错误信息
            if (!fieldValid) {
                isValid = false;
                inputElement.classList.add('is-invalid');
                
                // 创建错误消息元素
                const errorElement = document.createElement('div');
                errorElement.className = 'form-error';
                errorElement.textContent = errorMessage;
                
                // 添加到表单组
                if (formGroup) {
                    formGroup.appendChild(errorElement);
                } else {
                    // 如果没有表单组，则添加到输入元素后面
                    inputElement.insertAdjacentElement('afterend', errorElement);
                }
            } else {
                inputElement.classList.remove('is-invalid');
                inputElement.classList.add('is-valid');
            }
        }
        
        return isValid;
    },
    
    /**
     * 常用的验证规则
     */
    validationRules: {
        // 电子邮件验证
        email: {
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            messages: {
                pattern: '请输入有效的电子邮件地址'
            }
        },
        
        // 密码强度验证（至少8位，包含数字和字母）
        password: {
            pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            messages: {
                pattern: '密码至少8位，且必须包含字母和数字'
            }
        },
        
        // 手机号验证（简单中国手机号验证）
        phone: {
            pattern: /^1[3-9]\d{9}$/,
            messages: {
                pattern: '请输入有效的手机号码'
            }
        },
        
        // URL验证
        url: {
            pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/,
            messages: {
                pattern: '请输入有效的URL'
            }
        }
    },
    
    /**
     * 获取URL参数
     * @param {string} name 参数名
     * @param {string} url URL地址，默认为当前页面URL
     * @returns {string|null} 参数值，如果不存在则返回null
     */
    getUrlParam(name, url = window.location.href) {
        name = name.replace(/[\[\]]/g, '\\$&');
        const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
        const results = regex.exec(url);
        
        if (!results) return null;
        if (!results[2]) return '';
        
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    },
    
    /**
     * 生成随机ID
     * @param {number} length ID长度，默认10
     * @returns {string} 随机ID
     */
    generateId(length = 10) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    },
    
    /**
     * 深拷贝对象
     * @param {Object} obj 要拷贝的对象
     * @returns {Object} 拷贝后的新对象
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        // 处理Date
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }
        
        // 处理Array
        if (Array.isArray(obj)) {
            return obj.map(item => this.deepClone(item));
        }
        
        // 处理Object
        const clonedObj = {};
        Object.keys(obj).forEach(key => {
            clonedObj[key] = this.deepClone(obj[key]);
        });
        
        return clonedObj;
    },
    
    /**
     * 获取或设置本地存储数据
     * @param {string} key 键名
     * @param {*} value 值（如果提供则设置，否则获取）
     * @returns {*} 获取的值，或设置成功标志
     */
    storage(key, value) {
        if (value === undefined) {
            // 获取值
            const item = localStorage.getItem(key);
            try {
                // 尝试解析JSON
                return JSON.parse(item);
            } catch (e) {
                // 不是JSON则返回原始值
                return item;
            }
        } else {
            // 设置值
            try {
                // 对象类型转为JSON字符串
                if (typeof value === 'object') {
                    localStorage.setItem(key, JSON.stringify(value));
                } else {
                    localStorage.setItem(key, value);
                }
                return true;
            } catch (e) {
                console.error('存储数据失败:', e);
                return false;
            }
        }
    },
    
    /**
     * 移除本地存储数据
     * @param {string} key 键名
     */
    removeStorage(key) {
        localStorage.removeItem(key);
    },
    
    /**
     * 清除所有本地存储数据
     */
    clearStorage() {
        localStorage.clear();
    },
    
    /**
     * 滚动到指定元素
     * @param {string|HTMLElement} element 元素选择器或DOM元素
     * @param {number} offset 偏移量，默认0
     * @param {number} duration 动画持续时间，默认500ms
     */
    scrollTo(element, offset = 0, duration = 500) {
        // 获取目标元素
        const targetElement = typeof element === 'string' 
            ? document.querySelector(element) 
            : element;
            
        if (!targetElement) return;
        
        // 获取目标位置
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;
        
        // 动画函数
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        }
        
        // 缓动函数
        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
        
        requestAnimationFrame(animation);
    },
    
    /**
     * 简单的事件发布/订阅系统
     */
    events: {
        _events: {},
        
        /**
         * 订阅事件
         * @param {string} eventName 事件名称
         * @param {Function} callback 回调函数
         */
        on(eventName, callback) {
            if (!this._events[eventName]) {
                this._events[eventName] = [];
            }
            
            this._events[eventName].push(callback);
        },
        
        /**
         * 取消订阅
         * @param {string} eventName 事件名称
         * @param {Function} callback 回调函数（如果不提供则移除所有）
         */
        off(eventName, callback) {
            if (!this._events[eventName]) return;
            
            if (!callback) {
                delete this._events[eventName];
            } else {
                this._events[eventName] = this._events[eventName]
                    .filter(cb => cb !== callback);
            }
        },
        
        /**
         * 触发事件
         * @param {string} eventName 事件名称
         * @param {*} data 事件数据
         */
        emit(eventName, data) {
            if (!this._events[eventName]) return;
            
            this._events[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`事件处理器出错: ${eventName}`, e);
                }
            });
        }
    }
};

// 导出工具库
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
} else {
    window.utils = utils;
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