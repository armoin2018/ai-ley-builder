import {
  type ExecutionContext,
  type ExecutionError,
  ExecutionErrorType,
  type ExecutionEvent,
  ExecutionEventType,
  type ExecutionOptions,
  type ExecutionResult,
  ExecutionStatus,
  type NodeExecutionState,
  NodeExecutionStatus,
} from '../types/execution';
import { ExecutionPlanner } from './executionPlanner';
import { nodeExecutors } from '../executors/nodeExecutors';

export class ExecutionEngine {
  private eventListeners: Map<
    ExecutionEventType,
    Array<(event: ExecutionEvent) => void>
  > = new Map();
  private activeExecutions: Map<string, ExecutionContext> = new Map();
  private nodeStates: Map<string, Record<string, NodeExecutionState>> =
    new Map();

  /**
   * Execute a workflow with the given options
   */
  async executeWorkflow(
    nodes: any[],
    edges: any[],
    options: ExecutionOptions = {}
  ): Promise<ExecutionResult> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = new Date();

    // Create execution context
    const context: ExecutionContext = {
      workflowId: options.variables?.workflowId || 'unnamed',
      executionId,
      nodes,
      edges,
      startTime,
      status: ExecutionStatus.PENDING,
      variables: options.variables || {},
      outputs: {},
      errors: [],
      metadata: {
        totalNodes: nodes.length,
        executedNodes: 0,
        failedNodes: 0,
        skippedNodes: 0,
      },
    };

    this.activeExecutions.set(executionId, context);
    const nodeStates: Record<string, NodeExecutionState> = {};

    // Initialize node states
    nodes.forEach(node => {
      nodeStates[node.id] = {
        nodeId: node.id,
        status: NodeExecutionStatus.PENDING,
      };
    });

    this.nodeStates.set(executionId, nodeStates);

