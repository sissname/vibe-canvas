import { CanvasNode, CanvasEdge, ExecutionResult } from '@/types/canvas';
import { openclawAPI } from './openclaw-api';

type WorkflowVariables = Record<string, unknown>;
type TemplateVariables = Record<string, unknown>;

/**
 * 工作流执行引擎
 * 负责解析工作流、拓扑排序、执行节点
 */
export class WorkflowEngine {
  /**
   * 拓扑排序 - 确定节点执行顺序
   * 使用 Kahn 算法，只执行有连接的节点或 Input 类型节点
   */
  topologicalSort(nodes: CanvasNode[], edges: CanvasEdge[]): CanvasNode[] {
    // 找到所有有连接的节点（有边相连的）
    const connectedNodeIds = new Set<string>();
    for (const edge of edges) {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    }

    // 只处理有连接的节点，或者 Input 类型的起始节点
    const executableNodes = nodes.filter(node => 
      connectedNodeIds.has(node.id) || node.data.type === 'input'
    );

    // 构建邻接表和入度表
    const adjacency: Map<string, string[]> = new Map();
    const inDegree: Map<string, number> = new Map();

    // 初始化
    for (const node of executableNodes) {
      adjacency.set(node.id, []);
      inDegree.set(node.id, 0);
    }

    // 构建图
    for (const edge of edges) {
      if (!adjacency.has(edge.source) || !adjacency.has(edge.target)) {
        continue; // 跳过孤立节点的边
      }
      const sources = adjacency.get(edge.source)!;
      sources.push(edge.target);
      inDegree.set(edge.target, inDegree.get(edge.target)! + 1);
    }

    // Kahn 算法
    const queue: string[] = [];
    const result: CanvasNode[] = [];

    // 添加入度为 0 的节点（起始节点）
    for (const [nodeId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const currentNode = nodes.find((n) => n.id === currentId)!;
      result.push(currentNode);

      const neighbors = adjacency.get(currentId)!;
      for (const neighborId of neighbors) {
        inDegree.set(neighborId, inDegree.get(neighborId)! - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      }
    }

    // 检测循环依赖
    if (result.length !== executableNodes.length) {
      throw new Error('检测到循环依赖，请检查节点连接');
    }

    return result;
  }

  /**
   * 执行工作流
   */
  async execute(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    variables: WorkflowVariables = {},
    onProgress?: (result: ExecutionResult) => void
  ): Promise<ExecutionResult[]> {
    const sortedNodes = this.topologicalSort(nodes, edges);
    const results: ExecutionResult[] = [];
    const context: WorkflowVariables = { ...variables };

    console.log('[WorkflowEngine] 开始执行工作流');
    console.log('[WorkflowEngine] 节点顺序:', sortedNodes.map((n) => n.data.label));

    for (const node of sortedNodes) {
      const startTime = Date.now();

      try {
        // 获取上游节点的输出
        const inputs = this.getNodeInputs(node.id, edges, results);

        console.log(
          `[WorkflowEngine] 执行节点：${node.data.label} (${node.data.type})`
        );

        // 执行节点
        const output = await this.executeNode(node, inputs, context);

        const result: ExecutionResult = {
          nodeId: node.id,
          output,
          duration: Date.now() - startTime,
          status: 'success',
          timestamp: new Date().toISOString(),
        };

        results.push(result);
        this.assignNodeOutput(context, node, output);

        console.log(
          `[WorkflowEngine] 节点完成：${node.data.label}, 耗时：${result.duration}ms`
        );

        // 进度回调
        if (onProgress) {
          onProgress(result);
        }

        // 如果是条件节点，根据结果决定是否继续
        if (node.data.type === 'condition') {
          const conditionResult = output as { condition: boolean };
          if (!conditionResult.condition) {
            console.log('[WorkflowEngine] 条件不满足，停止执行');
            break;
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : '未知错误';
        const result: ExecutionResult = {
          nodeId: node.id,
          output: null,
          duration: Date.now() - startTime,
          status: 'error',
          error: message,
          timestamp: new Date().toISOString(),
        };

        results.push(result);

        console.error(
          `[WorkflowEngine] 节点失败：${node.data.label}, 错误：${message}`
        );

        if (onProgress) {
          onProgress(result);
        }

        // 非条件节点失败，停止执行
        if (node.data.type !== 'condition') {
          break;
        }
      }
    }

    console.log('[WorkflowEngine] 工作流执行完成');
    return results;
  }

  /**
   * 获取节点输入（来自上游节点的输出）
   */
  private getNodeInputs(
    nodeId: string,
    edges: CanvasEdge[],
    results: ExecutionResult[]
  ): WorkflowVariables {
    const inputs: WorkflowVariables = {};

    for (const edge of edges) {
      if (edge.target === nodeId) {
        const result = results.find((r) => r.nodeId === edge.source);
        if (result) {
          inputs[edge.source] = result.output;
        }
      }
    }

    return inputs;
  }

  /**
   * 执行单个节点
   */
  private async executeNode(
    node: CanvasNode,
    inputs: WorkflowVariables,
    context: WorkflowVariables
  ): Promise<unknown> {
    const { type, config } = node.data;

    switch (type) {
      case 'input':
        return this.executeInputNode(config);

      case 'agent':
        return this.executeAgentNode(node, config, inputs, context);

      case 'code':
        return this.executeCodeNode(node, config, inputs, context);

      case 'api':
        return this.executeApiNode(node, config, inputs, context);

      case 'condition':
        return this.executeConditionNode(node, config, inputs, context);

      case 'output':
        return this.executeOutputNode(node, config, inputs, context);

      default:
        return { type, status: 'skipped', message: '未实现的节点类型' };
    }
  }

  /**
   * 执行 Input 节点
   */
  private executeInputNode(config: CanvasNode['data']['config']): { value: unknown; type: 'input' } {
    return {
      value: config?.value || config?.prompt || '',
      type: 'input',
    };
  }

  /**
   * 执行 Agent 节点
   */
  private async executeAgentNode(
    node: CanvasNode,
    config: CanvasNode['data']['config'],
    inputs: WorkflowVariables,
    context: WorkflowVariables
  ): Promise<{ agentId: string; prompt: string; result: unknown; type: 'agent' }> {
    const agentId = config?.agentId || 'main';
    const prompt = this.interpolateTemplate(
      config?.prompt || '',
      this.createTemplateVariables(node, inputs, context)
    );

    console.log(`[AgentNode] 调用 Agent: ${agentId}, 提示词：${prompt}`);

    // 尝试调用 OpenClaw API
    try {
      const result = await openclawAPI.executeAgent(agentId, prompt, {
        timeout: config?.timeout || 30000,
      });

      if (result.success) {
        return {
          agentId,
          prompt,
          result: result.data,
          type: 'agent',
        };
      }

      throw new Error(result.error || `Agent ${agentId} 执行失败`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error(`Agent ${agentId} 执行失败：${message}`);
    }
  }

  /**
   * 执行 Code 节点
   */
  private async executeCodeNode(
    node: CanvasNode,
    config: CanvasNode['data']['config'],
    inputs: WorkflowVariables,
    context: WorkflowVariables
  ): Promise<{ code: string; output: unknown; logs: string[]; type: 'code' }> {
    const code = typeof config?.code === 'string' ? config.code : '// 没有代码';

    console.log('[CodeNode] 执行代码:', code.substring(0, 100));
    const logs: string[] = [];
    const runtimeConsole = {
      log: (...args: unknown[]) => {
        const line = args
          .map((arg) =>
            typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2)
          )
          .join(' ');
        logs.push(line);
        console.log('[CodeNode]', ...args);
      },
    };

    try {
      const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
        ...args: string[]
      ) => (
        runtimeConsole: { log: (...args: unknown[]) => void },
        inputs: WorkflowVariables,
        context: WorkflowVariables
      ) => Promise<unknown>;

      const executeCode = new AsyncFunction(
        'runtimeConsole',
        'inputs',
        'context',
        `
          const console = runtimeConsole;
          ${code}
          if (typeof main !== 'function') {
            throw new Error('必须定义 main(inputs, context) 函数');
          }
          return await main(inputs, context);
        `
      );

      const output = await executeCode(
        runtimeConsole,
        this.createTemplateVariables(node, inputs, context),
        context
      );

      return {
        code,
        output,
        logs,
        type: 'code',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error(`代码执行失败：${message}`);
    }
  }

  /**
   * 执行 API 节点
   */
  private async executeApiNode(
    node: CanvasNode,
    config: CanvasNode['data']['config'],
    inputs: WorkflowVariables,
    context: WorkflowVariables
  ): Promise<{ endpoint: string; method: string; data: unknown; status: number; type: 'api' }> {
    const axios = (await import('axios')).default;
    const templateVariables = this.createTemplateVariables(node, inputs, context);

    const endpoint = this.interpolateTemplate(
      typeof config?.endpoint === 'string' ? config.endpoint : '',
      templateVariables
    );
    const method = typeof config?.method === 'string' ? config.method : 'GET';
    const headers = (config?.headers as Record<string, string> | undefined) || {};
    const body = config?.body
      ? JSON.parse(
          this.interpolateTemplate(String(config.body), templateVariables)
        )
      : undefined;

    console.log(`[ApiNode] 调用 API: ${method} ${endpoint}`);

    try {
      const response = await axios({
        method,
        url: endpoint,
        headers,
        data: body,
        timeout: config?.timeout || 10000,
      });

      return {
        endpoint,
        method,
        data: response.data,
        status: response.status,
        type: 'api',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误';
      throw new Error(`API 调用失败：${message}`);
    }
  }

  /**
   * 执行 Condition 节点
   */
  private executeConditionNode(
    node: CanvasNode,
    config: CanvasNode['data']['config'],
    inputs: WorkflowVariables,
    context: WorkflowVariables
  ): { expression: string; condition: boolean; type: 'condition' } {
    const expression = typeof config?.expression === 'string' ? config.expression : 'true';

    console.log('[ConditionNode] 评估条件:', expression);
    const templateVariables = this.createTemplateVariables(node, inputs, context);

    // 安全评估表达式
    const safeEval = (expr: string, vars: WorkflowVariables): boolean => {
      try {
        const fn = new Function(...Object.keys(vars), `return ${expr}`);
        return !!fn(...Object.values(vars));
      } catch (error) {
        console.error('[ConditionNode] 表达式评估失败:', error);
        return false;
      }
    };

    const result = safeEval(expression, templateVariables);

    return {
      expression,
      condition: result,
      type: 'condition',
    };
  }

  /**
   * 执行 Output 节点
   */
  private executeOutputNode(
    node: CanvasNode,
    config: CanvasNode['data']['config'],
    inputs: WorkflowVariables,
    context: WorkflowVariables
  ): { output: string; format: string; type: 'output' } {
    const format = typeof config?.format === 'string' ? config.format : 'json';
    const template = typeof config?.template === 'string' ? config.template : '{{value}}';
    const templateVariables = this.createTemplateVariables(node, inputs, context);

    // 获取最后一个输入节点的输出
    const lastInput = Object.values(inputs).pop();
    
    // 如果有输入，使用输入数据；否则使用上下文
    const dataToUse = lastInput !== undefined ? lastInput : context;
    
    // 提取实际值（如果输入是对象，提取 value 或 result 字段）
    let valueToOutput = dataToUse;
    if (typeof dataToUse === 'object' && dataToUse !== null) {
      const structuredData = dataToUse as Record<string, unknown>;
      valueToOutput =
        structuredData.value ||
        structuredData.result ||
        structuredData.output ||
        dataToUse;
    }
    
    const dataRecord =
      typeof dataToUse === 'object' && dataToUse !== null
        ? (dataToUse as WorkflowVariables)
        : {};
    const output = this.interpolateTemplate(template, {
      ...templateVariables,
      ...dataRecord,
      value: valueToOutput,
    });

    return {
      output,
      format,
      type: 'output',
    };
  }

  /**
   * 模板插值（替换 {{variable}}）
   */
  private interpolateTemplate(
    template: string,
    variables: TemplateVariables
  ): string {
    return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, keyPath) => {
      const resolved = this.resolveTemplateValue(variables, keyPath.trim());

      if (resolved === undefined) {
        return `{{${keyPath}}}`;
      }

      if (typeof resolved === 'string') {
        return resolved;
      }

      return JSON.stringify(resolved);
    });
  }

  private assignNodeOutput(
    context: WorkflowVariables,
    node: CanvasNode,
    output: unknown
  ): void {
    context[node.id] = output;

    const aliases = this.getNodeAliases(node);
    for (const alias of aliases) {
      context[alias] = output;
    }
  }

  private createTemplateVariables(
    node: CanvasNode,
    inputs: WorkflowVariables,
    context: WorkflowVariables
  ): TemplateVariables {
    return {
      ...context,
      ...inputs,
      current: context[node.id],
      inputs,
      context,
    };
  }

  private getNodeAliases(node: CanvasNode): string[] {
    const aliases = new Set<string>();
    const normalizedLabel = this.toTemplateKey(node.data.label);
    const normalizedType = this.toTemplateKey(node.data.type);
    const normalizedId = this.toTemplateKey(node.id);

    if (normalizedLabel) aliases.add(normalizedLabel);
    if (normalizedType) aliases.add(normalizedType);
    if (normalizedId) aliases.add(normalizedId);

    return [...aliases];
  }

  private toTemplateKey(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '_')
      .replace(/^_+|_+$/g, '');
  }

  private resolveTemplateValue(
    variables: TemplateVariables,
    keyPath: string
  ): unknown {
    const segments = keyPath
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .filter(Boolean);

    let current: unknown = variables;

    for (const segment of segments) {
      if (typeof current !== 'object' || current === null || !(segment in current)) {
        return undefined;
      }

      current = (current as Record<string, unknown>)[segment];
    }

    return current;
  }
}

// 导出单例
export const workflowEngine = new WorkflowEngine();
