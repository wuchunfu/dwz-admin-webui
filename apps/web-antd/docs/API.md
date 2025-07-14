# 短网址服务 API 文档

本文档描述了短网址服务的所有API接口，支持多域名、用户管理、AB测试、统计跳转、CRUD操作等功能。

## 基础信息

- **基础URL**: `http://localhost:8080`
- **内容类型**: `application/json`
- **字符编码**: `UTF-8`

## 认证说明

部分接口需要用户认证，需要在HTTP请求头中包含Authorization字段：

```
Authorization: Bearer {token}
```

获取token请通过登录接口或创建API Token。

## API 接口列表

### 1. 健康检查

#### 1.1 获取健康状态

**GET** `/health`

获取服务健康状态详细信息。

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "status": "healthy",
    "database": "connected",
    "redis": "connected",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

#### 1.2 简单健康检查

**GET** `/health/simple`

简单的健康检查接口。

**响应示例**：

```json
{
  "code": 0,
  "message": "服务正常"
}
```

### 2. 用户认证

#### 2.1 用户登录

**POST** `/api/v1/login`

用户登录接口，无需认证。

**请求体**：

```json
{
  "username": "admin",
  "password": "password"
}
```

**参数说明**：

- `username` (必填): 用户名
- `password` (必填): 密码

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-12-31T23:59:59Z",
    "user": {
      "id": 1,
      "username": "admin",
      "real_name": "管理员",
      "email": "admin@example.com",
      "phone": "13800138000",
      "status": 1,
      "last_login": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 3. 短网址管理

#### 3.1 创建短网址

**POST** `/api/v1/short_links`

创建一个新的短网址。

**请求体**：

```json
{
  "original_url": "https://www.example.com",
  "domain": "https://short.ly",
  "custom_code": "abc123",
  "title": "示例网站",
  "description": "这是一个示例网站",
  "expire_at": "2024-12-31T23:59:59Z"
}
```

**参数说明**：

- `original_url` (必填): 原始URL地址
- `domain` (可选): 短网址域名，不填使用默认域名
- `custom_code` (可选): 自定义短代码
- `title` (可选): 网页标题
- `description` (可选): 描述信息
- `expire_at` (可选): 过期时间，null表示永不过期

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "short_code": "abc123",
    "domain": "https://short.ly",
    "short_url": "https://short.ly/abc123",
    "original_url": "https://www.example.com",
    "title": "示例网站",
    "description": "这是一个示例网站",
    "expire_at": "2024-12-31T23:59:59Z",
    "is_active": true,
    "click_count": 0,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 3.2 获取短网址列表

**GET** `/api/v1/short_links`

分页获取短网址列表，支持筛选和搜索。

**查询参数**：

- `page` (可选): 页码，默认1，最小值1
- `page_size` (可选): 每页数量，默认10，最大100
- `domain` (可选): 按域名筛选
- `keyword` (可选): 关键词搜索（搜索URL、标题、描述）

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "short_code": "abc123",
        "domain": "https://short.ly",
        "short_url": "https://short.ly/abc123",
        "original_url": "https://www.example.com",
        "title": "示例网站",
        "description": "这是一个示例网站",
        "expire_at": null,
        "is_active": true,
        "click_count": 15,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  }
}
```

#### 3.3 获取短网址详情

**GET** `/api/v1/short_links/{id}`

根据ID获取短网址详情。

**路径参数**：

- `id`: 短网址ID

**响应格式**：与创建短网址响应格式相同。

#### 3.4 更新短网址

**PUT** `/api/v1/short_links/{id}`

更新指定ID的短网址信息。

**路径参数**：

- `id`: 短网址ID

**请求体**：

```json
{
  "original_url": "https://www.newexample.com",
  "title": "新的标题",
  "description": "新的描述",
  "expire_at": "2025-12-31T23:59:59Z",
  "is_active": false
}
```

**参数说明**：

- `original_url` (可选): 原始URL地址，如果提供必须是有效URL
- `title` (可选): 网页标题
- `description` (可选): 描述信息
- `expire_at` (可选): 过期时间
- `is_active` (可选): 是否激活

**响应格式**：与创建短网址响应格式相同。

#### 3.5 删除短网址

**DELETE** `/api/v1/short_links/{id}`

删除指定ID的短网址。

**路径参数**：

- `id`: 短网址ID

**响应示例**：

```json
{
  "code": 0,
  "message": "删除成功"
}
```

#### 3.6 获取短网址统计

**GET** `/api/v1/short_links/{id}/statistics`

获取指定短网址的统计信息。

**路径参数**：

- `id`: 短网址ID

**查询参数**：

- `days` (可选): 统计天数，默认7天，最大365天

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "total_clicks": 150,
    "today_clicks": 10,
    "week_clicks": 45,
    "month_clicks": 120,
    "daily_statistics": [
      {
        "date": "2024-01-01",
        "click_count": 5
      },
      {
        "date": "2024-01-02",
        "click_count": 8
      }
    ]
  }
}
```

