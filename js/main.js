/**
 * 计算器皮肤主题管理系统 - 核心功能
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 检查用户是否已登录
  checkAuthentication();
  
  // 初始化页面
  initPage();
});

/**
 * 检查用户是否已登录
 */
function checkAuthentication() {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    // 如果没有登录令牌，重定向到登录页面
    localStorage.removeItem('auth_token');
    window.location.href = 'login.html';
    return;
  }
  
  // 验证token有效性
  verifyToken();
}

/**
 * 验证token是否有效
 */
async function verifyToken() {
  try {
    // 获取token
    const token = localStorage.getItem('auth_token');
    
    // 检查token是否存在
    if (!token) {
      console.warn('未找到认证令牌，需要登录');
      window.location.href = 'login.html';
      return;
    }
    
    console.log('验证token...');
    
    // 尝试获取主题列表作为token验证
    await themeAPI.getThemes({ page: 1, per_page: 1 });
    console.log('认证成功，用户已登录');
    return true;
  } catch (error) {
    console.error('认证失败:', error);
    // 认证失败，清除token并重定向到登录页
    localStorage.removeItem('auth_token');
    window.location.href = 'login.html';
    return false;
  }
}

/**
 * 初始化页面
 */
function initPage() {
  // 加载主题列表
  loadThemes();
  
  // 初始化搜索功能
  initSearch();
  
  // 初始化分页功能
  initPagination();
  
  // 初始化主题创建功能
  initThemeCreation();
  
  // 初始化退出登录功能
  document.getElementById('logout-button').addEventListener('click', logout);
}

/**
 * 退出登录
 */
function logout() {
  localStorage.removeItem('auth_token');
  window.location.href = 'login.html';
}

/**
 * 加载主题列表
 */
async function loadThemes(page = 1, per_page = 10, search = '', isPaid = null) {
  try {
    // 显示加载指示器
    document.getElementById('loading-indicator').style.display = 'block';
    
    // 获取主题列表
    const params = { page, per_page };
    if (search) params.search = search;
    if (isPaid !== null) params.is_paid = isPaid;
    
    // 强制刷新，避免缓存问题
    params.timestamp = new Date().getTime();
    
    const response = await themeAPI.getThemes(params);
    console.log('主题列表响应:', response);
    
    // 提取主题数据
    let themes;
    
    // 处理不同结构的响应
    if (Array.isArray(response)) {
      // 如果响应是数组，直接使用
      themes = response;
    } else if (response.items && Array.isArray(response.items)) {
      // 如果响应包含items数组，使用该数组
      themes = response.items;
    } else if (typeof response === 'object') {
      // 如果响应是对象，尝试找到第一个数组类型的属性
      for (const key in response) {
        if (Array.isArray(response[key])) {
          themes = response[key];
          break;
        }
      }
    }
    
    // 如果没有找到有效的主题数组，设为空数组
    if (!themes) {
      themes = [];
      console.warn('未能在响应中找到主题数组');
    } else {
      // 打印每个主题的usage_count以便调试
      themes.forEach(theme => {
        console.log(`主题ID: ${theme.id}, 名称: ${theme.name}, 使用次数: ${theme.usage_count}`);
      });
    }
    
    // 更新分页信息
    if (response.total !== undefined && response.pages !== undefined) {
      updatePagination(response.total, response.pages, response.current_page);
    }
    
    // 渲染主题列表
    renderThemeList(themes);
  } catch (error) {
    console.error('加载主题列表失败:', error);
    showErrorMessage(`加载主题列表失败: ${error.message}`);
    
    // 出错时显示空的主题列表
    renderThemeList([]);
  } finally {
    // 隐藏加载指示器
    document.getElementById('loading-indicator').style.display = 'none';
  }
}

/**
 * 渲染主题列表
 */
