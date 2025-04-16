/**
 * 计算器皮肤主题管理系统 - 前端静态文件服务器
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
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
    htmlFile = 'create.html';
  } else if (req.path === '/edit' || req.path === '/edit.html') {
    htmlFile = 'edit.html';
  } else if (req.path === '/detail' || req.path === '/detail.html') {
    htmlFile = 'detail.html';
  } else if (req.path === '/login' || req.path === '/login.html') {
    htmlFile = 'login.html';
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