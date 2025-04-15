const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 5005;

// 添加请求体解析中间件 - 在API代理前添加
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 打印详细请求信息的中间件
app.use((req, res, next) => {
  console.log(`[请求] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('[请求体]', req.body);
  }
  next();
});

// 配置API代理 - 调整为不使用路径重写，完全转发
app.use('/api', createProxyMiddleware({
  target: 'https://www.themecalc.com',
  changeOrigin: true,
  secure: true,
  logLevel: 'debug',
  // 无需重写路径，因为目标服务器API也是/api开头
  pathRewrite: undefined,
  onProxyReq: (proxyReq, req, res) => {
    // 打印完整请求信息
    console.log(`[代理请求] ${req.method} ${req.url} -> ${proxyReq.method} https://www.themecalc.com${req.url}`);
    console.log('[请求头]', JSON.stringify(req.headers, null, 2));
    
    // 确保Content-Type正确设置
    if (req.method === 'POST' || req.method === 'PUT') {
      proxyReq.setHeader('Content-Type', 'application/json');
    }
    
    // 确保Origin和Host头正确
    proxyReq.setHeader('Origin', 'https://www.themecalc.com');
    proxyReq.setHeader('Host', 'www.themecalc.com');
    
    // 如果有请求体，记录并确保正确转发
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      console.log('[请求体]', bodyData);
      
      // 更新Content-Length
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      
      // 写入请求体
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // 打印响应状态
    console.log(`[代理响应] ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
    console.log('[响应头]', proxyRes.headers);
  },
  onError: (err, req, res) => {
    console.error('[代理错误]', err);
    res.status(500).json({ error: '代理服务器错误', message: err.message, stack: err.stack });
  }
}));

// 静态文件服务 - 指向项目根目录
app.use(express.static(path.join(__dirname, '..')));

// 所有其他请求返回index.html，支持SPA路由
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 动态端口分配
function startServer(port) {
  try {
    app.listen(port, () => {
      console.log(`主题管理系统服务器运行在: http://localhost:${port}`);
      console.log('API请求将被代理到: https://www.themecalc.com');
    });
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.log(`端口 ${port} 已被占用, 尝试使用端口 ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('服务器启动失败:', err);
    }
  }
}

// 启动服务器
startServer(port); 