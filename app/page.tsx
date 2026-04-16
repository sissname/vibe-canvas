'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Archive,
  CheckCircle2,
  Code2,
  Download,
  Eye,
  ExternalLink,
  FileText,
  Layers3,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Wand2,
} from 'lucide-react';
import { SimplePreviewService } from '@/lib/preview-service';
import { createProjectZip } from '@/lib/project-zip';
import { ProjectFile, useFileStore } from '@/stores/file-store';
import { useGenerationStore } from '@/stores/generation-store';
import { usePreviewStore } from '@/stores/preview-store';
import { GeneratedProject } from '@/types/generation';

const starterPrompts = [
  '做一个让人想马上注册的 AI 简历工具首页',
  '帮我生成一个适合独立开发者的产品发布页',
  '我想快速做一个 SaaS Dashboard 原型',
  '做一个可以展示功能卖点的 AI 工具落地页',
];

const productMetrics = [
  { label: '生成产物', value: '页面 + 文档' },
  { label: '下一步', value: '预览 / 继续改' },
  { label: '模式', value: '先结果后编辑' },
];

const generationSteps = ['理解需求', '生成页面主张', '组织项目文件', '准备预览'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'preview' | 'files' | 'plan'>('preview');
  const {
    clear,
    error,
    generate,
    project,
    prompt,
    setPrompt,
    status,
  } = useGenerationStore();
  const { files, setFiles } = useFileStore();
  const { hide, setUrl, show } = usePreviewStore();

  const isGenerating = status === 'generating';
  const hasProject = status === 'generated' && project;

  const handleGenerate = async () => {
    const generated = await generate(prompt);
    if (!generated) return;

    setFiles(createProjectFiles(generated.files));
    openProjectPreview(generated);
    setActiveTab('preview');
  };

  const openProjectPreview = (targetProject = project, openInNewTab = false) => {
    if (!targetProject) return;

    const previewUrl = SimplePreviewService.createPreviewUrl(
      getEditablePreviewHtml(targetProject, files)
    );
    setUrl(previewUrl);
    show();

    if (openInNewTab) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const downloadProjectHtml = () => {
    if (!project) return;

    const html = getEditablePreviewHtml(project, files);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${slugify(project.title)}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadProjectZip = () => {
    if (!project) return;

    const blob = createProjectZip(project, files);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${slugify(project.title)}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetToHome = () => {
    hide();
    clear();
    setActiveTab('preview');
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#eef3f9] p-3 text-slate-950">
      <div className="min-h-[calc(100vh-24px)] overflow-hidden rounded-[34px] border border-white/80 bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_46%,#e8f7fb_100%)] shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
        <AppHeader />

        {!hasProject && (
          <LandingStage
            error={error}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            prompt={prompt}
            setPrompt={setPrompt}
          />
        )}

        {hasProject && (
          <ProjectStage
            activeTab={activeTab}
            isGenerating={isGenerating}
            onBack={resetToHome}
            onDownloadHtml={downloadProjectHtml}
            onDownloadZip={downloadProjectZip}
            onOpenPreview={() => openProjectPreview(undefined, true)}
            project={project}
            setActiveTab={setActiveTab}
          />
        )}
      </div>
    </main>
  );
}

function AppHeader() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/72 px-5 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-[20px] bg-[linear-gradient(135deg,#0f172a,#2563eb_62%,#06b6d4)] text-white shadow-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            VibeCanvas
          </p>
          <h1 className="text-[18px] font-semibold leading-6 text-slate-950">
            Idea to App Studio
          </h1>
        </div>
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-600 shadow-sm md:flex">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        生成链路已接入
      </div>
    </header>
  );
}

function LandingStage({
  error,
  isGenerating,
  onGenerate,
  prompt,
  setPrompt,
}: {
  error: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
}) {
  return (
    <section className="relative flex min-h-[calc(100vh-98px)] items-center justify-center px-5 py-8 sm:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(37,99,235,0.14),transparent_28%),radial-gradient(circle_at_18%_82%,rgba(6,182,212,0.14),transparent_24%)]" />
      <div className="relative mx-auto w-full max-w-[940px] text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/82 px-3 py-1.5 text-[12px] font-medium text-blue-700 shadow-sm">
          <Wand2 className="h-3.5 w-3.5" />
          不从复杂画布开始，先生成一个可看的应用初稿
        </div>

        <h2 className="mx-auto mt-6 max-w-[820px] text-[40px] font-semibold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-[56px]">
          把一句产品想法，变成第一版应用
        </h2>
        <p className="mx-auto mt-4 max-w-[660px] text-[16px] leading-8 text-slate-600">
          先得到页面主张、结果预览和项目文件，再决定是否进入高级画布继续改。普通用户不需要先理解节点。
        </p>

        <div className="mx-auto mt-7 max-w-[760px] rounded-[32px] border border-white bg-white/90 p-3 text-left shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="例如：做一个让人想马上注册的 AI 简历工具首页"
            className="h-28 w-full resize-none rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-[15px] leading-6 text-slate-950 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />

          {error && (
            <p className="mt-2 rounded-[18px] bg-red-50 px-3 py-2 text-[12px] font-medium text-red-600">
              {error}
            </p>
          )}

          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <button
              onClick={onGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex min-h-12 items-center justify-center gap-2 rounded-[22px] bg-[linear-gradient(135deg,#0f172a_0%,#2563eb_58%,#06b6d4_100%)] px-5 py-3 text-[15px] font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在生成
                </>
              ) : (
                <>
                  生成应用初稿
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <span className="flex items-center justify-center rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-[12px] font-semibold text-slate-500">
              生成后进入工作台
            </span>
          </div>
        </div>

        {isGenerating ? (
          <GenerationProgress />
        ) : (
          <>
            <div className="mx-auto mt-5 flex max-w-[760px] flex-wrap justify-center gap-2">
              {starterPrompts.map((starterPrompt) => (
                <button
                  key={starterPrompt}
                  onClick={() => setPrompt(starterPrompt)}
                  className="rounded-full border border-slate-200 bg-white/86 px-3 py-2 text-[12px] text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-500 hover:text-blue-600"
                >
                  {starterPrompt}
                </button>
              ))}
            </div>

            <div className="mx-auto mt-7 grid max-w-[760px] gap-3 sm:grid-cols-3">
              {productMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[22px] border border-white/80 bg-white/70 px-4 py-4 text-left shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-[14px] font-semibold text-slate-950">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function GenerationProgress() {
  return (
    <div className="mx-auto mt-7 grid max-w-[760px] gap-3 text-left sm:grid-cols-4">
      {generationSteps.map((step, index) => (
        <div key={step} className="rounded-[22px] border border-blue-100 bg-white/78 px-4 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-500">
              Step {index + 1}
            </span>
            {index === 0 ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-slate-300" />
            )}
          </div>
          <p className="mt-3 text-[13px] font-semibold text-slate-900">{step}</p>
        </div>
      ))}
    </div>
  );
}

interface ProjectStageProps {
  activeTab: 'preview' | 'files' | 'plan';
  isGenerating: boolean;
  project: GeneratedProject;
  setActiveTab: (tab: 'preview' | 'files' | 'plan') => void;
  onBack: () => void;
  onDownloadHtml: () => void;
  onDownloadZip: () => void;
  onOpenPreview: () => void;
}

function ProjectStage({
  activeTab,
  isGenerating,
  project,
  setActiveTab,
  onBack,
  onDownloadHtml,
  onDownloadZip,
  onOpenPreview,
}: ProjectStageProps) {
  return (
    <section className="grid min-h-[calc(100vh-98px)] bg-[#f8fbff] lg:grid-cols-[minmax(280px,0.38fr)_minmax(0,1fr)]">
      <aside className="border-r border-slate-200/80 bg-white/72 px-5 py-6 backdrop-blur">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 shadow-sm transition hover:border-blue-500 hover:text-blue-600"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          回到首页
        </button>

        <div className="mt-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600">
            Generated Project
          </p>
          <h2 className="mt-3 text-[28px] font-semibold leading-tight tracking-[-0.03em] text-slate-950">
            {project.title}
          </h2>
          <p className="mt-4 text-[14px] leading-7 text-slate-600">
            {project.description}
          </p>
        </div>

        <div className="mt-8 space-y-3">
          {['预览当前页面', '查看生成文件', '拆解页面结构'].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span className="text-[13px] font-semibold text-slate-700">{item}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onOpenPreview}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-[22px] bg-slate-950 px-4 py-3 text-[14px] font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <ExternalLink className="h-4 w-4" />
          打开完整预览
        </button>

        <button
          onClick={onDownloadHtml}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-700"
        >
          <Download className="h-4 w-4" />
          导出当前 HTML
        </button>

        <button
          onClick={onDownloadZip}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-[22px] border border-blue-100 bg-blue-50 px-4 py-3 text-[14px] font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100"
        >
          <Archive className="h-4 w-4" />
          导出项目 ZIP
        </button>
      </aside>

      <ResultWorkspace
        activeTab={activeTab}
        isGenerating={isGenerating}
        project={project}
        setActiveTab={setActiveTab}
      />
    </section>
  );
}

interface ResultWorkspaceProps {
  activeTab: 'preview' | 'files' | 'plan';
  isGenerating: boolean;
  project: GeneratedProject;
  setActiveTab: (tab: 'preview' | 'files' | 'plan') => void;
}

function ResultWorkspace({
  activeTab,
  isGenerating,
  project,
  setActiveTab,
}: ResultWorkspaceProps) {
  const tabs = [
    { id: 'preview' as const, label: '预览', icon: Layers3 },
    { id: 'files' as const, label: '文件', icon: FileText },
    { id: 'plan' as const, label: '结构', icon: Code2 },
  ];

  return (
    <div className="min-w-0 bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_58%,#06b6d4_100%)] p-5 sm:p-8">
      <div className="flex h-full min-h-[560px] flex-col rounded-[32px] border border-white/16 bg-white/12 p-3 shadow-[0_30px_90px_rgba(15,23,42,0.34)] backdrop-blur-xl">
        <div className="flex rounded-[22px] bg-slate-950/24 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-[18px] px-3 py-2.5 text-[13px] font-semibold transition ${
                  isActive ? 'bg-white text-slate-950' : 'text-white/64 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex-1 rounded-[26px] bg-white p-4">
          {activeTab === 'preview' && (
            <PreviewPanel isGenerating={isGenerating} project={project} />
          )}

          {activeTab === 'files' && (
            <FilesPanel
              project={project}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'plan' && (
            <PlanPanel project={project} />
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({
  isGenerating,
  project,
}: {
  isGenerating: boolean;
  project: GeneratedProject;
}) {
  const { files } = useFileStore();
  const previewHtml = getEditablePreviewHtml(project, files);
  const previewDocument = SimplePreviewService.createPreviewDocument(previewHtml);

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.62fr)]">
      <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950 shadow-sm">
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/54">
            Sandboxed Preview
          </span>
        </div>
        <iframe
          title="Generated project preview"
          sandbox=""
          srcDoc={previewDocument}
          className="h-[420px] w-full bg-white"
        />
      </div>

      <div className="rounded-[22px] bg-[linear-gradient(135deg,#f8fafc,#e0f2fe)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-blue-600">
              Generated Draft
            </p>
            <h3 className="mt-3 text-[26px] font-semibold leading-tight tracking-[-0.035em] text-slate-950">
              {isGenerating ? '正在生成页面主张...' : project.tagline}
            </h3>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm">
            已生成
          </span>
        </div>

        <p className="mt-4 text-[14px] leading-7 text-slate-600">
          {project.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-950 px-4 py-2 text-[13px] font-semibold text-white">
            {project.primaryAction}
          </span>
          <span className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-slate-600">
            {project.secondaryAction}
          </span>
        </div>

        <div className="mt-7 grid gap-3">
          {project.sections.map((section) => (
            <div key={section.title} className="rounded-[20px] bg-white/82 px-4 py-4 shadow-sm">
              <p className="text-[13px] font-semibold text-slate-950">{section.title}</p>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilesPanel({
  project,
  setActiveTab,
}: {
  project: GeneratedProject;
  setActiveTab: (tab: 'preview' | 'files' | 'plan') => void;
}) {
  const { addFile, deleteFile, files, selectedFileId, selectFile, updateFile } = useFileStore();
  const editableFiles = files.length > 0 ? files : createProjectFiles(project.files);
  const selectedFile = editableFiles.find((file) => file.id === selectedFileId) ?? editableFiles[0];
  const originalFile = selectedFile
    ? project.files.find((file) => file.path === selectedFile.path)
    : undefined;
  const hasChanges = Boolean(
    selectedFile &&
    originalFile &&
    selectedFile.content !== originalFile.content
  );
  const lineCount = selectedFile ? getLineCount(selectedFile.content) : 0;
  const addDraftFile = () => {
    const fileNumber = editableFiles.length + 1;
    const file = addFile({
      name: `note-${fileNumber}.md`,
      path: `docs/note-${fileNumber}.md`,
      language: 'markdown',
      content: `# Note ${fileNumber}\n\n记录你的下一步修改想法。\n`,
    });

    selectFile(file.id);
  };
  const deleteSelectedFile = () => {
    if (!selectedFile || editableFiles.length <= 1) return;

    const nextFile = editableFiles.find((file) => file.id !== selectedFile.id);
    deleteFile(selectedFile.id);
    selectFile(nextFile?.id ?? null);
  };

  return (
    <div className="grid h-full min-h-[520px] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="min-h-0 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                Project Files
              </p>
              <p className="mt-1 text-[13px] font-semibold text-slate-800">
                选择文件后可直接编辑
              </p>
            </div>
            <button
              type="button"
              onClick={addDraftFile}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus className="h-3 w-3" />
              新文件
            </button>
          </div>
        </div>

        <div className="max-h-[456px] space-y-2 overflow-auto p-2">
          {editableFiles.map((file) => {
            const isSelected = selectedFile?.id === file.id;

            return (
              <button
                key={file.id}
                type="button"
                onClick={() => selectFile(file.id)}
                className={`w-full rounded-[18px] border px-3 py-3 text-left transition ${
                  isSelected
                    ? 'border-blue-300 bg-white shadow-sm ring-4 ring-blue-500/10'
                    : 'border-transparent bg-transparent hover:border-slate-200 hover:bg-white/74'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-[13px] font-semibold text-slate-950">{file.name}</p>
                      {project.files.find((projectFile) => projectFile.path === file.path)?.content !== file.content && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="mt-1 truncate text-[11px] text-slate-500">{file.path}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
                    {file.language}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950 shadow-sm">
        {selectedFile ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-white">{selectedFile.name}</p>
                <p className="mt-1 truncate text-[11px] text-white/42">
                  {selectedFile.path} · {lineCount} 行 · {selectedFile.content.length} 字符
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  hasChanges ? 'bg-blue-400/18 text-blue-100' : 'bg-white/10 text-white/62'
                }`}>
                  {hasChanges ? '已修改' : '未修改'}
                </span>
                {isPreviewFile(selectedFile) && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-900 transition hover:bg-blue-50"
                  >
                    <Eye className="h-3 w-3" />
                    查看预览
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => originalFile && updateFile(selectedFile.id, originalFile.content)}
                  disabled={!hasChanges || !originalFile}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70 transition hover:bg-white/16 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw className="h-3 w-3" />
                  还原
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedFile}
                  disabled={editableFiles.length <= 1}
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-400/14 px-3 py-1 text-[11px] font-semibold text-red-100 transition hover:bg-red-400/22 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="h-3 w-3" />
                  删除
                </button>
              </div>
            </div>

            <CodeEditor
              content={selectedFile.content}
              onChange={(content) => updateFile(selectedFile.id, content)}
            />
          </>
        ) : (
          <div className="flex min-h-[520px] items-center justify-center p-6 text-center">
            <p className="text-[13px] text-white/54">还没有生成文件。</p>
          </div>
        )}
        </div>
    </div>
  );
}

function CodeEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (content: string) => void;
}) {
  const lineNumbers = Array.from({ length: getLineCount(content) }, (_, index) => index + 1);

  return (
    <div className="grid min-h-[458px] flex-1 grid-cols-[56px_minmax(0,1fr)] overflow-hidden bg-slate-950 font-mono text-[12px] leading-6">
      <div
        aria-hidden="true"
        className="select-none overflow-hidden border-r border-white/10 bg-slate-900/78 px-3 py-4 text-right text-slate-500"
      >
        {lineNumbers.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="min-h-[458px] resize-none bg-slate-950 px-4 py-4 text-slate-100 outline-none selection:bg-blue-500/40"
      />
    </div>
  );
}

function PlanPanel({ project }: { project: GeneratedProject }) {
  return (
    <div className="space-y-3">
      {project.sections.map((section, index) => (
        <div key={section.title} className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Step {index + 1}
          </p>
          <h3 className="mt-1 text-[15px] font-semibold text-slate-950">{section.title}</h3>
          <p className="mt-2 text-[13px] leading-6 text-slate-600">{section.description}</p>
        </div>
      ))}
    </div>
  );
}

function createProjectFiles(files: GeneratedProject['files']): ProjectFile[] {
  const now = new Date();

  return files.map((file, index) => ({
    ...file,
    id: `generated-${Date.now()}-${index}`,
    createdAt: now,
    updatedAt: now,
  }));
}

function getEditablePreviewHtml(project: GeneratedProject, files: ProjectFile[]): string {
  return files.find(isPreviewFile)?.content ?? project.previewHtml;
}

function isPreviewFile(file: Pick<ProjectFile, 'language' | 'path' | 'name'>): boolean {
  const filePath = `${file.path}/${file.name}`.toLowerCase();

  return file.language.toLowerCase() === 'html' || filePath.endsWith('.html');
}

function getLineCount(content: string): number {
  return Math.max(1, content.split('\n').length);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'vibecanvas-project';
}
