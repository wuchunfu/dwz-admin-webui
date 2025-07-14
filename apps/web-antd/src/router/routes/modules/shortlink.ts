import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:link',
      order: 1000,
      title: '短网址管理',
    },
    name: 'ShortLink',
    path: '/shortlink',
    children: [
      {
        name: 'ShortOverview',
        path: '/shortlink/overview',
        component: () => import('#/views/shortlink/overview.vue'),
        meta: {
          icon: 'lucide:area-chart',
          title: '概览',
        },
      },
      {
        name: 'ShortLinkList',
        path: '/shortlink/list',
        component: () => import('#/views/shortlink/index.vue'),
        meta: {
          icon: 'lucide:list',
          title: '短网址列表',
        },
      },
      {
        name: 'DomainManagement',
        path: '/shortlink/domains',
        component: () => import('#/views/shortlink/domain.vue'),
        meta: {
          icon: 'lucide:globe',
          title: '域名管理',
        },
      },
      {
        name: 'ABTestManagement',
        path: '/shortlink/ab-tests',
        component: () => import('#/views/shortlink/ab-test.vue'),
        meta: {
          icon: 'lucide:split',
          title: 'AB测试',
        },
      },
      {
        name: 'ShortLinkAnalytics',
        path: '/shortlink/analytics',
        component: () => import('#/views/shortlink/analytics.vue'),
        meta: {
          icon: 'lucide:bar-chart',
          title: '统计分析',
        },
      },
    ],
  },
  {
    meta: {
      icon: 'lucide:settings',
      order: 2000,
      title: '系统管理',
    },
    name: 'System',
    path: '/system',
    children: [
      {
        name: 'UserManagement',
        path: '/system/users',
        component: () => import('#/views/system/users.vue'),
        meta: {
          icon: 'lucide:users',
          title: '用户管理',
        },
      },
      {
        name: 'TokenManagement',
        path: '/system/tokens',
        component: () => import('#/views/system/tokens.vue'),
        meta: {
          icon: 'lucide:key',
          title: 'API Token',
        },
      },
      {
        name: 'OperationLogs',
        path: '/system/logs',
        component: () => import('#/views/system/logs.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: '操作日志',
        },
      },
      {
        name: 'SystemHealth',
        path: '/system/health',
        component: () => import('#/views/system/health.vue'),
        meta: {
          icon: 'lucide:heart',
          title: '系统健康',
        },
      },
    ],
  },
  {
    name: 'UserProfile',
    path: '/profile',
    component: () => import('#/views/profile/index.vue'),
    meta: {
      icon: 'lucide:user',
      title: '个人资料',
      order: 3000,
    },
  },
];

export default routes;
