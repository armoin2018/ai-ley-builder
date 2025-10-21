// React import removed
import { Folder, Save } from 'lucide-react';
import { Input, Label } from '../../../shared/components';
import { useSettings } from '../../../hooks/useSettings';

export function StorageBackupSettings() {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <Folder className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Storage & Backup Settings
          </h3>
          <p className="text-sm text-slate-600">
            Configure storage locations and backup options for UML flow files
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Storage Folder */}
        <div className="space-y-2">
          <Label
            htmlFor="storage-folder"
            className="text-sm font-medium text-slate-700"
          >
            Storage Folder
          </Label>
          <div className="space-y-1">
            <Input
              id="storage-folder"
              type="text"
              value={umlFlows.storageFolder}
              onChange={e => handleStorageFolderChange(e.target.value)}
              placeholder="Enter storage folder path"
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              Folder where UML flow files will be stored. Relative to project
              root.
            </p>
          </div>
        </div>

        {/* Auto Save */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">
              Auto Save
            </Label>
            <p className="text-xs text-slate-500">
              Automatically save changes to UML flow files
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={umlFlows.autoSave}
              onChange={e => handleAutoSaveChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Backup Settings */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Enable Backups
              </Label>
              <p className="text-xs text-slate-500">
                Create backup copies of UML flow files
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={umlFlows.backupEnabled}
                onChange={e => handleBackupEnabledChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {umlFlows.backupEnabled && (
            <div className="space-y-2">
              <Label
                htmlFor="backup-folder"
                className="text-sm font-medium text-slate-700"
              >
                Backup Folder
              </Label>
              <div className="space-y-1">
                <Input
                  id="backup-folder"
                  type="text"
                  value={umlFlows.backupFolder || ''}
                  onChange={e => handleBackupFolderChange(e.target.value)}
                  placeholder="Enter backup folder path (optional)"
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Folder for backup files. If empty, backups will be stored in
                  the storage folder.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
