'use client';

import React from 'react';
import { Play, Save, FolderOpen, Settings, Zap } from 'lucide-react';

interface TopBarProps {
  workflowName: string;
  onWorkflowNameChange: (name: string) => void;
  onRun: () => void;
  onSave: () => void;
  onOpen: () => void;
  onTogglePreview?: () => void;
  isPreviewVisible?: boolean;
}

export function TopBar({
  workflowName,
  onWorkflowNameChange,
  onRun,
  onSave,
  onOpen,
  onTogglePreview,
  isPreviewVisible,
}: TopBarProps) {
  return (
    <div className="panel-surface z-20 flex min-h-[62px] shrink-0 items-center justify-between gap-3 rounded-[24px] px-4 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex min-w-[170px] items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_60%,#06b6d4_100%)] shadow-md">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              Idea To App
            </p>
            <span className="bg-gradient-to-r from-slate-950 via-primary to-accent bg-clip-text text-[22px] font-semibold leading-none text-transparent">
              VibeCanvas
            </span>
          </div>
        </div>

        <div className="hidden h-7 w-px bg-border-default lg:block" />

        <div className="panel-muted hidden min-w-[280px] max-w-[460px] flex-1 items-center gap-3 rounded-[18px] px-3 py-2.5 md:flex">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-slate-950 text-[10px] font-semibold text-white">
            想法
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">
              Launch Prompt
            </p>
            <input
              type="text"
              value={workflowName}
              onChange={(event) => onWorkflowNameChange(event.target.value)}
              className="w-full bg-transparent text-[15px] font-semibold leading-5 text-text-primary placeholder:text-text-muted focus:outline-none"
              placeholder="给你的应用起个名字"
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2">
        <div className="panel-muted hidden items-center gap-2 rounded-full px-3 py-1.5 xl:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
          <span className="text-[12px] font-medium text-text-secondary">
            Ready to launch
          </span>
        </div>

        <button
          onClick={onOpen}
          className="panel-muted flex items-center gap-1.5 rounded-[16px] px-3 py-2 text-[13px] text-text-secondary transition-all duration-200 hover:-translate-y-0.5 hover:text-text-primary"
          title="打开工作流"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="hidden lg:inline">打开</span>
        </button>
        
        <button
          onClick={onSave}
          className="panel-muted flex items-center gap-1.5 rounded-[16px] px-3 py-2 text-[13px] text-text-secondary transition-all duration-200 hover:-translate-y-0.5 hover:text-text-primary"
          title="保存工作流"
        >
          <Save className="w-4 h-4" />
          <span className="hidden lg:inline">保存</span>
        </button>
        
        <button
          className="panel-muted rounded-[16px] p-2 text-text-secondary transition-all duration-200 hover:-translate-y-0.5 hover:text-text-primary"
          title="设置"
        >
          <Settings className="w-4 h-4" />
        </button>
        
        {onTogglePreview && (
          <button
            onClick={onTogglePreview}
            className={`rounded-[16px] p-2 transition-all duration-200
                       ${isPreviewVisible 
                         ? 'panel-muted text-primary' 
                         : 'panel-muted text-text-secondary hover:-translate-y-0.5 hover:text-text-primary'
                       }`}
            title="切换预览"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </button>
        )}

        <div className="hidden h-7 w-px bg-border-default sm:block" />
        
        <button
          onClick={onRun}
          className="flex items-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_62%,#06b6d4_100%)] px-4 py-2.5 text-[13px] font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
        >
          <Play className="w-4 h-4" />
          <span>立即生成</span>
        </button>
      </div>
    </div>
  );
}
