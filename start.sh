#!/bin/bash

# 主题管理系统启动脚本
echo "===== 主题管理系统启动脚本 ====="

# 1. 检查是否有正在运行的实例
echo "检查是否有正在运行的服务..."
PID=$(lsof -ti:5005)
if [ ! -z "$PID" ]; then
  echo "发现端口5005已被占用，PID: $PID，正在停止..."
  kill -9 $PID
  sleep 1
  echo "已终止旧进程"
fi

# 2. 启动服务器
echo "正在启动主题管理系统..."
NODE_ENV=production nohup node server.js > server.log 2>&1 &

# 3. 检查启动结果
sleep 2
if lsof -ti:5005 > /dev/null; then
  echo "主题管理系统启动成功!"
  echo "访问 http://admin.themecalc.com:5005 查看网站"
  echo "服务器日志保存在 server.log 文件中"
else
  # 检查其他可能的端口(如果服务器使用了自动端口切换)
  for port in 5006 5007 5008 5009; do
    if lsof -ti:$port > /dev/null; then
      echo "主题管理系统启动成功! (使用备用端口 $port)"
      echo "访问 http://admin.themecalc.com:$port 查看网站"
      echo "服务器日志保存在 server.log 文件中"
      exit 0
    fi
  done
  
  echo "服务器启动失败，请检查server.log查看错误信息"
  cat server.log
  exit 1
fi 