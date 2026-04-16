'use client';

import React, { useState } from 'react';
import { FileCode2, Folder, ChevronRight, ChevronDown, Download, Trash2 } from 'lucide-react';

interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  path: string;
}

interface FileTreeProps {
  files: FileNode[];
  onFileClick?: (file: FileNode) => void;
  onFileDownload?: (file: FileNode) => void;
  onFileDelete?: (file: FileNode) => void;
}

function FileTreeNode({ 
  node, 
  depth = 0, 
  onFileClick,
  onFileDownload,
  onFileDelete 
}: { 
  node: FileNode; 
  depth?: number;
  onFileClick?: (file: FileNode) => void;
  onFileDownload?: (file: FileNode) => void;
  onFileDelete?: (file: FileNode) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  
  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick?.(node);
    }
  };
  
  return (
    <div>
      <div
        className="group flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded text-sm transition-colors"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {/* 展开/折叠图标 */}
        <span className="w-4 flex justify-center">
          {node.children && (
            isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )
          )}
        </span>
        
        {/* 文件/文件夹图标 */}
        {node.type === 'folder' ? (
          <Folder className="w-4 h-4 text-blue-500" />
        ) : (
          <FileCode2 className="w-4 h-4 text-gray-400" />
        )}
        
        {/* 文件名 */}
        <span className="text-gray-700 flex-1 truncate">{node.name}</span>
        
        {/* 操作按钮（悬停显示） */}
        {node.type === 'file' && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileDownload?.(node);
              }}
              className="p-1 hover:bg-gray-200 rounded"
              title="下载文件"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFileDelete?.(node);
              }}
              className="p-1 hover:bg-red-100 rounded"
              title="删除文件"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </button>
          </div>
        )}
      </div>
      
      {/* 子文件夹/文件 */}
      {node.children && isExpanded && (
        <div>
          {node.children.map((child, index) => (
            <FileTreeNode
              key={index}
              node={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              onFileDownload={onFileDownload}
              onFileDelete={onFileDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({ files, onFileClick, onFileDownload, onFileDelete }: FileTreeProps) {
  return (
    <div className="p-2">
      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          <FileCode2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>暂无文件</p>
          <p className="text-xs mt-1">运行工作流后生成的文件将显示在这里</p>
        </div>
      ) : (
        files.map((file, index) => (
          <FileTreeNode
            key={index}
            node={file}
            onFileClick={onFileClick}
            onFileDownload={onFileDownload}
            onFileDelete={onFileDelete}
          />
        ))
      )}
    </div>
  );
}
