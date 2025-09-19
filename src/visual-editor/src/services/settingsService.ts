import type { AIEndpoint, AppSettings, LocalAITool } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'ai-ley-visual-editor-settings';

export class SettingsService {
  /**
   * Load settings from localStorage
   */
  static loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) {
        return DEFAULT_SETTINGS;
      }

      const parsed = JSON.parse(stored);

      // Merge with defaults to ensure all properties exist
      return this.mergeWithDefaults(parsed);
    } catch (error) {
      console.error('Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings to localStorage
   */
  static saveSettings(settings: AppSettings): void {
    try {
      const toSave = {
        ...settings,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(
        SETTINGS_STORAGE_KEY,
        JSON.stringify(toSave, null, 2)
      );
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * Reset settings to defaults
   */
  static resetSettings(): AppSettings {
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
    return DEFAULT_SETTINGS;
  }

  /**
   * Merge loaded settings with defaults to ensure all properties exist
   */
  private static mergeWithDefaults(loaded: Partial<AppSettings>): AppSettings {
    return {
      aiLeyPaths: {
        ...DEFAULT_SETTINGS.aiLeyPaths,
        ...loaded.aiLeyPaths,
      },
      umlFlows: {
        ...DEFAULT_SETTINGS.umlFlows,
        ...loaded.umlFlows,
      },
      localAI: {
        ...DEFAULT_SETTINGS.localAI,
        ...loaded.localAI,
        tools: loaded.localAI?.tools || DEFAULT_SETTINGS.localAI.tools,
      },
      aiRest: {
        ...DEFAULT_SETTINGS.aiRest,
        ...loaded.aiRest,
        endpoints:
          loaded.aiRest?.endpoints || DEFAULT_SETTINGS.aiRest.endpoints,
      },
      version: loaded.version || DEFAULT_SETTINGS.version,
      lastUpdated: loaded.lastUpdated || DEFAULT_SETTINGS.lastUpdated,
    };
  }

  /**
   * Validate settings
   */
  static validateSettings(settings: AppSettings): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate UML flows settings
    if (!settings.umlFlows.storageFolder?.trim()) {
      errors.push('UML flows storage folder cannot be empty');
    }

    // Validate AI endpoints
    settings.aiRest.endpoints.forEach((endpoint, index) => {
      if (!endpoint.name?.trim()) {
        errors.push(`AI endpoint ${index + 1}: Name is required`);
      }
      if (!endpoint.url?.trim()) {
        errors.push(`AI endpoint ${index + 1}: URL is required`);
      }
      if (endpoint.enabled && !endpoint.apiKey?.trim()) {
        errors.push(
          `AI endpoint ${index + 1}: API key is required when enabled`
        );
      }
      if (endpoint.url && !this.isValidUrl(endpoint.url)) {
        errors.push(`AI endpoint ${index + 1}: Invalid URL format`);
      }
    });

    // Validate local AI tools
    settings.localAI.tools.forEach((tool, index) => {
      if (!tool.name?.trim()) {
        errors.push(`Local AI tool ${index + 1}: Name is required`);
      }
      if (!tool.command?.trim()) {
        errors.push(`Local AI tool ${index + 1}: Command is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export settings to JSON file
   */
  static exportSettings(settings: AppSettings): void {
    try {
      // Remove sensitive data for export
      const exportData = {
        ...settings,
        aiRest: {
          ...settings.aiRest,
          endpoints: settings.aiRest.endpoints.map(endpoint => ({
            ...endpoint,
            apiKey: endpoint.apiKey ? '[HIDDEN]' : '',
          })),
        },
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `ai-ley-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw new Error('Failed to export settings');
    }
  }

  /**
   * Import settings from JSON file
   */
  static async importSettings(file: File): Promise<AppSettings> {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      const validation = this.validateSettings(imported);
      if (!validation.isValid) {
        throw new Error(
          `Invalid settings file: ${validation.errors.join(', ')}`
        );
      }

      return this.mergeWithDefaults(imported);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error('Failed to import settings file');
    }
  }

  /**
   * Get UML flows storage path
   */
  static getUMLFlowsPath(): string {
    const settings = this.loadSettings();
    return settings.umlFlows.storageFolder;
  }

  /**
   * Update UML flows storage path
   */
  static updateUMLFlowsPath(newPath: string): void {
    const settings = this.loadSettings();
    settings.umlFlows.storageFolder = newPath;
    this.saveSettings(settings);
  }

  /**
   * Add or update local AI tool
   */
  static saveLocalAITool(tool: LocalAITool): void {
    const settings = this.loadSettings();
    const existingIndex = settings.localAI.tools.findIndex(
      t => t.id === tool.id
    );

    if (existingIndex >= 0) {
      settings.localAI.tools[existingIndex] = tool;
    } else {
      settings.localAI.tools.push(tool);
    }

    this.saveSettings(settings);
  }

  /**
   * Remove local AI tool
   */
  static removeLocalAITool(toolId: string): void {
    const settings = this.loadSettings();
    settings.localAI.tools = settings.localAI.tools.filter(
      t => t.id !== toolId
    );
    this.saveSettings(settings);
  }

  /**
   * Add or update AI endpoint
   */
  static saveAIEndpoint(endpoint: AIEndpoint): void {
    const settings = this.loadSettings();
    const existingIndex = settings.aiRest.endpoints.findIndex(
      e => e.id === endpoint.id
    );

    if (existingIndex >= 0) {
      settings.aiRest.endpoints[existingIndex] = endpoint;
    } else {
      settings.aiRest.endpoints.push(endpoint);
    }

    this.saveSettings(settings);
  }

  /**
   * Remove AI endpoint
   */
  static removeAIEndpoint(endpointId: string): void {
    const settings = this.loadSettings();
    settings.aiRest.endpoints = settings.aiRest.endpoints.filter(
      e => e.id !== endpointId
    );
    this.saveSettings(settings);
  }

  /**
   * Validate URL format
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
