/**
 * 计算器皮肤主题管理系统 - 修复脚本
 */

document.addEventListener('DOMContentLoaded', () => {
    // 修复1: 调整颜色选择控件样式，变窄并添加颜色值输入
    applyColorInputStyles();

    // 修复2: 确保E/F/G/H类按钮与A/B/C类按钮结构一致
    setupButtonsConsistency();

    // 修复3: 实现背景颜色/图片的单选功能
    setupBackgroundOptions();

    // 修复4: 增强确认提交页面显示所有内容
    enhanceSummaryPage();

    // 修复5: 修复确认提交功能
    fixSubmitButton();
    
    // 修复6: 修复创建主题页面不显示问题
    fixCreateThemePage();
    
    // 修复7: 修复导航和按钮功能
    fixNavigationAndButtons();

    // 修复8: 修复颜色吸盘和输入框同步功能
    setupColorInputSync();

    // 修复9: 确保所有按钮皮肤默认使用图片
    setupDefaultButtonImageSetting();

    // 修复10: 修复tabbar背景透明度滑块
    setupTabbarOpacitySlider();

    // 修复图片预览功能
    initPreviewFunctions();
    
    // 修复11: 确保"保存继续"按钮正常工作
    fixStepButtons();
});

/**
 * 修复1: 调整颜色选择控件样式
 */
function applyColorInputStyles() {
    // 已通过CSS完成
    console.log('已应用颜色选择控件样式修复');
}

/**
 * 修复2: 确保按钮结构一致性
 */
function setupButtonsConsistency() {
    // 所有按钮类型
    const buttonTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

    // 确保所有按钮类型的图片/颜色互斥逻辑一致
    buttonTypes.forEach(type => {
        const useImageCheckbox = document.getElementById(`button_TYPE_${type}_use_image`);
        if (!useImageCheckbox) return;

        // 设置初始状态
        updateButtonTypeVisibility(type, useImageCheckbox.checked);

        // 绑定变更事件
        useImageCheckbox.addEventListener('change', () => {
            updateButtonTypeVisibility(type, useImageCheckbox.checked);
        });
    });

    console.log('已应用按钮结构一致性修复');
}

/**
 * 更新按钮类型的图片/颜色控件可见性
 */
function updateButtonTypeVisibility(type, useImage) {
    // 查找所有图片相关控件
    const imageFields = document.querySelectorAll(`[id^="button_TYPE_${type}_"][id$="_image"]`);
    imageFields.forEach(el => {
        if (el.id !== `button_TYPE_${type}_use_image`) { // 排除checkbox自身
            const parent = el.closest('.form-group');
            if (parent) parent.style.display = useImage ? 'block' : 'none';
        }
    });

    // 查找所有颜色相关控件
    const colorFields = document.querySelectorAll(`[id^="button_TYPE_${type}_"][id$="_color"]`);
    colorFields.forEach(el => {
        const parent = el.closest('.form-group');
        if (parent && !parent.classList.contains('checkbox-group')) {
            parent.style.display = useImage ? 'none' : 'block';
        }
    });
}

/**
 * 修复3: 实现背景颜色/图片的单选功能
 */
function setupBackgroundOptions() {
    // 全局背景设置
    setupBackgroundOptionPair(
        'global_bg_color_option', 
        'global_bg_image_option',
        'global_bg_color_group',
        'global_bg_image_group',
        'has_global_background_image'
    );

    // 结果区域背景设置
    setupBackgroundOptionPair(
        'result_bg_color_option',
        'result_bg_image_option',
        'result_bg_color_group',
        'result_bg_image_group',
        'result_use_image'
    );

    // TabBar背景设置
    setupBackgroundOptionPair(
        'tabbar_bg_color_option',
        'tabbar_bg_image_option',
        'tabbar_bg_color_group',
        'tabbar_bg_image_group',
        'tabbar_use_background_image'
    );

    console.log('已应用背景选项单选修复');
}

/**
 * 设置背景选项的单选对
 */
function setupBackgroundOptionPair(colorOptionId, imageOptionId, colorGroupId, imageGroupId, flagFieldId) {
    const colorOption = document.getElementById(colorOptionId);
    const imageOption = document.getElementById(imageOptionId);
    const colorGroup = document.getElementById(colorGroupId);
    const imageGroup = document.getElementById(imageGroupId);
    const flagField = document.getElementById(flagFieldId);

    if (!colorOption || !imageOption || !colorGroup || !imageGroup || !flagField) return;

    // 设置初始状态
    updateBackgroundOptionVisibility(
        colorOption.checked,
        colorGroup,
        imageGroup,
        flagField
    );

    // 绑定颜色选项变更事件
    colorOption.addEventListener('change', () => {
        if (colorOption.checked) {
            updateBackgroundOptionVisibility(true, colorGroup, imageGroup, flagField);
        }
    });

    // 绑定图片选项变更事件
    imageOption.addEventListener('change', () => {
        if (imageOption.checked) {
            updateBackgroundOptionVisibility(false, colorGroup, imageGroup, flagField);
        }
    });
}

