# 使用 Node.js 作为基础镜像
FROM node:alpine AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 pnpm-lock.yaml
COPY . .

# 安装 pnpm
# RUN npm config set registry https://registry.npmmirror.com && npm install -g pnpm && pnpm config set registry https://registry.npmmirror.com && pnpm install
RUN npm install -g pnpm && pnpm install

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm add -g cross-env && pnpm build:antd

# 使用 nginx 作为基础镜像
FROM nginx:alpine

# 复制构建产物到 nginx 的默认静态文件目录
COPY --from=build /app/apps/web-antd/dist /usr/share/nginx/html/admin

# 创建一个简单的 nginx 配置来处理 SPA 路由
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
    } \
    location /health { \
        access_log off; \
        return 200 "healthy\n"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
