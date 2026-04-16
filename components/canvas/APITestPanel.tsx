'use client';

import React, { useState } from 'react';
import { workflowSerializer } from '@/lib/workflow-serializer';
import { CanvasNode, CanvasEdge } from '@/types/canvas';

interface APITestPanelProps {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export function APITestPanel({ nodes, edges }: APITestPanelProps) {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);
  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : '未知错误';

  // 测试工作流序列化
  const testSerialization = () => {
    try {
      const json = workflowSerializer.toJSON(nodes, edges, '测试工作流');
      setTestResult(`✅ 序列化成功\n\n${json}`);
    } catch (error) {
      setTestResult(`❌ 序列化失败\n${getErrorMessage(error)}`);
    }
  };

  // 测试导入
  const testImport = async () => {
    try {
      const json = workflowSerializer.toJSON(nodes, edges, '测试工作流');
      const result = workflowSerializer.fromJSON(json);
      setTestResult(`✅ 反序列化成功\n\n导入节点数：${result.nodes.length}\n导入边数：${result.edges.length}`);
    } catch (error) {
      setTestResult(`❌ 反序列化失败\n${getErrorMessage(error)}`);
    }
  };

  // 测试执行（模拟）
  const testExecution = async () => {
    setIsTesting(true);
    try {
      const results = [];
      for (const node of nodes) {
        results.push({
          nodeId: node.id,
          label: node.data.label,
          type: node.data.type,
          status: 'success',
          duration: Math.floor(Math.random() * 500) + 100,
          output: `模拟执行结果：${node.data.label}`,
        });
      }

      setTestResult(`✅ 执行完成\n\n执行节点数：${results.length}\n\n详细结果:\n${JSON.stringify(results, null, 2)}`);
    } catch (error) {
      setTestResult(`❌ 执行失败\n${getErrorMessage(error)}`);
    } finally {
      setIsTesting(false);
    }
  };

  // 测试 OpenClaw 连接
  const testOpenClawConnection = async () => {
    setIsTesting(true);
    try {
      const response = await fetch('http://localhost:18789/', {
        method: 'GET',
        mode: 'cors',
      });

      if (response.ok) {
        setTestResult(`✅ OpenClaw 网关已连接\n\n状态：${response.status}\nURL: http://localhost:18789/`);
      } else {
        setTestResult(`⚠️ OpenClaw 网关响应异常\n\n状态：${response.status}`);
      }
    } catch (error) {
      setTestResult(`❌ 无法连接 OpenClaw 网关\n\n错误：${getErrorMessage(error)}\n\n请确认:\n1. OpenClaw 网关已启动\n2. 端口 18789 未被占用\n3. CORS 配置正确`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-2xl border z-50">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <h3 className="font-semibold text-gray-800">API 测试面板</h3>
      </div>

      {/* 测试按钮 */}
      <div className="p-4 grid grid-cols-2 gap-2">
        <button
          onClick={testSerialization}
          disabled={isTesting}
          className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          📦 测试序列化
        </button>
        <button
          onClick={testImport}
          disabled={isTesting}
          className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          📥 测试导入
        </button>
        <button
          onClick={testExecution}
          disabled={isTesting}
          className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          ▶️ 测试执行
        </button>
        <button
          onClick={testOpenClawConnection}
          disabled={isTesting}
          className="px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          🔌 测试网关连接
        </button>
      </div>

      {/* 结果显示 */}
      <div className="p-4 border-t">
        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs max-h-64 overflow-auto whitespace-pre-wrap">
          {testResult || '点击按钮开始测试...'}
        </pre>
      </div>
    </div>
  );
}
