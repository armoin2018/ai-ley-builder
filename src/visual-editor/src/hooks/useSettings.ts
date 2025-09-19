import { useCallback, useEffect, useState } from 'react';
import type {
  AIEndpoint,
  AppSettings,
  LocalAITool,
  SettingsState,
} from '../types/settings';
import { SettingsService } from '../services/settingsService';

export function useSettings() {
  const [state, setState] = useState<SettingsState>({
    settings: SettingsService.loadSettings(),
    isLoading: false,
    hasUnsavedChanges: false,
    error: null,
  });

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const settings = SettingsService.loadSettings();
        setState(prev => ({
          ...prev,
          settings,
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Failed to load settings',
        }));
      }
    };

    loadSettings();
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: AppSettings) => {
    setState(prev => ({
      ...prev,
      settings: newSettings,
      hasUnsavedChanges: true,
      error: null,
    }));
  }, []);

  // Save settings
  const saveSettings = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const validation = SettingsService.validateSettings(state.settings);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      SettingsService.saveSettings(state.settings);
      setState(prev => ({
        ...prev,
        isLoading: false,
        hasUnsavedChanges: false,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to save settings',
      }));
      return false;
    }
  }, [state.settings]);

  // Reset settings
  const resetSettings = useCallback(() => {
    const defaultSettings = SettingsService.resetSettings();
    setState(prev => ({
      ...prev,
      settings: defaultSettings,
      hasUnsavedChanges: true,
      error: null,
    }));
  }, []);

  // Export settings
  const exportSettings = useCallback(() => {
    try {
      SettingsService.exportSettings(state.settings);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to export settings',
      }));
    }
  }, [state.settings]);

  // Import settings
  const importSettings = useCallback(async (file: File) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const importedSettings = await SettingsService.importSettings(file);
      setState(prev => ({
        ...prev,
        settings: importedSettings,
        isLoading: false,
        hasUnsavedChanges: true,
      }));
      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to import settings',
      }));
      return false;
    }
  }, []);

  // Update AI-LEY path settings
  const updateAILeyPathSettings = useCallback(
    (updates: Partial<AppSettings['aiLeyPaths']>) => {
      setState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          aiLeyPaths: {
            ...prev.settings.aiLeyPaths,
            ...updates,
          },
        },
        hasUnsavedChanges: true,
      }));
    },
    []
  );

  // Update UML flows settings
  const updateUMLFlowsSettings = useCallback(
    (updates: Partial<AppSettings['umlFlows']>) => {
      setState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          umlFlows: {
            ...prev.settings.umlFlows,
            ...updates,
          },
        },
        hasUnsavedChanges: true,
      }));
    },
    []
  );

  // Add or update local AI tool
  const saveLocalAITool = useCallback((tool: LocalAITool) => {
    setState(prev => {
      const tools = [...prev.settings.localAI.tools];
      const existingIndex = tools.findIndex(t => t.id === tool.id);

      if (existingIndex >= 0) {
        tools[existingIndex] = tool;
      } else {
        tools.push(tool);
      }

      return {
        ...prev,
        settings: {
          ...prev.settings,
          localAI: {
            ...prev.settings.localAI,
            tools,
          },
        },
        hasUnsavedChanges: true,
      };
    });
  }, []);

  // Remove local AI tool
  const removeLocalAITool = useCallback((toolId: string) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        localAI: {
          ...prev.settings.localAI,
          tools: prev.settings.localAI.tools.filter(t => t.id !== toolId),
        },
      },
      hasUnsavedChanges: true,
    }));
  }, []);

  // Update local AI settings
  const updateLocalAISettings = useCallback(
    (updates: Partial<AppSettings['localAI']>) => {
      setState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          localAI: {
            ...prev.settings.localAI,
            ...updates,
          },
        },
        hasUnsavedChanges: true,
      }));
    },
    []
  );

  // Add or update AI endpoint
  const saveAIEndpoint = useCallback((endpoint: AIEndpoint) => {
    setState(prev => {
      const endpoints = [...prev.settings.aiRest.endpoints];
      const existingIndex = endpoints.findIndex(e => e.id === endpoint.id);

      if (existingIndex >= 0) {
        endpoints[existingIndex] = endpoint;
      } else {
        endpoints.push(endpoint);
      }

      return {
        ...prev,
        settings: {
          ...prev.settings,
          aiRest: {
            ...prev.settings.aiRest,
            endpoints,
          },
        },
        hasUnsavedChanges: true,
      };
    });
  }, []);

  // Remove AI endpoint
  const removeAIEndpoint = useCallback((endpointId: string) => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        aiRest: {
          ...prev.settings.aiRest,
          endpoints: prev.settings.aiRest.endpoints.filter(
            e => e.id !== endpointId
          ),
        },
      },
      hasUnsavedChanges: true,
    }));
  }, []);

  // Update AI REST settings
  const updateAIRestSettings = useCallback(
    (updates: Partial<AppSettings['aiRest']>) => {
      setState(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          aiRest: {
            ...prev.settings.aiRest,
            ...updates,
          },
        },
        hasUnsavedChanges: true,
      }));
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    ...state,

    // Actions
    updateSettings,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,

    // AI-LEY Paths
    updateAILeyPathSettings,

    // UML Flows
    updateUMLFlowsSettings,

    // Local AI
    saveLocalAITool,
    removeLocalAITool,
    updateLocalAISettings,

    // AI REST
    saveAIEndpoint,
    removeAIEndpoint,
    updateAIRestSettings,

    // Utilities
    clearError,
  };
}
