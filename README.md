# 计算器皮肤主题管理系统

## 系统简介

计算器皮肤主题管理系统是一个用于管理计算器应用程序皮肤主题的Web应用。管理员可以通过该系统创建、编辑、删除和管理多种计算器皮肤主题，并配置主题的各种视觉元素。

## 功能特性

- 主题列表管理：查看、筛选和管理所有皮肤主题
- 主题创建：创建新的皮肤主题，包括基本信息设置
- 全局设置：配置主题的背景、字体等全局元素
- 结果区域：定制显示结果的区域样式
- 按钮皮肤：为不同类型的按钮设置外观
- Tabbar设置：自定义底部标签栏的样式
- 预览功能：实时预览设置效果
- 多媒体支持：上传和管理图片、音效等资源

具体描述：
皮肤管理的内容如下：
##皮肤添加：
 1、添加、编辑、删除皮肤相关信息：主题id（可自动生成），主题名称、主题版本、主题是否需要付费、主题使用量、主题上传时间、主题详情图片、主题的预览图（封面图）； 2、上传皮肤时，需要设置全局内容：是否设置全局背景图or全局背景色、是否全局使用系统字体、设置按钮音效。 3、计算结果区域设置：设置背景图还是全局背景色。设置字体颜色、大小。 4、顶部按钮区域：设置按钮的选中和非选中颜色、字体选中和非选中颜色。 
5、计算按钮皮肤和音效设置： 
#### 基础计算A类皮肤 - 功能按钮(AC, ±%)：按钮是否支持图片，是则上传按下和弹起两种按钮图片，否则设置按下和弹起的背景颜色、透明度，字体大小、颜色等。设置音效。 
#### 基础计算B类皮肤 - 运算符按钮(÷, ×, -, +)：按钮是否支持图片，是则上传按下和弹起两种按钮图片，否则设置按下和弹起的背景颜色、透明度，字体大小、颜色等。设置音效。 
#### 基础计算C类皮肤 - 数字按钮(0-9, .)：按钮是否支持图片，是则上传按下和弹起两种按钮图片，否则设置按下和弹起的背景颜色、透明度，字体大小、颜色等。设置弹音效。 
#### 基础计算D类皮肤 - 等号按钮(=)：按钮是否支持图片，是则上传按下和弹起两种按钮图片，否则设置按下和弹起的背景颜色、透明度，字体大小、颜色等。设置弹起和按下音效。 
#### 科学计算E类皮肤 - 科学功能按钮：按钮是否支持图片，是则上传按下和弹起两种按钮图片，否则设置按下和弹起的背景颜色、透明度，字体大小、颜色等。设置弹起和按下音效。 
#### 科学计算F类皮肤 - 科学计算器版本的功能按钮(AC, ±, %)：按钮是否支持图片，是则上传按下和弹起两种按钮图片，否则设置按下和弹起的背景颜色、透明度，字体大小、颜色等。音效同A类皮肤。 
#### G类皮肤 - 科学计算器版本的运算符按钮(÷, ×, -, +)：按钮是否支持图片，是则上传按下和弹起两种按钮图片，否则设置按下和弹起的背景颜色、透明度，字体大小、颜色等。音效同B类皮肤。 
#### H类皮肤 - 科学计算器版本的数字按钮(0-9, .)：按钮是否支持图片，是则上传按下和弹起两种按钮图片，否则设置按下和弹起的背景颜色、透明度，字体大小、颜色等。音效同C类皮肤。 
#### I类皮肤 - 科学计算器版本的等号按钮(=)：按钮是否支持图片，是则上传按下和弹起两种按钮图片，否则设置按下和弹起的背景颜色、透明度，字体大小、颜色等。音效同D类皮肤。 6、tabbar设置： ##tabbar背景色透明度； ##tabbar字体颜色、大小，
####tabbar分为背景、图标、字体三个部分，背景可以上传背景图或自定义颜色，图标上传首页、拍照、语音、主题、个人中心5个图标，分别分为选中和非选中状态，字体可以设置颜色和大小。

技术栈：后端使用flask，数据库使用sqlite3，采用引擎的方式连接数据库，请你帮我规划一下项目结构

## 管理员登录
用于后台管理系统的管理员登录接口：

