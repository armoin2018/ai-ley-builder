import React, { useState } from 'react';
import { AICliToolSelector } from './AICliToolSelector';
import { AIApiSelector } from './AIApiSelector';
import { Bot, Globe, Terminal } from 'lucide-react';
import { Button } from '../../shared/components';
import { cn } from '../../utils';
import type { AICliResponse } from '../../services/aiCliService';
import type { AIApiResponse } from '../../services/aiApiService';

export function AIDemo() {
  const [activeTab, setActiveTab] = useState<'cli' | 'api'>('cli');
  const [cliResponse, setCliResponse] = useState<AICliResponse | null>(null);
  const [apiResponse, setApiResponse] = useState<AIApiResponse | null>(null);
  const [streamingContent, setStreamingContent] = useState('');

  const handleCliResponse = (response: AICliResponse) => {
    setCliResponse(response);
    console.log('CLI Response:', response);
  };

  const handleApiResponse = (response: AIApiResponse) => {
    setApiResponse(response);
    console.log('API Response:', response);
  };

  const handleStreamingChunk = (chunk: string) => {
    setStreamingContent(prev => prev + chunk);
    console.log('Streaming chunk:', chunk);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <Bot className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">
            AI Integration Demo
          </h1>
        </div>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Demonstrate the AI CLI Tools and API endpoints configured in your
          settings. Test local AI tools like Ollama or cloud APIs like
          OpenAI/Anthropic.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex p-1 bg-slate-100 rounded-lg">
          <Button
            variant={activeTab === 'cli' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('cli')}
            className="flex items-center gap-2"
          >
            <Terminal className="w-4 h-4" />
            AI CLI Tools
          </Button>
          <Button
            variant={activeTab === 'api' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('api')}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            AI API Endpoints
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'cli' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AICliToolSelector
              onExecute={handleCliResponse}
              defaultPrompt="Hello! Please introduce yourself and tell me about your capabilities."
              showTestButton={true}
            />

            {/* CLI Response Display */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                CLI Response
              </h3>
              {cliResponse ? (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium ${cliResponse.success ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {cliResponse.success ? '✅ Success' : '❌ Error'}
                      </span>
                      <span className="text-sm text-slate-500">
                        {cliResponse.executionTime}ms • {cliResponse.toolUsed}
                      </span>
                    </div>
                  </div>

                  {cliResponse.error ? (
                    <div className="text-red-700 text-sm">
                      {cliResponse.error}
                    </div>
                  ) : (
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3 rounded border overflow-auto max-h-96">
                      {cliResponse.output}
                    </pre>
                  )}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-300 rounded-lg text-center text-slate-500">
                  <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>Execute a CLI command to see the response here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIApiSelector
              onResponse={handleApiResponse}
              onStreamingChunk={handleStreamingChunk}
              defaultMessages={[
                {
                  role: 'system',
                  content:
                    'You are a helpful AI assistant. Respond concisely and helpfully.',
                },
                {
                  role: 'user',
                  content:
                    'Hello! Can you explain what you are and what you can help me with?',
                },
              ]}
              showTestButton={true}
              enableStreaming={true}
            />

            {/* API Response Display */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                API Response
              </h3>

              {/* Streaming Content */}
              {streamingContent && (
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h4 className="text-sm font-medium text-blue-700 mb-2">
                    Streaming Response
                  </h4>
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3 rounded border overflow-auto max-h-48">
                    {streamingContent}
                    <span className="animate-pulse">|</span>
                  </pre>
                </div>
              )}

              {apiResponse ? (
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-medium ${apiResponse.success ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {apiResponse.success ? '✅ Success' : '❌ Error'}
                      </span>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <span>
                          {apiResponse.executionTime}ms •{' '}
                          {apiResponse.endpointUsed}
                        </span>
                        {apiResponse.usage && (
                          <span>{apiResponse.usage.totalTokens} tokens</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {apiResponse.error ? (
                    <div className="text-red-700 text-sm">
                      {apiResponse.error}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap bg-white p-3 rounded border overflow-auto max-h-96">
                        {apiResponse.content}
                      </pre>

                      {apiResponse.usage && (
                        <div className="text-xs text-slate-500 bg-white p-2 rounded border">
                          <strong>Token Usage:</strong>{' '}
                          {apiResponse.usage.promptTokens} prompt +{' '}
                          {apiResponse.usage.completionTokens} completion ={' '}
                          {apiResponse.usage.totalTokens} total
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-300 rounded-lg text-center text-slate-500">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p>Send an API request to see the response here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
