/**
 * 主题管理系统 - 字段规范化工具
 * 用于处理不同命名格式的字段，确保与API兼容
 */

const FieldNormalizer = (function() {
    // 按钮类型列表
    const BUTTON_TYPES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    
    /**
     * 规范化FormData中的字段，确保与API兼容
     * @param {FormData} formData - 原始表单数据
     * @returns {FormData} - 规范化后的表单数据
     */
    function normalizeFormData(formData) {
        // 创建新的FormData对象用于存储规范化后的数据
        const normalizedFormData = new FormData();
        
        // 收集所有原始字段，用于分析和重命名
        const originalFields = [];
        for (const [key, value] of formData.entries()) {
            originalFields.push({ key, value });
        }
        
        // 处理按钮相关字段
        const buttonFields = processButtonFields(originalFields);
        
        // 处理TabBar图标字段
        const tabbarFields = processTabbarFields(originalFields);
        
        // 处理基础图片字段
        const basicFields = processBasicFields(originalFields);
        
        // 确保必要字段存在
        const requiredFields = ensureRequiredFields(originalFields);
        
        // 合并所有字段到规范化的FormData中
        for (const field of [...buttonFields, ...tabbarFields, ...basicFields, ...requiredFields]) {
            normalizedFormData.append(field.key, field.value);
        }
        
        // 添加其他未处理的字段
        for (const { key, value } of originalFields) {
            if (!normalizedFormData.has(key)) {
                normalizedFormData.append(key, value);
            }
        }
        
        return normalizedFormData;
    }
    
    /**
     * 确保必需字段存在
     * @param {Array} fields - 原始字段数组
     * @returns {Array} - 处理后的必需字段数组
     */
    function ensureRequiredFields(fields) {
        const result = [];
        
        // 必需字段及其默认值
        const requiredFields = [
            { key: 'is_paid', defaultValue: 'false' },
            { key: 'use_system_font', defaultValue: 'false' },
            { key: 'has_global_background_image', defaultValue: 'false' },
            { key: 'result_use_image', defaultValue: 'false' },
            { key: 'tabbar_use_background_image', defaultValue: 'false' },
            { key: 'top_button_selected_color', defaultValue: '#4a6cf7' },
            { key: 'top_button_unselected_color', defaultValue: '#6c757d' },
            { key: 'top_button_selected_font_color', defaultValue: '#FFFFFF' },
            { key: 'top_button_unselected_font_color', defaultValue: '#CCCCCC' },
            { key: 'tabbar_selected_font_color', defaultValue: '#4a6cf7' },
            { key: 'tabbar_unselected_font_color', defaultValue: '#6c757d' }
        ];
        
        // 字段映射：从表单字段名到API字段名
        const fieldMappings = [
            // 顶部导航区字段映射
            { from: 'top_nav_selected_color', to: 'top_button_selected_color' },
            { from: 'top_nav_unselected_color', to: 'top_button_unselected_color' },
            { from: 'top_nav_text_selected_color', to: 'top_button_selected_font_color' },
            { from: 'top_nav_text_unselected_color', to: 'top_button_unselected_font_color' }
        ];
        
        // 优先处理复选框和单选按钮类型的字段
        const booleanFields = [
            'is_paid', 
            'use_system_font', 
            'has_global_background_image', 
            'result_use_image', 
            'tabbar_use_background_image'
        ];
        
        // 先处理布尔值字段，确保布尔值被正确传递
        for (const booleanField of booleanFields) {
            const fieldElement = document.getElementById(booleanField);
            if (fieldElement) {
                // 针对复选框
                if (fieldElement.type === 'checkbox') {
                    // 将复选框状态转换为字符串'true'或'false'
                    const value = fieldElement.checked ? 'true' : 'false';
                    console.log(`处理复选框字段: ${booleanField} = ${value}`);
                    result.push({
                        key: booleanField,
                        value: value
                    });
                }
                // 针对隐藏字段
                else {
                    const value = fieldElement.value === 'true' ? 'true' : 'false';
                    console.log(`处理隐藏布尔字段: ${booleanField} = ${value}`);
                    result.push({
                        key: booleanField,
                        value: value
                    });
                }
            } else {
                // 尝试查找对应的单选按钮组
                if (booleanField === 'has_global_background_image') {
                    const imageRadio = document.getElementById('global_bg_image_option');
                    const value = imageRadio && imageRadio.checked ? 'true' : 'false';
                    console.log(`从单选按钮获取布尔值: ${booleanField} = ${value}`);
                    result.push({
                        key: booleanField,
                        value: value
                    });
                } 
                else if (booleanField === 'result_use_image') {
                    const imageRadio = document.getElementById('result_bg_image_option');
                    const value = imageRadio && imageRadio.checked ? 'true' : 'false';
                    console.log(`从单选按钮获取布尔值: ${booleanField} = ${value}`);
                    result.push({
                        key: booleanField,
                        value: value
                    });
                }
                else if (booleanField === 'tabbar_use_background_image') {
                    const imageRadio = document.getElementById('tabbar_bg_image_option');
                    const value = imageRadio && imageRadio.checked ? 'true' : 'false';
                    console.log(`从单选按钮获取布尔值: ${booleanField} = ${value}`);
                    result.push({
                        key: booleanField,
                        value: value
                    });
                }
                else {
                    // 如果找不到元素，添加默认值
                    const defaultValue = 'false';
                    console.log(`布尔字段未找到，使用默认值: ${booleanField} = ${defaultValue}`);
                    result.push({
                        key: booleanField,
                        value: defaultValue
                    });
                }
            }
        }
        
        // 处理字段映射
        for (const mapping of fieldMappings) {
            // 查找源字段
            let sourceValue = null;
            for (const field of fields) {
                if (field.key === mapping.from) {
                    sourceValue = field.value;
                    break;
                }
            }
            
            // 如果找到源字段值，添加映射字段
            if (sourceValue !== null) {
                console.log(`从表单映射字段: ${mapping.from} -> ${mapping.to} = ${sourceValue}`);
                result.push({
                    key: mapping.to,
                    value: sourceValue
                });
                
                // 同时保留原始字段，确保在摘要页面正常显示
                if (!result.some(r => r.key === mapping.from)) {
                    result.push({
                        key: mapping.from,
                        value: sourceValue
                    });
                }
            } else {
                // 如果没有找到源字段，在HTML表单中尝试直接获取值
                const sourceElement = document.getElementById(mapping.from);
                if (sourceElement && sourceElement.value) {
                    const value = sourceElement.value;
                    console.log(`从DOM元素获取字段值: ${mapping.from} -> ${mapping.to} = ${value}`);
                    
                    // 添加映射字段
                    result.push({
                        key: mapping.to,
                        value: value
                    });
                    
                    // 同时保留原始字段
                    result.push({
                        key: mapping.from,
                        value: value
                    });
                } else {
                    // 找不到源字段，使用默认值
                    const requiredField = requiredFields.find(f => f.key === mapping.to);
                    if (requiredField) {
                        console.log(`映射字段未找到源值，使用默认值: ${mapping.to} = ${requiredField.defaultValue}`);
                        result.push({
                            key: mapping.to,
                            value: requiredField.defaultValue
                        });
                    }
                }
            }
        }
        
        // 添加Tabbar字体颜色字段
        const tabbarFontColorFields = [
            { key: 'tabbar_selected_font_color', defaultValue: '#4a6cf7' },
            { key: 'tabbar_unselected_font_color', defaultValue: '#6c757d' }
        ];
        
        tabbarFontColorFields.forEach(field => {
            // 检查该字段是否已经添加
            if (!result.some(f => f.key === field.key)) {
                // 在原始字段中查找
                let found = false;
                for (const origField of fields) {
                    if (origField.key === field.key) {
                        found = true;
                        console.log(`从原始字段中添加Tabbar字体颜色: ${field.key} = ${origField.value}`);
                        result.push({
                            key: field.key,
                            value: origField.value
                        });
                        break;
                    }
                }
                
                // 如果没找到原始字段，尝试从DOM元素获取
                if (!found) {
                    const element = document.getElementById(field.key);
                    if (element && element.value) {
                        console.log(`从DOM元素获取Tabbar字体颜色: ${field.key} = ${element.value}`);
                        result.push({
                            key: field.key,
                            value: element.value
                        });
                    } else {
                        // 如果仍然未找到，使用默认值
                        console.log(`未找到Tabbar字体颜色字段，使用默认值: ${field.key} = ${field.defaultValue}`);
                        result.push({
                            key: field.key,
                            value: field.defaultValue
                        });
                    }
                }
            }
        });
        
        // 确保其他所有必需字段都存在
        for (const requiredField of requiredFields) {
            // 跳过已处理的布尔字段和Tabbar字体颜色字段
            if (booleanFields.includes(requiredField.key) || 
                tabbarFontColorFields.some(f => f.key === requiredField.key)) {
                continue;
            }
            
            // 检查字段是否已经添加
            if (!result.some(f => f.key === requiredField.key)) {
                // 在原始字段中查找
                let found = false;
                for (const field of fields) {
                    if (field.key === requiredField.key) {
                        found = true;
                        console.log(`从原始字段中添加必需字段: ${requiredField.key} = ${field.value}`);
                        result.push({ 
                            key: requiredField.key, 
                            value: field.value 
                        });
                        break;
                    }
                }
                
                // 如果没有找到，使用默认值
                if (!found) {
                    console.log(`未找到必需字段，使用默认值: ${requiredField.key} = ${requiredField.defaultValue}`);
                    result.push({ 
                        key: requiredField.key, 
                        value: requiredField.defaultValue 
                    });
                }
            }
        }
        
        // 处理旧版tabbar_font_color字段，需要兼容过渡
        for (const field of fields) {
            if (field.key === 'tabbar_font_color') {
                // 只有在新的字段都没有设置时，才使用旧的字段值
                const hasSelected = result.some(f => f.key === 'tabbar_selected_font_color');
                const hasUnselected = result.some(f => f.key === 'tabbar_unselected_font_color');
                
                if (!hasSelected) {
                    console.log(`从旧字段设置tabbar_selected_font_color: ${field.value}`);
                    result.push({
                        key: 'tabbar_selected_font_color',
                        value: field.value
                    });
                }
                
                if (!hasUnselected) {
                    console.log(`从旧字段设置tabbar_unselected_font_color: ${field.value}`);
                    result.push({
                        key: 'tabbar_unselected_font_color',
                        value: field.value
                    });
                }
                
                // 不要添加旧字段到结果中，因为它已经被替换了
                console.log(`旧字段tabbar_font_color已被过滤并替换为新字段`);
                break;
            }
        }
        
        return result;
    }
    
    /**
     * 处理按钮相关字段
     * @param {Array} fields - 原始字段数组
     * @returns {Array} - 处理后的按钮字段数组
     */
    function processButtonFields(fields) {
        const result = [];
        
        // 创建用于跟踪已处理字段的集合
        const processedKeys = new Set();
        
        // 遍历所有按钮类型
        for (const type of BUTTON_TYPES) {
            // 按钮图片字段 - 处理按下状态图片
            result.push(...normalizeButtonImageField(fields, type, 'pressed', processedKeys));
            
            // 按钮图片字段 - 处理释放状态图片
            result.push(...normalizeButtonImageField(fields, type, 'released', processedKeys));
            
            // 按钮声音字段
            result.push(...normalizeButtonSoundField(fields, type, processedKeys));
            
            // 按钮使用图片标志
            for (const field of fields) {
                if (field.key.match(new RegExp(`button_TYPE_${type}_use_image`, 'i'))) {
                    result.push({
                        key: `button_TYPE_${type}_use_image`,
                        value: field.value
                    });
                    processedKeys.add(field.key);
                }
            }
            
            // 处理按钮颜色字段
            for (const field of fields) {
                const colorMatch = field.key.match(new RegExp(`button_TYPE_${type}_(.+_color)`, 'i'));
                if (colorMatch) {
                    result.push({
                        key: `button_TYPE_${type}_${colorMatch[1].toLowerCase()}`,
                        value: field.value
                    });
                    processedKeys.add(field.key);
                }
            }
            
            // 处理按钮字体大小
            for (const field of fields) {
                if (field.key.match(new RegExp(`button_TYPE_${type}_font_size`, 'i'))) {
                    result.push({
                        key: `button_TYPE_${type}_font_size`,
                        value: field.value
                    });
                    processedKeys.add(field.key);
                }
            }
        }
        
        // 标记已处理的字段
        fields = fields.filter(f => !processedKeys.has(f.key));
        
        return result;
    }
    
    /**
     * 处理按钮图片字段
     * @param {Array} fields - 原始字段数组
     * @param {string} type - 按钮类型（A-I）
     * @param {string} state - 按钮状态（pressed/released）
     * @param {Set} processedKeys - 已处理字段的键集合
     * @returns {Array} - 规范化后的按钮图片字段
     */
    function normalizeButtonImageField(fields, type, state, processedKeys) {
        const result = [];
        const standardKey = `button_TYPE_${type}_${state}_image`;
        
        // 查找所有可能的按钮图片字段格式
        const patterns = [
            new RegExp(`button_TYPE_${type}_${state}_image`, 'i'),    // 标准格式
            new RegExp(`button_type_${type}_${state}_image`, 'i'),    // 小写格式
            new RegExp(`TYPE_${type}_${state}_image`, 'i'),           // 无button_前缀
            new RegExp(`${state}_image_TYPE_${type}`, 'i')            // 反转格式
        ];
        
        // 尝试匹配所有可能的格式
        for (const field of fields) {
            for (const pattern of patterns) {
                if (pattern.test(field.key) && !processedKeys.has(field.key)) {
                    result.push({
                        key: standardKey,
                        value: field.value
                    });
                    processedKeys.add(field.key);
                    return result; // 找到一个匹配就返回
                }
            }
        }
        
        return result;
    }
    
    /**
     * 处理按钮声音字段
     * @param {Array} fields - 原始字段数组
     * @param {string} type - 按钮类型（A-I）
     * @param {Set} processedKeys - 已处理字段的键集合
     * @returns {Array} - 规范化后的按钮声音字段
     */
    function normalizeButtonSoundField(fields, type, processedKeys) {
        const result = [];
        const standardKey = `button_TYPE_${type}_sound`;
        
        // 查找所有可能的按钮声音字段格式
        const patterns = [
            new RegExp(`button_TYPE_${type}_sound`, 'i'),   // 标准格式
            new RegExp(`sound_TYPE_${type}`, 'i'),          // 旧格式
            new RegExp(`TYPE_${type}_sound`, 'i')           // 无button_前缀
        ];
        
        // 尝试匹配所有可能的格式
        for (const field of fields) {
            for (const pattern of patterns) {
                if (pattern.test(field.key) && !processedKeys.has(field.key)) {
                    result.push({
                        key: standardKey,
                        value: field.value
                    });
                    processedKeys.add(field.key);
                    return result; // 找到一个匹配就返回
                }
            }
        }
        
        return result;
    }
    
    /**
     * 处理TabBar图标字段
     * @param {Array} fields - 原始字段数组
     * @returns {Array} - 处理后的TabBar图标字段数组
     */
    function processTabbarFields(fields) {
        const result = [];
        const processedKeys = new Set();
        
        // TabBar图标类型和状态
        const tabbarIcons = [
            { name: 'home', states: ['selected', 'unselected'] },
            { name: 'camera', states: ['selected', 'unselected'] },
            { name: 'voice', states: ['selected', 'unselected'] },
            { name: 'theme', states: ['selected', 'unselected'] },
            { name: 'profile', states: ['selected', 'unselected'] }
        ];
        
        // 处理所有TabBar图标
        for (const icon of tabbarIcons) {
            for (const state of icon.states) {
                const standardKey = `tabbar_${icon.name}_${state}`;
                
                // 尝试查找匹配的字段
                for (const field of fields) {
                    if (field.key.toLowerCase() === standardKey.toLowerCase() && !processedKeys.has(field.key)) {
                        result.push({
                            key: standardKey,
                            value: field.value
                        });
                        processedKeys.add(field.key);
                        break;
                    }
                }
            }
        }
        
        // 标记已处理的字段
        fields = fields.filter(f => !processedKeys.has(f.key));
        
        return result;
    }
    
    /**
     * 处理基础图片字段
     * @param {Array} fields - 原始字段数组
     * @returns {Array} - 处理后的基础图片字段数组
     */
    function processBasicFields(fields) {
        const result = [];
        const processedKeys = new Set();
        
        // 基础图片字段名称
        const basicImageFields = [
            'detail_image',
            'preview_image',
            'global_background_image',
            'result_background_image',
            'tabbar_background_image'
        ];
        
        // 处理所有基础图片字段
        for (const fieldName of basicImageFields) {
            for (const field of fields) {
                if (field.key.toLowerCase() === fieldName.toLowerCase() && !processedKeys.has(field.key)) {
                    result.push({
                        key: fieldName,
                        value: field.value
                    });
                    processedKeys.add(field.key);
                    break;
                }
            }
        }
        
        // 标记已处理的字段
        fields = fields.filter(f => !processedKeys.has(f.key));
        
        return result;
    }
    
    // 公开API
    return {
        normalizeFormData
    };
})();

// 模拟ESM导出
window.FieldNormalizer = FieldNormalizer; 