/**
 * 更新背景选项可见性
 */
function updateBackgroundOptionVisibility(useColor, colorGroup, imageGroup, flagField) {
    colorGroup.style.display = useColor ? 'block' : 'none';
    imageGroup.style.display = useColor ? 'none' : 'block';
    flagField.value = useColor ? 'false' : 'true';
}

/**
 * 修复4: 增强确认提交页面显示所有内容
 */
function enhanceSummaryPage() {
    // 找到所有步骤按钮
    const stepLinks = document.querySelectorAll('.step-link');
    const summaryStepLink = document.querySelector('.step-link[data-step="summary-step"]');

    if (!summaryStepLink) return;

    // 重新绑定摘要步骤点击事件，确保显示完整内容
    summaryStepLink.addEventListener('click', updateSummaryContent);

    // 同样为下一步按钮添加事件
    const tabbarToSummaryBtn = document.querySelector('.next-step[data-next="summary-step"]');
    if (tabbarToSummaryBtn) {
        const originalClickHandler = tabbarToSummaryBtn.onclick;
        tabbarToSummaryBtn.addEventListener('click', () => {
            // 在步骤切换后更新摘要内容
            setTimeout(updateSummaryContent, 100);
        });
    }

    console.log('已应用确认提交页面增强');
}

/**
 * 更新摘要内容，确保显示所有设置项
 */
function updateSummaryContent() {
    try {
        // 基本信息
        updateSummaryField('skin_name', 'summary-skin-name');
        updateSummaryField('version', 'summary-version');
        updateSummaryCheckbox('is_paid', 'summary-is-paid', '付费', '免费');

        // 全局设置
        const hasGlobalBgImage = document.getElementById('global_bg_image_option').checked;
        document.getElementById('summary-global-bg-type').textContent = hasGlobalBgImage ? '使用背景图片' : '使用背景颜色';
        
        document.getElementById('summary-global-bg-color-item').style.display = hasGlobalBgImage ? 'none' : 'flex';
        document.getElementById('summary-global-bg-image-item').style.display = hasGlobalBgImage ? 'flex' : 'none';
        
        updateSummaryColorField('global_background_color', 'summary-global-bg-color');
        updateSummaryImageField('global-background-preview', 'summary-global-bg-image');
        updateSummaryCheckbox('use_system_font', 'summary-use-system-font', '是', '否');

        // 顶部导航区
        updateSummaryColorField('top_nav_selected_color', 'summary-top-nav-selected-color');
        updateSummaryColorField('top_nav_unselected_color', 'summary-top-nav-unselected-color');
        updateSummaryColorField('top_nav_text_selected_color', 'summary-top-nav-text-selected-color');
        updateSummaryColorField('top_nav_text_unselected_color', 'summary-top-nav-text-unselected-color');

        // 计算结果区设置
        const hasResultBgImage = document.getElementById('result_bg_image_option').checked;
        document.getElementById('summary-result-bg-type').textContent = hasResultBgImage ? '使用背景图片' : '使用背景颜色';
        
        document.getElementById('summary-result-bg-color-item').style.display = hasResultBgImage ? 'none' : 'flex';
        document.getElementById('summary-result-bg-image-item').style.display = hasResultBgImage ? 'flex' : 'none';
        
        updateSummaryColorField('result_background_color', 'summary-result-bg-color');
        updateSummaryImageField('result-background-preview', 'summary-result-bg-image');
        updateSummaryColorField('result_font_color', 'summary-result-font-color');
        updateSummaryField('result_font_size', 'summary-result-font-size', value => value + 'px');

        // 按钮类型设置 - 增强显示
        updateButtonSummaryEnhanced();

        // TabBar设置
        const hasTabbarBgImage = document.getElementById('tabbar_bg_image_option').checked;
        document.getElementById('summary-tabbar-bg-type').textContent = hasTabbarBgImage ? '使用背景图片' : '使用背景颜色';
        
        document.getElementById('summary-tabbar-bg-color-item').style.display = hasTabbarBgImage ? 'none' : 'flex';
        document.getElementById('summary-tabbar-bg-image-item').style.display = hasTabbarBgImage ? 'flex' : 'none';
        
        updateSummaryColorField('tabbar_background_color', 'summary-tabbar-bg-color');
        updateSummaryImageField('tabbar-background-preview', 'summary-tabbar-bg-image');
        updateSummaryField('tabbar_opacity', 'summary-tabbar-opacity');
        updateSummaryField('tabbar_font_size', 'summary-tabbar-font-size', value => value + 'px');
        updateSummaryColorField('tabbar_selected_font_color', 'summary-tabbar-selected-font-color');
        updateSummaryColorField('tabbar_unselected_font_color', 'summary-tabbar-unselected-font-color');
        
        // TabBar图标设置 - 增强显示
        updateTabbarIconsSettingsEnhanced();
    } catch (error) {
        console.error('更新摘要内容失败:', error);
    }
}

