/**
 * 主题编辑器功能
 */

// 引入工具函数
// 确保已经加载了auth.js, api.js, utils.js, theme-utils.js

const themeEditorManager = {
  currentTheme: null,
  currentStep: 0,
  steps: ['basic-info', 'display', 'components', 'preview'],
  isEditMode: false,
  formChanged: false,
  
  /**
   * 初始化主题编辑器
   */
  init() {
    // 初始化步骤导航
    this.initStepNavigation();
    
    // 初始化表单处理
    this.initFormHandlers();
    
    // 初始化上传处理
    this.initUploadHandlers();
    
    // 初始化保存按钮
    this.initSaveButton();
    
    // 初始化颜色选择器
    this.initColorPickers();
    
    // 初始化预览功能
    this.initPreview();
    
    // 监听表单变化
    this.watchFormChanges();
    
    // 初始化返回按钮
    const backButton = document.getElementById('back-to-list');
    if (backButton) {
      backButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (this.formChanged) {
          if (confirm('您有未保存的更改，确定要离开吗？')) {
            themeUtils.returnToThemeList();
          }
        } else {
          themeUtils.returnToThemeList();
        }
      });
    }
  },
  
  /**
   * 初始化步骤导航
   */
  initStepNavigation() {
    // 为每个步骤链接添加点击事件
    document.querySelectorAll('.step-link').forEach((link, index) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToStep(index);
      });
    });
    
    // 下一步和上一步按钮
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    
    nextButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        
        // 验证当前步骤
        if (this.validateCurrentStep()) {
          this.goToStep(this.currentStep + 1);
        }
      });
    });
    
    prevButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToStep(this.currentStep - 1);
      });
    });
  },
  
  /**
   * 初始化表单处理
   */
  initFormHandlers() {
    // 初始化背景类型切换
    const backgroundType = document.getElementById('background-type');
    if (backgroundType) {
      backgroundType.addEventListener('change', (e) => {
        themeUtils.updateBackgroundOptionVisibility(e.target.value);
      });
    }
    
    // 初始化组件集选择
    const componentSetSelect = document.getElementById('component-set');
    if (componentSetSelect) {
      componentSetSelect.addEventListener('change', (e) => {
        this.loadComponentOptions(e.target.value);
      });
    }
  },
  
  /**
   * 初始化上传处理
   */
  initUploadHandlers() {
    // 预览图上传
    const thumbnailUpload = document.getElementById('thumbnail-upload');
    const thumbnailPreview = document.getElementById('thumbnail-preview');
    const thumbnailInput = document.getElementById('thumbnail');
    
    if (thumbnailUpload && thumbnailPreview && thumbnailInput) {
      thumbnailUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            thumbnailPreview.src = e.target.result;
            thumbnailPreview.style.display = 'block';
            thumbnailInput.value = file.name; // 存储文件名
            
            // 标记表单已更改
            this.formChanged = true;
          };
          reader.readAsDataURL(file);
        }
      });
    }
    
    // 背景图片上传
    const backgroundUpload = document.getElementById('background-image-upload');
    const backgroundPreview = document.getElementById('background-preview');
    const backgroundInput = document.getElementById('background-image');
    
    if (backgroundUpload && backgroundPreview && backgroundInput) {
      backgroundUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            backgroundPreview.src = e.target.result;
            backgroundPreview.style.display = 'block';
            backgroundInput.value = file.name; // 存储文件名
            
            // 标记表单已更改
            this.formChanged = true;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  },
  
  /**
   * 初始化保存按钮
   */
  initSaveButton() {
    const saveButton = document.getElementById('submit-button');
    const themeForm = document.getElementById('theme-form');
    
    if (saveButton && themeForm) {
      themeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTheme();
      });
    }
  },
  
  /**
   * 初始化颜色选择器
   */
  initColorPickers() {
    // 获取所有颜色选择器
    const colorInputs = document.querySelectorAll('input[type="color"]');
    
    colorInputs.forEach(input => {
      // 获取对应的文本输入
      const hexInput = document.getElementById(`${input.id}-hex`);
      
      if (hexInput) {
        // 当颜色选择器改变时更新十六进制值
        input.addEventListener('input', () => {
          hexInput.value = input.value;
          
          // 标记表单已更改
          this.formChanged = true;
        });
        
        // 当十六进制输入改变时更新颜色选择器
        hexInput.addEventListener('input', () => {
          // 验证输入是否为有效的十六进制颜色
          const validHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
          if (validHex.test(hexInput.value)) {
            input.value = hexInput.value;
            
            // 标记表单已更改
            this.formChanged = true;
          }
        });
      }
    });
  },
  
  /**
   * 初始化预览功能
   */
  initPreview() {
    const previewButton = document.getElementById('preview-button');
    
    if (previewButton) {
      previewButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.generatePreview();
      });
    }
  },
  
  /**
   * 监听表单变化
   */
  watchFormChanges() {
    const formInputs = document.querySelectorAll('#theme-form input, #theme-form select, #theme-form textarea');
    
    formInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.formChanged = true;
      });
      
      if (input.type === 'text' || input.tagName === 'TEXTAREA') {
        input.addEventListener('input', () => {
          this.formChanged = true;
        });
      }
    });
  },
  
  /**
   * 切换到指定步骤
   * @param {number} stepIndex 步骤索引
   */
  goToStep(stepIndex) {
    // 验证步骤索引是否有效
    if (stepIndex < 0 || stepIndex >= this.steps.length) {
      return;
    }
    
    // 如果是向前进，验证当前步骤
    if (stepIndex > this.currentStep && !this.validateCurrentStep()) {
      return;
    }
    
    // 隐藏所有步骤
    document.querySelectorAll('.step-content').forEach(step => {
      step.classList.remove('active');
    });
    
    // 显示选定的步骤
    const targetStep = document.getElementById(`${this.steps[stepIndex]}-step`);
    if (targetStep) {
      targetStep.classList.add('active');
    }
    
    // 更新步骤导航
    document.querySelectorAll('.step-link').forEach((link, index) => {
      link.classList.remove('active');
      
      // 标记已完成的步骤
      if (index < stepIndex) {
        link.classList.add('complete');
      } else if (index === stepIndex) {
        link.classList.add('active');
      } else {
        link.classList.remove('complete');
      }
    });
    
    // 更新当前步骤
    this.currentStep = stepIndex;
    
    // 如果是预览步骤，生成预览
    if (this.steps[stepIndex] === 'preview') {
      this.generatePreview();
    }
  },
  
  /**
   * 验证当前步骤
   * @returns {boolean} 验证是否通过
   */
  validateCurrentStep() {
    const currentStepId = this.steps[this.currentStep];
    
    switch (currentStepId) {
      case 'basic-info':
        return this.validateBasicInfo();
      case 'display':
        return this.validateDisplay();
      case 'components':
        return this.validateComponents();
      default:
        return true;
    }
  },
  
  /**
   * 验证基本信息
   * @returns {boolean} 验证是否通过
   */
  validateBasicInfo() {
    const nameInput = document.getElementById('theme-name');
    const versionInput = document.getElementById('theme-version');
    
    let isValid = true;
    
    // 验证主题名称
    if (!nameInput.value.trim()) {
      utils.showFieldError(nameInput, '请输入主题名称');
      isValid = false;
    } else {
      utils.clearFieldError(nameInput);
    }
    
    // 验证版本号
    const versionRegex = /^\d+\.\d+(\.\d+)?$/;
    if (!versionRegex.test(versionInput.value.trim())) {
      utils.showFieldError(versionInput, '请输入有效的版本号，如 1.0 或 1.0.0');
      isValid = false;
    } else {
      utils.clearFieldError(versionInput);
    }
    
    return isValid;
  },
  
  /**
   * 验证显示设置
   * @returns {boolean} 验证是否通过
   */
  validateDisplay() {
    const backgroundType = document.getElementById('background-type');
    let isValid = true;
    
    if (backgroundType.value === 'image') {
      const backgroundImage = document.getElementById('background-image');
      
      if (!backgroundImage.value) {
        utils.showFieldError(backgroundImage, '请选择背景图片或更换背景类型');
        isValid = false;
      } else {
        utils.clearFieldError(backgroundImage);
      }
    } else if (backgroundType.value === 'color') {
      const backgroundColor = document.getElementById('background-color');
      
      if (!backgroundColor.value) {
        utils.showFieldError(backgroundColor, '请选择背景颜色');
        isValid = false;
      } else {
        utils.clearFieldError(backgroundColor);
      }
    }
    
    return isValid;
  },
  
  /**
   * 验证组件设置
   * @returns {boolean} 验证是否通过
   */
  validateComponents() {
    // 在本例中，组件设置没有必填项
    return true;
  },
  
  /**
   * 加载组件选项
   * @param {string} componentSet 组件集ID
   */
  async loadComponentOptions(componentSet) {
    try {
      utils.showLoading('正在加载组件选项...');
      
      const response = await apiService.get(`/component-sets/${componentSet}`);
      
      if (response.success) {
        const componentOptions = response.data.options || [];
        
        // 清空现有选项
        const optionsContainer = document.getElementById('component-options');
        if (optionsContainer) {
          optionsContainer.innerHTML = '';
          
          if (componentOptions.length === 0) {
            optionsContainer.innerHTML = '<div class="alert alert-info">该组件集没有可配置选项</div>';
          } else {
            // 渲染选项
            componentOptions.forEach(option => {
              const optionElement = this.createComponentOption(option);
              optionsContainer.appendChild(optionElement);
            });
            
            // 初始化新添加的颜色选择器
            this.initColorPickers();
          }
        }
      } else {
        utils.showMessage('error', '加载组件选项失败: ' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('加载组件选项时出错:', error);
      utils.showMessage('error', '加载组件选项时出错: ' + error.message);
    } finally {
      utils.hideLoading();
    }
  },
  
  /**
   * 创建组件选项元素
   * @param {Object} option 选项数据
   * @returns {HTMLElement} 选项元素
   */
  createComponentOption(option) {
    const container = document.createElement('div');
    container.className = 'form-group';
    
    // 添加标签
    const label = document.createElement('label');
    label.textContent = option.label || option.name;
    label.htmlFor = `option-${option.name}`;
    container.appendChild(label);
    
    // 根据选项类型创建不同的输入
    switch (option.type) {
      case 'color':
        container.appendChild(this.createColorInput(option));
        break;
      case 'select':
        container.appendChild(this.createSelectInput(option));
        break;
      case 'number':
        container.appendChild(this.createNumberInput(option));
        break;
      default:
        container.appendChild(this.createTextInput(option));
    }
    
    // 添加描述
    if (option.description) {
      const description = document.createElement('small');
      description.className = 'form-text text-muted';
      description.textContent = option.description;
      container.appendChild(description);
    }
    
    return container;
  },
  
  /**
   * 创建颜色输入
   * @param {Object} option 选项数据
   * @returns {HTMLElement} 输入元素
   */
  createColorInput(option) {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group color-picker-group';
    
    // 颜色选择器
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'form-control';
    colorInput.id = `option-${option.name}`;
    colorInput.name = `component[${option.name}]`;
    colorInput.value = option.default || '#ffffff';
    
    // 十六进制输入
    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.className = 'form-control';
    hexInput.id = `option-${option.name}-hex`;
    hexInput.value = option.default || '#ffffff';
    
    inputGroup.appendChild(colorInput);
    inputGroup.appendChild(hexInput);
    
    return inputGroup;
  },
  
  /**
   * 创建选择输入
   * @param {Object} option 选项数据
   * @returns {HTMLElement} 输入元素
   */
  createSelectInput(option) {
    const select = document.createElement('select');
    select.className = 'form-control';
    select.id = `option-${option.name}`;
    select.name = `component[${option.name}]`;
    
    if (option.options) {
      option.options.forEach(opt => {
        const optElement = document.createElement('option');
        optElement.value = opt.value;
        optElement.textContent = opt.label;
        
        if (opt.value === option.default) {
          optElement.selected = true;
        }
        
        select.appendChild(optElement);
      });
    }
    
    return select;
  },
  
  /**
   * 创建数字输入
   * @param {Object} option 选项数据
   * @returns {HTMLElement} 输入元素
   */
  createNumberInput(option) {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control';
    input.id = `option-${option.name}`;
    input.name = `component[${option.name}]`;
    input.value = option.default || 0;
    
    if (option.min !== undefined) {
      input.min = option.min;
    }
    
    if (option.max !== undefined) {
      input.max = option.max;
    }
    
    if (option.step !== undefined) {
      input.step = option.step;
    }
    
    return input;
  },
  
  /**
   * 创建文本输入
   * @param {Object} option 选项数据
   * @returns {HTMLElement} 输入元素
   */
  createTextInput(option) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.id = `option-${option.name}`;
    input.name = `component[${option.name}]`;
    input.value = option.default || '';
    
    if (option.placeholder) {
      input.placeholder = option.placeholder;
    }
    
    return input;
  },
  
  /**
   * 生成预览
   */
  generatePreview() {
    const previewFrame = document.getElementById('theme-preview-frame');
    const previewContainer = document.getElementById('preview-container');
    
    if (!previewFrame || !previewContainer) return;
    
    // 显示加载指示器
    previewContainer.innerHTML = '';
    utils.showLoading('正在生成预览...');
    
    // 收集表单数据
    const formData = new FormData(document.getElementById('theme-form'));
    const themeData = {};
    
    for (const [key, value] of formData.entries()) {
      // 处理嵌套属性，如 component[name]
      if (key.includes('[') && key.includes(']')) {
        const parts = key.match(/^([^\[]+)\[([^\]]+)\]$/);
        if (parts) {
          const group = parts[1];
          const property = parts[2];
          
          if (!themeData[group]) {
            themeData[group] = {};
          }
          
          themeData[group][property] = value;
        } else {
          themeData[key] = value;
        }
      } else {
        themeData[key] = value;
      }
    }
    
    try {
      // 创建预览iframe
      previewFrame.onload = () => {
        utils.hideLoading();
      };
      
      // 设置iframe源
      previewFrame.src = `preview.html?theme=${encodeURIComponent(JSON.stringify(themeData))}&timestamp=${Date.now()}`;
      previewContainer.appendChild(previewFrame);
    } catch (error) {
      console.error('生成预览时出错:', error);
      utils.showMessage('error', '生成预览时出错: ' + error.message);
      utils.hideLoading();
    }
  },
  
  /**
   * 保存主题
   */
  async saveTheme() {
    try {
      // 验证所有步骤
      for (let i = 0; i < this.steps.length - 1; i++) {
        this.currentStep = i;
        if (!this.validateCurrentStep()) {
          this.goToStep(i);
          return;
        }
      }
      
      utils.showLoading('正在保存主题...');
      
      // 收集表单数据
      const form = document.getElementById('theme-form');
      const formData = new FormData(form);
      
      // 处理文件上传
      const thumbnailFile = document.getElementById('thumbnail-upload').files[0];
      const backgroundFile = document.getElementById('background-image-upload').files[0];
      
      if (thumbnailFile) {
        formData.append('thumbnail_file', thumbnailFile);
      }
      
      if (backgroundFile && formData.get('background-type') === 'image') {
        formData.append('background_file', backgroundFile);
      }
      
      // 确定是创建还是更新
      const themeId = document.getElementById('theme-id').value;
      let response;
      
      if (themeId) {
        // 更新主题
        response = await apiService.put(`/themes/${themeId}`, formData, true);
      } else {
        // 创建主题
        response = await apiService.post('/themes', formData, true);
      }
      
      if (response.success) {
        utils.showMessage('success', themeId ? '主题已成功更新' : '主题已成功创建');
        this.formChanged = false;
        
        // 跳转到主题列表
        setTimeout(() => {
          themeUtils.returnToThemeList();
        }, 1500);
      } else {
        utils.showMessage('error', '保存主题失败: ' + (response.message || '未知错误'));
      }
    } catch (error) {
      console.error('保存主题时出错:', error);
      utils.showMessage('error', '保存主题时出错: ' + error.message);
    } finally {
      utils.hideLoading();
    }
  }
};

// 导出主题编辑器管理器
window.themeEditorManager = themeEditorManager;

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  themeEditorManager.init();
}); 