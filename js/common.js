/**
 * ThemeCalc管理系统通用脚本
 * 包含页面初始化、公共事件处理和DOM操作等功能
 */

// 导入工具函数
import { showMessage, formatDate, validateForm } from './utils.js';
import * as authAPI from './auth.js';

/**
 * 页面初始化
 */
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户登录状态
    checkLoginStatus();
    
    // 初始化导航菜单高亮
    initActiveMenu();
    
    // 初始化返回顶部按钮
    initBackToTop();
    
    // 初始化页面加载完成后的自定义事件
    document.dispatchEvent(new CustomEvent('appInit'));
});

/**
 * 检查用户登录状态
 */
function checkLoginStatus() {
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    
    // 登录页面不需要检查登录状态
    if (currentPath.includes('login.html')) {
        return;
    }
    
    // 从localStorage获取token
    const token = localStorage.getItem('authToken');
    
    // 如果没有token，重定向到登录页
    if (!token) {
        redirectToLogin();
        return;
    }
    
    // 验证token有效性
    authAPI.verifyToken(token)
        .then(isValid => {
            if (!isValid) {
                // token无效，重定向到登录页
                redirectToLogin();
            } else {
                // 用户已登录，初始化用户信息
                initUserInfo();
            }
        })
        .catch(err => {
            console.error('Token验证失败:', err);
            redirectToLogin();
        });
}

/**
 * 重定向到登录页
 */
function redirectToLogin() {
    // 保存当前URL，以便登录后返回
    const currentUrl = window.location.href;
    localStorage.setItem('returnUrl', currentUrl);
    
    // 重定向到登录页
    window.location.href = 'login.html';
}

/**
 * 初始化用户信息
 */
function initUserInfo() {
    // 获取用户名显示元素
    const userNameEl = document.querySelector('.user-name');
    if (!userNameEl) return;
    
    // 从localStorage获取用户名
    const userName = localStorage.getItem('userName');
    if (userName) {
        userNameEl.textContent = userName;
    }
    
    // 绑定退出登录事件
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authAPI.logout();
            window.location.href = 'login.html';
        });
    }
}

/**
 * 初始化菜单高亮
 */
function initActiveMenu() {
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // 查找所有导航链接
    const navLinks = document.querySelectorAll('.nav-link');
    
    // 遍历链接，设置当前页面对应的链接为激活状态
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || 
            (currentPage === 'index.html' && href === './') ||
            (href !== './' && currentPage.includes(href))) {
            link.classList.add('active');
            
            // 如果在侧边栏中，展开父菜单
            const parentMenu = link.closest('.submenu');
            if (parentMenu) {
                parentMenu.classList.add('open');
            }
        }
    });
}

/**
 * 初始化返回顶部按钮
 */
function initBackToTop() {
    // 创建返回顶部按钮
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="arrow-up"></i>';
    document.body.appendChild(backToTop);
    
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    // 点击返回顶部
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * 初始化表单验证
 * @param {string} formSelector - 表单选择器
 * @param {object} rules - 验证规则
 * @param {function} submitCallback - 提交回调函数
 */
function initFormValidation(formSelector, rules, submitCallback) {
    const form = document.querySelector(formSelector);
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 验证表单
        const validationResult = validateForm(form, rules);
        
        if (validationResult.valid) {
            // 表单验证通过，执行回调
            if (typeof submitCallback === 'function') {
                submitCallback(form);
            }
        } else {
            // 显示第一个错误信息
            showMessage(validationResult.errors[0], 'error');
        }
    });
}

/**
 * 初始化数据表格
 * @param {string} tableSelector - 表格选择器
 * @param {object} options - 表格配置选项
 */
function initDataTable(tableSelector, options = {}) {
    const tableEl = document.querySelector(tableSelector);
    if (!tableEl) return;
    
    // 默认配置
    const defaultOptions = {
        pagination: true,
        pageSize: 10,
        pageSizes: [10, 20, 50, 100],
        sortable: true,
        searchable: true
    };
    
    // 合并选项
    const settings = { ...defaultOptions, ...options };
    
    // 创建搜索框
    if (settings.searchable) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'table-search mb-3';
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'form-control';
        searchInput.placeholder = '搜索...';
        
        searchContainer.appendChild(searchInput);
        tableEl.parentNode.insertBefore(searchContainer, tableEl);
        
        // 搜索功能实现
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = Array.from(tableEl.querySelectorAll('tbody tr'));
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
    
    // 分页功能实现
    if (settings.pagination) {
        initTablePagination(tableEl, settings.pageSize, settings.pageSizes);
    }
    
    // 排序功能
    if (settings.sortable) {
        const headers = tableEl.querySelectorAll('thead th[data-sort]');
        
        headers.forEach(header => {
            header.classList.add('sortable');
            header.addEventListener('click', function() {
                const sortKey = this.dataset.sort;
                const currentOrder = this.dataset.order || 'asc';
                const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
                
                // 重置所有表头排序状态
                headers.forEach(h => {
                    h.dataset.order = '';
                    h.classList.remove('sort-asc', 'sort-desc');
                });
                
                // 设置当前表头排序状态
                this.dataset.order = newOrder;
                this.classList.add(`sort-${newOrder}`);
                
                // 执行排序
                sortTable(tableEl, sortKey, newOrder);
            });
        });
    }
}

