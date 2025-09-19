import { useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '../../../shared/components';
import { useWorkflow } from '../hooks/useWorkflow';
import type { WorkflowMetadata } from '../services/workflowStorage';
import { useWorkflowTabsContext } from '../../tabs/components/WorkflowTabsProvider';
import { getAvailablePUMLFiles } from '../../../utils/export';
import type { UMLFile } from '../../../utils/export';
import { parsePlantUMLToFlow } from '../../../utils/plantuml-parser';
import { cn } from '../../../utils';
import { AI_LEY_DISPLAY_PATHS, getGitRoot } from '../../../utils/paths';
import { SettingsService } from '../../../services/settingsService';

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
    autoLoadPUML,
    isLoading,
  } = useWorkflow();

  const { loadTabsFromUML, switchTab, createNewTab } = useWorkflowTabsContext();
  const { setNodes, setEdges, setViewport } = useReactFlow();

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [pumlFiles, setPumlFiles] = useState<UMLFile[]>([]);
  const [loadingPuml, setLoadingPuml] = useState(false);

  // Get root directory information
  const getRootDirectoryInfo = () => {
    const gitRoot = getGitRoot();
    const settings = SettingsService.loadSettings();
    const umlFlowsPath = settings.umlFlows.storageFolder;

    return {
      gitRoot:
        gitRoot === '../../'
          ? 'ai-ley-builder'
          : gitRoot.replace(/\/$/, '').split('/').pop() || 'Unknown',
      flows: umlFlowsPath,
      personas: AI_LEY_DISPLAY_PATHS.PERSONAS,
      instructions: AI_LEY_DISPLAY_PATHS.INSTRUCTIONS,
    };
  };

  const rootInfo = getRootDirectoryInfo();

  useEffect(() => {
    if (isOpen) {
      refreshWorkflows();
      loadPumlFiles();
    }
  }, [isOpen, refreshWorkflows]);

  const loadPumlFiles = async () => {
    setLoadingPuml(true);
    try {
      const files = await getAvailablePUMLFiles();
      setPumlFiles(files);
      console.log(`Loaded ${files.length} PlantUML files for workflow manager`);
    } catch (error) {
      console.error('Failed to load PlantUML files:', error);
    } finally {
      setLoadingPuml(false);
    }
  };

  const filteredWorkflows = workflows.filter(
    workflow =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPumlFiles = pumlFiles.filter(
    file =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.path.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleAutoLoadPUML = async () => {
    if (isModified) {
      const confirm = window.confirm(
        'You have unsaved changes. Auto-loading a PlantUML file will lose these changes. Continue?'
      );
      if (!confirm) return;
    }

    const success = await autoLoadPUML();
    if (success) {
      onClose();
    }
  };

  const handleLoadPumlWorkflow = async (file: UMLFile) => {
    try {
      console.log(`🚀 Loading PlantUML workflow: ${file.name}`);

      // 1. Get the PlantUML content (should already be cached by getAvailablePUMLFiles)
      const plantumlContent = localStorage.getItem(`puml-content-${file.path}`);

      if (!plantumlContent) {
        throw new Error(
          `No PlantUML content found for ${file.path}. The file may not have been loaded properly.`
        );
      }

      console.log(
        `📄 Using PlantUML content (${plantumlContent.length} characters)`
      );

      // 2. Create a new tab with the file name and link it to the original file
      const workflowName = file.name.replace('.puml', '');
      const newTabId = await createNewTab(workflowName, file.path);

      console.log(
        `📝 Created new tab: "${workflowName}" (ID: ${newTabId}) linked to path: ${file.path}`
      );

      // 3. Store the original PlantUML content with multiple keys for accessibility
      localStorage.setItem(`puml-content-${file.path}`, plantumlContent);
      localStorage.setItem(
        `puml-content-tab-plantuml-${newTabId}`,
        plantumlContent
      );
      localStorage.setItem(`puml-content-tab-${newTabId}`, plantumlContent);

      console.log(`💾 Stored original PlantUML content with keys:`, {
        filePath: `puml-content-${file.path}`,
        tabKey: `puml-content-tab-plantuml-${newTabId}`,
        alternateKey: `puml-content-tab-${newTabId}`,
      });

      // 5. Parse PlantUML content to visual flow
      const { nodes: parsedNodes, edges: parsedEdges } =
        parsePlantUMLToFlow(plantumlContent);

      console.log(`🔄 Parsed PlantUML to visual flow:`, {
        nodes: parsedNodes.length,
        edges: parsedEdges.length,
      });

      // 6. Update the canvas with the parsed visual elements
      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setViewport({ x: 0, y: 0, zoom: 1 });

      console.log(
        `✅ Successfully loaded "${workflowName}" into new tab with visual conversion`
      );

      // 6. Close the dialog
      onClose();
    } catch (error) {
      console.error('❌ Failed to load PlantUML workflow:', error);
      alert(
        `Failed to load workflow: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
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
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">
              Workflow Manager
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Manage your saved workflows ({workflows.length + pumlFiles.length}{' '}
              total: {workflows.length} legacy, {pumlFiles.length} PlantUML)
            </p>

            {/* Root Directory Information */}
            <div className="mt-3 p-3 bg-slate-50 rounded-md border">
              <h3 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 1v6m8-6v6"
                  />
                </svg>
                Project: {rootInfo.gitRoot}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-slate-600">Flows:</span>
                  <code className="bg-white px-1 py-0.5 rounded text-slate-800">
                    {rootInfo.flows}
                  </code>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-slate-600">Personas:</span>
                  <code className="bg-white px-1 py-0.5 rounded text-slate-800">
                    {rootInfo.personas}
                  </code>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span className="text-slate-600">Instructions:</span>
                  <code className="bg-white px-1 py-0.5 rounded text-slate-800">
                    {rootInfo.instructions}
                  </code>
                </div>
              </div>
            </div>
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
            variant="outline"
            onClick={handleAutoLoadPUML}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Auto-Load PlantUML'}
          </Button>
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
          {filteredWorkflows.length === 0 && filteredPumlFiles.length === 0 ? (
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
              {/* PlantUML Files Section */}
              {filteredPumlFiles.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <span className="text-green-600">🌱</span>
                    PlantUML Workflows ({filteredPumlFiles.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredPumlFiles.map(file => (
                      <div
                        key={file.path}
                        className={cn(
                          'border border-green-200 rounded-lg p-4 hover:border-green-300 transition-colors bg-green-50/30',
                          {
                            'border-amber-300 bg-amber-50':
                              selectedWorkflowId === `puml-${file.path}`,
                          }
                        )}
                        onClick={() =>
                          setSelectedWorkflowId(
                            selectedWorkflowId === `puml-${file.path}`
                              ? null
                              : `puml-${file.path}`
                          )
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-slate-900">
                                {file.name.replace('.puml', '')}
                              </h3>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                PlantUML
                              </span>
                            </div>

                            <p className="text-sm text-slate-600 mt-1">
                              {file.path}
                            </p>

                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span>PlantUML workflow file</span>
                              <span>
                                Modified{' '}
                                {formatDate(file.lastModified.toISOString())}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={e => {
                                e.stopPropagation();
                                handleLoadPumlWorkflow(file);
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              Load
                            </Button>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {selectedWorkflowId === `puml-${file.path}` && (
                          <div className="mt-4 pt-4 border-t border-green-200">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>File Path:</strong>
                                <br />
                                <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                  {file.path}
                                </code>
                              </div>
                              <div>
                                <strong>Type:</strong>
                                <br />
                                PlantUML Source File (.puml)
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Legacy Workflows Section */}
              {filteredWorkflows.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-slate-800 mb-3 flex items-center gap-2">
                    <span className="text-blue-600">⚡</span>
                    Legacy Workflows ({filteredWorkflows.length})
                  </h3>
                  <div className="space-y-3">
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
                            selectedWorkflowId === workflow.id
                              ? null
                              : workflow.id
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
                              <span>
                                Created {formatDate(workflow.createdAt)}
                              </span>
                              <span>
                                Modified {formatDate(workflow.updatedAt)}
                              </span>
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
                              {deleteConfirm === workflow.id
                                ? 'Confirm'
                                : 'Delete'}
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
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-600">
            {filteredWorkflows.length + filteredPumlFiles.length !==
              workflows.length + pumlFiles.length && (
              <span>
                Showing {filteredWorkflows.length + filteredPumlFiles.length} of{' '}
                {workflows.length + pumlFiles.length} workflows
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