function renderThemeList(themes) {
  const themeList = document.getElementById('theme-list');
  
  // 确保themes是数组且不为空
  if (!Array.isArray(themes) || themes.length === 0) {
    themeList.innerHTML = '<div class="no-themes">暂无主题，请创建新主题</div>';
    return;
  }
  
  // 清空主题列表
  themeList.innerHTML = '';
  
  // 循环添加主题卡片
  themes.forEach(theme => {
    try {
      // 确保主题数据有效
      if (!theme) return;
      
      // 为空值设置默认值
      const name = theme.name || '未命名主题';
      const id = theme.id || `temp_${Math.random().toString(36).substr(2, 9)}`;
      const isPaid = theme.is_paid || false;
      
      // 确保usage_count为数字，默认为0
      let usageCount = 0;
      if (theme.usage_count !== undefined && theme.usage_count !== null) {
        usageCount = parseInt(theme.usage_count, 10);
        if (isNaN(usageCount)) usageCount = 0;
      }
      console.log(`渲染主题卡片 ID: ${id}, 使用次数: ${usageCount}`);
      
      // 处理日期格式
      let uploadDate = '未知日期';
      try {
        if (theme.create_time) {
          uploadDate = new Date(theme.create_time).toLocaleDateString('zh-CN');
        } else if (theme.upload_time) {
          uploadDate = new Date(theme.upload_time).toLocaleDateString('zh-CN');
        }
      } catch (e) {
        console.warn('日期格式化失败:', e);
      }
      
      // 创建主题卡片
      const card = document.createElement('div');
      card.className = 'theme-card';
      card.dataset.themeId = id;
      
      // 设置卡片内容
      card.innerHTML = `
        <div class="theme-image">
          <img src="${theme.detail_image || 'images/default-theme.png'}" alt="${name}">
        </div>
        <div class="theme-info">
          <div class="theme-info-content">
            <h3>${name}</h3>
            <p class="usage-count">使用次数: ${usageCount}</p>
            <p>版本: ${theme.version || '1.0'}</p>
            <p>上传时间: ${uploadDate}</p>
            <p>类型: ${isPaid ? '付费' : '免费'}</p>
          </div>
          <div class="theme-actions">
            <button class="btn edit-theme" data-id="${id}">编辑</button>
            <button class="btn delete-theme" data-id="${id}">删除</button>
          </div>
        </div>
      `;
      
      // 添加到列表
      themeList.appendChild(card);
      
      // 绑定编辑和删除按钮的点击事件
      const editButton = card.querySelector('.edit-theme');
      const deleteButton = card.querySelector('.delete-theme');
      
      if (editButton) {
        editButton.addEventListener('click', (e) => {
          e.stopPropagation(); // 阻止事件冒泡
          editTheme(id);
        });
      }
      
      if (deleteButton) {
        deleteButton.addEventListener('click', (e) => {
          e.stopPropagation(); // 阻止事件冒泡
          confirmDeleteTheme(id);
        });
      }
      
      // 为整个卡片添加点击事件，查看主题详情
      card.style.cursor = 'pointer'; // 设置鼠标悬停为手形指针
      card.addEventListener('click', () => {
        viewThemeDetails(id);
      });
      
    } catch (error) {
      console.error('渲染主题卡片失败:', error, theme);
    }
  });
}

/**
 * 查看主题详情
 */
function viewThemeDetails(themeId) {
  try {
    console.log(`查看主题详情: ${themeId}`);
    
    // 跳转到独立的主题详情页面
    window.location.href = `detail.html?id=${themeId}`;
  } catch (error) {
    console.error(`查看主题详情失败:`, error);
    showErrorMessage(`查看主题详情失败: ${error.message}`);
  }
}

/**
 * 返回主题列表页面
 */
function returnToThemeList() {
  const listPage = document.getElementById('theme-list-page');
  const createPage = document.getElementById('theme-create-page');
  
  if (listPage) listPage.style.display = 'block';
  if (createPage) createPage.style.display = 'none';
  
  // 更新导航状态
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelector('[data-target="theme-list-page"]').classList.add('active');
}

/**
 * @deprecated 此函数已被废弃，保留用于兼容性考虑
 * 显示主题详情页面（旧版）
 */