#### 3.7 批量创建短网址

**POST** `/api/v1/short_links/batch`

批量创建多个短网址。

**请求体**：

```json
{
  "urls": [
    "https://www.example1.com",
    "https://www.example2.com",
    "https://www.example3.com"
  ],
  "domain": "https://short.ly"
}
```

**参数说明**：

- `urls` (必填): URL列表，最少1个，最多100个
- `domain` (可选): 统一使用的域名

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "success": [
      {
        "id": 1,
        "short_code": "xyz789",
        "domain": "https://short.ly",
        "short_url": "https://short.ly/xyz789",
        "original_url": "https://www.example1.com",
        "title": "",
        "description": "",
        "expire_at": null,
        "is_active": true,
        "click_count": 0,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "failed": [
      {
        "url": "https://www.example2.com",
        "error": "无效的URL格式"
      }
    ]
  }
}
```

### 4. 短网址跳转

#### 4.1 短网址跳转

**GET** `/{code}`

通过短代码跳转到原始URL，并记录访问统计。支持GET参数透传。

**路径参数**：

- `code`: 短网址代码（字母数字组合）

**响应**：

- 成功：302重定向到原始URL
- 短网址不存在：渲染404页面
- 短网址过期：渲染过期页面
- 短网址禁用：渲染禁用页面
- 服务器错误：渲染错误页面

#### 4.2 预览短网址

**GET** `/preview/{code}`

预览短网址信息，不记录访问统计。

**路径参数**：

- `code`: 短网址代码

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "short_code": "abc123",
    "domain": "https://short.ly",
    "short_url": "https://short.ly/abc123",
    "original_url": "https://www.example.com"
  }
}
```

### 5. 域名管理

#### 5.1 创建域名配置

**POST** `/api/v1/domains`

添加新的短网址域名配置。

**请求体**：

```json
{
  "domain": "dwz.do",
  "protocol": "https",
  "site_name": "短网址服务",
  "icp_number": "京ICP备12345678号",
  "police_number": "京公网安备 11010802012345号",
  "is_active": true,
  "pass_query_params": false,
  "description": "主要短链域名"
}
```

**参数说明**：

- `domain` (必填): 域名
- `protocol` (必填): 协议，http或https
- `site_name` (可选): 网站名称
- `icp_number` (可选): ICP备案号码
- `police_number` (可选): 公安备案号码
- `is_active` (可选): 是否激活，默认true
- `pass_query_params` (可选): 是否透传GET参数，默认false
- `description` (可选): 描述

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "domain": "dwz.do",
    "protocol": "https",
    "site_name": "短网址服务",
    "icp_number": "京ICP备12345678号",
    "police_number": "京公网安备 11010802012345号",
    "is_active": true,
    "pass_query_params": false,
    "description": "主要短链域名",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 5.2 获取域名列表

**GET** `/api/v1/domains`

