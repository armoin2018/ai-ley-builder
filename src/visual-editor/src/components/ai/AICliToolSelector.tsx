import {
    AlertCircle,
    Check,
    Clock,
    Play,
    Terminal,
    TestTube,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
    type AICliRequest,
    type AICliResponse,
    AICliService,
} from '../../services/aiCliService';
import { Button, Input, Label } from '../../shared/components';
import type { LocalAITool } from '../../types/settings';
import { cn } from '../../utils';

interface AICliToolSelectorProps {
  onExecute?: (response: AICliResponse) => void;
  className?: string;
  defaultPrompt?: string;
  showTestButton?: boolean;
}

export function AICliToolSelector({
  onExecute,
  className,
  defaultPrompt = '',
  showTestButton = true,
}: AICliToolSelectorProps) {
  const [availableTools, setAvailableTools] = useState<LocalAITool[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [model, setModel] = useState('');
  const [additionalArgs, setAdditionalArgs] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AICliResponse | null>(null);
  const [testResults, setTestResults] = useState<
    Map<string, { success: boolean; message: string }>
  >(new Map());

  // Load available tools
  useEffect(() => {
    const tools = AICliService.getAvailableTools();
    setAvailableTools(tools);

    // Set default tool
    const defaultTool = AICliService.getDefaultTool();
    if (defaultTool && !selectedTool) {
      setSelectedTool(defaultTool.id);
    }
  }, [selectedTool]);

  // Update prompt when defaultPrompt changes
  useEffect(() => {
    setPrompt(defaultPrompt);
  }, [defaultPrompt]);

  const handleExecute = async () => {
    if (!selectedTool || !prompt.trim()) return;

    setIsExecuting(true);
    setLastResponse(null);

    try {
      const request: AICliRequest = {
        toolId: selectedTool,
        prompt: prompt.trim(),
        model: model.trim() || undefined,
        additionalArgs: additionalArgs.trim()
          ? additionalArgs.split(',').map(arg => arg.trim())
          : undefined,
      };

      const response = await AICliService.executeCommand(request);
      setLastResponse(response);
      onExecute?.(response);
    } catch (error) {
      const errorResponse: AICliResponse = {
        success: false,
        output: '',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: 0,
        toolUsed: selectedTool,
      };
      setLastResponse(errorResponse);
      onExecute?.(errorResponse);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleTestTool = async (toolId: string) => {
    if (isTesting) return;

    setIsTesting(toolId);
    try {
      const result = await AICliService.testTool(toolId);
      setTestResults(prev =>
        new Map(prev).set(toolId, {
          success: result.success,
          message:
            result.message + (result.version ? ` (${result.version})` : ''),
        })
      );
    } catch (error) {
      setTestResults(prev =>
        new Map(prev).set(toolId, {
          success: false,
          message: error instanceof Error ? error.message : 'Test failed',
        })
      );
    } finally {
      setIsTesting(null);
    }
  };

  const selectedToolData = availableTools.find(
    tool => tool.id === selectedTool
  );
  const testResult = testResults.get(selectedTool);

  return (
    <div
      className={cn(
        'space-y-4 p-4 border border-slate-200 rounded-lg bg-white',
        className
      )}
    >
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <Terminal className="w-5 h-5 text-green-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            AI CLI Tool Executor
          </h3>
          <p className="text-sm text-slate-600">
            Execute prompts using configured local AI CLI tools
          </p>
        </div>
      </div>

      {availableTools.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Terminal className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">No AI CLI tools configured</p>
          <p className="text-xs">
            Configure tools in Settings → Local AI Tools to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Tool Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Select AI Tool
            </Label>
            <div className="space-y-2">
              {availableTools.map(tool => {
                const isSelected = selectedTool === tool.id;
                const toolTestResult = testResults.get(tool.id);

                return (
                  <div
                    key={tool.id}
                    className={cn(
                      'p-3 border rounded-lg cursor-pointer transition-colors',
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                    onClick={() => setSelectedTool(tool.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-slate-900">
                            {tool.name}
                          </h4>
                          {toolTestResult && (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                                toolTestResult.success
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              )}
                            >
                              {toolTestResult.success ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              {toolTestResult.success ? 'Available' : 'Error'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          <code className="bg-slate-100 px-1 rounded">
                            {tool.command} {tool.args.join(' ')}
                          </code>
                        </p>
                        {tool.description && (
                          <p className="text-xs text-slate-500 mt-1">
                            {tool.description}
                          </p>
                        )}
                        {toolTestResult && !toolTestResult.success && (
                          <p className="text-xs text-red-600 mt-1">
                            {toolTestResult.message}
                          </p>
                        )}
                      </div>
                      {showTestButton && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            handleTestTool(tool.id);
                          }}
                          disabled={isTesting === tool.id}
                          className="flex items-center gap-1"
                        >
                          {isTesting === tool.id ? (
                            <Clock className="w-4 h-4 animate-spin" />
                          ) : (
                            <TestTube className="w-4 h-4" />
                          )}
                          Test
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tool Configuration */}
          {selectedToolData && (
            <div className="space-y-4 p-3 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700">
                Tool Configuration
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="model"
                    className="text-xs font-medium text-slate-600"
                  >
                    Model (optional)
                  </Label>
                  <Input
                    id="model"
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder="e.g., llama2, codellama"
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="additional-args"
                    className="text-xs font-medium text-slate-600"
                  >
                    Additional Args (optional)
                  </Label>
                  <Input
                    id="additional-args"
                    type="text"
                    value={additionalArgs}
                    onChange={e => setAdditionalArgs(e.target.value)}
                    placeholder="--verbose, --format=json"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label
              htmlFor="prompt"
              className="text-sm font-medium text-slate-700"
            >
              Prompt
            </Label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            />
          </div>

          {/* Execute Button */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExecute}
              disabled={!selectedTool || !prompt.trim() || isExecuting}
              className="flex items-center gap-2"
            >
              {isExecuting ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>

            {testResult && !testResult.success && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Tool may not be available</span>
              </div>
            )}
          </div>

          {/* Response Display */}
          {lastResponse && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Response
              </Label>
              <div
                className={cn(
                  'p-3 border rounded-lg',
                  lastResponse.success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {lastResponse.success ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <X className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      {lastResponse.success ? 'Success' : 'Error'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {lastResponse.executionTime}ms • {lastResponse.toolUsed}
                  </span>
                </div>

                {lastResponse.error ? (
                  <p className="text-sm text-red-700">{lastResponse.error}</p>
                ) : (
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-2 rounded border overflow-auto max-h-48">
                    {lastResponse.output}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
