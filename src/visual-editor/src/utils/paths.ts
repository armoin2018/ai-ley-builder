/**
 * Get the git root directory path
 * Uses environment variable or fallback for flexible deployment
 */
export const getGitRoot = (): string => {
  // Check if we have an environment variable for the git root
  if (typeof window !== 'undefined' && (window as any).__AI_LEY_GIT_ROOT__) {
    return (window as any).__AI_LEY_GIT_ROOT__;
  }

  // Check for Vite environment variable
  if (import.meta.env && import.meta.env.VITE_AI_LEY_GIT_ROOT) {
    return import.meta.env.VITE_AI_LEY_GIT_ROOT;
  }

  // Fallback: relative path from visual-editor to project root
  return '../../';
};

/**
 * Get the .ai-ley root directory path
 */
export const getAiLeyRoot = (): string => {
  const gitRoot = getGitRoot();
  return `${gitRoot}.ai-ley`;
};

/**
 * Simple path joining utility for browser environment
 */
const joinPath = (...parts: string[]): string => {
  return parts
    .filter(part => part && part !== '.')
    .join('/')
    .replace(/\/+/g, '/'); // Remove duplicate slashes
};

/**
 * AI-LEY path constants using dynamic git root
 */
export const AI_LEY_PATHS = {
  get ROOT() {
    return getAiLeyRoot();
  },
  get SHARED() {
    return joinPath(this.ROOT, 'shared');
  },
  get GLOBAL_INSTRUCTIONS() {
    return joinPath(this.SHARED, 'global-instructions.md');
  },
  get INSTRUCTIONS() {
    return joinPath(this.SHARED, 'instructions');
  },
  get PERSONAS() {
    return joinPath(this.SHARED, 'personas');
  },
  get VARIABLES() {
    return joinPath(this.SHARED, 'variables');
  },
  get UML_FLOWS() {
    return joinPath(this.SHARED, 'uml-flows');
  },
  get UML_FLOWS_USER() {
    return joinPath(this.UML_FLOWS, 'user');
  },
  get FLOWS() {
    return joinPath(this.SHARED, 'flows');
  },
  get FLOWS_BACKUP() {
    return joinPath(this.FLOWS, 'backup');
  },
  get PROMPTS() {
    return joinPath(this.SHARED, 'prompts');
  }
};

/**
 * Get relative path patterns for display purposes
 */
export const AI_LEY_DISPLAY_PATHS = {
  GLOBAL_INSTRUCTIONS: '.ai-ley/shared/global-instructions.md',
  INSTRUCTIONS: '.ai-ley/shared/instructions/**/*.md',
  PERSONAS: '.ai-ley/shared/personas/**/*.md',
  VARIABLES: '.ai-ley/shared/variables/*.json',
  UML_FLOWS_USER: '.ai-ley/shared/uml-flows/user/',
  FLOWS: '.ai-ley/shared/flows/',
  FLOWS_BACKUP: '.ai-ley/shared/flows/backup/',
  PROMPTS: '.ai-ley/shared/prompts/'
};