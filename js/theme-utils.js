/**
 * 主题相关工具函数
 */

const themeUtils = {
  /**
   * 填充主题表单
   * @param {Object} theme 主题对象
   */
  fillThemeForm(theme) {
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
      
      // 处理背景图片选项
      this.handleBackgroundImageOptions(theme);
      
      console.log('主题表单填充完成');
    } catch (error) {
      console.error('填充主题表单时出错:', error);
    }
  },

  /**
   * 处理背景图片选项
   * @param {Object} theme 主题对象
   */
  handleBackgroundImageOptions(theme) {
    // 处理全局背景
    if (theme.has_global_background_image) {
      const globalBgImageOption = document.getElementById('global_bg_image_option');
      const globalBgColorGroup = document.getElementById('global_bg_color_group');
      const globalBgImageGroup = document.getElementById('global_bg_image_group');
      const hasGlobalBackgroundImage = document.getElementById('has_global_background_image');
      
      if (globalBgImageOption) globalBgImageOption.checked = true;
      if (globalBgColorGroup) globalBgColorGroup.style.display = 'none';
      if (globalBgImageGroup) globalBgImageGroup.style.display = 'block';
      if (hasGlobalBackgroundImage) hasGlobalBackgroundImage.value = 'true';
      
      // 显示当前背景图片
      if (theme.global_background_image) {
        const currentBgImage = document.getElementById('current-global-bg-image');
        if (currentBgImage) {
          currentBgImage.src = theme.global_background_image;
          currentBgImage.parentElement.style.display = 'block';
        }
      }
    } else {
      const globalBgColorOption = document.getElementById('global_bg_color_option');
      const globalBgColorGroup = document.getElementById('global_bg_color_group');
      const globalBgImageGroup = document.getElementById('global_bg_image_group');
      const hasGlobalBackgroundImage = document.getElementById('has_global_background_image');
      
      if (globalBgColorOption) globalBgColorOption.checked = true;
      if (globalBgColorGroup) globalBgColorGroup.style.display = 'block';
      if (globalBgImageGroup) globalBgImageGroup.style.display = 'none';
      if (hasGlobalBackgroundImage) hasGlobalBackgroundImage.value = 'false';
      
      // 设置背景颜色
      const bgColor = theme.global_background_color || '#FFFFFF';
      const globalBackgroundColor = document.getElementById('global_background_color');
      const globalBackgroundColorText = document.getElementById('global_background_color_text');
      
      if (globalBackgroundColor) globalBackgroundColor.value = bgColor;
      if (globalBackgroundColorText) globalBackgroundColorText.value = bgColor;
    }

    // 处理TabBar背景
    if (document.getElementById('tabbar_use_background_image')) {
      if (theme.tabbar_use_background_image) {
        document.getElementById('tabbar_bg_image_option').checked = true;
        document.getElementById('tabbar_bg_color_group').style.display = 'none';
        document.getElementById('tabbar_bg_image_group').style.display = 'block';
        document.getElementById('tabbar_use_background_image').value = 'true';
      } else {
        document.getElementById('tabbar_bg_color_option').checked = true;
        document.getElementById('tabbar_bg_color_group').style.display = 'block';
        document.getElementById('tabbar_bg_image_group').style.display = 'none';
        document.getElementById('tabbar_use_background_image').value = 'false';
      }
      
      document.getElementById('tabbar_background_color').value = theme.tabbar_background_color || '#FFFFFF';
      document.getElementById('tabbar_opacity').value = theme.tabbar_opacity || '1';
      document.getElementById('tabbar_font_size').value = theme.tabbar_font_size || '12';
    }
  },

  /**
   * 更新背景选项可见性
   * @param {boolean} useColor 是否使用颜色作为背景
   * @param {Element} colorGroup 颜色选项组元素
   * @param {Element} imageGroup 图片选项组元素
   * @param {Element} flagField 标识字段元素
   */
  updateBackgroundOptionVisibility(useColor, colorGroup, imageGroup, flagField) {
    colorGroup.style.display = useColor ? 'block' : 'none';
    imageGroup.style.display = useColor ? 'none' : 'block';
    flagField.value = useColor ? 'false' : 'true';
  },

  /**
   * 返回主题列表页面
   */
  returnToThemeList() {
    const listPage = document.getElementById('theme-list-page');
    const createPage = document.getElementById('theme-create-page');
    
    if (listPage) listPage.style.display = 'block';
    if (createPage) createPage.style.display = 'none';
    
    // 更新导航状态
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    const themeListLink = document.querySelector('[data-target="theme-list-page"]');
    if (themeListLink) themeListLink.classList.add('active');
  },

  /**
   * @deprecated 此函数已被废弃，保留用于兼容性考虑
   * 显示主题详情页面（旧版）
   * @param {Object} theme 主题对象
   */
  showThemeDetailsPage(theme) {
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
      this.fillThemeForm(theme);
      
      // 更新摘要信息
      if (typeof updateSummary === 'function') {
        updateSummary();
      }
      
      // 隐藏提交按钮，显示返回按钮
      const stepButtons = summaryStep.querySelector('.step-buttons');
      if (stepButtons) {
        stepButtons.innerHTML = '<button type="button" class="btn" onclick="themeUtils.returnToThemeList()">返回主题列表</button>';
      }
    }
  }
};

// 导出工具函数
window.themeUtils = themeUtils; 