- **URL**: `/api/user_admin/login`
- **方法**: `POST`
- **内容类型**: `application/json`
- **请求体**:
  ```json
  {
    "username": "admin",
    "password": "123456"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "message": "登录成功",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **错误响应** (401):
  ```json
  {
    "error": "用户名或密码不存在"
  }
  ```

## 皮肤管理
主题皮肤上传的接口：
### 获取皮肤列表

获取所有可用皮肤的列表。

- **URL**: `/api/skin`
- **方法**: `GET`
- **查询参数**:
  - `page`: 页码，默认为1
  - `per_page`: 每页数量，默认为20
  - `search`: 搜索关键词（搜索名称或创建者）
  - `is_paid`: 是否只显示付费皮肤（"true"或"false"）
- **成功响应** (200):
  ```json
  {
    "items": [
      {
        "id": 1,
        "name": "默认皮肤",
        "version": "1.0",
        "is_paid": false,
        "create_time": "2025-01-01T00:00:00",
        "update_time": null,
        "detail_image": "http://localhost:5004/uploads/skins/1/detail_image/preview.jpg"
      }
    ],
    "total": 10,
    "pages": 1,
    "current_page": 1,
    "per_page": 20
  }
  ```
## 获取皮肤详情

获取特定皮肤的详细信息。

- **URL**: `/api/skin/{skin_id}`
- **方法**: `GET`
- **成功响应** (200):
  ```json
  {
    "id": 1,
    "name": "默认皮肤",
    "version": "1.0",
    "is_paid": false,
    "create_time": "2025-01-01T00:00:00",
    "update_time": null,
    "detail_image": "http://localhost:5004/uploads/skins/1/detail_image/preview.jpg",
    "has_global_background_image": false,
    "global_background_image": null,
    "global_background_color": "#FFFFFF",
    "use_system_font": true,
    "buttons": [
      {
        "id": 1,
        "type": "TYPE_A",
        "use_image": true,
        "pressed_color": "#D0D0D0",
        "released_color": "#E0E0E0",
        "color_opacity": 1.0,
        "font_size": 18,
        "font_color": "#000000",
        "pressed_image": ”https：//example.com/897hfid838jdeu“,
        "released_image": “https：//example.com/897hfid838jdeu”,
        "sound": null
      }
      // 其他按钮...
    ]
  }
  ```
  
### 创建皮肤

创建新的皮肤，需要管理员权限。

- **URL**: `/api/skin/create`
- **方法**: `POST`
- **内容类型**: `multipart/form-data`
- **请求头**:
  - `Authorization`: Bearer {token}
- **表单字段**:
  - **必填字段**:
    - `skin_name`: 皮肤名称
    - `result_background_color`: 结果区域背景颜色（如"#F5F5F5"）
  - **选填字段**:
    - `version`: 版本号，默认为"1.0"
    - `is_paid`: 是否为付费皮肤（"true"或"false"）
    - `has_global_background_image`: 是否使用全局背景图片（"true"或"false"）
    - `global_background_color`: 全局背景颜色（如"#FFFFFF"）
    - `use_system_font`: 是否使用系统字体（"true"或"false"）
    - `result_use_image`: 是否使用图片背景（"true"或"false"）
    - `result_font_color`: 结果字体颜色（如"#000000"）
    - `result_font_size`: 结果字体大小（默认24）
    - `default_pressed_color`: 默认按下状态颜色（如"#D1E8FF"）
    - `default_released_color`: 默认释放状态颜色（如"#E8F4FF"）
    - `default_font_color`: 默认字体颜色（如"#333333"）
    - `default_font_size`: 默认字体大小（如18）
  - **按钮设置**（对每种类型）:
    - `button_TYPE_A_use_image`: 是否使用图片（"true"或"false"）
    - `button_TYPE_A_pressed_color`: 按下状态颜色
    - `button_TYPE_A_released_color`: 释放状态颜色
    - `button_TYPE_A_font_color`: 字体颜色
  - **文件上传**:
    - `detail_image`: 皮肤详情图片
    - `background_image`: 背景图片
    - `button_image_TYPE_A`: A类按钮图片
    - `sound_TYPE_A`: A类按钮音效
- **成功响应** (200):
  ```json
  {
    "success": true,
    "skin_id": 1,
    "detail_image": "/uploads/skins/春日花园主题/detail_image/example.jpg",
    "background_image": "/uploads/skins/春日花园主题/background/bg.jpg",
    "button_images": ["/uploads/skins/春日花园主题/buttons/type_a.jpg"],
    "sounds": ["/uploads/skins/春日花园主题/sounds/type_a.mp3"]
  }
  ```
- **错误响应** (400):
  ```json
  {
    "success": false,
    "message": "创建皮肤失败: 结果区域背景颜色(result_background_color)是必填字段"
  }
  ```

### 更新皮肤

更新现有皮肤的信息，需要管理员权限。

- **URL**: `/api/skin/{skin_id}`
- **方法**: `PUT`
- **内容类型**: `multipart/form-data`
- **请求头**:
  - `Authorization`: Bearer {token}
- **表单字段**:
  - 与创建皮肤相同，但都是可选的
- **成功响应** (200):
  ```json
  {
    "message": "皮肤更新成功"
  }
  ```
- **错误响应** (404):
  ```json
  {
    "error": "Skin not found"
  }
  ```

### 删除皮肤

删除指定皮肤，需要管理员权限。

- **URL**: `/api/skin/{skin_id}`
- **方法**: `DELETE`
- **请求头**:
  - `Authorization`: Bearer {token}
- **成功响应** (200):
  ```json
  {
    "message": "Skin deleted successfully"
  }
  ```
- **错误响应** (404):
  ```json
  {
    "error": "Skin not found"
  }
  ```

### 应用皮肤

将指定皮肤应用到当前用户，需要用户登录。

- **URL**: `/api/skin/apply/{skin_id}`
- **方法**: `POST`
- **请求头**:
  - `Authorization`: Bearer {token}
- **成功响应** (200):
  ```json
  {
    "message": "Skin applied successfully"
  }
  ```
- **错误响应** (403):
  ```json
  {
    "error": "Subscription required for this skin"
  }
  ```
  
  ## 文件上传规则

- **允许的图片格式**: png, jpg, jpeg
- **允许的音效格式**: wav, mp3, ogg
- **图片大小限制**: 建议不超过2MB
- **音效大小限制**: 建议不超过1MB
- **文件路径结构**:
  ```
  skins/
    └── {皮肤名称}/
        ├── detail_image/
        ├── background/
        ├── buttons/
        └── sounds/
  ```
  
## 按钮类型

| 类型 | 描述 |
|------|------|
| `TYPE_A` | 基础计算A类皮肤（功能按钮：AC, ±, %）|
| `TYPE_B` | 基础计算B类皮肤（运算符按钮：÷, ×, -, +）|
| `TYPE_C` | 基础计算C类皮肤（数字按钮：0-9, .）|
| `TYPE_D` | 基础计算D类皮肤（等号按钮：=）|
| `TYPE_E` | 科学计算E类皮肤（科学功能按钮）|
| `TYPE_F` | 科学计算F类皮肤（科学计算器版本的功能按钮）|
| `TYPE_G` | G类皮肤（科学计算器版本的运算符按钮）|
| `TYPE_H` | H类皮肤（科学计算器版本的数字按钮）|
| `TYPE_I` | I类皮肤（科学计算器版本的等号按钮）|

## 技术栈

- 前端：HTML、CSS、JavaScript（原生）
- 后端：Flask (Python)
- 存储：关系型数据库
- 资源存储：阿里云OSS

## 系统要求

- Node.js (推荐 v14.0.0 或更高版本)
- 现代浏览器（Chrome、Firefox、Safari、Edge等）
- 后端API服务（运行在localhost:5004）


## 使用指南

1. 启动前端和后端服务
2. 在浏览器中访问 `http://localhost:8080`
3. 使用管理员账号登录系统
4. 通过界面创建和管理皮肤主题

## 开发说明
```

### 开发注意事项

1. 前端使用原生JavaScript，没有使用框架，便于维护和理解
2. API请求都集中在api.js文件中，方便统一管理
3. 所有样式都在styles.css中定义，使用CSS变量确保一致性
4. 图片和音频上传前会进行压缩和优化处理

