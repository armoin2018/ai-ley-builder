import type { AIEndpoint } from '../types/settings';
import { SettingsService } from './settingsService';

export interface AIApiRequest {
  endpointId: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AIApiResponse {
  success: boolean;
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
  executionTime: number;
  endpointUsed: string;
}

export interface AIApiStreamResponse {
  success: boolean;
  content: string;
  finished: boolean;
  error?: string;
}

export class AIApiService {
  /**
   * Get all available AI API endpoints from settings
   */
  static getAvailableEndpoints(): AIEndpoint[] {
    const settings = SettingsService.loadSettings();
    return settings.aiRest.endpoints.filter(endpoint => endpoint.enabled && endpoint.apiKey);
  }

  /**
   * Get a specific AI API endpoint by ID
   */
  static getEndpoint(endpointId: string): AIEndpoint | null {
    const endpoints = this.getAvailableEndpoints();
    return endpoints.find(endpoint => endpoint.id === endpointId) || null;
  }

  /**
   * Get the default AI API endpoint
   */
  static getDefaultEndpoint(): AIEndpoint | null {
    const settings = SettingsService.loadSettings();
    const defaultEndpointId = settings.aiRest.defaultEndpoint;

    if (defaultEndpointId) {
      return this.getEndpoint(defaultEndpointId);
    }

    // Fallback to first enabled endpoint
    const availableEndpoints = this.getAvailableEndpoints();
    return availableEndpoints.length > 0 ? availableEndpoints[0] : null;
  }

  /**
   * Send request to AI API endpoint
   */
  static async sendRequest(request: AIApiRequest): Promise<AIApiResponse> {
    const startTime = Date.now();

    try {
      // Validate endpoint exists and is enabled
      const endpoint = this.getEndpoint(request.endpointId);
      if (!endpoint) {
        throw new Error(`AI API endpoint '${request.endpointId}' not found or not enabled`);
      }

      if (!endpoint.apiKey) {
        throw new Error(`AI API endpoint '${request.endpointId}' requires an API key`);
      }

      // Build request payload based on provider
      const payload = this.buildRequestPayload(endpoint, request);

      // Make the API call
      const response = await this.makeApiCall(endpoint, payload);

      // Parse response based on provider
      const parsedResponse = this.parseResponse(endpoint, response);

      const executionTime = Date.now() - startTime;
      this.recordUsage(endpoint.id, endpoint.name, true, executionTime);

      return {
        success: true,
        content: parsedResponse.content,
        usage: parsedResponse.usage,
        executionTime,
        endpointUsed: endpoint.name,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.recordUsage(request.endpointId, request.endpointId, false, executionTime);

      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime,
        endpointUsed: request.endpointId,
      };
    }
  }

  /**
   * Send streaming request to AI API endpoint
   */
  static async sendStreamingRequest(
    request: AIApiRequest,
    onChunk: (response: AIApiStreamResponse) => void
  ): Promise<void> {
    try {
      const endpoint = this.getEndpoint(request.endpointId);
      if (!endpoint) {
        throw new Error(`AI API endpoint '${request.endpointId}' not found or not enabled`);
      }

      if (!endpoint.apiKey) {
        throw new Error(`AI API endpoint '${request.endpointId}' requires an API key`);
      }

      const payload = this.buildRequestPayload(endpoint, { ...request, stream: true });

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: this.buildHeaders(endpoint),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body available for streaming');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            onChunk({
              success: true,
              content: '',
              finished: true,
            });
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;