function showThemeDetailsPage(theme) {
  // 跳转到主题创建页面的确认提交(summary)步骤，以只读方式显示
  const listPage = document.getElementById('theme-list-page');
  const createPage = document.getElementById('theme-create-page');
  
  if (listPage) listPage.style.display = 'none';
  if (createPage) createPage.style.display = 'block';
  
  // 隐藏所有步骤内容
  document.querySelectorAll('.step-content').forEach(step => {
    step.classList.remove('active');
  });
  
  // 显示摘要步骤
  const summaryStep = document.getElementById('summary-step');
  if (summaryStep) {
    summaryStep.classList.add('active');
    
    // 更新页面标题，显示为详情查看模式
    const stepsNav = document.querySelector('.steps-nav');
    if (stepsNav) {
      stepsNav.innerHTML = '<div class="step-link active">主题详情查看</div>';
    }
    
    // 填充主题详情数据
    fillThemeForm(theme);
    
    // 更新摘要信息
    if (typeof updateSummary === 'function') {
      updateSummary();
    }
    
    // 隐藏提交按钮，显示返回按钮
    const stepButtons = summaryStep.querySelector('.step-buttons');
    if (stepButtons) {
      stepButtons.innerHTML = '<button type="button" class="btn" onclick="returnToThemeList()">返回主题列表</button>';
    }
  }
}

/**
 * 更新分页信息
 */
function updatePagination(total, pages, currentPage) {
  const pagination = document.getElementById('pagination');
  
  if (!pagination) return;
  
  // 清空分页控件
  pagination.innerHTML = '';
  
  // 如果只有一页，不显示分页
  if (pages <= 1) return;
  
  // 添加上一页按钮
  const prevButton = document.createElement('button');
  prevButton.className = 'pagination-btn';
  prevButton.textContent = '上一页';
  prevButton.disabled = currentPage <= 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      loadThemes(currentPage - 1);
    }
  });
  pagination.appendChild(prevButton);
  
  // 添加页码按钮
  for (let i = 1; i <= pages; i++) {
    const pageButton = document.createElement('button');
    pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
    pageButton.textContent = i;
    pageButton.addEventListener('click', () => loadThemes(i));
    pagination.appendChild(pageButton);
  }
  
  // 添加下一页按钮
  const nextButton = document.createElement('button');
  nextButton.className = 'pagination-btn';
  nextButton.textContent = '下一页';
  nextButton.disabled = currentPage >= pages;
  nextButton.addEventListener('click', () => {
    if (currentPage < pages) {
      loadThemes(currentPage + 1);
    }
  });
  pagination.appendChild(nextButton);
}

/**
 * 初始化搜索功能
 */
function initSearch() {
  const searchForm = document.getElementById('search-form');
  
  if (!searchForm) return;
  
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const searchInput = document.getElementById('search-input');
    const search = searchInput.value.trim();
    
    // 获取筛选条件
    const filterSelect = document.getElementById('filter-paid');
    const isPaid = filterSelect.value === '' ? null : (filterSelect.value === 'true');
    
    // 搜索主题
    loadThemes(1, 10, search, isPaid);
  });
  
  // 添加重置按钮事件
  const resetButton = document.getElementById('reset-search');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      document.getElementById('search-input').value = '';
      document.getElementById('filter-paid').value = '';
      loadThemes();
    });
  }
}

/**
 * 初始化分页功能
 */
function initPagination() {
  // 分页功能已在updatePagination中实现
}

/**
 * 初始化主题创建功能
 */
function initThemeCreation() {
  // 获取相关元素
  const newThemeButton = document.getElementById('new-theme-button');
  const themeForm = document.getElementById('theme-form');
  const formCloseButton = document.getElementById('form-close');
  
  if (!newThemeButton || !themeForm || !formCloseButton) return;
  
  // 打开表单
  newThemeButton.addEventListener('click', () => {
    // 重置表单
    document.getElementById('theme-form').reset();
    document.getElementById('theme-id').value = '';
    document.getElementById('form-title').textContent = '创建新主题';
    document.getElementById('submit-button').textContent = '创建';
    
    // 显示表单
    document.getElementById('theme-form-container').style.display = 'block';
  });
  
  // 关闭表单
  formCloseButton.addEventListener('click', () => {
    document.getElementById('theme-form-container').style.display = 'none';
  });
  
  // 提交表单
  themeForm.addEventListener('submit', handleFormSubmit);
}

