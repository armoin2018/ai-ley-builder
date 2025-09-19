import React from 'react';
import { Database, FileText, FolderTree, Users } from 'lucide-react';
import { Input, Label } from '../../../shared/components';
import { useSettings } from '../../../hooks/useSettings';
import { getGitRoot } from '../../../utils/paths';

export function AILeyPathsSettings() {
  const { settings, updateAILeyPathSettings } = useSettings();
  const { aiLeyPaths } = settings;

  const handlePathChange = (
    pathKey: keyof typeof aiLeyPaths,
    value: string
  ) => {
    updateAILeyPathSettings({ [pathKey]: value });
  };

  const detectedRoot = getGitRoot();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <FolderTree className="w-5 h-5 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            AI-LEY Path Configuration
          </h3>
          <p className="text-sm text-slate-600">
            Configure paths for AI-LEY system resources
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="global-instructions"
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-blue-500" />
            Global Instructions
          </Label>
          <div className="space-y-1">
            <Input
              id="global-instructions"
              type="text"
              value={aiLeyPaths.globalInstructions}
              onChange={e =>
                handlePathChange('globalInstructions', e.target.value)
              }
              placeholder="Path to global instructions file"
              className="w-full font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              Path to the main global instructions file
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="instructions"
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-green-500" />
            Instructions Directory
          </Label>
          <div className="space-y-1">
            <Input
              id="instructions"
              type="text"
              value={aiLeyPaths.instructions}
              onChange={e => handlePathChange('instructions', e.target.value)}
              placeholder="Path to instructions directory"
              className="w-full font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              Directory containing instruction files
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="personas"
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            <Users className="w-4 h-4 text-purple-500" />
            Personas Directory
          </Label>
          <div className="space-y-1">
            <Input
              id="personas"
              type="text"
              value={aiLeyPaths.personas}
              onChange={e => handlePathChange('personas', e.target.value)}
              placeholder="Path to personas directory"
              className="w-full font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              Directory containing persona definition files
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="variables"
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            <Database className="w-4 h-4 text-orange-500" />
            Variables Directory
          </Label>
          <div className="space-y-1">
            <Input
              id="variables"
              type="text"
              value={aiLeyPaths.variables}
              onChange={e => handlePathChange('variables', e.target.value)}
              placeholder="Path to variables directory"
              className="w-full font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              Directory containing variable definition files
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="prompts"
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-indigo-500" />
            Prompts Directory
          </Label>
          <div className="space-y-1">
            <Input
              id="prompts"
              type="text"
              value={aiLeyPaths.prompts}
              onChange={e => handlePathChange('prompts', e.target.value)}
              placeholder="Path to prompts directory"
              className="w-full font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              Directory containing prompt template files
            </p>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-xs text-slate-600">
          <strong>Note:</strong> These paths are relative to your project root.
          Changes affect how the system locates AI-LEY resources. Make sure the
          directories exist and are accessible.
        </div>
        <div className="mt-2 pt-2 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            <strong>Detected Root:</strong>{' '}
            <span className="font-mono bg-white px-1 py-0.5 rounded border">
              {detectedRoot}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
