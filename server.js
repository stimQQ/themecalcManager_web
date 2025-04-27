/**
 * 计算器皮肤主题管理系统 - 前端静态文件服务器
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { createProxyMiddleware } = require('http-proxy-middleware'); // 引入代理中间件
const app = express();
const PORT = 5005;

// 添加请求体解析中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// --- 添加 API 代理中间件 ---
app.use('/api', createProxyMiddleware({
  target: 'https://www.themecalc.com', // 目标 API 服务器
  changeOrigin: true, // 需要虚拟托管站点
  pathRewrite: {'^/api' : '/api'}, // 重写路径，确保后端收到正确的路径
  logLevel: 'debug', // 打印代理日志，方便调试
  onProxyReq: (proxyReq, req, res) => {
    // 确保 Content-Type 和 Origin header 被正确设置
    if (!proxyReq.getHeader('Content-Type') && req.body) {
      if (req.body instanceof Buffer) {
        // 如果是 Buffer (例如 Multipart Form Data), 不设置 content-type
        // 让浏览器自动设置正确的 boundary
      } else {
        proxyReq.setHeader('Content-Type', 'application/json');
      }
    }
    
    // 确保传递 Authorization 头
    const authHeader = req.headers['authorization'];
    if (authHeader) {
      proxyReq.setHeader('Authorization', authHeader);
    }
    
    proxyReq.setHeader('Origin', 'https://www.themecalc.com');
    
    // 打印详细信息便于调试
    console.log(`[Proxy] Forwarding ${req.method} request: ${req.url} -> ${proxyReq.path}`);
    console.log(`[Proxy] Headers: ${JSON.stringify(proxyReq.getHeaders())}`);
    
    // 如果是 POST/PUT 请求且有请求体，确保正确传递
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      const bodyData = JSON.stringify(req.body);
      // 更新 Content-Length
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      // 写入请求体
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error('[Proxy] Error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain',
    });
    res.end(`Proxy Error: ${err.message}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`[Proxy] Received response from target: ${proxyRes.statusCode}`);
    
    // 记录响应头，帮助调试 CORS 问题
    console.log(`[Proxy] Response headers: ${JSON.stringify(proxyRes.headers)}`);
    
    // 添加 CORS 头到响应
    proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Accept, Origin';
    proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  }
}));
// --- API 代理中间件结束 ---

// 强化CORS配置，允许跨域请求
app.use((req, res, next) => {
  // 允许来自themecalc.com的请求
  res.header('Access-Control-Allow-Origin', 'https://www.themecalc.com');
  // 允许来自所有来源的请求（如果需要）
  // res.header('Access-Control-Allow-Origin', '*');
  
  // 允许的HTTP方法
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  // 允许的请求头
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // 允许发送凭证（如Cookie）
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// 提供静态文件
app.use(express.static(__dirname));

// 所有路由都返回index.html，实现SPA路由
app.get('*', (req, res) => {
  // 根据请求路径确定返回的HTML文件
  let htmlFile = 'index.html';
  if (req.path === '/create' || req.path === '/create.html') {
    res.redirect('https://admin.themecalc.com/create.html');
    return;
  } else if (req.path === '/edit' || req.path === '/edit.html') {
    // 如果有ID参数，传递到重定向URL
    const id = req.query.id ? `?id=${req.query.id}` : '';
    res.redirect(`https://admin.themecalc.com/edit.html${id}`);
    return;
  } else if (req.path === '/detail' || req.path === '/detail.html') {
    htmlFile = 'detail.html';
  } else if (req.path === '/login' || req.path === '/login.html') {
    htmlFile = 'login.html';
  } else if (req.path === '/themes' || req.path === '/themes.html') {
    htmlFile = 'themes.html';
  }
  
  res.sendFile(path.join(__dirname, htmlFile));
});

// 启动服务器
const startServer = (port) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`主题管理系统已启动在 http://localhost:${port}`);
    console.log(`API请求将直接发送到 https://www.themecalc.com/api`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`端口 ${port} 已被占用, 尝试使用端口 ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('服务器启动失败:', err);
      process.exit(1);
    }
  });
  
  // 处理进程终止信号
  process.on('SIGINT', () => {
    console.log('正在关闭服务器...');
    server.close(() => {
      console.log('服务器已停止');
      process.exit(0);
    });
  });
};

// 开始尝试启动服务器
startServer(PORT); 