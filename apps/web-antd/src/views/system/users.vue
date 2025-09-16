<script setup lang="ts">
import type { CreateUserRequest, User as UserType } from '#/api';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { Search } from '@vben/icons';

import {
  Button,
  Card,
  Form,
  FormItem,
  Input,
  InputPassword,
  message,
  Modal,
  Popconfirm,
  Select,
  SelectOption,
  Switch,
  Table,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { UserManagementApi } from '#/api';

// 响应式数据
const loading = ref(false);
const dataSource = ref<UserType[]>([]);
const modalVisible = ref(false);
const passwordModalVisible = ref(false);
const isEdit = ref(false);
const currentRecord = ref<null | UserType>(null);
const formRef = ref();
const passwordFormRef = ref();

// 搜索参数
const searchParams = reactive({
  username: '',
  real_name: '',
  status: undefined as number | undefined,
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
const formData = reactive<CreateUserRequest & { status?: boolean }>({
  username: '',
  password: '',
  real_name: '',
  email: '',
  phone: '',
  status: true,
});

// 密码表单数据
const passwordFormData = reactive({
  new_password: '',
  confirm_password: '',
});

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度应为3-50字符', trigger: 'blur' },
    {
      pattern: /^\w+$/,
      message: '用户名只能包含字母、数字和下划线',
      trigger: 'blur',
    },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 50, message: '密码长度应为6-50字符', trigger: 'blur' },
  ],
  real_name: [
    { max: 100, message: '真实姓名不能超过100字符', trigger: 'blur' as const },
  ],
  email: [
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: 'blur' as const,
    },
  ],
  phone: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入有效的手机号码',
      trigger: 'blur' as const,
    },
  ],
} as any;

// 密码表单验证规则
const passwordFormRules = {
  new_password: [
    { required: true, message: '请输入新密码', trigger: 'blur' as const },
    {
      min: 6,
      max: 50,
      message: '密码长度应为6-50字符',
      trigger: 'blur' as const,
    },
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' as const },
    {
      validator: (_: any, value: string) => {
        if (value !== passwordFormData.new_password) {
          return Promise.reject(new Error('两次输入的密码不一致'));
        }
        return Promise.resolve();
      },
      trigger: 'blur' as const,
    },
  ],
} as any;

// 表格列定义
const columns = [
  {
    title: '用户名',
    dataIndex: 'username',
    width: 150,
  },
  {
    title: '真实姓名',
    dataIndex: 'real_name',
    width: 150,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    width: 200,
    ellipsis: true,
  },
  {
    title: '电话',
    dataIndex: 'phone',
    width: 150,
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
  },
  {
    title: '最后登录',
    key: 'last_login',
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
    width: 200,
    fixed: 'right' as const,
  },
];

