import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatState {
  // 状态
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingContent: string;
  suggestions: string[];
  
  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  startStreaming: () => void;
  appendStreaming: (content: string) => void;
  endStreaming: () => void;
  setSuggestions: (suggestions: string[]) => void;
}

const defaultSuggestions = [
  "创建一个待办事项应用",
  "生成一个天气查询页面",
  "做个个人博客首页",
  "创建一个登录表单",
  "生成一个电商产品页面",
];

export const useChatStore = create<ChatState>((set) => ({
  // 初始状态
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: '你好！我是你的 AI 助手。告诉我你想要创建什么应用，我会帮你生成工作流。',
      timestamp: new Date(),
    },
  ],
  isStreaming: false,
  streamingContent: '',
  suggestions: defaultSuggestions,
  
  // 添加消息
  addMessage: (message) => {
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
      ],
    }));
  },
  
  // 清空消息
  clearMessages: () => {
    set({
      messages: [
        {
          id: 'welcome',
          role: 'assistant',
          content: '你好！我是你的 AI 助手。告诉我你想要创建什么应用，我会帮你生成工作流。',
          timestamp: new Date(),
        },
      ],
    });
  },
  
  // 开始流式响应
  startStreaming: () => {
    set({ isStreaming: true, streamingContent: '' });
  },
  
  // 追加流式内容
  appendStreaming: (content) => {
    set((state) => ({
      streamingContent: state.streamingContent + content,
    }));
  },
  
  // 结束流式响应
  endStreaming: () => {
    set((state) => {
      if (!state.streamingContent.trim()) {
        return { isStreaming: false, streamingContent: '' };
      }
      
      return {
        messages: [
          ...state.messages,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: state.streamingContent,
            timestamp: new Date(),
          },
        ],
        isStreaming: false,
        streamingContent: '',
      };
    });
  },
  
  // 设置建议
  setSuggestions: (suggestions) => {
    set({ suggestions });
  },
}));
