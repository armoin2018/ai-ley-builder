import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';
import { useSettings } from '../../../hooks/useSettings';
import { AI_LEY_PATHS } from '../../../utils/paths';

import { AILeyPathsSettings } from './AILeyPathsSettings';
import { StorageBackupSettings } from './StorageBackupSettings';
import { AutoArrangeSettings } from './AutoArrangeSettings';
import { ScriptNodeSettings } from './ScriptNodeSettings';

type UMLFlowsSubTab = 'paths' | 'storage' | 'autoArrange' | 'scriptNodes';

export function TabbedUMLFlowsSettings() {
  const [activeSubTab, setActiveSubTab] = useState<UMLFlowsSubTab>('paths');
  const { updateUMLFlowsSettings, updateAILeyPathSettings } = useSettings();

  const resetToDefaults = () => {
    if (
      confirm(
        'Are you sure you want to reset all UML Flows settings to defaults? This cannot be undone.'
      )
    ) {
      updateAILeyPathSettings({
        globalInstructions: '.ai-ley/shared/global-instructions.md',
        instructions: '.ai-ley/shared/instructions',
        personas: '.ai-ley/shared/personas',
        variables: '.ai-ley/shared/variables',
        prompts: '.ai-ley/shared/prompts',
      });

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
              color:
                'bg-purple-50/50 border-purple-100 hover:border-purple-200',
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
    }
  };

  const subTabs = [
    { id: 'paths', label: 'AI-LEY Paths', icon: '🗂️' },
    { id: 'storage', label: 'Storage & Backup', icon: '💾' },
    { id: 'autoArrange', label: 'Auto-Arrange', icon: '🔄' },
    { id: 'scriptNodes', label: 'Script Nodes', icon: '⚡' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Sub-tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={cn(
                'flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeSubTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              )}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Sub-tab Content */}
      <div className="min-h-[400px]">
        {activeSubTab === 'paths' && <AILeyPathsSettings />}
        {activeSubTab === 'storage' && <StorageBackupSettings />}
        {activeSubTab === 'autoArrange' && <AutoArrangeSettings />}
        {activeSubTab === 'scriptNodes' && <ScriptNodeSettings />}
      </div>

      {/* Reset to Defaults Action */}
      <div className="flex items-center justify-start pt-4 border-t border-slate-200">
        <Button
          variant="outline"
          size="sm"
          onClick={resetToDefaults}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reset All to Defaults
        </Button>
      </div>
    </div>
  );
}
