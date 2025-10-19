/**
 * Type for window object with custom AI-LEY properties
 */
interface WindowWithAILey extends Window {
  __AI_LEY_GIT_ROOT__?: string;
}

/**
 * Get the git root directory path using git rev-parse --show-toplevel
 * Environment variable is automatically set by build scripts using: git rev-parse --show-toplevel
 */
export const getGitRoot = (): string => {
  // Check if we have a runtime environment variable for the git root
  if (typeof window !== 'undefined') {
    const aiLeyWindow = window as WindowWithAILey;
    if (aiLeyWindow.__AI_LEY_GIT_ROOT__) {
      return normalizePathSeparators(aiLeyWindow.__AI_LEY_GIT_ROOT__);
    }
  }

  // Primary source: Vite environment variable set from git rev-parse --show-toplevel
  if (import.meta.env?.VITE_AI_LEY_GIT_ROOT) {
    const gitRoot = import.meta.env.VITE_AI_LEY_GIT_ROOT as string;
    return normalizePathSeparators(gitRoot);
  }

  // Fallback: Use current working directory as detected root instead of relative traversal
  // This prevents path traversal while providing a safe default
  if (typeof window !== 'undefined' && window.location) {
    // In browser environment, use the origin as base
    const origin = window.location.origin;
    console.warn('Using window.location.origin as fallback git root:', origin);
    return origin;
  }

  // Last resort fallback - but log warning about security implications
  console.warn(
    'Using relative path fallback - consider setting VITE_AI_LEY_GIT_ROOT environment variable'
  );
  return '../../';
};

/**
 * Normalize path separators for cross-platform compatibility
 */
const normalizePathSeparators = (path: string): string => {
  return path.replace(/\\/g, '/');
};

/**
 * Validate that a path is within the project root (security check)
 */
export const isPathWithinRoot = (path: string, root: string): boolean => {
  const normalizedPath = normalizePathSeparators(path);
  const normalizedRoot = normalizePathSeparators(root);

  // Check for path traversal attempts
  if (normalizedPath.includes('../') || normalizedPath.includes('..\\')) {
    return false;
  }

  // Ensure path starts with root or is relative within root
  return (
    normalizedPath.startsWith(normalizedRoot) || !normalizedPath.startsWith('/')
  );
};

/**
 * Get the .ai-ley root directory path with proper path separator
 */
export const getAiLeyRoot = (): string => {
  const gitRoot = getGitRoot();
  return joinPath(gitRoot, '.ai-ley');
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
  },
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
  PROMPTS: '.ai-ley/shared/prompts/',
};
