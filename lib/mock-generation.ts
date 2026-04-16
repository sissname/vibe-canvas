import { GeneratedProject, GeneratedProjectRequirement, GeneratedProjectSection } from '@/types/generation';

interface Scenario {
  audience: string;
  accent: string;
  goal: string;
  projectType: string;
  secondaryAction: string;
  style: string;
  tagline: string;
  title: string;
}

const fallbackScenario: Scenario = {
  audience: '早期产品用户',
  accent: '#2563eb',
  goal: '把想法快速讲清楚，并形成一版可以继续修改的页面初稿',
  projectType: '产品落地页',
  secondaryAction: '查看页面结构',
  style: '清晰、可信、适合快速验证',
  tagline: '把一句想法变成可以继续打磨的产品第一版',
  title: '产品想法初稿',
};

export function createMockGeneratedProject(prompt: string): GeneratedProject {
  const cleanPrompt = prompt.trim() || '做一个可以展示功能卖点的 AI 工具落地页';
  const scenario = inferScenario(cleanPrompt);
  const requirement: GeneratedProjectRequirement = {
    audience: scenario.audience,
    goal: scenario.goal,
    projectType: scenario.projectType,
    style: scenario.style,
  };
  const sections = createSections(scenario);
  const description = `我把你的想法先拆成「${scenario.projectType}」方向：面向${scenario.audience}，核心目标是${scenario.goal}。`;
  const previewHtml = createPreviewHtml(scenario, description, sections);

  return {
    id: `project-${Date.now()}`,
    prompt: cleanPrompt,
    title: scenario.title,
    tagline: scenario.tagline,
    description,
    generationMode: 'mock',
    requirement,
    executionSteps: [
      {
        title: '理解输入',
        description: `识别到项目类型：${scenario.projectType}，目标用户：${scenario.audience}。`,
        status: 'completed',
      },
      {
        title: '规划页面',
        description: `围绕「${scenario.goal}」组织 Hero、信任信息、核心卖点和行动入口。`,
        status: 'completed',
      },
      {
        title: '生成文件',
        description: '生成静态 HTML 预览、项目简报和后续任务清单。',
        status: 'completed',
      },
      {
        title: '真实 Agent',
        description: '当前未配置 OpenClaw endpoint，因此没有调用真实 Agent。',
        status: 'skipped',
      },
    ],
    nextActions: [
      '检查预览是否符合你的业务场景',
      '在文件页修改文案、区块或样式',
      '配置 OpenClaw 后切换到真实执行',
    ],
    primaryAction: '查看预览',
    secondaryAction: scenario.secondaryAction,
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
        content: createBrief(cleanPrompt, scenario, requirement, sections),
      },
      {
        name: 'next-steps.md',
        path: 'docs/next-steps.md',
        language: 'markdown',
        content: createNextSteps(scenario),
      },
    ],
    previewHtml,
    createdAt: new Date().toISOString(),
  };
}

function inferScenario(prompt: string): Scenario {
  if (/摄影|摄影师|作品集|拍摄|写真|婚礼/i.test(prompt)) {
    return {
      audience: '正在寻找摄影服务的个人客户和品牌客户',
      accent: '#7c3aed',
      goal: '快速展示风格、案例和预约入口，让访客愿意咨询档期',
      projectType: '摄影师接单作品集网站',
      secondaryAction: '查看作品案例',
      style: '高级、影像感、重视作品展示和信任建立',
      tagline: '用作品说服客户，用清晰预约拿到下一单',
      title: '摄影师接单作品集网站',
    };
  }

  if (/简历|resume|求职|面试/i.test(prompt)) {
    return {
      audience: '需要快速优化简历和求职表达的候选人',
      accent: '#2563eb',
      goal: '把经历转成更有说服力的简历内容，并引导用户开始生成',
      projectType: 'AI 简历工具首页',
      secondaryAction: '查看简历示例',
      style: '专业、可信、强调效率和结果',
      tagline: '10 分钟生成一份更会卖自己的简历',
      title: 'AI 简历工具首页',
    };
  }

  if (/dashboard|控制台|SaaS|数据|后台/i.test(prompt)) {
    return {
      audience: '需要统一查看数据、任务和客户状态的团队',
      accent: '#0f766e',
      goal: '把关键指标和待办集中呈现，减少团队切换成本',
      projectType: 'SaaS Dashboard 原型',
      secondaryAction: '查看指标示例',
      style: '冷静、效率感、适合 B2B 产品演示',
      tagline: '把关键指标、任务和客户动态放进一个清晰工作台',
      title: 'SaaS Dashboard 原型',
    };
  }

  if (/电商|商品|店铺|购买|下单|commerce/i.test(prompt)) {
    return {
      audience: '正在比较商品并准备购买的消费者',
      accent: '#ea580c',
      goal: '突出商品卖点、信任背书和购买理由，提升转化',
      projectType: '电商商品页',
      secondaryAction: '查看用户评价',
      style: '直接、有促销感、突出利益点',
      tagline: '用更清楚的卖点和信任信息提升商品转化',
      title: '电商商品页',
    };
  }

  if (/课程|教育|学习|训练营|知识付费/i.test(prompt)) {
    return {
      audience: '想系统学习并看到成长路径的学员',
      accent: '#16a34a',
      goal: '讲清课程收益、学习路径和报名理由',
      projectType: '课程招生页',
      secondaryAction: '查看课程大纲',
      style: '有秩序、可信、强调结果和陪伴',
      tagline: '把学习路径讲清楚，让用户敢报名',
      title: '课程招生页',
    };
  }

  if (/AI|工具|生成|自动|助手/i.test(prompt)) {
    return {
      audience: '希望用 AI 节省时间的个人或团队',
      accent: '#0891b2',
      goal: '说明工具能解决什么问题，并引导用户马上试用',
      projectType: 'AI 工具落地页',
      secondaryAction: '查看生成示例',
      style: '轻科技、清晰、强调即时价值',
      tagline: '把重复工作交给 AI，把注意力留给判断',
      title: 'AI 工具落地页',
    };
  }

  return fallbackScenario;
}

