import { requestClient } from './request';

/**
 * AB测试相关类型定义
 */
export interface ABTestVariant {
  id: number;
  ab_test_id: number;
  name: string;
  target_url: string;
  weight: number;
  is_control: boolean;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ABTest {
  id: number;
  short_link_id: number;
  name: string;
  description?: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  traffic_split: 'equal' | 'weighted' | 'custom';
  start_time?: string;
  end_time?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  variants: ABTestVariant[];
}

export interface CreateABTestRequest {
  short_link_id: number;
  name: string;
  description?: string;
  traffic_split?: 'equal' | 'weighted' | 'custom';
  start_time?: string;
  end_time?: string;
  variants: Array<{
    name: string;
    target_url: string;
    weight: number;
    is_control: boolean;
    description?: string;
  }>;
}

export interface UpdateABTestRequest {
  name?: string;
  description?: string;
  status?: 'draft' | 'running' | 'paused' | 'completed';
  traffic_split?: 'equal' | 'weighted' | 'custom';
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

export interface ABTestListResponse {
  list: ABTest[];
  total: number;
  page: number;
  size: number;
}

export interface ABTestStatistics {
  ab_test_id: number;
  total_clicks: number;
  variant_stats: Array<{
    variant: {
      id: number;
      name: string;
      target_url: string;
      weight: number;
      is_control: boolean;
    };
    click_count: number;
    conversion_rate: number;
    percentage: number;
  }>;
  daily_stats: Array<{
    date: string;
    variants: Record<string, number>;
  }>;
  conversion_rate: number;
  winning_variant?: {
    id: number;
    name: string;
  };
}

export interface StartABTestRequest {
  start_time?: string;
}

export interface StopABTestRequest {
  end_time?: string;
}

/**
 * AB测试管理API
 */
export namespace ABTestApi {
  // 创建AB测试
  export function create(data: CreateABTestRequest) {
    return requestClient.post<ABTest>('/api/v1/ab_tests', data);
  }

  // 获取AB测试列表
  export function getList(params: {
    page?: number;
    page_size?: number;
    short_link_id?: number;
    status?: string;
  }) {
    return requestClient.get<ABTestListResponse>('/api/v1/ab_tests', {
      params,
    });
  }

  // 获取AB测试详情
  export function getDetail(id: number) {
    return requestClient.get<ABTest>(`/api/v1/ab_tests/${id}`);
  }

  // 更新AB测试
  export function update(id: number, data: UpdateABTestRequest) {
    return requestClient.put<ABTest>(`/api/v1/ab_tests/${id}`, data);
  }

  // 删除AB测试
  export function remove(id: number) {
    return requestClient.delete(`/api/v1/ab_tests/${id}`);
  }

  // 启动AB测试
  export function start(id: number, data: StartABTestRequest) {
    return requestClient.post(`/api/v1/ab_tests/${id}/start`, data);
  }

  // 停止AB测试
  export function stop(id: number, data: StopABTestRequest) {
    return requestClient.post(`/api/v1/ab_tests/${id}/stop`, data);
  }

  // 获取AB测试统计
  export function getStatistics(id: number, days?: number) {
    return requestClient.get<ABTestStatistics>(
      `/api/v1/ab_tests/${id}/statistics`,
      {
        params: { days },
      },
    );
  }
} 
