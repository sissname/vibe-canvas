import { createMockGeneratedProject } from '@/lib/mock-generation';
import { GenerateProjectRequest, GenerateProjectResponse } from '@/types/generation';

type GenerationProvider = 'mock' | 'openclaw';

function getProvider(): GenerationProvider {
  const provider = process.env.GENERATION_PROVIDER;

  if (provider === 'openclaw' || provider === 'mock') {
    return provider;
  }

  return 'mock';
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
  const provider = getProvider();

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

  return (await response.json()) as GenerateProjectResponse;
}
