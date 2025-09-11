import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type ExecutionContext,
  type ExecutionEvent,
  ExecutionEventType,
  type ExecutionOptions,
  type ExecutionResult,
  type NodeExecutionState,
  NodeExecutionStatus,
} from '../types/execution';
import { executionEngine } from '../services/executionEngine';

export interface UseExecutionReturn {
  // Execution state
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
  currentExecution: ExecutionContext | null;
  nodeStates: Record<string, NodeExecutionState>;
  executionLogs: ExecutionEvent[];

  // Actions
  executeWorkflow: (
    nodes: any[],
    edges: any[],
    options?: ExecutionOptions
  ) => Promise<void>;
  cancelExecution: () => void;
  clearResults: () => void;

  // Configuration
  setExecutionOptions: (options: ExecutionOptions) => void;

  // Real-time data
  lastEvent: ExecutionEvent | null;
}

export interface UseExecutionOptions {
  autoScroll?: boolean;
  maxLogs?: number;
  debugMode?: boolean;
}

export function useExecution(
  options: UseExecutionOptions = {}
): UseExecutionReturn {
  const { autoScroll = true, maxLogs = 1000, debugMode = false } = options;

  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [currentExecution, setCurrentExecution] =
    useState<ExecutionContext | null>(null);
  const [nodeStates, setNodeStates] = useState<
    Record<string, NodeExecutionState>
  >({});
  const [executionLogs, setExecutionLogs] = useState<ExecutionEvent[]>([]);
  const [executionOptions, setExecutionOptions] = useState<ExecutionOptions>(
    {}
  );
  const [lastEvent, setLastEvent] = useState<ExecutionEvent | null>(null);

  const currentExecutionId = useRef<string | null>(null);

  // Event handler for execution events
  const handleExecutionEvent = useCallback(
    (event: ExecutionEvent) => {
      setLastEvent(event);

      // Add to logs with size limit
      setExecutionLogs(prev => {
        const newLogs = [...prev, event];
        return newLogs.length > maxLogs ? newLogs.slice(-maxLogs) : newLogs;
      });

      // Update current execution context
      if (event.executionId === currentExecutionId.current) {
        switch (event.type) {
          case ExecutionEventType.EXECUTION_STARTED:
            if (debugMode) {
              console.log('Execution started:', event);
            }
            break;

          case ExecutionEventType.NODE_STARTED:
            if (event.nodeId) {
              setNodeStates(prev => ({
                ...prev,
                [event.nodeId!]: {
                  ...prev[event.nodeId!],
                  status: NodeExecutionStatus.RUNNING,
                  startTime: event.timestamp,
                },
              }));
            }
            break;

          case ExecutionEventType.NODE_COMPLETED:
            if (event.nodeId) {
              setNodeStates(prev => ({
                ...prev,
                [event.nodeId!]: {
                  ...prev[event.nodeId!],
                  status: NodeExecutionStatus.COMPLETED,
                  endTime: event.timestamp,
                  output: event.data?.result,
                  duration: event.data?.duration,
                },
              }));
            }
            break;

          case ExecutionEventType.NODE_FAILED:
            if (event.nodeId) {
              setNodeStates(prev => ({
                ...prev,
                [event.nodeId!]: {
                  ...prev[event.nodeId!],
                  status: NodeExecutionStatus.FAILED,
                  endTime: event.timestamp,
                  error: event.data?.error,
                },
              }));
            }
            break;

          case ExecutionEventType.DATA_FLOW:
            if (debugMode) {
              console.log('Data flow:', event.data);
            }
            break;

          case ExecutionEventType.EXECUTION_COMPLETED:
            setIsExecuting(false);
            setCurrentExecution(null);
            currentExecutionId.current = null;
            if (debugMode) {
              console.log('Execution completed:', event.data);
            }
            break;

          case ExecutionEventType.EXECUTION_FAILED:
            setIsExecuting(false);
            setCurrentExecution(null);
            currentExecutionId.current = null;
            if (debugMode) {
              console.error('Execution failed:', event.data);
            }
            break;

          case ExecutionEventType.EXECUTION_CANCELLED:
            setIsExecuting(false);
            setCurrentExecution(null);
            currentExecutionId.current = null;
            if (debugMode) {
              console.log('Execution cancelled');
            }
            break;
        }
      }
    },
    [currentExecutionId, maxLogs, debugMode]
  );

  // Set up event listeners
  useEffect(() => {
    const eventTypes = Object.values(ExecutionEventType);

    eventTypes.forEach(eventType => {
      executionEngine.addEventListener(eventType, handleExecutionEvent);
    });

    return () => {
      eventTypes.forEach(eventType => {
        executionEngine.removeEventListener(eventType, handleExecutionEvent);
      });
    };
  }, [handleExecutionEvent]);

  // Execute workflow
  const executeWorkflow = useCallback(
    async (nodes: any[], edges: any[], options: ExecutionOptions = {}) => {
      if (isExecuting) {
        throw new Error('Another execution is already in progress');
      }

      setIsExecuting(true);
      setExecutionResult(null);
      setNodeStates({});
      setExecutionLogs([]);

      // Initialize node states
      const initialNodeStates: Record<string, NodeExecutionState> = {};
      nodes.forEach(node => {
        initialNodeStates[node.id] = {
          nodeId: node.id,
          status: NodeExecutionStatus.PENDING,
        };
      });
      setNodeStates(initialNodeStates);

      try {
        const mergedOptions = { ...executionOptions, ...options };

        const result = await executionEngine.executeWorkflow(
          nodes,
          edges,
          mergedOptions
        );
        currentExecutionId.current = result.context.executionId;

        setExecutionResult(result);
        setCurrentExecution(result.context);

        // Update final node states
        setNodeStates(result.nodeStates);
      } catch (error) {
        setIsExecuting(false);
        setCurrentExecution(null);
        currentExecutionId.current = null;

        if (debugMode) {
          console.error('Execution error:', error);
        }

        throw error;
      }
    },
    [isExecuting, executionOptions, debugMode]
  );

  // Cancel execution
  const cancelExecution = useCallback(() => {
    if (currentExecutionId.current) {
      const cancelled = executionEngine.cancelExecution(
        currentExecutionId.current
      );
      if (cancelled) {
        setIsExecuting(false);
        setCurrentExecution(null);
        currentExecutionId.current = null;
      }
    }
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    if (isExecuting) {
      cancelExecution();
    }

    setExecutionResult(null);
    setCurrentExecution(null);
    setNodeStates({});
    setExecutionLogs([]);
    setLastEvent(null);
    currentExecutionId.current = null;
  }, [isExecuting, cancelExecution]);

  // Auto-scroll functionality (could be used by UI components)
  useEffect(() => {
    if (autoScroll && lastEvent) {
      // In a real implementation, this could trigger scroll behavior
      // For now, we just log in debug mode
      if (debugMode) {
        console.log('Auto-scroll triggered for event:', lastEvent.type);
      }
    }
  }, [autoScroll, lastEvent, debugMode]);

  return {
    // State
    isExecuting,
    executionResult,
    currentExecution,
    nodeStates,
    executionLogs,
    lastEvent,

    // Actions
    executeWorkflow,
    cancelExecution,
    clearResults,
    setExecutionOptions,
  };
}
