/**
 * Feature Flags Utility
 *
 * Provides centralized access to feature flags for gradual rollout and safe experimentation.
 * All feature flags are stored in app settings and can be toggled via the Settings UI.
 *
 * @module featureFlags
 */

import { SettingsService } from '../services/settingsService';

/**
 * Feature flag identifiers
 */
export const FeatureFlag = {
  /** Use useTabState hook for tab state management (TASK-002) */
  USE_TAB_STATE_HOOK: 'useTabStateHook',
  /** Enable experimental/beta features across the application */
  ENABLE_EXPERIMENTAL: 'enableExperimentalFeatures',
} as const;

export type FeatureFlag = (typeof FeatureFlag)[keyof typeof FeatureFlag];

/**
 * Check if a feature flag is enabled
 *
 * @param flag - The feature flag to check
 * @returns true if the feature is enabled, false otherwise
 *
 * @example
 * ```typescript
 * import { isFeatureEnabled, FeatureFlag } from '@/utils/featureFlags';
 *
 * if (isFeatureEnabled(FeatureFlag.USE_TAB_STATE_HOOK)) {
 *   // Use new tab state management
 *   const tabState = useTabState(tabId, ...);
 * } else {
 *   // Use legacy localStorage approach
 *   const content = localStorage.getItem(`puml-content-${tabId}`);
 * }
 * ```
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  try {
    const settings = SettingsService.loadSettings();
    const flags = settings.umlFlows.featureFlags;

    switch (flag) {
      case FeatureFlag.USE_TAB_STATE_HOOK:
        return flags.useTabStateHook;
      case FeatureFlag.ENABLE_EXPERIMENTAL:
        return flags.enableExperimentalFeatures;
      default:
        return false;
    }
  } catch (error) {
    console.error('Failed to check feature flag:', error);
    // Fail safe: default to enabled for USE_TAB_STATE_HOOK (current implementation)
    if (flag === FeatureFlag.USE_TAB_STATE_HOOK) {
      return true;
    }
    return false;
  }
}

/**
 * Enable or disable a feature flag
 *
 * @param flag - The feature flag to modify
 * @param enabled - Whether to enable or disable the flag
 *
 * @example
 * ```typescript
 * import { setFeatureFlag, FeatureFlag } from '@/utils/featureFlags';
 *
 * // Disable new tab state hook (rollback to legacy behavior)
 * setFeatureFlag(FeatureFlag.USE_TAB_STATE_HOOK, false);
 * ```
 */
export function setFeatureFlag(flag: FeatureFlag, enabled: boolean): void {
  try {
    const settings = SettingsService.loadSettings();

    switch (flag) {
      case FeatureFlag.USE_TAB_STATE_HOOK:
        settings.umlFlows.featureFlags.useTabStateHook = enabled;
        break;
      case FeatureFlag.ENABLE_EXPERIMENTAL:
        settings.umlFlows.featureFlags.enableExperimentalFeatures = enabled;
        break;
      default:
        return;
    }

    SettingsService.saveSettings(settings);
  } catch (error) {
    console.error('Failed to set feature flag:', error);
    throw error;
  }
}

/**
 * Get all feature flags and their current states
 *
 * @returns Object mapping feature flag names to their enabled state
 */
export function getAllFeatureFlags(): Record<string, boolean> {
  try {
    const settings = SettingsService.loadSettings();
    return {
      [FeatureFlag.USE_TAB_STATE_HOOK]:
        settings.umlFlows.featureFlags.useTabStateHook,
      [FeatureFlag.ENABLE_EXPERIMENTAL]:
        settings.umlFlows.featureFlags.enableExperimentalFeatures,
    };
  } catch (error) {
    console.error('Failed to get feature flags:', error);
    return {
      [FeatureFlag.USE_TAB_STATE_HOOK]: true,
      [FeatureFlag.ENABLE_EXPERIMENTAL]: false,
    };
  }
}

/**
 * Feature flag metadata for UI and documentation
 */
export const FEATURE_FLAG_METADATA: Record<
  FeatureFlag,
  {
    name: string;
    description: string;
    category: 'stable' | 'beta' | 'experimental';
    rollbackInstructions: string;
    relatedTask?: string;
  }
> = {
  [FeatureFlag.USE_TAB_STATE_HOOK]: {
    name: 'useTabState Hook',
    description:
      'Use the new useTabState hook for centralized tab state management. Provides single source of truth for PlantUML content, canvas state, and view mode.',
    category: 'beta',
    rollbackInstructions: `
      If you encounter issues with tab state (content loss, view switching bugs):
      1. Disable this flag in Settings > UML Flows > Feature Flags
      2. Reload the application
      3. Your content will be read from legacy localStorage keys
      4. Report the issue with steps to reproduce
    `,
    relatedTask: 'TASK-002',
  },
  [FeatureFlag.ENABLE_EXPERIMENTAL]: {
    name: 'Experimental Features',
    description:
      'Enable experimental and beta features across the application. May be unstable.',
    category: 'experimental',
    rollbackInstructions: `
      To disable experimental features:
      1. Disable this flag in Settings > UML Flows > Feature Flags
      2. Reload the application
      3. Only stable features will be available
    `,
  },
};
