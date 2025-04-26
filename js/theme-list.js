/**
 * 主题列表相关功能
 */

// 引入工具函数
// 确保已经加载了auth.js, api.js, utils.js

const themeListManager = {
  themes: [],
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  
  /**
   * 初始化主题列表
   */
  init() {
    this.loadThemes();
    this.initEventListeners();
  },
  
  /**
   * 初始化事件监听
   */
  initEventListeners() {
    // 添加主题按钮
    const addThemeBtn = document.getElementById('add-theme-btn');
    if (addThemeBtn) {
      addThemeBtn.addEventListener('click', () => this.showCreateThemePage());
    }
    
    // 分页按钮
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (this.currentPage > 1) {
          this.currentPage--;
          this.loadThemes();
        }
      });
    }
    
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
          this.loadThemes();
        }
      });
    }
    
    // 搜索框
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.currentPage = 1;
        this.loadThemes(searchInput.value);
      });
      
      searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.currentPage = 1;
          this.loadThemes(searchInput.value);
        }
      });
    }
  },
  
  /**
   * 加载主题列表
   * @param {string} [searchTerm=''] 搜索关键词
   */
  async loadThemes(searchTerm = '') {
    try {
      // 显示加载指示器
      utils.showLoading('正在加载主题列表...');
      
      // 准备请求参数
      const params = {
        page: this.currentPage,
        page_size: this.pageSize
      };
      
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      // 发送API请求
      const response = await apiService.get('/themes', params);
      
      if (response.success) {
        this.themes = response.data.items || [];
        this.totalPages = response.data.total_pages || 1;
        
        // 更新分页信息
        this.updatePagination();
        
        // 渲染主题列表
        this.renderThemeList();
      } else {
        utils.showMessage('error', '加载主题列表失败: ' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('加载主题列表时出错:', error);
      utils.showMessage('error', '加载主题列表时出错: ' + error.message);
    } finally {
      // 隐藏加载指示器
      utils.hideLoading();
    }
  },
  
  /**
   * 更新分页信息
   */
  updatePagination() {
    const paginationInfo = document.getElementById('pagination-info');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (paginationInfo) {
      paginationInfo.textContent = `第 ${this.currentPage} 页，共 ${this.totalPages} 页`;
    }
    
    if (prevPageBtn) {
      prevPageBtn.disabled = this.currentPage <= 1;
    }
    
    if (nextPageBtn) {
      nextPageBtn.disabled = this.currentPage >= this.totalPages;
    }
  },
  
  /**
   * 渲染主题列表
   */
  renderThemeList() {
    const themeList = document.getElementById('theme-list');
    
    if (!themeList) return;
    
    // 清空列表
    themeList.innerHTML = '';
    
    // 如果没有主题，显示空状态
    if (this.themes.length === 0) {
      themeList.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">暂无主题</td>
        </tr>
      `;
      return;
    }
    
    // 渲染每个主题
    this.themes.forEach(theme => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>
          <img src="${theme.thumbnail || 'assets/images/default-theme.png'}" 
               alt="${theme.name}" 
               class="theme-thumbnail" 
               onerror="this.src='assets/images/default-theme.png'">
        </td>
        <td>${theme.name || '未命名主题'}</td>
        <td>${theme.version || '1.0'}</td>
        <td>${theme.is_paid ? '付费' : '免费'}</td>
        <td>${utils.formatDateTime(theme.updated_at) || utils.formatDateTime(theme.created_at) || '未知'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-primary view-btn" data-id="${theme.id}">查看</button>
            <button class="btn btn-sm btn-secondary edit-btn" data-id="${theme.id}">编辑</button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${theme.id}">删除</button>
          </div>
        </td>
      `;
      
      // 添加行到列表
      themeList.appendChild(row);
      
      // 绑定按钮事件
      const viewBtn = row.querySelector('.view-btn');
      const editBtn = row.querySelector('.edit-btn');
      const deleteBtn = row.querySelector('.delete-btn');
      
      if (viewBtn) {
        viewBtn.addEventListener('click', () => this.viewTheme(theme.id));
      }
      
      if (editBtn) {
        editBtn.addEventListener('click', () => this.editTheme(theme.id));
      }
      
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => this.confirmDeleteTheme(theme.id, theme.name));
      }
    });
  },
  
  /**
   * 显示创建主题页面
   */
  showCreateThemePage() {
    const listPage = document.getElementById('theme-list-page');
    const createPage = document.getElementById('theme-create-page');
    
    if (listPage) listPage.style.display = 'none';
    if (createPage) createPage.style.display = 'block';
    
    // 重置表单
    const themeForm = document.getElementById('theme-form');
    if (themeForm) {
      themeForm.reset();
    }
    
    // 设置表单标题和按钮文本
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-button');
    
    if (formTitle) formTitle.textContent = '创建新主题';
    if (submitButton) submitButton.textContent = '创建';
    
    // 隐藏主题ID字段
    const themeIdInput = document.getElementById('theme-id');
    if (themeIdInput) {
      themeIdInput.value = '';
    }
    
    // 更新导航状态
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    const createThemeLink = document.querySelector('[data-target="theme-create-page"]');
    if (createThemeLink) createThemeLink.classList.add('active');
    
    // 显示第一步
    document.querySelectorAll('.step-content').forEach(step => {
      step.classList.remove('active');
    });
    const firstStep = document.getElementById('basic-info-step');
    if (firstStep) firstStep.classList.add('active');
    
    // 更新步骤导航
    document.querySelectorAll('.step-link').forEach((link, index) => {
      link.classList.toggle('active', index === 0);
      link.classList.remove('complete');
    });
  },
  
  /**
   * 查看主题详情
   * @param {string} themeId 主题ID
   */
  async viewTheme(themeId) {
    try {
      utils.showLoading('正在加载主题详情...');
      
      const response = await apiService.get(`/themes/${themeId}`);
      
      if (response.success) {
        const theme = response.data;
        
        // 使用主题工具函数显示详情页
        themeUtils.showThemeDetailsPage(theme);
      } else {
        utils.showMessage('error', '加载主题详情失败: ' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('查看主题详情时出错:', error);
      utils.showMessage('error', '查看主题详情时出错: ' + error.message);
    } finally {
      utils.hideLoading();
    }
  },
  
  /**
   * 编辑主题
   * @param {string} themeId 主题ID
   */
  async editTheme(themeId) {
    try {
      utils.showLoading('正在加载主题数据...');
      
      const response = await apiService.get(`/themes/${themeId}`);
      
      if (response.success) {
        const theme = response.data;
        
        // 显示创建/编辑页面
        const listPage = document.getElementById('theme-list-page');
        const createPage = document.getElementById('theme-create-page');
        
        if (listPage) listPage.style.display = 'none';
        if (createPage) createPage.style.display = 'block';
        
        // 更新导航状态
        document.querySelectorAll('.nav-link').forEach(link => {
          link.classList.remove('active');
        });
        const createThemeLink = document.querySelector('[data-target="theme-create-page"]');
        if (createThemeLink) createThemeLink.classList.add('active');
        
        // 显示第一步
        document.querySelectorAll('.step-content').forEach(step => {
          step.classList.remove('active');
        });
        const firstStep = document.getElementById('basic-info-step');
        if (firstStep) firstStep.classList.add('active');
        
        // 更新步骤导航
        document.querySelectorAll('.step-link').forEach((link, index) => {
          link.classList.toggle('active', index === 0);
          link.classList.remove('complete');
        });
        
        // 使用主题工具函数填充表单
        themeUtils.fillThemeForm(theme);
      } else {
        utils.showMessage('error', '加载主题数据失败: ' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('编辑主题时出错:', error);
      utils.showMessage('error', '编辑主题时出错: ' + error.message);
    } finally {
      utils.hideLoading();
    }
  },
  
  /**
   * 确认删除主题
   * @param {string} themeId 主题ID
   * @param {string} themeName 主题名称
   */
  confirmDeleteTheme(themeId, themeName) {
    if (confirm(`确定要删除主题"${themeName || '未命名主题'}"吗？此操作无法撤销！`)) {
      this.deleteTheme(themeId);
    }
  },
  
  /**
   * 删除主题
   * @param {string} themeId 主题ID
   */
  async deleteTheme(themeId) {
    try {
      utils.showLoading('正在删除主题...');
      
      const response = await apiService.delete(`/themes/${themeId}`);
      
      if (response.success) {
        utils.showMessage('success', '主题已成功删除');
        
        // 重新加载主题列表
        this.loadThemes();
      } else {
        utils.showMessage('error', '删除主题失败: ' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('删除主题时出错:', error);
      utils.showMessage('error', '删除主题时出错: ' + error.message);
    } finally {
      utils.hideLoading();
    }
  }
};

// 导出主题列表管理器
window.themeListManager = themeListManager;

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  themeListManager.init();
}); 