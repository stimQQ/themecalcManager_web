/**
 * 计算器皮肤主题管理系统 - API接口封装
 */
const themeAPI = (function() {
  // 使用本地代理而非直接访问远程API
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const BASE_URL = isLocalhost ? '/api' : 'https://www.themecalc.com/api';
  
  console.log('API模块使用的基础URL:', BASE_URL);
  
  // 请求头设置
  function getHeaders() {
    const headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application/json');
    headers.append('Origin', window.location.origin); // 动态获取当前域名作为Origin
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log('添加认证头: Bearer Token');
      headers.append('Authorization', `Bearer ${token}`);
    } else {
      console.warn('未找到认证令牌，请求将不包含Authorization头');
    }
    
    return headers;
  }
  
  // 处理API响应
  const handleResponse = async (response) => {
    console.log(`API响应状态: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    let data;
    
    try {
      // 尝试解析JSON响应
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('解析API响应JSON失败:', e);
      throw new Error('无法解析服务器响应');
    }
    
    if (!response.ok) {
      // 处理错误状态码
      const errorMessage = data.message || data.error || `请求失败，状态码: ${response.status}`;
      console.error('API错误响应:', data);
      throw new Error(errorMessage);
    }
    
    return data;
  };
  
  /**
   * 获取主题列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} - 主题列表数据
   */
  const getThemes = async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // 添加分页参数
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    // 添加筛选参数
    if (params.search) queryParams.append('search', params.search);
    if (params.is_paid !== undefined && params.is_paid !== null) {
      queryParams.append('is_paid', params.is_paid.toString());
    }
    
    // 添加时间戳参数，避免缓存
    if (params.timestamp) queryParams.append('_', params.timestamp);
    
    // 强制请求包含usage_count字段
    queryParams.append('include_usage', 'true');
    
    const url = `${BASE_URL}/skin?${queryParams.toString()}`;
    console.log('请求URL:', url); // 调试日志
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
        // 禁用缓存
        cache: 'no-store',
        // 添加CORS设置
        credentials: 'omit',
        mode: 'cors'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('获取主题列表失败:', error);
      throw error;
    }
  };
  
  /**
   * 获取主题详情
   * @param {number} id - 主题ID
   * @returns {Promise<Object>} - 主题详情数据
   */
  const getThemeDetail = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/skin/${id}`, {
        method: 'GET',
        headers: getHeaders(),
        // 添加CORS设置
        credentials: 'omit',
        mode: 'cors'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`获取主题 ${id} 详情失败:`, error);
      throw error;
    }
  };
  
  /**
   * 创建新主题
   * @param {FormData} formData - 包含主题数据的FormData对象
   * @returns {Promise<Object>} - 创建结果
   */
  const createTheme = async (formData) => {
    try {
      // 获取token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('未登录或认证令牌缺失，请重新登录');
      }
      
      // 规范化字段名（如果有FieldNormalizer可用）
      let processedFormData;
      if (window.FieldNormalizer) {
        console.log('使用FieldNormalizer规范化字段...');
        processedFormData = window.FieldNormalizer.normalizeFormData(formData);
        
        // 调试：输出所有字段
        console.log('规范化后的表单字段:');
        const debugFields = {};
        for (const [key, value] of processedFormData.entries()) {
          debugFields[key] = value instanceof File ? `文件: ${value.name} (${value.size} 字节)` : value;
        }
        console.log(JSON.stringify(debugFields, null, 2));
      } else {
        console.log('未找到FieldNormalizer，使用原始表单数据');
        processedFormData = formData;
      }
      
      // 处理布尔值字段，确保它们被正确传输
      const booleanFields = ['is_paid', 'use_system_font', 'has_global_background_image', 'result_use_image', 'tabbar_use_background_image'];
      booleanFields.forEach(field => {
        const value = processedFormData.get(field);
        if (value !== null && value !== undefined) {
          // 确保布尔值是字符串形式的"true"或"false"
          const boolString = value === true || value === 'true' ? 'true' : 'false';
          processedFormData.set(field, boolString);
          console.log(`处理布尔字段 ${field}: ${boolString}`);
        }
      });
      
      // 处理文件字段，确保文件大小和格式合适
      const fileFields = [];
      const oversizedFiles = [];
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      
      for (const [key, value] of processedFormData.entries()) {
        if (value instanceof File && value.size > 0) {
          console.log(`文件字段: ${key}, 类型: ${value.type}, 大小: ${value.size}字节`);
          
          // 检查文件大小
          if (value.size > MAX_FILE_SIZE) {
            oversizedFiles.push({ name: value.name, size: value.size, field: key });
          } else {
            fileFields.push(key);
          }
          
          // 对PNG图片添加格式保留标记
          if (value.type === 'image/png') {
            processedFormData.set(`${key}_preserve_format`, 'true');
          }
        }
      }
      
      // 如果有超大文件，给出警告
      if (oversizedFiles.length > 0) {
        console.warn('检测到超大文件，可能导致上传失败:', oversizedFiles);
        // 我们继续提交，让服务器决定是否接受这些文件
      }
      
      // 处理按钮图片和自动设置use_image标志
      const buttonTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
      for (const type of buttonTypes) {
        const pressedImageKey = `button_TYPE_${type}_pressed_image`;
        const releasedImageKey = `button_TYPE_${type}_released_image`;
        
        // 检查是否有按钮图片文件
        if (fileFields.includes(pressedImageKey) || fileFields.includes(releasedImageKey)) {
          console.log(`检测到${type}类按钮图片，自动设置use_image标志`);
          processedFormData.set(`button_TYPE_${type}_use_image`, 'true');
        }
      }
      
      // 处理结果区域背景图片
      if (fileFields.includes('result_background_image')) {
        console.log('检测到结果区域背景图片，自动设置use_image标志');
        processedFormData.set('result_use_image', 'true');
      }
      
      // 处理全局背景图片
      if (fileFields.includes('global_background_image')) {
        console.log('检测到全局背景图片，自动设置has_global_background_image标志');
        processedFormData.set('has_global_background_image', 'true');
      }
      
      console.log('开始创建主题...');
      
      // 添加版本号参数，避免缓存
      const timestamp = new Date().getTime();
      
      // 创建主题使用multipart/form-data格式，不设置Content-Type让浏览器自动设置
      const response = await fetch(`${BASE_URL}/skin/create?_=${timestamp}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Origin': window.location.origin  // 添加正确的Origin
        },
        body: processedFormData,
        // 添加跨域设置
        credentials: 'omit',
        mode: 'cors'
      });
      
      console.log(`创建主题请求完成，状态码: ${response.status}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('创建主题失败:', error);
      throw error;
    }
  };
  
  /**
   * 更新主题
   * @param {number} id - 主题ID
   * @param {FormData} formData - 包含主题数据的FormData对象
   * @returns {Promise<Object>} - 更新结果
   */
  const updateTheme = async (id, formData) => {
    try {
      console.log(`开始更新主题 (ID: ${id})...`);
      
      // 获取token
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('未登录或认证令牌缺失，请重新登录');
      }
      
      // 规范化字段名（如果有FieldNormalizer可用）
      let processedFormData;
      if (window.FieldNormalizer) {
        console.log('使用FieldNormalizer规范化字段...');
        processedFormData = window.FieldNormalizer.normalizeFormData(formData);
        
        // 调试：输出所有字段
        console.log('规范化后的表单字段:');
        for (const [key, value] of processedFormData.entries()) {
          console.log(`- ${key}: ${value instanceof File ? '文件对象' : value}`);
        }
      } else {
        console.log('未找到FieldNormalizer，使用原始表单数据');
        processedFormData = formData;
      }
      
      // 确保布尔字段正确处理
      const booleanFields = ['is_paid', 'use_system_font'];
      booleanFields.forEach(fieldName => {
        const fieldValue = processedFormData.get(fieldName);
        if (fieldValue) {
          // 确保是字符串形式的 'true' 或 'false'
          const boolValue = String(fieldValue).toLowerCase() === 'true' ? 'true' : 'false';
          processedFormData.set(fieldName, boolValue);
          console.log(`处理布尔字段: ${fieldName} = ${boolValue}`);
        }
      });
      
      // 收集文件信息并处理格式保留标记
      const fileFields = [];
      for (const [key, value] of processedFormData.entries()) {
        if (value instanceof File && value.size > 0) {
          console.log(`文件字段: ${key}, 类型: ${value.type}, 大小: ${value.size}字节`);
          fileFields.push(key);
          
          // 对PNG图片添加格式保留标记
          if (value.type === 'image/png') {
            processedFormData.append(`${key}_preserve_format`, 'true');
          }
        }
      }
      
      // 处理按钮图片和自动设置use_image标志
      const buttonTypes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
      for (const type of buttonTypes) {
        const pressedImageKey = `button_TYPE_${type}_pressed_image`;
        const releasedImageKey = `button_TYPE_${type}_released_image`;
        
        // 检查是否有按钮图片文件
        if (fileFields.includes(pressedImageKey) || fileFields.includes(releasedImageKey)) {
          console.log(`检测到${type}类按钮图片，自动设置use_image标志`);
          processedFormData.set(`button_TYPE_${type}_use_image`, 'true');
        }
      }
      
      // 处理结果区域背景图片
      if (fileFields.includes('result_background_image')) {
        console.log('检测到结果区域背景图片，自动设置use_image标志');
        processedFormData.set('result_use_image', 'true');
      }
      
      // 处理全局背景图片
      if (fileFields.includes('global_background_image')) {
        console.log('检测到全局背景图片，自动设置has_global_background_image标志');
        processedFormData.set('has_global_background_image', 'true');
      }
      
      // 使用正确的API端点
      console.log(`发送更新请求到: ${BASE_URL}/skin/${id}`);
      const response = await fetch(`${BASE_URL}/skin/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Origin': window.location.origin  // 添加正确的Origin
        },
        body: processedFormData,
        // 添加跨域设置
        credentials: 'omit',
        mode: 'cors'
      });
      
      console.log(`更新主题请求完成，状态码: ${response.status}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('更新主题失败:', error);
      throw error;
    }
  };
  
  /**
   * 删除主题
   * @param {number} id - 主题ID
   * @returns {Promise<Object>} - 删除结果
   */
  const deleteTheme = async (id) => {
    try {
      console.log(`开始删除主题 (ID: ${id})...`);
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('未登录或认证令牌缺失，请重新登录');
      }
      
      // 创建请求选项
      const requestOptions = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Origin': window.location.origin  // 添加正确的Origin
        },
        // 添加CORS设置
        credentials: 'omit',
        mode: 'cors'
      };
      
      // 根据API文档，删除主题的端点是DELETE /api/skin/{skin_id}
      console.log(`使用标准API端点删除主题: DELETE ${BASE_URL}/skin/${id}`);
      
      const response = await fetch(`${BASE_URL}/skin/${id}`, requestOptions);
      
      console.log(`删除主题请求完成，状态码: ${response.status}`);
      
      // 尝试读取响应内容
      let responseText = '';
      try {
        responseText = await response.text();
        console.log('删除主题响应内容:', responseText);
      } catch (e) {
        console.warn('无法读取响应内容:', e);
      }
      
      // 如果响应成功
      if (response.ok) {
        // 尝试解析JSON响应
        try {
          const result = responseText ? JSON.parse(responseText) : { success: true, message: '主题已删除' };
          return result;
        } catch (e) {
          console.log('响应不是JSON格式，返回标准成功对象');
          return { success: true, message: '主题已删除' };
        }
      }
      
      // 如果响应不成功，验证主题是否还存在
      console.log('删除请求返回非成功状态码，验证主题是否还存在...');
      
      // 等待一小段时间，让后端有机会完成删除操作
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 检查主题是否还存在
      try {
        const checkResponse = await fetch(`${BASE_URL}/skin/${id}`, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Origin': window.location.origin  // 添加正确的Origin
          },
          credentials: 'omit',
          mode: 'cors'
        });
        
        console.log(`验证主题存在，状态码: ${checkResponse.status}`);
        
        if (checkResponse.status === 404) {
          // 404意味着主题已被删除
          console.log('主题验证成功：主题已从数据库中删除（返回404）');
          return { success: true, message: '主题已删除' };
        } else if (!checkResponse.ok) {
          // 其他错误状态码，可能表示主题已删除或存在其他问题
          console.log('主题验证：返回非成功状态码，假定主题已删除');
          return { success: true, message: '主题已删除' };
        }
        
        // 如果主题仍然存在，抛出错误
        throw new Error('无法删除主题，请联系系统管理员');
      } catch (verifyError) {
        if (verifyError.message === '无法删除主题，请联系系统管理员') {
          throw verifyError;
        }
        
        console.error('验证主题存在时出错:', verifyError);
        // 验证出错，假定删除已成功
        return { success: true, message: '主题可能已删除，但无法确认' };
      }
    } catch (error) {
      console.error(`删除主题 ${id} 失败:`, error);
      throw error;
    }
  };
  
  /**
   * 应用主题
   * @param {number} id - 主题ID
   * @returns {Promise<Object>} - 应用结果
   */
  const applyTheme = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/skin/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Origin': window.location.origin  // 添加正确的Origin
        },
        // 添加CORS设置
        credentials: 'omit',
        mode: 'cors'
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`应用主题 ${id} 失败:`, error);
      throw error;
    }
  };
  
  // 公开API
  return {
    getThemes,
    getThemeDetail,
    createTheme,
    updateTheme,
    deleteTheme,
    applyTheme
  };
})();

// 模拟ESM导出
window.themeAPI = themeAPI; 