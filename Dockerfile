FROM node:22-slim AS builder

ENV TZ=Asia/Shanghai

RUN npm i -g corepack

WORKDIR /app

# copy package.json and pnpm-lock.yaml to workspace
COPY . /app

# 安装 pnpm
RUN npm config set registry https://mirrors.cloud.tencent.com/npm/ && npm install -g pnpm && pnpm config set registry https://mirrors.cloud.tencent.com/npm/ && pnpm install

RUN pnpm build:antd --filter=\!./docs

RUN echo "Builder Success 🎉"

# 使用 nginx 作为基础镜像
FROM nginx:alpine

# 复制构建产物到 nginx 的默认静态文件目录
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html/admin
# 复制 nginx 配置
COPY --from=builder /app/scripts/deploy/dwz-admin-webui.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