/**
 * 初始化表格分页
 * @param {HTMLElement} tableEl - 表格元素
 * @param {number} pageSize - 每页显示条数
 * @param {Array} pageSizes - 可选的每页显示条数
 */
function initTablePagination(tableEl, pageSize, pageSizes) {
    // 创建分页容器
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container flex justify-between align-center mt-3';
    
    // 创建每页显示条数选择器
    const pageSizeSelector = document.createElement('div');
    pageSizeSelector.className = 'page-size-selector';
    
    const sizeLabel = document.createElement('span');
    sizeLabel.textContent = '每页显示: ';
    pageSizeSelector.appendChild(sizeLabel);
    
    const sizeSelect = document.createElement('select');
    sizeSelect.className = 'form-control form-control-sm';
    pageSizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        if (size === pageSize) {
            option.selected = true;
        }
        sizeSelect.appendChild(option);
    });
    pageSizeSelector.appendChild(sizeSelect);
    
    // 创建分页导航
    const paginationNav = document.createElement('nav');
    const paginationList = document.createElement('ul');
    paginationList.className = 'pagination';
    paginationNav.appendChild(paginationList);
    
    // 将元素添加到容器
    paginationContainer.appendChild(pageSizeSelector);
    paginationContainer.appendChild(paginationNav);
    
    // 插入到表格后
    tableEl.parentNode.insertBefore(paginationContainer, tableEl.nextSibling);
    
    // 获取表格所有行
    const rows = Array.from(tableEl.querySelectorAll('tbody tr'));
    let currentPage = 1;
    
    // 分页显示函数
    function displayTableRows() {
        const totalPages = Math.ceil(rows.length / pageSize);
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        
        // 隐藏所有行
        rows.forEach(row => {
            row.style.display = 'none';
        });
        
        // 显示当前页的行
        for (let i = start; i < end && i < rows.length; i++) {
            rows[i].style.display = '';
        }
        
        // 更新分页导航
        updatePagination(totalPages);
    }
    
    // 更新分页导航
    function updatePagination(totalPages) {
        paginationList.innerHTML = '';
        
        // 上一页按钮
        addPageItem('&laquo;', currentPage > 1, () => {
            if (currentPage > 1) {
                currentPage--;
                displayTableRows();
            }
        });
        
        // 页码按钮
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            addPageItem(i, true, () => {
                currentPage = i;
                displayTableRows();
            }, i === currentPage);
        }
        
        // 下一页按钮
        addPageItem('&raquo;', currentPage < totalPages, () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayTableRows();
            }
        });
        
        // 显示页码信息
        const pageInfo = document.createElement('li');
        pageInfo.className = 'page-item disabled';
        pageInfo.innerHTML = `<span class="page-link">${currentPage}/${totalPages}</span>`;
        paginationList.appendChild(pageInfo);
    }
    
    // 添加分页项
    function addPageItem(text, enabled, onClick, active = false) {
        const pageItem = document.createElement('li');
        pageItem.className = 'page-item';
        
        if (active) {
            pageItem.classList.add('active');
        }
        
        if (!enabled) {
            pageItem.classList.add('disabled');
        }
        
        const pageLink = document.createElement('a');
        pageLink.className = 'page-link';
        pageLink.innerHTML = text;
        pageLink.href = '#';
        
        if (enabled) {
            pageLink.addEventListener('click', function(e) {
                e.preventDefault();
                onClick();
            });
        }
        
        pageItem.appendChild(pageLink);
        paginationList.appendChild(pageItem);
    }
    
    // 监听每页显示条数变化
    sizeSelect.addEventListener('change', function() {
        pageSize = parseInt(this.value, 10);
        currentPage = 1; // 重置到第一页
        displayTableRows();
    });
    
    // 初始显示
    displayTableRows();
}

/**
 * 表格排序
 * @param {HTMLElement} tableEl - 表格元素
 * @param {string} sortKey - 排序字段
 * @param {string} order - 排序顺序：'asc'或'desc'
 */