// 方法
const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
      username: searchParams.username || undefined,
      real_name: searchParams.real_name || undefined,
      status: searchParams.status,
    };
    const response = await UserManagementApi.getList(params);
    dataSource.value = response.list;
    pagination.total = response.total;
    pagination.current = response.page;
    pagination.pageSize = response.size;
  } catch (error) {
    message.error('加载数据失败');
    console.error('Failed to load users:', error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  loadData();
};

const handleReset = () => {
  searchParams.username = '';
  searchParams.real_name = '';
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

const handleEdit = (record: UserType) => {
  isEdit.value = true;
  currentRecord.value = record;
  Object.assign(formData, {
    username: record.username,
    password: '',
    real_name: record.real_name,
    email: record.email,
    phone: record.phone,
    status: record.status === 1,
  });
  modalVisible.value = true;
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    const data = {
      ...formData,
      status: formData.status ? 1 : 0,
    };

    if (isEdit.value && currentRecord.value) {
      const { username, password, ...updateData } = data;
      await UserManagementApi.update(currentRecord.value.id, updateData);
      message.success('用户更新成功');
    } else {
      await UserManagementApi.create(data);
      message.success('用户创建成功');
    }

    modalVisible.value = false;
    loadData();
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      (isEdit.value ? '更新失败' : '创建失败');
    message.error(errorMessage);
    console.error('Failed to submit user:', error);
  }
};

const handleCancel = () => {
  modalVisible.value = false;
  resetForm();
};

const handleDelete = async (record: UserType) => {
  try {
    await UserManagementApi.remove(record.id);
    message.success('用户删除成功');
    loadData();
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || '删除失败';
    message.error(errorMessage);
    console.error('Failed to delete user:', error);
  }
};

const handleStatusChange = async (record: UserType, checked: boolean) => {
  try {
    await UserManagementApi.update(record.id, { status: checked ? 1 : 0 });
    message.success('状态更新成功');
    loadData();
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || '状态更新失败';
    message.error(errorMessage);
    console.error('Failed to update user status:', error);
  }
};

const handleResetPassword = (record: UserType) => {
  currentRecord.value = record;
  resetPasswordForm();
  passwordModalVisible.value = true;
};

const handlePasswordSubmit = async () => {
  try {
    await passwordFormRef.value.validate();
    if (currentRecord.value) {
      await UserManagementApi.resetPassword(currentRecord.value.id, {
        new_password: passwordFormData.new_password,
      });
      message.success('密码重置成功');
      passwordModalVisible.value = false;
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || '密码重置失败';
    message.error(errorMessage);
    console.error('Failed to reset password:', error);
  }
};

const handlePasswordCancel = () => {
  passwordModalVisible.value = false;
  resetPasswordForm();
};

const resetForm = () => {
  Object.assign(formData, {
    username: '',
    password: '',
    real_name: '',
    email: '',
    phone: '',
    status: true,
  });
};

const resetPasswordForm = () => {
  Object.assign(passwordFormData, {
    new_password: '',
    confirm_password: '',
  });
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
};

// 生命周期
onMounted(() => {
  loadData();
});
</script>

<template>
  <Page
    description="管理系统用户，包括创建、编辑、删除用户以及重置密码等功能"
    title="用户管理"
  >
    <!-- 搜索和操作区域 -->
    <Card class="mb-4" title="搜索筛选">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <Input
            v-model:value="searchParams.username"
            placeholder="搜索用户名"
            style="width: 200px"
            @press-enter="handleSearch"
          >
            <template #prefix>
              <Search class="h-4 w-4" />
            </template>
          </Input>
          <Input
            v-model:value="searchParams.real_name"
            placeholder="搜索真实姓名"
            style="width: 200px"
            @press-enter="handleSearch"
          >
            <template #prefix>
              <Search class="h-4 w-4" />
            </template>
          </Input>
          <Select
            v-model:value="searchParams.status"
            placeholder="选择状态"
            style="width: 150px"
            allow-clear
            @change="handleSearch"
          >
            <SelectOption :value="1">启用</SelectOption>
            <SelectOption :value="0">禁用</SelectOption>
          </Select>
          <Button type="primary" @click="handleSearch" :loading="loading">
            搜索
          </Button>
          <Button @click="handleReset">重置</Button>
        </div>
        <Button type="primary" @click="handleCreate">创建用户</Button>
      </div>
    </Card>

    <!-- 表格列表区域 -->
    <Card title="用户列表">
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
            <Switch
              :checked="record.status === 1"
              @change="
                (checked: any) =>
                  handleStatusChange(record as UserType, !!checked)
              "
            />
          </template>
          <template v-else-if="column.key === 'last_login'">
            <span v-if="record.last_login">
              {{ formatDate(record.last_login) }}
            </span>
            <span v-else class="text-gray-500">从未登录</span>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="flex space-x-2">
              <Button
                size="small"
                type="link"
                @click="handleEdit(record as UserType)"
              >
                编辑
              </Button>
              <Button
                size="small"
                type="link"
                @click="handleResetPassword(record as UserType)"
              >
                重置密码
              </Button>
              <Popconfirm
                title="确定要删除这个用户吗？"
                @confirm="handleDelete(record as UserType)"
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
      :title="isEdit ? '编辑用户' : '创建用户'"
      width="600px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <Form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        layout="vertical"
      >
        <FormItem label="用户名" name="username">
          <Input
            v-model:value="formData.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </FormItem>
        <FormItem v-if="!isEdit" label="密码" name="password">
          <InputPassword
            v-model:value="formData.password"
            placeholder="请输入密码"
          />
        </FormItem>
        <FormItem label="真实姓名" name="real_name">
          <Input
            v-model:value="formData.real_name"
            placeholder="请输入真实姓名"
          />
        </FormItem>
        <FormItem label="邮箱" name="email">
          <Input v-model:value="formData.email" placeholder="请输入邮箱地址" />
        </FormItem>
        <FormItem label="电话" name="phone">
          <Input v-model:value="formData.phone" placeholder="请输入电话号码" />
        </FormItem>
        <FormItem v-if="isEdit" label="状态" name="status">
          <Switch
            v-model:checked="formData.status"
            checked-children="启用"
            un-checked-children="禁用"
          />
        </FormItem>
      </Form>
    </Modal>

    <!-- 重置密码弹窗 -->
    <Modal
      v-model:open="passwordModalVisible"
      title="重置用户密码"
      width="400px"
      @ok="handlePasswordSubmit"
      @cancel="handlePasswordCancel"
    >
      <Form
        ref="passwordFormRef"
        :model="passwordFormData"
        :rules="passwordFormRules"
        layout="vertical"
      >
        <FormItem label="新密码" name="new_password">
          <InputPassword
            v-model:value="passwordFormData.new_password"
            placeholder="请输入新密码"
          />
        </FormItem>
        <FormItem label="确认密码" name="confirm_password">
          <InputPassword
            v-model:value="passwordFormData.confirm_password"
            placeholder="请确认新密码"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

<style scoped></style>