/**
 * 更新摘要中的文本字段
 */
function updateSummaryField(sourceId, targetId, transform = value => value) {
    const sourceElem = document.getElementById(sourceId);
    const targetElem = document.getElementById(targetId);
    
    if (sourceElem && targetElem) {
        const value = sourceElem.value || '未设置';
        targetElem.textContent = transform(value);
    }
}

/**
 * 更新摘要中的复选框字段
 */
function updateSummaryCheckbox(sourceId, targetId, checkedText, uncheckedText) {
    const sourceElem = document.getElementById(sourceId);
    const targetElem = document.getElementById(targetId);
    
    if (sourceElem && targetElem) {
        targetElem.textContent = sourceElem.checked ? checkedText : uncheckedText;
    }
}

/**
 * 更新摘要中的颜色字段
 */
function updateSummaryColorField(sourceId, targetId) {
    const sourceElem = document.getElementById(sourceId);
    const targetElem = document.getElementById(targetId);
    
    if (sourceElem && targetElem) {
        const color = sourceElem.value || '#FFFFFF';
        targetElem.textContent = color;
        targetElem.style.backgroundColor = color;
    }
}

/**
 * 更新摘要中的图片字段
 */
function updateSummaryImageField(sourceId, targetId) {
    const sourceElem = document.getElementById(sourceId);
    const targetElem = document.getElementById(targetId);
    
    if (sourceElem && targetElem) {
        if (sourceElem.src && sourceElem.style.display !== 'none') {
            targetElem.src = sourceElem.src;
            targetElem.style.display = 'block';
        } else {
            targetElem.style.display = 'none';
        }
    }
}

/**
 * 增强按钮设置摘要显示
 */
function updateButtonSummaryEnhanced() {
    const buttonTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const buttonContainer = document.getElementById('summary-button-settings');
    
    if (!buttonContainer) return;
    
    // 清空现有内容
    buttonContainer.innerHTML = '';
    
    for (const type of buttonTypes) {
        // 创建按钮类型容器
        const buttonSection = document.createElement('div');
        buttonSection.className = 'summary-section';
        buttonSection.innerHTML = `<h4>类型${type}按钮设置</h4>`;
        
        // 获取是否使用图片
        const useImage = document.getElementById(`button_TYPE_${type}_use_image`).checked;
        
        // 创建内容容器
        const content = document.createElement('div');
        content.className = 'summary-content';
        
        // 添加使用图片标志
        content.innerHTML += `
            <div class="summary-item">
                <div class="summary-label">使用图片:</div>
                <div class="summary-value">${useImage ? '是' : '否'}</div>
            </div>
        `;
        
        if (useImage) {
            // 添加图片预览
            content.innerHTML += `
                <div class="summary-item">
                    <div class="summary-label">按下状态图片:</div>
                    <div class="summary-value">
                        <img src="${getImagePreviewURL(`button-${type.toLowerCase()}-pressed-preview`)}" class="preview-image">
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">释放状态图片:</div>
                    <div class="summary-value">
                        <img src="${getImagePreviewURL(`button-${type.toLowerCase()}-released-preview`)}" class="preview-image">
                    </div>
                </div>
            `;
        } else {
            // 添加颜色显示
            const pressedColor = document.getElementById(`button_TYPE_${type}_pressed_color`).value;
            const releasedColor = document.getElementById(`button_TYPE_${type}_released_color`).value;
            
            content.innerHTML += `
                <div class="summary-item">
                    <div class="summary-label">按下状态颜色:</div>
                    <div class="summary-value">
                        <span class="color-preview" style="background-color: ${pressedColor}"></span>
                        ${pressedColor}
                    </div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">释放状态颜色:</div>
                    <div class="summary-value">
                        <span class="color-preview" style="background-color: ${releasedColor}"></span>
                        ${releasedColor}
                    </div>
                </div>
            `;
        }
        
        // 添加字体设置
        const fontColor = document.getElementById(`button_TYPE_${type}_font_color`).value;
        const fontSize = document.getElementById(`button_TYPE_${type}_font_size`).value;
        
        content.innerHTML += `
            <div class="summary-item">
                <div class="summary-label">字体颜色:</div>
                <div class="summary-value">
                    <span class="color-preview" style="background-color: ${fontColor}"></span>
                    ${fontColor}
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-label">字体大小:</div>
                <div class="summary-value">${fontSize}px</div>
            </div>
        `;
        
        // 添加音效信息
        const audioElement = document.getElementById(`sound-${type.toLowerCase()}-preview`);
        const hasSound = audioElement && audioElement.src && !audioElement.src.endsWith('#');
        
        content.innerHTML += `
            <div class="summary-item">
                <div class="summary-label">按钮音效:</div>
                <div class="summary-value">${hasSound ? '已设置' : '未设置'}</div>
            </div>
        `;
        
        // 将内容添加到按钮部分
        buttonSection.appendChild(content);
        
        // 将按钮部分添加到容器
        buttonContainer.appendChild(buttonSection);
    }
}

