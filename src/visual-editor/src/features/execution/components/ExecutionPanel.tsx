import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Square,
  XCircle,
  Zap,
} from 'lucide-react';
import { Button } from '../../../shared/components';
import { useExecution } from '../hooks/useExecution';
import {
  ExecutionEventType,
  ExecutionStatus,
  NodeExecutionStatus,
} from '../types/execution';
import { cn } from '../../../utils';

interface ExecutionPanelProps {
  nodes: any[];
  edges: any[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ExecutionPanel({
  nodes,
  edges,
  isOpen,
  onClose,
  className,
}: ExecutionPanelProps) {
  const {
    isExecuting,
    executionResult,
    currentExecution,
    nodeStates,
    executionLogs,
    executeWorkflow,
    cancelExecution,
    clearResults,
  } = useExecution({ debugMode: true });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['status', 'logs'])
  );
  const [executionSettings, setExecutionSettings] = useState({
    timeout: 30000,
    debug: true,
    stepMode: false,
  });
  const [variables] = useState<Record<string, any>>({});
  const [showSettings, setShowSettings] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionLogs]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleExecute = async () => {
    try {
      await executeWorkflow(nodes, edges, {
        timeout: executionSettings.timeout,
        debug: executionSettings.debug,
        stepMode: executionSettings.stepMode,
        variables,
      });
    } catch (error) {
      console.error('Execution failed:', error);
    }
  };

  const getStatusColor = (status?: ExecutionStatus | NodeExecutionStatus) => {
    switch (status) {
      case ExecutionStatus.RUNNING:
      case NodeExecutionStatus.RUNNING:
        return 'text-blue-600 bg-blue-50';
      case ExecutionStatus.COMPLETED:
      case NodeExecutionStatus.COMPLETED:
        return 'text-green-600 bg-green-50';
      case ExecutionStatus.FAILED:
      case NodeExecutionStatus.FAILED:
        return 'text-red-600 bg-red-50';
      case ExecutionStatus.CANCELLED:
        return 'text-gray-600 bg-gray-50';
      case NodeExecutionStatus.SKIPPED:
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getEventTypeColor = (type: ExecutionEventType) => {
    switch (type) {
      case ExecutionEventType.EXECUTION_STARTED:
      case ExecutionEventType.NODE_STARTED:
        return 'text-blue-600';
      case ExecutionEventType.EXECUTION_COMPLETED:
      case ExecutionEventType.NODE_COMPLETED:
        return 'text-green-600';
      case ExecutionEventType.EXECUTION_FAILED:
      case ExecutionEventType.NODE_FAILED:
        return 'text-red-600';
      case ExecutionEventType.DATA_FLOW:
        return 'text-purple-600';
      default:
        return 'text-slate-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-lg z-50 flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Play className="w-5 h-5 text-slate-600" />
          <h2 className="font-semibold text-slate-900">Execution</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-medium mb-3">Execution Settings</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Timeout (ms)
              </label>
              <input
                type="number"
                value={executionSettings.timeout}
                onChange={e =>
                  setExecutionSettings(prev => ({
                    ...prev,
                    timeout: parseInt(e.target.value) || 30000,
                  }))
                }
                className="w-full px-3 py-1 text-sm border border-slate-200 rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="debug"
                checked={executionSettings.debug}
                onChange={e =>
                  setExecutionSettings(prev => ({
                    ...prev,
                    debug: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <label htmlFor="debug" className="text-sm text-slate-700">
                Debug mode
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="stepMode"
                checked={executionSettings.stepMode}
                onChange={e =>
                  setExecutionSettings(prev => ({
                    ...prev,
                    stepMode: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <label htmlFor="stepMode" className="text-sm text-slate-700">
                Step mode
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleExecute}
            disabled={isExecuting || nodes.length === 0}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Execute
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={cancelExecution}
            disabled={!isExecuting}
            className="flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Stop
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={clearResults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {/* Execution Status */}
        <div className="border-b border-slate-200">
          <button
            onClick={() => toggleSection('status')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
          >
            <span className="font-medium">Status</span>
            {expandedSections.has('status') ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {expandedSections.has('status') && (
            <div className="p-4 space-y-4">
              {currentExecution ? (
                <>
                  {/* Status Header with Animation */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {currentExecution.status === ExecutionStatus.RUNNING && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                      <span className="text-sm text-slate-600">Status:</span>
                    </div>
                    <span
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-sm',
                        getStatusColor(currentExecution.status)
                      )}
                    >
                      {currentExecution.status === ExecutionStatus.RUNNING && (
                        <Zap className="w-3 h-3 animate-spin" />
                      )}
                      {currentExecution.status ===
                        ExecutionStatus.COMPLETED && (
                        <CheckCircle2 className="w-3 h-3" />
                      )}
                      {currentExecution.status === ExecutionStatus.FAILED && (
                        <XCircle className="w-3 h-3" />
                      )}
                      {currentExecution.status ===
                        ExecutionStatus.CANCELLED && (
                        <Pause className="w-3 h-3" />
                      )}
                      {currentExecution.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>Progress</span>
                      <span>
                        {currentExecution.metadata.executedNodes +
                          currentExecution.metadata.failedNodes}{' '}
                        / {currentExecution.metadata.totalNodes} nodes
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={cn(
                          'h-full transition-all duration-500 ease-out',
                          currentExecution.metadata.failedNodes > 0
                            ? 'bg-gradient-to-r from-green-500 to-red-500'
                            : 'bg-gradient-to-r from-blue-500 to-green-500'
                        )}
                        style={{
                          width: `${Math.min(100, ((currentExecution.metadata.executedNodes + currentExecution.metadata.failedNodes) / currentExecution.metadata.totalNodes) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Execution Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-green-700">
                          Completed
                        </span>
                      </div>
                      <div className="text-lg font-bold text-green-800">
                        {currentExecution.metadata.executedNodes}
                      </div>
                    </div>

                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <div className="flex items-center gap-2 mb-1">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-red-700">
                          Failed
                        </span>
                      </div>
                      <div className="text-lg font-bold text-red-800">
                        {currentExecution.metadata.failedNodes}
                      </div>
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Pause className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">
                          Skipped
                        </span>
                      </div>
                      <div className="text-lg font-bold text-amber-800">
                        {currentExecution.metadata.skippedNodes}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">
                          Total
                        </span>
                      </div>
                      <div className="text-lg font-bold text-slate-800">
                        {currentExecution.metadata.totalNodes}
                      </div>
                    </div>
                  </div>

                  {/* Duration with Real-time Update */}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">
                          Duration
                        </span>
                      </div>
                      <span className="text-sm font-mono font-bold text-blue-800">
                        {currentExecution.metadata.duration
                          ? `${currentExecution.metadata.duration}ms`
                          : `${Date.now() - new Date(currentExecution.startTime).getTime()}ms`}
                      </span>
                    </div>
                  </div>
                </>
              ) : executionResult ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Last Execution:
                    </span>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        executionResult.success
                          ? 'text-green-600 bg-green-50'
                          : 'text-red-600 bg-red-50'
                      )}
                    >
                      {executionResult.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">Time:</span>
                    <span className="ml-2 font-medium">
                      {executionResult.executionTime}ms
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 py-4">
                  No execution yet
                </div>
              )}
            </div>
          )}
        </div>

        {/* Node States with Enhanced Visualization */}
        {Object.keys(nodeStates).length > 0 && (
          <div className="border-b border-slate-200">
            <button
              onClick={() => toggleSection('nodes')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">Node Execution</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  {Object.keys(nodeStates).length}
                </span>
              </div>
              {expandedSections.has('nodes') ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedSections.has('nodes') && (
              <div className="p-4 space-y-3">
                {Object.values(nodeStates).map(nodeState => (
                  <div
                    key={nodeState.nodeId}
                    className={cn(
                      'p-3 rounded-lg border transition-all duration-200',
                      nodeState.status === NodeExecutionStatus.RUNNING
                        ? 'bg-blue-50 border-blue-200 shadow-sm'
                        : nodeState.status === NodeExecutionStatus.COMPLETED
                          ? 'bg-green-50 border-green-200'
                          : nodeState.status === NodeExecutionStatus.FAILED
                            ? 'bg-red-50 border-red-200'
                            : 'bg-slate-50 border-slate-200'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {nodeState.status === NodeExecutionStatus.RUNNING && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                        {nodeState.status === NodeExecutionStatus.COMPLETED && (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        )}
                        {nodeState.status === NodeExecutionStatus.FAILED && (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                        {nodeState.status === NodeExecutionStatus.SKIPPED && (
                          <Pause className="w-4 h-4 text-amber-600" />
                        )}
                        <span className="text-sm font-medium truncate max-w-48">
                          {nodeState.nodeId}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          getStatusColor(nodeState.status)
                        )}
                      >
                        {nodeState.status}
                      </span>
                    </div>

                    {(nodeState.duration ||
                      nodeState.output ||
                      nodeState.error) && (
                      <div className="space-y-2 text-xs">
                        {nodeState.duration && (
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-3 h-3" />
                            <span className="font-mono">
                              {nodeState.duration}ms
                            </span>
                          </div>
                        )}
                        {nodeState.output && (
                          <div className="bg-white p-2 rounded border border-slate-200">
                            <div className="text-slate-600 mb-1">Output:</div>
                            <pre className="text-slate-800 whitespace-pre-wrap font-mono text-xs max-h-20 overflow-y-auto">
                              {typeof nodeState.output === 'string'
                                ? nodeState.output
                                : JSON.stringify(nodeState.output, null, 2)}
                            </pre>
                          </div>
                        )}
                        {nodeState.error && (
                          <div className="bg-red-100 p-2 rounded border border-red-200">
                            <div className="text-red-700 mb-1">Error:</div>
                            <pre className="text-red-800 whitespace-pre-wrap font-mono text-xs">
                              {nodeState.error}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Outputs */}
        {executionResult?.finalOutputs &&
          Object.keys(executionResult.finalOutputs).length > 0 && (
            <div className="border-b border-slate-200">
              <button
                onClick={() => toggleSection('outputs')}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
              >
                <span className="font-medium">Outputs</span>
                {expandedSections.has('outputs') ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {expandedSections.has('outputs') && (
                <div className="p-4 space-y-2">
                  {Object.entries(executionResult.finalOutputs).map(
                    ([key, value]) => (
                      <div key={key} className="space-y-1">
                        <div className="text-sm font-medium text-slate-700">
                          {key}:
                        </div>
                        <pre className="text-xs bg-slate-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}

        {/* Execution Logs */}
        <div className="border-b border-slate-200">
          <button
            onClick={() => toggleSection('logs')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
          >
            <span className="font-medium">Logs ({executionLogs.length})</span>
            {expandedSections.has('logs') ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {expandedSections.has('logs') && (
            <div className="max-h-64 overflow-y-auto">
              {executionLogs.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  No logs yet
                </div>
              ) : (
                <div className="p-2">
                  {executionLogs.map((log, index) => (
                    <div
                      key={index}
                      className="mb-2 p-2 text-xs bg-slate-50 rounded"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={cn(
                            'font-medium',
                            getEventTypeColor(log.type)
                          )}
                        >
                          {log.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-500">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      {log.nodeId && (
                        <div className="text-slate-600 mb-1">
                          Node: {log.nodeId}
                        </div>
                      )}
                      {log.data && (
                        <pre className="text-slate-700 whitespace-pre-wrap">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-600">
          {isExecuting && 'Execution in progress...'}
          {!isExecuting &&
            executionResult &&
            `Last execution: ${executionResult.success ? 'Success' : 'Failed'}`}
          {!isExecuting && !executionResult && 'Ready to execute'}
        </div>
      </div>
    </div>
  );
}
