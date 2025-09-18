// Settings type definitions

import { AI_LEY_PATHS } from '../../utils/paths';

export interface AutoArrangeSettings {
  connectionSpacing: number;
  enableConnectionAwareSpacing: boolean;
  horizontalSpacing: number;
  verticalSpacing: number;
  minSpacing: number;
  enableCollisionDetection: boolean;
}

export interface ScriptExecutorSettings {
  id: string;
  name: string;
  command: string;
  args: string[];
  workingDirectory?: string;
  environment?: Record<string, string>;
  timeout: number;
  enabled: boolean;
  icon: string;
  color: string;
  description: string;
}

export interface ScriptNodeSettings {
  executors: ScriptExecutorSettings[];
  enablePalette: boolean;
  defaultTimeout: number;
}

export interface UMLFlowsSettings {
  storageFolder: string;
  autoSave: boolean;
  backupEnabled: boolean;
  backupFolder?: string;
  autoArrange: AutoArrangeSettings;
  scriptNodes: ScriptNodeSettings;
}

export interface LocalAITool {
  id: string;
  name: string;
  command: string;
  args: string[];
  description?: string;
  enabled: boolean;
}

export interface LocalAISettings {
  tools: LocalAITool[];
  defaultTool?: string;
  timeout: number; // in seconds
}

export interface AIEndpoint {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  model?: string;
  provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
  enabled: boolean;
  maxTokens?: number;
  temperature?: number;
}

export interface AIRestSettings {
  endpoints: AIEndpoint[];
  defaultEndpoint?: string;
  retryAttempts: number;
  timeout: number; // in seconds
}

export interface AppSettings {
  umlFlows: UMLFlowsSettings;
  localAI: LocalAISettings;
  aiRest: AIRestSettings;
  version: string;
  lastUpdated: string;
}

export interface SettingsState {
  settings: AppSettings;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  umlFlows: {
    get storageFolder() {
      return AI_LEY_PATHS.UML_FLOWS_USER;
    },
    autoSave: true,
    backupEnabled: false,
    autoArrange: {
      connectionSpacing: 50,
      enableConnectionAwareSpacing: true,
      horizontalSpacing: 300,
      verticalSpacing: 150,
      minSpacing: 50,
      enableCollisionDetection: true,
    },
    scriptNodes: {
      enablePalette: true,
      defaultTimeout: 30,
      executors: [
        {
          id: 'shell',
          name: 'Shell Script',
          command: 'sh',
          args: ['-c'],
          timeout: 30,
          enabled: true,
          icon: '🐚',
          color: 'bg-slate-50/50 border-slate-100 hover:border-slate-200',
          description: 'Execute shell/bash scripts',
        },
        {
          id: 'python',
          name: 'Python Script',
          command: 'python3',
          args: ['-c'],
          timeout: 30,
          enabled: true,
          icon: '🐍',
          color: 'bg-blue-50/50 border-blue-100 hover:border-blue-200',
          description: 'Execute Python scripts',
        },
        {
          id: 'php',
          name: 'PHP Script',
          command: 'php',
          args: ['-r'],
          timeout: 30,
          enabled: true,
          icon: '🐘',
          color: 'bg-purple-50/50 border-purple-100 hover:border-purple-200',
          description: 'Execute PHP scripts',
        },
        {
          id: 'nodejs',
          name: 'Node.js Script',
          command: 'node',
          args: ['-e'],
          timeout: 30,
          enabled: true,
          icon: '🟢',
          color: 'bg-green-50/50 border-green-100 hover:border-green-200',
          description: 'Execute Node.js/JavaScript scripts',
        },
      ],
    },
  },
  localAI: {
    tools: [
      {
        id: 'ollama',
        name: 'Ollama',
        command: 'ollama',
        args: ['run'],
        description: 'Local Ollama AI model runner',
        enabled: false,
      },
      {
        id: 'llamacpp',
        name: 'Llama.cpp',
        command: 'llama-cpp-python',
        args: [],
        description: 'Llama.cpp Python bindings',
        enabled: false,
      },
    ],
    timeout: 30,
  },
  aiRest: {
    endpoints: [
      {
        id: 'openai',
        name: 'OpenAI GPT',
        url: 'https://api.openai.com/v1/chat/completions',
        apiKey: '',
        model: 'gpt-4',
        provider: 'openai',
        enabled: false,
        maxTokens: 4096,
        temperature: 0.7,
      },
      {
        id: 'anthropic',
        name: 'Anthropic Claude',
        url: 'https://api.anthropic.com/v1/messages',
        apiKey: '',
        model: 'claude-3-sonnet-20240229',
        provider: 'anthropic',
        enabled: false,
        maxTokens: 4096,
        temperature: 0.7,
      },
    ],
    retryAttempts: 3,
    timeout: 60,
  },
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
};