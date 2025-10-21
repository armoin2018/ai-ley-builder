import { Edit2, Plus, Settings, Terminal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '../../../hooks/useSettings';
import { Button, Input, Label } from '../../../shared/components';
import type { LocalAITool } from '../../../types/settings';

export function LocalAISettings() {
  const {
    settings,
    saveLocalAITool,
    removeLocalAITool,
    updateLocalAISettings,
  } = useSettings();
  const { localAI } = settings;
  const [editingTool, setEditingTool] = useState<LocalAITool | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTool = () => {
    const newTool: LocalAITool = {
      id: `tool_${Date.now()}`,
      name: '',
      command: '',
      args: [],
      description: '',
      enabled: false,
    };
    setEditingTool(newTool);
    setIsCreating(true);
  };

  const handleEditTool = (tool: LocalAITool) => {
    setEditingTool({ ...tool });
    setIsCreating(false);
  };

  const handleSaveTool = () => {
    if (editingTool && editingTool.name.trim() && editingTool.command.trim()) {
      saveLocalAITool(editingTool);
      setEditingTool(null);
      setIsCreating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTool(null);
    setIsCreating(false);
  };

  const handleDeleteTool = (toolId: string) => {
    if (confirm('Are you sure you want to delete this AI tool?')) {
      removeLocalAITool(toolId);
    }
  };

  const handleTimeoutChange = (timeout: number) => {
    updateLocalAISettings({ timeout });
  };

  const handleDefaultToolChange = (defaultTool: string) => {
    updateLocalAISettings({ defaultTool });
  };

  const updateEditingTool = (updates: Partial<LocalAITool>) => {
    if (editingTool) {
      setEditingTool({ ...editingTool, ...updates });
    }
  };

  const parseArgs = (argsString: string): string[] => {
    return argsString
      .split(',')
      .map(arg => arg.trim())
      .filter(Boolean);
  };

  const formatArgs = (args: string[]): string => {
    return args.join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <Terminal className="w-5 h-5 text-green-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Local AI Tools
          </h3>
          <p className="text-sm text-slate-600">
            Configure local AI CLI tools and command-line interfaces
          </p>
        </div>
      </div>

      {/* Global Settings */}
      <div className="grid gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Global Settings
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="timeout"
              className="text-sm font-medium text-slate-700"
            >
              Timeout (seconds)
            </Label>
            <Input
              id="timeout"
              type="number"
              min="1"
              max="300"
              value={localAI.timeout}
              onChange={e =>
                handleTimeoutChange(parseInt(e.target.value) || 30)
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="default-tool"
              className="text-sm font-medium text-slate-700"
            >
              Default Tool
            </Label>
            <select
              id="default-tool"
              value={localAI.defaultTool || ''}
              onChange={e => handleDefaultToolChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select default tool</option>
              {localAI.tools.map(tool => (
                <option key={tool.id} value={tool.id}>
                  {tool.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tools List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700">
            Configured Tools
          </h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateTool}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Tool
          </Button>
        </div>

        {localAI.tools.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Terminal className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">No AI tools configured</p>
            <p className="text-xs">
              Add your first local AI tool to get started
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {localAI.tools.map(tool => (
              <div
                key={tool.id}
                className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-slate-900">
                        {tool.name}
                      </h5>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          tool.enabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tool.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      <code className="bg-slate-100 px-1 rounded text-xs">
                        {tool.command} {tool.args.join(' ')}
                      </code>
                    </p>
                    {tool.description && (
                      <p className="text-xs text-slate-500">
                        {tool.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTool(tool)}
                      className="p-1 h-auto"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTool(tool.id)}
                      className="p-1 h-auto text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Tool Modal */}
      {editingTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {isCreating ? 'Add New AI Tool' : 'Edit AI Tool'}
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="tool-name"
                  className="text-sm font-medium text-slate-700"
                >
                  Tool Name *
                </Label>
                <Input
                  id="tool-name"
                  type="text"
                  value={editingTool.name}
                  onChange={e => updateEditingTool({ name: e.target.value })}
                  placeholder="e.g., Ollama, GPT4All"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="tool-command"
                  className="text-sm font-medium text-slate-700"
                >
                  Command *
                </Label>
                <Input
                  id="tool-command"
                  type="text"
                  value={editingTool.command}
                  onChange={e => updateEditingTool({ command: e.target.value })}
                  placeholder="e.g., ollama, python"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="tool-args"
                  className="text-sm font-medium text-slate-700"
                >
                  Arguments
                </Label>
                <Input
                  id="tool-args"
                  type="text"
                  value={formatArgs(editingTool.args)}
                  onChange={e =>
                    updateEditingTool({ args: parseArgs(e.target.value) })
                  }
                  placeholder="e.g., run, --model, llama2"
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Comma-separated list of arguments
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="tool-description"
                  className="text-sm font-medium text-slate-700"
                >
                  Description
                </Label>
                <Input
                  id="tool-description"
                  type="text"
                  value={editingTool.description || ''}
                  onChange={e =>
                    updateEditingTool({ description: e.target.value })
                  }
                  placeholder="Brief description of the tool"
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-slate-700">
                    Enabled
                  </Label>
                  <p className="text-xs text-slate-500">
                    Enable this tool for use in the application
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingTool.enabled}
                    onChange={e =>
                      updateEditingTool({ enabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveTool}
                disabled={
                  !editingTool.name.trim() || !editingTool.command.trim()
                }
                className="flex-1"
              >
                {isCreating ? 'Create Tool' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
