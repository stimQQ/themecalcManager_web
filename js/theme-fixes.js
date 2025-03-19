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

    // 修复图片预览功能
    initPreviewFunctions();
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

        // 按钮类型设置
        updateButtonTypesSettings();

        // TabBar设置
        const hasTabbarBgImage = document.getElementById('tabbar_bg_image_option').checked;
        document.getElementById('summary-tabbar-bg-type').textContent = hasTabbarBgImage ? '使用背景图片' : '使用背景颜色';
        
        document.getElementById('summary-tabbar-bg-color-item').style.display = hasTabbarBgImage ? 'none' : 'flex';
        document.getElementById('summary-tabbar-bg-image-item').style.display = hasTabbarBgImage ? 'flex' : 'none';
        
        updateSummaryColorField('tabbar_background_color', 'summary-tabbar-bg-color');
        updateSummaryImageField('tabbar-background-preview', 'summary-tabbar-bg-image');
        updateSummaryField('tabbar_opacity', 'summary-tabbar-opacity');
        updateSummaryColorField('tabbar_font_color', 'summary-tabbar-font-color');
        updateSummaryField('tabbar_font_size', 'summary-tabbar-font-size', value => value + 'px');
        
        // TabBar图标设置
        updateTabbarIconsSettings();
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
 * 更新按钮类型设置摘要
 */
