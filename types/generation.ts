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

export interface GeneratedProject {
  id: string;
  prompt: string;
  title: string;
  tagline: string;
  description: string;
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
