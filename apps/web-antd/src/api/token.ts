import { requestClient } from './request';

/**
 * API Token相关类型定义
 */
export interface Token {
  id: number;
  token_name: string;
  token?: string; // 只在创建时返回
  last_used_at?: string;
  expire_at?: string;
  status: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTokenRequest {
  token_name: string;
  expire_at?: string;
}

export interface TokenListResponse {
  list: Token[];
  total: number;
  page: number;
  size: number;
}

/**
 * API Token管理API
 */
export namespace TokenApi {
  // 创建Token
  export function create(data: CreateTokenRequest) {
    return requestClient.post<Token>('/api/v1/tokens', data);
  }

  // 获取Token列表
  export function getList(params: {
    page?: number;
    page_size?: number;
    token_name?: string;
    status?: number;
  }) {
    return requestClient.get<TokenListResponse>('/api/v1/tokens', {
      params,
    });
  }

  // 删除Token
  export function remove(tokenId: number) {
    return requestClient.delete(`/api/v1/tokens/${tokenId}`);
  }
} 