获取所有域名配置列表。

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "domain": "dwz.do",
        "protocol": "https",
        "site_name": "短网址服务",
        "icp_number": "京ICP备12345678号",
        "police_number": "京公网安备 11010802012345号",
        "is_active": true,
        "pass_query_params": false,
        "description": "主要短链域名",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 5.3 获取活跃域名列表

**GET** `/api/v1/domains/active`

获取所有启用状态的域名列表。

**响应格式**：包含`is_active`为`true`的域名。

```json
{
  "code": 0,
  "message": "操作成功",
  "data": [
    {
      "id": 1,
      "domain": "n3.ink",
      "protocol": "https",
      "site_name": "木雷短网址",
      "icp_number": "皖ICP备2024056083号-7",
      "police_number": "",
      "is_active": true,
      "pass_query_params": true,
      "description": "主要短链域名",
      "created_at": "2025-06-20T04:06:59.477+08:00",
      "updated_at": "2025-06-20T04:06:59.477+08:00"
    }
  ]
}
```

#### 5.4 更新域名配置

**PUT** `/api/v1/domains/{id}`

更新指定域名的配置。

**路径参数**：

- `id`: 域名配置ID

**请求体**：参数与创建域名配置相同，所有字段都可选。

**响应格式**：与创建域名配置响应格式相同。

#### 5.5 删除域名配置

**DELETE** `/api/v1/domains/{id}`

删除指定的域名配置。

**路径参数**：

- `id`: 域名配置ID

**响应示例**：

```json
{
  "code": 0,
  "message": "删除成功"
}
```

### 6. AB测试管理

#### 6.1 创建AB测试

**POST** `/api/v1/ab_tests`

为指定短网址创建AB测试。

**请求体**：

```json
{
  "short_link_id": 1,
  "name": "首页Banner测试",
  "description": "测试不同banner的点击率",
  "traffic_split": "equal",
  "start_time": "2024-01-15T00:00:00Z",
  "end_time": "2024-02-15T00:00:00Z",
  "variants": [
    {
      "name": "版本A",
      "target_url": "https://example.com/page-a",
      "weight": 50,
      "is_control": true,
      "description": "原始版本"
    },
    {
      "name": "版本B",
      "target_url": "https://example.com/page-b",
      "weight": 50,
      "is_control": false,
      "description": "新版本"
    }
  ]
}
```

**参数说明**：

