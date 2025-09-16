import { defineConfig } from '@vben/vite-config';

export default defineConfig(async () => {
  return {
    application: {
      // 设置 base 路径为 /admin/，确保所有静态资源都正确加载
      base: '/admin/',
    },
    vite: {
      base: '/admin/',
      server: {
        proxy: {
          '/api': {
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ''),
            // mock代理目标地址
            target: 'http://localhost:5320/api',
            ws: true,
          },
        },
      },
    },
  };
});
