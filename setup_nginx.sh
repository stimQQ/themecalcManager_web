#!/bin/bash
# 在服务器上配置Nginx的脚本

# 设置变量
SITE_NAME="admin.themecalc.com"
WEB_ROOT="/var/www/themesManager_web"
NGINX_CONF="/etc/nginx/conf.d/${SITE_NAME}.conf"

# 确保脚本以root权限运行
if [ "$(id -u)" != "0" ]; then
   echo "此脚本需要以root权限运行" 1>&2
   exit 1
fi

# 1. 创建网站目录
echo "创建网站目录..."
mkdir -p $WEB_ROOT

# 2. 创建Nginx配置文件
echo "创建Nginx配置文件..."
cat > $NGINX_CONF << EOF
server {
    listen 80;
    server_name admin.themecalc.com;

    location / {
        root   $WEB_ROOT;
        index  index.html index.htm;
        try_files \$uri \$uri/ /index.html;  # 支持SPA路由
    }

    # API代理 - 转发到主API服务器
    location /api/ {
        proxy_pass https://www.themecalc.com/api/;
        proxy_set_header Host www.themecalc.com;
        proxy_set_header Origin https://www.themecalc.com;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 错误页面
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
}
EOF

# 3. 检查Nginx配置
echo "检查Nginx配置..."
nginx -t

if [ $? -eq 0 ]; then
    # 4. 重启Nginx
    echo "重启Nginx..."
    systemctl reload nginx
    echo "Nginx配置完成！"
    echo "请将您的网站文件上传到 $WEB_ROOT 目录"
else
    echo "Nginx配置有误，请检查错误并修复"
fi 