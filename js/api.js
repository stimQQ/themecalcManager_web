/**
 * 计算器皮肤主题管理系统 - API接口封装
 */
const themeAPI = (function() {
  // API基础URL
  const BASE_URL = '/api';
  
  // 请求头设置
  const getHeaders = () => {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // 添加token认证
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };
  
  // 处理API响应
  const handleResponse = async (response) => {
    console.log(`API响应状态: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      // 处理错误状态码
      const errorText = await response.text();
      let errorMessage;
      
      try {
        // 尝试解析JSON响应
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || '请求失败';
        console.error('API错误响应:', errorJson);
      } catch (e) {
        console.error('解析错误响应失败:', e);
        errorMessage = errorText || `请求失败，状态码: ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    // 处理成功响应
    try {
      return await response.json();
    } catch (e) {
      console.error('解析JSON响应失败:', e);
      throw new Error('解析服务器响应失败');
    }
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
    if (params.is_paid !== undefined) queryParams.append('is_paid', params.is_paid);
    
    const url = `${BASE_URL}/skin${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
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
        headers: getHeaders()
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
      
      // 创建主题使用multipart/form-data格式，不设置Content-Type让浏览器自动设置
      const response = await fetch(`${BASE_URL}/skin/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        // 添加跨域设置
        credentials: 'include',
        mode: 'cors'
      });
      
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
      // 更新主题使用multipart/form-data格式，不设置Content-Type让浏览器自动设置
      const headers = getHeaders();
      delete headers['Content-Type'];
      
      const response = await fetch(`${BASE_URL}/skin/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': headers.Authorization
        },
        body: formData
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`更新主题 ${id} 失败:`, error);
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
      const response = await fetch(`${BASE_URL}/skin/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      return await handleResponse(response);
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
      const response = await fetch(`${BASE_URL}/skin/apply/${id}`, {
        method: 'POST',
        headers: getHeaders()
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