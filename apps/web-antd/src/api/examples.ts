/**
 * API使用示例
 * 本文件展示了如何使用各个API模块
 */

import {
  ShortLinkApi,
  DomainApi,
  ABTestApi,
  UserManagementApi,
  ProfileApi,
  TokenApi,
  LogApi,
  HealthApi
} from './index';

export class ApiExamples {
  /**
   * 短网址管理示例
   */
  static async shortLinkExamples() {
    // 创建短网址
    const newShortLink = await ShortLinkApi.create({
      original_url: 'https://www.example.com',
      domain: 'https://dwz.do',
      custom_code: 'example',
      title: '示例网站',
      description: '这是一个示例网站'
    });

    // 获取短网址列表
    const shortLinkList = await ShortLinkApi.getList({
      page: 1,
      page_size: 10,
      keyword: 'example',
    });

    // 获取短网址详情
    const shortLinkDetail = await ShortLinkApi.getDetail(1);

    // 更新短网址
    const updatedShortLink = await ShortLinkApi.update(1, {
      title: '更新后的标题',
      is_active: true
    });

    // 删除短网址
    await ShortLinkApi.remove(1);

    // 批量创建短网址
    const batchResult = await ShortLinkApi.batchCreate({
      urls: [
        'https://www.example1.com',
        'https://www.example2.com'
      ],
      domain: 'https://dwz.do'
    });

    // 获取短网址统计
    const statistics = await ShortLinkApi.getStatistics(1, 30);

    // 预览短网址
    const preview = await ShortLinkApi.preview('abc123');

    return {
      newShortLink,
      shortLinkList,
      shortLinkDetail,
      updatedShortLink,
      batchResult,
      statistics,
      preview
    };
  }

  /**
   * 域名管理示例
   */
  static async domainExamples() {
    // 创建域名配置
    const newDomain = await DomainApi.create({
      domain: 'dwz.do',
      protocol: 'https',
      site_name: '短网址服务',
      icp_number: '京ICP备12345678号',
      description: '主要短链域名'
    });

    // 获取域名列表
    const domainList = await DomainApi.getList();

    // 获取活跃域名列表
    const activeDomains = await DomainApi.getActiveList();

    // 更新域名配置
    const updatedDomain = await DomainApi.update(1, {
      is_active: true,
      description: '更新后的描述'
    });

    // 删除域名配置
    await DomainApi.remove(1);

    return {
      newDomain,
      domainList,
      activeDomains,
      updatedDomain
    };
  }

  /**
   * AB测试管理示例
   */
  static async abTestExamples() {
    // 创建AB测试
    const newABTest = await ABTestApi.create({
      short_link_id: 1,
      name: '首页Banner测试',
      description: '测试不同banner的点击率',
      traffic_split: 'equal',
      variants: [
        {
          name: '版本A',
          target_url: 'https://example.com/page-a',
          weight: 50,
          is_control: true,
          description: '原始版本'
        },
        {
          name: '版本B',
          target_url: 'https://example.com/page-b',
          weight: 50,
          is_control: false,
          description: '新版本'
        }
      ]
    });

    // 获取AB测试列表
    const abTestList = await ABTestApi.getList({
      page: 1,
      page_size: 10,
      status: 'running',
    });

    // 获取AB测试详情
    const abTestDetail = await ABTestApi.getDetail(1);

    // 更新AB测试
    const updatedABTest = await ABTestApi.update(1, {
      status: 'running',
      is_active: true
    });

    // 启动AB测试
    await ABTestApi.start(1, {
      start_time: '2024-01-15T00:00:00Z'
    });

    // 停止AB测试
    await ABTestApi.stop(1, {
      end_time: '2024-02-15T00:00:00Z'
    });

    // 获取AB测试统计
    const abTestStats = await ABTestApi.getStatistics(1, 30);

    // 删除AB测试
    await ABTestApi.remove(1);

    return {
      newABTest,
      abTestList,
      abTestDetail,
      updatedABTest,
      abTestStats
    };
  }

  /**
   * 用户管理示例
   */
  static async userManagementExamples() {
    // 创建用户
    const newUser = await UserManagementApi.create({
      username: 'newuser',
      password: 'password123',
      real_name: '张三',
      email: 'user@example.com',
      phone: '13800138000'
    });

    // 获取用户列表
    const userList = await UserManagementApi.getList({
      page: 1,
      page_size: 10,
      status: 1
    });

    // 获取用户详情
    const userDetail = await UserManagementApi.getDetail(1);

    // 更新用户
    const updatedUser = await UserManagementApi.update(1, {
      real_name: '李四',
      status: 1
    });

    // 重置用户密码
    await UserManagementApi.resetPassword(1, {
      new_password: 'newpassword123'
    });

    // 删除用户
    await UserManagementApi.remove(1);

    return {
      newUser,
      userList,
      userDetail,
      updatedUser
    };
  }

  /**
   * 个人资料管理示例
   */
  static async profileExamples() {
    // 获取当前用户信息
    const profile = await ProfileApi.getProfile();

    // 修改密码
    await ProfileApi.changePassword({
      old_password: 'oldpassword',
      new_password: 'newpassword123'
    });

    return {
      profile
    };
  }

  /**
   * API Token管理示例
   */
  static async tokenExamples() {
    // 创建Token
    const newToken = await TokenApi.create({
      token_name: 'API Token',
      expire_at: '2024-12-31T23:59:59Z'
    });

    // 获取Token列表
    const tokenList = await TokenApi.getList({
      page: 1,
      page_size: 10,
      status: 1
    });

    // 删除Token
    await TokenApi.remove(1);

    return {
      newToken,
      tokenList
    };
  }

  /**
   * 操作日志示例
   */
  static async logExamples() {
    // 获取操作日志
    const logs = await LogApi.getList({
      page: 1,
      page_size: 10,
      operation: '创建短网址',
      status: 1,
      start_time: '2024-01-01 00:00:00',
      end_time: '2024-12-31 23:59:59'
    });

    return {
      logs
    };
  }

  /**
   * 健康检查示例
   */
  static async healthExamples() {
    // 获取健康状态详细信息
    const healthStatus = await HealthApi.getHealthStatus();

    // 简单健康检查
    const simpleHealth = await HealthApi.getSimpleHealth();

    return {
      healthStatus,
      simpleHealth
    };
  }
}
