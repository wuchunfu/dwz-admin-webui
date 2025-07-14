<script setup lang="ts">
import type { ShortLink, ShortLinkStatistics, SystemStatistics } from '#/api';

import { nextTick, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Empty,
  message,
  RangePicker,
  Select,
  SelectOption,
  Space,
  Spin,
  Table,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { ShortLinkApi, StatisticsApi } from '#/api';

// 热门短网址类型定义
interface TopShortLink {
  id: number;
  short_url: string;
  original_url: string;
  click_count: number;
  title?: string;
}

// 响应式数据
const loading = ref(false);
const loadingTopLinks = ref(false);
const shortLinks = ref<ShortLink[]>([]);
const topShortLinks = ref<TopShortLink[]>([]);
const selectedShortLink = ref<number | undefined>();
const timeRange = ref('30');
const customDateRange = ref<[dayjs.Dayjs, dayjs.Dayjs] | undefined>();
const currentStats = ref<null | ShortLinkStatistics>(null);
const globalStats = ref<null | SystemStatistics>(null);
const shortLinkStats = ref<any[]>([]);

// 每日统计表格列
const dailyStatsColumns = [
  {
    title: '日期',
    dataIndex: 'date',
    width: 120,
  },
  {
    title: '点击数',
    dataIndex: 'click_count',
    width: 100,
    sorter: (a: any, b: any) => a.click_count - b.click_count,
  },
];

// 短链统计表格列
const shortLinkStatsColumns = [
  {
    title: '短网址',
    dataIndex: 'short_url',
    width: 150,
    ellipsis: true,
  },
  {
    title: '标题',
    dataIndex: 'title',
    width: 120,
    ellipsis: true,
  },
  {
    title: '点击数',
    dataIndex: 'click_count',
    width: 80,
    sorter: (a: any, b: any) => a.click_count - b.click_count,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 100,
    customRender: ({ text }: { text: string }) => dayjs(text).format('MM-DD'),
  },
];

// 方法
const loadShortLinks = async () => {
  try {
    const response = await ShortLinkApi.getList({
      page: 1,
      page_size: 100,
    });
    shortLinks.value = response.list;
  } catch {
    message.error('加载短网址失败');
  }
};

const loadGlobalStats = async () => {
  try {
    const stats = await StatisticsApi.getSystemStatistics();
    globalStats.value = stats;
  } catch {
    message.error('加载全局统计失败');
  }
};

const loadTopShortLinks = async () => {
  loadingTopLinks.value = true;
  try {
    const dashboardData = await StatisticsApi.getDashboardData();
    topShortLinks.value = dashboardData.top_links || [];
  } catch {
    message.error('加载热门短网址失败');
  } finally {
    loadingTopLinks.value = false;
  }
};

const loadShortLinkStats = async () => {
  try {
    const days = Number(timeRange.value) || 30;
    const stats = await StatisticsApi.getShortLinkStatistics({ days });
    shortLinkStats.value = stats || [];
  } catch {
    message.error('加载短链统计失败');
  }
};

const loadStats = async () => {
  if (!selectedShortLink.value) {
    currentStats.value = null;
    return;
  }

  loading.value = true;
  try {
    let days = Number(timeRange.value);
    if (customDateRange.value) {
      const [start, end] = customDateRange.value;
      days = end.diff(start, 'day') + 1;
    }

    const stats = await ShortLinkApi.getStatistics(
      selectedShortLink.value,
      days,
    );
    currentStats.value = stats;

    // 渲染图表
    nextTick(() => {
      renderClickTrendChart();
    });
  } catch {
    message.error('获取统计数据失败');
    currentStats.value = null;
  } finally {
    loading.value = false;
  }
};

const loadData = () => {
  loadStats();
  loadShortLinkStats();
};

const handleShortLinkChange = () => {
  loadStats();
};

const handleTimeRangeChange = () => {
  customDateRange.value = undefined;
  loadStats();
  loadShortLinkStats();
};

const handleCustomDateChange = () => {
  if (customDateRange.value) {
    timeRange.value = '';
    loadStats();
    loadShortLinkStats();
  }
};

const disabledDate = (current: dayjs.Dayjs) => {
  return current && current > dayjs().endOf('day');
};

const renderClickTrendChart = () => {
  const chartDom = document.querySelector('#clickTrendChart');
  if (!chartDom) return;

  // 根据是否有选中的短网址来决定显示哪个数据
  let data: Array<{ click_count: number; date: string }> = [];

  if (currentStats.value?.daily_statistics?.length) {
    data = currentStats.value.daily_statistics;
  } else if (shortLinkStats.value?.length) {
    // 如果没有选中短网址，显示全局短链统计数据
    data = shortLinkStats.value.slice(0, 30); // 限制显示30天
  }

  if (data.length === 0) return;

  const maxCount = Math.max(...data.map((d) => d.click_count));

  chartDom.innerHTML = `
    <div class="p-4 h-full">
      <div class="h-full flex items-end space-x-1">
        ${data
          .map(
            (item, index) => `
          <div class="flex-1 flex flex-col items-center group">
            <div class="bg-blue-500 w-full rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                 style="height: ${maxCount > 0 ? (item.click_count / maxCount) * 180 : 0}px; min-height: 2px;"
                 title="日期: ${item.date}, 点击数: ${item.click_count}">
            </div>
            <div class="text-xs text-gray-500 mt-1 transform rotate-45 origin-bottom-left">
              ${item.date ? item.date.slice(5) : `第${index + 1}天`}
            </div>
            <div class="text-xs text-gray-700 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              ${item.click_count}
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>
  `;
};

// 生命周期
onMounted(() => {
  // loadShortLinks();
  // loadGlobalStats();
  // loadTopShortLinks();
  // loadShortLinkStats();
});
</script>

<template>
  <Page
    description="分析短网址的访问数据，了解用户行为和点击趋势"
    title="统计分析"
  >
    <!-- 筛选器 -->
    <Card class="mb-6" title="数据筛选">
      <Space>
        <Select
          v-model:value="selectedShortLink"
          placeholder="选择短网址"
          style="width: 300px"
          allow-clear
          @change="handleShortLinkChange"
        >
          <SelectOption
            v-for="link in shortLinks"
            :key="link.id"
            :value="link.id"
          >
            {{ link.short_url }} - {{ link.title || link.original_url }}
          </SelectOption>
        </Select>
        <Select
          v-model:value="timeRange"
          style="width: 150px"
          @change="handleTimeRangeChange"
        >
          <SelectOption value="7">最近7天</SelectOption>
          <SelectOption value="30">最近30天</SelectOption>
          <SelectOption value="90">最近90天</SelectOption>
          <SelectOption value="365">最近一年</SelectOption>
        </Select>
        <RangePicker
          v-model:value="customDateRange"
          :disabled-date="disabledDate"
          @change="handleCustomDateChange"
        />
        <Button @click="loadData">刷新</Button>
      </Space>
    </Card>

    <!-- 全局统计卡片 -->
    <Card class="mb-6" title="全局统计概览">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <div class="flex items-center">
            <div class="rounded-lg bg-blue-100 p-2">
              <svg
                class="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">总短链数</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ globalStats?.total_short_links || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <div class="flex items-center">
            <div class="rounded-lg bg-green-100 p-2">
              <svg
                class="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">全站总点击</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ globalStats?.total_clicks || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <div class="flex items-center">
            <div class="rounded-lg bg-orange-100 p-2">
              <svg
                class="h-6 w-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">今日点击</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ globalStats?.today_clicks || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <div class="flex items-center">
            <div class="rounded-lg bg-purple-100 p-2">
              <svg
                class="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">本月点击</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ globalStats?.month_clicks || 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 选中短网址统计卡片 -->
    <Card class="mb-6" title="单个短网址统计">
      <div v-if="!selectedShortLink" class="py-8 text-center text-gray-500">
        <p>请选择一个短网址查看详细统计数据</p>
      </div>
      <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <div class="flex items-center">
            <div class="rounded-lg bg-blue-100 p-2">
              <svg
                class="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.122 2.122"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">总点击数</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ currentStats?.total_clicks || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <div class="flex items-center">
            <div class="rounded-lg bg-green-100 p-2">
              <svg
                class="h-6 w-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">今日点击</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ currentStats?.today_clicks || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <div class="flex items-center">
            <div class="rounded-lg bg-orange-100 p-2">
              <svg
                class="h-6 w-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">本周点击</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ currentStats?.week_clicks || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-lg border bg-white p-6 shadow-sm">
          <div class="flex items-center">
            <div class="rounded-lg bg-purple-100 p-2">
              <svg
                class="h-6 w-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">本月点击</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ currentStats?.month_clicks || 0 }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- 图表区域 -->
    <div class="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- 点击趋势图 -->
      <Card title="点击趋势">
        <div class="h-64">
          <Empty
            v-if="
              !currentStats?.daily_statistics?.length && !shortLinkStats?.length
            "
            description="暂无数据"
          />
          <div v-else id="clickTrendChart" class="h-full w-full"></div>
        </div>
      </Card>

      <!-- 短网址排行 -->
      <Card title="热门短网址排行">
        <Spin :spinning="loadingTopLinks">
          <div class="space-y-4">
            <Empty
              v-if="topShortLinks.length === 0"
              description="暂无排行数据"
            />
            <div
              v-for="(item, index) in topShortLinks"
              :key="item.id"
              class="flex items-center justify-between rounded bg-gray-50 p-3 transition-colors hover:bg-gray-100"
            >
              <div class="flex items-center">
                <div
                  class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100"
                >
                  <span class="text-sm font-medium text-blue-800">{{
                    index + 1
                  }}</span>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-gray-900">
                    {{ item.short_url }}
                  </p>
                  <p class="max-w-xs truncate text-sm text-gray-500">
                    {{ item.title || item.original_url }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">
                  {{ item.click_count }}
                </p>
                <p class="text-xs text-gray-500">点击</p>
              </div>
            </div>
          </div>
        </Spin>
      </Card>
    </div>

    <!-- 详细统计表格 -->
    <Card title="详细统计数据">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- 每日统计详情 -->
        <div>
          <h4 class="mb-4 text-lg font-medium">每日点击统计</h4>
          <Table
            :columns="dailyStatsColumns"
            :data-source="currentStats?.daily_statistics || []"
            :pagination="false"
            size="small"
            :scroll="{ y: 300 }"
          />
        </div>

        <!-- 短链统计数据 -->
        <div>
          <h4 class="mb-4 text-lg font-medium">短链统计数据</h4>
          <Table
            :columns="shortLinkStatsColumns"
            :data-source="shortLinkStats || []"
            :pagination="false"
            size="small"
            :scroll="{ y: 300 }"
          />
        </div>
      </div>
    </Card>
  </Page>
</template>

<style scoped>
.ant-table-wrapper {
  @apply rounded-md bg-white shadow-sm;
}

#clickTrendChart {
  min-height: 200px;
}

.ant-card {
  @apply border border-gray-200 shadow-sm;
}

.ant-card-head-title {
  @apply font-semibold text-gray-800;
}
</style>
