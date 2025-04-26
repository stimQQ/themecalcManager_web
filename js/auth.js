/**
 * 计算器皮肤主题管理系统 - 认证API封装
 */
const authAPI = (function() {
    // 基础URL定义 - 与主API保持一致
    const WWW_BASE_URL = 'https://www.themecalc.com/api';
    
    // 登录URL
    const LOGIN_URL = `${WWW_BASE_URL}/user_admin/login`;
    
    // 存储认证令牌的key
    const TOKEN_KEY = 'auth_token';
    
    // 获取JSON请求头
    function getHeaders() {
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');
        headers.append('Origin', window.location.origin);
        
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            console.log('添加认证头: Bearer Token');
            headers.append('Authorization', `Bearer ${token}`);
        }
        
        return headers;
    }
    
    /**
     * 用户登录
     * @param {string} username - 用户名
     * @param {string} password - 密码
     * @returns {Promise<Object>} - 登录结果，包含token
     */
    async function login(username, password) {
        console.log(`尝试登录用户: ${username}`);
        
        try {
            // 使用AbortController实现请求超时
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
            
            const response = await fetch(LOGIN_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Origin': window.location.origin
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
                credentials: 'omit',
                mode: 'cors',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            console.log(`登录响应状态: ${response.status} ${response.statusText}`);
            
            const responseText = await response.text();
            let data;
            
            try {
                // 尝试解析JSON响应
                data = responseText ? JSON.parse(responseText) : {};
                console.log('登录响应数据:', data);
            } catch (e) {
                console.error('解析登录响应JSON失败:', e);
                throw new Error('无法解析服务器响应');
            }
            
            if (!response.ok) {
                // 处理错误状态码
                const errorMessage = data.message || data.error || `登录失败，状态码: ${response.status}`;
                console.error('登录错误:', errorMessage);
                throw new Error(errorMessage);
            }
            
            // 验证响应中是否包含token
            const token = data.token || data.access_token || (data.data && data.data.token);
            
            if (!token) {
                console.error('登录响应中未找到token:', data);
                throw new Error('登录成功但未返回有效的认证令牌');
            }
            
            // 存储token
            localStorage.setItem(TOKEN_KEY, token);
            console.log('登录成功，已保存认证令牌');
            
            // 返回登录结果
            return {
                success: true,
                token: token,
                user: data.user || data.data || {}
            };
        } catch (error) {
            // 特殊处理AbortError（超时）
            if (error.name === 'AbortError') {
                throw new Error('登录请求超时，请检查网络连接');
            }
            
            console.error('登录失败:', error);
            throw error;
        }
    }
    
    /**
     * 验证当前保存的令牌是否有效
     * @returns {Promise<boolean>} - 令牌是否有效
     */
    async function verifyToken() {
        const token = localStorage.getItem(TOKEN_KEY);
        
        if (!token) {
            console.warn('未找到认证令牌');
            return false;
        }
        
        try {
            // 获取当前token的信息
            const tokenInfo = parseJwt(token);
            console.log('当前令牌信息:', tokenInfo);
            
            // 检查令牌是否过期
            if (tokenInfo && tokenInfo.exp) {
                const expiryDate = new Date(tokenInfo.exp * 1000);
                const now = new Date();
                
                console.log(`令牌过期时间: ${expiryDate.toLocaleString()}, 当前时间: ${now.toLocaleString()}`);
                
                // 如果令牌已过期，直接返回false
                if (expiryDate <= now) {
                    console.warn('令牌已过期');
                    return false;
                }
            }
            
            // 尝试请求用户资料以验证令牌有效性
            console.log('验证令牌有效性...');
            const verifyUrl = `${WWW_BASE_URL}/user/profile`;
            
            const response = await fetch(verifyUrl, {
                method: 'GET',
                headers: getHeaders(),
                credentials: 'omit',
                mode: 'cors'
            });
            
            console.log(`验证令牌响应状态: ${response.status}`);
            
            // 401表示未授权，令牌无效
            if (response.status === 401) {
                console.warn('令牌验证失败: 未授权 (401)');
                return false;
            }
            
            // 如果请求成功，令牌有效
            return response.ok;
        } catch (error) {
            console.error('验证令牌时出错:', error);
            return false;
        }
    }
    
    /**
     * 解析JWT令牌
     * @param {string} token - JWT令牌
     * @returns {Object|null} - 解析后的令牌数据
     */
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;
            
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('解析JWT令牌失败:', error);
            return null;
        }
    }
    
    /**
     * 退出登录
     */
    function logout() {
        console.log('执行退出登录操作');
        localStorage.removeItem(TOKEN_KEY);
        
        // 重定向到登录页
        window.location.href = 'login.html';
    }
    
    /**
     * 获取当前存储的认证令牌
     * @returns {string|null} - 认证令牌
     */
    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }
    
    /**
     * 设置认证令牌
     * @param {string} token - 认证令牌
     */
    function setToken(token) {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    }
    
    /**
     * 获取当前登录用户信息
     * @returns {Object|null} - 用户信息
     */
    function getCurrentUser() {
        const token = getToken();
        if (!token) return null;
        
        const tokenData = parseJwt(token);
        return tokenData;
    }
    
    // 导出API方法
    return {
        login,
        logout,
        verifyToken,
        getToken,
        setToken,
        getCurrentUser,
        parseJwt
    };
})();

// 全局导出
window.authAPI = authAPI; 