function updateButtonTypesSettings() {
    const buttonTypesList = document.getElementById('summary-button-types-list');
    const buttonTypesDetails = document.getElementById('summary-button-types-details');
    
    if (!buttonTypesList || !buttonTypesDetails) return;
    
    buttonTypesList.innerHTML = '';
    buttonTypesDetails.innerHTML = '';
    
    const buttonTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    const buttonTypeDesc = {
        'A': '功能按钮(AC, ±, %)',
        'B': '运算符按钮(÷, ×, -, +)',
        'C': '数字按钮(0-9, .)',
        'D': '等号按钮(=)',
        'E': '科学功能按钮',
        'F': '科学计算器功能按钮',
        'G': '科学计算器运算符按钮',
        'H': '科学计算器数字按钮',
        'I': '科学计算器等号按钮'
    };
    
    buttonTypes.forEach(type => {
        const useImageCheckbox = document.getElementById(`button_TYPE_${type}_use_image`);
        
        if (useImageCheckbox) {
            // 为列表添加简短描述
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${type}类 - ${buttonTypeDesc[type]}</strong>`;
            buttonTypesList.appendChild(listItem);
            
            // 为详情部分添加详细描述
            const detailSection = document.createElement('div');
            detailSection.className = 'button-type-detail';
            detailSection.innerHTML = `<h5>${type}类 - ${buttonTypeDesc[type]}</h5>`;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'button-type-detail-content';
            
            if (useImageCheckbox.checked) {
                // 使用图片模式
                contentDiv.innerHTML += `<p><strong>模式:</strong> 使用图片</p>`;
                
                // 获取图片预览
                const pressedPreview = document.getElementById(`button-${type.toLowerCase()}-pressed-preview`);
                const releasedPreview = document.getElementById(`button-${type.toLowerCase()}-released-preview`);
                
                if (pressedPreview && pressedPreview.src) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'button-image-preview';
                    imgContainer.innerHTML = `
                        <p><strong>按下状态图片:</strong></p>
                        <img src="${pressedPreview.src}" style="max-width: 100px; max-height: 100px;">
                    `;
                    contentDiv.appendChild(imgContainer);
                }
                
                if (releasedPreview && releasedPreview.src) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'button-image-preview';
                    imgContainer.innerHTML = `
                        <p><strong>释放状态图片:</strong></p>
                        <img src="${releasedPreview.src}" style="max-width: 100px; max-height: 100px;">
                    `;
                    contentDiv.appendChild(imgContainer);
                }
            } else {
                // 使用颜色模式
                const pressedColor = document.getElementById(`button_TYPE_${type}_pressed_color`).value;
                const releasedColor = document.getElementById(`button_TYPE_${type}_released_color`).value;
                const fontColor = document.getElementById(`button_TYPE_${type}_font_color`).value;
                const fontSize = document.getElementById(`button_TYPE_${type}_font_size`).value;
                
                contentDiv.innerHTML += `
                    <p><strong>模式:</strong> 使用颜色</p>
                    <p><strong>按下状态颜色:</strong> <span style="display:inline-block; width:20px; height:20px; background-color:${pressedColor}; vertical-align:middle;"></span> ${pressedColor}</p>
                    <p><strong>释放状态颜色:</strong> <span style="display:inline-block; width:20px; height:20px; background-color:${releasedColor}; vertical-align:middle;"></span> ${releasedColor}</p>
                    <p><strong>字体颜色:</strong> <span style="display:inline-block; width:20px; height:20px; background-color:${fontColor}; vertical-align:middle;"></span> ${fontColor}</p>
                    <p><strong>字体大小:</strong> ${fontSize}px</p>
                `;
            }
            
            // 添加音效信息
            const audioPlayer = document.getElementById(`sound-${type.toLowerCase()}-preview`);
            if (audioPlayer && audioPlayer.src) {
                contentDiv.innerHTML += `<p><strong>有设置按钮音效</strong></p>`;
            } else {
                contentDiv.innerHTML += `<p><strong>无按钮音效</strong></p>`;
            }
            
            detailSection.appendChild(contentDiv);
            buttonTypesDetails.appendChild(detailSection);
        }
    });
    
    if (buttonTypesList.children.length === 0) {
        buttonTypesList.innerHTML = '<li>未配置任何按钮类型</li>';
    }
}

/**
 * 更新TabBar图标设置摘要
 */
function updateTabbarIconsSettings() {
    const tabbarIconsContainer = document.getElementById('summary-tabbar-icons');
    if (!tabbarIconsContainer) return;
    
    tabbarIconsContainer.innerHTML = '';
    
    // TabBar图标类型
    const iconTypes = [
        {id: 'home', name: '首页'},
        {id: 'camera', name: '拍照'},
        {id: 'voice', name: '语音'},
        {id: 'theme', name: '主题'},
        {id: 'profile', name: '个人中心'}
    ];
    
    iconTypes.forEach(icon => {
        const selectedPreview = document.getElementById(`tabbar-${icon.id}-selected-preview`);
        const unselectedPreview = document.getElementById(`tabbar-${icon.id}-unselected-preview`);
        
        // 只有当有预览图时才添加
        if ((selectedPreview && selectedPreview.src) || (unselectedPreview && unselectedPreview.src)) {
            const iconItem = document.createElement('div');
            iconItem.className = 'summary-icon-item';
            
            let iconHTML = `<h6>${icon.name}图标</h6><div class="summary-icon-images">`;
            
            if (selectedPreview && selectedPreview.src) {
                iconHTML += `
                    <div class="summary-icon-image">
                        <img src="${selectedPreview.src}" alt="${icon.name}选中">
                        <span>选中状态</span>
                    </div>
                `;
            }
            
            if (unselectedPreview && unselectedPreview.src) {
                iconHTML += `
                    <div class="summary-icon-image">
                        <img src="${unselectedPreview.src}" alt="${icon.name}未选中">
                        <span>未选中状态</span>
                    </div>
                `;
            }
            
            iconHTML += `</div>`;
            iconItem.innerHTML = iconHTML;
            
            tabbarIconsContainer.appendChild(iconItem);
        }
    });
    
    if (tabbarIconsContainer.children.length === 0) {
        tabbarIconsContainer.innerHTML = '<p>未设置任何TabBar图标</p>';
    }
}

/**
 * 修复5: 修复确认提交功能
 */
function fixSubmitButton() {
    const form = document.getElementById('theme-creation-form');
    const submitBtn = document.querySelector('.submit-btn');
    
    if (form && submitBtn) {
        // 绑定提交事件
        form.addEventListener('submit', handleFormSubmit);
        console.log('已应用表单提交功能修复');
    }
}

/**
 * 处理表单提交
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        console.log('表单提交中...');
        // 显示加载指示器
        document.getElementById('loading-indicator').style.display = 'block';
        
        // 获取表单数据
        const formData = new FormData(document.getElementById('theme-creation-form'));
        
        // 获取主题ID
        const themeId = document.getElementById('theme-id').value;
        
        let response;
        if (themeId) {
            console.log(`正在更新主题ID: ${themeId}`);
            // 更新现有主题
            response = await fetch(`/api/skin/update/${themeId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
        } else {
            console.log('正在创建新主题');
            // 创建新主题 - 修改为正确的API端点
            response = await fetch('/api/skin/create', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
            });
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`服务器响应错误: ${response.status} ${errorData.message || response.statusText}`);
        }
        
        const result = await response.json();
        console.log('提交成功:', result);
        
        // 显示成功消息
        const messageElement = document.getElementById('message');
        messageElement.textContent = themeId ? '主题更新成功' : '主题创建成功';
        messageElement.className = 'message success';
        messageElement.style.display = 'block';
        
        // 重置表单数据
        const themeForm = document.getElementById('theme-creation-form');
        if (themeForm) {
            themeForm.reset();
            
            // 清除主题ID
            if (document.getElementById('theme-id')) {
                document.getElementById('theme-id').value = '';
            }
            
            // 清除所有图片预览
            document.querySelectorAll('.image-preview').forEach(preview => {
                preview.src = '';
                preview.style.display = 'none';
            });
            
            // 清除所有音频预览
            document.querySelectorAll('.sound-player').forEach(player => {
                player.src = '';
                player.style.display = 'none';
            });
            
            // 重置单选按钮状态
            if (document.getElementById('global_bg_color_option')) {
                document.getElementById('global_bg_color_option').checked = true;
                document.getElementById('global_bg_image_option').checked = false;
                document.getElementById('global_bg_color_group').style.display = 'block';
                document.getElementById('global_bg_image_group').style.display = 'none';
                document.getElementById('has_global_background_image').value = 'false';
            }
            
            if (document.getElementById('result_bg_color_option')) {
                document.getElementById('result_bg_color_option').checked = true;
                document.getElementById('result_bg_image_option').checked = false;
                document.getElementById('result_bg_color_group').style.display = 'block';
                document.getElementById('result_bg_image_group').style.display = 'none';
                document.getElementById('result_use_image').value = 'false';
            }
            
            if (document.getElementById('tabbar_bg_color_option')) {
                document.getElementById('tabbar_bg_color_option').checked = true;
                document.getElementById('tabbar_bg_image_option').checked = false;
                document.getElementById('tabbar_bg_color_group').style.display = 'block';
                document.getElementById('tabbar_bg_image_group').style.display = 'none';
                document.getElementById('tabbar_use_background_image').value = 'false';
            }
            
            // 重置所有按钮类型设置
            const buttonTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
            buttonTypes.forEach(type => {
                const useImageCheckbox = document.getElementById(`button_TYPE_${type}_use_image`);
                if (useImageCheckbox) {
                    useImageCheckbox.checked = false;
                    updateButtonTypeVisibility(type, false);
                }
            });
        }
        
        // 3秒后隐藏消息并返回主题列表页
        setTimeout(() => {
            messageElement.style.display = 'none';
            
            // 关闭创建页面，返回列表页
            document.getElementById('theme-create-page').style.display = 'none';
            document.getElementById('theme-list-page').style.display = 'block';
            
            // 更新导航状态
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector('[data-target="theme-list-page"]').classList.add('active');
            
            // 重新加载主题列表
            if (typeof loadThemes === 'function') {
                loadThemes();
            }
        }, 3000);
    } catch (error) {
        console.error('提交失败:', error);
        
        // 显示错误消息
        const messageElement = document.getElementById('message');
        messageElement.textContent = `提交失败: ${error.message}`;
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
    } finally {
        // 隐藏加载指示器
        document.getElementById('loading-indicator').style.display = 'none';
    }
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
                
                // 显示主题列表页面
                document.getElementById('theme-list-page').style.display = 'block';
                document.getElementById('theme-create-page').style.display = 'none';
                
                // 更新导航状态
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                themeListLink.classList.add('active');
                
                // 重新加载主题列表
                if (typeof loadThemes === 'function') {
                    loadThemes();
                }
            });
        }
        
        // 检查新主题按钮
        const newThemeButton = document.getElementById('new-theme-button');
        if (newThemeButton) {
            // 重新绑定点击事件
            newThemeButton.addEventListener('click', () => {
                console.log('新主题按钮被点击');
                
                // 显示主题创建页面
                document.getElementById('theme-list-page').style.display = 'none';
                document.getElementById('theme-create-page').style.display = 'block';
                
                // 显示第一步
                showCreateThemeFirstStep();
                
                // 更新导航状态
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                document.getElementById('theme-create-link').classList.add('active');
                
                // 激活子菜单
                document.getElementById('theme-create-submenu').classList.add('submenu-active');
            });
        }
        
        // 修复导航链接
        const themeCreateLink = document.getElementById('theme-create-link');
        if (themeCreateLink) {
            themeCreateLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                console.log('主题创建链接被点击');
                
                // 显示主题创建页面
                document.getElementById('theme-list-page').style.display = 'none';
                document.getElementById('theme-create-page').style.display = 'block';
                
                // 更新导航状态
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                themeCreateLink.classList.add('active');
                
                // 激活子菜单
                document.getElementById('theme-create-submenu').classList.add('submenu-active');
                
                // 重置表单和显示第一步
                showCreateThemeFirstStep();
            });
        }
        
        console.log('主题创建页面修复已应用');
    }, 500);
}

