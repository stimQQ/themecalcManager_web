/**
 * 健康检查脚本
 * 用于监控ThemeCalc管理系统服务状态
 */

const http = require('http');

const options = {
  hostname: 'admin.themecalc.com',
  port: 80,
  path: '/',
  method: 'GET',
  timeout: 5000 // 5秒超时
};

console.log('正在执行健康检查...');

const req = http.request(options, (res) => {
  console.log(`状态码: ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    console.log('✅ 服务正常运行');
    process.exit(0);
  } else {
    console.error(`❌ 服务异常! 状态码: ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (error) => {
  console.error('❌ 健康检查失败:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ 请求超时!');
  req.destroy();
  process.exit(1);
});

req.end(); 