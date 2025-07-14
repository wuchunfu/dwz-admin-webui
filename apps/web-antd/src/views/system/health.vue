<template>
  <Page description="实时监控系统健康状态，包括数据库连接、缓存状态等关键指标" title="系统健康监控">
    <!-- 系统状态概览 -->
    <Card class="mb-4" title="系统状态">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="text-center p-4 border rounded-lg">
          <div class="text-2xl font-bold mb-2" :class="getStatusColor(healthStatus.status)">
            {{ getStatusText(healthStatus.status, 'system') }}
          </div>
          <div class="text-sm text-gray-500">系统状态</div>
          <div class="text-xs text-gray-400 mt-1" v-if="healthStatus.timestamp">
            {{ formatTime(healthStatus.timestamp) }}
          </div>
        </div>
        <div class="text-center p-4 border rounded-lg">
          <div class="text-2xl font-bold mb-2" :class="getStatusColor(healthStatus.database)">
            {{ getStatusText(healthStatus.database, 'database') }}
          </div>
          <div class="text-sm text-gray-500">数据库</div>
          <div class="text-xs text-gray-400 mt-1">MySQL</div>
        </div>
        <div class="text-center p-4 border rounded-lg">
          <div class="text-2xl font-bold mb-2" :class="getStatusColor(healthStatus.redis)">
            {{ getStatusText(healthStatus.redis, 'redis') }}
          </div>
          <div class="text-sm text-gray-500">缓存</div>
          <div class="text-xs text-gray-400 mt-1">Redis</div>
        </div>
      </div>
    </Card>

    <!-- 响应时间信息 -->
    <Card class="mb-4" title="性能指标">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="text-center p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-600 mb-1">{{ responseTime }}ms</div>
          <div class="text-sm text-gray-500">响应时间</div>
          <div class="text-xs" :class="getResponseTimeClass(responseTime)">{{ getResponseTimeStatus(responseTime) }}</div>
        </div>
        <div class="text-center p-4 bg-blue-50 rounded-lg">
          <div class="text-2xl font-bold text-blue-600 mb-1">{{ healthHistory.length }}</div>
          <div class="text-sm text-gray-500">检查次数</div>
          <div class="text-xs text-gray-400">本次会话</div>
        </div>
      </div>
    </Card>

    <!-- 操作面板 -->
    <Card class="mb-4" title="操作">
      <Space>
        <Button type="primary" :loading="loading" @click="checkHealth">
          <template #icon>
            <RotateCw class="w-4 h-4" />
          </template>
          刷新状态
        </Button>
        <Button @click="checkSimpleHealth" :loading="simpleHealthLoading">
          <template #icon>
            <CircleCheckBig class="w-4 h-4" />
          </template>
          简单检查
        </Button>
        <Button @click="toggleAutoRefresh" :type="autoRefresh ? 'default' : 'dashed'">
          <template #icon>
            <Settings class="w-4 h-4" />
          </template>
          {{ autoRefresh ? '停止自动刷新' : '开启自动刷新' }}
        </Button>

      </Space>
    </Card>

    <!-- 详细信息 -->
    <Card title="详细信息">
      <div v-if="healthStatus.timestamp" class="space-y-4">
        <Descriptions :column="2" bordered size="small">
          <DescriptionsItem label="最后更新时间">
            <span class="font-medium">{{ formatTime(healthStatus.timestamp) }}</span>
            <Tag color="blue" class="ml-2" v-if="getTimeDifference(healthStatus.timestamp) < 60">
              <ArrowRightLeft class="w-3 h-3 mr-1" />
              实时
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem label="响应时间">
            <span :class="getResponseTimeClass(responseTime)">{{ responseTime }}ms</span>
            <Tag :color="getResponseTimeTagColor(responseTime)" class="ml-2">
              {{ getResponseTimeStatus(responseTime) }}
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem label="系统状态">
            <Tag :color="getStatusTagColor(healthStatus.status)">
              {{ getStatusText(healthStatus.status, 'system') }}
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem label="数据库状态">
            <Tag :color="getStatusTagColor(healthStatus.database)">
              {{ getStatusText(healthStatus.database, 'database') }}
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem label="缓存状态">
            <Tag :color="getStatusTagColor(healthStatus.redis)">
              {{ getStatusText(healthStatus.redis, 'redis') }}
            </Tag>
          </DescriptionsItem>
          <DescriptionsItem label="自动刷新">
            <Tag :color="autoRefresh ? 'blue' : 'default'">
              {{ autoRefresh ? '已开启（30秒）' : '已关闭' }}
            </Tag>
          </DescriptionsItem>
        </Descriptions>

        <!-- 健康状态历史趋势 -->
        <div class="mt-6" v-if="healthHistory.length > 0">
          <h4 class="text-lg font-medium mb-3">健康状态趋势</h4>
          <div class="flex items-center space-x-2 overflow-x-auto">
            <div 
              v-for="(record, index) in healthHistory.slice(-20)" 
              :key="index"
              class="flex-shrink-0 text-center"
            >
              <div 
                class="w-3 h-3 rounded-full mb-1"
                :class="getStatusColor(record.status).replace('text-', 'bg-')"
              ></div>
              <div class="text-xs text-gray-500">
                {{ formatTimeShort(record.timestamp) }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 py-8">
        <div class="mb-4">
          <CircleAlert class="w-16 h-16 mx-auto text-gray-400" />
        </div>
        <p class="text-lg mb-2">暂无健康检查数据</p>
        <p class="text-sm">点击"刷新状态"获取详细信息</p>
      </div>
    </Card>
  </Page>
</template>

<script setup lang="ts">
import { Page } from '@vben/common-ui';
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  Button, 
  Card, 
  Space, 
  message, 
  Tag, 
  Descriptions,
  DescriptionsItem 
} from 'ant-design-vue';
import { 
  RotateCw, 
  Settings, 
  CircleAlert, 
  CircleCheckBig,
  ArrowRightLeft
} from '@vben/icons';
import dayjs from 'dayjs';
import { HealthApi, type HealthStatus } from '#/api';

