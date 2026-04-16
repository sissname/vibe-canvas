import { createMockGeneratedProject } from '@/lib/mock-generation';
import {
  GeneratedProject,
  GeneratedProjectFile,
  GeneratedProjectSection,
  GenerateProjectRequest,
  GenerateProjectResponse,
} from '@/types/generation';

type GenerationProvider = 'mock' | 'openclaw';

export interface GenerationHealth {
  configured: boolean;
  provider: GenerationProvider;
  realExecution: boolean;
  issues: string[];
}

export function getGenerationProvider(): GenerationProvider {
  const provider = process.env.GENERATION_PROVIDER;

  if (provider === 'openclaw' || provider === 'mock') {
    return provider;
  }

  return 'mock';
}

export function getGenerationHealth(): GenerationHealth {
  const provider = getGenerationProvider();
  const issues: string[] = [];

  if (provider === 'openclaw' && !process.env.OPENCLAW_GENERATE_URL) {
    issues.push('OPENCLAW_GENERATE_URL is not configured');
  }

  return {
    configured: issues.length === 0,
    provider,
    realExecution: provider === 'openclaw' && issues.length === 0,
    issues,
  };
}

function assertPrompt(prompt: string): string {
  const cleanPrompt = prompt.trim();

  if (!cleanPrompt) {
    throw new GenerationServiceError('Prompt is required', 400);
  }

  if (cleanPrompt.length > 2000) {
    throw new GenerationServiceError('Prompt is too long', 400);
  }

  return cleanPrompt;
}

export class GenerationServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 500
  ) {
    super(message);
    this.name = 'GenerationServiceError';
  }
}

export async function generateProject(
  request: Partial<GenerateProjectRequest>
): Promise<GenerateProjectResponse> {
  const prompt = assertPrompt(typeof request.prompt === 'string' ? request.prompt : '');
  const provider = getGenerationProvider();

  if (provider === 'openclaw') {
    return generateWithOpenClaw(prompt);
  }

  return {
    project: createMockGeneratedProject(prompt),
  };
}

async function generateWithOpenClaw(prompt: string): Promise<GenerateProjectResponse> {
  const endpoint = process.env.OPENCLAW_GENERATE_URL;
  const token = process.env.OPENCLAW_API_TOKEN;

  if (!endpoint) {
    throw new GenerationServiceError('OPENCLAW_GENERATE_URL is not configured', 503);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new GenerationServiceError(errorBody?.error ?? 'OpenClaw generation failed', response.status);
  }

  const payload = await response.json().catch(() => null);

  return validateGenerateProjectResponse(payload);
}

function validateGenerateProjectResponse(payload: unknown): GenerateProjectResponse {
  if (!isRecord(payload) || !isGeneratedProject(payload.project)) {
    throw new GenerationServiceError('OpenClaw returned an invalid project payload', 502);
  }

  return { project: payload.project };
}

function isGeneratedProject(value: unknown): value is GeneratedProject {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    typeof value.prompt === 'string' &&
    typeof value.title === 'string' &&
    typeof value.tagline === 'string' &&
    typeof value.description === 'string' &&
    typeof value.primaryAction === 'string' &&
    typeof value.secondaryAction === 'string' &&
    Array.isArray(value.sections) &&
    value.sections.every(isGeneratedProjectSection) &&
    Array.isArray(value.files) &&
    value.files.every(isGeneratedProjectFile) &&
    typeof value.previewHtml === 'string' &&
    typeof value.createdAt === 'string'
  );
}

function isGeneratedProjectSection(value: unknown): value is GeneratedProjectSection {
  return (
    isRecord(value) &&
    typeof value.title === 'string' &&
    typeof value.description === 'string'
  );
}

function isGeneratedProjectFile(value: unknown): value is GeneratedProjectFile {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.path === 'string' &&
    typeof value.language === 'string' &&
    typeof value.content === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