/**
 * 处理表单提交
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  try {
    // 显示加载指示器
    document.getElementById('form-loading').style.display = 'block';
    
    // 获取主题ID
    const themeId = document.getElementById('theme-id').value;
    
    // 创建FormData对象
    const formData = new FormData(document.getElementById('theme-form'));
    
    let response;
    
    if (themeId) {
      // 更新现有主题
      response = await themeAPI.updateTheme(themeId, formData);
      showSuccessMessage('主题更新成功');
    } else {
      // 创建新主题
      response = await themeAPI.createTheme(formData);
      showSuccessMessage('主题创建成功');
    }
    
    console.log('主题保存响应:', response);
    
    // 关闭表单
    document.getElementById('theme-form-container').style.display = 'none';
    
    // 重新加载主题列表
    loadThemes();
  } catch (error) {
    console.error('保存主题失败:', error);
    showErrorMessage(`保存主题失败: ${error.message}`);
  } finally {
    // 隐藏加载指示器
    document.getElementById('form-loading').style.display = 'none';
  }
}

/**
 * 编辑主题
 */
async function editTheme(themeId) {
  try {
    // 显示加载指示器
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'block';
    }
    
    // 获取主题详情
    const theme = await themeAPI.getThemeDetail(themeId);
    console.log('主题详情:', theme);
    
    // 填充表单
    fillThemeForm(theme);
    
    // 显示表单
    const formContainer = document.getElementById('theme-form-container');
    if (formContainer) {
      formContainer.style.display = 'block';
    } else {
      console.warn('未找到表单容器元素');
      // 尝试定位到主题创建页面
      showThemeCreatePage();
    }
  } catch (error) {
    console.error(`加载主题 ${themeId} 详情失败:`, error);
    showErrorMessage(`加载主题详情失败: ${error.message}`);
  } finally {
    // 隐藏加载指示器
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
  }
}

/**
 * 填充主题表单
 */
function fillThemeForm(theme) {
  try {
    // 设置表单标题
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
      formTitle.textContent = '编辑主题';
    }
    
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
      submitButton.textContent = '更新';
    }
    
    // 设置主题ID
    const themeIdInput = document.getElementById('theme-id');
    if (themeIdInput) {
      themeIdInput.value = theme.id;
    }
    
    // 设置基本信息
    const skinNameInput = document.getElementById('skin_name');
    if (skinNameInput) {
      skinNameInput.value = theme.name || '';
    }
    
    const versionInput = document.getElementById('version');
    if (versionInput) {
      versionInput.value = theme.version || '1.0';
    }
    
    const isPaidCheckbox = document.getElementById('is_paid');
    if (isPaidCheckbox) {
      isPaidCheckbox.checked = theme.is_paid || false;
    }
    
    // 设置全局设置
    const hasGlobalBgImage = document.getElementById('has_global_background_image');
    if (hasGlobalBgImage) {
      hasGlobalBgImage.checked = theme.has_global_background_image || false;
    }
    
    const globalBgColor = document.getElementById('global_background_color');
    if (globalBgColor) {
      globalBgColor.value = theme.global_background_color || '#FFFFFF';
    }
    
    const useSystemFont = document.getElementById('use_system_font');
    if (useSystemFont) {
      useSystemFont.checked = theme.use_system_font || true;
    }
    
    // 设置结果区域
    const resultBgColor = document.getElementById('result_background_color');
    if (resultBgColor) {
      resultBgColor.value = theme.result_background_color || '#F5F5F5';
    }
    
    const resultFontColor = document.getElementById('result_font_color');
    if (resultFontColor) {
      resultFontColor.value = theme.result_font_color || '#000000';
    }
    
    const resultFontSize = document.getElementById('result_font_size');
    if (resultFontSize) {
      resultFontSize.value = theme.result_font_size || 24;
    }
    
    // 显示当前图片
    if (theme.detail_image) {
      const previewImg = document.getElementById('detail-image-preview');
      if (previewImg) {
        previewImg.src = theme.detail_image;
        previewImg.style.display = 'block';
      }
    }
    
    console.log('主题表单填充完成');
  } catch (error) {
    console.error('填充主题表单时出错:', error);
  }
}

