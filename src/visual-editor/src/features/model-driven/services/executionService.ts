/**
 * Execution service for running model-driven workflows
 */

import type {
  FlowConnection,
  FlowModel,
  NodeInstance,
  NodeModel,
} from '../types';

export interface ExecutionContext {
  flowId: string;
  sessionId: string;
  variables: Record<string, unknown>;
  metadata: Record<string, unknown>;
  startTime: Date;
  status: 'running' | 'completed' | 'failed' | 'paused';
}

export interface NodeExecutionResult {
  nodeId: string;
  status: 'success' | 'error' | 'skipped';
  output: Record<string, unknown>;
  error?: string;
  executionTime: number;
  logs: string[];
}

export interface FlowExecutionResult {
  flowId: string;
  sessionId: string;
  status: 'success' | 'error' | 'partial';
  nodeResults: Map<string, NodeExecutionResult>;
  totalExecutionTime: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  warnings: string[];
}

export interface ExecutionOptions {
  timeout?: number;
  retryCount?: number;
  parallelExecution?: boolean;
  validateInputs?: boolean;
  debugMode?: boolean;
  variables?: Record<string, unknown>;
}

export interface AIServiceConfig {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  provider: 'openai' | 'azure' | 'anthropic' | 'local';
}

export class ExecutionService {
  private activeExecutions = new Map<string, ExecutionContext>();
  private aiConfig: AIServiceConfig = {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
  };

  /**
   * Execute a flow with the given options
   */
  async executeFlow(
    flow: FlowModel,
    options: ExecutionOptions = {}
  ): Promise<FlowExecutionResult> {
    const sessionId = this.generateSessionId();
    const startTime = new Date();

    const context: ExecutionContext = {
      flowId: flow.id,
      sessionId,
      variables: options.variables || {},
      metadata: {},
      startTime,
      status: 'running',
    };

    this.activeExecutions.set(sessionId, context);

    try {
      const result = await this.executeFlowInternal(flow, context, options);
      result.endTime = new Date();
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown execution error';
      return {
        flowId: flow.id,
        sessionId,
        status: 'error',
        nodeResults: new Map(),
        totalExecutionTime: Date.now() - startTime.getTime(),
        startTime,
        endTime: new Date(),
        error: errorMessage,
        warnings: [],
      };
    } finally {
      this.activeExecutions.delete(sessionId);
    }
  }

  /**
   * Execute a single node
   */
  async executeNode(
    node: NodeModel,
    inputs: Record<string, unknown>,
    context: ExecutionContext,
    options: ExecutionOptions = {}
  ): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const logs: string[] = [];

