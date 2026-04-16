'use client';

import React from 'react';

interface ErrorBoundaryState {
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, errorInfo);
    }
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#eef3f9] p-6 text-slate-950">
        <section className="max-w-[520px] rounded-[28px] border border-white bg-white/90 p-6 text-center shadow-[0_30px_90px_rgba(15,23,42,0.14)]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-red-500">
            Something went wrong
          </p>
          <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.03em]">
            VibeCanvas 遇到了一个界面错误
          </h1>
          <p className="mt-3 text-[14px] leading-7 text-slate-600">
            你的浏览器没有崩溃，可以刷新页面恢复。如果这个问题重复出现，请在 GitHub issue 里附上复现步骤。
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-[18px] bg-slate-950 px-5 py-3 text-[14px] font-semibold text-white"
          >
            刷新页面
          </button>
        </section>
      </main>
    );
  }
}