/**
 * 显示主题创建页面
 */
function showThemeCreatePage() {
  // 显示主题创建页面
  const listPage = document.getElementById('theme-list-page');
  const createPage = document.getElementById('theme-create-page');
  
  if (listPage) listPage.style.display = 'none';
  if (createPage) createPage.style.display = 'block';
  
  // 更新导航状态
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));
  
  const createLink = document.getElementById('theme-create-link');
  if (createLink) createLink.classList.add('active');
  
  // 激活子菜单
  const createSubmenu = document.getElementById('theme-create-submenu');
  if (createSubmenu) createSubmenu.classList.add('submenu-active');
}

/**
 * 确认删除主题
 */
function confirmDeleteTheme(themeId) {
  if (confirm('确定要删除这个主题吗？此操作不可撤销。')) {
    deleteTheme(themeId);
  }
}

/**
 * 删除主题
 */
async function deleteTheme(themeId) {
  try {
    // 显示加载指示器
    document.getElementById('loading-indicator').style.display = 'block';
    
    console.log(`尝试删除主题ID: ${themeId}`);
    
    // 删除主题
    const response = await themeAPI.deleteTheme(themeId);
    console.log('删除主题响应:', response);
    
    // 显示成功消息
    showSuccessMessage('主题删除成功');
    
    // 重新加载主题列表
    setTimeout(() => {
      loadThemes();
    }, 500); // 短暂延迟确保后端处理完成
  } catch (error) {
    console.error(`删除主题 ${themeId} 失败:`, error);
    
    if (error.message && typeof error.message === 'string') {
      showErrorMessage(`删除主题失败: ${error.message}`);
    } else {
      // 通用错误信息
      showErrorMessage('删除主题失败，请稍后再试');
    }
    
    // 即使出错也重新加载列表，因为实际上可能已经删除成功
    setTimeout(() => {
      console.log('重新加载主题列表以确认删除状态');
      loadThemes();
    }, 1000);
  } finally {
    // 隐藏加载指示器
    document.getElementById('loading-indicator').style.display = 'none';
  }
}

/**
 * 显示成功消息
 */
function showSuccessMessage(message) {
  const messageElement = document.getElementById('message');
  
  if (!messageElement) return;
  
  messageElement.textContent = message;
  messageElement.className = 'message success';
  messageElement.style.display = 'block';
  
  // 3秒后隐藏消息
  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 3000);
}

/**
 * 显示错误消息
 */
function showErrorMessage(message) {
  const messageElement = document.getElementById('message');
  
  if (!messageElement) return;
  
  messageElement.textContent = message;
  messageElement.className = 'message error';
  messageElement.style.display = 'block';
  
  // 5秒后隐藏消息
  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 5000);
}

/**
 * 切换表单部分的可见性
 */
function toggleFormSection(sectionId) {
  const section = document.getElementById(sectionId);
  
  if (!section) return;
  
  const isVisible = section.style.display !== 'none';
  section.style.display = isVisible ? 'none' : 'block';
  
  // 更新切换按钮图标
  const toggleButton = document.querySelector(`[data-target="${sectionId}"] .toggle-icon`);
  if (toggleButton) {
    toggleButton.textContent = isVisible ? '+' : '-';
  }
}

// 初始化表单部分的切换功能
document.querySelectorAll('.section-toggle').forEach(button => {
  button.addEventListener('click', () => {
    const sectionId = button.dataset.target;
    toggleFormSection(sectionId);
  });
}); 