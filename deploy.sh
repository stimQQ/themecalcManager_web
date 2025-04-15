#!/bin/bash
# 主题管理系统部署脚本

# 设置参数
TARGET_SERVER="your-server-ip"  # 请修改为您的服务器IP
SSH_USER="root"                 # 请修改为您的SSH用户名
SSH_PORT="22"                   # 请修改为您的SSH端口
TARGET_DIR="/var/www/themesManager_web"  # 服务器上的目标目录
NGINX_CONF_DIR="/etc/nginx/conf.d"       # Nginx配置目录

echo "开始部署主题管理系统..."

# 1. 检查是否安装了必要的工具
if ! command -v rsync &> /dev/null; then
    echo "错误: 未安装rsync。请安装rsync后再运行此脚本。"
    exit 1
fi

# 2. 构建项目（如果需要）
# echo "构建项目..."
# npm run build

# 3. 确保目标目录存在
echo "确保目标目录存在..."
ssh -p $SSH_PORT $SSH_USER@$TARGET_SERVER "mkdir -p $TARGET_DIR"

# 4. 同步文件到服务器
echo "同步文件到服务器..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'proxy' \
      -e "ssh -p $SSH_PORT" \
      ./ $SSH_USER@$TARGET_SERVER:$TARGET_DIR/

# 5. 复制Nginx配置文件
echo "复制Nginx配置文件..."
scp -P $SSH_PORT ./nginx/admin.themecalc.com.conf $SSH_USER@$TARGET_SERVER:$NGINX_CONF_DIR/

# 6. 检查Nginx配置
echo "检查Nginx配置..."
ssh -p $SSH_PORT $SSH_USER@$TARGET_SERVER "nginx -t"

# 7. 重启Nginx
echo "重启Nginx..."
ssh -p $SSH_PORT $SSH_USER@$TARGET_SERVER "systemctl reload nginx"

echo "部署完成！"
echo "您的主题管理系统现已部署在 http://admin.themecalc.com"
echo ""
echo "如需启用HTTPS支持，请先获取SSL证书，然后取消注释Nginx配置文件中的HTTPS部分。" 