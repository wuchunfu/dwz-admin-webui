<script setup lang="ts">
import type { Profile } from '#/api';

import { onMounted, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Card,
  Form,
  FormItem,
  InputPassword,
  message,
  Modal,
  Spin,
  Tag,
} from 'ant-design-vue';
import dayjs from 'dayjs';

import { ProfileApi } from '#/api';

// 响应式数据
const loading = ref(false);
const profile = ref<null | Profile>(null);
const passwordModalVisible = ref(false);
const passwordFormRef = ref();

// 密码表单数据
const passwordFormData = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
});

// 密码表单验证规则
const passwordFormRules = {
  old_password: [
    { required: true, message: '请输入当前密码', trigger: 'blur' as const },
  ],
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
};

// 方法
const loadProfile = async () => {
  loading.value = true;
  try {
    const response = await ProfileApi.getProfile();
    profile.value = response;
  } catch {
    message.error('获取个人信息失败');
  } finally {
    loading.value = false;
  }
};

const showPasswordModal = () => {
  resetPasswordForm();
  passwordModalVisible.value = true;
};

const handlePasswordSubmit = async () => {
  try {
    await passwordFormRef.value.validate();
    await ProfileApi.changePassword({
      old_password: passwordFormData.old_password,
      new_password: passwordFormData.new_password,
    });
    message.success('密码修改成功');
    passwordModalVisible.value = false;
    resetPasswordForm();
  } catch {
    message.error('密码修改失败');
  }
};

const handlePasswordCancel = () => {
  passwordModalVisible.value = false;
  resetPasswordForm();
};

const resetPasswordForm = () => {
  Object.assign(passwordFormData, {
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
};

const formatDate = (dateString: string) => {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm:ss');
};

// 生命周期
onMounted(() => {
  loadProfile();
});
</script>

<template>
  <Page
    description="查看和管理您的个人信息，修改密码保护账户安全"
    title="个人资料"
  >
    <!-- 个人信息卡片 -->
    <Card class="mb-6" title="个人信息">
      <div class="flex items-center space-x-6">
        <div class="flex-shrink-0">
          <div
            class="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100"
          >
            <svg
              class="h-10 w-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-gray-900">
            {{ profile?.real_name || profile?.username || '未知用户' }}
          </h3>
          <p class="text-gray-500">{{ profile?.email || '暂无邮箱' }}</p>
          <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <span>用户名: {{ profile?.username }}</span>
            <span v-if="profile?.phone">电话: {{ profile.phone }}</span>
            <span>
              状态:
              <Tag
                :color="profile?.status === 1 ? 'green' : 'red'"
                size="small"
              >
                {{ profile?.status === 1 ? '正常' : '禁用' }}
              </Tag>
            </span>
          </div>
        </div>
      </div>
    </Card>

    <!-- 功能卡片 -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
      <!-- 基本信息 -->
      <Card title="基本信息">
        <Spin v-if="loading" />
        <div v-else-if="profile" class="space-y-4">
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="text-gray-500">用户名</div>
            <div class="col-span-2">{{ profile.username }}</div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="text-gray-500">真实姓名</div>
            <div class="col-span-2">{{ profile.real_name || '暂未设置' }}</div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="text-gray-500">邮箱地址</div>
            <div class="col-span-2">{{ profile.email || '暂未设置' }}</div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="text-gray-500">电话号码</div>
            <div class="col-span-2">{{ profile.phone || '暂未设置' }}</div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="text-gray-500">最后登录</div>
            <div class="col-span-2">
              {{
                profile.last_login ? formatDate(profile.last_login) : '从未登录'
              }}
            </div>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div class="text-gray-500">注册时间</div>
            <div class="col-span-2">{{ formatDate(profile.created_at) }}</div>
          </div>
        </div>
        <div v-else class="text-center text-gray-500">
          <p>加载失败，请刷新重试</p>
        </div>
      </Card>

      <!-- 密码管理 -->
      <Card title="密码管理">
        <div class="space-y-4">
          <div class="rounded border border-yellow-200 bg-yellow-50 p-4">
            <p class="text-sm text-yellow-800">
              <strong>安全提醒：</strong>
              定期更改密码有助于保护您的账户安全。建议使用包含字母、数字和特殊字符的强密码。
            </p>
          </div>
          <Button type="primary" block @click="showPasswordModal">
            修改密码
          </Button>
        </div>
      </Card>
    </div>

    <!-- 账户统计 -->
    <Card class="mt-6" title="账户统计">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600">--</div>
          <div class="text-sm text-gray-500">创建的短网址</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-600">--</div>
          <div class="text-sm text-gray-500">总点击数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">--</div>
          <div class="text-sm text-gray-500">活跃的AB测试</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-purple-600">--</div>
          <div class="text-sm text-gray-500">API调用次数</div>
        </div>
      </div>
      <div class="mt-4 text-center text-sm text-gray-500">
        统计功能开发中，敬请期待
      </div>
    </Card>

    <!-- 修改密码弹窗 -->
    <Modal
      v-model:open="passwordModalVisible"
      title="修改密码"
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
        <FormItem label="当前密码" name="old_password">
          <InputPassword
            v-model:value="passwordFormData.old_password"
            placeholder="请输入当前密码"
          />
        </FormItem>
        <FormItem label="新密码" name="new_password">
          <InputPassword
            v-model:value="passwordFormData.new_password"
            placeholder="请输入新密码"
          />
        </FormItem>
        <FormItem label="确认新密码" name="confirm_password">
          <InputPassword
            v-model:value="passwordFormData.confirm_password"
            placeholder="请确认新密码"
          />
        </FormItem>
      </Form>
    </Modal>
  </Page>
</template>

<style scoped>
.ant-tag {
  border-radius: 4px;
}
</style>
