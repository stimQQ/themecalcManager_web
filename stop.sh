#!/bin/bash

# 主题管理系统停止脚本
echo "===== 主题管理系统停止脚本 ====="

# 查找可能的服务器端口
for port in 5005 5006 5007 5008 5009; do
  PID=$(lsof -ti:$port)
  if [ ! -z "$PID" ]; then
    echo "发现服务运行在端口 $port, PID: $PID"
    echo "正在停止服务..."
    kill -15 $PID
    sleep 1
    
    # 检查是否成功停止
    if lsof -ti:$port > /dev/null; then
      echo "服务没有响应优雅关闭请求，正在强制终止..."
      kill -9 $PID
      sleep 1
    fi
    
    if lsof -ti:$port > /dev/null; then
      echo "错误: 无法停止服务，请手动终止进程"
      exit 1
    else
      echo "服务已成功停止"
      exit 0
    fi
  fi
done

echo "未发现运行中的主题管理系统服务" 