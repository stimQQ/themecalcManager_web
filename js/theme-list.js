/**
 * 主题列表页面功能
 */

// 当前页码和每页数量
let currentPage = 1;
const pageSize = 12;

// 搜索参数
let searchParams = {
    query: '',
    isPaid: ''
};

/**
 * 初始化主题列表页面
 */
function initThemeListPage() {
    // 加载主题列表
    loadThemes();
    
    // 初始化搜索表单
    initSearchForm();
    
    // 初始化新建主题按钮
    document.getElementById('new-theme-button').addEventListener('click', () => {
        window.location.href = 'create.html';
    });
}

/**
 * 加载主题列表
 */
async function loadThemes() {
    try {
        showLoading();
        
        // 构建请求参数
        const params = new URLSearchParams({
            page: currentPage,
            limit: pageSize
        });
        
        if (searchParams.query) {
            params.append('query', searchParams.query);
        }
        
        if (searchParams.isPaid !== '') {
            params.append('is_paid', searchParams.isPaid);
        }
        
        // 调用API获取主题列表
        const response = await api.getThemes(params);
        
        if (response.success) {
            // 渲染主题列表
            renderThemeList(response.data.themes);
            
            // 渲染分页
            renderPagination(response.data.total, pageSize, currentPage);
        } else {
            showMessage(response.message || '加载主题列表失败', 'error');
        }
    } catch (error) {
        console.error('加载主题列表出错', error);
        showMessage('加载主题列表时发生错误', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * 渲染主题列表
 * @param {Array} themes 主题数据
 */
function renderThemeList(themes) {
    const themeListElement = document.getElementById('theme-list');
    themeListElement.innerHTML = '';
    
    if (!themes || themes.length === 0) {
        themeListElement.innerHTML = '<div class="no-themes">暂无主题</div>';
        return;
    }
    
    const template = document.getElementById('theme-card-template');
    
    themes.forEach(theme => {
        const clone = document.importNode(template.content, true);
        
        // 设置主题信息
        const nameElement = clone.querySelector('.theme-name');
        const imageElement = clone.querySelector('.theme-image img');
        const usageCountElement = clone.querySelector('.theme-usage-count');
        const versionElement = clone.querySelector('.theme-version');
        
        nameElement.textContent = theme.skin_name;
        imageElement.src = theme.detail_image || 'assets/img/theme-placeholder.png';
        imageElement.alt = theme.skin_name;
        usageCountElement.textContent = `使用次数: ${theme.usage_count || 0}`;
        versionElement.textContent = `版本: ${theme.version || '1.0'}`;
        
        // 设置按钮链接和事件
        const detailButton = clone.querySelector('.theme-detail-btn');
        const editButton = clone.querySelector('.theme-edit-btn');
        const deleteButton = clone.querySelector('.theme-delete-btn');
        
        detailButton.href = `detail.html?id=${theme.id}`;
        editButton.href = `edit.html?id=${theme.id}`;
        
        deleteButton.addEventListener('click', () => {
            confirmDeleteTheme(theme.id, theme.skin_name);
        });
        
        themeListElement.appendChild(clone);
    });
}

/**
 * 确认删除主题
 * @param {string} themeId 主题ID
 * @param {string} themeName 主题名称
 */
function confirmDeleteTheme(themeId, themeName) {
    if (confirm(`确定要删除主题"${themeName}"吗？此操作不可撤销。`)) {
        deleteTheme(themeId);
    }
}

/**
 * 删除主题
 * @param {string} themeId 主题ID
 */
async function deleteTheme(themeId) {
    try {
        showLoading();
        
        const response = await api.deleteTheme(themeId);
        
        if (response.success) {
            showMessage('主题删除成功', 'success');
            // 重新加载主题列表
            loadThemes();
        } else {
            showMessage(response.message || '删除主题失败', 'error');
        }
    } catch (error) {
        console.error('删除主题出错', error);
        showMessage('删除主题时发生错误', 'error');
    } finally {
        hideLoading();
    }
}

/**
 * 初始化搜索表单
 */
function initSearchForm() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const filterPaid = document.getElementById('filter-paid');
    const resetButton = document.getElementById('reset-search');
    
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 更新搜索参数
        searchParams.query = searchInput.value.trim();
        searchParams.isPaid = filterPaid.value;
        
        // 重置页码并加载主题
        currentPage = 1;
        loadThemes();
    });
    
    resetButton.addEventListener('click', () => {
        // 重置表单和搜索参数
        searchForm.reset();
        searchParams = {
            query: '',
            isPaid: ''
        };
        
        // 重置页码并加载主题
        currentPage = 1;
        loadThemes();
    });
}

/**
 * 渲染分页
 * @param {number} total 总记录数
 * @param {number} limit 每页记录数
 * @param {number} current 当前页码
 */
function renderPagination(total, limit, current) {
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';
    
    const totalPages = Math.ceil(total / limit);
    
    if (totalPages <= 1) {
        return;
    }
    
    // 创建分页控件
    const paginationList = document.createElement('ul');
    paginationList.className = 'pagination-list';
    
    // 上一页按钮
    const prevButton = createPaginationButton('上一页', current > 1, () => {
        currentPage--;
        loadThemes();
    });
    paginationList.appendChild(prevButton);
    
    // 页码按钮
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === current;
        const pageButton = createPaginationButton(i.toString(), true, () => {
            currentPage = i;
            loadThemes();
        }, isActive);
        paginationList.appendChild(pageButton);
    }
    
    // 下一页按钮
    const nextButton = createPaginationButton('下一页', current < totalPages, () => {
        currentPage++;
        loadThemes();
    });
    paginationList.appendChild(nextButton);
    
    paginationElement.appendChild(paginationList);
}

/**
 * 创建分页按钮
 * @param {string} text 按钮文本
 * @param {boolean} enabled 是否启用
 * @param {Function} onClick 点击回调
 * @param {boolean} isActive 是否为当前活动项
 * @returns {HTMLElement} 分页按钮元素
 */
function createPaginationButton(text, enabled, onClick, isActive = false) {
    const li = document.createElement('li');
    li.className = `pagination-item ${isActive ? 'active' : ''} ${!enabled ? 'disabled' : ''}`;
    
    const button = document.createElement('button');
    button.className = 'pagination-link';
    button.textContent = text;
    button.disabled = !enabled;
    
    if (enabled) {
        button.addEventListener('click', onClick);
    }
    
    li.appendChild(button);
    return li;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initThemeListPage); 