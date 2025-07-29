# 使用 nginx 作为基础镜像
FROM nginx:alpine

ENV TZ=Asia/Shanghai

# 复制构建产物到 nginx 的默认静态文件目录
COPY ./apps/web-antd/dist /usr/share/nginx/html/admin

# 复制 nginx 配置
COPY ./scripts/deploy/dwz-admin-webui.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
