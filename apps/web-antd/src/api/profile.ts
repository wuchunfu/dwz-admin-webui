import { requestClient } from './request';

/**
 * 个人资料相关类型定义
 */
export interface Profile {
  id: number;
  username: string;
  real_name?: string;
  email?: string;
  phone?: string;
  status: number;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

/**
 * 个人资料管理API
 */
export namespace ProfileApi {
  // 获取当前用户信息
  export function getProfile() {
    return requestClient.get<Profile>('/api/v1/profile');
  }

  // 修改密码
  export function changePassword(data: ChangePasswordRequest) {
    return requestClient.post('/api/v1/profile/change-password', data);
  }
} 