/**
 * 增强TabBar图标设置摘要显示
 */
function updateTabbarIconsSettingsEnhanced() {
    const iconsContainer = document.getElementById('summary-tabbar-icons');
    if (!iconsContainer) return;
    
    // 清空现有内容
    iconsContainer.innerHTML = '';
    
    // TabBar图标类型
    const tabbarIcons = [
        { name: 'home', label: '首页' },
        { name: 'camera', label: '相机' },
        { name: 'voice', label: '语音' },
        { name: 'theme', label: '主题' },
        { name: 'profile', label: '个人' }
    ];
    
    for (const icon of tabbarIcons) {
        // 创建图标容器
        const iconSection = document.createElement('div');
        iconSection.className = 'summary-tabbar-icon';
        
        // 获取选中和未选中图标的图片预览
        const selectedPreview = document.getElementById(`tabbar-${icon.name}-selected-preview`);
        const unselectedPreview = document.getElementById(`tabbar-${icon.name}-unselected-preview`);
        
        const hasSelected = selectedPreview && selectedPreview.src && !selectedPreview.src.endsWith('#');
        const hasUnselected = unselectedPreview && unselectedPreview.src && !unselectedPreview.src.endsWith('#');
        
        iconSection.innerHTML = `
            <h5>${icon.label}图标</h5>
            <div class="summary-item">
                <div class="summary-label">选中状态:</div>
                <div class="summary-value">
                    ${hasSelected ? 
                      `<img src="${selectedPreview.src}" class="preview-image small-preview">` : 
                      '未设置'}
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-label">未选中状态:</div>
                <div class="summary-value">
                    ${hasUnselected ? 
                      `<img src="${unselectedPreview.src}" class="preview-image small-preview">` : 
                      '未设置'}
                </div>
            </div>
        `;
        
        // 添加到容器
        iconsContainer.appendChild(iconSection);
    }
}

/**
 * 获取图片预览URL
 */
function getImagePreviewURL(previewId) {
    const preview = document.getElementById(previewId);
    return (preview && preview.src && !preview.src.endsWith('#')) ? 
        preview.src : 'images/no-image.png';
}

/**
 * 修复5: 修复确认提交功能
 */
function fixSubmitButton() {
    // 编辑页面的提交按钮
    const editSubmitButton = document.getElementById('edit-submit-button');
    if (editSubmitButton) {
        console.log('找到编辑页面的提交按钮，绑定事件');
        editSubmitButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('编辑页面确认提交按钮被点击');
            
            // 直接使用API调用而不是表单提交
            const themeId = document.getElementById('theme-id').value;
            if (!themeId) {
                showErrorMessage('未找到主题ID');
                return;
            }
            
            const formData = new FormData(document.getElementById('theme-edit-form'));
            updateThemeDirectly(themeId, formData);
        });
    }
    
    // 创建页面的提交按钮
    const createSubmitButton = document.getElementById('submit-theme-button');
    if (createSubmitButton) {
        console.log('找到创建页面的提交按钮，绑定事件');
        createSubmitButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('创建页面确认提交按钮被点击');
            
            const formData = new FormData(document.getElementById('theme-creation-form'));
            createThemeDirectly(formData);
        });
    }
    
    console.log('已应用提交按钮修复');
}