- `short_link_id` (必填): 关联的短网址ID
- `name` (必填): AB测试名称
- `description` (可选): 描述
- `traffic_split` (可选): 流量分配方式，equal/weighted/custom
- `start_time` (可选): 开始时间
- `end_time` (可选): 结束时间
- `variants` (必填): 测试变体列表，至少2个

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "short_link_id": 1,
    "name": "首页Banner测试",
    "description": "测试不同banner的点击率",
    "status": "draft",
    "traffic_split": "equal",
    "start_time": "2024-01-15T00:00:00Z",
    "end_time": "2024-02-15T00:00:00Z",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "variants": [
      {
        "id": 1,
        "ab_test_id": 1,
        "name": "版本A",
        "target_url": "https://example.com/page-a",
        "weight": 50,
        "is_control": true,
        "description": "原始版本",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### 6.2 获取AB测试列表

**GET** `/api/v1/ab_tests`

分页获取AB测试列表。

**查询参数**：

- `page` (可选): 页码，默认1，最小值1
- `page_size` (可选): 每页数量，默认10，最大100
- `short_link_id` (可选): 按短网址ID筛选
- `status` (可选): 按状态筛选，draft/running/paused/completed

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "short_link_id": 1,
        "name": "首页Banner测试",
        "description": "测试不同banner的点击率",
        "status": "running",
        "traffic_split": "equal",
        "start_time": "2024-01-15T00:00:00Z",
        "end_time": "2024-02-15T00:00:00Z",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
        "variants": []
      }
    ],
    "total": 1,
    "page": 1,
    "size": 10
  }
}
```

#### 6.3 获取AB测试详情

**GET** `/api/v1/ab_tests/{id}`

根据ID获取AB测试详情。

**路径参数**：

- `id`: AB测试ID

**响应格式**：与创建AB测试响应格式相同。

#### 6.4 更新AB测试

**PUT** `/api/v1/ab_tests/{id}`

更新指定ID的AB测试信息。

**路径参数**：

- `id`: AB测试ID

**请求体**：

```json
{
  "name": "更新后的测试名称",
  "description": "更新后的描述",
  "status": "running",
  "traffic_split": "weighted",
  "start_time": "2024-01-20T00:00:00Z",
  "end_time": "2024-02-20T00:00:00Z",
  "is_active": true
}
```

#### 6.5 删除AB测试

**DELETE** `/api/v1/ab_tests/{id}`

删除指定ID的AB测试。

**路径参数**：

- `id`: AB测试ID

**响应示例**：

```json
{
  "code": 0,
  "message": "删除成功"
}
```

#### 6.6 启动AB测试

**POST** `/api/v1/ab_tests/{id}/start`

启动指定的AB测试。

**路径参数**：

- `id`: AB测试ID

**请求体**：

```json
{
  "start_time": "2024-01-15T00:00:00Z"
}
```

**参数说明**：

- `start_time` (可选): 启动时间，不提供则立即启动

#### 6.7 停止AB测试

**POST** `/api/v1/ab_tests/{id}/stop`

停止指定的AB测试。

**路径参数**：

- `id`: AB测试ID

**请求体**：

```json
{
  "end_time": "2024-02-15T00:00:00Z"
}
```

**参数说明**：

- `end_time` (可选): 停止时间，不提供则立即停止

#### 6.8 获取AB测试统计

**GET** `/api/v1/ab_tests/{id}/statistics`

获取AB测试的统计信息。

**路径参数**：

- `id`: AB测试ID

**查询参数**：

- `days` (可选): 统计天数，默认7天，最大365天

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "ab_test_id": 1,
    "total_clicks": 1000,
    "variant_stats": [
      {
        "variant": {
          "id": 1,
          "name": "版本A",
          "target_url": "https://example.com/page-a",
          "weight": 50,
          "is_control": true
        },
        "click_count": 480,
        "conversion_rate": 12.5,
        "percentage": 48.0
      },
      {
        "variant": {
          "id": 2,
          "name": "版本B",
          "target_url": "https://example.com/page-b",
          "weight": 50,
          "is_control": false
        },
        "click_count": 520,
        "conversion_rate": 15.2,
        "percentage": 52.0
      }
    ],
    "daily_stats": [
      {
        "date": "2024-01-15",
        "variants": {
          "1": 45,
          "2": 55
        }
      }
    ],
    "conversion_rate": 13.8,
    "winning_variant": {
      "id": 2,
      "name": "版本B"
    }
  }
}
```

### 7. 用户管理（需要认证）

#### 7.1 创建用户

**POST** `/api/v1/users`

创建新用户。需要管理员权限。

**请求体**：

```json
{
  "username": "newuser",
  "password": "password123",
  "real_name": "张三",
  "email": "user@example.com",
  "phone": "13800138000"
}
```

**参数说明**：

- `username` (必填): 用户名，3-50字符
- `password` (必填): 密码，6-50字符
- `real_name` (可选): 真实姓名，最多100字符
- `email` (可选): 邮箱地址
- `phone` (可选): 电话号码，最多20字符

#### 7.2 获取用户列表

**GET** `/api/v1/users`

分页获取用户列表。

**查询参数**：

- `page` (可选): 页码，默认1
- `page_size` (可选): 每页数量，默认10，最大100
- `username` (可选): 按用户名筛选
- `real_name` (可选): 按真实姓名筛选
- `status` (可选): 按状态筛选，0-禁用，1-启用

#### 7.3 获取用户详情

**GET** `/api/v1/users/{id}`

根据ID获取用户详情。

**路径参数**：