function sortTable(tableEl, sortKey, order) {
    const rows = Array.from(tableEl.querySelectorAll('tbody tr'));
    const tbody = tableEl.querySelector('tbody');
    
    // 排序行
    rows.sort((a, b) => {
        let aValue = a.querySelector(`td[data-field="${sortKey}"]`).textContent.trim();
        let bValue = b.querySelector(`td[data-field="${sortKey}"]`).textContent.trim();
        
        // 尝试转换为数字
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
            aValue = aNum;
            bValue = bNum;
        }
        
        if (aValue < bValue) {
            return order === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return order === 'asc' ? 1 : -1;
        }
        return 0;
    });
    
    // 重新添加排序后的行
    rows.forEach(row => {
        tbody.appendChild(row);
    });
}

/**
 * 初始化标签页
 * @param {string} tabsSelector - 标签页容器选择器
 */
function initTabs(tabsSelector) {
    const tabsContainer = document.querySelector(tabsSelector);
    if (!tabsContainer) return;
    
    const tabs = tabsContainer.querySelectorAll('.tab-nav');
    const tabContents = tabsContainer.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const target = this.dataset.target;
            
            // 移除所有激活状态
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // 激活当前标签和内容
            this.classList.add('active');
            tabsContainer.querySelector(`.tab-content[data-id="${target}"]`).classList.add('active');
        });
    });
    
    // 默认激活第一个标签
    if (tabs.length > 0 && !tabsContainer.querySelector('.tab-nav.active')) {
        tabs[0].click();
    }
}

/**
 * 初始化模态框
 * @param {string} modalSelector - 模态框选择器
 */
function initModal(modalSelector) {
    const modal = document.querySelector(modalSelector);
    if (!modal) return;
    
    // 获取打开模态框的按钮
    const openButtons = document.querySelectorAll(`[data-toggle="modal"][data-target="${modalSelector}"]`);
    
    // 获取关闭按钮
    const closeButtons = modal.querySelectorAll('.modal-close, .btn-cancel');
    
    // 模态框背景
    const modalBg = modal.querySelector('.modal-bg');
    
    // 打开模态框
    function openModal() {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
    
    // 关闭模态框
    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    // 绑定打开事件
    openButtons.forEach(btn => {
        btn.addEventListener('click', openModal);
    });
    
    // 绑定关闭事件
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    // 点击背景关闭
    if (modalBg) {
        modalBg.addEventListener('click', closeModal);
    }
    
    // 阻止冒泡
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
    
    // 导出函数
    modal.open = openModal;
    modal.close = closeModal;
    
    return {
        open: openModal,
        close: closeModal
    };
}

/**
 * 初始化下拉菜单
 * @param {string} dropdownSelector - 下拉菜单选择器
 */
function initDropdown(dropdownSelector) {
    const dropdowns = document.querySelectorAll(dropdownSelector);
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (!trigger || !menu) return;
        
        // 点击触发器切换菜单显示状态
        trigger.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('show');
            
            // 关闭其他下拉菜单
            dropdowns.forEach(other => {
                if (other !== dropdown) {
                    const otherMenu = other.querySelector('.dropdown-menu');
                    if (otherMenu) {
                        otherMenu.classList.remove('show');
                    }
                }
            });
        });
        
        // 点击菜单不冒泡
        menu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
    
    // 点击文档其他部分关闭所有下拉菜单
    document.addEventListener('click', function() {
        dropdowns.forEach(dropdown => {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) {
                menu.classList.remove('show');
            }
        });
    });
}

/**
 * 初始化主题切换
 */
function initThemeToggle() {
    const themeToggleBtn = document.querySelector('.theme-toggle');
    if (!themeToggleBtn) return;
    
    // 获取当前主题
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', currentTheme);
    
    // 更新按钮图标
    updateThemeIcon(currentTheme);
    
    // 点击切换主题
    themeToggleBtn.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // 更新主题
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 更新按钮图标
        updateThemeIcon(newTheme);
    });
    
    // 更新主题图标
    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeToggleBtn.innerHTML = '<i class="icon-sun"></i>';
            themeToggleBtn.setAttribute('title', '切换到浅色模式');
        } else {
            themeToggleBtn.innerHTML = '<i class="icon-moon"></i>';
            themeToggleBtn.setAttribute('title', '切换到深色模式');
        }
    }
}

// 导出公共函数
export {
    checkLoginStatus,
    redirectToLogin,
    initActiveMenu,
    initBackToTop,
    initFormValidation,
    initDataTable,
    initTabs,
    initModal,
    initDropdown,
    initThemeToggle
}; 