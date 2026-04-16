'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { CanvasNode } from '@/types/canvas';
import { 
  Terminal, 
  Cpu, 
  GitBranch, 
  Repeat, 
  Download, 
  Code, 
  Globe, 
  Database, 
  FileText,
  Webhook,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

// 节点类型图标映射
const nodeIcons: Record<string, React.ElementType> = {
  input: Terminal,
  agent: Cpu,
  condition: GitBranch,
  loop: Repeat,
  output: Download,
  code: Code,
  api: Globe,
  database: Database,
  file: FileText,
  webhook: Webhook,
};

// 节点类型颜色映射
const nodeColors: Record<string, string> = {
  input: 'border-blue-500 bg-blue-50',
  agent: 'border-purple-500 bg-purple-50',
  condition: 'border-yellow-500 bg-yellow-50',
  loop: 'border-orange-500 bg-orange-50',
  output: 'border-green-500 bg-green-50',
  code: 'border-pink-500 bg-pink-50',
  api: 'border-cyan-500 bg-cyan-50',
  database: 'border-indigo-500 bg-indigo-50',
  file: 'border-gray-500 bg-gray-50',
  webhook: 'border-red-500 bg-red-50',
};

// 状态图标
const statusIcons = {
  idle: null,
  running: <Loader2 className="w-3 h-3 animate-spin text-blue-500" />,
  success: <CheckCircle2 className="w-3 h-3 text-green-500" />,
  error: <XCircle className="w-3 h-3 text-red-500" />,
};

function CustomNode({ id, data }: NodeProps<CanvasNode>) {
  const nodeData = data;
  const Icon = nodeIcons[nodeData.type] || Terminal;
  const colorClass = nodeColors[nodeData.type] || 'border-gray-500 bg-gray-50';
  const StatusIcon = statusIcons[nodeData.status || 'idle'];

  // 打开配置面板
  const handleOpenConfig = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (nodeData.type === 'agent' || nodeData.type === 'code') {
      const event = new CustomEvent('open-node-config', { 
        detail: { nodeId: id, type: nodeData.type } 
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <div 
      className={`px-4 py-3 shadow-lg rounded-lg border-2 min-w-[200px] max-w-[300px] ${colorClass} hover:shadow-xl transition-shadow`}
      title={nodeData.type === 'agent' || nodeData.type === 'code' ? '点击节点打开配置' : ''}
    >
      {/* 输入 Handle */}
      {nodeData.type !== 'input' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-gray-400 !w-3 !h-3"
        />
      )}

      {/* 节点内容 */}
      <div 
        className="flex items-center gap-2 mb-2 cursor-pointer"
        onClick={handleOpenConfig}
      >
        <div className="p-1.5 rounded bg-white shadow-sm">
          <Icon className="w-4 h-4 text-gray-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-gray-800 truncate">
              {nodeData.label}
            </p>
            {StatusIcon}
          </div>
          {nodeData.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {nodeData.description}
            </p>
          )}
        </div>
      </div>

      {/* 节点配置预览 */}
      {nodeData.config?.prompt && (
        <div className="text-xs text-gray-600 bg-white/50 rounded p-2 mt-2">
          <p className="truncate">&quot;{nodeData.config.prompt}&quot;</p>
        </div>
      )}

      {/* 输出 Handle */}
      {nodeData.type !== 'output' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-gray-400 !w-3 !h-3"
        />
      )}
    </div>
  );
}

export const MemoCustomNode = memo(CustomNode);
