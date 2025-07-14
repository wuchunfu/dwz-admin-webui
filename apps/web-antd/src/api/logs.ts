import { requestClient } from './request';

/**
 * 操作日志相关类型定义
 */
export interface OperationLog {
  id: number;
  user_id: number;
  username: string;
  operation: string;
  resource: string;
  resource_id: string;
  method: string;
  path: string;
  request_body?: string;
  response_code: number;
  response_body?: string;
  ip: string;
  user_agent: string;
  execute_time: number;
  status: number;
  error_message?: string;
  created_at: string;
}

export interface LogListResponse {
  list: OperationLog[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    pages: number;
  };
}

/**
 * 操作日志API
 */
export namespace LogApi {
  // 获取操作日志
  export function getList(params: {
    page?: number;
    page_size?: number;
    user_id?: number;
    username?: string;
    operation?: string;
    resource?: string;
    method?: string;
    status?: number;
    start_time?: string;
    end_time?: string;
  }) {
    return requestClient.get<LogListResponse>('/api/v1/logs', {
      params,
    });
  }
} 