- `id`: 用户ID

#### 7.4 更新用户

**PUT** `/api/v1/users/{id}`

更新指定用户信息。

**路径参数**：

- `id`: 用户ID

**请求体**：

```json
{
  "real_name": "李四",
  "email": "user@example.com",
  "phone": "13800138000",
  "status": 1
}
```

#### 7.5 删除用户

**DELETE** `/api/v1/users/{id}`

删除指定用户。

**路径参数**：

- `id`: 用户ID

#### 7.6 重置用户密码

**POST** `/api/v1/users/{id}/reset-password`

管理员重置用户密码。

**路径参数**：

- `id`: 用户ID

**请求体**：

```json
{
  "new_password": "newpassword123"
}
```

### 8. 个人资料管理（需要认证）

#### 8.1 获取当前用户信息

**GET** `/api/v1/profile`

获取当前登录用户的信息。

#### 8.2 修改密码

**POST** `/api/v1/profile/change-password`

修改当前用户的密码。

**请求体**：

```json
{
  "old_password": "oldpassword",
  "new_password": "newpassword123"
}
```

### 9. API Token管理（需要认证）

#### 9.1 创建Token

**POST** `/api/v1/tokens`

为当前用户创建API Token。

**请求体**：

```json
{
  "token_name": "API Token",
  "expire_at": "2024-12-31T23:59:59Z"
}
```

**参数说明**：

- `token_name` (必填): Token名称，最多100字符
- `expire_at` (可选): 过期时间，null表示永不过期

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "id": 1,
    "token_name": "API Token",
    "token": "tok_1234567890abcdef",
    "expire_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### 9.2 获取Token列表

**GET** `/api/v1/tokens`

获取当前用户的Token列表。

**查询参数**：

- `page` (可选): 页码，默认1
- `page_size` (可选): 每页数量，默认10，最大100
- `token_name` (可选): 按Token名称筛选
- `status` (可选): 按状态筛选，0-禁用，1-启用

#### 9.3 删除Token

**DELETE** `/api/v1/tokens/{token_id}`

删除指定的Token。

**路径参数**：

- `token_id`: Token ID

### 10. 操作日志（需要认证）

#### 10.1 获取操作日志

**GET** `/api/v1/logs`

获取系统操作日志。

**查询参数**：

- `page` (可选): 页码，默认1
- `page_size` (可选): 每页数量，默认10，最大100
- `user_id` (可选): 按用户ID筛选
- `username` (可选): 按用户名筛选
- `operation` (可选): 按操作类型筛选
- `resource` (可选): 按资源类型筛选
- `method` (可选): 按HTTP方法筛选
- `status` (可选): 按状态筛选，0-失败，1-成功
- `start_time` (可选): 开始时间，格式：2024-01-01 00:00:00
- `end_time` (可选): 结束时间，格式：2024-12-31 23:59:59

**响应示例**：

```json
{
  "code": 0,
  "message": "成功",
  "data": {
    "list": [
      {
        "id": 1,
        "user_id": 1,
        "username": "admin",
        "operation": "创建短网址",
        "resource": "short_link",
        "resource_id": "1",
        "method": "POST",
        "path": "/api/v1/short_links",
        "request_body": "{\"original_url\":\"https://example.com\"}",
        "response_code": 200,
        "response_body": "{\"code\":0,\"message\":\"成功\"}",
        "ip": "127.0.0.1",
        "user_agent": "Mozilla/5.0...",
        "execute_time": 150,
        "status": 1,
        "error_message": "",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "page_size": 10,
      "pages": 10
    }
  }
}
```

## 错误码说明

| 错误码 | 说明               |
| ------ | ------------------ |
| 0      | 成功               |
| 400    | 请求参数错误       |
| 401    | 未授权访问         |
| 403    | 禁止访问           |
| 404    | 资源不存在         |
| 409    | 资源冲突           |
| 410    | 资源已过期         |
| 500    | 内部服务器错误     |
| 1001   | 短网址不存在       |
| 1002   | 短网址已过期       |
| 1003   | 短网址已禁用       |
| 1004   | 自定义短代码已存在 |
| 1005   | 无效的自定义短代码 |
| 1006   | 域名不允许         |
| 1007   | 生成短代码失败     |

