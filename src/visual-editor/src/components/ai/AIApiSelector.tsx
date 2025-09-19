import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  Clock,
  Globe,
  Send,
  TestTube,
  X,
  Zap,
} from 'lucide-react';
import { Button, Input, Label } from '../../shared/components';
import { cn } from '../../utils';
import {
  type AIApiRequest,
  type AIApiResponse,
  AIApiService,
} from '../../services/aiApiService';
import type { AIEndpoint } from '../../types/settings';

interface AIApiSelectorProps {
  onResponse?: (response: AIApiResponse) => void;
  onStreamingChunk?: (chunk: string) => void;
  className?: string;
  defaultMessages?: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  showTestButton?: boolean;
  enableStreaming?: boolean;
}

export function AIApiSelector({
  onResponse,
  onStreamingChunk,
  className,
  defaultMessages = [],
  showTestButton = true,
  enableStreaming = false,
}: AIApiSelectorProps) {
  const [availableEndpoints, setAvailableEndpoints] = useState<AIEndpoint[]>(
    []
  );
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [messages, setMessages] =
    useState<Array<{ role: 'system' | 'user' | 'assistant'; content: string }>>(
      defaultMessages
    );
  const [currentMessage, setCurrentMessage] = useState('');
  const [model, setModel] = useState('');
  const [maxTokens, setMaxTokens] = useState<number>(4096);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AIApiResponse | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [testResults, setTestResults] = useState<
    Map<string, { success: boolean; message: string; responseTime?: number }>
  >(new Map());

  // Load available endpoints
  useEffect(() => {
    const endpoints = AIApiService.getAvailableEndpoints();
    setAvailableEndpoints(endpoints);

    // Set default endpoint
    const defaultEndpoint = AIApiService.getDefaultEndpoint();
    if (defaultEndpoint && !selectedEndpoint) {
      setSelectedEndpoint(defaultEndpoint.id);
      setModel(defaultEndpoint.model || '');
      setMaxTokens(defaultEndpoint.maxTokens || 4096);
      setTemperature(defaultEndpoint.temperature || 0.7);
    }
  }, [selectedEndpoint]);

  // Update messages when defaultMessages change
  useEffect(() => {
    setMessages(defaultMessages);
  }, [defaultMessages]);

  const handleEndpointChange = (endpointId: string) => {
    setSelectedEndpoint(endpointId);
    const endpoint = availableEndpoints.find(e => e.id === endpointId);
    if (endpoint) {
      setModel(endpoint.model || '');
      setMaxTokens(endpoint.maxTokens || 4096);
      setTemperature(endpoint.temperature || 0.7);
    }
  };

  const handleAddMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage = {
      role: 'user' as const,
      content: currentMessage.trim(),
    };

    setMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
  };

  const handleRemoveMessage = (index: number) => {
    setMessages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendRequest = async (streaming: boolean = false) => {
    if (!selectedEndpoint || messages.length === 0) return;

    setIsExecuting(true);
    setIsStreaming(streaming);
    setLastResponse(null);
    setStreamingContent('');

    try {
      const request: AIApiRequest = {
        endpointId: selectedEndpoint,
        messages,
        model: model.trim() || undefined,
        maxTokens,
        temperature,
        stream: streaming,
      };

      if (streaming && enableStreaming) {
        await AIApiService.sendStreamingRequest(request, chunk => {
          if (chunk.success && !chunk.finished) {
            setStreamingContent(prev => prev + chunk.content);
            onStreamingChunk?.(chunk.content);
          } else if (chunk.finished) {
            const response: AIApiResponse = {
              success: true,
              content: streamingContent + chunk.content,
              executionTime: 0,
              endpointUsed: selectedEndpoint,
            };
            setLastResponse(response);
            onResponse?.(response);
            setIsExecuting(false);
            setIsStreaming(false);
          } else if (chunk.error) {
            const errorResponse: AIApiResponse = {
              success: false,
              content: '',
              error: chunk.error,
              executionTime: 0,
              endpointUsed: selectedEndpoint,
            };
            setLastResponse(errorResponse);
            onResponse?.(errorResponse);
            setIsExecuting(false);
            setIsStreaming(false);
          }
        });
      } else {
        const response = await AIApiService.sendRequest(request);
        setLastResponse(response);
        onResponse?.(response);
      }
    } catch (error) {
      const errorResponse: AIApiResponse = {
        success: false,
        content: '',
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: 0,
        endpointUsed: selectedEndpoint,
      };
      setLastResponse(errorResponse);
      onResponse?.(errorResponse);
    } finally {
      if (!isStreaming) {
        setIsExecuting(false);
      }
    }
  };

  const handleTestEndpoint = async (endpointId: string) => {
    if (isTesting) return;

    setIsTesting(endpointId);
    try {
      const result = await AIApiService.testEndpoint(endpointId);
      setTestResults(prev =>
        new Map(prev).set(endpointId, {
          success: result.success,
          message: result.message,
          responseTime: result.responseTime,
        })
      );
    } catch (error) {
      setTestResults(prev =>
        new Map(prev).set(endpointId, {
          success: false,
          message: error instanceof Error ? error.message : 'Test failed',
        })
      );
    } finally {
      setIsTesting(null);
    }
  };

  const selectedEndpointData = availableEndpoints.find(
    endpoint => endpoint.id === selectedEndpoint
  );
  const testResult = testResults.get(selectedEndpoint);

  return (
    <div
      className={cn(
        'space-y-4 p-4 border border-slate-200 rounded-lg bg-white',
        className
      )}
    >
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <Globe className="w-5 h-5 text-purple-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            AI API Request Builder
          </h3>
          <p className="text-sm text-slate-600">
            Send requests to configured AI API endpoints
          </p>
        </div>
      </div>

      {availableEndpoints.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">No AI API endpoints configured</p>
          <p className="text-xs">
            Configure endpoints in Settings → AI REST APIs to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Endpoint Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Select AI Endpoint
            </Label>
            <div className="space-y-2">
              {availableEndpoints.map(endpoint => {
                const isSelected = selectedEndpoint === endpoint.id;
                const endpointTestResult = testResults.get(endpoint.id);

                return (
                  <div
                    key={endpoint.id}
                    className={cn(
                      'p-3 border rounded-lg cursor-pointer transition-colors',
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                    onClick={() => handleEndpointChange(endpoint.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-slate-900">
                            {endpoint.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                            {endpoint.provider}
                          </span>
                          {endpointTestResult && (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                                endpointTestResult.success
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              )}
                            >
                              {endpointTestResult.success ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <X className="w-3 h-3" />
                              )}
                              {endpointTestResult.success
                                ? 'Available'
                                : 'Error'}
                              {endpointTestResult.responseTime && (
                                <span className="ml-1">
                                  ({endpointTestResult.responseTime}ms)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Model: {endpoint.model || 'default'} • Max Tokens:{' '}
                          {endpoint.maxTokens || 4096}
                        </p>
                        {endpointTestResult && !endpointTestResult.success && (
                          <p className="text-xs text-red-600 mt-1">
                            {endpointTestResult.message}
                          </p>
                        )}
                      </div>
                      {showTestButton && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            handleTestEndpoint(endpoint.id);
                          }}
                          disabled={isTesting === endpoint.id}
                          className="flex items-center gap-1"
                        >
                          {isTesting === endpoint.id ? (
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

          {/* API Configuration */}
          {selectedEndpointData && (
            <div className="space-y-4 p-3 bg-slate-50 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700">
                Request Configuration
              </h4>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label
                    htmlFor="model"
                    className="text-xs font-medium text-slate-600"
                  >
                    Model
                  </Label>
                  <Input
                    id="model"
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder={selectedEndpointData.model || 'default'}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="max-tokens"
                    className="text-xs font-medium text-slate-600"
                  >
                    Max Tokens
                  </Label>
                  <Input
                    id="max-tokens"
                    type="number"
                    min="1"
                    max="100000"
                    value={maxTokens}
                    onChange={e =>
                      setMaxTokens(parseInt(e.target.value) || 4096)
                    }
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="temperature"
                    className="text-xs font-medium text-slate-600"
                  >
                    Temperature
                  </Label>
                  <Input
                    id="temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={e =>
                      setTemperature(parseFloat(e.target.value) || 0.7)
                    }
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">
              Messages
            </Label>

            {/* Existing Messages */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className="p-2 border border-slate-200 rounded bg-slate-50"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        'text-xs font-medium',
                        message.role === 'system'
                          ? 'text-blue-600'
                          : message.role === 'user'
                            ? 'text-green-600'
                            : 'text-purple-600'
                      )}
                    >
                      {message.role.charAt(0).toUpperCase() +
                        message.role.slice(1)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMessage(index)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-slate-700">{message.content}</p>
                </div>
              ))}
            </div>

            {/* Add New Message */}
            <div className="flex gap-2">
              <textarea
                value={currentMessage}
                onChange={e => setCurrentMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={3}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
              />
              <Button
                onClick={handleAddMessage}
                disabled={!currentMessage.trim()}
                className="self-start mt-1"
                variant="outline"
                size="sm"
              >
                Add
              </Button>
            </div>
          </div>

          {/* Send Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSendRequest(false)}
              disabled={
                !selectedEndpoint || messages.length === 0 || isExecuting
              }
              className="flex items-center gap-2"
            >
              {isExecuting && !isStreaming ? (
                <Clock className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Request
            </Button>

            {enableStreaming && (
              <Button
                onClick={() => handleSendRequest(true)}
                disabled={
                  !selectedEndpoint || messages.length === 0 || isExecuting
                }
                variant="outline"
                className="flex items-center gap-2"
              >
                {isStreaming ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Stream
              </Button>
            )}

            {testResult && !testResult.success && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Endpoint may not be available</span>
              </div>
            )}
          </div>

          {/* Streaming Content */}
          {isStreaming && streamingContent && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Streaming Response
              </Label>
              <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono overflow-auto max-h-48">
                  {streamingContent}
                  <span className="animate-pulse">|</span>
                </pre>
              </div>
            </div>
          )}

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
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>
                      {lastResponse.executionTime}ms •{' '}
                      {lastResponse.endpointUsed}
                    </span>
                    {lastResponse.usage && (
                      <span>
                        {lastResponse.usage.totalTokens} tokens (
                        {lastResponse.usage.promptTokens}+
                        {lastResponse.usage.completionTokens})
                      </span>
                    )}
                  </div>
                </div>

                {lastResponse.error ? (
                  <p className="text-sm text-red-700">{lastResponse.error}</p>
                ) : (
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-2 rounded border overflow-auto max-h-48">
                    {lastResponse.content}
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
