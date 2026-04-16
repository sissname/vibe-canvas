import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProjectFile {
  id: string;
  name: string;
  path: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FileState {
  // 状态
  files: ProjectFile[];
  selectedFileId: string | null;
  isExpanded: boolean;
  
  // Actions
  setFiles: (files: ProjectFile[]) => void;
  addFile: (file: Omit<ProjectFile, 'id' | 'createdAt' | 'updatedAt'>) => ProjectFile;
  updateFile: (id: string, content: string) => void;
  deleteFile: (id: string) => void;
  selectFile: (id: string | null) => void;
  toggleExpanded: () => void;
  getFileByPath: (path: string) => ProjectFile | undefined;
}

export const useFileStore = create<FileState>()(
  persist(
    (set, get) => ({
      // 初始状态
      files: [],
      selectedFileId: null,
      isExpanded: true,
  
      // 设置文件列表
      setFiles: (files) => {
        set({ files, selectedFileId: files[0]?.id ?? null });
      },
  
      // 添加文件
      addFile: (fileData) => {
        const newFile: ProjectFile = {
          ...fileData,
          id: `file-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
    
        set((state) => ({
          files: [...state.files, newFile],
        }));

        return newFile;
      },
  
      // 更新文件内容
      updateFile: (id, content) => {
        set((state) => ({
          files: state.files.map((file) =>
            file.id === id
              ? { ...file, content, updatedAt: new Date() }
              : file
          ),
        }));
      },
  
      // 删除文件
      deleteFile: (id) => {
        set((state) => ({
          files: state.files.filter((file) => file.id !== id),
          selectedFileId: state.selectedFileId === id ? null : state.selectedFileId,
        }));
      },
  
      // 选择文件
      selectFile: (id) => {
        set({ selectedFileId: id });
      },
  
      // 切换展开/折叠
      toggleExpanded: () => {
        set((state) => ({ isExpanded: !state.isExpanded }));
      },
  
      // 根据路径获取文件
      getFileByPath: (path) => {
        return get().files.find((file) => file.path === path);
      },
    }),
    {
      name: 'vibecanvas-files',
      merge: (persistedState, currentState) => {
        const parsed = persistedState as Partial<FileState>;

        return {
          ...currentState,
          ...parsed,
          files: (parsed.files ?? []).map((file) => ({
            ...file,
            createdAt: new Date(file.createdAt),
            updatedAt: new Date(file.updatedAt),
          })),
        };
      },
    }
  )
);
