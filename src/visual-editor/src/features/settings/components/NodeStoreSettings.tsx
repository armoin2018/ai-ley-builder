// React import removed
import { Clock, Globe, Package, RefreshCw, RotateCcw } from 'lucide-react';
import { Button, Input, Label } from '../../../shared/components';
import { useSettings } from '../../../hooks/useSettings';

export function NodeStoreSettings() {
  const { settings, updateNodeStoreSettings } = useSettings();
  const { nodeStore } = settings;

  const handleSettingChange = (
    setting: keyof typeof nodeStore,
    value: string | boolean | number
  ) => {
    updateNodeStoreSettings({ [setting]: value });
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
        <Package className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Node Palette Store
          </h3>
          <p className="text-sm text-slate-600">
            Configure the node palette store for downloading and managing custom
            nodes
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="nodeStore-enabled"
              checked={nodeStore.enabled}
              onChange={e => handleEnabledChange(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <Label
              htmlFor="nodeStore-enabled"
              className="text-sm font-medium text-slate-700"
            >
              Enable Node Store
            </Label>
          </div>
          <p className="text-xs text-slate-500 ml-7">
            Enable downloading and managing nodes from the store
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="nodeStore-url"
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            <Globe className="w-4 h-4 text-blue-500" />
            Store URL
          </Label>
          <div className="space-y-1">
            <Input
              id="nodeStore-url"
              type="url"
              value={nodeStore.storeUrl}
              onChange={e => handleUrlChange(e.target.value)}
              placeholder="https://github.com/user/ai-ley-nodes"
              className="w-full font-mono text-sm"
              disabled={!nodeStore.enabled}
            />
            <p className="text-xs text-slate-500">
              GitHub repository URL for the node store
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="nodeStore-autoUpdate"
              checked={nodeStore.autoUpdate}
              onChange={e => handleAutoUpdateChange(e.target.checked)}
              disabled={!nodeStore.enabled}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
            />
            <Label
              htmlFor="nodeStore-autoUpdate"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-green-500" />
              Auto Update
            </Label>
          </div>
          <p className="text-xs text-slate-500 ml-7">
            Automatically check for and download node updates
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="nodeStore-cacheDuration"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-orange-500" />
              Cache Duration (minutes)
            </Label>
            <div className="space-y-1">
              <Input
                id="nodeStore-cacheDuration"
                type="number"
                min="0"
                max="1440"
                value={nodeStore.cacheDuration}
                onChange={e =>
                  handleCacheDurationChange(parseInt(e.target.value))
                }
                className="w-full"
                disabled={!nodeStore.enabled}
              />
              <p className="text-xs text-slate-500">
                How long to cache store data (0-1440 minutes)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="nodeStore-retryAttempts"
              className="text-sm font-medium text-slate-700 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-purple-500" />
              Retry Attempts
            </Label>
            <div className="space-y-1">
              <Input
                id="nodeStore-retryAttempts"
                type="number"
                min="0"
                max="10"
                value={nodeStore.retryAttempts}
                onChange={e =>
                  handleRetryAttemptsChange(parseInt(e.target.value))
                }
                className="w-full"
                disabled={!nodeStore.enabled}
              />
              <p className="text-xs text-slate-500">
                Number of times to retry failed requests (0-10)
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900">
                Node Store Features
              </h4>
              <p className="text-sm text-blue-800 mt-1">
                The node store allows you to:
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>Browse and download custom nodes from GitHub</li>
                <li>Enable/disable nodes in your palette</li>
                <li>Update nodes to their latest versions</li>
                <li>Share your own custom nodes with the community</li>
                <li>Copy and edit existing nodes</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="text-xs text-slate-600">
            <strong>Note:</strong> The store URL should point to a GitHub
            repository containing node definitions. Changes take effect after
            saving settings. Ensure you have internet access to download nodes
            from remote repositories.
          </div>
        </div>
      </div>
    </div>
  );
}