            try {
              const parsed = this.parseStreamingChunk(endpoint, line);
              if (parsed) {
                onChunk({
                  success: true,
                  content: parsed,
                  finished: false,
                });
              }
            } catch (error) {
              console.warn('Failed to parse streaming chunk:', error);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      onChunk({
        success: false,
        content: '',
        finished: true,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  }

  /**
   * Test connection to an AI API endpoint
   */
  static async testEndpoint(endpointId: string): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();

    try {
      const endpoint = this.getEndpoint(endpointId);
      if (!endpoint) {
        return {
          success: false,
          message: `Endpoint '${endpointId}' not found or not enabled`,
        };
      }

      if (!endpoint.apiKey) {
        return {
          success: false,
          message: `Endpoint '${endpoint.name}' requires an API key`,
        };
      }

      // Send a simple test request
      const testRequest: AIApiRequest = {
        endpointId,
        messages: [{
          role: 'user',
          content: 'Hello, this is a test message. Please respond with "Test successful".',
        }],
        maxTokens: 10,
        temperature: 0.1,
      };

      const response = await this.sendRequest(testRequest);
      const responseTime = Date.now() - startTime;

      if (response.success) {
        return {
          success: true,
          message: `Endpoint '${endpoint.name}' is working correctly`,
          responseTime,
        };
      } else {
        return {
          success: false,
          message: `Endpoint test failed: ${response.error}`,
          responseTime,
        };
      }

    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
        responseTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get usage statistics for AI API endpoints
   */
  static getUsageStats(): Array<{
    endpointId: string;
    endpointName: string;
    totalRequests: number;
    successfulRequests: number;
    averageResponseTime: number;
    totalTokensUsed: number;
    lastUsed: Date | null;
  }> {
    const stats = localStorage.getItem('ai-api-usage-stats');
    if (!stats) return [];

    try {
      const parsed = JSON.parse(stats);
      return Object.entries(parsed).map(([endpointId, data]: [string, any]) => ({
        endpointId,
        endpointName: data.endpointName || endpointId,
        totalRequests: data.totalRequests || 0,
        successfulRequests: data.successfulRequests || 0,
        averageResponseTime: data.averageResponseTime || 0,
        totalTokensUsed: data.totalTokensUsed || 0,
        lastUsed: data.lastUsed ? new Date(data.lastUsed) : null,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Build request payload based on provider
   */
  private static buildRequestPayload(endpoint: AIEndpoint, request: AIApiRequest): any {
    const basePayload = {
      model: request.model || endpoint.model || 'gpt-3.5-turbo',
      max_tokens: request.maxTokens || endpoint.maxTokens || 4096,
      temperature: request.temperature !== undefined ? request.temperature : endpoint.temperature || 0.7,
    };

    switch (endpoint.provider) {
      case 'openai':
      case 'azure':
        return {
          ...basePayload,
          messages: request.messages,
          stream: request.stream || false,
        };

      case 'anthropic':
        return {
          ...basePayload,
          max_tokens: basePayload.max_tokens,
          messages: request.messages,
          stream: request.stream || false,
        };

      case 'google':
        // Convert to Google's format
        return {
          contents: [{
            parts: [{
              text: request.messages.map(m => `${m.role}: ${m.content}`).join('\n'),
            }],
          }],
          generationConfig: {
            maxOutputTokens: basePayload.max_tokens,
            temperature: basePayload.temperature,
          },
        };

      case 'custom':
      default:
        return {
          ...basePayload,
          messages: request.messages,
          stream: request.stream || false,
        };
    }
  }

  /**
   * Build headers for API request
   */
  private static buildHeaders(endpoint: AIEndpoint): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    switch (endpoint.provider) {
      case 'openai':
        headers['Authorization'] = `Bearer ${endpoint.apiKey}`;
        break;

      case 'anthropic':
        headers['x-api-key'] = endpoint.apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;

      case 'google':
        headers['Authorization'] = `Bearer ${endpoint.apiKey}`;
        break;

      case 'azure':
        headers['api-key'] = endpoint.apiKey;
        break;

      case 'custom':
      default:
        headers['Authorization'] = `Bearer ${endpoint.apiKey}`;
        break;
    }

    return headers;
  }

  /**
   * Make the actual API call
   */
  private static async makeApiCall(endpoint: AIEndpoint, payload: any): Promise<any> {
    const settings = SettingsService.loadSettings();
    const timeout = settings.aiRest.timeout * 1000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: this.buildHeaders(endpoint),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Parse response based on provider
   */
  private static parseResponse(endpoint: AIEndpoint, response: any): {
    content: string;
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  } {
    switch (endpoint.provider) {
      case 'openai':
      case 'azure':
        return {
          content: response.choices?.[0]?.message?.content || '',
          usage: response.usage ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          } : undefined,
        };

      case 'anthropic':
        return {
          content: response.content?.[0]?.text || '',
          usage: response.usage ? {
            promptTokens: response.usage.input_tokens,
            completionTokens: response.usage.output_tokens,
            totalTokens: response.usage.input_tokens + response.usage.output_tokens,
          } : undefined,
        };

      case 'google':
        return {
          content: response.candidates?.[0]?.content?.parts?.[0]?.text || '',
          usage: response.usageMetadata ? {
            promptTokens: response.usageMetadata.promptTokenCount,
            completionTokens: response.usageMetadata.candidatesTokenCount,
            totalTokens: response.usageMetadata.totalTokenCount,
          } : undefined,
        };

      case 'custom':
      default:
        // Try to parse common formats
        return {
          content: response.choices?.[0]?.message?.content ||
                   response.content?.[0]?.text ||
                   response.text ||
                   response.output ||
                   JSON.stringify(response),
        };
    }
  }

  /**
   * Parse streaming chunk based on provider
   */
  private static parseStreamingChunk(endpoint: AIEndpoint, chunk: string): string | null {
    try {
      // Remove SSE prefix if present
      const cleanChunk = chunk.replace(/^data: /, '');

      if (cleanChunk === '[DONE]') {
        return null;
      }

      const parsed = JSON.parse(cleanChunk);

      switch (endpoint.provider) {
        case 'openai':
        case 'azure':
          return parsed.choices?.[0]?.delta?.content || null;

        case 'anthropic':
          return parsed.delta?.text || null;

        case 'google':
          return parsed.candidates?.[0]?.content?.parts?.[0]?.text || null;

        case 'custom':
        default:
          return parsed.choices?.[0]?.delta?.content ||
                 parsed.delta?.text ||
                 parsed.content ||
                 null;
      }
    } catch {
      return null;
    }
  }

  /**
   * Record usage statistics
   */
  private static recordUsage(
    endpointId: string,
    endpointName: string,
    success: boolean,
    responseTime: number,
    tokensUsed: number = 0
  ): void {
    try {
      const statsKey = 'ai-api-usage-stats';
      const existingStats = JSON.parse(localStorage.getItem(statsKey) || '{}');

      const endpointStats = existingStats[endpointId] || {
        endpointName,
        totalRequests: 0,
        successfulRequests: 0,
        totalResponseTime: 0,
        totalTokensUsed: 0,
        lastUsed: null,
      };

      endpointStats.totalRequests += 1;
      if (success) {
        endpointStats.successfulRequests += 1;
      }
      endpointStats.totalResponseTime += responseTime;
      endpointStats.averageResponseTime = endpointStats.totalResponseTime / endpointStats.totalRequests;
      endpointStats.totalTokensUsed += tokensUsed;
      endpointStats.lastUsed = new Date().toISOString();

      existingStats[endpointId] = endpointStats;
      localStorage.setItem(statsKey, JSON.stringify(existingStats));
    } catch (error) {
      console.warn('Failed to record AI API usage stats:', error);
    }
  }

  /**
   * Get formatted endpoint list for UI display
   */
  static getEndpointsForDisplay(): Array<{
    id: string;
    name: string;
    provider: string;
    model: string;
    isAvailable: boolean;
    lastUsed: Date | null;
  }> {
    const endpoints = this.getAvailableEndpoints();
    const stats = this.getUsageStats();
    const statsMap = new Map(stats.map(s => [s.endpointId, s]));

    return endpoints.map(endpoint => ({
      id: endpoint.id,
      name: endpoint.name,
      provider: endpoint.provider,
      model: endpoint.model || 'default',
      isAvailable: endpoint.enabled && !!endpoint.apiKey,
      lastUsed: statsMap.get(endpoint.id)?.lastUsed || null,
    }));
  }

  /**
   * Clear usage statistics
   */
  static clearUsageStats(): void {
    localStorage.removeItem('ai-api-usage-stats');
  }
}