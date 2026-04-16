import { create } from 'zustand';

interface PreviewState {
  // 状态
  isVisible: boolean;
  url: string | null;
  isLoading: boolean;
  error: string | null;
  consoleLogs: Array<{
    type: 'log' | 'warn' | 'error' | 'info';
    message: string;
    timestamp: Date;
  }>;
  height: number; // 预览面板高度（百分比）
  
  // Actions
  show: () => void;
  hide: () => void;
  setUrl: (url: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addConsoleLog: (type: 'log' | 'warn' | 'error' | 'info', message: string) => void;
  clearConsole: () => void;
  setHeight: (height: number) => void;
  toggle: () => void;
}

export const usePreviewStore = create<PreviewState>((set, get) => ({
  // 初始状态
  isVisible: false,
  url: null,
  isLoading: false,
  error: null,
  consoleLogs: [],
  height: 40, // 默认 40% 高度
  
  // 显示预览
  show: () => {
    set({ isVisible: true });
  },
  
  // 隐藏预览
  hide: () => {
    const currentUrl = get().url;
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    set({ isVisible: false, url: null, isLoading: false, error: null });
  },
  
  // 设置预览 URL
  setUrl: (url) => {
    const previousUrl = get().url;
    if (previousUrl && previousUrl !== url) {
      URL.revokeObjectURL(previousUrl);
    }

    set({ url, isLoading: false, error: null });
  },
  
  // 设置加载状态
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  // 设置错误
  setError: (error) => {
    set({ error, isLoading: false });
  },
  
  // 添加控制台日志
  addConsoleLog: (type, message) => {
    set((state) => ({
      consoleLogs: [
        ...state.consoleLogs,
        {
          type,
          message,
          timestamp: new Date(),
        },
      ],
    }));
  },
  
  // 清空控制台
  clearConsole: () => {
    set({ consoleLogs: [] });
  },
  
  // 设置高度
  setHeight: (height) => {
    set({ height: Math.max(20, Math.min(80, height)) }); // 限制在 20-80%
  },
  
  // 切换显示/隐藏
  toggle: () => {
    const { isVisible, url } = get();

    if (isVisible && url) {
      URL.revokeObjectURL(url);
    }

    set((state) => ({
      isVisible: !state.isVisible,
      url: state.isVisible ? null : state.url,
      isLoading: state.isVisible ? false : state.isLoading,
      error: state.isVisible ? null : state.error,
    }));
  },
}));