// 直接调用API更新主题
async function updateThemeDirectly(themeId, formData) {
    // 防止重复提交
    const submitButton = document.getElementById('edit-submit-button');
    if (submitButton.disabled) {
        console.log('提交按钮已禁用，正在处理上一次提交...');
        return;
    }
    
    // 禁用提交按钮，防止重复提交
    submitButton.disabled = true;
    submitButton.textContent = '提交中...';
    
    try {
        console.log('直接调用API更新主题', themeId);
        
        // 显示加载指示器
        document.getElementById('loading-indicator').style.display = 'block';
        
        // 规范化字段名（如果有FieldNormalizer可用）
        let processedFormData;
        if (window.FieldNormalizer) {
            console.log('使用FieldNormalizer规范化字段...');
            processedFormData = window.FieldNormalizer.normalizeFormData(formData);
        } else {
            console.log('未找到FieldNormalizer，使用原始表单数据');
            processedFormData = formData;
        }
        
        // 使用正确的API端点和完整URL
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('未登录或认证令牌缺失，请重新登录');
        }
        
        // 通过本地代理发送请求
        const response = await fetch('/api/skin/update', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: processedFormData,
            credentials: 'include',  // 改为 include 以传递凭证
            mode: 'cors'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`服务器响应错误: ${response.status} ${errorData.message || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('更新主题成功:', result);
        
        // 显示成功消息
        showSuccessMessage('主题更新成功！');
        
        // 跳转到查看页面
        setTimeout(() => {
            window.location.href = `detail.html?id=${themeId}`;
        }, 1500);
    } catch (error) {
        console.error('更新主题失败:', error);
        showErrorMessage(`更新主题失败: ${error.message}`);
        
        // 重新启用提交按钮
        submitButton.disabled = false;
        submitButton.textContent = '确认提交';
    } finally {
        // 隐藏加载指示器
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// 直接调用API创建主题
async function createThemeDirectly(formData) {
    // 防止重复提交
    const submitButton = document.getElementById('submit-theme-button');
    if (submitButton.disabled) {
        console.log('提交按钮已禁用，正在处理上一次提交...');
        return;
    }
    
    // 禁用提交按钮，防止重复提交
    submitButton.disabled = true;
    submitButton.textContent = '提交中...';
    
    try {
        console.log('直接调用API创建主题');
        
        // 显示加载指示器
        document.getElementById('loading-indicator').style.display = 'block';
        
        // 规范化字段名（如果有FieldNormalizer可用）
        let processedFormData;
        if (window.FieldNormalizer) {
            console.log('使用FieldNormalizer规范化字段...');
            processedFormData = window.FieldNormalizer.normalizeFormData(formData);
        } else {
            console.log('未找到FieldNormalizer，使用原始表单数据');
            processedFormData = formData;
        }
        
        // 使用正确的API端点和完整URL
        const token = localStorage.getItem('auth_token');
        if (!token) {
            throw new Error('未登录或认证令牌缺失，请重新登录');
        }
        
        // 通过本地代理发送请求
        const response = await fetch('/api/skin/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: processedFormData,
            credentials: 'include',  // 改为 include 以传递凭证
            mode: 'cors'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`服务器响应错误: ${response.status} ${errorData.message || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('创建主题成功:', result);
        
        // 显示成功消息
        showSuccessMessage('主题创建成功！');
        
        // 重定向到主题列表页面
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } catch (error) {
        console.error('创建主题失败:', error);
        showErrorMessage(`创建主题失败: ${error.message}`);
        
        // 重新启用提交按钮
        submitButton.disabled = false;
        submitButton.textContent = '确认提交';
    } finally {
        // 隐藏加载指示器
        document.getElementById('loading-indicator').style.display = 'none';
    }
}

// 显示错误消息
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

// 显示成功消息
function showSuccessMessage(message) {
    const messageElement = document.getElementById('message');
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = 'message success';
    messageElement.style.display = 'block';
    
    // 5秒后隐藏消息
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

/**
 * 修复6: 修复创建主题页面不显示问题
 */
function fixCreateThemePage() {
    // 在页面加载后执行延迟检查
    setTimeout(() => {
        console.log('检查主题创建页面显示状态');
        
        // 修复主题管理导航按钮
        const themeListLink = document.querySelector('.nav-link[data-target="theme-list-page"]');
        if (themeListLink) {
            themeListLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('主题管理按钮被点击');
                
                // 重定向到index.html
                window.location.href = 'index.html';
            });
        }
        
        // 检查新主题按钮
        const newThemeButton = document.getElementById('new-theme-button');
        if (newThemeButton) {
            // 重新绑定点击事件
            newThemeButton.addEventListener('click', () => {
                console.log('新主题按钮被点击');
                
                // 重定向到create.html
                window.location.href = 'create.html';
            });
        }
        
        // 修复导航链接
        const themeCreateLink = document.getElementById('theme-create-link');
        if (themeCreateLink) {
            themeCreateLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                console.log('主题创建链接被点击');
                
                // 重定向到create.html
                window.location.href = 'create.html';
            });
        }
        
        console.log('主题创建页面修复已应用');
    }, 500);
}

/**
 * 修复7: 修复导航和按钮功能
 */
