import { useEffect, useState } from 'react';
import { Button } from '../../../shared/components';
import { useWorkflow } from '../hooks/useWorkflow';
import type { WorkflowMetadata } from '../services/workflowStorage';
import { cn } from '../../../utils';

interface WorkflowManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkflowManager({ isOpen, onClose }: WorkflowManagerProps) {
  const {
    workflows,
    currentWorkflow,
    isModified,
    refreshWorkflows,
    loadWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    newWorkflow,
  } = useWorkflow();

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshWorkflows();
    }
  }, [isOpen, refreshWorkflows]);

  const filteredWorkflows = workflows.filter(
    workflow =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoadWorkflow = async (id: string) => {
    if (isModified) {
      const confirm = window.confirm(
        'You have unsaved changes. Loading another workflow will lose these changes. Continue?'
      );
      if (!confirm) return;
    }

    await loadWorkflow(id);
    onClose();
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (deleteConfirm === id) {
      await deleteWorkflow(id);
      await refreshWorkflows();
      setDeleteConfirm(null);
      if (currentWorkflow?.id === id) {
        newWorkflow();
      }
    } else {
      setDeleteConfirm(id);
      // Auto-cancel delete confirm after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleDuplicateWorkflow = async (id: string) => {
    const originalWorkflow = workflows.find(w => w.id === id);
    if (originalWorkflow) {
      await duplicateWorkflow(id, `${originalWorkflow.name} (Copy)`);
      await refreshWorkflows();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getWorkflowStats = (workflow: WorkflowMetadata) => {
    return `${workflow.nodeCount} nodes, ${workflow.edgeCount} connections`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Workflow Manager
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Manage your saved workflows ({workflows.length} total)
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4 p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            size="sm"
            onClick={() => {
              newWorkflow();
              onClose();
            }}
          >
            New Workflow
          </Button>
        </div>

        {/* Workflow List */}
        <div className="flex-1 overflow-auto">
          {filteredWorkflows.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              {searchTerm ? (
                <div className="text-center">
                  <p>No workflows match your search.</p>
                  <p className="text-sm mt-1">Try a different search term.</p>
                </div>
              ) : (
                <div className="text-center">
                  <p>No workflows saved yet.</p>
                  <p className="text-sm mt-1">
                    Create your first workflow to get started.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {filteredWorkflows.map(workflow => (
                <div
                  key={workflow.id}
                  className={cn(
                    'border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors',
                    {
                      'border-blue-500 bg-blue-50':
                        currentWorkflow?.id === workflow.id,
                      'border-amber-300 bg-amber-50':
                        selectedWorkflowId === workflow.id,
                    }
                  )}
                  onClick={() =>
                    setSelectedWorkflowId(
                      selectedWorkflowId === workflow.id ? null : workflow.id
                    )
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900">
                          {workflow.name}
                        </h3>
                        {currentWorkflow?.id === workflow.id && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>

                      {workflow.description && (
                        <p className="text-sm text-slate-600 mt-1">
                          {workflow.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span>{getWorkflowStats(workflow)}</span>
                        <span>Created {formatDate(workflow.createdAt)}</span>
                        <span>Modified {formatDate(workflow.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleLoadWorkflow(workflow.id);
                        }}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Load
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleDuplicateWorkflow(workflow.id);
                        }}
                        className="text-slate-600 hover:text-slate-700"
                      >
                        Duplicate
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteWorkflow(workflow.id);
                        }}
                        className={cn('text-red-600 hover:text-red-700', {
                          'bg-red-100': deleteConfirm === workflow.id,
                        })}
                      >
                        {deleteConfirm === workflow.id ? 'Confirm' : 'Delete'}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedWorkflowId === workflow.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Workflow ID:</strong>
                          <br />
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                            {workflow.id}
                          </code>
                        </div>
                        <div>
                          <strong>Size:</strong>
                          <br />
                          {workflow.nodeCount} nodes, {workflow.edgeCount}{' '}
                          connections
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-600">
            {filteredWorkflows.length !== workflows.length && (
              <span>
                Showing {filteredWorkflows.length} of {workflows.length}{' '}
                workflows
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
