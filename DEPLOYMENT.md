# ThemeCalc 管理系统部署指南

本指南将帮助您在服务器上部署ThemeCalc管理系统，使其在指定的域名(admin.themecalc.com)和端口(5005)上运行，同时代理API请求到https://www.themecalc.com。

## 前提条件

- 一台运行Ubuntu/Debian的服务器
- Node.js v14+
- npm 或 yarn
- Nginx
- 已配置的域名 admin.themecalc.com (DNS指向您的服务器)
- 确保可以访问https://www.themecalc.com (API后端)

## 部署步骤

### 1. 安装Node.js和npm (如果尚未安装)

```bash
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. 安装Nginx (如果尚未安装)

```bash
sudo apt-get update
sudo apt-get install -y nginx
```

### 3. 创建网站目录

```bash
sudo mkdir -p /var/www/themesManager_web
```

### 4. 将代码复制到网站目录

上传项目文件夹到服务器，然后运行：

```bash
sudo cp -r /path/to/your/themesManager_web/* /var/www/themesManager_web/
```

### 5. 安装依赖

```bash
cd /var/www/themesManager_web
sudo npm install
```

### 6. 配置Nginx

将 `nginx-config.conf` 复制到Nginx配置目录：

```bash
sudo cp /var/www/themesManager_web/nginx-config.conf /etc/nginx/sites-available/admin.themecalc.com.conf
sudo ln -s /etc/nginx/sites-available/admin.themecalc.com.conf /etc/nginx/sites-enabled/
```

Nginx配置现在直接提供静态文件，而不是通过Node.js应用：

```nginx
server {
    listen 80;
    server_name admin.themecalc.com;
    
    location / {
        root   /var/www/themesManager_web/;
        index  index.html index.htm;
    }
    
    location /api/ {
        proxy_pass https://www.themecalc.com/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 7. 测试Nginx配置并重启

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 8. 设置系统服务

复制服务文件并启用：

```bash
sudo cp /var/www/themesManager_web/themecalc-admin.service /etc/systemd/system/
sudo systemctl enable themecalc-admin.service
sudo systemctl start themecalc-admin.service
```

### 9. 查看服务状态

```bash
sudo systemctl status themecalc-admin.service
```

### 10. 设置文件权限

确保Node.js应用可以访问所需文件：

```bash
sudo chown -R www-data:www-data /var/www/themesManager_web
sudo chmod -R 755 /var/www/themesManager_web
```

## API配置说明

系统配置为将API请求代理到https://www.themecalc.com：

- 前端应用在admin.themecalc.com上运行
- API请求通过以下两种方式处理：
  1. 通过Nginx代理转发到https://www.themecalc.com/api
  2. 一些直接的API调用(如登录)直接访问https://www.themecalc.com/api
- 前端代码中的API基础URL已设置为`/api`，这会被Nginx代理处理
- 登录页面直接使用完整URL，确保认证请求正确处理

如果后端API地址发生变更，需要修改以下文件：
1. `login.html` - 修改登录请求中的API URL
2. `nginx-config.conf` - 修改proxy_pass指向的地址
3. `js/api.js` - 如果不使用相对路径，需要修改BASE_URL变量

## 验证部署

在浏览器中访问 http://admin.themecalc.com 查看是否能正常访问网站。

## 故障排除

### 检查应用日志

```bash
sudo journalctl -u themecalc-admin.service
```

### 检查Nginx日志

```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### API连接问题

如果API连接出现问题，可以执行以下检查：

```bash
# 测试与API服务器的连接
curl -v https://www.themecalc.com/api/health
```

可能需要在服务器上启用HTTPS请求：
```bash
sudo apt-get install -y ca-certificates
```

### 常见问题

1. **端口被占用**: 检查5005端口是否已被占用
   ```bash
   sudo netstat -tuln | grep 5005
   ```

2. **权限问题**: 确保文件权限正确
   ```bash
   sudo chown -R www-data:www-data /var/www/themesManager_web
   sudo chmod -R 755 /var/www/themesManager_web
   ```

3. **防火墙问题**: 确保端口5005已开放
   ```bash
   sudo ufw allow 5005
   ```

4. **Nginx配置错误**: 检查Nginx配置
   ```bash
   sudo nginx -t
   ```

## 更新应用

当需要更新应用时，按照以下步骤操作：

```bash
cd /var/www/themesManager_web
sudo git pull  # 如果使用git管理代码
# 或手动上传新文件
sudo npm install  # 如果有新依赖
sudo systemctl restart themecalc-admin.service
``` 