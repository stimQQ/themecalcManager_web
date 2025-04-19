/**
 * 计算器皮肤主题管理系统 - 核心功能
 */

// 获取API基础URL，确保在本地和远程环境中都能正常工作
function getApiBaseUrl() {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocalhost ? '/api' : 'https://www.themecalc.com/api';
}

// URL参数获取函数
function getUrlParam(name) {
    const url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// 延迟加载非关键资源
function loadNonCriticalResources() {
  // 创建样式表链接
  const extraStyles = document.createElement('link');
  extraStyles.rel = 'stylesheet';
  extraStyles.href = 'css/extra-styles.css';
  document.head.appendChild(extraStyles);
  
  // 加载其他脚本
  const themeFixesScript = document.createElement('script');
  themeFixesScript.src = 'js/theme-fixes.js';
  document.body.appendChild(themeFixesScript);
}

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  // 首先处理认证
  checkAuthentication().then(authenticated => {
    if (authenticated) {
      // 初始化页面并立即加载数据
      initPage();
      
      // 延迟加载非关键资源
      setTimeout(loadNonCriticalResources, 1000);
    }
  });
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
    return false;
  }
  
  // 验证token有效性
  return verifyToken();
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
      return false;
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
  // 检查是否从删除主题页面重定向过来
  const isDeleted = getUrlParam('deleted') === 'true';
  if (isDeleted) {
    showSuccessMessage('主题已成功删除');
    
    // 移除URL参数，避免刷新后再次显示消息
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  
  // 加载主题列表
  loadThemes();
  
  // 设置字体透明度滑块
  setupFontOpacitySliders();
  
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
 * 设置字体透明度滑块的值显示
 */
function setupFontOpacitySliders() {
  const buttonTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
  
  buttonTypes.forEach(type => {
    const slider = document.getElementById(`button_TYPE_${type}_font_opacity`);
    const valueDisplay = document.getElementById(`button_TYPE_${type}_font_opacity_value`);
    
    if (slider && valueDisplay) {
      // 设置初始值
      valueDisplay.textContent = slider.value;
      
      // 添加事件监听器，当滑块值变化时更新显示
      slider.addEventListener('input', function() {
        valueDisplay.textContent = this.value;
      });
    }
  });
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
  let retryCount = 0;
  const maxRetries = 2;
  
  async function attemptLoad() {
    try {
      // 显示加载指示器
      document.getElementById('loading-indicator').style.display = 'block';
      
      // 获取主题列表
      const params = { page, per_page };
      if (search) params.search = search;
      if (isPaid !== null) params.is_paid = isPaid;
      
      // 强制刷新，避免缓存问题
      params.timestamp = new Date().getTime();
      
      console.log(`正在加载主题列表，页码: ${page}, 每页数量: ${per_page}`);
      const response = await themeAPI.getThemes(params);
      
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
      }
      
      console.log(`获取到 ${themes.length} 个主题`);
      
      // 更新分页信息
      if (response.total !== undefined && response.pages !== undefined) {
        updatePagination(response.total, response.pages, response.current_page);
      }
      
      // 渲染主题列表
      renderThemeList(themes);
      return true;
    } catch (error) {
      console.error('加载主题列表失败:', error);
      
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`重试加载主题列表(${retryCount}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 延迟1秒后重试
        return attemptLoad();
      } else {
        showErrorMessage(`加载主题列表失败: ${error.message}`);
        // 出错时显示空的主题列表
        renderThemeList([]);
        return false;
      }
    } finally {
      // 隐藏加载指示器
      document.getElementById('loading-indicator').style.display = 'none';
    }
  }
  
  return attemptLoad();
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
  console.log('Attempting to initialize theme creation...');
  // 获取必需的元素
  const newThemeButton = document.getElementById('new-theme-button');
  const createPage = document.getElementById('theme-create-page');
  const listPage = document.getElementById('theme-list-page');

  // 检查必需的元素是否存在
  if (!newThemeButton) {
    console.error('Error: Cannot find new theme button (id: new-theme-button)');
    return;
  }
  if (!createPage) {
    console.error('Error: Cannot find theme create page (id: theme-create-page)');
    return;
  }
  if (!listPage) {
    console.error('Error: Cannot find theme list page (id: theme-list-page)');
    return;
  }

  console.log('Elements found, adding click listener to new-theme-button.');

  // 打开表单 (现在这个监听器应该会被添加了)
  newThemeButton.addEventListener('click', () => {
    console.log('New theme button clicked! Navigating to create.html');
    // 不再是显示/隐藏 div，而是直接跳转页面
    // createPage.style.display = 'block'; 
    // listPage.style.display = 'none';
    window.location.href = 'create.html'; // <--- 修改为页面跳转
  });

  // 注意: 关闭按钮和表单提交的逻辑原本依赖 theme-form 和 form-close，
  // 这部分逻辑可能需要根据 theme-create-page 的实际内容重新实现或移到其他地方。
  // 例如，关闭按钮的事件监听器可能需要加在 theme-create-page 内部的某个按钮上。

  // const formCloseButton = document.getElementById('form-close'); // 之前的代码
  // const themeForm = document.getElementById('theme-form'); // 之前的代码
  // if (formCloseButton) { ... } // 之前的关闭逻辑
  // if (themeForm) { themeForm.addEventListener('submit', handleFormSubmit); } // 之前的提交逻辑

  // 处理下一步按钮
  const nextStepButtons = document.querySelectorAll('.next-step');
  nextStepButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
      const currentStep = button.closest('.step-content');
      const nextStepId = button.getAttribute('data-next');

      if (!currentStep || !nextStepId) {
        console.error('无法确定当前步骤或下一步');
        return;
      }

      button.disabled = true; // 点击后立即禁用
      showLoading(true);

      try {
        const savedData = await saveCurrentStepData(currentStep.id);
        console.log('当前步骤数据已保存:', savedData);
        navigateToStep(nextStepId);
        // 不在此处启用按钮
      } catch (error) {
        console.error(`保存步骤 ${currentStep.id} 或导航至 ${nextStepId} 时出错:`, error);
        showErrorMessage(`保存或导航时出错: ${error.message || '未知错误'}`);
        // 也不在此处启用按钮
      } finally {
        // 确保按钮在最后总是被重新启用
        button.disabled = false;
        showLoading(false);
      }
    });
  });
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
    
    // 关闭表单 - 改为隐藏 theme-create-page 并显示 theme-list-page
    document.getElementById('theme-create-page').style.display = 'none';
    document.getElementById('theme-list-page').style.display = 'block';
    
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
    
    console.log(`编辑主题ID: ${themeId}`);
    
    // 直接跳转到编辑页面
    window.location.href = `edit.html?id=${themeId}`;
  } catch (error) {
    console.error(`编辑主题 ${themeId} 失败:`, error);
    showErrorMessage(`编辑主题失败: ${error.message}`);
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