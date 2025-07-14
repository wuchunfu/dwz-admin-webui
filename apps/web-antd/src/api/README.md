# 短网址服务 API 客户端

本目录包含了短网址服务的所有API接口客户端实现，基于API文档完整实现了所有功能模块。

## 目录结构

```
src/api/
├── core/           # 核心API（认证、用户信息等）
├── shortlink.ts    # 短网址管理API
├── ab-test.ts      # AB测试管理API  
├── user-management.ts  # 用户管理API
├── profile.ts      # 个人资料管理API
├── token.ts        # API Token管理API
├── logs.ts         # 操作日志API
├── health.ts       # 健康检查API
├── request.ts      # 请求客户端配置
├── examples.ts     # API使用示例
├── index.ts        # API模块导出
└── README.md       # 本文档
```

## 功能模块

### 1. 用户认证 (core/auth.ts)
- ✅ 用户登录
- ✅ 用户登出
- ✅ Token刷新
- ✅ 获取权限码

### 2. 短网址管理 (shortlink.ts)
- ✅ 创建短网址
- ✅ 获取短网址列表（分页、筛选、搜索）
- ✅ 获取短网址详情
- ✅ 更新短网址
- ✅ 删除短网址
- ✅ 批量创建短网址
- ✅ 获取短网址统计
- ✅ 预览短网址

### 3. 域名管理 (shortlink.ts)
- ✅ 创建域名配置
- ✅ 获取域名列表
- ✅ 获取活跃域名列表
- ✅ 更新域名配置
- ✅ 删除域名配置

### 4. AB测试管理 (ab-test.ts)
- ✅ 创建AB测试
- ✅ 获取AB测试列表
- ✅ 获取AB测试详情
- ✅ 更新AB测试
- ✅ 删除AB测试
- ✅ 启动AB测试
- ✅ 停止AB测试
- ✅ 获取AB测试统计

### 5. 用户管理 (user-management.ts)
- ✅ 创建用户
- ✅ 获取用户列表
- ✅ 获取用户详情
- ✅ 更新用户
- ✅ 删除用户
- ✅ 重置用户密码

### 6. 个人资料管理 (profile.ts)
- ✅ 获取当前用户信息
- ✅ 修改密码

### 7. API Token管理 (token.ts)
- ✅ 创建Token
- ✅ 获取Token列表
- ✅ 删除Token

### 8. 操作日志 (logs.ts)
- ✅ 获取操作日志（支持多种筛选条件）

### 9. 健康检查 (health.ts)
- ✅ 获取健康状态详细信息
- ✅ 简单健康检查

## 使用方法

### 基本使用

```typescript
import { ShortLinkApi, DomainApi, ABTestApi } from '@/api';

// 创建短网址
const shortLink = await ShortLinkApi.create({
  original_url: 'https://www.example.com',
  custom_code: 'example',
  title: '示例网站'
});

// 获取域名列表
const domains = await DomainApi.getList();

// 创建AB测试
const abTest = await ABTestApi.create({
  short_link_id: 1,
  name: '测试名称',
  variants: [
    { name: '版本A', target_url: 'https://a.com', weight: 50, is_control: true },
    { name: '版本B', target_url: 'https://b.com', weight: 50, is_control: false }
  ]
});
```

### 错误处理

所有API都会返回统一的错误格式，可以通过try-catch捕获：

```typescript
try {
  const result = await ShortLinkApi.create({
    original_url: 'https://www.example.com'
  });
  console.log('创建成功:', result);
} catch (error) {
  console.error('创建失败:', error.message);
}
```

### 分页数据处理

对于有分页的接口，返回数据格式统一为：

```typescript
interface ListResponse<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}
```

使用示例：

```typescript
const { list, total, page, size } = await ShortLinkApi.getList({
  page: 1,
  page_size: 10,
  keyword: '搜索关键词'
});

console.log(`第${page}页，共${total}条数据，每页${size}条`);
list.forEach(item => {
  console.log(item.short_url, item.original_url);
});
```

## 类型定义

所有API都提供了完整的TypeScript类型定义，包括：

- 请求参数类型
- 响应数据类型
- 枚举类型
- 通用类型

这些类型定义可以帮助开发者：

1. 获得IDE智能提示
2. 编译时类型检查
3. 更好的代码文档

## 请求配置

API客户端基于 `@vben/request` 构建，支持：

- 自动token认证
- 请求/响应拦截器
- 错误统一处理
- 国际化支持

详细配置请参考 `request.ts` 文件。

## 示例代码

完整的API使用示例请参考 `examples.ts` 文件，包含了所有模块的使用方法。

## 注意事项

1. 所有需要认证的接口都需要先登录获取token
2. API接口基于RESTful规范设计
3. 日期时间格式统一使用ISO 8601格式
4. 分页参数从1开始计数
5. 删除操作不可恢复，请谨慎使用

## 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 资源冲突 |
| 410 | 资源已过期 |
| 500 | 内部服务器错误 |
| 1001 | 短网址不存在 |
| 1002 | 短网址已过期 |
| 1003 | 短网址已禁用 |
| 1004 | 自定义短代码已存在 |
| 1005 | 无效的自定义短代码 |
| 1006 | 域名不允许 |
| 1007 | 生成短代码失败 | 
