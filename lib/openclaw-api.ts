import axios from 'axios';
import { Workflow, OpenClawAgent, APIResponse, ExecutionResult } from '@/types/canvas';

// OpenClaw 网关配置
const OPENCLAW_GATEWAY = process.env.NEXT_PUBLIC_OPENCLAW_GATEWAY || 'http://localhost:18789';

// 创建 axios 实例
const api = axios.create({
  baseURL: OPENCLAW_GATEWAY,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证
api.interceptors.request.use(
  (config) => {
    // TODO: 从本地存储获取 token
    const token = localStorage.getItem('openclaw_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '未知错误';
}

/**
 * OpenClaw API 服务
 */
export const openclawAPI = {
  /**
   * 获取所有可用 Agent 列表
   */
  async getAgents(): Promise<APIResponse<OpenClawAgent[]>> {
    try {
      const response = await api.get<OpenClawAgent[]>('/api/agents');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * 获取单个 Agent 状态
   */
  async getAgentStatus(agentId: string): Promise<APIResponse<OpenClawAgent>> {
    try {
      const response = await api.get<OpenClawAgent>(`/api/agents/${agentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * 执行工作流
   */
  async executeWorkflow(workflow: Workflow): Promise<APIResponse<ExecutionResult[]>> {
    try {
      const response = await api.post<ExecutionResult[]>('/api/workflow/execute', {
        workflow_id: workflow.id,
        nodes: workflow.nodes,
        edges: workflow.edges,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * 执行单个 Agent 任务
   */
  async executeAgent(
    agentId: string,
    prompt: string,
    options?: { timeout?: number; context?: Record<string, unknown> }
  ): Promise<APIResponse<Record<string, unknown>>> {
    try {
      const response = await api.post<Record<string, unknown>>('/api/agent/execute', {
        agent_id: agentId,
        prompt,
        ...options,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * 获取系统健康状态
   */
  async getHealth(): Promise<APIResponse<Record<string, unknown>>> {
    try {
      const response = await api.get<Record<string, unknown>>('/api/health');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * 保存工作流
   */
  async saveWorkflow(workflow: Workflow): Promise<APIResponse<{ id: string }>> {
    try {
      const response = await api.post<{ id: string }>('/api/workflows', workflow);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * 加载工作流
   */
  async loadWorkflow(workflowId: string): Promise<APIResponse<Workflow>> {
    try {
      const response = await api.get<Workflow>(`/api/workflows/${workflowId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * 获取工作流列表
   */
  async listWorkflows(): Promise<APIResponse<Workflow[]>> {
    try {
      const response = await api.get<Workflow[]>('/api/workflows');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },
};
