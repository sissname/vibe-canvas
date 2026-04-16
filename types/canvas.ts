// 画布节点类型定义
import type { Node, Edge } from '@xyflow/react';

// 支持的节点类型
export type NodeType = 
  | 'input'        // 输入节点（用户指令）
  | 'agent'        // Agent 执行节点
  | 'condition'    // 条件判断节点
  | 'loop'         // 循环节点
  | 'output'       // 输出节点
  | 'code'         // 代码生成节点
  | 'api'          // API 调用节点
  | 'database'     // 数据库操作节点
  | 'file'         // 文件操作节点
  | 'webhook';     // Webhook 节点

// 节点数据接口
export interface CanvasNodeData {
  label: string;
  type: NodeType;
  description?: string;
  config?: {
    agentId?: string;      // OpenClaw Agent ID
    prompt?: string;       // AI 提示词
    endpoint?: string;     // API 端点
    method?: string;       // HTTP 方法
    timeout?: number;      // 超时时间
    [key: string]: unknown;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
  output?: unknown;
  error?: string;
  [key: string]: unknown;  // 添加索引签名以满足 React Flow 类型要求
}

// 画布节点类型
export type CanvasNode = Node<CanvasNodeData>;

// 画布边类型
export interface CanvasEdgeData {
  label?: string;
  condition?: string;      // 条件边的条件表达式
  [key: string]: unknown;      // 添加索引签名以满足 React Flow 类型要求
}

export type CanvasEdge = Edge<CanvasEdgeData>;

// 工作流定义
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  createdAt: string;
  updatedAt: string;
  version: string;
}

// OpenClaw Agent 定义
export interface OpenClawAgent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'online' | 'offline' | 'busy';
}

// API 响应类型
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 执行结果
export interface ExecutionResult {
  nodeId: string;
  output: unknown;
  duration: number;
  status: 'success' | 'error';
  error?: string;
  timestamp?: string;
}
