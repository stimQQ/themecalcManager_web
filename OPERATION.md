# 主题管理系统操作手册

本文档提供主题管理系统的详细操作说明，包括启动、停止、故障排除等内容。

## 系统架构

- 前端：静态HTML/CSS/JavaScript，部署在`admin.themecalc.com:5005`
- 后端API：位于`https://www.themecalc.com/api`

## 系统启动

系统提供了简单的启动脚本：

```bash
./start.sh
```

此脚本会：
1. 检查是否有已在运行的服务器实例
2. 如果有，会先终止旧的实例
3. 启动新的服务器实例
4. 验证服务器是否成功启动
5. 服务日志保存在`server.log`文件中

如果端口5005已被占用，服务器会自动尝试使用下一个可用端口(5006, 5007等)。

## 系统停止

要停止系统，运行：

```bash
./stop.sh
```

此脚本会：
1. 查找在5005-5009端口上运行的服务
2. 尝试优雅地停止服务
3. 如果服务不响应，会强制终止进程

## 日志查看

查看服务器运行日志：

```bash
cat server.log
```

跟踪实时日志：

```bash
tail -f server.log
```

## 故障排除

### 问题：端口被占用

**症状**: 启动服务器时显示错误"Error: listen EADDRINUSE: address already in use :::5005"

**解决方案**:
1. 使用`./stop.sh`停止所有实例
2. 如果还不行，手动找出并终止占用端口的进程：
   ```bash
   lsof -i :5005   # 查找占用端口的进程
   kill -9 [PID]   # 终止该进程
   ```
3. 然后重新启动服务：`./start.sh`

### 问题：API连接失败

**症状**: 登录或其他API请求失败，显示"Failed to fetch"或"Connection refused"

**解决方案**:
1. 检查API服务器是否可访问：
   ```bash
   curl -v https://www.themecalc.com/api/health
   ```
2. 确认服务器正在运行：
   ```bash
   lsof -i :5005
   ```
3. 检查服务器日志中是否有API代理错误：
   ```bash
   cat server.log
   ```

### 问题：服务器自动停止

**症状**: 服务器启动后自动停止

**解决方案**:
1. 检查`server.log`中的错误信息
2. 确保Node.js版本兼容(推荐v14+)
3. 验证系统内存是否充足
4. 尝试手动运行服务器以查看控制台错误：
   ```bash
   node server.js
   ```

## 后台运行

如果需要长期保持服务在后台运行，推荐在生产环境使用以下方法：

### 使用systemd (Linux服务器)

创建服务文件`/etc/systemd/system/themecalc-admin.service`：

```
[Unit]
Description=ThemeCalc Admin Portal
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/themesManager_web
ExecStart=/usr/bin/node /path/to/themesManager_web/server.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=themecalc-admin
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

然后启用和启动服务：

```bash
sudo systemctl enable themecalc-admin.service
sudo systemctl start themecalc-admin.service
```

### 使用PM2 (任何环境)

安装PM2：

```bash
npm install -g pm2
```

启动服务：

```bash
pm2 start server.js --name themecalc-admin
```

设置开机自启：

```bash
pm2 startup
pm2 save
```

## 更新部署

更新系统时的步骤：

1. 停止当前服务：
   ```bash
   ./stop.sh
   ```

2. 更新代码（例如通过git或手动上传）

3. 如有新的依赖项，安装：
   ```bash
   npm install
   ```

4. 重启服务：
   ```bash
   ./start.sh
   ``` 