function fixNavigationAndButtons() {
    // 修复左侧导航栏与右侧内容联动
    const submenuItems = document.querySelectorAll('#theme-create-submenu .submenu-link');
    const stepLinks = document.querySelectorAll('.step-link');
    
    // 为左侧导航项添加点击事件，确保与右侧步骤联动
    submenuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标步骤ID
            const targetStep = this.getAttribute('data-step');
            
            // 移除所有活动状态
            submenuItems.forEach(i => i.classList.remove('active'));
            stepLinks.forEach(l => l.classList.remove('active'));
            
            // 添加活动状态到当前项
            this.classList.add('active');
            
            // 为对应的步骤导航添加活动状态
            stepLinks.forEach(link => {
                if (link.getAttribute('data-step') === targetStep) {
                    link.classList.add('active');
                }
            });
            
            // 显示对应的内容区域
            showStepSafely(targetStep);
            
            // 滚动到内容区域顶部
            document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // 反向联动：当点击步骤导航时，更新左侧导航状态
    stepLinks.forEach(link => {
        link.addEventListener('click', function() {
            const targetStep = this.getAttribute('data-step');
            
            // 更新左侧导航状态
            submenuItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-step') === targetStep) {
                    item.classList.add('active');
                }
            });
        });
    });
    
    // 修改按钮类型设置显示方式 - 全部展开，依次往下排列
    setupButtonsDisplay();
    
    // 修复下一步按钮
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', function() {
            const nextStep = this.getAttribute('data-next');
            if (!nextStep) return;
            
            try {
                showStepSafely(nextStep);
            } catch (e) {
                console.error('切换到下一步失败:', e);
            }
        });
    });
    
    // 修复上一步按钮
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = this.getAttribute('data-prev');
            if (!prevStep) return;
            
            try {
                showStepSafely(prevStep);
            } catch (e) {
                console.error('切换到上一步失败:', e);
            }
        });
    });
    
    // 修复步骤工具
    setupStepTools();
    
    console.log('已应用导航和按钮功能修复');
}

// 我们自己的showStep实现
window.ourShowStep = function(stepId) {
    console.log('调用我们的showStep:', stepId);
    
    // 隐藏所有步骤内容
    document.querySelectorAll('.step-content').forEach(step => {
        step.classList.remove('active');
    });
    
    // 显示目标步骤内容
    const targetStep = document.getElementById(stepId);
    if (targetStep) {
        targetStep.classList.add('active');
    } else {
        console.warn(`未找到步骤内容: #${stepId}`);
        return;
    }
    
    // 更新步骤导航状态
    document.querySelectorAll('.step-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-step') === stepId) {
            link.classList.add('active');
        }
    });
    
    // 安全地更新子菜单链接状态
    try {
        const currentPage = getCurrentPage();
        const submenuSelector = currentPage === 'create' ? '#theme-create-submenu' : '#theme-edit-submenu';
        const submenu = document.querySelector(submenuSelector);
        
        // 只有当子菜单存在时才尝试更新
        if (submenu) {
            const submenuLinks = submenu.querySelectorAll('.submenu-link');
            submenuLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-step') === stepId) {
                    link.classList.add('active');
                }
            });
        }
    } catch (e) {
        console.log('子菜单不存在或无法更新:', e);
    }
    
    console.log(`已切换到步骤: ${stepId}`);
}

// 全局步骤切换函数，用于安全地切换表单步骤
window.showStepSafely = function(stepId) {
    if (!stepId) {
        console.error('showStepSafely: 提供的stepId为空');
        return;
    }
    
    try {
        console.log(`[全局] 正在切换到步骤: ${stepId}`);
        
        // 确认目标步骤元素存在
        const targetStep = document.getElementById(stepId);
        if (!targetStep) {
            console.error(`步骤元素不存在: #${stepId}`);
            return;
        }
        
        // 隐藏所有步骤内容
        document.querySelectorAll('.step-content').forEach(step => {
            step.classList.remove('active');
        });
        
        // 显示目标步骤
        targetStep.classList.add('active');
        
        // 更新步骤导航状态
        document.querySelectorAll('.step-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-step') === stepId) {
                link.classList.add('active');
            }
        });
        
        // 更新子菜单状态
        document.querySelectorAll('.submenu-item').forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector(`.submenu-link[data-step="${stepId}"]`);
            if (link) {
                item.classList.add('active');
            }
        });
        
        // 滚动到页面顶部
        window.scrollTo(0, 0);
        
        console.log(`[全局] 已成功切换到步骤: ${stepId}`);
    } catch (error) {
        console.error(`切换到步骤 ${stepId} 时出错:`, error);
    }
};

// 替换为我们的showStep函数
window.showStep = window.ourShowStep;

// 获取当前页面类型
function getCurrentPage() {
    if (window.location.pathname.includes('create.html')) {
        return 'create';
    } else if (window.location.pathname.includes('edit.html')) {
        return 'edit';
    }
    return 'unknown';
}

