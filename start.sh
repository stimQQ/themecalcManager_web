#!/bin/bash

# 显示欢迎信息
echo "=========================================="
echo "  计算器皮肤主题管理系统 - 前端服务启动脚本"
echo "=========================================="
echo ""

# 检查Node.js安装
if ! command -v node &> /dev/null; then
    echo "错误: 未安装Node.js，请先安装Node.js"
    echo "可以从 https://nodejs.org/ 下载安装"
    exit 1
fi

# 显示Node.js版本
NODE_VERSION=$(node -v)
echo "检测到Node.js版本: $NODE_VERSION"

# 检查server.js文件
if [ ! -f "server.js" ]; then
    echo "错误: 找不到server.js文件"
    exit 1
fi

# 列出当前目录文件（用于调试）
echo ""
echo "当前目录文件列表:"
ls -la
echo ""

# 特别检查关键文件
if [ -f "login.html" ]; then
    echo "✓ 检测到login.html文件"
else
    echo "警告: login.html文件不存在!"
fi

if [ -f "index.html" ]; then
    echo "✓ 检测到index.html文件"
else
    echo "警告: index.html文件不存在!"
fi

# 检查是否有其他进程占用端口
PORT=8081
if command -v lsof &> /dev/null; then
    PORT_USAGE=$(lsof -i:$PORT | grep LISTEN)
    if [ ! -z "$PORT_USAGE" ]; then
        echo "警告: 端口 $PORT 已被占用!"
        echo "$PORT_USAGE"
        echo "请先终止以上进程，或修改server.js中的端口号"
        echo ""
        echo "可以使用以下命令终止占用端口的进程:"
        echo "kill -9 \$(lsof -t -i:$PORT)"
        exit 1
    fi
fi

# 启动服务器
echo ""
echo "正在启动前端服务器..."
echo "服务器将在 http://localhost:8081 上运行"
echo "按Ctrl+C终止服务"
echo ""

# 启动Node.js服务器
node server.js

# 脚本结束
exit 0 