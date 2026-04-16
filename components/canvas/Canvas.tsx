'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  NodeChange,
  EdgeChange,
  ReactFlowProvider,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { MemoFlowNode } from './FlowNode';
import { CanvasNode, CanvasEdge } from '@/types/canvas';
import { CodePanel } from './CodePanel';
import { AgentConfigPanel } from './AgentConfigPanel';
import { CodeConfigPanel } from './CodeConfigPanel';
import { workflowSerializer } from '@/lib/workflow-serializer';
import { useWorkflowStore } from '@/stores/workflow-store';

// 注册自定义节点类型
const nodeTypes = {
  flow: MemoFlowNode,
};

type OpenNodeConfigDetail = {
  nodeId: string;
  type: 'agent' | 'code';
};

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

// 内部组件
function CanvasContent() {
  // Zustand 状态
  const {
    nodes: storeNodes,
    edges: storeEdges,
    showCodePanel,
    showAgentConfig,
    showCodeConfig,
    configNodeId,
    syncNodesEdges,
    setShowCodePanel,
    setShowAgentConfig,
    setShowCodeConfig,
  } = useWorkflowStore();

  // React Flow 状态管理
  const [nodes, setNodes] = useNodesState<CanvasNode>(
    storeNodes.length > 0 ? storeNodes : initialNodes
  );
  const [edges, setEdges] = useEdgesState<CanvasEdge>(
    storeEdges.length > 0 ? storeEdges : initialEdges
  );

  const storeSignature = useMemo(
    () => JSON.stringify({ nodes: storeNodes, edges: storeEdges }),
    [storeNodes, storeEdges]
  );

  const localSignature = useMemo(
    () => JSON.stringify({ nodes, edges }),
    [nodes, edges]
  );

  const localSignatureRef = useRef(localSignature);

  useEffect(() => {
    localSignatureRef.current = localSignature;
  }, [localSignature]);

  const syncToStore = useCallback(
    (nextNodes: CanvasNode[], nextEdges: CanvasEdge[]) => {
      queueMicrotask(() => syncNodesEdges(nextNodes, nextEdges));
    },
    [syncNodesEdges]
  );
  
  useEffect(() => {
    if (storeSignature !== localSignatureRef.current) {
      setNodes(storeNodes);
      setEdges(storeEdges);
    }
  }, [setEdges, setNodes, storeEdges, storeNodes, storeSignature]);
  
  // 监听打开配置事件
  useEffect(() => {
    const handleOpenConfig = (event: Event) => {
      const customEvent = event as CustomEvent<OpenNodeConfigDetail>;
      const { nodeId, type } = customEvent.detail;

      if (!nodeId) {
        return;
      }

      if (type === 'agent') {
        setShowAgentConfig(true, nodeId);
      } else if (type === 'code') {
        setShowCodeConfig(true, nodeId);
      }
    };

    window.addEventListener('open-node-config', handleOpenConfig);
    return () => window.removeEventListener('open-node-config', handleOpenConfig);
  }, [setShowAgentConfig, setShowCodeConfig]);
  
  // 处理节点变化
  const handleNodesChange = useCallback((changes: NodeChange<CanvasNode>[]) => {
    setNodes((currentNodes) => {
      const nextNodes = applyNodeChanges(changes, currentNodes);
      syncToStore(nextNodes, edges);
      return nextNodes;
    });
  }, [edges, setNodes, syncToStore]);
  
  // 处理边变化
  const handleEdgesChange = useCallback((changes: EdgeChange<CanvasEdge>[]) => {
    setEdges((currentEdges) => {
      const nextEdges = applyEdgeChanges(changes, currentEdges);
      syncToStore(nodes, nextEdges);
      return nextEdges;
    });
  }, [nodes, setEdges, syncToStore]);

  // 处理连接
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) => {
        const nextEdges = addEdge({ ...connection, animated: true }, currentEdges);
        syncToStore(nodes, nextEdges);
        return nextEdges;
      });
    },
    [nodes, setEdges, syncToStore]
  );

  // 处理节点点击
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: CanvasNode) => {
      if (node.data.type === 'agent' || node.data.type === 'code') {
        const event = new CustomEvent('open-node-config', { 
          detail: { nodeId: node.id, type: node.data.type } 
        });
        window.dispatchEvent(event);
      }
    },
    []
  );
  


  // 导出工作流
  // 隐藏的文件输入
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 导入工作流
  const onImportWorkflow = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const { nodes: importedNodes, edges: importedEdges } = await workflowSerializer.upload(file);
      setNodes(importedNodes);
      setEdges(importedEdges);
      syncToStore(importedNodes, importedEdges);
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      alert(`导入失败：${message}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [setNodes, setEdges, syncToStore]);

  return (
    <div className="panel-surface relative h-full w-full overflow-hidden rounded-[24px]">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={onImportWorkflow}
        className="hidden"
      />

      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2">
        <div className="panel-muted rounded-[16px] px-3.5 py-2.5 shadow-sm">
          <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-text-muted">
            Optional Canvas
          </p>
          <p className="mt-1 text-[13px] font-semibold text-text-primary">这里是高级模式，想细调时再展开用</p>
        </div>
        <div className="panel-muted hidden rounded-full px-3 py-2 shadow-sm 2xl:flex">
          <span className="text-xs text-text-secondary">
            大多数人只需要上面的输入框，画布留给想继续调结构的人。
          </span>
        </div>
      </div>

      <ReactFlow<CanvasNode, CanvasEdge>
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 28, y: 34, zoom: 1.04 }}
        snapToGrid
        snapGrid={[15, 15]}
        className="bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.12),_transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.36),transparent_26%),var(--bg-canvas)]"
        deleteKeyCode={['Backspace', 'Delete']}
      >
        <Controls className="!bottom-5 !left-5 !rounded-[18px] !border !border-border-light !bg-white/92 !shadow-lg" />
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.4}
          color="rgba(148, 163, 184, 0.32)"
        />
      </ReactFlow>

      {showCodePanel && (
        <CodePanel
          workflow={{ nodes, edges }}
          onClose={() => setShowCodePanel(false)}
        />
      )}

      {showAgentConfig && configNodeId && (
        <AgentConfigPanel
          node={nodes.find((n) => n.id === configNodeId)!}
          onUpdate={(nodeId, data) => {
            setNodes((currentNodes) => {
              const nextNodes = currentNodes.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
              );
              syncToStore(nextNodes, edges);
              return nextNodes;
            });
            setShowAgentConfig(false, null);
          }}
          onClose={() => setShowAgentConfig(false, null)}
        />
      )}

      {showCodeConfig && configNodeId && (
        <CodeConfigPanel
          node={nodes.find((n) => n.id === configNodeId)!}
          onUpdate={(nodeId, data) => {
            setNodes((currentNodes) => {
              const nextNodes = currentNodes.map((node) =>
                node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
              );
              syncToStore(nextNodes, edges);
              return nextNodes;
            });
            setShowCodeConfig(false, null);
          }}
          onClose={() => setShowCodeConfig(false, null)}
        />
      )}
    </div>
  );
}

// 导出包装组件
export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
