'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '@/stores/chat-store';
import { MessageSquare, Settings, Send, Sparkles, Wand2, X } from 'lucide-react';

type RightView = 'chat' | 'config';

interface RightSidebarProps {
  onChatSubmit?: (message: string) => Promise<string>;
  onNodeConfig?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export function RightSidebar({ onChatSubmit, onNodeConfig, selectedNodeId }: RightSidebarProps) {
  const [activeView, setActiveView] = useState<RightView>('chat');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isStreaming,
    streamingContent,
    suggestions,
    addMessage,
    startStreaming,
    appendStreaming,
    endStreaming,
  } = useChatStore();
  const promptSets = suggestions.slice(0, 4);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    // 添加用户消息
    addMessage({ role: 'user', content: inputValue });
    const userMessage = inputValue;
    setInputValue('');
    
    // 开始流式响应
    startStreaming();
    
    try {
      const response = onChatSubmit
        ? await onChatSubmit(userMessage)
        : '工作流已更新，可以点击“运行”开始执行。';

      appendStreaming(response);
      endStreaming();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '请求失败，请重试';

      endStreaming();
      addMessage({
        role: 'system',
        content: `❌ ${message}`,
      });
    }
  };
  
  return (
    <aside className="panel-surface flex max-h-[38vh] w-full shrink-0 flex-col rounded-[20px] xl:max-h-none xl:w-full">
      <div className="border-b border-border-default px-3.5 pb-3 pt-3">
        <div className="panel-muted rounded-[18px] px-3 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
                Next Step
              </p>
              <h2 className="mt-1 text-[17px] font-semibold leading-6 text-text-primary">
                继续改到更像成品
              </h2>
              <p className="mt-1 text-[11px] leading-4 text-text-secondary">
                这里不是必填项，是你拿到第一版之后的加分区。
              </p>
            </div>
            <span className="rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-semibold text-white">
              New
            </span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
            <span className="text-[12px] text-text-secondary">先生成，再在这里补描述、换风格、加功能</span>
          </div>
        </div>
      </div>

      <div className="mx-3.5 mt-2.5 flex rounded-xl bg-slate-950 p-1 text-white">
        <button
          onClick={() => setActiveView('chat')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
            activeView === 'chat'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          继续生成
        </button>
        <button
          onClick={() => setActiveView('config')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
            activeView === 'config'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          高级调整
        </button>
      </div>
      
      {/* AI 对话视图 */}
      {activeView === 'chat' && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-[20px]">
          <div className="flex-1 overflow-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.14),rgba(248,250,252,0.48))] px-3.5 py-3">
            <div className="space-y-3">
            {messages.length === 0 && !isStreaming && (
              <div className="panel-muted rounded-[18px] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_72%,#14b8a6_100%)] text-white shadow-md">
                    <Wand2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">如果第一版还不够像成品</p>
                    <p className="mt-1 text-[11px] leading-4 text-text-secondary">
                      继续告诉我你想加什么，我会帮你往更完整的方向补。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[94%] rounded-[18px] px-3.5 py-3 shadow-sm ${
                    message.role === 'user'
                    ? 'bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_70%,#14b8a6_100%)] text-white'
                      : message.role === 'system'
                      ? 'border border-error/20 bg-error/10 text-error'
                      : 'panel-muted text-text-primary'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-xs leading-5">{message.content}</p>
                  <p suppressHydrationWarning className={`mt-1 text-[11px] ${
                    message.role === 'user' ? 'text-white/70' : 'text-text-muted'
                  }`}>
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* 流式响应 */}
            {isStreaming && streamingContent && (
              <div className="flex justify-start">
                <div className="panel-muted max-w-[92%] rounded-[18px] px-3 py-2.5 text-text-primary">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{streamingContent}</p>
                  <span className="inline-block w-2 h-4 ml-1 bg-primary rounded animate-pulse" />
                </div>
              </div>
            )}
            </div>

            <div ref={messagesEndRef} className="h-1" />
          </div>
          
          {/* 建议快捷指令 */}
          <div className="border-t border-border-light bg-[linear-gradient(180deg,rgba(248,250,252,0.16),rgba(248,250,252,0.74))] px-3.5 py-3">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-[10px] font-medium leading-3 text-text-secondary">继续优化</span>
              </div>
              <span className="text-[10px] text-text-muted">点一下即可填入</span>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              {promptSets.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(prompt)}
                  className="panel-muted min-h-[46px] rounded-[16px] px-3 py-2.5 text-left text-[11px] leading-4 text-text-secondary transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:bg-white hover:text-primary"
                >
                  <span className="line-clamp-1 block">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="border-t border-border-default p-3">
            <div className="panel-muted flex items-center gap-2 rounded-[18px] p-1.5">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="继续补一句，比如：更高级一点 / 更适合转化 / 加一个定价区..."
                disabled={isStreaming}
                className="flex-1 bg-transparent px-3 py-2.5 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isStreaming}
                className="rounded-[14px] bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_70%,#14b8a6_100%)] p-2.5 text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* 配置视图 */}
      {activeView === 'config' && (
        <div className="flex flex-1 flex-col p-3.5">
          {selectedNodeId ? (
            <div className="panel-muted rounded-[24px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-text-primary">节点配置</h3>
                <button
                  onClick={() => onNodeConfig?.(selectedNodeId)}
                  className="rounded-xl p-1.5 transition-colors hover:bg-white/60"
                >
                  <X className="w-4 h-4 text-text-secondary" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm text-text-secondary">
                <p>选中的节点 ID: <span className="font-mono text-text-primary">{selectedNodeId}</span></p>
                <p className="mt-3 text-text-muted">先把结果体验做顺，再回来细调这块。</p>
              </div>
            </div>
          ) : (
            <div className="panel-muted flex flex-1 items-center justify-center rounded-[24px] text-text-secondary">
              <div className="text-center">
                <Settings className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">先选中一个节点</p>
                <p className="text-sm mt-1 text-text-muted">这里用来做最后一公里微调</p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function formatMessageTime(timestamp: Date): string {
  return timestamp.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