/**
 * 显示主题创建的第一步
 */
function showCreateThemeFirstStep() {
    // 重置步骤导航状态
    document.querySelectorAll('.step-link').forEach(link => {
        link.classList.remove('completed', 'active');
    });
    document.querySelector('.step-link[data-step="basic-info-step"]').classList.add('active');
    
    // 重置所有步骤内容
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 显示第一步
    document.getElementById('basic-info-step').classList.add('active');
    
    // 更新子菜单状态
    document.querySelectorAll('.submenu-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector('.submenu-link[data-step="basic-info-step"]').classList.add('active');
    
    // 重置表单
    try {
        document.getElementById('theme-creation-form').reset();
        // 清除主题ID
        if (document.getElementById('theme-id')) {
            document.getElementById('theme-id').value = '';
        }
    } catch (error) {
        console.error('重置表单出错:', error);
    }
}

/**
 * 修复7: 修复导航和按钮功能
 */
function fixNavigationAndButtons() {
    // 修复子菜单点击
    document.querySelectorAll('.submenu-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 更新子菜单状态
            document.querySelectorAll('.submenu-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 确保主题创建页面显示
            document.getElementById('theme-list-page').style.display = 'none';
            document.getElementById('theme-create-page').style.display = 'block';
            
            // 显示对应步骤
            const targetStep = this.getAttribute('data-step');
            if (window.originalShowStep && typeof window.originalShowStep === 'function') {
                window.originalShowStep(targetStep);
            } else {
                showStep(targetStep);
            }
            
            // 更新导航状态
            document.querySelectorAll('.nav-link').forEach(navLink => navLink.classList.remove('active'));
            document.getElementById('theme-create-link').classList.add('active');
            
            // 确保子菜单展开
            document.getElementById('theme-create-submenu').classList.add('submenu-active');
        });
    });
    
    // 修复下一步按钮
    document.querySelectorAll('.next-step').forEach(button => {
        button.addEventListener('click', async function() {
            const currentStep = this.closest('.step-content').id;
            const nextStep = this.getAttribute('data-next');
            
            console.log(`要从 ${currentStep} 前进到 ${nextStep}`);
            
            // 尝试保存当前步骤数据
            if (await saveStepData(currentStep)) {
                // 标记当前步骤为已完成
                document.querySelector(`.step-link[data-step="${currentStep}"]`).classList.add('completed');
                
                // 显示下一步
                if (window.originalShowStep && typeof window.originalShowStep === 'function') {
                    window.originalShowStep(nextStep);
                } else {
                    showStep(nextStep);
                }
            }
        });
    });
    
    // 修复上一步按钮
    document.querySelectorAll('.prev-step').forEach(button => {
        button.addEventListener('click', function() {
            const prevStep = this.getAttribute('data-prev');
            console.log(`返回到上一步: ${prevStep}`);
            
            if (window.originalShowStep && typeof window.originalShowStep === 'function') {
                window.originalShowStep(prevStep);
            } else {
                showStep(prevStep);
            }
        });
    });
    
    // 保留原有的showStep函数
    if (typeof window.showStep === 'function' && window.showStep !== window.ourShowStep) {
        window.originalShowStep = window.showStep;
        console.log('已保存原始showStep函数');
    }
    
    // 替换为我们的showStep函数
    window.showStep = window.ourShowStep = function(stepId) {
        console.log('调用我们的showStep:', stepId);
        
        try {
            // 更新步骤导航状态
            document.querySelectorAll('.step-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`.step-link[data-step="${stepId}"]`).classList.add('active');
            
            // 更新步骤内容显示
            document.querySelectorAll('.step-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(stepId).classList.add('active');
            
            // 更新子菜单状态
            document.querySelectorAll('.submenu-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`.submenu-link[data-step="${stepId}"]`).classList.add('active');
            
            // 如果是最后一步，更新摘要内容
            if (stepId === 'summary-step') {
                updateSummaryContent();
            }
        } catch (error) {
            console.error('showStep执行错误:', error);
        }
        
        return false;
    };
    
    console.log('已应用导航和按钮功能修复');
}

/**
 * 保存步骤数据
 */
async function saveStepData(currentStep) {
    try {
        console.log(`准备保存步骤: ${currentStep} 的数据`);
        
        // 显示加载指示器
        document.getElementById('step-loading').style.display = 'block';
        
        // 如果是tabbar-settings-step，预先更新摘要
        if (currentStep === 'tabbar-settings-step') {
            updateSummaryContent();
        }
        
        // 这里只是模拟保存，实际应用中可以发送到服务器
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 显示成功消息
        const messageElement = document.getElementById('message');
        messageElement.textContent = `${currentStep} 数据已保存`;
        messageElement.className = 'message success';
        messageElement.style.display = 'block';
        
        // 3秒后隐藏消息
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
        
        return true;
    } catch (error) {
        console.error('保存步骤数据失败:', error);
        
        // 显示错误消息
        const messageElement = document.getElementById('message');
        messageElement.textContent = `保存失败: ${error.message}`;
        messageElement.className = 'message error';
        messageElement.style.display = 'block';
        
        return false;
    } finally {
        // 隐藏加载指示器
        document.getElementById('step-loading').style.display = 'none';
    }
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