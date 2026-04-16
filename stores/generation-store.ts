import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  GeneratedProject,
  GenerateProjectResponse,
  GenerationStatus,
} from '@/types/generation';

interface GenerationState {
  prompt: string;
  status: GenerationStatus;
  project: GeneratedProject | null;
  error: string | null;
  setPrompt: (prompt: string) => void;
  generate: (prompt: string) => Promise<GeneratedProject | null>;
  clear: () => void;
}

export const useGenerationStore = create<GenerationState>()(
  persist(
    (set) => ({
      prompt: '做一个让人想马上注册的 AI 简历工具首页',
      status: 'idle',
      project: null,
      error: null,

      setPrompt: (prompt) => set({ prompt }),

      generate: async (prompt) => {
        const nextPrompt = prompt.trim();
        if (!nextPrompt) {
          set({ status: 'failed', error: '请输入你想生成的产品或页面' });
          return null;
        }

        set({ prompt: nextPrompt, status: 'generating', error: null });

        try {
          const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: nextPrompt }),
          });

          if (!response.ok) {
            const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
            throw new Error(errorBody?.error ?? `生成失败：${response.status}`);
          }

          const data = (await response.json()) as GenerateProjectResponse;
          set({ status: 'generated', project: data.project, error: null });
          return data.project;
        } catch (error) {
          const message = error instanceof Error ? error.message : '生成失败，请重试';
          set({ status: 'failed', error: message });
          return null;
        }
      },

      clear: () =>
        set({
          status: 'idle',
          project: null,
          error: null,
        }),
    }),
    {
      name: 'vibecanvas-generation',
      partialize: (state) => ({
        prompt: state.prompt,
        status: state.status === 'generated' ? state.status : 'idle',
        project: state.project,
        error: null,
      }),
    }
  )
);
