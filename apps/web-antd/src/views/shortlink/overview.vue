<template>
  <Page description="系统运行状况总览，包括关键指标、近期活动和热门链接等信息" title="系统概览">
    <!-- 关键指标 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card class="text-center">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
            <UserRoundPen class="w-6 h-6 text-blue-600" />
          </div>
          <div class="text-2xl font-bold text-gray-800 mb-1">
            {{ dashboardData?.statistics?.total_users || 0 }}
          </div>
          <div class="text-sm text-gray-500">总用户数</div>
          <div class="text-xs text-green-600 mt-1">
            活跃: {{ dashboardData?.statistics?.active_users || 0 }}
          </div>
        </div>
      </Card>

      <Card class="text-center">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <ExternalLink class="w-6 h-6 text-green-600" />
          </div>
          <div class="text-2xl font-bold text-gray-800 mb-1">
            {{ dashboardData?.statistics?.total_short_links || 0 }}
          </div>
          <div class="text-sm text-gray-500">短链接数</div>
          <div class="text-xs text-blue-600 mt-1">
            今日: {{ dashboardData?.statistics?.today_clicks || 0 }} 次点击
          </div>
        </div>
      </Card>

      <Card class="text-center">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
            <Expand class="w-6 h-6 text-purple-600" />
          </div>
          <div class="text-2xl font-bold text-gray-800 mb-1">
            {{ formatNumber(dashboardData?.statistics?.total_clicks || 0) }}
          </div>
          <div class="text-sm text-gray-500">总点击量</div>
          <div class="text-xs text-purple-600 mt-1">
            本月: {{ formatNumber(dashboardData?.statistics?.month_clicks || 0) }}
          </div>
        </div>
      </Card>

      <Card class="text-center">
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
            <Settings class="w-6 h-6 text-orange-600" />
          </div>
          <div class="text-2xl font-bold text-gray-800 mb-1">
            {{ dashboardData?.statistics?.total_ab_tests || 0 }}
          </div>
          <div class="text-sm text-gray-500">AB测试</div>
          <div class="text-xs text-orange-600 mt-1">
            运行中: {{ dashboardData?.statistics?.running_ab_tests || 0 }}
          </div>
        </div>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 近期活动 -->
      <Card title="近期活动" :loading="loading">
        <template #extra>
          <Button size="small" @click="loadDashboardData">
            <RotateCw class="w-4 h-4" />
          </Button>
        </template>
        
        <div v-if="dashboardData?.recent_activities?.length" class="space-y-3">
          <div 
            v-for="activity in dashboardData.recent_activities.slice(0, 10)" 
            :key="activity.id"
            class="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ activity.description }}
              </p>
              <p class="text-xs text-gray-500">
                {{ activity.user }} · {{ formatTime(activity.created_at) }}
              </p>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          <BookOpenText class="w-8 h-8 mx-auto mb-2" />
          <p>暂无近期活动</p>
        </div>
      </Card>

      <!-- 热门链接 -->
      <Card title="热门链接" :loading="loading">
        <template #extra>
          <Button size="small" @click="loadDashboardData">
            <RotateCw class="w-4 h-4" />
          </Button>
        </template>
        
        <div v-if="dashboardData?.top_links?.length" class="space-y-3">
          <div 
            v-for="(link, index) in dashboardData.top_links.slice(0, 10)" 
            :key="link.id"
            class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div class="flex-shrink-0 w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {{ index + 1 }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">
                {{ link.title || link.original_url }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ link.short_url }}
              </p>
            </div>
            <div class="flex-shrink-0 text-right">
              <p class="text-sm font-bold text-blue-600">{{ formatNumber(link.click_count) }}</p>
              <p class="text-xs text-gray-500">点击</p>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          <ExternalLink class="w-8 h-8 mx-auto mb-2" />
          <p>暂无链接数据</p>
        </div>
      </Card>
    </div>

    <!-- 系统信息 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card title="域名状态">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">总域名数</span>
            <span class="font-semibold">{{ dashboardData?.statistics?.total_domains || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">活跃域名</span>
            <span class="font-semibold text-green-600">{{ dashboardData?.statistics?.active_domains || 0 }}</span>
          </div>
        </div>
      </Card>

      <Card title="Token状态">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">总Token数</span>
            <span class="font-semibold">{{ dashboardData?.statistics?.total_tokens || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">活跃Token</span>
            <span class="font-semibold text-green-600">{{ dashboardData?.statistics?.active_tokens || 0 }}</span>
          </div>
        </div>
      </Card>

      <Card title="系统状态">
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">系统状态</span>
            <Tag :color="systemStatus.color">{{ systemStatus.text }}</Tag>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">最后检查</span>
            <span class="text-xs text-gray-500">{{ lastUpdateTime }}</span>
          </div>
        </div>
      </Card>
    </div>
  </Page>
</template>

<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { ref, onMounted, computed } from 'vue';
import { 
  Card, 
  Button, 
  Tag, 
  message 
} from 'ant-design-vue';
import { 
  UserRoundPen, 
  ExternalLink, 
  Expand, 
  Settings, 
  RotateCw, 
  BookOpenText 
} from '@vben/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { StatisticsApi, type DashboardData } from '#/api';

// 启用dayjs相对时间插件
dayjs.extend(relativeTime);

// 响应式数据
const loading = ref(false);
const dashboardData = ref<DashboardData | null>(null);

// 计算属性
const systemStatus = computed(() => {
  // 简单的系统状态计算逻辑
  const stats = dashboardData.value?.statistics;
  if (!stats) {
    return { color: 'default', text: '未知' };
  }
  
  if (stats.active_users > 0 && stats.total_clicks > 0) {
    return { color: 'green', text: '正常' };
  } else if (stats.total_users > 0) {
    return { color: 'orange', text: '低活跃' };
  } else {
    return { color: 'red', text: '异常' };
  }
});

const lastUpdateTime = computed(() => {
  return dayjs().format('HH:mm:ss');
});

// 方法 - 移除仪表板数据加载，因为API接口不存在
const loadDashboardData = async () => {
  loading.value = true;
  try {
    // 模拟一些基础数据，实际应该从其他可用接口获取
    dashboardData.value = {
      statistics: {
        total_users: 0,
        active_users: 0,
        total_short_links: 0,
        total_clicks: 0,
        today_clicks: 0,
        week_clicks: 0,
        month_clicks: 0,
        total_domains: 0,
        active_domains: 0,
        total_ab_tests: 0,
        running_ab_tests: 0,
        total_tokens: 0,
        active_tokens: 0,
      },
      recent_activities: [],
      top_links: [],
    };
    message.info('当前为演示数据，统计接口暂未实现');
  } catch (error: any) {
    console.error('Failed to load dashboard data:', error);
    message.error('加载仪表板数据失败');
  } finally {
    loading.value = false;
  }
};

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const formatTime = (timestamp: string) => {
  return dayjs(timestamp).fromNow();
};

// 生命周期
onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.ant-card {
  @apply shadow-sm hover:shadow-md transition-shadow;
}
</style> 
