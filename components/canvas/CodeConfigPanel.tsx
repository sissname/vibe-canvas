'use client';

import React, { useState } from 'react';
import { X, Save, Play, Trash2 } from 'lucide-react';
import { CanvasNode } from '@/types/canvas';

interface CodeConfigPanelProps {
  node: CanvasNode;
  onUpdate: (
    nodeId: string,
    data: { config: Record<string, unknown> }
  ) => void;
  onClose: () => void;
}

export function CodeConfigPanel({ node, onUpdate, onClose }: CodeConfigPanelProps) {
  const initialCode =
    typeof node.data.config?.code === 'string' ? node.data.config.code : getDefaultCode();
  const [code, setCode] = useState<string>(initialCode);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // 获取默认代码模板
  function getDefaultCode() {
    return `// Code 节点 - JavaScript 执行环境
// 可用变量：inputs (上游节点输出), context (全局上下文)

async function main(inputs, context) {
  // 示例：处理上游数据
  console.log('输入数据:', inputs);
  
  // 示例：数据处理
  const result = {
    processed: true,
    timestamp: new Date().toISOString(),
    data: '处理后的数据'
  };
  
  return result;
}`;
  }

  // 保存配置
  const handleSave = () => {
    onUpdate(node.id, {
      config: {
        ...node.data.config,
        code,
      },
    });
    onClose();
  };

  // 执行代码
  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    setLogs([]);

    // 捕获 console.log
    const originalLog = console.log;
    const capturedLogs: string[] = [];
    const captureArgs = (args: unknown[]) =>
      args
        .map((arg) =>
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        )
        .join(' ');
    
    console.log = (...args: unknown[]) => {
      capturedLogs.push(captureArgs(args));
      originalLog('[CodeNode]', ...args);
    };

    try {
      // 创建沙箱环境
      const sandbox = {
        inputs: {} as Record<string, unknown>,
        context: {} as Record<string, unknown>,
        console: {
          log: (...args: unknown[]) => {
            capturedLogs.push(captureArgs(args));
          },
        },
      };

      // 包装并执行代码
      const wrappedCode = `
        ${code}
        return main(sandbox.inputs, sandbox.context);
      `;

      // 使用 Function 构造函数执行（注意：生产环境需要更安全的沙箱）
      const executeCode = new Function('sandbox', wrappedCode);
      const result = await executeCode(sandbox);

      setLogs(capturedLogs);
      setOutput(`✅ 执行成功\n\n返回值:\n${JSON.stringify(result, null, 2)}`);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      const stack = error instanceof Error ? error.stack : '';
      setLogs(capturedLogs);
      setOutput(`❌ 执行失败\n\n错误信息:\n${message}\n\n堆栈追踪:\n${stack || '无'}`);
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  // 清除代码
  const handleClear = () => {
    if (confirm('确定要清除代码吗？')) {
      setCode(getDefaultCode());
      setOutput('');
      setLogs([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Code 节点配置</h2>
            <p className="text-sm text-gray-500">编写和执行 JavaScript 代码</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 grid grid-cols-2 divide-x">
            {/* 左侧：代码编辑器 */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between p-2 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">代码编辑器</span>
                  <span className="text-xs text-gray-500">JavaScript (ES6+)</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClear}
                    className="p-1.5 text-gray-500 hover:bg-gray-200 rounded transition-colors"
                    title="清除代码"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none"
                spellCheck={false}
                placeholder="输入 JavaScript 代码..."
              />
              
              <div className="p-2 border-t bg-gray-50">
                <p className="text-xs text-gray-500">
                  💡 提示：实现 <code className="bg-gray-200 px-1 rounded">main(inputs, context)</code> 函数，返回值将传递给下游节点
                </p>
              </div>
            </div>

            {/* 右侧：输出和控制台 */}
            <div className="flex flex-col">
              {/* 工具栏 */}
              <div className="flex items-center justify-between p-2 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">执行结果</span>
                  {isRunning && (
                    <span className="text-xs text-blue-600 animate-pulse">执行中...</span>
                  )}
                </div>
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                >
                  <Play className="w-4 h-4" />
                  运行代码
                </button>
              </div>

              {/* 输出区域 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 控制台日志 */}
                {logs.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 mb-2">控制台日志</h3>
                    <div className="bg-gray-900 rounded p-3 space-y-1">
                      {logs.map((log, index) => (
                        <div key={index} className="text-xs text-gray-300 font-mono">
                          <span className="text-blue-400">→</span> {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 执行结果 */}
                {output && (
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 mb-2">执行结果</h3>
                    <pre className={`p-3 rounded text-xs font-mono whitespace-pre-wrap ${
                      output.startsWith('✅') 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {output}
                    </pre>
                  </div>
                )}

                {/* 空状态 */}
                {!output && logs.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">点击&quot;运行代码&quot;执行测试</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
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
