# DWZ 管理系统

一个基于 Docker 的短链接管理系统，包含后端 API 服务和前端管理界面。

## 🚀 快速开始

### 前置条件
- Docker 20.10+
- Docker Compose 2.0+

### 一键启动
```bash
# 1. 克隆或下载项目文件
git clone [your-repo-url] dwz-admin
cd dwz-admin

# 2. 创建配置目录
mkdir -p config

# 3. 启动服务
docker-compose up -d

# 4. 访问管理界面
open http://localhost:8081
```

### 服务说明
- **前端管理界面**: http://localhost:8081
- **后端 API**: 内部端口 8080（不对外暴露）

## 📖 详细文档

完整的安装和配置指南，请参考：[INSTALL.md](./INSTALL.md)

## 🔧 常用命令

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 更新服务
docker-compose pull && docker-compose up -d
```

## 🛠️ 自定义配置

### 修改端口
如果 8081 端口被占用，修改 `docker-compose.yml`:
```yaml
ports:
  - "8082:80"  # 改为其他端口
```

### 添加配置文件
将配置文件放在 `config/` 目录下，会自动挂载到容器中。

## 🔍 故障排除

### 常见问题
1. **端口被占用**: 修改端口映射
2. **服务启动失败**: 查看日志 `docker-compose logs`
3. **无法访问**: 确保防火墙允许对应端口

### 获取帮助
```bash
# 检查服务状态
docker-compose ps

# 查看详细日志
docker-compose logs [service-name]

# 重置环境
docker-compose down && docker-compose up -d
```

## 📝 更新日志

- v1.0.0: 初始版本，支持基本的容器化部署

---

**注意**: 生产环境请参考 [INSTALL.md](./INSTALL.md) 进行完整的安全配置。

