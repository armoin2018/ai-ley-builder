import { useState } from 'react';
import { X, Save, RefreshCw, Download, Upload, Settings as SettingsIcon } from 'lucide-react';
import { Button, Input, Label } from '../../../shared/components';
import { cn } from '../../../utils';
import { useSettings } from '../../../hooks/useSettings';
import { UMLFlowsSettings } from './UMLFlowsSettings';
import { LocalAISettings } from './LocalAISettings';
import { AIRestSettings } from './AIRestSettings';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'umlFlows' | 'localAI' | 'aiRest';

export function Settings({ isOpen, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('umlFlows');
  const {
    settings,
    isLoading,
    hasUnsavedChanges,
    error,
    saveSettings,
    resetSettings,
    exportSettings,
    importSettings,
    clearError,
  } = useSettings();

  if (!isOpen) return null;

  const handleSave = async () => {
    const success = await saveSettings();
    if (success) {
      // Show success feedback
      const savedIndicator = document.createElement('div');
      savedIndicator.textContent = '✅ Settings saved!';
      savedIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 9999;
        font-size: 14px;
      `;
      document.body.appendChild(savedIndicator);
      setTimeout(() => document.body.removeChild(savedIndicator), 2000);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importSettings(file);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      resetSettings();
    }
  };

  const tabs = [
    { id: 'umlFlows', label: 'UML Flows', icon: '📁' },
    { id: 'localAI', label: 'Local AI Tools', icon: '⚡' },
    { id: 'aiRest', label: 'AI REST APIs', icon: '🌐' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-slate-600" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
              <p className="text-sm text-slate-600 mt-1">
                Configure AI-LEY Visual Editor preferences
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'umlFlows' && <UMLFlowsSettings />}
          {activeTab === 'localAI' && <LocalAISettings />}
          {activeTab === 'aiRest' && <AIRestSettings />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportSettings}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>

            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={isLoading}
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Defaults
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600">Unsaved changes</span>
            )}

            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={isLoading || !hasUnsavedChanges}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}