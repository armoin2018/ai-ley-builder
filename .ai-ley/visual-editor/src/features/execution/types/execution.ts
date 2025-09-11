export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  nodes: any[];
  edges: any[];
  startTime: Date;
  status: ExecutionStatus;
  variables: Record<string, any>;
  outputs: Record<string, any>;
  errors: ExecutionError[];
  metadata: ExecutionMetadata;
}

export interface ExecutionMetadata {
  totalNodes: number;
  executedNodes: number;
  failedNodes: number;
  skippedNodes: number;
  duration?: number;
  memoryUsage?: number;
}

export const ExecutionStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  PAUSED: 'paused',
} as const;

export type ExecutionStatus =
  (typeof ExecutionStatus)[keyof typeof ExecutionStatus];

export interface ExecutionError {
  id: string;
  nodeId: string;
  message: string;
  type: ExecutionErrorType;
  timestamp: Date;
  stack?: string;
  context?: any;
}

export const ExecutionErrorType = {
  RUNTIME_ERROR: 'runtime_error',
  VALIDATION_ERROR: 'validation_error',
  CONNECTION_ERROR: 'connection_error',
  TIMEOUT_ERROR: 'timeout_error',
  MEMORY_ERROR: 'memory_error',
  TYPE_ERROR: 'type_error',
} as const;

export type ExecutionErrorType =
  (typeof ExecutionErrorType)[keyof typeof ExecutionErrorType];

export interface NodeExecutionState {
  nodeId: string;
  status: NodeExecutionStatus;
  input?: any;
  output?: any;
  error?: ExecutionError;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export const NodeExecutionStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
} as const;

export type NodeExecutionStatus =
  (typeof NodeExecutionStatus)[keyof typeof NodeExecutionStatus];

export interface ExecutionResult {
  success: boolean;
  context: ExecutionContext;
  nodeStates: Record<string, NodeExecutionState>;
  finalOutputs: Record<string, any>;
  executionTime: number;
}

export interface ExecutionOptions {
  timeout?: number;
  maxMemory?: number;
  debug?: boolean;
  stepMode?: boolean;
  breakpoints?: string[];
  variables?: Record<string, any>;
}

export interface NodeExecutor {
  nodeType: string;
  execute: (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => Promise<any>;
  validate?: (node: any) => boolean;
  timeout?: number;
}

export interface ExecutionEvent {
  type: ExecutionEventType;
  executionId: string;
  nodeId?: string;
  timestamp: Date;
  data?: any;
}

export const ExecutionEventType = {
  EXECUTION_STARTED: 'execution_started',
  EXECUTION_COMPLETED: 'execution_completed',
  EXECUTION_FAILED: 'execution_failed',
  EXECUTION_CANCELLED: 'execution_cancelled',
  NODE_STARTED: 'node_started',
  NODE_COMPLETED: 'node_completed',
  NODE_FAILED: 'node_failed',
  NODE_SKIPPED: 'node_skipped',
  DATA_FLOW: 'data_flow',
  BREAKPOINT_HIT: 'breakpoint_hit',
} as const;

export type ExecutionEventType =
  (typeof ExecutionEventType)[keyof typeof ExecutionEventType];

export interface ExecutionPlan {
  executionOrder: string[];
  dependencies: Record<string, string[]>;
  parallelGroups: string[][];
  entryPoints: string[];
  exitPoints: string[];
}

export interface DataFlowEvent {
  fromNodeId: string;
  toNodeId: string;
  fromHandle: string;
  toHandle: string;
  data: any;
  timestamp: Date;
}
