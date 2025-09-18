import type { LocalAITool } from '../types/settings';
import { SettingsService } from './settingsService';

export interface AICliRequest {
  toolId: string;
  prompt: string;
  model?: string;
  additionalArgs?: string[];
}

export interface AICliResponse {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
  toolUsed: string;
}

export interface AICliExecutionOptions {
  timeout?: number;
  onProgress?: (data: string) => void;
  signal?: AbortSignal;
}

export class AICliService {
  private static isNodeEnvironment(): boolean {
    return typeof window === 'undefined' && typeof process !== 'undefined';
  }

  /**
   * Get all available AI CLI tools from settings
   */
  static getAvailableTools(): LocalAITool[] {
    const settings = SettingsService.loadSettings();
    return settings.localAI.tools.filter(tool => tool.enabled);
  }

  /**
   * Get a specific AI CLI tool by ID
   */
  static getTool(toolId: string): LocalAITool | null {
    const tools = this.getAvailableTools();
    return tools.find(tool => tool.id === toolId) || null;
  }

  /**
   * Get the default AI CLI tool
   */
  static getDefaultTool(): LocalAITool | null {
    const settings = SettingsService.loadSettings();
    const defaultToolId = settings.localAI.defaultTool;

    if (defaultToolId) {
      return this.getTool(defaultToolId);
    }

    // Fallback to first enabled tool
    const availableTools = this.getAvailableTools();
    return availableTools.length > 0 ? availableTools[0] : null;
  }