// 设置步骤工具
function setupStepTools() {
    try {
        // 绑定创建主题表单的提交事件
        const createForm = document.getElementById('theme-creation-form');
        if (createForm) {
            createForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const submitButton = document.getElementById('submit-theme-button');
                if (submitButton) {
                    submitButton.click(); // 手动触发按钮点击
                }
            });
        }
        
        // 绑定编辑主题表单的提交事件
        const editForm = document.getElementById('theme-edit-form');
        if (editForm) {
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const submitButton = document.getElementById('edit-submit-button');
                if (submitButton) {
                    submitButton.click(); // 手动触发按钮点击
                }
            });
        }
    } catch (error) {
        console.error('设置步骤工具时出错:', error);
    }
}

/**
 * 修复8: 颜色吸盘和输入框同步功能
 */
function setupColorInputSync() {
    // 查找所有颜色输入组
    const colorGroups = document.querySelectorAll('.color-input-group');
    
    colorGroups.forEach(group => {
        const colorPicker = group.querySelector('input[type="color"]');
        const textInput = group.querySelector('input[type="text"]');
        
        if (!colorPicker || !textInput) return;
        
        // 初始同步颜色值到文本输入框
        textInput.value = colorPicker.value;
        
        // 当颜色选择器变化时，更新文本输入框
        colorPicker.addEventListener('input', () => {
            textInput.value = colorPicker.value.toUpperCase();
        });
        
        // 当文本输入框变化时，更新颜色选择器
        textInput.addEventListener('input', () => {
            // 确保格式正确
            let color = textInput.value;
            if (color.startsWith('#') && (color.length === 4 || color.length === 7)) {
                colorPicker.value = color;
            } else if (!color.startsWith('#') && (color.length === 3 || color.length === 6)) {
                // 自动添加井号
                color = '#' + color;
                textInput.value = color.toUpperCase();
                colorPicker.value = color;
            }
        });
        
        // 当文本输入框失去焦点时，确保格式正确
        textInput.addEventListener('blur', () => {
            let color = textInput.value;
            
            // 如果为空，使用当前颜色选择器的值
            if (!color) {
                textInput.value = colorPicker.value.toUpperCase();
                return;
            }
            
            // 确保有#前缀
            if (!color.startsWith('#')) {
                color = '#' + color;
            }
            
            // 验证颜色格式
            const isValidColor = /^#([0-9A-F]{3}){1,2}$/i.test(color);
            
            if (isValidColor) {
                // 格式化为大写
                textInput.value = color.toUpperCase();
                colorPicker.value = color;
            } else {
                // 恢复为色彩选择器的值
                textInput.value = colorPicker.value.toUpperCase();
            }
        });
    });
}

/**
 * 修复9: 确保所有按钮皮肤默认使用图片
 */
function setupDefaultButtonImageSetting() {
    // 所有按钮类型
    const buttonTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    
    buttonTypes.forEach(type => {
        const useImageCheckbox = document.getElementById(`button_TYPE_${type}_use_image`);
        if (useImageCheckbox) {
            // 设置为选中状态
            useImageCheckbox.checked = true;
            
            // 触发一次change事件，确保相关UI也正确更新
            useImageCheckbox.dispatchEvent(new Event('change'));
            
            // 更新按钮类型的可见性
            if (typeof updateButtonTypeVisibility === 'function') {
                updateButtonTypeVisibility(type, true);
            }
        }
    });
    
    console.log('已设置按钮默认使用图片');
}

/**
 * 修复10: 修复tabbar背景透明度滑块
 */
function setupTabbarOpacitySlider() {
    const slider = document.getElementById('tabbar_opacity');
    const valueDisplay = document.getElementById('tabbar_opacity_value');
    
    if (!slider || !valueDisplay) return;
    
    // 确保初始值正确显示
    valueDisplay.textContent = slider.value;
    
    // 绑定输入事件，实时更新显示值
    slider.addEventListener('input', function() {
        valueDisplay.textContent = this.value;
    });
    
    // 绑定change事件，确保离开滑块后值也会更新
    slider.addEventListener('change', function() {
        valueDisplay.textContent = this.value;
    });
    
    console.log('已修复tabbar背景透明度滑块联动');
}

/**
 * 修复图片预览功能
 */
