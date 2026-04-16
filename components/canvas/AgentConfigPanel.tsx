'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Play } from 'lucide-react';
import { CanvasNode, OpenClawAgent } from '@/types/canvas';
import { openclawAPI } from '@/lib/openclaw-api';

interface AgentConfigPanelProps {
  node: CanvasNode;
  onUpdate: (
    nodeId: string,
    data: { config: Record<string, unknown> }
  ) => void;
  onClose: () => void;
}

const fallbackAgents: OpenClawAgent[] = [
  { id: 'main', name: '主理人', description: '主要协调 Agent', status: 'online', capabilities: [] },
  { id: 'product-dev', name: '产品开发', description: '产品开发专家', status: 'online', capabilities: [] },
  { id: 'inspire', name: '灵感', description: '创意灵感助手', status: 'online', capabilities: [] },
  { id: 'marketing', name: '营销', description: '营销文案专家', status: 'online', capabilities: [] },
  { id: 'literary', name: '文学', description: '文学创作助手', status: 'online', capabilities: [] },
  { id: 'quality', name: '质量', description: '质量控制专家', status: 'online', capabilities: [] },
  { id: 'operations', name: '运营', description: '运营助手', status: 'online', capabilities: [] },
  { id: 'knowledge', name: '知识', description: '知识库管理', status: 'online', capabilities: [] },
];

export function AgentConfigPanel({ node, onUpdate, onClose }: AgentConfigPanelProps) {
  const [agentId, setAgentId] = useState(
    typeof node.data.config?.agentId === 'string' ? node.data.config.agentId : 'main'
  );
  const [prompt, setPrompt] = useState(
    typeof node.data.config?.prompt === 'string' ? node.data.config.prompt : ''
  );
  const [timeout, setTimeout] = useState(
    typeof node.data.config?.timeout === 'number' ? node.data.config.timeout : 30000
  );
  const [agents, setAgents] = useState<OpenClawAgent[]>([]);
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  // 加载 Agent 列表
  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const result = await openclawAPI.getAgents();
      if (result.success && result.data) {
        setAgents(result.data);
      } else {
        setAgents(fallbackAgents);
      }
    } catch (error) {
      console.error('加载 Agent 列表失败:', error);
      setAgents(fallbackAgents);
    }
  };

  // 保存配置
  const handleSave = () => {
    onUpdate(node.id, {
      config: {
        ...node.data.config,
        agentId,
        prompt,
        timeout,
      },
    });
    onClose();
  };

  // 测试执行
  const handleTest = async () => {
    if (!prompt.trim()) {
      setTestResult('⚠️ 请输入提示词');
      return;
    }

    setIsTesting(true);
    setTestResult('🚀 开始测试...\n');

    try {
      const result = await openclawAPI.executeAgent(agentId, prompt, { timeout });

      if (result.success) {
        setTestResult(`✅ 执行成功\n\nAgent: ${agentId}\n耗时：${result.data?.duration || 0}ms\n\n结果:\n${JSON.stringify(result.data, null, 2)}`);
      } else {
        setTestResult(`⚠️ API 返回失败\n\n错误：${result.error || '未知错误'}\n\n这是模拟执行结果...`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      setTestResult(`❌ 执行失败\n\n错误信息：${message}\n\n可能原因:\n1. OpenClaw 网关未启动\n2. 网络连接问题\n3. Agent 不可用`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Agent 节点配置</h2>
            <p className="text-sm text-gray-500">配置要调用的 Agent 和提示词</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Agent 选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择 Agent
            </label>
            <select
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.id}) - {agent.description}
                </option>
              ))}
            </select>

            {/* Agent 状态 */}
            <div className="mt-2 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                agents.find(a => a.id === agentId)?.status === 'online' 
                  ? 'bg-green-500' 
                  : 'bg-gray-400'
              }`} />
              <span className="text-xs text-gray-500">
                状态：{agents.find(a => a.id === agentId)?.status || 'unknown'}
              </span>
            </div>
          </div>

          {/* 提示词输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提示词 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入要执行的任务，例如：创建一个待办事项应用"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              支持使用 {'{{variable}}'} 引用上游节点的输出
            </p>
          </div>

          {/* 超时设置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              超时时间（毫秒）
            </label>
            <input
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1000"
              max="300000"
              step="1000"
            />
            <p className="mt-1 text-xs text-gray-500">
              建议设置：30000ms (30 秒)，最大 300000ms (5 分钟)
            </p>
          </div>

          {/* 测试结果 */}
          {(testResult || isTesting) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                测试结果
              </label>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-md text-xs max-h-48 overflow-auto whitespace-pre-wrap">
                {isTesting ? '执行中...' : testResult}
              </pre>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
          <button
            onClick={handleTest}
            disabled={isTesting || !prompt.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            测试执行
          </button>
          <button
            onClick={loadAgents}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <RefreshCw className="w-4 h-4" />
            刷新列表
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            <Save className="w-4 h-4" />
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}
