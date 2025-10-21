// React import removed
import { Clock, GitBranch, Globe, RefreshCw, RotateCcw } from 'lucide-react';
import { Button, Input, Label } from '../../../shared/components';
import { useSettings } from '../../../hooks/useSettings';

export function FlowStoreSettings() {
  const { settings, updateFlowStoreSettings } = useSettings();
  const { flowStore } = settings;

  const handleSettingChange = (
    setting: keyof typeof flowStore,
    value: string | boolean | number
  ) => {
    updateFlowStoreSettings({ [setting]: value });
  };

  const handleUrlChange = (value: string) => {
    handleSettingChange('storeUrl', value);
  };

  const handleEnabledChange = (enabled: boolean) => {
    handleSettingChange('enabled', enabled);
  };

  const handleAutoUpdateChange = (autoUpdate: boolean) => {
    handleSettingChange('autoUpdate', autoUpdate);
  };

  const handleCacheDurationChange = (cacheDuration: number) => {
    handleSettingChange('cacheDuration', cacheDuration);
  };

  const handleRetryAttemptsChange = (retryAttempts: number) => {
    handleSettingChange('retryAttempts', retryAttempts);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <GitBranch className="w-5 h-5 text-green-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Flow Templates Store
          </h3>
          <p className="text-sm text-slate-600">
            Configure the flow store for downloading and managing workflow
            templates
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="flowStore-enabled"
              checked={flowStore.enabled}
              onChange={e => handleEnabledChange(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            <Label
              htmlFor="flowStore-enabled"
              className="text-sm font-medium text-slate-700"
            >
              Enable Flow Store
            </Label>
          </div>
          <p className="text-xs text-slate-500 ml-7">
            Enable downloading and managing workflow templates from the store
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="flowStore-url"
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-green-500" />
            Store URL
          </Label>
          <div className="space-y-1">
            <Input
              id="flowStore-url"
              type="url"
              value={flowStore.storeUrl}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://github.com/user/ai-ley-flows"
              className="w-full font-mono text-sm"
              disabled={!flowStore.enabled}
            />
            <p className="text-xs text-slate-500">
              GitHub repository URL for the flow store
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="flowStore-autoUpdate"
              checked={flowStore.autoUpdate}
              onChange={e => handleAutoUpdateChange(e.target.checked)}
              disabled={!flowStore.enabled}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 disabled:opacity-50"
            />
            <Label
              htmlFor="flowStore-autoUpdate"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-blue-500" />
              Auto Update
            </Label>
          </div>
          <p className="text-xs text-slate-500 ml-7">
            Automatically check for and download flow template updates
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="flowStore-cacheDuration"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-orange-500" />
              Cache Duration (minutes)
            </Label>
            <div className="space-y-1">
              <Input
                id="flowStore-cacheDuration"
                type="number"
                min="0"
                max="1440"
                value={flowStore.cacheDuration}
                onChange={e =>
                  handleCacheDurationChange(parseInt(e.target.value))
                }
                className="w-full"
                disabled={!flowStore.enabled}
              />
              <p className="text-xs text-slate-500">
                How long to cache store data (0-1440 minutes)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="flowStore-retryAttempts"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-purple-500" />
              Retry Attempts
            </Label>
            <div className="space-y-1">
              <Input
                id="flowStore-retryAttempts"
                type="number"
                min="0"
                max="10"
                value={flowStore.retryAttempts}
                onChange={e =>
                  handleRetryAttemptsChange(parseInt(e.target.value))
                }
                className="w-full"
                disabled={!flowStore.enabled}
              />
              <p className="text-xs text-slate-500">
                Number of times to retry failed requests (0-10)
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start gap-3">
            <GitBranch className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-900">
                Flow Store Features
              </h4>
              <p className="text-sm text-green-800 mt-1">
                The flow store allows you to:
              </p>
              <ul className="text-sm text-green-800 mt-2 space-y-1 list-disc list-inside">
                <li>Browse and download pre-built workflow templates</li>
                <li>Enable/disable flows in your workspace</li>
                <li>Update flows to their latest versions</li>
                <li>Share your own workflow templates with the community</li>
                <li>Copy and edit existing flows for customization</li>
                <li>Import flows directly into your current workspace</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-600">
            <strong>Note:</strong> The store URL should point to a GitHub
            repository containing flow template definitions in PlantUML format.
            Changes take effect after saving settings. Ensure you have internet
            access to download flows from remote repositories.
          </div>
        </div>
      </div>
    </div>
  );
}
