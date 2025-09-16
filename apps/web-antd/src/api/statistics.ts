import { requestClient } from './request';

/**
 * 系统统计信息相关类型定义
 */
export interface SystemStatistics {
  total_users: number;
  active_users: number;
  total_short_links: number;
  total_clicks: number;
  today_clicks: number;
  week_clicks: number;
  month_clicks: number;
  total_domains: number;
  active_domains: number;
  total_ab_tests: number;
  running_ab_tests: number;
  total_tokens: number;
  active_tokens: number;
}

export interface DashboardData {
  statistics: SystemStatistics;
  recent_activities: Array<{
    created_at: string;
    description: string;
    id: number;
    type: string;
    user: string;
  }>;
  top_links: Array<{
    click_count: number;
    id: number;
    original_url: string;
    short_url: string;
    title?: string;
  }>;
}

/**
 * 系统统计API
 */
export namespace StatisticsApi {
  // 获取系统统计信息
  export function getSystemStatistics() {
    return requestClient.get<SystemStatistics>('/api/v1/statistics/system');
  }

  // 获取仪表板数据
  export function getDashboardData() {
    return requestClient.get<DashboardData>('/api/v1/statistics/dashboard');
  }

  // 获取用户统计
  export function getUserStatistics(params?: { days?: number }) {
    return requestClient.get('/api/v1/statistics/users', { params });
  }

  // 获取短链统计
  export function getShortLinkStatistics(params?: { days?: number }) {
    return requestClient.get('/api/v1/statistics/short-links', { params });
  }
}
