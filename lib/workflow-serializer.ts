import { CanvasNode, CanvasEdge, Workflow } from '@/types/canvas';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return '未知错误';
}

/**
 * 工作流序列化/反序列化工具
 */
export const workflowSerializer = {
  /**
   * 导出工作流为 JSON 对象
   */
  export(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    name: string = '未命名工作流'
  ): Workflow {
    return {
      id: `workflow-${Date.now()}`,
      name,
      description: '',
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
    };
  },

  /**
   * 导入工作流 JSON 对象
   */
  import(workflowData: Workflow): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
    // 验证 JSON 结构
    if (!workflowData.nodes || !workflowData.edges) {
      throw new Error('无效的工作流格式：缺少 nodes 或 edges');
    }

    // 验证节点数组
    if (!Array.isArray(workflowData.nodes)) {
      throw new Error('无效的工作流格式：nodes 必须是数组');
    }

    // 验证边数组
    if (!Array.isArray(workflowData.edges)) {
      throw new Error('无效的工作流格式：edges 必须是数组');
    }

    return {
      nodes: workflowData.nodes,
      edges: workflowData.edges,
    };
  },

  /**
   * 导出为 JSON 字符串（用于下载）
   */
  toJSON(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    name: string = '未命名工作流'
  ): string {
    const workflow = this.export(nodes, edges, name);
    return JSON.stringify(workflow, null, 2);
  },

  /**
   * 从 JSON 字符串导入
   */
  fromJSON(jsonString: string): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
    try {
      const workflow = JSON.parse(jsonString);
      return this.import(workflow);
    } catch (error) {
      throw new Error(`JSON 解析失败：${getErrorMessage(error)}`);
    }
  },

  /**
   * 下载工作流文件
   */
  download(
    nodes: CanvasNode[],
    edges: CanvasEdge[],
    name: string = '未命名工作流'
  ): void {
    const json = this.toJSON(nodes, edges, name);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.sanitizeFilename(name)}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 从文件上传导入
   */
  async upload(file: File): Promise<{ nodes: CanvasNode[]; edges: CanvasEdge[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const result = this.fromJSON(content);
          resolve(result);
        } catch (error) {
          reject(new Error(`文件解析失败：${getErrorMessage(error)}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsText(file);
    });
  },

  /**
   * 清理文件名（移除特殊字符）
   */
  sanitizeFilename(name: string): string {
    return name
      .replace(/[^\w\s\u4e00-\u9fa5-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
  },

  /**
   * 验证工作流
   */
  validate(workflow: Workflow): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 验证必填字段
    if (!workflow.id) errors.push('缺少工作流 ID');
    if (!workflow.name) errors.push('缺少工作流名称');
    if (!workflow.nodes) errors.push('缺少节点列表');
    if (!workflow.edges) errors.push('缺少边列表');

    // 验证节点
    if (workflow.nodes) {
      workflow.nodes.forEach((node, index) => {
        if (!node.id) errors.push(`节点 [${index}] 缺少 ID`);
        if (!node.position) errors.push(`节点 [${index}] 缺少位置`);
        if (!node.data) errors.push(`节点 [${index}] 缺少数据`);
      });
    }

    // 验证边
    if (workflow.edges) {
      workflow.edges.forEach((edge, index) => {
        if (!edge.source) errors.push(`边 [${index}] 缺少源节点`);
        if (!edge.target) errors.push(`边 [${index}] 缺少目标节点`);
      });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
