import { GeneratedProject } from '@/types/generation';

function inferProjectTitle(prompt: string): string {
  if (/简历|resume/i.test(prompt)) return 'AI 简历工具首页';
  if (/dashboard|控制台|SaaS/i.test(prompt)) return 'SaaS Dashboard 原型';
  if (/发布页|落地页|landing/i.test(prompt)) return '产品发布落地页';
  if (/电商|商品|commerce/i.test(prompt)) return '电商产品页面';
  return 'AI 应用初稿';
}

function inferTagline(prompt: string): string {
  if (/简历|resume/i.test(prompt)) return '10 分钟生成一份更会卖自己的简历';
  if (/dashboard|控制台|SaaS/i.test(prompt)) return '把关键指标、任务和客户动态放进一个清晰工作台';
  if (/发布页|落地页|landing/i.test(prompt)) return '把产品卖点讲清楚，让访客更快理解并行动';
  if (/电商|商品|commerce/i.test(prompt)) return '用更清楚的卖点和信任信息提升商品转化';
  return '把一句想法快速变成可展示的产品第一版';
}

export function createMockGeneratedProject(prompt: string): GeneratedProject {
  const cleanPrompt = prompt.trim() || '做一个可以展示功能卖点的 AI 工具落地页';
  const title = inferProjectTitle(cleanPrompt);
  const tagline = inferTagline(cleanPrompt);
  const description =
    '根据你的需求，我先生成了页面主张、交互流程和可继续调整的模块骨架。下一步可以直接预览，也可以展开高级画布细调结构。';

  const sections = [
    {
      title: '页面结构',
      description: 'Hero、核心卖点、使用流程、行动按钮已经形成第一版。',
    },
    {
      title: '交互流程',
      description: '默认从输入需求开始，到生成结果和继续优化形成闭环。',
    },
    {
      title: '可调节点',
      description: '如果需要更细，可以进入高级画布调整 Agent、代码和输出节点。',
    },
  ];

  const previewHtml = `
    <main style="min-height:100vh;margin:0;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;background:linear-gradient(135deg,#eff6ff,#ecfeff);color:#0f172a;padding:44px;">
      <section style="max-width:960px;margin:0 auto;background:rgba(255,255,255,.9);border:1px solid rgba(148,163,184,.25);border-radius:32px;box-shadow:0 28px 90px rgba(15,23,42,.14);overflow:hidden;">
        <div style="padding:48px 52px;background:linear-gradient(135deg,#0f172a,#2563eb 68%,#06b6d4);color:white;">
          <p style="margin:0 0 14px;font-size:13px;letter-spacing:.14em;text-transform:uppercase;opacity:.72;">Generated Draft</p>
          <h1 style="margin:0;max-width:720px;font-size:48px;line-height:1.06;letter-spacing:-.04em;">${escapeHtml(tagline)}</h1>
          <p style="margin:20px 0 0;max-width:620px;font-size:17px;line-height:1.7;opacity:.84;">${escapeHtml(description)}</p>
          <div style="margin-top:28px;display:flex;gap:12px;flex-wrap:wrap;">
            <a style="display:inline-flex;border-radius:999px;background:white;color:#0f172a;padding:13px 18px;font-weight:700;text-decoration:none;">开始使用</a>
            <a style="display:inline-flex;border-radius:999px;background:rgba(255,255,255,.14);color:white;padding:13px 18px;font-weight:700;text-decoration:none;border:1px solid rgba(255,255,255,.24);">查看示例</a>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:24px;">
          ${sections
            .map(
              (section) => `
                <article style="border-radius:22px;background:#f8fafc;border:1px solid #e2e8f0;padding:20px;">
                  <h2 style="margin:0;font-size:18px;">${escapeHtml(section.title)}</h2>
                  <p style="margin:10px 0 0;color:#475569;line-height:1.65;font-size:14px;">${escapeHtml(section.description)}</p>
                </article>
              `
            )
            .join('')}
        </div>
      </section>
    </main>
  `;

  return {
    id: `project-${Date.now()}`,
    prompt: cleanPrompt,
    title,
    tagline,
    description,
    primaryAction: '开始使用',
    secondaryAction: '查看示例',
    sections,
    files: [
      {
        name: 'landing-page.html',
        path: 'app/landing-page.html',
        language: 'html',
        content: previewHtml,
      },
      {
        name: 'brief.md',
        path: 'docs/brief.md',
        language: 'markdown',
        content: `# ${title}\n\n## 原始需求\n${cleanPrompt}\n\n## 页面主张\n${tagline}\n`,
      },
    ],
    previewHtml,
    createdAt: new Date().toISOString(),
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