    try {
      // Create execution plan
      const plan = ExecutionPlanner.createExecutionPlan(nodes, edges);

      if (!ExecutionPlanner.validateExecutionPlan(plan, nodes)) {
        throw new Error('Invalid execution plan generated');
      }

      // Emit execution started event
      this.emitEvent({
        type: ExecutionEventType.EXECUTION_STARTED,
        executionId,
        timestamp: new Date(),
        data: { plan },
      });

      context.status = ExecutionStatus.RUNNING;

      // Execute workflow
      await this.executeWorkflowPlan(context, plan, nodeStates, options);

      // Determine final status
      const hasFailures = context.errors.length > 0;
      context.status = hasFailures
        ? ExecutionStatus.FAILED
        : ExecutionStatus.COMPLETED;

      // Calculate execution time
      const executionTime = Date.now() - startTime.getTime();
      context.metadata.duration = executionTime;

      // Emit completion event
      this.emitEvent({
        type: hasFailures
          ? ExecutionEventType.EXECUTION_FAILED
          : ExecutionEventType.EXECUTION_COMPLETED,
        executionId,
        timestamp: new Date(),
        data: {
          executionTime,
          errors: context.errors,
          outputs: context.outputs,
        },
      });

      return {
        success: !hasFailures,
        context,
        nodeStates,
        finalOutputs: context.outputs,
        executionTime,
      };
    } catch (error) {
      context.status = ExecutionStatus.FAILED;
      const executionError: ExecutionError = {
        id: `${executionId}_fatal`,
        nodeId: 'system',
        message:
          error instanceof Error ? error.message : 'Unknown execution error',
        type: ExecutionErrorType.RUNTIME_ERROR,
        timestamp: new Date(),
        stack: error instanceof Error ? error.stack : undefined,
      };

      context.errors.push(executionError);

      this.emitEvent({
        type: ExecutionEventType.EXECUTION_FAILED,
        executionId,
        timestamp: new Date(),
        data: { error: executionError },
      });

      return {
        success: false,
        context,
        nodeStates,
        finalOutputs: context.outputs,
        executionTime: Date.now() - startTime.getTime(),
      };
    } finally {
      this.activeExecutions.delete(executionId);
      this.nodeStates.delete(executionId);
    }
  }

  /**
   * Execute workflow according to the execution plan
   */
  private async executeWorkflowPlan(
    context: ExecutionContext,
    plan: any,
    nodeStates: Record<string, NodeExecutionState>,
    options: ExecutionOptions
  ): Promise<void> {
    const completedNodes = new Set<string>();
    const nodeOutputs: Record<string, any> = {};
    const maxConcurrent = 5; // Limit concurrent node executions

    while (completedNodes.size < context.nodes.length) {
      // Get next executable nodes
      const executableNodes = ExecutionPlanner.getExecutableNodes(
        plan,
        completedNodes
      );

      if (executableNodes.length === 0) {
        // No more nodes can be executed - check for remaining nodes
        const remainingNodes = context.nodes.filter(
          n => !completedNodes.has(n.id)
        );
        if (remainingNodes.length > 0) {
          // Skip remaining nodes that can't be executed due to missing dependencies
          remainingNodes.forEach(node => {
            nodeStates[node.id].status = NodeExecutionStatus.SKIPPED;
            completedNodes.add(node.id);
            context.metadata.skippedNodes++;
          });
        }
        break;
      }

      // Execute nodes in batches to limit concurrency
      const batches = this.createBatches(executableNodes, maxConcurrent);

      for (const batch of batches) {
        const promises = batch.map(nodeId =>
          this.executeNode(nodeId, context, nodeStates, nodeOutputs, options)
        );

        const results = await Promise.allSettled(promises);

        results.forEach((result, index) => {
          const nodeId = batch[index];
          if (result.status === 'fulfilled') {
            completedNodes.add(nodeId);
            context.metadata.executedNodes++;
          } else {
            completedNodes.add(nodeId); // Still mark as completed to avoid infinite loops
            context.metadata.failedNodes++;

            // Add execution error
            const error: ExecutionError = {
              id: `${nodeId}_execution_error`,
              nodeId,
              message:
                result.reason instanceof Error
                  ? result.reason.message
                  : 'Node execution failed',
              type: ExecutionErrorType.RUNTIME_ERROR,
              timestamp: new Date(),
            };
            context.errors.push(error);
          }
        });

        // Check for step mode or breakpoints
        if (
          options.stepMode ||
          (options.breakpoints &&
            batch.some(nodeId => options.breakpoints!.includes(nodeId)))
        ) {
          // In a real implementation, this would pause execution
          console.log('Breakpoint hit or step mode - execution paused');
        }
      }
    }
  }

  /**
   * Execute a single node
   */
  private async executeNode(
    nodeId: string,
    context: ExecutionContext,
    nodeStates: Record<string, NodeExecutionState>,
    nodeOutputs: Record<string, any>,
    options: ExecutionOptions
  ): Promise<void> {
    const node = context.nodes.find(n => n.id === nodeId);
    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    const nodeState = nodeStates[nodeId];
    nodeState.status = NodeExecutionStatus.RUNNING;
    nodeState.startTime = new Date();

    this.emitEvent({
      type: ExecutionEventType.NODE_STARTED,
      executionId: context.executionId,
      nodeId,
      timestamp: new Date(),
      data: { node },
    });

    try {
      // Get node executor
      const executor = nodeExecutors[node.type];
      if (!executor) {
        throw new Error(`No executor found for node type: ${node.type}`);
      }

      // Validate node if validator exists
      if (executor.validate && !executor.validate(node)) {
        throw new Error(`Node validation failed for ${nodeId}`);
      }

      // Gather inputs from connected nodes
      const inputs = await this.gatherNodeInputs(
        nodeId,
        context.edges,
        nodeOutputs
      );

      // Execute with timeout
      const timeout = options.timeout || executor.timeout || 30000;
      const result = await this.executeWithTimeout(
        executor.execute(node, inputs, context),
        timeout
      );

      // Store output
      nodeOutputs[nodeId] = result;
      nodeState.output = result;
      nodeState.status = NodeExecutionStatus.COMPLETED;
      nodeState.endTime = new Date();
      nodeState.duration =
        nodeState.endTime.getTime() - nodeState.startTime.getTime();

      // Emit data flow events for connected nodes
      this.emitDataFlowEvents(nodeId, result, context);

      this.emitEvent({
        type: ExecutionEventType.NODE_COMPLETED,
        executionId: context.executionId,
        nodeId,
        timestamp: new Date(),
        data: { result, duration: nodeState.duration },
      });
    } catch (error) {
      nodeState.status = NodeExecutionStatus.FAILED;
      nodeState.endTime = new Date();
      nodeState.duration =
        nodeState.endTime.getTime() - nodeState.startTime.getTime();

      const executionError: ExecutionError = {
        id: `${nodeId}_error`,
        nodeId,
        message: error instanceof Error ? error.message : 'Unknown error',
        type: ExecutionErrorType.RUNTIME_ERROR,
        timestamp: new Date(),
        stack: error instanceof Error ? error.stack : undefined,
      };

      nodeState.error = executionError;

      this.emitEvent({
        type: ExecutionEventType.NODE_FAILED,
        executionId: context.executionId,
        nodeId,
        timestamp: new Date(),
        data: { error: executionError },
      });

      throw error;
    }
  }

  /**
   * Gather inputs for a node from its connected predecessors
   */
  private async gatherNodeInputs(
    nodeId: string,
    edges: any[],
    nodeOutputs: Record<string, any>
  ): Promise<Record<string, any>> {
    const inputs: Record<string, any> = {};

    const incomingEdges = edges.filter(edge => edge.target === nodeId);

    for (const edge of incomingEdges) {
      const sourceOutput = nodeOutputs[edge.source];
      const targetHandle = edge.targetHandle || 'input';

      inputs[targetHandle] = sourceOutput;
    }

    return inputs;
  }

  /**
   * Execute a promise with timeout
   */
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Create batches for concurrent execution
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Emit data flow events
   */
  private emitDataFlowEvents(
    nodeId: string,
    output: any,
    context: ExecutionContext
  ): void {
    const outgoingEdges = context.edges.filter(edge => edge.source === nodeId);

    outgoingEdges.forEach(edge => {
      this.emitEvent({
        type: ExecutionEventType.DATA_FLOW,
        executionId: context.executionId,
        nodeId,
        timestamp: new Date(),
        data: {
          fromNodeId: edge.source,
          toNodeId: edge.target,
          fromHandle: edge.sourceHandle || 'output',
          toHandle: edge.targetHandle || 'input',
          data: output,
        },
      });
    });
  }

  /**
   * Add event listener
   */
  addEventListener(
    eventType: ExecutionEventType,
    listener: (event: ExecutionEvent) => void
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(
    eventType: ExecutionEventType,
    listener: (event: ExecutionEvent) => void
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(event: ExecutionEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in execution event listener:', error);
        }
      });
    }
  }

  /**
   * Cancel an active execution
   */
  cancelExecution(executionId: string): boolean {
    const context = this.activeExecutions.get(executionId);
    if (context) {
      context.status = ExecutionStatus.CANCELLED;

      this.emitEvent({
        type: ExecutionEventType.EXECUTION_CANCELLED,
        executionId,
        timestamp: new Date(),
      });

      return true;
    }
    return false;
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): ExecutionContext[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Get execution by ID
   */
  getExecution(executionId: string): ExecutionContext | undefined {
    return this.activeExecutions.get(executionId);
  }
}

// Export singleton instance
export const executionEngine = new ExecutionEngine();
