<template>
  <Page description="管理API Token，包括创建、查看和删除Token等功能" title="API Token管理">
    <!-- 搜索和操作区域 -->
    <Card title="搜索筛选" class="mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <Input
            v-model:value="searchParams.token_name"
            placeholder="请输入Token名称"
            style="width: 200px"
            @pressEnter="handleSearch"
          >
            <template #prefix>
              <Search class="h-4 w-4" />
            </template>
          </Input>
          
          <Select
            v-model:value="searchParams.status"
            placeholder="选择状态"
            style="width: 120px"
            allow-clear
          >
            <SelectOption :value="1">启用</SelectOption>
            <SelectOption :value="0">禁用</SelectOption>
          </Select>
          
          <Button type="primary" @click="handleSearch" :loading="loading">
            搜索
          </Button>
          
          <Button @click="handleReset">
            重置
          </Button>
        </div>
        
        <Button type="primary" @click="handleOpenCreateModal">
          <Plus class="h-4 w-4 mr-1" />
          创建Token
        </Button>
      </div>
    </Card>



    <!-- 表格列表区域 -->
    <Card title="Token列表">
      <Table
        :columns="columns"
        :data-source="dataSource"
        :loading="loading"
        :pagination="paginationConfig"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'token'">
            <div class="flex items-center space-x-2">
              <code class="text-xs bg-gray-100 px-2 py-1 rounded">{{ maskToken(record.token) }}</code>
              <Button
                v-if="record.token"
                size="small"
                type="link"
                @click="copyToClipboard(record.token)"
              >
                <Copy class="h-4 w-4" />
              </Button>
            </div>
          </template>
          
          <template v-else-if="column.key === 'status'">
            <Tag :color="record.status === 1 ? 'green' : 'red'">
              {{ record.status === 1 ? '启用' : '禁用' }}
            </Tag>
          </template>
          
          <template v-else-if="column.key === 'expire_at'">
            <span v-if="record.expire_at">
              {{ formatDate(record.expire_at) }}
            </span>
            <span v-else class="text-gray-500">永不过期</span>
          </template>
          
          <template v-else-if="column.key === 'last_used_at'">
            <span v-if="record.last_used_at">
              {{ formatDate(record.last_used_at) }}
            </span>
            <span v-else class="text-gray-500">从未使用</span>
          </template>
          
          <template v-else-if="column.key === 'actions'">
            <Popconfirm
              title="确定要删除这个Token吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="handleDelete(record as Token)"
            >
              <Button size="small" type="link" danger>
                删除
              </Button>
            </Popconfirm>
          </template>
        </template>
      </Table>
    </Card>

    <!-- 创建Token弹窗 -->
    <Modal
      v-model:open="createModalVisible"
      title="创建API Token"
      width="500px"
      @ok="handleCreate"
      @cancel="handleCreateCancel"
      :confirm-loading="createLoading"
    >
      <Form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        layout="vertical"
      >
        <FormItem label="Token名称" name="token_name">
          <Input
            v-model:value="createForm.token_name"
            placeholder="请输入Token名称"
            :maxlength="100"
          />
        </FormItem>
        
        <FormItem label="过期时间" name="expire_at">
          <DatePicker
            v-model:value="createForm.expire_at"
            show-time
            placeholder="选择过期时间，留空则永不过期"
            style="width: 100%"
            :disabled-date="disabledDate"
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- Token创建成功弹窗 -->
    <Modal
      v-model:open="successModalVisible"
      title="Token创建成功"
      width="600px"
      :footer="null"
      :mask-closable="false"
      :closable="false"
    >
      <div class="text-center">
        <div class="mb-4">
          <CircleCheckBig class="text-4xl text-green-500 mx-auto" />
        </div>
        <h3 class="text-lg font-semibold mb-4">Token创建成功！</h3>
        <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p class="text-yellow-800 text-sm">
            <strong>重要提示：</strong>
            请立即复制并保存您的Token，离开此页面后将无法再次查看完整Token！
          </p>
        </div>
        <div class="mb-4">
          <div class="p-3 bg-gray-50 rounded border">
            <div class="flex items-center justify-between">
              <code class="text-sm flex-1 mr-2 break-all font-mono">{{ newToken }}</code>
              <Button type="primary" @click="copyToClipboard(newToken)">
                <Copy class="h-4 w-4 mr-1" />
                复制
              </Button>
            </div>
          </div>
        </div>
        <div class="flex justify-center">
          <Button type="primary" @click="closeSuccessModal">
            我已保存
          </Button>
        </div>
      </div>
    </Modal>
  </Page>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { 
  message, 
  Card, 
  Button, 
  Input, 
  Select, 
  SelectOption, 
  Form, 
  FormItem, 
  DatePicker, 
  Table, 
  Tag, 
  Modal, 
  Popconfirm,
  Space 
} from 'ant-design-vue';
import { Page } from '@vben/common-ui';
import { Search, Plus, Copy, CircleCheckBig } from '@vben/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { TokenApi } from '#/api';

