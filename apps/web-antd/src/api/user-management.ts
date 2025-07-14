import { requestClient } from './request';

/**
 * 用户管理相关类型定义
 */
export interface User {
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

export interface CreateUserRequest {
  username: string;
  password: string;
  real_name?: string;
  email?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  real_name?: string;
  email?: string;
  phone?: string;
  status?: number;
}

export interface UserListResponse {
  list: User[];
  total: number;
  page: number;
  size: number;
}

export interface ResetPasswordRequest {
  new_password: string;
}

/**
 * 用户管理API
 */
export namespace UserManagementApi {
  // 创建用户
  export function create(data: CreateUserRequest) {
    return requestClient.post<User>('/api/v1/users', data);
  }

  // 获取用户列表
  export function getList(params: {
    page?: number;
    page_size?: number;
    username?: string;
    real_name?: string;
    status?: number;
  }) {
    return requestClient.get<UserListResponse>('/api/v1/users', {
      params,
    });
  }

  // 获取用户详情
  export function getDetail(id: number) {
    return requestClient.get<User>(`/api/v1/users/${id}`);
  }

  // 更新用户
  export function update(id: number, data: UpdateUserRequest) {
    return requestClient.put<User>(`/api/v1/users/${id}`, data);
  }

  // 删除用户
  export function remove(id: number) {
    return requestClient.delete(`/api/v1/users/${id}`);
  }

  // 重置用户密码
  export function resetPassword(id: number, data: ResetPasswordRequest) {
    return requestClient.post(`/api/v1/users/${id}/reset-password`, data);
  }
} 
