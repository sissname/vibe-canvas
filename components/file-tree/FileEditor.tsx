'use client';

import React, { useState } from 'react';
import { useFileStore } from '@/stores/file-store';
import { X, Save, Download } from 'lucide-react';

interface FileEditorProps {
  fileId: string;
  onClose: () => void;
}

export function FileEditor({ fileId, onClose }: FileEditorProps) {
  const { files, updateFile } = useFileStore();
  const file = files.find(f => f.id === fileId);
  const [content, setContent] = useState(file?.content || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>文件不存在</p>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    updateFile(fileId, content);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLanguageLabel = (lang: string) => {
    const map: Record<string, string> = {
      typescript: 'TypeScript',
      javascript: 'JavaScript',
      typescriptreact: 'TSX',
      javascriptreact: 'JSX',
      json: 'JSON',
      markdown: 'Markdown',
      css: 'CSS',
      html: 'HTML',
    };
    return map[lang] || lang.toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">{file.name}</span>
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
              {getLanguageLabel(file.language)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
            title="下载文件"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '保存中...' : '保存'}
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 编辑器 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 p-4 font-mono text-sm bg-white resize-none focus:outline-none"
        spellCheck={false}
        placeholder="文件内容..."
      />

      {/* 底部状态栏 */}
      <div className="px-4 py-2 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-500">
        <span>
          {content.split('\n').length} 行 · {content.length} 字符
        </span>
        <span>
          最后修改：{new Date(file.updatedAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
