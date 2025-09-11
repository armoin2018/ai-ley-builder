import { useState } from 'react';
import { Button } from '../../../shared/components';
import { useWorkflow } from '../hooks/useWorkflow';
import { WorkflowManager } from './WorkflowManager';
import { cn } from '../../../utils';

interface WorkflowControlsProps {
  className?: string;
}

export function WorkflowControls({ className }: WorkflowControlsProps) {
  const {
    currentWorkflow,
    isModified,
    isSaving,
    isLoading,
    lastSaved,
    error,
    saveWorkflow,
    exportWorkflow,
    importWorkflow,
    newWorkflow,
    clearError,
  } = useWorkflow();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveAsName, setSaveAsName] = useState('');
  const [showWorkflowManager, setShowWorkflowManager] = useState(false);

  const handleSave = async () => {
    if (currentWorkflow) {
      await saveWorkflow();
    } else {
      setShowSaveDialog(true);
    }
  };

  const handleSaveAs = async () => {
    if (saveAsName.trim()) {
      await saveWorkflow(saveAsName.trim());
      setShowSaveDialog(false);
      setSaveAsName('');
    }
  };

  const handleNew = () => {
    if (isModified) {
      if (
        window.confirm(
          'You have unsaved changes. Are you sure you want to create a new workflow?'
        )
      ) {
        newWorkflow();
      }
    } else {
      newWorkflow();
    }
  };

  const handleExport = async () => {
    if (!currentWorkflow) {
      // Save first if not saved
      await handleSave();
    }
    if (currentWorkflow) {
      await exportWorkflow();
    }
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {error && (
        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-md text-sm">
          <span>{error}</span>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Workflow Status */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        {currentWorkflow && (
          <span className="font-medium">{currentWorkflow.name}</span>
        )}
        {isModified && !isSaving && <span className="text-amber-600">●</span>}
        {lastSaved && !isModified && (
          <span className="text-green-600 text-xs">
            Saved {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNew}
        disabled={isSaving || isLoading}
      >
        New
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowWorkflowManager(true)}
        disabled={isSaving || isLoading}
      >
        Manage
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={isSaving || isLoading}
        className={cn({
          'border-blue-300 text-blue-700': isModified && !isSaving,
        })}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isSaving || isLoading}
      >
        Export
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={importWorkflow}
        disabled={isSaving || isLoading}
      >
        {isLoading ? 'Loading...' : 'Import'}
      </Button>

      {/* Save As Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Save Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={saveAsName}
                  onChange={e => setSaveAsName(e.target.value)}
                  placeholder="Enter workflow name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      handleSaveAs();
                    } else if (e.key === 'Escape') {
                      setShowSaveDialog(false);
                      setSaveAsName('');
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveAsName('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAs}
                  disabled={!saveAsName.trim()}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Manager */}
      <WorkflowManager
        isOpen={showWorkflowManager}
        onClose={() => setShowWorkflowManager(false)}
      />
    </div>
  );
}
