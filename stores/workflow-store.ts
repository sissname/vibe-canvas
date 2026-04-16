import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CanvasNode, CanvasEdge, Workflow, NodeType, ExecutionResult } from '@/types/canvas';

// 初始节点
const initialNodes: CanvasNode[] = [
  {
    id: '1',
    type: 'flow',
    position: { x: 300, y: 70 },
    data: {
      label: '开始',
      type: 'input',
      description: '用户指令输入',
      config: {
        prompt: '创建一个待办事项应用',
      },
    },
  },
  {
    id: '2',
    type: 'flow',
    position: { x: 300, y: 210 },
    data: {
      label: 'Agent 执行',
      type: 'agent',
      description: '调用 OpenClaw Agent',
      config: {
        agentId: 'main',
        prompt: '根据需求生成代码',
      },
    },
  },
  {
    id: '3',
    type: 'flow',
    position: { x: 300, y: 350 },
    data: {
      label: '代码输出',
      type: 'output',
      description: '显示生成结果',
    },
  },
];

// 初始边
const initialEdges: CanvasEdge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
];

interface WorkflowState {
  // 画布状态
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  
  // 工作流元数据
  workflowName: string;
  workflowId: string | null;
  
  // UI 状态
  selectedNode: string | null;
  showCodePanel: boolean;
  showAgentConfig: boolean;
  showCodeConfig: boolean;
  configNodeId: string | null;
  
  // 执行状态
  isExecuting: boolean;
  executionResults: Map<string, ExecutionResult>;
  
  // 历史记录（撤销/重做）
  history: { nodes: CanvasNode[]; edges: CanvasEdge[] }[];
  historyIndex: number;
  
