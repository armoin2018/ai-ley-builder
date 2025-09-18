import React from 'react';
import { Folder, Save, RotateCcw, FolderTree, FileText, Users, Database, Grid3X3, Terminal } from 'lucide-react';
import { Button, Input, Label } from '../../../shared/components';
import { useSettings } from '../../../hooks/useSettings';
import { AI_LEY_DISPLAY_PATHS, AI_LEY_PATHS } from '../../../utils/paths';

export function UMLFlowsSettings() {
  const { settings, updateUMLFlowsSettings } = useSettings();
  const { umlFlows } = settings;

  const handleStorageFolderChange = (value: string) => {
    updateUMLFlowsSettings({ storageFolder: value });
  };

  const handleBackupFolderChange = (value: string) => {
    updateUMLFlowsSettings({ backupFolder: value });
  };

  const handleAutoSaveChange = (enabled: boolean) => {
    updateUMLFlowsSettings({ autoSave: enabled });
  };

  const handleBackupEnabledChange = (enabled: boolean) => {
    updateUMLFlowsSettings({ backupEnabled: enabled });
  };

  const handleAutoArrangeSettingChange = (setting: string, value: number | boolean) => {
    updateUMLFlowsSettings({
      autoArrange: {
        ...umlFlows.autoArrange,
        [setting]: value,
      },
    });
  };

  const handleScriptNodeSettingChange = (setting: string, value: any) => {
    updateUMLFlowsSettings({
      scriptNodes: {
        ...umlFlows.scriptNodes,
        [setting]: value,
      },
    });
  };

  const handleExecutorChange = (executorId: string, field: string, value: any) => {
    const updatedExecutors = umlFlows.scriptNodes.executors.map(executor =>
      executor.id === executorId
        ? { ...executor, [field]: value }
        : executor
    );

    handleScriptNodeSettingChange('executors', updatedExecutors);
  };

  const resetToDefaults = () => {
    updateUMLFlowsSettings({
      storageFolder: AI_LEY_PATHS.UML_FLOWS_USER,
      autoSave: true,
      backupEnabled: false,
      backupFolder: undefined,
      autoArrange: {
        connectionSpacing: 50,
        enableConnectionAwareSpacing: true,
        horizontalSpacing: 300,
        verticalSpacing: 150,
        minSpacing: 50,
        enableCollisionDetection: true,
      },
      scriptNodes: {
        enablePalette: true,
        defaultTimeout: 30,
        executors: [
          {
            id: 'shell',
            name: 'Shell Script',
            command: 'sh',
            args: ['-c'],
            timeout: 30,
            enabled: true,
            icon: '🐚',
            color: 'bg-slate-50/50 border-slate-100 hover:border-slate-200',
            description: 'Execute shell/bash scripts',
          },
          {
            id: 'python',
            name: 'Python Script',
            command: 'python3',
            args: ['-c'],
            timeout: 30,
            enabled: true,
            icon: '🐍',
            color: 'bg-blue-50/50 border-blue-100 hover:border-blue-200',
            description: 'Execute Python scripts',
          },
          {
            id: 'php',
            name: 'PHP Script',
            command: 'php',
            args: ['-r'],
            timeout: 30,
            enabled: true,
            icon: '🐘',
            color: 'bg-purple-50/50 border-purple-100 hover:border-purple-200',
            description: 'Execute PHP scripts',
          },
          {
            id: 'nodejs',
            name: 'Node.js Script',
            command: 'node',
            args: ['-e'],
            timeout: 30,
            enabled: true,
            icon: '🟢',
            color: 'bg-green-50/50 border-green-100 hover:border-green-200',
            description: 'Execute Node.js/JavaScript scripts',
          },
        ],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <Folder className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">UML Flows Configuration</h3>
          <p className="text-sm text-slate-600">Configure storage and backup settings for your UML flow files</p>
        </div>
      </div>

      {/* AI-LEY Path Configuration */}
      <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 pb-2 border-b border-blue-200">
          <FolderTree className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="text-base font-medium text-slate-900">AI-LEY Path Configuration</h4>
            <p className="text-xs text-slate-600">Standard paths for AI-LEY system resources (read-only)</p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-3 p-2 bg-white rounded border border-blue-100">
            <FileText className="w-4 h-4 text-blue-500" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-700">Global Instructions</div>
              <div className="text-xs text-slate-500 font-mono truncate">{AI_LEY_DISPLAY_PATHS.GLOBAL_INSTRUCTIONS}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 bg-white rounded border border-blue-100">
            <FileText className="w-4 h-4 text-green-500" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-700">Instructions</div>
              <div className="text-xs text-slate-500 font-mono truncate">{AI_LEY_DISPLAY_PATHS.INSTRUCTIONS}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 bg-white rounded border border-blue-100">
            <Users className="w-4 h-4 text-purple-500" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-700">Personas</div>
              <div className="text-xs text-slate-500 font-mono truncate">{AI_LEY_DISPLAY_PATHS.PERSONAS}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 bg-white rounded border border-blue-100">
            <Database className="w-4 h-4 text-orange-500" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-700">Variables</div>
              <div className="text-xs text-slate-500 font-mono truncate">{AI_LEY_DISPLAY_PATHS.VARIABLES}</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 italic">
          Note: The .ai-ley folder is located at the root of the GitHub project and these paths are fixed.
        </div>
      </div>

      <div className="grid gap-6">
        {/* Storage Folder */}
        <div className="space-y-2">
          <Label htmlFor="storage-folder" className="text-sm font-medium text-slate-700">
            Storage Folder
          </Label>
          <div className="space-y-1">
            <Input
              id="storage-folder"
              type="text"
              value={umlFlows.storageFolder}
              onChange={(e) => handleStorageFolderChange(e.target.value)}
              placeholder="Enter storage folder path"
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              Folder where UML flow files will be stored. Relative to project root.
            </p>
          </div>
        </div>

        {/* Auto Save */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">Auto Save</Label>
            <p className="text-xs text-slate-500">
              Automatically save changes to UML flow files
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={umlFlows.autoSave}
              onChange={(e) => handleAutoSaveChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Backup Settings */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-700">Enable Backups</Label>
              <p className="text-xs text-slate-500">
                Create backup copies of UML flow files
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={umlFlows.backupEnabled}
                onChange={(e) => handleBackupEnabledChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {umlFlows.backupEnabled && (
            <div className="space-y-2">
              <Label htmlFor="backup-folder" className="text-sm font-medium text-slate-700">
                Backup Folder
              </Label>
              <div className="space-y-1">
                <Input
                  id="backup-folder"
                  type="text"
                  value={umlFlows.backupFolder || ''}
                  onChange={(e) => handleBackupFolderChange(e.target.value)}
                  placeholder="Enter backup folder path (optional)"
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Folder for backup files. If empty, backups will be stored in the storage folder.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Auto-Arrange Settings */}
        <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3 pb-2 border-b border-green-200">
            <Grid3X3 className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="text-base font-medium text-slate-900">Auto-Arrange Settings</h4>
              <p className="text-xs text-slate-600">Configure how nodes are automatically arranged based on connections</p>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Connection Spacing */}
            <div className="space-y-2">
              <Label htmlFor="connection-spacing" className="text-sm font-medium text-slate-700">
                Connection Spacing (px)
              </Label>
              <div className="space-y-1">
                <Input
                  id="connection-spacing"
                  type="number"
                  value={umlFlows.autoArrange.connectionSpacing}
                  onChange={(e) => handleAutoArrangeSettingChange('connectionSpacing', parseInt(e.target.value) || 50)}
                  min="10"
                  max="200"
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Extra spacing between connected nodes (input/output handles)
                </p>
              </div>
            </div>

            {/* Enable Connection-Aware Spacing */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-700">Connection-Aware Spacing</Label>
                <p className="text-xs text-slate-500">
                  Add extra spacing between nodes based on their connections
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={umlFlows.autoArrange.enableConnectionAwareSpacing}
                  onChange={(e) => handleAutoArrangeSettingChange('enableConnectionAwareSpacing', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {/* Horizontal Spacing */}
            <div className="space-y-2">
              <Label htmlFor="horizontal-spacing" className="text-sm font-medium text-slate-700">
                Horizontal Spacing (px)
              </Label>
              <div className="space-y-1">
                <Input
                  id="horizontal-spacing"
                  type="number"
                  value={umlFlows.autoArrange.horizontalSpacing}
                  onChange={(e) => handleAutoArrangeSettingChange('horizontalSpacing', parseInt(e.target.value) || 300)}
                  min="100"
                  max="800"
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Base horizontal spacing between node columns
                </p>
              </div>
            </div>

            {/* Vertical Spacing */}
            <div className="space-y-2">
              <Label htmlFor="vertical-spacing" className="text-sm font-medium text-slate-700">
                Vertical Spacing (px)
              </Label>
              <div className="space-y-1">
                <Input
                  id="vertical-spacing"
                  type="number"
                  value={umlFlows.autoArrange.verticalSpacing}
                  onChange={(e) => handleAutoArrangeSettingChange('verticalSpacing', parseInt(e.target.value) || 150)}
                  min="50"
                  max="400"
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Base vertical spacing between node layers
                </p>
              </div>
            </div>

            {/* Minimum Spacing */}
            <div className="space-y-2">
              <Label htmlFor="min-spacing" className="text-sm font-medium text-slate-700">
                Minimum Spacing (px)
              </Label>
              <div className="space-y-1">
                <Input
                  id="min-spacing"
                  type="number"
                  value={umlFlows.autoArrange.minSpacing}
                  onChange={(e) => handleAutoArrangeSettingChange('minSpacing', parseInt(e.target.value) || 50)}
                  min="10"
                  max="100"
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Minimum spacing to prevent node overlap
                </p>
              </div>
            </div>

            {/* Enable Collision Detection */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-700">Collision Detection</Label>
                <p className="text-xs text-slate-500">
                  Automatically adjust positions to prevent node overlaps
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={umlFlows.autoArrange.enableCollisionDetection}
                  onChange={(e) => handleAutoArrangeSettingChange('enableCollisionDetection', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Script Node Settings */}
        <div className="space-y-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3 pb-2 border-b border-orange-200">
            <Terminal className="w-5 h-5 text-orange-600" />
            <div>
              <h4 className="text-base font-medium text-slate-900">Script Node Settings</h4>
              <p className="text-xs text-slate-600">Configure script execution environments and node palette visibility</p>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Enable Script Nodes in Palette */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-slate-700">Enable Script Nodes</Label>
                <p className="text-xs text-slate-500">
                  Show script execution nodes in the node palette
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={umlFlows.scriptNodes.enablePalette}
                  onChange={(e) => handleScriptNodeSettingChange('enablePalette', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            {/* Default Timeout */}
            <div className="space-y-2">
              <Label htmlFor="default-timeout" className="text-sm font-medium text-slate-700">
                Default Timeout (seconds)
              </Label>
              <div className="space-y-1">
                <Input
                  id="default-timeout"
                  type="number"
                  value={umlFlows.scriptNodes.defaultTimeout}
                  onChange={(e) => handleScriptNodeSettingChange('defaultTimeout', parseInt(e.target.value) || 30)}
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
            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Script Executors</Label>
              <p className="text-xs text-slate-500">Configure commands and settings for each script type</p>

              <div className="space-y-3">
                {umlFlows.scriptNodes.executors.map((executor) => (
                  <div key={executor.id} className="bg-white rounded border border-orange-100 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg" role="img" aria-label={executor.name}>
                          {executor.icon}
                        </span>
                        <span className="font-medium text-slate-700">{executor.name}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={executor.enabled}
                          onChange={(e) => handleExecutorChange(executor.id, 'enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-slate-600">Command</Label>
                        <Input
                          value={executor.command}
                          onChange={(e) => handleExecutorChange(executor.id, 'command', e.target.value)}
                          className="text-xs"
                          placeholder="e.g., python3"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-slate-600">Timeout (s)</Label>
                        <Input
                          type="number"
                          value={executor.timeout}
                          onChange={(e) => handleExecutorChange(executor.id, 'timeout', parseInt(e.target.value) || 30)}
                          min="1"
                          max="300"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600">Arguments</Label>
                      <Input
                        value={executor.args.join(' ')}
                        onChange={(e) => handleExecutorChange(executor.id, 'args', e.target.value.split(' ').filter(Boolean))}
                        className="text-xs font-mono"
                        placeholder="e.g., -c"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-600">Description</Label>
                      <Input
                        value={executor.description}
                        onChange={(e) => handleExecutorChange(executor.id, 'description', e.target.value)}
                        className="text-xs"
                        placeholder="Brief description of this executor"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}