## 使用示例

### 登录获取Token

```bash
curl -X POST http://localhost:8080/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password"
  }'
```

### 创建短网址

```bash
curl -X POST http://localhost:8080/api/v1/short_links \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "original_url": "https://www.example.com",
    "custom_code": "example"
  }'
```

### 访问短网址

```bash
curl -L http://localhost:8080/example
```

### 获取统计信息

```bash
curl http://localhost:8080/api/v1/short_links/1/statistics?days=30 \
  -H "Authorization: Bearer {token}"
```

### 创建API Token

```bash
curl -X POST http://localhost:8080/api/v1/tokens \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "token_name": "My API Token"
  }'
```

## 配置说明

在 `config.yaml` 中可以配置以下短网址相关参数：

```yaml
# 短链接配置
shortlink:
  domain: 'http://localhost:8080' # 默认域名
  length: 6 # 短代码长度
  custom_length: true # 是否允许自定义长度

# 数据库配置
database:
  host: 'localhost'
  port: 3306
  username: 'root'
  password: 'password'
  database: 'dwz_server'

# Redis配置
redis:
  host: 'localhost'
  port: 6379
  password: ''
  database: 0
```

## 数据库表结构

### short_links 表

- `id`: 主键
- `short_code`: 短网址代码
- `domain`: 域名
- `original_url`: 原始URL
- `title`: 标题
- `description`: 描述
- `expire_at`: 过期时间
- `is_active`: 是否激活
- `click_count`: 点击次数
- `creator_ip`: 创建者IP
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `deleted_at`: 删除时间

### click_statistics 表

- `id`: 主键
- `short_link_id`: 短网址ID
- `ip`: 访问者IP
- `user_agent`: 用户代理
- `referer`: 来源页面
- `country`: 国家
- `city`: 城市
- `click_date`: 点击时间
- `created_at`: 创建时间

### domains 表

- `id`: 主键
- `domain`: 域名
- `protocol`: 协议
- `site_name`: 网站名称
- `icp_number`: ICP备案号码
- `police_number`: 公安备案号码
- `is_active`: 是否激活
- `pass_query_params`: 是否透传GET参数
- `description`: 描述
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `deleted_at`: 删除时间

### users 表

- `id`: 主键
- `username`: 用户名
- `password`: 密码哈希
- `real_name`: 真实姓名
- `email`: 邮箱
- `phone`: 电话
- `status`: 状态
- `last_login`: 最后登录时间
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `deleted_at`: 删除时间

### user_tokens 表

- `id`: 主键
- `user_id`: 用户ID
- `token_name`: Token名称
- `token`: Token值
- `last_used_at`: 最后使用时间
- `expire_at`: 过期时间
- `status`: 状态
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `deleted_at`: 删除时间

### ab_tests 表

- `id`: 主键
- `short_link_id`: 短网址ID
- `name`: 测试名称
- `description`: 描述
- `status`: 状态
- `traffic_split`: 流量分配方式
- `start_time`: 开始时间
- `end_time`: 结束时间
- `is_active`: 是否激活
- `created_at`: 创建时间
- `updated_at`: 更新时间
- `deleted_at`: 删除时间

### operation_logs 表

- `id`: 主键
- `user_id`: 用户ID
- `operation`: 操作类型
- `resource`: 资源类型
- `resource_id`: 资源ID
- `method`: HTTP方法
- `path`: 请求路径
- `request_body`: 请求体
- `response_code`: 响应码
- `response_body`: 响应体
- `ip`: IP地址
- `user_agent`: 用户代理
- `execute_time`: 执行时间
- `status`: 状态
- `error_message`: 错误信息
- `created_at`: 创建时间