function initPreviewFunctions() {
    setupImagePreview('detail_image', 'detail-image-preview');
    setupImagePreview('global_background_image', 'global-background-preview');
    setupImagePreview('result_background_image', 'result-background-preview');
    setupImagePreview('tabbar_background_image', 'tabbar-background-preview');
    
    // 设置按钮图片预览
    const buttonTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    buttonTypes.forEach(type => {
        setupImagePreview(`button_TYPE_${type}_pressed_image`, `button-${type.toLowerCase()}-pressed-preview`);
        setupImagePreview(`button_TYPE_${type}_released_image`, `button-${type.toLowerCase()}-released-preview`);
    });
    
    // 设置TabBar图标预览
    setupImagePreview('tabbar_home_selected', 'tabbar-home-selected-preview');
    setupImagePreview('tabbar_home_unselected', 'tabbar-home-unselected-preview');
    setupImagePreview('tabbar_camera_selected', 'tabbar-camera-selected-preview');
    setupImagePreview('tabbar_camera_unselected', 'tabbar-camera-unselected-preview');
    setupImagePreview('tabbar_voice_selected', 'tabbar-voice-selected-preview');
    setupImagePreview('tabbar_voice_unselected', 'tabbar-voice-unselected-preview');
    setupImagePreview('tabbar_theme_selected', 'tabbar-theme-selected-preview');
    setupImagePreview('tabbar_theme_unselected', 'tabbar-theme-unselected-preview');
    setupImagePreview('tabbar_profile_selected', 'tabbar-profile-selected-preview');
    setupImagePreview('tabbar_profile_unselected', 'tabbar-profile-unselected-preview');
    
    console.log('已应用图片预览功能');
}

/**
 * 设置图片预览
 */
function setupImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) return;
    
    // 检查是否已经设置了事件处理程序
    if (input.dataset.previewHandlerSet === 'true') return;
    
    input.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    
    // 标记已设置事件处理程序
    input.dataset.previewHandlerSet = 'true';
}

/**
 * 设置按钮类型显示方式 - 全部展开
 */
function setupButtonsDisplay() {
    // 查找按钮类型导航和设置区域
    const buttonTypeLinks = document.querySelectorAll('.button-type-link');
    const buttonTypeSettings = document.querySelectorAll('.button-type-settings');
    
    // 移除默认的隐藏样式
    buttonTypeSettings.forEach(setting => {
        setting.style.display = 'block';
    });
    
    // 修改按钮类型导航点击行为，改为滚动到对应位置而不是切换显示/隐藏
    buttonTypeLinks.forEach(link => {
        // 移除原有点击事件
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // 添加新的点击事件 - 滚动到对应位置
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有链接的活动状态
            buttonTypeLinks.forEach(l => l.classList.remove('active'));
            
            // 添加活动状态到当前链接
            this.classList.add('active');
            
            // 获取目标设置区域ID
            const targetId = this.getAttribute('data-button-type') + '-settings';
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // 滚动到目标位置，略微上方一点以便阅读
                const offset = 20;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // 添加设置区域之间的视觉分隔，使其更易区分
    buttonTypeSettings.forEach(setting => {
        setting.style.marginBottom = '40px';
        setting.style.paddingBottom = '30px';
        setting.style.borderBottom = '1px dashed #ccc';
    });
    
    console.log('已修改按钮类型设置为全部展开模式');
}

/**
 * 修复11: 确保"保存继续"按钮正常工作
 */
function fixStepButtons() {
    console.log('重新绑定所有步骤按钮事件...');
    
    // 修复下一步/"保存继续"按钮
    document.querySelectorAll('.next-step').forEach(button => {
        // 克隆按钮以清除旧的事件监听器
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // 给新按钮添加事件监听器
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            const nextStep = this.getAttribute('data-next');
            console.log('下一步按钮被点击，目标：', nextStep);
            
            if (nextStep) {
                // 直接调用全局showStepSafely函数
                window.showStepSafely(nextStep);
            }
        });
    });
    
    // 修复上一步按钮
    document.querySelectorAll('.prev-step').forEach(button => {
        // 克隆按钮以清除旧的事件监听器
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // 给新按钮添加事件监听器
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            const prevStep = this.getAttribute('data-prev');
            console.log('上一步按钮被点击，目标：', prevStep);
            
            if (prevStep) {
                // 直接调用全局showStepSafely函数
                window.showStepSafely(prevStep);
            }
        });
    });
    
    // 修复步骤导航链接
    document.querySelectorAll('.step-link').forEach(link => {
        // 克隆链接以清除旧的事件监听器
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // 给新链接添加事件监听器
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            const targetStep = this.getAttribute('data-step');
            console.log('步骤链接被点击，目标：', targetStep);
            
            if (targetStep) {
                // 直接调用全局showStepSafely函数
                window.showStepSafely(targetStep);
            }
        });
    });
    
    // 修复子菜单链接
    document.querySelectorAll('.submenu-link').forEach(link => {
        // 克隆链接以清除旧的事件监听器
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);
        
        // 给新链接添加事件监听器
        newLink.addEventListener('click', function(e) {
            e.preventDefault();
            const targetStep = this.getAttribute('data-step');
            console.log('子菜单链接被点击，目标：', targetStep);
            
            if (targetStep) {
                // 直接调用全局showStepSafely函数
                window.showStepSafely(targetStep);
            }
        });
    });
    
    console.log('已重新绑定所有步骤按钮事件');
} 