  // Actions - 节点操作
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, data: Partial<CanvasNode['data']>) => void;
  selectNode: (id: string | null) => void;
  
  // Actions - 边操作
  addEdge: (source: string, target: string) => void;
  removeEdge: (id: string) => void;
  
  // Actions - 工作流操作
  setWorkflowName: (name: string) => void;
  exportWorkflow: () => Workflow;
  importWorkflow: (workflow: Workflow) => void;
  resetWorkflow: () => void;
  
  // Actions - 同步
  syncNodesEdges: (nodes: CanvasNode[], edges: CanvasEdge[]) => void;
  
  // Actions - UI 控制
  setShowCodePanel: (show: boolean) => void;
  setShowAgentConfig: (show: boolean, nodeId?: string | null) => void;
  setShowCodeConfig: (show: boolean, nodeId?: string | null) => void;
  
  // Actions - 执行控制
  setIsExecuting: (executing: boolean) => void;
  setExecutionResult: (nodeId: string, result: ExecutionResult) => void;
  clearExecutionResults: () => void;
  
  // Actions - 历史记录
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const MAX_HISTORY = 50;

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      // 初始状态
      nodes: initialNodes,
      edges: initialEdges,
      workflowName: '未命名工作流',
      workflowId: null,
      selectedNode: null,
      showCodePanel: false,
      showAgentConfig: false,
      showCodeConfig: false,
      configNodeId: null,
      isExecuting: false,
      executionResults: new Map(),
      history: [],
      historyIndex: -1,
      
      // 推入历史记录
      pushHistory: () => {
        const { nodes, edges, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
        
        // 限制历史记录大小
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
        }
        
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },
      
      // 撤销
      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const prevState = history[newIndex];
          set({
            nodes: prevState.nodes,
            edges: prevState.edges,
            historyIndex: newIndex,
          });
        }
      },
      
      // 重做
      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          const nextState = history[newIndex];
          set({
            nodes: nextState.nodes,
            edges: nextState.edges,
            historyIndex: newIndex,
          });
        }
      },
      
      // 添加节点
      addNode: (type, position) => {
        get().pushHistory();
        
        const labelMap: Record<string, string> = {
          input: '输入',
          agent: 'Agent',
          code: '代码',
          api: 'API',
          output: '输出',
          condition: '条件',
          loop: '循环',
          database: '数据库',
          file: '文件',
          webhook: 'Webhook',
        };
        
        const newNode: CanvasNode = {
          id: `node-${Date.now()}`,
          type: 'flow',
          position,
          data: {
            label: labelMap[type] || type,
            type,
            description: getNodeTypeDescription(type),
            status: 'idle',
            config: getDefaultConfig(type),
          },
        };
        
        set((state) => ({ nodes: [...state.nodes, newNode] }));
      },
      
      // 删除节点
      removeNode: (id) => {
        get().pushHistory();
        
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
        }));
      },
      
      // 更新节点
      updateNode: (id, data) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n
          ),
        }));
      },
      
      // 选择节点
      selectNode: (id) => {
        set({ selectedNode: id });
      },
      
      // 添加边
      addEdge: (source, target) => {
        get().pushHistory();
        
        const newEdge: CanvasEdge = {
          id: `edge-${Date.now()}`,
          source,
          target,
        };
        
        set((state) => ({ edges: [...state.edges, newEdge] }));
      },
      
      // 删除边
      removeEdge: (id) => {
        get().pushHistory();
        
        set((state) => ({
          edges: state.edges.filter((e) => e.id !== id),
        }));
      },
      
      // 设置工作流名称
      setWorkflowName: (name) => {
        set({ workflowName: name });
      },
      
      // 导出工作流
      exportWorkflow: () => {
        const { nodes, edges, workflowName } = get();
        return {
          id: `workflow-${Date.now()}`,
          name: workflowName,
          description: '',
          nodes: JSON.parse(JSON.stringify(nodes)),
          edges: JSON.parse(JSON.stringify(edges)),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
        };
      },
      
      // 导入工作流
      importWorkflow: (workflow) => {
        get().pushHistory();
        
        set({
          nodes: workflow.nodes,
          edges: workflow.edges,
          workflowName: workflow.name,
          workflowId: workflow.id,
        });
      },
      
      // 重置工作流
      resetWorkflow: () => {
        get().pushHistory();
        
        set({
          nodes: initialNodes,
          edges: initialEdges,
          workflowName: '未命名工作流',
          workflowId: null,
          selectedNode: null,
          showCodePanel: false,
          showAgentConfig: false,
          showCodeConfig: false,
          configNodeId: null,
          isExecuting: false,
          executionResults: new Map(),
          history: [],
          historyIndex: -1,
        });
      },
      
      // 同步节点和边（从 React Flow 到 Zustand）
      syncNodesEdges: (nodes, edges) => {
        set({ nodes, edges });
      },
      
      // 设置代码面板显示
      setShowCodePanel: (show) => {
        set({ showCodePanel: show });
      },
      
      // 设置 Agent 配置面板显示
      setShowAgentConfig: (show, nodeId = null) => {
        set({ 
          showAgentConfig: show,
          configNodeId: nodeId !== null ? nodeId : get().configNodeId,
        });
      },
      
      // 设置 Code 配置面板显示
      setShowCodeConfig: (show, nodeId = null) => {
        set({ 
          showCodeConfig: show,
          configNodeId: nodeId !== null ? nodeId : get().configNodeId,
        });
      },
      
      // 设置执行状态
      setIsExecuting: (executing) => {
        set({ isExecuting: executing });
      },
      
      // 设置执行结果
      setExecutionResult: (nodeId, result) => {
        set((state) => {
          const newResults = new Map(state.executionResults);
          newResults.set(nodeId, result);
          return { executionResults: newResults };
        });
      },
      
      // 清除执行结果
      clearExecutionResults: () => {
        set({ executionResults: new Map() });
      },
    }),
    {
      name: 'vibecanvas-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        workflowName: state.workflowName,
        workflowId: state.workflowId,
        // 不持久化 UI 状态和执行状态
      }),
    }
  )
);

// 节点类型描述
function getNodeTypeDescription(type: NodeType): string {
  const descriptions: Record<string, string> = {
    input: '用户指令输入',
    agent: 'OpenClaw Agent 执行',
    code: '代码执行',
    output: '结果输出',
    api: 'HTTP API 调用',
    condition: '条件判断分支',
    loop: '循环执行',
    database: '数据库操作',
    file: '文件读写',
    webhook: 'Webhook 触发',
  };
  return descriptions[type] || type;
}

// 默认配置
function getDefaultConfig(type: NodeType): Record<string, unknown> {
  switch (type) {
    case 'input':
      return { prompt: '' };
    case 'agent':
      return { agentId: 'main', prompt: '', timeout: 30000 };
    case 'code':
      return { code: getDefaultCodeTemplate() };
    case 'output':
      return { format: 'json', template: '{{value}}' };
    case 'api':
      return { endpoint: '', method: 'GET', headers: {}, body: '' };
    default:
      return {};
  }
}

// 默认代码模板
function getDefaultCodeTemplate(): string {
  return `// Code 节点 - JavaScript 执行环境
// 可用变量：inputs (上游节点输出), context (全局上下文)

async function main(inputs, context) {
  console.log('输入数据:', inputs);
  
  const result = {
    processed: true,
    timestamp: new Date().toISOString(),
    data: '处理后的数据'
  };
  
  return result;
}`;
}
