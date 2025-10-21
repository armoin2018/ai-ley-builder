// React import removed
import { Terminal } from 'lucide-react';
import { Input, Label } from '../../../shared/components';
import { useSettings } from '../../../hooks/useSettings';

export function ScriptNodeSettings() {
  const { settings, updateUMLFlowsSettings } = useSettings();
  const { umlFlows } = settings;

  const handleScriptNodeSettingChange = (setting: string, value: any) => {
    updateUMLFlowsSettings({
      scriptNodes: {
        ...umlFlows.scriptNodes,
        [setting]: value,
      },
    });
  };

  const handleExecutorChange = (
    executorId: string,
    field: string,
    value: any
  ) => {
    const updatedExecutors = umlFlows.scriptNodes.executors.map(executor =>
      executor.id === executorId ? { ...executor, [field]: value } : executor
    );

    handleScriptNodeSettingChange('executors', updatedExecutors);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <Terminal className="w-5 h-5 text-orange-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Script Node Settings
          </h3>
          <p className="text-sm text-slate-600">
            Configure script execution environments and node palette visibility
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Enable Script Nodes in Palette */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">
              Enable Script Nodes
            </Label>
            <p className="text-xs text-slate-500">
              Show script execution nodes in the node palette
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={umlFlows.scriptNodes.enablePalette}
              onChange={e =>
                handleScriptNodeSettingChange('enablePalette', e.target.checked)
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>

        {/* Default Timeout */}
        <div className="space-y-2">
          <Label
            htmlFor="default-timeout"
            className="text-sm font-medium text-slate-700"
          >
            Default Timeout (seconds)
          </Label>
          <div className="space-y-1">
            <Input
              id="default-timeout"
              type="number"
              value={umlFlows.scriptNodes.defaultTimeout}
              onChange={e =>
                handleScriptNodeSettingChange(
                  'defaultTimeout',
                  parseInt(e.target.value) || 30
                )
              }
              min="1"
              max="300"
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              Default timeout for new script execution nodes
            </p>
          </div>
        </div>

        {/* Script Executors */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-slate-700">
              Script Executors
            </Label>
            <p className="text-xs text-slate-500 mt-1">
              Configure commands and settings for each script type
            </p>
          </div>

          <div className="space-y-4">
            {umlFlows.scriptNodes.executors.map(executor => (
              <div
                key={executor.id}
                className="bg-white rounded border border-orange-100 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-lg"
                      role="img"
                      aria-label={executor.name}
                    >
                      {executor.icon}
                    </span>
                    <span className="font-medium text-slate-700">
                      {executor.name}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={executor.enabled}
                      onChange={e =>
                        handleExecutorChange(
                          executor.id,
                          'enabled',
                          e.target.checked
                        )
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-600">
                      Command
                    </Label>
                    <Input
                      value={executor.command}
                      onChange={e =>
                        handleExecutorChange(
                          executor.id,
                          'command',
                          e.target.value
                        )
                      }
                      className="text-xs"
                      placeholder="e.g., python3"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-slate-600">
                      Timeout (s)
                    </Label>
                    <Input
                      type="number"
                      value={executor.timeout}
                      onChange={e =>
                        handleExecutorChange(
                          executor.id,
                          'timeout',
                          parseInt(e.target.value) || 30
                        )
                      }
                      min="1"
                      max="300"
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-600">
                    Arguments
                  </Label>
                  <Input
                    value={executor.args.join(' ')}
                    onChange={e =>
                      handleExecutorChange(
                        executor.id,
                        'args',
                        e.target.value.split(' ').filter(Boolean)
                      )
                    }
                    className="text-xs font-mono"
                    placeholder="e.g., -c"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-slate-600">
                    Description
                  </Label>
                  <Input
                    value={executor.description}
                    onChange={e =>
                      handleExecutorChange(
                        executor.id,
                        'description',
                        e.target.value
                      )
                    }
                    className="text-xs"
                    placeholder="Brief description of this executor"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
        <div className="text-xs text-orange-700">
          <strong>Security Note:</strong> Script execution nodes run commands on
          your system. Only enable trusted executors and ensure commands are
          properly configured.
        </div>
      </div>
    </div>
  );
}
