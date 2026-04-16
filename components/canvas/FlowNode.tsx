'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
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
  Loader2,
  Trash2
} from 'lucide-react';

// 节点类型配置
const nodeConfig = {
  input: { 
    color: 'border-node-input/30', 
    bgColor: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(240,249,255,0.98))]',
    headerColor: 'from-node-input/15 to-node-input/0',
    iconColor: 'text-node-input',
    icon: Terminal 
  },
  agent: { 
    color: 'border-node-agent/30', 
    bgColor: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(239,246,255,0.98))]',
    headerColor: 'from-node-agent/15 to-node-agent/0',
    iconColor: 'text-node-agent',
    icon: Cpu 
  },
  condition: { 
    color: 'border-node-condition/30', 
    bgColor: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,251,235,0.98))]',
    headerColor: 'from-node-condition/15 to-node-condition/0',
    iconColor: 'text-node-condition',
    icon: GitBranch 
  },
  loop: { 
    color: 'border-node-loop/30', 
    bgColor: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,247,237,0.98))]',
    headerColor: 'from-node-loop/15 to-node-loop/0',
    iconColor: 'text-node-loop',
    icon: Repeat 
  },
  output: { 
    color: 'border-node-output/30', 
    bgColor: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(240,253,250,0.98))]',
    headerColor: 'from-node-output/15 to-node-output/0',
    iconColor: 'text-node-output',
    icon: Download 
  },
  code: { 
    color: 'border-node-code/30', 
    bgColor: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(245,243,255,0.98))]',
    headerColor: 'from-node-code/15 to-node-code/0',
    iconColor: 'text-node-code',
    icon: Code 
  },
  api: { 
    color: 'border-node-api/30', 
    bgColor: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(240,249,255,0.98))]',
    headerColor: 'from-node-api/15 to-node-api/0',
    iconColor: 'text-node-api',
    icon: Globe 
  },
  database: { 
    color: 'border-node-database/30', 
    bgColor: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(238,242,255,0.98))]',
    headerColor: 'from-node-database/15 to-node-database/0',
    iconColor: 'text-node-database',
    icon: Database 
  },
  file: { 
    color: 'border-node-file/30', 
    bgColor: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.98))]',
    headerColor: 'from-node-file/15 to-node-file/0',
    iconColor: 'text-node-file',
    icon: FileText 
  },
  webhook: { 
    color: 'border-node-webhook/30', 
    bgColor: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(254,242,242,0.98))]',
    headerColor: 'from-node-webhook/15 to-node-webhook/0',
    iconColor: 'text-node-webhook',
    icon: Webhook 
  },
};

// 状态图标
const statusIcons = {
  idle: null,
  running: <Loader2 className="w-4 h-4 animate-spin text-primary" />,
  success: <CheckCircle2 className="w-4 h-4 text-success" />,
  error: <XCircle className="w-4 h-4 text-error" />,
};

// 内部组件用于访问 useReactFlow
function FlowNodeContent({ id, data }: NodeProps<CanvasNode>) {
  const { deleteElements } = useReactFlow();
  const config = nodeConfig[data.type as keyof typeof nodeConfig] || nodeConfig.input;
  const Icon = config.icon;
  const StatusIcon = statusIcons[data.status || 'idle'];
  const statusLabel =
    data.status === 'running'
      ? '执行中'
      : data.status === 'success'
      ? '已完成'
      : data.status === 'error'
      ? '需处理'
      : null;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElements({ nodes: [{ id }] });
  };

  return (
    <div 
      className={`
        group relative w-[300px] overflow-hidden rounded-[22px] border shadow-[0_18px_40px_rgba(15,23,42,0.10)]
        ${config.color} ${config.bgColor} 
        transition-all duration-200
        hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(15,23,42,0.14)]
      `}
    >
      <div className={`absolute inset-x-0 top-0 h-[86px] bg-gradient-to-b ${config.headerColor}`} />
      
      <button
        onClick={handleDelete}
        className="absolute right-2 top-2 z-10 rounded-lg bg-white/82 p-1 opacity-0 shadow-sm transition-all duration-200 group-hover:opacity-100 hover:bg-error hover:text-white"
        title="删除节点 (Delete)"
      >
        <Trash2 className="h-3.5 w-3.5 text-error group-hover:text-white" />
      </button>
      
      <div className="relative p-4">
        {data.type !== 'input' && (
          <Handle
            type="target"
            position={Position.Top}
            className="!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-500 !shadow-sm"
          />
        )}

        <div className="mb-3 flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[15px] bg-white shadow-sm ${config.iconColor}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="break-words text-[16px] font-semibold leading-5 text-text-primary">
                {data.label}
              </p>
              {StatusIcon}
            </div>
            {data.description && (
              <p className="mt-1 break-words text-[12px] leading-5 text-text-secondary">
                {data.description}
              </p>
            )}
          </div>
        </div>

        {data.config?.prompt && (
          <div className="mt-2.5 rounded-[18px] border border-white/80 bg-white/84 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              用户价值
              </p>
            </div>
            <p className="max-h-[72px] overflow-auto break-words text-[11px] leading-[1.55] text-text-secondary">
              {data.config.prompt}
            </p>
          </div>
        )}

        {statusLabel && (
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span className="font-medium text-text-muted">{statusLabel}</span>
          </div>
        )}

        {data.type !== 'output' && (
          <Handle
            type="source"
            position={Position.Bottom}
            className="!h-2.5 !w-2.5 !border-2 !border-white !bg-slate-500 !shadow-sm"
          />
        )}
      </div>
    </div>
  );
}

// 导出包装组件
function FlowNode(props: NodeProps<CanvasNode>) {
  return <FlowNodeContent {...props} />;
}

export const MemoFlowNode = memo(FlowNode);
