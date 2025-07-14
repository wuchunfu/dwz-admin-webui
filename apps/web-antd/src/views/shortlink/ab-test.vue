<script setup lang="ts">
import type {
  ABTest,
  ABTestStatistics,
  CreateABTestRequest,
  ShortLink,
} from '#/api';

import { computed, onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  RangePicker,
  Select,
  SelectOption,
  Space,
  Switch,
  Table,
  Tag,
  Textarea,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { ABTestApi, ShortLinkApi } from '#/api';

// 响应式数据
const loading = ref(false);
const dataSource = ref<ABTest[]>([]);
const shortLinks = ref<ShortLink[]>([]);
const modalVisible = ref(false);
const statsModalVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<ABTest | null>(null);
const currentStats = ref<ABTestStatistics | null>(null);
const formRef = ref();

// 日期范围计算属性
const dateRange = computed({
  get: () => {
    if (formData.start_time && formData.end_time) {
      return [
        typeof formData.start_time === 'string'
          ? dayjs(formData.start_time)
          : formData.start_time,
        typeof formData.end_time === 'string'
          ? dayjs(formData.end_time)
          : formData.end_time,
      ] as [dayjs.Dayjs, dayjs.Dayjs];
    }
    return undefined;
  },
  set: (value) => {
    if (value && Array.isArray(value) && value.length === 2) {
      formData.start_time = value[0];
      formData.end_time = value[1];
    } else {
      formData.start_time = undefined;
      formData.end_time = undefined;
    }
  },
});

// 搜索参数
const searchParams = reactive({
  short_link_id: undefined as number | undefined,
  status: undefined as string | undefined,
});

// 分页
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条`,
});

// 表单数据
const formData = reactive<
  Omit<CreateABTestRequest, 'end_time' | 'start_time'> & {
    end_time?: any;
    start_time?: any;
    status?: 'completed' | 'draft' | 'paused' | 'running';
  }
>({
  short_link_id: 0,
  name: '',
  description: '',
  traffic_split: 'equal',
  start_time: undefined,
  end_time: undefined,
  variants: [
    {
      name: '变体A',
      target_url: '',
      weight: 50,
      is_control: true,
      description: '',
    },
    {
      name: '变体B',
      target_url: '',
      weight: 50,
      is_control: false,
      description: '',
    },
  ],
  status: 'draft',
});

// 表单验证规则
const formRules = {
  short_link_id: [
    { required: true, message: '请选择短网址', trigger: 'change' as const },
  ],
  name: [
    { required: true, message: '请输入测试名称', trigger: 'blur' as const },
  ],
  variants: [
    { required: true, message: '至少需要2个变体', trigger: 'change' as const },
  ],
};

// 表格列定义
const columns = [
  {
    title: '测试名称',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: '短网址',
    dataIndex: 'short_link_id',
    width: 150,
    customRender: ({ text }: { text: number }) => {
      const link = shortLinks.value.find((l) => l.id === text);
      return link?.short_url || text;
    },
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
  },
  {
    title: '流量分配',
    key: 'traffic_split',
    width: 100,
  },
  {
    title: '变体数量',
    dataIndex: 'variants',
    width: 80,
    customRender: ({ text }: { text: any[] }) => text?.length || 0,
  },
  {
    title: '时间范围',
    key: 'time_range',
    width: 200,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 150,
    customRender: ({ text }: { text: string }) => formatDate(text),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    fixed: 'right' as const,
  },
];

// 变体统计表格列
const variantStatsColumns = [
  {
    title: '变体名称',
    dataIndex: ['variant', 'name'],
    width: 150,
  },
  {
    title: '目标URL',
    dataIndex: ['variant', 'target_url'],
    width: 200,
    ellipsis: true,
  },
  {
    title: '权重',
    dataIndex: ['variant', 'weight'],
    width: 80,
    customRender: ({ text }: { text: number }) => `${text}%`,
  },
  {
    title: '点击数',
    dataIndex: 'click_count',
    width: 100,
  },
  {
    title: '占比',
    dataIndex: 'percentage',
    width: 100,
    customRender: ({ text }: { text: number }) => `${text.toFixed(1)}%`,
  },
  {
    title: '转化率',
    dataIndex: 'conversion_rate',
    width: 100,
    customRender: ({ text }: { text: number }) => `${text.toFixed(1)}%`,
  },
  {
    title: '对照组',
    dataIndex: ['variant', 'is_control'],
    width: 80,
    customRender: ({ text }: { text: boolean }) => (text ? '是' : '否'),
  },
];

// 每日统计表格列
const dailyStatsColumns = [
  {
    title: '日期',
    dataIndex: 'date',
  },
  {
    title: '变体点击数',
    dataIndex: 'variants',
    customRender: ({ text }: { text: Record<string, number> }) => {
      return Object.entries(text)
        .map(([id, count]) => `变体${id}: ${count}`)
        .join(', ');
    },
  },
];

// 方法
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      short_link_id: searchParams.short_link_id,
      status: searchParams.status,
    };
    const response = await ABTestApi.getList(params);
    dataSource.value = response.list;
    pagination.total = response.total;
  } catch {
    message.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

const loadShortLinks = async () => {
  try {
    const response = await ShortLinkApi.getList({ page: 1, page_size: 100 });
    shortLinks.value = response.list;
  } catch {
    message.error('加载短网址失败');
  }
};

const handleSearch = () => {
  pagination.current = 1;
  loadData();
};

const handleReset = () => {
  searchParams.short_link_id = undefined;
  searchParams.status = undefined;
  pagination.current = 1;
  loadData();
};

const handleTableChange = (paginationData: any) => {
  pagination.current = paginationData.current;
  pagination.pageSize = paginationData.pageSize;
  loadData();
};

const handleCreate = () => {
  isEdit.value = false;
  resetForm();
  modalVisible.value = true;
};

const handleEdit = (record: ABTest) => {
  isEdit.value = true;
  currentRecord.value = record;
  Object.assign(formData, {
    short_link_id: record.short_link_id,
    name: record.name,
    description: record.description,
    traffic_split: record.traffic_split,
    start_time: record.start_time ? dayjs(record.start_time) : undefined,
    end_time: record.end_time ? dayjs(record.end_time) : undefined,
    variants: [...record.variants],
    status: record.status,
  });
  modalVisible.value = true;
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    const data = {
      ...formData,
      start_time: formData.start_time
        ? dayjs(formData.start_time).toISOString()
        : undefined,
      end_time: formData.end_time
        ? dayjs(formData.end_time).toISOString()
        : undefined,
    };

    if (isEdit.value && currentRecord.value) {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { short_link_id, variants, ...updateData } = data;
      await ABTestApi.update(currentRecord.value.id, updateData);
      message.success('更新成功');
    } else {
      await ABTestApi.create(data);
      message.success('创建成功');
    }

    modalVisible.value = false;
    loadData();
  } catch {
    message.error(isEdit.value ? '更新失败' : '创建失败');
  }
};

const handleCancel = () => {
  modalVisible.value = false;
  resetForm();
};

const handleDelete = async (record: ABTest) => {
  try {
    await ABTestApi.remove(record.id);
    message.success('删除成功');
    loadData();
  } catch {
    message.error('删除失败');
  }
};

const handleStart = async (record: ABTest) => {
  try {
    await ABTestApi.start(record.id, {});
    message.success('启动成功');
    loadData();
  } catch {
    message.error('启动失败');
  }
};

const handleStop = async (record: ABTest) => {
  try {
    await ABTestApi.stop(record.id, {});
    message.success('停止成功');
    loadData();
  } catch {
    message.error('停止失败');
  }
};

const handleViewStats = async (record: ABTest) => {
  try {
    const stats = await ABTestApi.getStatistics(record.id, 30);
    currentStats.value = stats;
    statsModalVisible.value = true;
  } catch {
    message.error('获取统计数据失败');
  }
};

const addVariant = () => {
  formData.variants.push({
    name: `变体${String.fromCodePoint(65 + formData.variants.length)}`,
    target_url: '',
    weight: 0,
    is_control: false,
    description: '',
  });
};

const removeVariant = (index: number) => {
  formData.variants.splice(index, 1);
};

const resetForm = () => {
  Object.assign(formData, {
    short_link_id: 0,
    name: '',
    description: '',
    traffic_split: 'equal',
    start_time: undefined,
    end_time: undefined,
    variants: [
      {
        name: '变体A',
        target_url: '',
        weight: 50,
        is_control: true,
        description: '',
      },
      {
        name: '变体B',
        target_url: '',
        weight: 50,
        is_control: false,
        description: '',
      },
    ],
    status: 'draft',
  });
};

const getStatusColor = (status: string) => {
  const colors = {
    draft: 'default',
    running: 'green',
    paused: 'orange',
    completed: 'blue',
  };
  return colors[status as keyof typeof colors] || 'default';
};

const getStatusText = (status: string) => {
  const texts = {
    draft: '草稿',
    running: '运行中',
    paused: '已暂停',
    completed: '已完成',
  };
  return texts[status as keyof typeof texts] || status;
};

const getTrafficSplitText = (split: string) => {
  const texts = {
    equal: '均等分配',
    weighted: '权重分配',
    custom: '自定义',
  };
  return texts[split as keyof typeof texts] || split;
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm');
};

// 生命周期
onMounted(() => {
  loadData();
  loadShortLinks();
});
</script>

<template>
  <Page
    description="创建和管理AB测试，比较不同版本的转化效果"
    title="AB测试管理"
  >
    <Card class="mb-4">
      <template #extra>
        <Button type="primary" @click="handleCreate">创建AB测试</Button>
      </template>

      <!-- 搜索和筛选 -->
      <Space class="mb-4">
        <Select
          v-model:value="searchParams.short_link_id"
          placeholder="选择短网址"
          style="width: 300px"
          allow-clear
          @change="handleSearch"
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
          v-model:value="searchParams.status"
          placeholder="选择状态"
          style="width: 150px"
          allow-clear
          @change="handleSearch"
        >
          <SelectOption value="draft">草稿</SelectOption>
          <SelectOption value="running">运行中</SelectOption>
          <SelectOption value="paused">已暂停</SelectOption>
          <SelectOption value="completed">已完成</SelectOption>
        </Select>
        <Button @click="handleReset">重置</Button>
      </Space>
    </Card>

    <!-- 表格 -->
    <Card title="AB测试列表">
      <Table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="pagination"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <Tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </Tag>
          </template>
          <template v-else-if="column.key === 'traffic_split'">
            <Tag>{{ getTrafficSplitText(record.traffic_split) }}</Tag>
          </template>
          <template v-else-if="column.key === 'time_range'">
            <div class="text-sm">
              <div v-if="record.start_time">
                开始：{{ formatDate(record.start_time) }}
              </div>
              <div v-if="record.end_time">
                结束：{{ formatDate(record.end_time) }}
              </div>
            </div>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex space-x-2">
              <Button
                v-if="record.status === 'draft'"
                size="small"
                type="link"
                @click="handleStart(record as ABTest)"
              >
                启动
              </Button>
              <Button
                v-if="record.status === 'running'"
                size="small"
                type="link"
                @click="handleStop(record as ABTest)"
              >
                停止
              </Button>
              <Button
                size="small"
                type="link"
                @click="handleViewStats(record as ABTest)"
              >
                统计
              </Button>
              <Button
                size="small"
                type="link"
                @click="handleEdit(record as ABTest)"
              >
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这个AB测试吗？"
                @confirm="handleDelete(record as ABTest)"
              >
                <Button size="small" type="link" danger>删除</Button>
              </Popconfirm>
            </div>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 创建/编辑弹窗 -->
    <Modal
      v-model:open="modalVisible"
      :title="isEdit ? '编辑AB测试' : '创建AB测试'"
      width="800px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <Form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <FormItem label="短网址" name="short_link_id">
          <Select
            v-model:value="formData.short_link_id"
            placeholder="选择短网址"
            :disabled="isEdit"
          >
            <SelectOption
              v-for="link in shortLinks"
              :key="link.id"
              :value="link.id"
            >
              {{ link.short_url }} - {{ link.title || link.original_url }}
            </SelectOption>
          </Select>
        </FormItem>
        <FormItem label="测试名称" name="name">
          <Input v-model:value="formData.name" placeholder="请输入测试名称" />
        </FormItem>
        <FormItem label="描述" name="description">
          <Textarea
            v-model:value="formData.description"
            placeholder="可选，测试描述"
            :rows="3"
          />
        </FormItem>
        <FormItem label="流量分配" name="traffic_split">
          <Select v-model:value="formData.traffic_split">
            <SelectOption value="equal">均等分配</SelectOption>
            <SelectOption value="weighted">权重分配</SelectOption>
            <SelectOption value="custom">自定义</SelectOption>
          </Select>
        </FormItem>
        <FormItem label="时间范围">
          <RangePicker
            v-model:value="dateRange"
            show-time
            :placeholder="['开始时间', '结束时间']"
            style="width: 100%"
          />
        </FormItem>
        <FormItem label="测试变体" name="variants">
          <div class="space-y-4">
            <div
              v-for="(variant, index) in formData.variants"
              :key="index"
              class="rounded border p-4"
            >
              <div class="mb-2 flex items-center justify-between">
                <span class="font-medium">变体 {{ index + 1 }}</span>
                <Button
                  v-if="formData.variants.length > 2"
                  size="small"
                  danger
                  @click="removeVariant(index)"
                >
                  删除
                </Button>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <FormItem label="变体名称" :name="['variants', index, 'name']">
                  <Input
                    v-model:value="variant.name"
                    placeholder="请输入变体名称"
                  />
                </FormItem>
                <FormItem
                  label="目标URL"
                  :name="['variants', index, 'target_url']"
                >
                  <Input
                    v-model:value="variant.target_url"
                    placeholder="请输入目标URL"
                  />
                </FormItem>
                <FormItem label="权重" :name="['variants', index, 'weight']">
                  <InputNumber
                    v-model:value="variant.weight"
                    :min="0"
                    :max="100"
                    style="width: 100%"
                  />
                </FormItem>
                <FormItem
                  label="对照组"
                  :name="['variants', index, 'is_control']"
                >
                  <Switch v-model:checked="variant.is_control" />
                </FormItem>
              </div>
              <FormItem label="描述" :name="['variants', index, 'description']">
                <Textarea
                  v-model:value="variant.description"
                  placeholder="可选，变体描述"
                  :rows="2"
                />
              </FormItem>
            </div>
            <Button type="dashed" @click="addVariant" block> 添加变体 </Button>
          </div>
        </FormItem>
        <FormItem v-if="isEdit" label="状态" name="status">
          <Select v-model:value="formData.status">
            <SelectOption value="draft">草稿</SelectOption>
            <SelectOption value="running">运行中</SelectOption>
            <SelectOption value="paused">已暂停</SelectOption>
            <SelectOption value="completed">已完成</SelectOption>
          </Select>
        </FormItem>
      </Form>
    </Modal>

    <!-- 统计弹窗 -->
    <Modal
      v-model:open="statsModalVisible"
      title="AB测试统计"
      width="1000px"
      :footer="null"
    >
      <div v-if="currentStats">
        <div class="mb-6">
          <h3 class="mb-4 text-lg font-semibold">总体统计</h3>
          <div class="grid grid-cols-3 gap-4">
            <div class="rounded bg-blue-50 p-4 text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ currentStats.total_clicks }}
              </div>
              <div class="text-gray-500">总点击数</div>
            </div>
            <div class="rounded bg-green-50 p-4 text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ currentStats.conversion_rate }}%
              </div>
              <div class="text-gray-500">转化率</div>
            </div>
            <div class="rounded bg-purple-50 p-4 text-center">
              <div class="text-xl font-bold text-purple-600">
                {{ currentStats.winning_variant?.name || 'N/A' }}
              </div>
              <div class="text-gray-500">获胜变体</div>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="mb-4 text-lg font-semibold">变体统计</h3>
          <Table
            :columns="variantStatsColumns"
            :data-source="currentStats.variant_stats"
            :pagination="false"
            size="small"
          />
        </div>

        <div>
          <h3 class="mb-4 text-lg font-semibold">每日统计</h3>
          <Table
            :columns="dailyStatsColumns"
            :data-source="currentStats.daily_stats"
            :pagination="false"
            size="small"
          />
        </div>
      </div>
    </Modal>
  </Page>
</template>

<style scoped>
.ant-table-wrapper {
  @apply rounded-md bg-white shadow-sm;
}
</style>