    try {
      if (options.debugMode) {
        logs.push(`Starting execution of node: ${node.name} (${node.type})`);
        logs.push(`Inputs: ${JSON.stringify(inputs)}`);
      }

      // Validate inputs
      if (options.validateInputs) {
        const validation = this.validateNodeInputs(node, inputs);
        if (!validation.isValid) {
          return {
            nodeId: node.id,
            status: 'error',
            output: {},
            error: `Input validation failed: ${validation.errors.join(', ')}`,
            executionTime: Date.now() - startTime,
            logs,
          };
        }
      }

      let output: Record<string, unknown> = {};

      // Execute based on node type
      switch (node.type) {
        case 'CommandPromptFile':
          output = await this.executeCommandPromptFile(node, inputs, context);
          break;
        case 'LogicCondition':
          output = await this.executeLogicCondition(node, inputs, context);
          break;
        case 'OutputType':
          output = await this.executeOutputType(node, inputs, context);
          break;
        case 'Loop':
          output = await this.executeLoop(node, inputs, context);
          break;
        case 'CustomPromptText':
          output = await this.executeCustomPromptText(node, inputs, context);
          break;
        case 'Persona':
          output = await this.executePersona(node, inputs, context);
          break;
        case 'Instruction':
          output = await this.executeInstruction(node, inputs, context);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      if (options.debugMode) {
        logs.push(`Node execution completed successfully`);
        logs.push(`Outputs: ${JSON.stringify(output)}`);
      }

      return {
        nodeId: node.id,
        status: 'success',
        output,
        executionTime: Date.now() - startTime,
        logs,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown node execution error';
      logs.push(`Node execution failed: ${errorMessage}`);

      return {
        nodeId: node.id,
        status: 'error',
        output: {},
        error: errorMessage,
        executionTime: Date.now() - startTime,
        logs,
      };
    }
  }

  /**
   * Configure AI service
   */
  configureAI(config: Partial<AIServiceConfig>) {
    this.aiConfig = { ...this.aiConfig, ...config };
  }

  /**
   * Get execution status
   */
  getExecutionStatus(sessionId: string): ExecutionContext | undefined {
    return this.activeExecutions.get(sessionId);
  }

  /**
   * Stop execution
   */
  stopExecution(sessionId: string): boolean {
    const context = this.activeExecutions.get(sessionId);
    if (context) {
      context.status = 'paused';
      return true;
    }
    return false;
  }

  private async executeFlowInternal(
    flow: FlowModel,
    context: ExecutionContext,
    options: ExecutionOptions
  ): Promise<FlowExecutionResult> {
    const nodeResults = new Map<string, NodeExecutionResult>();
    const warnings: string[] = [];
    const startTime = Date.now();

    // Build execution order
    const executionOrder = this.buildExecutionOrder(flow);
    if (executionOrder.length === 0) {
      warnings.push('No nodes to execute');
    }

    // Load node models (this would normally come from a registry)
    const nodeModels = await this.loadNodeModels(flow.nodes);

    // Execute nodes in order
    for (const nodeInstance of executionOrder) {
      const nodeModel = nodeModels.get(nodeInstance.nodeModelId);
      if (!nodeModel) {
        warnings.push(`Node model not found: ${nodeInstance.nodeModelId}`);
        continue;
      }

      // Get inputs from previous nodes
      const inputs = this.collectNodeInputs(
        nodeInstance,
        flow.connections,
        nodeResults,
        context
      );

      // Execute the node
      const result = await this.executeNode(
        nodeModel,
        inputs,
        context,
        options
      );
      nodeResults.set(nodeInstance.id, result);

      // Check if execution should continue
      if (result.status === 'error' && !options.retryCount) {
        return {
          flowId: flow.id,
          sessionId: context.sessionId,
          status: 'error',
          nodeResults,
          totalExecutionTime: Date.now() - startTime,
          startTime: context.startTime,
          error: `Execution stopped due to error in node ${nodeInstance.id}: ${result.error}`,
          warnings,
        };
      }
    }

    const totalExecutionTime = Date.now() - startTime;
    const hasErrors = Array.from(nodeResults.values()).some(
      r => r.status === 'error'
    );

    return {
      flowId: flow.id,
      sessionId: context.sessionId,
      status: hasErrors ? 'partial' : 'success',
      nodeResults,
      totalExecutionTime,
      startTime: context.startTime,
      warnings,
    };
  }

  private buildExecutionOrder(flow: FlowModel): NodeInstance[] {
    // Simple topological sort - in a real implementation, this would be more sophisticated
    const visited = new Set<string>();
    const order: NodeInstance[] = [];

    // For now, just return nodes in the order they appear
    // A real implementation would analyze connections to determine dependencies
    return flow.nodes.filter(node => !node.disabled);
  }

  private async loadNodeModels(
    nodes: NodeInstance[]
  ): Promise<Map<string, NodeModel>> {
    const models = new Map<string, NodeModel>();

    // In a real implementation, this would load from a registry or cache
    // For now, create mock node models based on the node model IDs
    for (const node of nodes) {
      const mockModel: NodeModel = {
        id: node.nodeModelId,
        type: node.nodeModelId as any, // This would be properly typed in a real implementation
        name: node.label || node.nodeModelId,
        description: `Mock model for ${node.nodeModelId}`,
        properties: {},
        inputs: [{ id: 'input', name: 'Input', type: 'any' }],
        outputs: [{ id: 'output', name: 'Output', type: 'any' }],
      };
      models.set(node.nodeModelId, mockModel);
    }

    return models;
  }

  private collectNodeInputs(
    nodeInstance: NodeInstance,
    connections: FlowConnection[],
    nodeResults: Map<string, NodeExecutionResult>,
    context: ExecutionContext
  ): Record<string, unknown> {
    const inputs: Record<string, unknown> = {};

    // Find incoming connections
    const incomingConnections = connections.filter(
      conn => conn.to.nodeId === nodeInstance.id
    );

    for (const connection of incomingConnections) {
      const sourceResult = nodeResults.get(connection.from.nodeId);
      if (sourceResult && sourceResult.status === 'success') {
        const outputValue = sourceResult.output[connection.from.outputId];
        inputs[connection.to.inputId] = outputValue;
      }
    }

    // Add context variables
    Object.assign(inputs, context.variables);

    // Add node configuration
    if (nodeInstance.config) {
      Object.assign(inputs, nodeInstance.config);
    }

    return inputs;
  }

  private validateNodeInputs(
    node: NodeModel,
    inputs: Record<string, unknown>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required inputs
    for (const input of node.inputs) {
      if (input.required && !(input.id in inputs)) {
        errors.push(`Required input missing: ${input.name}`);
      }
    }

    // Additional validation based on node.validation could be added here

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Node execution methods
  private async executeCommandPromptFile(
    node: NodeModel,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    // Execute command prompt file - this would integrate with actual file system
    const filePath =
      (inputs.filePath as string) || (node.properties.filePath as string);
    if (!filePath) {
      throw new Error('Command prompt file path not specified');
    }

    // Mock execution - in reality, this would read and execute the file
    return {
      output: `Executed command prompt file: ${filePath}`,
      success: true,
      filePath,
    };
  }

  private async executeLogicCondition(
    node: NodeModel,
    inputs: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const condition =
      (inputs.condition as string) || (node.properties.condition as string);
    if (!condition) {
      throw new Error('Logic condition not specified');
    }

    // Simple condition evaluation - in reality, this would be more sophisticated
    const result = this.evaluateCondition(condition, inputs);

    return {
      result,
      condition,
      evaluation: result ? 'true' : 'false',
    };
  }

  private async executeOutputType(
    node: NodeModel,
    inputs: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const outputType =
      (inputs.outputType as string) || (node.properties.outputType as string);
    const data = inputs.data;

    return {
      data,
      outputType,
      formatted: this.formatOutput(data, outputType),
    };
  }

  private async executeLoop(
    node: NodeModel,
    inputs: Record<string, unknown>,
    _context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const iterations =
      (inputs.iterations as number) ||
      (node.properties.iterations as number) ||
      1;
    const loopData = inputs.data;
    const results: unknown[] = [];

    for (let i = 0; i < iterations; i++) {
      // Mock loop execution
      results.push({ iteration: i, data: loopData });
    }

    return {
      results,
      iterations,
      completed: true,
    };
  }

  private async executeCustomPromptText(
    node: NodeModel,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const promptText =
      (inputs.promptText as string) || (node.properties.promptText as string);
    if (!promptText) {
      throw new Error('Custom prompt text not specified');
    }

    // Call AI service
    const response = await this.callAIService(promptText, inputs, context);

    return {
      prompt: promptText,
      response,
      model: this.aiConfig.model,
    };
  }

  private async executePersona(
    node: NodeModel,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const personaName =
      (inputs.personaName as string) || (node.properties.personaName as string);
    const message = inputs.message as string;

    if (!personaName) {
      throw new Error('Persona name not specified');
    }

    // Load persona configuration and apply it to AI service
    const response = await this.callAIServiceWithPersona(
      personaName,
      message,
      context
    );

    return {
      persona: personaName,
      message,
      response,
    };
  }

  private async executeInstruction(
    node: NodeModel,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<Record<string, unknown>> {
    const instruction =
      (inputs.instruction as string) || (node.properties.instruction as string);
    if (!instruction) {
      throw new Error('Instruction not specified');
    }

    // Execute instruction through AI service
    const response = await this.callAIService(instruction, inputs, context);

    return {
      instruction,
      response,
      executed: true,
    };
  }

  // Helper methods
  private generateSessionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private evaluateCondition(
    condition: string,
    inputs: Record<string, unknown>
  ): boolean {
    // Simple condition evaluation - in reality, this would use a proper expression parser
    try {
      // Replace input references in condition
      let evaluatedCondition = condition;
      for (const [key, value] of Object.entries(inputs)) {
        evaluatedCondition = evaluatedCondition.replace(
          new RegExp(`\\b${key}\\b`, 'g'),
          JSON.stringify(value)
        );
      }

      // For demo purposes, always return true
      // In reality, this would safely evaluate the expression
      return true;
    } catch {
      return false;
    }
  }

  private formatOutput(data: unknown, outputType?: string): string {
    switch (outputType) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'text':
        return String(data);
      case 'markdown':
        return `\`\`\`\n${JSON.stringify(data, null, 2)}\n\`\`\``;
      default:
        return String(data);
    }
  }

  private async callAIService(
    prompt: string,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): Promise<string> {
    // Mock AI service call - in reality, this would integrate with actual AI APIs
    const processedPrompt = this.processPromptTemplate(prompt, inputs, context);

    // Simulate AI response
    return `AI Response to: "${processedPrompt.substring(0, 50)}..." (Session: ${context.sessionId})`;
  }

  private async callAIServiceWithPersona(
    personaName: string,
    message: string,
    context: ExecutionContext
  ): Promise<string> {
    // Load persona configuration and apply to AI service
    const systemPrompt = await this.loadPersonaPrompt(personaName);
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}`;

    return this.callAIService(fullPrompt, {}, context);
  }

  private async loadPersonaPrompt(personaName: string): Promise<string> {
    // Mock persona loading - in reality, this would load from persona registry
    return `You are ${personaName}. Respond according to this persona's characteristics.`;
  }

  private processPromptTemplate(
    template: string,
    inputs: Record<string, unknown>,
    context: ExecutionContext
  ): string {
    let processed = template;

    // Replace input variables
    for (const [key, value] of Object.entries(inputs)) {
      processed = processed.replace(
        new RegExp(`{{${key}}}`, 'g'),
        String(value)
      );
    }

    // Replace context variables
    for (const [key, value] of Object.entries(context.variables)) {
      processed = processed.replace(
        new RegExp(`{{context.${key}}}`, 'g'),
        String(value)
      );
    }

    return processed;
  }
}

// Export singleton instance
export const executionService = new ExecutionService();