  /**
   * Execute AI CLI tool with prompt
   */
  static async executeCommand(
    request: AICliRequest,
    options: AICliExecutionOptions = {}
  ): Promise<AICliResponse> {
    const startTime = Date.now();

    try {
      // Validate tool exists and is enabled
      const tool = this.getTool(request.toolId);
      if (!tool) {
        throw new Error(`AI CLI tool '${request.toolId}' not found or not enabled`);
      }

      // In browser environment, we can't execute CLI commands directly
      if (!this.isNodeEnvironment()) {
        return this.simulateExecution(tool, request, startTime);
      }

      // Build command arguments
      const args = this.buildCommandArgs(tool, request);

      // Execute the command
      const result = await this.executeCliCommand(
        tool.command,
        args,
        request.prompt,
        options
      );

      return {
        success: true,
        output: result.output,
        executionTime: Date.now() - startTime,
        toolUsed: tool.name,
      };

    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: Date.now() - startTime,
        toolUsed: request.toolId,
      };
    }
  }

  /**
   * Test connection to an AI CLI tool
   */
  static async testTool(toolId: string): Promise<{
    success: boolean;
    message: string;
    version?: string;
  }> {
    try {
      const tool = this.getTool(toolId);
      if (!tool) {
        return {
          success: false,
          message: `Tool '${toolId}' not found or not enabled`,
        };
      }

      if (!this.isNodeEnvironment()) {
        return {
          success: true,
          message: `Tool '${tool.name}' is configured (browser simulation mode)`,
          version: 'simulation',
        };
      }

      // Test basic command availability
      const testResult = await this.executeCliCommand(
        tool.command,
        ['--version'],
        '',
        { timeout: 5000 }
      );

      return {
        success: true,
        message: `Tool '${tool.name}' is available`,
        version: testResult.output.trim(),
      };

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
      };
    }
  }

  /**
   * Get usage statistics for AI CLI tools
   */
  static getUsageStats(): {
    toolId: string;
    toolName: string;
    totalCalls: number;
    successfulCalls: number;
    averageExecutionTime: number;
    lastUsed: Date | null;
  }[] {
    const stats = localStorage.getItem('ai-cli-usage-stats');
    if (!stats) return [];

    try {
      const parsed = JSON.parse(stats);
      return Object.entries(parsed).map(([toolId, data]: [string, any]) => ({
        toolId,
        toolName: data.toolName || toolId,
        totalCalls: data.totalCalls || 0,
        successfulCalls: data.successfulCalls || 0,
        averageExecutionTime: data.averageExecutionTime || 0,
        lastUsed: data.lastUsed ? new Date(data.lastUsed) : null,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Record usage statistics
   */
  private static recordUsage(
    toolId: string,
    toolName: string,
    success: boolean,
    executionTime: number
  ): void {
    try {
      const statsKey = 'ai-cli-usage-stats';
      const existingStats = JSON.parse(localStorage.getItem(statsKey) || '{}');

      const toolStats = existingStats[toolId] || {
        toolName,
        totalCalls: 0,
        successfulCalls: 0,
        totalExecutionTime: 0,
        lastUsed: null,
      };

      toolStats.totalCalls += 1;
      if (success) {
        toolStats.successfulCalls += 1;
      }
      toolStats.totalExecutionTime += executionTime;
      toolStats.averageExecutionTime = toolStats.totalExecutionTime / toolStats.totalCalls;
      toolStats.lastUsed = new Date().toISOString();

      existingStats[toolId] = toolStats;
      localStorage.setItem(statsKey, JSON.stringify(existingStats));
    } catch (error) {
      console.warn('Failed to record AI CLI usage stats:', error);
    }
  }

  /**
   * Build command arguments for the AI tool
   */
  private static buildCommandArgs(tool: LocalAITool, request: AICliRequest): string[] {
    const args = [...tool.args];

    // Add model if specified and tool supports it
    if (request.model && this.toolSupportsModel(tool)) {
      args.push(request.model);
    }

    // Add any additional arguments
    if (request.additionalArgs) {
      args.push(...request.additionalArgs);
    }

    return args;
  }

  /**
   * Check if tool supports model specification
   */
  private static toolSupportsModel(tool: LocalAITool): boolean {
    // Common patterns for tools that support model specification
    const modelSupportingTools = ['ollama', 'llama', 'gpt4all'];
    return modelSupportingTools.some(pattern =>
      tool.command.toLowerCase().includes(pattern) ||
      tool.name.toLowerCase().includes(pattern)
    );
  }

  /**
   * Execute CLI command in Node.js environment
   */
  private static async executeCliCommand(
    command: string,
    args: string[],
    prompt: string,
    options: AICliExecutionOptions
  ): Promise<{ output: string }> {
    // This would only work in a Node.js environment
    // In the browser, this method won't be called
    const { spawn } = require('child_process');
    const settings = SettingsService.loadSettings();
    const timeout = options.timeout || settings.localAI.timeout * 1000;

    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      // Set up timeout
      const timeoutId = setTimeout(() => {
        process.kill('SIGTERM');
        reject(new Error(`Command timed out after ${timeout}ms`));
      }, timeout);

      // Handle abort signal
      if (options.signal) {
        options.signal.addEventListener('abort', () => {
          process.kill('SIGTERM');
          reject(new Error('Command aborted'));
        });
      }

      // Collect output
      process.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        output += chunk;
        options.onProgress?.(chunk);
      });

      process.stderr?.on('data', (data: Buffer) => {
        errorOutput += data.toString();
      });

      // Handle process completion
      process.on('close', (code: number) => {
        clearTimeout(timeoutId);

        if (code === 0) {
          resolve({ output });
        } else {
          reject(new Error(`Command failed with code ${code}: ${errorOutput}`));
        }
      });

      process.on('error', (error: Error) => {
        clearTimeout(timeoutId);
        reject(error);
      });

      // Send prompt to stdin
      if (prompt) {
        process.stdin?.write(prompt);
        process.stdin?.end();
      }
    });
  }

  /**
   * Simulate execution in browser environment
   */
  private static async simulateExecution(
    tool: LocalAITool,
    request: AICliRequest,
    startTime: number
  ): Promise<AICliResponse> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

    const executionTime = Date.now() - startTime;
    this.recordUsage(tool.id, tool.name, true, executionTime);

    return {
      success: true,
      output: `[SIMULATION] ${tool.name} response to: "${request.prompt.substring(0, 50)}${request.prompt.length > 50 ? '...' : ''}"\n\nThis is a simulated response. In a Node.js environment, this would execute the actual CLI command: ${tool.command} ${tool.args.join(' ')}`,
      executionTime,
      toolUsed: tool.name,
    };
  }

  /**
   * Get formatted tool list for UI display
   */
  static getToolsForDisplay(): Array<{
    id: string;
    name: string;
    description: string;
    isAvailable: boolean;
    lastUsed: Date | null;
  }> {
    const tools = this.getAvailableTools();
    const stats = this.getUsageStats();
    const statsMap = new Map(stats.map(s => [s.toolId, s]));

    return tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description || `${tool.command} ${tool.args.join(' ')}`,
      isAvailable: tool.enabled,
      lastUsed: statsMap.get(tool.id)?.lastUsed || null,
    }));
  }

  /**
   * Clear usage statistics
   */
  static clearUsageStats(): void {
    localStorage.removeItem('ai-cli-usage-stats');
  }
}