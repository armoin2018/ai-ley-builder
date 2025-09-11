import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Play,
  RotateCcw,
  Settings,
  Square,
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
            <div className="p-4 space-y-3">
              {currentExecution ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Status:</span>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(currentExecution.status)
                      )}
                    >
                      {currentExecution.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Total Nodes:</span>
                      <div className="font-medium">
                        {currentExecution.metadata.totalNodes}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">Executed:</span>
                      <div className="font-medium text-green-600">
                        {currentExecution.metadata.executedNodes}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">Failed:</span>
                      <div className="font-medium text-red-600">
                        {currentExecution.metadata.failedNodes}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">Skipped:</span>
                      <div className="font-medium text-yellow-600">
                        {currentExecution.metadata.skippedNodes}
                      </div>
                    </div>
                  </div>

                  {currentExecution.metadata.duration && (
                    <div className="text-sm">
                      <span className="text-slate-600">Duration:</span>
                      <span className="ml-2 font-medium">
                        {currentExecution.metadata.duration}ms
                      </span>
                    </div>
                  )}
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

        {/* Node States */}
        {Object.keys(nodeStates).length > 0 && (
          <div className="border-b border-slate-200">
            <button
              onClick={() => toggleSection('nodes')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
            >
              <span className="font-medium">Nodes</span>
              {expandedSections.has('nodes') ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedSections.has('nodes') && (
              <div className="p-4 space-y-2">
                {Object.values(nodeStates).map(nodeState => (
                  <div
                    key={nodeState.nodeId}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded"
                  >
                    <span className="text-sm font-medium">
                      {nodeState.nodeId}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs',
                          getStatusColor(nodeState.status)
                        )}
                      >
                        {nodeState.status}
                      </span>
                      {nodeState.duration && (
                        <span className="text-xs text-slate-500">
                          {nodeState.duration}ms
                        </span>
                      )}
                    </div>
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
