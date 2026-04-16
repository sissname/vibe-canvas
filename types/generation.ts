export type GenerationStatus = 'idle' | 'generating' | 'generated' | 'refining' | 'failed';

export interface GeneratedProjectFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

export interface GeneratedProjectSection {
  title: string;
  description: string;
}

export interface GeneratedProjectRequirement {
  audience: string;
  goal: string;
  projectType: string;
  style: string;
}

export interface GeneratedProjectExecutionStep {
  title: string;
  description: string;
  status: 'completed' | 'skipped' | 'failed';
}

export interface GeneratedProject {
  id: string;
  prompt: string;
  title: string;
  tagline: string;
  description: string;
  generationMode?: 'mock' | 'openclaw';
  requirement?: GeneratedProjectRequirement;
  executionSteps?: GeneratedProjectExecutionStep[];
  nextActions?: string[];
  primaryAction: string;
  secondaryAction: string;
  sections: GeneratedProjectSection[];
  files: GeneratedProjectFile[];
  previewHtml: string;
  createdAt: string;
}

export interface GenerateProjectRequest {
  prompt: string;
}

export interface GenerateProjectResponse {
  project: GeneratedProject;
}
