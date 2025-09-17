/**
 * Service to manage prompt files and commands
 */

export interface PromptFile {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

// Actual prompt files from .ai-ley/shared/prompts directory
const ACTUAL_PROMPT_FILES = [
  'alias', 'ask', 'audit', 'bench', 'build-architecture', 'build-business-development',
  'build-design', 'build-flow', 'build-launch-plan', 'build-market-research',
  'build-marketing-strategy', 'build-plan', 'build-plan-run', 'build-registry',
  'build-requirements', 'build-revenue-projections', 'build-test-plan',
  'business-plan', 'document', 'evolve', 'extract-requirements', 'git-commit',
  'go-to-market', 'health-check', 'innovate', 'launch-builder', 'lean-canvas',
  'learn', 'new-feature', 'new-prompt', 'optimize', 'pitch-deck', 'plan',
  'repair-prompts', 'requirements', 'run', 'run-flow', 'run-next', 'run-plan',
  'update-instructions', 'update-personas'
];

// Auto-generate prompt metadata based on file names
const AVAILABLE_PROMPTS: PromptFile[] = ACTUAL_PROMPT_FILES.map(fileName => {
  // Categorize based on filename patterns
  let category = 'General';
  let description = `Execute the ${fileName.replace(/-/g, ' ')} prompt`;
  
  if (fileName.startsWith('build-')) {
    category = 'Building';
    description = `Build ${fileName.replace('build-', '').replace(/-/g, ' ')}`;
  } else if (['business-plan', 'lean-canvas', 'pitch-deck', 'go-to-market'].includes(fileName)) {
    category = 'Business';
  } else if (['audit', 'bench', 'health-check'].includes(fileName)) {
    category = 'Quality';
  } else if (['document', 'requirements', 'extract-requirements'].includes(fileName)) {
    category = 'Documentation';
  } else if (['new-feature', 'innovate', 'optimize', 'evolve'].includes(fileName)) {
    category = 'Development';
  } else if (['run', 'run-flow', 'run-next', 'run-plan', 'launch-builder'].includes(fileName)) {
    category = 'Execution';
  } else if (['new-prompt', 'update-personas', 'update-instructions', 'repair-prompts', 'alias'].includes(fileName)) {
    category = 'Utilities';
  } else if (['ask', 'plan'].includes(fileName)) {
    category = 'Core';
  } else if (fileName === 'learn') {
    category = 'Learning';
  } else if (fileName === 'git-commit') {
    category = 'Development';
    description = 'Generate Git commit messages';
  }

  return {
    id: fileName,
    name: fileName,
    displayName: fileName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    description,
    category
  };
});

export class PromptService {
  /**
   * Get all available prompts
   */
  static getAllPrompts(): PromptFile[] {
    return [...AVAILABLE_PROMPTS];
  }

  /**
   * Get prompts by category
   */
  static getPromptsByCategory(category: string): PromptFile[] {
    return AVAILABLE_PROMPTS.filter(prompt => prompt.category === category);
  }

  /**
   * Get all unique categories
   */
  static getCategories(): string[] {
    const categories = new Set(AVAILABLE_PROMPTS.map(prompt => prompt.category));
    return Array.from(categories).sort();
  }

  /**
   * Search prompts by name or description
   */
  static searchPrompts(query: string): PromptFile[] {
    const lowerQuery = query.toLowerCase();
    return AVAILABLE_PROMPTS.filter(prompt => 
      prompt.name.toLowerCase().includes(lowerQuery) ||
      prompt.displayName.toLowerCase().includes(lowerQuery) ||
      prompt.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get prompt by ID
   */
  static getPromptById(id: string): PromptFile | undefined {
    return AVAILABLE_PROMPTS.find(prompt => prompt.id === id);
  }

  /**
   * Get command palette entries for prompts
   */
  static getCommandPaletteEntries() {
    return AVAILABLE_PROMPTS.map(prompt => ({
      id: `prompt-${prompt.id}`,
      title: `Add ${prompt.displayName} Prompt`,
      description: prompt.description,
      category: 'Prompts',
      action: () => {
        console.log(`Adding ${prompt.displayName} prompt node`);
        // This would create a new command prompt file node with the selected prompt
      },
      keywords: ['prompt', 'add', 'node', ...prompt.name.split('-'), prompt.displayName.toLowerCase()],
    }));
  }
}