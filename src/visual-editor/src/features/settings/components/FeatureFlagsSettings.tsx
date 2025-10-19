import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
import {
    FEATURE_FLAG_METADATA,
    FeatureFlag,
} from '../../../utils/featureFlags';

export function FeatureFlagsSettings() {
  const { settings, updateUMLFlowsSettings } = useSettings();
  const flags = settings.umlFlows.featureFlags;

  const handleToggle = (flag: keyof typeof flags) => {
    updateUMLFlowsSettings({
      featureFlags: {
        ...flags,
        [flag]: !flags[flag],
      },
    });
  };

  const getCategoryBadge = (category: 'stable' | 'beta' | 'experimental') => {
    switch (category) {
      case 'stable':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Stable
          </span>
        );
      case 'beta':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Shield className="w-3 h-3" />
            Beta
          </span>
        );
      case 'experimental':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3" />
            Experimental
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-blue-900">
              Feature Flags
            </h3>
            <p className="text-sm text-blue-700">
              Control experimental and beta features. Toggle features on/off for
              safe rollout and testing. Changes take effect after page reload.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* useTabState Hook Feature Flag */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="flag-useTabStateHook"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {FEATURE_FLAG_METADATA[FeatureFlag.USE_TAB_STATE_HOOK].name}
                </label>
                {getCategoryBadge(
                  FEATURE_FLAG_METADATA[FeatureFlag.USE_TAB_STATE_HOOK].category
                )}
              </div>

              <p className="text-sm text-gray-600">
                {
                  FEATURE_FLAG_METADATA[FeatureFlag.USE_TAB_STATE_HOOK]
                    .description
                }
              </p>

              {FEATURE_FLAG_METADATA[FeatureFlag.USE_TAB_STATE_HOOK]
                .relatedTask && (
                <div className="text-xs text-gray-500">
                  Related:{' '}
                  <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                    {
                      FEATURE_FLAG_METADATA[FeatureFlag.USE_TAB_STATE_HOOK]
                        .relatedTask
                    }
                  </span>
                </div>
              )}

              {!flags.useTabStateHook && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-2">
                  <p className="text-sm font-medium text-amber-900 mb-2">
                    ⚠️ Rollback Mode Active
                  </p>
                  <div className="text-xs text-amber-800 whitespace-pre-line">
                    {
                      FEATURE_FLAG_METADATA[FeatureFlag.USE_TAB_STATE_HOOK]
                        .rollbackInstructions
                    }
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="flag-useTabStateHook"
                  type="checkbox"
                  checked={flags.useTabStateHook}
                  onChange={() => handleToggle('useTabStateHook')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Experimental Features Flag */}
        <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="flag-enableExperimentalFeatures"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  {FEATURE_FLAG_METADATA[FeatureFlag.ENABLE_EXPERIMENTAL].name}
                </label>
                {getCategoryBadge(
                  FEATURE_FLAG_METADATA[FeatureFlag.ENABLE_EXPERIMENTAL]
                    .category
                )}
              </div>

              <p className="text-sm text-gray-600">
                {
                  FEATURE_FLAG_METADATA[FeatureFlag.ENABLE_EXPERIMENTAL]
                    .description
                }
              </p>

              {flags.enableExperimentalFeatures && (
                <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-2">
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    ⚠️ Warning
                  </p>
                  <p className="text-xs text-amber-800">
                    Experimental features may be unstable and change without
                    notice. Use at your own risk in production environments.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  id="flag-enableExperimentalFeatures"
                  type="checkbox"
                  checked={flags.enableExperimentalFeatures}
                  onChange={() => handleToggle('enableExperimentalFeatures')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          💡 How Feature Flags Work
        </h4>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Toggle features on/off without code changes</li>
          <li>Changes take effect after reloading the page</li>
          <li>
            Disabled features revert to legacy behavior (safe rollback)
          </li>
          <li>Settings are saved locally in browser storage</li>
        </ul>
      </div>
    </div>
  );
}
