/**
 * 计算器皮肤主题管理系统 - 前端静态文件服务器
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 设置端口号
const PORT = 8082;

// MIME类型映射
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.pdf': 'application/pdf'
};

// 列出当前目录文件，用于调试
console.log("当前目录文件列表:");
try {
  const files = fs.readdirSync(__dirname);
  files.forEach(file => {
    const stats = fs.statSync(path.join(__dirname, file));
    const isDir = stats.isDirectory() ? "(目录)" : "";
    console.log(`- ${file} ${isDir}`);
  });
} catch (err) {
  console.error("列出目录文件时出错:", err);
}

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
  // 设置CORS头，允许跨域访问
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  console.log(`[${new Date().toISOString()}] "${req.method} ${req.url}" "${req.headers['user-agent']}"`);
  
  // 解析URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // 判断是否为API请求
  if (pathname.startsWith('/api/')) {
    // 使用代理处理API请求
    await proxyRequest(req, res);
    return;
  }
  
  // 处理根路径
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // 检查登录重定向
  if (pathname === '/login' || pathname === '/login.html') {
    pathname = '/login.html';
  }
  
  // 获取文件的绝对路径
  const filePath = path.join(__dirname, pathname);
  console.log("请求路径:", pathname);
  console.log("文件路径:", filePath);
  
  // 获取文件扩展名
  const extname = path.extname(filePath).toLowerCase();
  
  // 设置默认的Content-Type
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';
  
  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // 文件不存在
      console.log(`文件不存在: ${filePath}`);
      console.log(`[${new Date().toISOString()}] "${req.method} ${req.url}" Error (404): "Not found"`);
      
      // 返回404页面
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>404 - 页面未找到</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f8f9fa;
                  margin: 0;
                  padding: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  min-height: 100vh;
                  text-align: center;
              }
              .container {
                  max-width: 600px;
                  padding: 40px;
                  background-color: white;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  color: #dc3545;
                  margin-top: 0;
              }
              .buttons {
                  margin-top: 30px;
              }
              .btn {
                  display: inline-block;
                  padding: 10px 20px;
                  margin: 0 10px;
                  background-color: #007bff;
                  color: white;
                  text-decoration: none;
                  border-radius: 4px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>404 - 页面未找到</h1>
              <p>您请求的页面不存在。</p>
              <div class="buttons">
                  <a href="/" class="btn">返回首页</a>
                  <a href="/login.html" class="btn">登录页面</a>
              </div>
          </div>
      </body>
      </html>
      `);
    } else {
      // 文件存在，提供文件内容
      console.log(`文件存在: ${filePath}`);
      fs.readFile(filePath, (err, content) => {
        if (err) {
          // 读取文件时出错
          console.error(`读取文件出错: ${err}`);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>500 Internal Server Error</h1><p>Could not read the requested file.</p>');
        } else {
          // 成功读取文件
          console.log(`成功提供文件: ${pathname}`);
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    }
  });
});

// 处理API代理请求
const proxyRequest = async (req, res) => {
  const targetUrl = `http://127.0.0.1:5004${req.url}`;
  console.log(`代理请求: ${req.method} ${req.url} -> ${targetUrl}`);
  
  try {
    // 获取请求体
    let body = null;
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      await new Promise(resolve => req.on('end', resolve));
      body = Buffer.concat(chunks);
    }
    
    // 创建请求头
    const headers = { ...req.headers };
    // 删除可能导致问题的头部
    delete headers['host'];
    
    // 发起请求到目标服务器
    const fetch = require('node-fetch');
    const fetchOptions = {
      method: req.method,
      headers: headers
    };
    
    if (body) {
      fetchOptions.body = body;
    }
    
    const proxyRes = await fetch(targetUrl, fetchOptions);
    
    // 设置响应头
    Object.entries(proxyRes.headers.raw()).forEach(([key, values]) => {
      res.setHeader(key, values);
    });
    
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // 设置状态码
    res.writeHead(proxyRes.status);
    
    // 发送响应体
    proxyRes.body.pipe(res);
    
  } catch (error) {
    console.error(`代理请求错误:`, error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: '代理请求失败' }));
  }
};

// 启动服务器
server.listen(PORT, () => {
  console.log(`==============================================`);
  console.log(`  计算器皮肤主题管理系统 - 服务器已启动`);
  console.log(`==============================================`);
  console.log(`服务器运行地址: http://localhost:${PORT}/`);
  console.log(`文件服务路径: ${__dirname}`);
  console.log(`==============================================`);
  console.log(`可用页面:`);
  console.log(`- 主页: http://localhost:${PORT}/`);
  console.log(`- 登录页: http://localhost:${PORT}/login.html`);
  console.log(`==============================================`);
});

// 处理服务器错误
server.on('error', (err) => {
  console.error('服务器错误:', err);
  
  if (err.code === 'EADDRINUSE') {
    console.error(`错误: 端口 ${PORT} 已被占用。请停止其他HTTP服务器或更改端口号。`);
  }
});

// 处理进程终止信号
process.on('SIGINT', () => {
  console.log('服务器正在关闭...');
  server.close(() => {
    console.log('服务器已停止。');
    process.exit(0);
  });
}); 