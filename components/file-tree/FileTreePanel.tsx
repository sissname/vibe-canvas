'use client';

import React, { useState } from 'react';
import { useFileStore } from '@/stores/file-store';
import { 
  Folder, 
  FolderOpen, 
  FileCode2, 
  FileJson, 
  FileType, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Trash2,
  File
} from 'lucide-react';

interface FileTreeItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileTreeItem[];
  fileId?: string;
}

function FileIcon({
  isFolder,
  isExpanded,
  name,
  isSelected,
}: {
  isFolder: boolean;
  isExpanded: boolean;
  name: string;
  isSelected: boolean;
}) {
  if (isFolder) {
    if (isExpanded) {
      return <FolderOpen className="w-4 h-4 text-blue-500" />;
    }

    return <Folder className="w-4 h-4 text-blue-500" />;
  }

  const iconClassName = `w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`;

  if (name.endsWith('.tsx') || name.endsWith('.ts')) {
    return <FileCode2 className={iconClassName} />;
  }

  if (name.endsWith('.json')) {
    return <FileJson className={iconClassName} />;
  }

  if (name.endsWith('.md')) {
    return <FileType className={iconClassName} />;
  }

  return <File className={iconClassName} />;
}

function buildFileTree(files: Array<{ name: string; path: string; id?: string }>): FileTreeItem[] {
  const root: FileTreeItem[] = [];
  const map = new Map<string, FileTreeItem>();

  // 排序：文件夹在前，文件在后
  const sortedFiles = [...files].sort((a, b) => {
    const aIsFolder = a.path.includes('/');
    const bIsFolder = b.path.includes('/');
    if (aIsFolder && !bIsFolder) return -1;
    if (!aIsFolder && bIsFolder) return 1;
    return a.name.localeCompare(b.name);
  });

  for (const file of sortedFiles) {
    const parts = file.path.split('/');
    let currentPath = '';
    let parent: FileTreeItem[] = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      const existing = map.get(currentPath);
      if (existing) {
        parent = existing.children || [];
      } else {
        const newItem: FileTreeItem = {
          name: part,
          path: currentPath,
          type: isLast ? 'file' : 'folder',
          children: isLast ? undefined : [],
          fileId: isLast ? file.id : undefined,
        };
        map.set(currentPath, newItem);
        parent.push(newItem);
        parent = newItem.children || [];
      }
    }
  }

  return root;
}

function FileTreeNode({ 
  item, 
  depth = 0,
  onSelect,
  onDelete,
  selectedId 
}: { 
  item: FileTreeItem; 
  depth?: number;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  selectedId?: string | null;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isFolder = item.type === 'folder';
  const isSelected = selectedId === item.fileId;

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else if (onSelect && item.fileId) {
      onSelect(item.fileId);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 px-2 py-1.5 cursor-pointer rounded text-sm group ${
          isSelected 
            ? 'bg-blue-100 text-blue-700' 
            : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        {isFolder ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )
        ) : (
          <span className="w-4" />
        )}
        
        <FileIcon
          isFolder={isFolder}
          isExpanded={isExpanded}
          name={item.name}
          isSelected={isSelected}
        />
        
        <span className={`flex-1 truncate ${
          isSelected ? 'font-medium' : 'text-gray-700'
        }`}>
          {item.name}
        </span>
        
        {!isFolder && onDelete && item.fileId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.fileId!);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-opacity"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
          </button>
        )}
      </div>
      
      {isFolder && isExpanded && item.children && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeNode
              key={index}
              item={child}
              depth={depth + 1}
              onSelect={onSelect}
              onDelete={onDelete}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileTreePanelProps {
  onFileSelect?: (fileId: string) => void;
  onFileDelete?: (fileId: string) => void;
}

export function FileTreePanel({ onFileSelect, onFileDelete }: FileTreePanelProps) {
  const { files, selectedFileId, selectFile, deleteFile, addFile, isExpanded, toggleExpanded } = useFileStore();
  
  const fileTree = buildFileTree(
    files.map(f => ({ name: f.name, path: f.path, id: f.id }))
  );

  const handleSelect = (fileId: string) => {
    selectFile(fileId);
    onFileSelect?.(fileId);
  };

  const handleDelete = (fileId: string) => {
    deleteFile(fileId);
    onFileDelete?.(fileId);
  };

  const handleCreateFile = () => {
    const existingNames = new Set(files.map((file) => file.path));
    let index = 1;
    let path = 'src/new-file.ts';

    while (existingNames.has(path)) {
      index += 1;
      path = `src/new-file-${index}.ts`;
    }

    const name = path.split('/').pop() || `new-file-${index}.ts`;
    const newFile = addFile({
      name,
      path,
      content: '// Start building here\n',
      language: 'typescript',
    });

    selectFile(newFile.id);
    onFileSelect?.(newFile.id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700">文件列表</span>
        </div>
        <button
          onClick={toggleExpanded}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title={isExpanded ? '折叠' : '展开'}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>
      </div>
      
      {/* 文件树 */}
      {isExpanded && (
        <div className="flex-1 overflow-auto py-2">
          {files.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              <FileCode2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>暂无文件</p>
              <p className="text-xs mt-1">运行工作流后生成文件</p>
            </div>
          ) : (
            fileTree.map((item, index) => (
              <FileTreeNode
                key={index}
                item={item}
                onSelect={handleSelect}
                onDelete={handleDelete}
                selectedId={selectedFileId}
              />
            ))
          )}
        </div>
      )}
      
      {/* 底部操作 */}
      {isExpanded && (
        <div className="p-3 border-t bg-gray-50">
          <button
            onClick={handleCreateFile}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建文件
          </button>
        </div>
      )}
    </div>
  );
}
