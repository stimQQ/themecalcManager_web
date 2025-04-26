/**
 * 计算器皮肤主题管理系统 - 认证API
 */
const authAPI = (function() {
  // 使用与主API相同的基础URL
  const BASE_URL = 'https://www.themecalc.com/api';
  
  console.log('认证API模块初始化，使用基础URL:', BASE_URL);
  
  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} - 登录结果，包含token
   */
  const login = async (username, password) => {
    try {
      console.log('开始登录请求处理...');
      console.log(`用户名: ${username}`);
      
      const loginData = {
        username: username,
        password: password
      };
      
      console.log('发送登录请求到:', `${BASE_URL}/user_admin/login`);
      
      // 使用与APIPost相同的请求格式
      const response = await fetch(`${BASE_URL}/user_admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify(loginData),
        mode: 'cors',
        credentials: 'omit'
      });
      
      console.log('收到登录响应，状态码:', response.status);
      
      // 读取响应内容
      const responseText = await response.text();
      let data;
      
      try {
        // 尝试解析响应为JSON
        data = JSON.parse(responseText);
        console.log('解析响应为JSON:', data);
      } catch (e) {
        console.error('解析响应JSON失败:', e);
        console.log('原始响应内容:', responseText);
        throw new Error('服务器响应格式错误');
      }
      
      // 检查响应状态
      if (!response.ok) {
        const errorMessage = data.message || `登录失败: ${response.status} ${response.statusText}`;
        console.error('登录失败:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // 登录成功，从响应中获取token
      const token = data.token;
      
      if (!token) {
        console.error('响应中没有token:', data);
        throw new Error('响应中未包含认证令牌');
      }
      
      console.log('登录成功，已获取token');
      
      // 返回登录结果
      return {
        success: true,
        token: token,
        message: data.message || '登录成功'
      };
    } catch (error) {
      console.error('登录处理过程中出错:', error);
      throw error;
    }
  };
  
  /**
   * 验证令牌是否有效
   * @param {string} token - 认证令牌
   * @returns {Promise<boolean>} - 令牌是否有效
   */
  const verifyToken = async (token) => {
    try {
      console.log('开始验证token有效性...');
      
      // 先尝试一个轻量级请求验证token
      const verifyUrl = `${BASE_URL}/verify_token`;
      try {
        const response = await fetch(verifyUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Origin': window.location.origin
          },
          credentials: 'omit',
          mode: 'cors',
          cache: 'no-store'
        });
        
        // 如果响应成功，则token有效
        if (response.ok) {
          console.log('Token验证成功');
          return true;
        }
        
        // 如果是401未授权，token无效
        if (response.status === 401) {
          console.log('Token验证失败: 401 Unauthorized');
          return false;
        }
      } catch (e) {
        console.warn('轻量级token验证失败，尝试备用方法: ', e);
        // 继续使用备用验证方法
      }
      
      // 备用方法：使用一个非常小的分页请求验证token
      const minimalParams = new URLSearchParams();
      minimalParams.append('page', '1');
      minimalParams.append('per_page', '1');
      minimalParams.append('_', new Date().getTime());
      
      // 使用令牌尝试获取资源
      const response = await fetch(`${BASE_URL}/skin?${minimalParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        credentials: 'omit',
        mode: 'cors',
        cache: 'no-store'
      });
      
      // 检查响应状态
      console.log(`备用验证方法结果: ${response.status} ${response.statusText}`);
      return response.ok;
    } catch (error) {
      console.error('验证令牌出错:', error);
      
      // 如果是网络错误，尝试一次本地验证
      // 检查token格式是否正确
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Token格式无效');
        return false;
      }
      
      try {
        // 解析JWT的payload部分
        const payload = JSON.parse(atob(tokenParts[1]));
        
        // 检查是否过期
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.error('Token已过期');
          return false;
        }
        
        // 在无法联网的情况下，假设token有效
        console.log('无法联网验证token，但token格式正确且未过期');
        return true;
      } catch (e) {
        console.error('解析Token失败:', e);
        return false;
      }
    }
  };
  
  /**
   * 注销 - 清除存储的令牌
   */
  const logout = () => {
    localStorage.removeItem('auth_token');
    console.log('已清除认证令牌，完成注销');
  };
  
  // 导出认证方法
  return {
    login,
    verifyToken,
    logout
  };
})();

// 将认证API导出到全局
window.authAPI = authAPI; 