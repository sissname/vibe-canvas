'use client';

import React, { useState } from 'react';
import { X, Play, Copy, Check } from 'lucide-react';
import { CanvasNode, CanvasEdge, ExecutionResult } from '@/types/canvas';
import { workflowEngine } from '@/lib/workflow-engine';

interface CodePanelProps {
  workflow: {
    nodes: CanvasNode[];
    edges: CanvasEdge[];
  };
  onClose: () => void;
}

export function CodePanel({ workflow, onClose }: CodePanelProps) {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState<string>('');

  // 生成工作流代码
  const generateCode = () => {
    const code = `// VibeCanvas 工作流代码
// 自动生成于 ${new Date().toISOString()}

import { WorkflowEngine } from '@vibecanvas/engine';

const workflow = ${JSON.stringify(workflow, null, 2)};

async function main() {
  const engine = new WorkflowEngine({
    openclawGateway: 'http://localhost:18789',
  });
  
  const result = await engine.execute(workflow);
  console.log('执行结果:', result);
}

main().catch(console.error);
`;
    return code;
  };

  const code = generateCode();

  // 复制代码
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 运行工作流
  const handleRun = async () => {
    setIsRunning(true);
    setOutput('🚀 开始执行工作流...\n\n');
    
    try {
      const results = await workflowEngine.execute(
        workflow.nodes,
        workflow.edges,
        {},
        (result: ExecutionResult) => {
          // 进度回调
          const emoji = result.status === 'success' ? '✅' : '❌';
          setOutput(prev => prev + `${emoji} 节点 "${result.nodeId}" 完成\n`);
          setOutput(prev => prev + `   耗时：${result.duration}ms\n`);
          if (result.error) {
            setOutput(prev => prev + `   错误：${result.error}\n`);
          }
          setOutput(prev => prev + '\n');
        }
      );

      // 执行完成
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

      setOutput(prev => prev + '━━━━━━━━━━━━━━━━━━━━━━\n');
      setOutput(prev => prev + `✅ 工作流执行完成\n`);
      setOutput(prev => prev + `━━━━━━━━━━━━━━━━━━━━━━\n`);
      setOutput(prev => prev + `📊 执行统计:\n`);
      setOutput(prev => prev + `   总节点数：${results.length}\n`);
      setOutput(prev => prev + `   成功：${successCount}\n`);
      setOutput(prev => prev + `   失败：${errorCount}\n`);
      setOutput(prev => prev + `   总耗时：${totalDuration}ms\n\n`);
      
      // 显示详细结果
      setOutput(prev => prev + `📝 详细结果:\n`);
      results.forEach((result, index) => {
        setOutput(prev => prev + `\n--- 节点 ${index + 1}: ${result.nodeId} ---\n`);
        setOutput(prev => prev + `状态：${result.status}\n`);
        setOutput(prev => prev + `耗时：${result.duration}ms\n`);
        if (result.output) {
          setOutput(prev => prev + `输出：${JSON.stringify(result.output, null, 2).substring(0, 500)}\n`);
        }
        if (result.error) {
          setOutput(prev => prev + `错误：${result.error}\n`);
        }
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      setOutput(prev => prev + `\n❌ 执行失败：${message}\n`);
      console.error('Workflow execution error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 h-full w-[600px] bg-white shadow-2xl z-20 flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div>
          <h2 className="font-semibold text-gray-800">工作流代码</h2>
          <p className="text-sm text-gray-500">
            {workflow.nodes.length} 个节点 · {workflow.edges.length} 个连接
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* 代码区域 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-2 border-b bg-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              {isRunning ? '运行中...' : '运行'}
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-gray-300 hover:bg-gray-700 rounded"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>

        <pre className="flex-1 overflow-auto p-4 bg-gray-900 text-gray-100 text-sm font-mono">
          <code>{code}</code>
        </pre>

        {/* 输出区域 */}
        {output && (
          <div className="border-t bg-gray-50 p-4">
            <h3 className="font-medium text-gray-700 mb-2">执行输出</h3>
            <pre className="bg-white border rounded p-3 text-sm text-gray-800 font-mono whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
