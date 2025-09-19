import React, { useState } from 'react';
import { Edit2, Eye, EyeOff, Globe, Key, Plus, Trash2 } from 'lucide-react';
import { Button, Input, Label } from '../../../shared/components';
import { useSettings } from '../../../hooks/useSettings';
import type { AIEndpoint } from '../../../types/settings';

export function AIRestSettings() {
  const { settings, saveAIEndpoint, removeAIEndpoint, updateAIRestSettings } =
    useSettings();
  const { aiRest } = settings;
  const [editingEndpoint, setEditingEndpoint] = useState<AIEndpoint | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});

  const handleCreateEndpoint = () => {
    const newEndpoint: AIEndpoint = {
      id: `endpoint_${Date.now()}`,
      name: '',
      url: '',
      apiKey: '',
      provider: 'custom',
      enabled: false,
      maxTokens: 4096,
      temperature: 0.7,
    };
    setEditingEndpoint(newEndpoint);
    setIsCreating(true);
  };

  const handleEditEndpoint = (endpoint: AIEndpoint) => {
    setEditingEndpoint({ ...endpoint });
    setIsCreating(false);
  };

  const handleSaveEndpoint = () => {
    if (
      editingEndpoint &&
      editingEndpoint.name.trim() &&
      editingEndpoint.url.trim()
    ) {
      saveAIEndpoint(editingEndpoint);
      setEditingEndpoint(null);
      setIsCreating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingEndpoint(null);
    setIsCreating(false);
  };

  const handleDeleteEndpoint = (endpointId: string) => {
    if (confirm('Are you sure you want to delete this AI endpoint?')) {
      removeAIEndpoint(endpointId);
    }
  };

  const handleRetryAttemptsChange = (retryAttempts: number) => {
    updateAIRestSettings({ retryAttempts });
  };

  const handleTimeoutChange = (timeout: number) => {
    updateAIRestSettings({ timeout });
  };

  const handleDefaultEndpointChange = (defaultEndpoint: string) => {
    updateAIRestSettings({ defaultEndpoint });
  };

  const updateEditingEndpoint = (updates: Partial<AIEndpoint>) => {
    if (editingEndpoint) {
      setEditingEndpoint({ ...editingEndpoint, ...updates });
    }
  };

  const toggleApiKeyVisibility = (endpointId: string) => {
    setShowApiKey(prev => ({ ...prev, [endpointId]: !prev[endpointId] }));
  };

  const maskApiKey = (apiKey: string): string => {
    if (!apiKey) return '';
    if (apiKey.length <= 8) return '*'.repeat(apiKey.length);
    return (
      apiKey.substring(0, 4) +
      '*'.repeat(apiKey.length - 8) +
      apiKey.substring(apiKey.length - 4)
    );
  };

  const providerOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'google', label: 'Google' },
    { value: 'azure', label: 'Azure OpenAI' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <Globe className="w-5 h-5 text-purple-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">AI REST APIs</h3>
          <p className="text-sm text-slate-600">
            Configure AI API endpoints and authentication
          </p>
        </div>
      </div>

      {/* Global Settings */}
      <div className="grid gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Global Settings
        </h4>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="retry-attempts"
              className="text-sm font-medium text-slate-700"
            >
              Retry Attempts
            </Label>
            <Input
              id="retry-attempts"
              type="number"
              min="0"
              max="10"
              value={aiRest.retryAttempts}
              onChange={e =>
                handleRetryAttemptsChange(parseInt(e.target.value) || 3)
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="timeout"
              className="text-sm font-medium text-slate-700"
            >
              Timeout (seconds)
            </Label>
            <Input
              id="timeout"
              type="number"
              min="1"
              max="300"
              value={aiRest.timeout}
              onChange={e =>
                handleTimeoutChange(parseInt(e.target.value) || 60)
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="default-endpoint"
              className="text-sm font-medium text-slate-700"
            >
              Default Endpoint
            </Label>
            <select
              id="default-endpoint"
              value={aiRest.defaultEndpoint || ''}
              onChange={e => handleDefaultEndpointChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select default endpoint</option>
              {aiRest.endpoints.map(endpoint => (
                <option key={endpoint.id} value={endpoint.id}>
                  {endpoint.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700">
            API Endpoints
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateEndpoint}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Endpoint
          </Button>
        </div>

        {aiRest.endpoints.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Globe className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No AI endpoints configured</p>
            <p className="text-xs">
              Add your first AI API endpoint to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {aiRest.endpoints.map(endpoint => (
              <div
                key={endpoint.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-slate-900">
                        {endpoint.name}
                      </h5>
                      <span className="px-2 py-1 rounded-full text-xs bg-slate-100 text-slate-600">
                        {endpoint.provider}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          endpoint.enabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {endpoint.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      <code className="bg-slate-100 px-1 rounded text-xs">
                        {endpoint.url}
                      </code>
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {endpoint.model && <span>Model: {endpoint.model}</span>}
                      {endpoint.maxTokens && (
                        <span>Max Tokens: {endpoint.maxTokens}</span>
                      )}
                      {endpoint.temperature !== undefined && (
                        <span>Temperature: {endpoint.temperature}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Key className="w-3 h-3" />
                        <span>
                          {endpoint.apiKey
                            ? maskApiKey(endpoint.apiKey)
                            : 'No API key'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEndpoint(endpoint)}
                      className="p-1 h-auto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEndpoint(endpoint.id)}
                      className="p-1 h-auto text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Endpoint Modal */}
      {editingEndpoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {isCreating ? 'Add New AI Endpoint' : 'Edit AI Endpoint'}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="endpoint-name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Endpoint Name *
                  </Label>
                  <Input
                    id="endpoint-name"
                    type="text"
                    value={editingEndpoint.name}
                    onChange={e =>
                      updateEditingEndpoint({ name: e.target.value })
                    }
                    placeholder="e.g., OpenAI GPT-4"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="endpoint-provider"
                    className="text-sm font-medium text-slate-700"
                  >
                    Provider
                  </Label>
                  <select
                    id="endpoint-provider"
                    value={editingEndpoint.provider}
                    onChange={e =>
                      updateEditingEndpoint({
                        provider: e.target.value as AIEndpoint['provider'],
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {providerOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="endpoint-url"
                  className="text-sm font-medium text-slate-700"
                >
                  API URL *
                </Label>
                <Input
                  id="endpoint-url"
                  type="url"
                  value={editingEndpoint.url}
                  onChange={e => updateEditingEndpoint({ url: e.target.value })}
                  placeholder="https://api.openai.com/v1/chat/completions"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="endpoint-api-key"
                  className="text-sm font-medium text-slate-700"
                >
                  API Key
                </Label>
                <div className="relative">
                  <Input
                    id="endpoint-api-key"
                    type={showApiKey[editingEndpoint.id] ? 'text' : 'password'}
                    value={editingEndpoint.apiKey}
                    onChange={e =>
                      updateEditingEndpoint({ apiKey: e.target.value })
                    }
                    placeholder="Enter your API key"
                    className="w-full pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleApiKeyVisibility(editingEndpoint.id)}
                    className="absolute right-0 top-0 h-full px-3"
                  >
                    {showApiKey[editingEndpoint.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="endpoint-model"
                  className="text-sm font-medium text-slate-700"
                >
                  Model
                </Label>
                <Input
                  id="endpoint-model"
                  type="text"
                  value={editingEndpoint.model || ''}
                  onChange={e =>
                    updateEditingEndpoint({ model: e.target.value })
                  }
                  placeholder="e.g., gpt-4, claude-3-sonnet-20240229"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="endpoint-max-tokens"
                    className="text-sm font-medium text-slate-700"
                  >
                    Max Tokens
                  </Label>
                  <Input
                    id="endpoint-max-tokens"
                    type="number"
                    min="1"
                    max="100000"
                    value={editingEndpoint.maxTokens || ''}
                    onChange={e =>
                      updateEditingEndpoint({
                        maxTokens: parseInt(e.target.value) || undefined,
                      })
                    }
                    placeholder="4096"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="endpoint-temperature"
                    className="text-sm font-medium text-slate-700"
                  >
                    Temperature
                  </Label>
                  <Input
                    id="endpoint-temperature"
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={editingEndpoint.temperature || ''}
                    onChange={e =>
                      updateEditingEndpoint({
                        temperature: parseFloat(e.target.value) || undefined,
                      })
                    }
                    placeholder="0.7"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-700">
                    Enabled
                  </Label>
                  <p className="text-xs text-slate-500">
                    Enable this endpoint for use in the application
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEndpoint.enabled}
                    onChange={e =>
                      updateEditingEndpoint({ enabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveEndpoint}
                disabled={
                  !editingEndpoint.name.trim() || !editingEndpoint.url.trim()
                }
                className="flex-1"
              >
                {isCreating ? 'Create Endpoint' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
