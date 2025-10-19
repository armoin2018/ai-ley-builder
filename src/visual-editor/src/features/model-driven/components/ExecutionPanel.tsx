/**
 * Execution panel for running model-driven workflows
 */

import { useCallback, useState } from 'react';
import {
  type AIServiceConfig,
  type ExecutionContext,
  type ExecutionOptions,
  executionService,
  type FlowExecutionResult,
} from '../services/executionService';
import type { FlowModel } from '../types';

interface ExecutionPanelProps {
  flow: FlowModel | null;
  className?: string;
}

export function ExecutionPanel({ flow, className = '' }: ExecutionPanelProps) {
  const [result, setResult] = useState<FlowExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionContext, setExecutionContext] =
    useState<ExecutionContext | null>(null);
  const [options, setOptions] = useState<ExecutionOptions>({
    timeout: 30000,
    retryCount: 1,
    parallelExecution: false,
    validateInputs: true,
    debugMode: false,
    variables: {},
  });
  const [aiConfig, setAiConfig] = useState<AIServiceConfig>({
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 1000,
  });
  const [variables, setVariables] = useState('{}');
  const [activeTab, setActiveTab] = useState<
    'config' | 'variables' | 'results'
  >('config');

  const executeFlow = useCallback(async () => {
    if (!flow) return;

    setIsExecuting(true);
    setResult(null);
    setExecutionContext(null);

    try {
      // Parse variables
      let parsedVariables = {};
      try {
        parsedVariables = JSON.parse(variables);
      } catch (error) {
        console.warn('Invalid variables JSON, using empty object');
      }

      // Configure AI service
      executionService.configureAI(aiConfig);

      // Execute flow
      const executionResult = await executionService.executeFlow(flow, {
        ...options,
        variables: parsedVariables,
      });

      setResult(executionResult);
    } catch (error) {
      console.error('Execution failed:', error);
      const errorResult: FlowExecutionResult = {
        flowId: flow.id,
        sessionId: 'error',
        status: 'error',
        nodeResults: new Map(),
        totalExecutionTime: 0,
        startTime: new Date(),
        endTime: new Date(),
        error:
          error instanceof Error ? error.message : 'Unknown execution error',
        warnings: [],
      };
      setResult(errorResult);
    } finally {
      setIsExecuting(false);
    }
  }, [flow, options, aiConfig, variables]);

  const stopExecution = useCallback(() => {
    if (executionContext) {
      const stopped = executionService.stopExecution(
        executionContext.sessionId
      );
      if (stopped) {
        setIsExecuting(false);
      }
    }
  }, [executionContext]);

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!flow) {
    return (
      <div
        className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}
      >
        <div className="text-gray-500">
          <svg
            className="mx-auto h-12 w-12 mb-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <p className="text-lg font-medium">No Flow Selected</p>
          <p className="text-sm">Select a flow to execute</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Flow Execution
            </h3>
            <p className="text-sm text-gray-500">
              Flow: {flow.name} ({flow.nodes.length} nodes)
            </p>
          </div>
          <div className="flex space-x-2">
            {isExecuting ? (
              <button
                onClick={stopExecution}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                Stop
              </button>
            ) : (
              <button
                onClick={executeFlow}
                disabled={!flow}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                Execute
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'config'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Configuration
          </button>
          <button
            onClick={() => setActiveTab('variables')}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'variables'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Variables
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'results'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Results
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'config' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Execution Options */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Execution Options
                </h4>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Timeout (ms)
                  </label>
                  <input
                    type="number"
                    value={options.timeout || 30000}
                    onChange={e =>
                      setOptions(prev => ({
                        ...prev,
                        timeout: parseInt(e.target.value),
                      }))
                    }
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Retry Count
                  </label>
                  <input
                    type="number"
                    value={options.retryCount || 1}
                    onChange={e =>
                      setOptions(prev => ({
                        ...prev,
                        retryCount: parseInt(e.target.value),
                      }))
                    }
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.parallelExecution}
                      onChange={e =>
                        setOptions(prev => ({
                          ...prev,
                          parallelExecution: e.target.checked,
                        }))
                      }
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-xs text-gray-700">
                      Parallel Execution
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.validateInputs}
                      onChange={e =>
                        setOptions(prev => ({
                          ...prev,
                          validateInputs: e.target.checked,
                        }))
                      }
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-xs text-gray-700">
                      Validate Inputs
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={options.debugMode}
                      onChange={e =>
                        setOptions(prev => ({
                          ...prev,
                          debugMode: e.target.checked,
                        }))
                      }
                      className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-xs text-gray-700">
                      Debug Mode
                    </span>
                  </label>
                </div>
              </div>

              {/* AI Configuration */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">
                  AI Configuration
                </h4>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <select
                    value={aiConfig.provider}
                    onChange={e =>
                      setAiConfig(prev => ({
                        ...prev,
                        provider: e.target.value as any,
                      }))
                    }
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="azure">Azure OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="local">Local Model</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={aiConfig.model || ''}
                    onChange={e =>
                      setAiConfig(prev => ({ ...prev, model: e.target.value }))
                    }
                    placeholder="gpt-4"
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Temperature
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={aiConfig.temperature || 0.7}
                    onChange={e =>
                      setAiConfig(prev => ({
                        ...prev,
                        temperature: parseFloat(e.target.value),
                      }))
                    }
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Max Tokens
                  </label>
                  <input
                    type="number"
                    value={aiConfig.maxTokens || 1000}
                    onChange={e =>
                      setAiConfig(prev => ({
                        ...prev,
                        maxTokens: parseInt(e.target.value),
                      }))
                    }
                    className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'variables' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Execution Variables (JSON)
              </label>
              <textarea
                value={variables}
                onChange={e => setVariables(e.target.value)}
                placeholder='{\n  "key": "value",\n  "number": 123\n}'
                rows={10}
                className="block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
              <p className="mt-1 text-xs text-gray-500">
                These variables will be available to all nodes during execution
              </p>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <div className="space-y-4">
            {isExecuting && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin h-4 w-4">
                  <svg fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <span className="text-sm">Executing flow...</span>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(result.status)}`}
                      >
                        {result.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Duration:
                      </span>
                      <span className="ml-2">
                        {formatDuration(result.totalExecutionTime)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Nodes:</span>
                      <span className="ml-2">{result.nodeResults.size}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Session:
                      </span>
                      <span className="ml-2 text-xs font-mono">
                        {result.sessionId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {result.error && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      Execution Error
                    </h4>
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">
                      Warnings
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {result.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Node Results */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Node Results
                  </h4>
                  <div className="space-y-3">
                    {Array.from(result.nodeResults.entries()).map(
                      ([nodeId, nodeResult]) => (
                        <div
                          key={nodeId}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">
                              {nodeId}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(nodeResult.status)}`}
                              >
                                {nodeResult.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDuration(nodeResult.executionTime)}
                              </span>
                            </div>
                          </div>

                          {nodeResult.error && (
                            <div className="mb-2 text-sm text-red-600">
                              Error: {nodeResult.error}
                            </div>
                          )}

                          {nodeResult.logs.length > 0 && (
                            <details className="mb-2">
                              <summary className="text-xs text-gray-600 cursor-pointer">
                                Logs ({nodeResult.logs.length})
                              </summary>
                              <div className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                {nodeResult.logs.map((log, index) => (
                                  <div key={index}>{log}</div>
                                ))}
                              </div>
                            </details>
                          )}

                          {Object.keys(nodeResult.output).length > 0 && (
                            <details>
                              <summary className="text-xs text-gray-600 cursor-pointer">
                                Output
                              </summary>
                              <pre className="mt-1 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto">
                                {JSON.stringify(nodeResult.output, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {!result && !isExecuting && (
              <div className="text-center text-gray-500 py-8">
                <p>Click "Execute" to run the flow</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
