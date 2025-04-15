/**
 * 计算器皮肤主题管理系统 - 用户管理API接口封装
 */
const userAPI = (function() {
  // API基础URL
  const BASE_URL = 'https://www.themecalc.com/api';
  
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
   * 获取用户列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Object>} - 用户列表数据
   */
  const getUsers = async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // 添加分页参数
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    // 添加筛选参数
    if (params.search) queryParams.append('search', params.search);
    
    const url = `${BASE_URL}/user_admin?${queryParams.toString()}`;
    console.log('请求URL:', url); // 调试日志
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }
  };
  
  /**
   * 创建新用户
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} - 创建结果
   */
  const createUser = async (userData) => {
    try {
      const response = await fetch(`${BASE_URL}/user_admin`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('创建用户失败:', error);
      throw error;
    }
  };
  
  /**
   * 更新用户
   * @param {number} id - 用户ID
   * @param {Object} userData - 用户数据
   * @returns {Promise<Object>} - 更新结果
   */
  const updateUser = async (id, userData) => {
    try {
      const response = await fetch(`${BASE_URL}/user_admin/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`更新用户 ${id} 失败:`, error);
      throw error;
    }
  };
  
  /**
   * 删除用户
   * @param {number} id - 用户ID
   * @returns {Promise<Object>} - 删除结果
   */
  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/user_admin/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`删除用户 ${id} 失败:`, error);
      throw error;
    }
  };
  
  /**
   * 获取用户详情
   * @param {number} id - 用户ID
   * @returns {Promise<Object>} - 用户详情
   */
  const getUserDetail = async (id) => {
    try {
      const response = await fetch(`${BASE_URL}/user_admin/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`获取用户 ${id} 详情失败:`, error);
      throw error;
    }
  };
  
  // 公开API
  return {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserDetail
  };
})();

// 模拟ESM导出
window.userAPI = userAPI; 