// 使用 API 定义的类型
import type { Token, CreateTokenRequest, TokenListResponse } from '#/api';

// 响应式数据
const loading = ref(false);
const createLoading = ref(false);
const dataSource = ref<Token[]>([]);
const createModalVisible = ref(false);
const successModalVisible = ref(false);
const newToken = ref('');
const createFormRef = ref();

// 搜索参数
const searchParams = reactive({
  token_name: '',
  status: undefined as number | undefined,
});

// 创建表单
const createForm = reactive<CreateTokenRequest>({
  token_name: '',
  expire_at: undefined,
});

// 分页配置
const paginationConfig = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total: number) => `共 ${total} 条记录`,
});

// 创建表单验证规则
const createRules = {
  token_name: [
    { required: true, message: '请输入Token名称', trigger: 'blur' as const },
    { max: 100, message: 'Token名称不能超过100字符', trigger: 'blur' as const },
  ],
} as any;

// 表格列定义
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: 'Token名称',
    dataIndex: 'token_name',
    width: 200,
  },
  {
    title: 'Token',
    key: 'token',
    width: 300,
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
  },
  {
    title: '过期时间',
    key: 'expire_at',
    width: 180,
  },
  {
    title: '最后使用',
    key: 'last_used_at',
    width: 180,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 180,
    customRender: ({ text }: { text: string }) => formatDate(text),
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right' as const,
  },
];

// 加载Token列表
const loadTokens = async () => {
  loading.value = true;
  try {
    const params = {
      page: paginationConfig.current,
      page_size: paginationConfig.pageSize,
      token_name: searchParams.token_name || undefined,
      status: searchParams.status,
    };
    
    const response = await TokenApi.getList(params);
    
    dataSource.value = response.list;
    paginationConfig.total = response.total;
    paginationConfig.current = response.page;
    paginationConfig.pageSize = response.size;
  } catch (error: any) {
    console.error('加载Token列表失败:', error);
    message.error(error?.message || '加载数据失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  paginationConfig.current = 1;
  loadTokens();
};

// 重置搜索
const handleReset = () => {
  searchParams.token_name = '';
  searchParams.status = undefined;
  paginationConfig.current = 1;
  loadTokens();
};

// 打开创建弹窗
const handleOpenCreateModal = () => {
  resetCreateForm();
  createModalVisible.value = true;
};

// 创建Token
const handleCreate = async () => {
  try {
    await createFormRef.value.validate();
    createLoading.value = true;
    
    const requestData: CreateTokenRequest = {
      token_name: createForm.token_name,
      expire_at: createForm.expire_at ? dayjs(createForm.expire_at).toISOString() : undefined,
    };
    
    const response = await TokenApi.create(requestData);
    
    message.success('Token创建成功');
    newToken.value = response.token || '';
    createModalVisible.value = false;
    successModalVisible.value = true;
    
    // 刷新列表
    loadTokens();
  } catch (error: any) {
    console.error('创建Token失败:', error);
    message.error(error?.message || 'Token创建失败');
  } finally {
    createLoading.value = false;
  }
};

// 取消创建
const handleCreateCancel = () => {
  createModalVisible.value = false;
  resetCreateForm();
};

// 删除Token
const handleDelete = async (record: Token) => {
  try {
    await TokenApi.remove(record.id);
    message.success('Token删除成功');
    loadTokens();
  } catch (error: any) {
    console.error('删除Token失败:', error);
    message.error(error?.message || '删除失败');
  }
};

// 表格变化处理
const handleTableChange = (pagination: any) => {
  paginationConfig.current = pagination.current;
  paginationConfig.pageSize = pagination.pageSize;
  loadTokens();
};

// 复制到剪贴板
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    message.success('复制成功');
  } catch (error) {
    console.error('复制失败:', error);
    message.error('复制失败，请手动复制');
  }
};

// 关闭成功弹窗
const closeSuccessModal = () => {
  successModalVisible.value = false;
  newToken.value = '';
};

// 重置创建表单
const resetCreateForm = () => {
  createForm.token_name = '';
  createForm.expire_at = undefined;
  createFormRef.value?.resetFields();
};

// 禁用日期（只能选择未来的日期）
const disabledDate = (current: Dayjs) => {
  return current && current < dayjs().endOf('day');
};

// Token掩码显示
const maskToken = (token?: string) => {
  if (!token) return '***';
  if (token.length <= 12) return token;
  return token.substring(0, 8) + '...' + token.substring(token.length - 4);
};

// 格式化日期
const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
};

// 生命周期
onMounted(() => {
  loadTokens();
});
</script>

<style scoped>
.ant-table-wrapper {
  @apply bg-white rounded-md shadow-sm;
}

code {
  @apply font-mono;
}
</style> 
