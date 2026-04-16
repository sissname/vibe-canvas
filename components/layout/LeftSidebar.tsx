'use client';

import React, { useState } from 'react';
import { FileTreePanel } from '@/components/file-tree/FileTreePanel';
import { NodeType } from '@/types/canvas';
import { 
  Box, 
  FileCode2, 
  Globe,
  Plus
} from 'lucide-react';

type LeftView = 'components' | 'files';

interface LeftSidebarProps {
  onAddNode?: (type: NodeType) => void;
  onFileSelect?: (fileId: string) => void;
}

// 组件库数据
const componentTemplates = [
  { type: 'input' as NodeType, label: '输入', icon: FileCode2, color: 'text-node-input', description: '用户指令输入' },
  { type: 'agent' as NodeType, label: 'Agent', icon: Box, color: 'text-node-agent', description: 'AI Agent 执行' },
  { type: 'code' as NodeType, label: '代码', icon: FileCode2, color: 'text-node-code', description: '代码执行' },
  { type: 'api' as NodeType, label: 'API', icon: Globe, color: 'text-node-api', description: 'HTTP API 调用' },
  { type: 'output' as NodeType, label: '输出', icon: FileCode2, color: 'text-node-output', description: '结果输出' },
];

export function LeftSidebar({ onAddNode, onFileSelect }: LeftSidebarProps) {
  const [activeView, setActiveView] = useState<LeftView>('components');
  const starterTemplates = [
    { title: '落地页', note: '最适合先做出第一眼效果' },
    { title: 'SaaS 控制台', note: '适合做产品原型和演示' },
    { title: 'AI 工具页', note: '带输入、结果和卖点展示' },
  ];
  
  const handleAddNode = (type: NodeType) => {
    onAddNode?.(type);
  };
  
  return (
    <aside className="panel-surface flex max-h-[36vh] w-full shrink-0 flex-col rounded-[20px] xl:max-h-none xl:w-full">
      <div className="border-b border-border-default px-3.5 pb-3 pt-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
            Starter
          </p>
          <h2 className="mt-1 text-[17px] font-semibold leading-5 text-text-primary">
            先选一个方向
          </h2>
          <p className="mt-1 text-[11px] leading-4 text-text-secondary">
            不确定怎么开始的时候，先从最像成品的模板感出发。
          </p>
        </div>

        <div className="mt-3 space-y-2.5">
          {starterTemplates.map((template) => (
            <button
              key={template.title}
              className="panel-muted w-full rounded-[18px] px-3 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-white"
            >
              <p className="text-[12px] font-semibold text-text-primary">{template.title}</p>
              <p className="mt-1 text-[11px] leading-4 text-text-secondary">{template.note}</p>
            </button>
          ))}
        </div>

        <div className="panel-muted mt-3 rounded-[18px] px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold text-text-primary">高级模式</p>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-text-muted shadow-sm">4 步</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {['输入', 'Agent', '代码 / API', '输出'].map((step) => (
              <div key={step} className="rounded-[14px] bg-white px-2.5 py-2 shadow-sm">
                <p className="text-[11px] font-medium text-text-primary">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-3.5 mt-2.5 flex rounded-xl bg-slate-950 p-1 text-white">
        <button
          onClick={() => setActiveView('components')}
          className={`flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200 ${
            activeView === 'components'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-white/70 hover:text-white'
          }`}
        >
          组件库
        </button>
        <button
          onClick={() => setActiveView('files')}
          className={`flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all duration-200 ${
            activeView === 'files'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-white/70 hover:text-white'
          }`}
        >
          文件树
        </button>
      </div>
      
      {activeView === 'components' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-[20px]">
          <div className="flex items-center justify-between px-3.5 py-2.5">
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Advanced
              </h3>
              <p className="mt-0.5 text-[13px] font-medium text-text-primary">
                自己补细节
              </p>
            </div>
          </div>
          
          <div className="flex-1 space-y-2 overflow-auto px-3.5 pb-3">
            {componentTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div
                  key={template.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('nodeType', template.type);
                  }}
                  onClick={() => handleAddNode(template.type)}
                  className="group panel-muted flex cursor-grab items-center gap-2.5 rounded-[18px] p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-md active:cursor-grabbing"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-white shadow-sm ${template.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="block text-[13px] font-semibold leading-4 text-text-primary">
                        {template.label}
                      </span>
                    </div>
                    <span className="mt-0.5 block text-[11px] leading-4 text-text-secondary">
                      {template.description}
                    </span>
                  </div>
                  <Plus className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              );
            })}
          </div>
          
          <div className="border-t border-border-light px-3.5 py-3">
            <p className="flex items-center gap-2 text-[11px] leading-4 text-text-secondary">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">i</span>
              如果你只是想快速出效果，可以先忽略这里，直接用上面的输入框生成。
            </p>
          </div>
        </div>
      )}
      
      {activeView === 'files' && (
        <div className="min-h-0 flex-1 px-2 pb-2 pt-4">
          <FileTreePanel onFileSelect={onFileSelect} />
        </div>
      )}
    </aside>
  );
}
