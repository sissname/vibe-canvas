'use client';

import React, { useState } from 'react';
import { usePreviewStore } from '@/stores/preview-store';
import { 
  X, 
  RefreshCw, 
  ExternalLink,
  Terminal,
  Trash2,
  AlertCircle
} from 'lucide-react';

export function BottomPreview() {
  const {
    isVisible,
    url,
    isLoading,
    error,
    consoleLogs,
    height,
    hide,
    setLoading,
    clearConsole,
    setHeight,
  } = usePreviewStore();
  
  const [activeTab, setActiveTab] = useState<'preview' | 'console'>('preview');

  // 处理调整大小
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startY = e.clientY;
    const startHeight = height;
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startY - e.clientY;
      const deltaPercent = (deltaY / window.innerHeight) * 100;
      setHeight(startHeight + deltaPercent);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRefresh = () => {
    if (url) {
      setLoading(true);
      // 强制刷新 iframe
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = url;
      }
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleOpenExternal = () => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="panel-surface z-30 mt-3 flex min-h-[180px] flex-col overflow-hidden rounded-[28px]"
      style={{ height: `${height}%` }}
    >
      {/* 调整大小手柄 */}
      <div
        className="flex h-2 cursor-ns-resize items-center justify-center transition-colors hover:bg-primary/10"
        onMouseDown={handleMouseDown}
      >
        <div className="h-1 w-8 rounded-full bg-border-dark" />
      </div>
      
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-4">
          {/* 视图切换 */}
          <div className="flex rounded-2xl bg-slate-950 p-1 text-white">
            <button
              onClick={() => setActiveTab('preview')}
              className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              预览
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'console'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              控制台
              {consoleLogs.length > 0 && (
                <span className="rounded-full bg-bg-tertiary px-1.5 py-0.5 text-xs text-text-secondary">
                  {consoleLogs.length}
                </span>
              )}
            </button>
          </div>
          
          {/* 状态指示器 */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>加载中...</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeTab === 'preview' && url && (
            <>
              <button
                onClick={handleRefresh}
                className="panel-muted rounded-xl p-2 text-text-secondary transition-colors hover:text-text-primary"
                title="刷新"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={handleOpenExternal}
                className="panel-muted rounded-xl p-2 text-text-secondary transition-colors hover:text-text-primary"
                title="在新窗口打开"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </>
          )}
          
          {activeTab === 'console' && (
            <button
              onClick={clearConsole}
              className="panel-muted rounded-xl p-2 text-text-secondary transition-colors hover:text-text-primary"
              title="清空控制台"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={hide}
            className="panel-muted rounded-xl p-2 text-text-secondary transition-colors hover:text-text-primary"
            title="关闭预览"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'preview' && (
          <div className="h-full w-full">
            {url ? (
              <iframe
                id="preview-iframe"
                src={url}
              className="h-full w-full border-0 bg-white"
                title="Preview"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-secondary">
                <div className="panel-muted rounded-[24px] px-8 py-7 text-center">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>暂无预览</p>
                  <p className="text-sm mt-1">运行工作流后显示预览</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'console' && (
          <div className="h-full overflow-auto bg-slate-950 p-4 font-mono text-sm">
            {consoleLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>暂无日志</p>
              </div>
            ) : (
              <div className="space-y-1">
                {consoleLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warn' ? 'text-yellow-400' :
                      log.type === 'info' ? 'text-blue-400' :
                      'text-slate-300'
                    }`}
                  >
                    <span className="text-xs text-slate-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
