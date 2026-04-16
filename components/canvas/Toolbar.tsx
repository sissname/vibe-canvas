'use client';

import React from 'react';
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
  Play,
  Save,
  FolderOpen,
} from 'lucide-react';

interface ToolbarProps {
  onAddNode: (type: string, label: string, description: string) => void;
  onRunWorkflow: () => void;
  onExportWorkflow: () => void;
  onImportWorkflow: () => void;
}

const nodeTemplates = [
  { type: 'input', label: '输入', description: '用户指令输入', icon: Terminal },
  { type: 'agent', label: 'Agent', description: 'OpenClaw Agent 执行', icon: Cpu },
  { type: 'condition', label: '条件', description: '条件判断分支', icon: GitBranch },
  { type: 'loop', label: '循环', description: '循环执行', icon: Repeat },
  { type: 'code', label: '代码', description: '代码生成/执行', icon: Code },
  { type: 'api', label: 'API', description: 'HTTP API 调用', icon: Globe },
  { type: 'database', label: '数据库', description: '数据库操作', icon: Database },
  { type: 'file', label: '文件', description: '文件读写操作', icon: FileText },
  { type: 'webhook', label: 'Webhook', description: 'Webhook 触发', icon: Webhook },
  { type: 'output', label: '输出', description: '结果输出', icon: Download },
];

export function Toolbar({ onAddNode, onRunWorkflow, onExportWorkflow, onImportWorkflow }: ToolbarProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 p-2 bg-white border-b shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded text-white font-bold text-sm">
        <Cpu className="w-4 h-4" />
        <span>VibeCanvas</span>
      </div>

      {/* 分隔线 */}
      <div className="w-px h-6 bg-gray-300" />

      {/* 节点库 */}
      <div className="flex items-center gap-1">
        {nodeTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <button
              key={template.type}
              onClick={() => onAddNode(template.type, template.label, template.description)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title={template.description}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">{template.label}</span>
            </button>
          );
        })}
      </div>

      {/* 右侧操作按钮 */}
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={onExportWorkflow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="导出工作流"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">导出</span>
        </button>

        <button
          onClick={onImportWorkflow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
          title="导入工作流"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="hidden sm:inline">导入</span>
        </button>

        <button
          onClick={onRunWorkflow}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded transition-colors shadow-sm"
        >
          <Play className="w-4 h-4" />
          <span>运行</span>
        </button>
      </div>
    </div>
  );
}
