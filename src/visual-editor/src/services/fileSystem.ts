// File system services for personas and instructions
// Handles scanning and loading files from AI-LEY shared directories using dynamic git root

import { AI_LEY_PATHS } from '../utils/paths';

export interface PersonaFile {
  id: string;
  name: string;
  path: string;
  content: string;
  lastModified: Date;
}

export interface InstructionFile {
  id: string;
  name: string;
  path: string;
  content: string;
  lastModified: Date;
}

export class FileSystemService {
  private static get PERSONAS_DIR() {
    return AI_LEY_PATHS.PERSONAS;
  }
  private static get INSTRUCTIONS_DIR() {
    return AI_LEY_PATHS.INSTRUCTIONS;
  }

  /**
   * Get all available persona files
   */
  static async getPersonaFiles(): Promise<PersonaFile[]> {
    try {
      // In a browser environment, we'll simulate with localStorage or provide empty array
      // In production, this would integrate with the file system API
      const stored = localStorage.getItem('ai-ley-personas');
      if (stored) {
        return JSON.parse(stored);
      }

      // Default personas if none found
      return [
        {
          id: 'default-assistant',
          name: 'Default Assistant',
          path: `${this.PERSONAS_DIR}default-assistant.md`,
          content:
            'You are a helpful AI assistant that provides clear, accurate, and concise responses.',
          lastModified: new Date(),
        },
        {
          id: 'code-reviewer',
          name: 'Code Reviewer',
          path: `${this.PERSONAS_DIR}code-reviewer.md`,
          content:
            'You are an experienced software engineer focused on code quality, best practices, and identifying potential issues.',
          lastModified: new Date(),
        },
        {
          id: 'technical-writer',
          name: 'Technical Writer',
          path: `${this.PERSONAS_DIR}technical-writer.md`,
          content:
            'You are a technical writer who creates clear, comprehensive documentation and explanations.',
          lastModified: new Date(),
        },
      ];
    } catch (error) {
      console.error('Error loading persona files:', error);
      return [];
    }
  }

  /**
   * Get all available instruction files
   */
  static async getInstructionFiles(): Promise<InstructionFile[]> {
    try {
      // In a browser environment, we'll simulate with localStorage or provide empty array
      const stored = localStorage.getItem('ai-ley-instructions');
      if (stored) {
        return JSON.parse(stored);
      }

      // Default instructions if none found
      return [
        {
          id: 'analyze-code',
          name: 'Analyze Code',
          path: `${this.INSTRUCTIONS_DIR}analyze-code.md`,
          content:
            'Analyze the provided code for potential issues, improvements, and best practices.',
          lastModified: new Date(),
        },
        {
          id: 'write-tests',
          name: 'Write Tests',
          path: `${this.INSTRUCTIONS_DIR}write-tests.md`,
          content:
            'Write comprehensive unit tests for the provided code using appropriate testing frameworks.',
          lastModified: new Date(),
        },
        {
          id: 'optimize-performance',
          name: 'Optimize Performance',
          path: `${this.INSTRUCTIONS_DIR}optimize-performance.md`,
          content:
            'Review and suggest performance optimizations for the provided code.',
          lastModified: new Date(),
        },
        {
          id: 'refactor-clean',
          name: 'Refactor & Clean',
          path: `${this.INSTRUCTIONS_DIR}refactor-clean.md`,
          content:
            'Refactor the code to improve readability, maintainability, and follow clean code principles.',
          lastModified: new Date(),
        },
      ];
    } catch (error) {
      console.error('Error loading instruction files:', error);
      return [];
    }
  }

  /**
   * Get persona file by ID
   */
  static async getPersonaById(id: string): Promise<PersonaFile | null> {
    const personas = await this.getPersonaFiles();
    return personas.find(p => p.id === id) || null;
  }

  /**
   * Get instruction file by ID
   */
  static async getInstructionById(id: string): Promise<InstructionFile | null> {
    const instructions = await this.getInstructionFiles();
    return instructions.find(i => i.id === id) || null;
  }

  /**
   * Save persona files to storage (browser environment)
   */
  static async savePersonaFiles(personas: PersonaFile[]): Promise<void> {
    try {
      localStorage.setItem('ai-ley-personas', JSON.stringify(personas));
    } catch (error) {
      console.error('Error saving persona files:', error);
      throw error;
    }
  }

  /**
   * Save instruction files to storage (browser environment)
   */
  static async saveInstructionFiles(
    instructions: InstructionFile[]
  ): Promise<void> {
    try {
      localStorage.setItem('ai-ley-instructions', JSON.stringify(instructions));
    } catch (error) {
      console.error('Error saving instruction files:', error);
      throw error;
    }
  }

  /**
   * Create a new persona file
   */
  static async createPersonaFile(
    name: string,
    content: string
  ): Promise<PersonaFile> {
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const persona: PersonaFile = {
      id,
      name,
      path: `${this.PERSONAS_DIR}${id}.md`,
      content,
      lastModified: new Date(),
    };

    const personas = await this.getPersonaFiles();
    personas.push(persona);
    await this.savePersonaFiles(personas);

    return persona;
  }

  /**
   * Create a new instruction file
   */
  static async createInstructionFile(
    name: string,
    content: string
  ): Promise<InstructionFile> {
    const id = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const instruction: InstructionFile = {
      id,
      name,
      path: `${this.INSTRUCTIONS_DIR}${id}.md`,
      content,
      lastModified: new Date(),
    };

    const instructions = await this.getInstructionFiles();
    instructions.push(instruction);
    await this.saveInstructionFiles(instructions);

    return instruction;
  }

  /**
   * Update existing persona file
   */
  static async updatePersonaFile(
    id: string,
    updates: Partial<Pick<PersonaFile, 'name' | 'content'>>
  ): Promise<PersonaFile | null> {
    const personas = await this.getPersonaFiles();
    const index = personas.findIndex(p => p.id === id);

    if (index === -1) {
      return null;
    }

    personas[index] = {
      ...personas[index],
      ...updates,
      lastModified: new Date(),
    };

    await this.savePersonaFiles(personas);
    return personas[index];
  }

  /**
   * Update existing instruction file
   */
  static async updateInstructionFile(
    id: string,
    updates: Partial<Pick<InstructionFile, 'name' | 'content'>>
  ): Promise<InstructionFile | null> {
    const instructions = await this.getInstructionFiles();
    const index = instructions.findIndex(i => i.id === id);

    if (index === -1) {
      return null;
    }

    instructions[index] = {
      ...instructions[index],
      ...updates,
      lastModified: new Date(),
    };

    await this.saveInstructionFiles(instructions);
    return instructions[index];
  }

  /**
   * Delete persona file
   */
  static async deletePersonaFile(id: string): Promise<boolean> {
    const personas = await this.getPersonaFiles();
    const filteredPersonas = personas.filter(p => p.id !== id);

    if (filteredPersonas.length === personas.length) {
      return false; // No file found
    }

    await this.savePersonaFiles(filteredPersonas);
    return true;
  }

  /**
   * Delete instruction file
   */
  static async deleteInstructionFile(id: string): Promise<boolean> {
    const instructions = await this.getInstructionFiles();
    const filteredInstructions = instructions.filter(i => i.id !== id);

    if (filteredInstructions.length === instructions.length) {
      return false; // No file found
    }

    await this.saveInstructionFiles(filteredInstructions);
    return true;
  }
}