function createSections(scenario: Scenario): GeneratedProjectSection[] {
  return [
    {
      title: 'Hero 主张',
      description: `${scenario.tagline}。首屏直接说明面向谁、解决什么问题、为什么现在就该行动。`,
    },
    {
      title: '核心卖点',
      description: `围绕「${scenario.goal}」展示 3 个最容易被用户理解的价值点。`,
    },
    {
      title: '信任与证明',
      description: `加入案例、流程、评价或数据，让${scenario.audience}降低决策成本。`,
    },
    {
      title: '行动入口',
      description: `提供清晰 CTA：${scenario.secondaryAction} / 立即开始，避免用户看完不知道下一步。`,
    },
  ];
}

function createPreviewHtml(
  scenario: Scenario,
  description: string,
  sections: GeneratedProjectSection[]
): string {
  return `
    <main style="min-height:100vh;margin:0;font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;background:linear-gradient(135deg,#f8fafc,#eef2ff);color:#0f172a;padding:44px;">
      <section style="max-width:1040px;margin:0 auto;background:rgba(255,255,255,.94);border:1px solid rgba(148,163,184,.28);border-radius:34px;box-shadow:0 30px 90px rgba(15,23,42,.16);overflow:hidden;">
        <div style="padding:54px;background:linear-gradient(135deg,#0f172a,${scenario.accent});color:white;">
          <p style="margin:0 0 14px;font-size:13px;letter-spacing:.16em;text-transform:uppercase;opacity:.76;">${escapeHtml(scenario.projectType)}</p>
          <h1 style="margin:0;max-width:760px;font-size:52px;line-height:1.04;letter-spacing:-.045em;">${escapeHtml(scenario.tagline)}</h1>
          <p style="margin:22px 0 0;max-width:680px;font-size:17px;line-height:1.75;opacity:.86;">${escapeHtml(description)}</p>
          <div style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap;">
            <a style="display:inline-flex;border-radius:999px;background:white;color:#0f172a;padding:13px 19px;font-weight:800;text-decoration:none;">立即开始</a>
            <a style="display:inline-flex;border-radius:999px;background:rgba(255,255,255,.14);color:white;padding:13px 19px;font-weight:800;text-decoration:none;border:1px solid rgba(255,255,255,.26);">${escapeHtml(scenario.secondaryAction)}</a>
          </div>
        </div>
        <div style="padding:26px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;">
          ${sections
            .map(
              (section) => `
                <article style="border-radius:24px;background:#f8fafc;border:1px solid #e2e8f0;padding:22px;">
                  <h2 style="margin:0;font-size:19px;">${escapeHtml(section.title)}</h2>
                  <p style="margin:10px 0 0;color:#475569;line-height:1.7;font-size:14px;">${escapeHtml(section.description)}</p>
                </article>
              `
            )
            .join('')}
        </div>
      </section>
    </main>
  `;
}

function createBrief(
  prompt: string,
  scenario: Scenario,
  requirement: GeneratedProjectRequirement,
  sections: GeneratedProjectSection[]
): string {
  return `# ${scenario.title}

## 原始需求
${prompt}

## 需求理解
- 项目类型：${requirement.projectType}
- 目标用户：${requirement.audience}
- 核心目标：${requirement.goal}
- 风格方向：${requirement.style}

## 页面结构
${sections.map((section) => `- ${section.title}：${section.description}`).join('\n')}
`;
}

function createNextSteps(scenario: Scenario): string {
  return `# 下一步建议

1. 把 Hero 文案改成你自己的真实业务表达。
2. 补充 3-6 个真实案例或截图，用来支撑「${scenario.goal}」。
3. 如果要真实执行 Agent，请配置 OpenClaw endpoint 后重新生成。
`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