// 响应式数据
const loading = ref(false);
const simpleHealthLoading = ref(false);
const responseTime = ref(0);
const autoRefresh = ref(false);
const refreshInterval = ref<NodeJS.Timeout | null>(null);
// 移除统计数据，因为对应的API接口不存在
// const statistics = ref<SystemStatistics | null>(null);
const healthHistory = ref<Array<{ status: string; timestamp: string }>>([]);

// 健康状态数据（原始API响应）
const healthResponse = ref<HealthStatus | null>(null);

// 处理后的健康状态数据（用于展示）
const healthStatus = ref({
  status: 'unknown',
  database: 'unknown',
  redis: 'unknown',
  timestamp: '',
});

// 方法
const checkHealth = async () => {
  loading.value = true;
  const startTime = Date.now();
  
  try {
    const response = await HealthApi.getHealthStatus();
    responseTime.value = Date.now() - startTime;
    
    // 保存原始响应
    healthResponse.value = response;
    
    // 处理时间戳格式
    const timestampStr = new Date(response.timestamp * 1000).toISOString();
    
    // 更新健康状态（处理后的数据用于展示）
    healthStatus.value = {
      status: response.status || 'unknown',
      database: response.services?.database?.status || 'unknown',
      redis: response.services?.redis?.status || 'unknown',
      timestamp: timestampStr,
    };

    // 添加到历史记录
    healthHistory.value.push({
      status: response.status || 'unknown',
      timestamp: timestampStr
    });

    // 保持历史记录不超过50条
    if (healthHistory.value.length > 50) {
      healthHistory.value = healthHistory.value.slice(-50);
    }

    message.success('健康检查完成');
  } catch (error: any) {
    responseTime.value = Date.now() - startTime;
    const errorMessage = error?.response?.data?.message || error?.message || '健康检查失败';
    message.error(errorMessage);
    
    healthStatus.value = {
      status: 'error',
      database: 'error',
      redis: 'error',
      timestamp: new Date().toISOString(),
    };
    
    console.error('Health check failed:', error);
  } finally {
    loading.value = false;
  }
};

const checkSimpleHealth = async () => {
  simpleHealthLoading.value = true;
  try {
    const response = await HealthApi.getSimpleHealth();
    message.success(response.message || '服务正常运行');
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || '服务异常';
    message.error(errorMessage);
    console.error('Simple health check failed:', error);
  } finally {
    simpleHealthLoading.value = false;
  }
};

// 移除loadStatistics函数，因为对应的API接口不存在

const toggleAutoRefresh = () => {
  autoRefresh.value = !autoRefresh.value;
  
  if (autoRefresh.value) {
    refreshInterval.value = setInterval(() => {
      checkHealth();
    }, 30000); // 每30秒刷新一次
    message.info('已开启自动刷新（30秒间隔）');
  } else {
    if (refreshInterval.value) {
      clearInterval(refreshInterval.value);
      refreshInterval.value = null;
    }
    message.info('已关闭自动刷新');
  }
};

const formatTime = (timestamp: string) => {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
};

const formatTimeShort = (timestamp: string) => {
  return dayjs(timestamp).format('HH:mm');
};

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const getTimeDifference = (timestamp: string) => {
  return dayjs().diff(dayjs(timestamp), 'second');
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
    case 'connected':
    case 'UP':
      return 'text-green-600';
    case 'error':
    case 'disconnected':
    case 'DOWN':
      return 'text-red-600';
    case 'warning':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
  }
};

const getStatusTagColor = (status: string) => {
  switch (status) {
    case 'healthy':
    case 'connected':
    case 'UP':
      return 'green';
    case 'error':
    case 'disconnected':
    case 'DOWN':
      return 'red';
    case 'warning':
      return 'orange';
    default:
      return 'default';
  }
};

const getResponseTimeClass = (time: number) => {
  if (time < 100) return 'text-green-600 font-medium';
  if (time < 300) return 'text-yellow-600 font-medium';
  if (time < 1000) return 'text-orange-600 font-medium';
  return 'text-red-600 font-medium';
};

const getResponseTimeTagColor = (time: number) => {
  if (time < 100) return 'green';
  if (time < 300) return 'blue';
  if (time < 1000) return 'orange';
  return 'red';
};

const getResponseTimeStatus = (time: number) => {
  if (time < 100) return '优秀';
  if (time < 300) return '良好';
  if (time < 1000) return '一般';
  return '较慢';
};

const getStatusText = (status: string, type: 'system' | 'database' | 'redis') => {
  if (type === 'system') {
    switch (status) {
      case 'healthy':
      case 'UP': 
        return '正常';
      case 'error':
      case 'DOWN': 
        return '异常';
      case 'warning': 
        return '警告';
      default: 
        return '未知';
    }
  } else {
    switch (status) {
      case 'connected':
      case 'UP': 
        return '已连接';
      case 'error':
      case 'DOWN': 
        return '连接失败';
      case 'disconnected': 
        return '已断开';
      default: 
        return '未知';
    }
  }
};

// 生命周期
onMounted(() => {
  checkHealth();
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>

<style scoped>
.border {
  border-color: #e5e7eb;
}
</style> 
