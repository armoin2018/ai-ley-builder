// File Editor Types

export interface FileEditorTab {
  id: string;
  title: string;
  filePath: string;
  fileType: 'plantuml' | 'persona' | 'instruction' | 'global-instruction' | 'command-prompt';
  content: string;
  hasChanges: boolean;
  lastModified?: Date;
  isReadOnly?: boolean;
}

export interface PersonaFile {
  name: string;
  path: string;
  type: string;
  tone: string;
  expertise: string[];
  background: string;
  communication_style: string;
  content: string;
}

export interface InstructionFile {
  name: string;
  path: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  scope: string[];
  content: string;
}

export interface CommandPromptFile {
  name: string;
  path: string;
  fileName: string;
  variables: Array<{
    name: string;
    type: string;
    default?: string;
    description?: string;
  }>;
  content: string;
}

export interface GlobalInstructionFile {
  path: string;
  content: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

export interface PlantUMLFile {
  name: string;
  path: string;
  content: string;
  workflowName: string;
}