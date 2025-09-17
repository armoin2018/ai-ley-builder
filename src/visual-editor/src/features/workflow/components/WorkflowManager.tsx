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

  useEffect(() => {
    if (isOpen) {
      refreshWorkflows();
      loadPumlFiles();
    }
  }, [isOpen, refreshWorkflows]);

  const loadPumlFiles = async () => {
    setLoadingPuml(true);
    try {
      // First, ensure we have some demo PlantUML files available
      await ensureDemoPlantUMLFiles();

      const files = await getAvailablePUMLFiles();
      setPumlFiles(files);
      console.log(`Loaded ${files.length} PlantUML files for workflow manager`);
    } catch (error) {
      console.error('Failed to load PlantUML files:', error);
    } finally {
      setLoadingPuml(false);
    }
  };

  const ensureDemoPlantUMLFiles = async () => {
    try {
      // Check if we already have files
      const existing = localStorage.getItem('ai-ley-puml-files');
      if (existing && JSON.parse(existing).length > 0) {
        return; // Already have files
      }

      // Create demo PlantUML files
      const demoFiles = [
        {
          name: 'customer-onboarding.puml',
          path: '.ai-ley/shared/uml-flows/user/customer-onboarding.puml',
          lastModified: new Date()
        },
        {
          name: 'data-processing.puml',
          path: '.ai-ley/shared/uml-flows/user/data-processing.puml',
          lastModified: new Date()
        },
        {
          name: 'user-authentication.puml',
          path: '.ai-ley/shared/uml-flows/user/user-authentication.puml',
          lastModified: new Date()
        }
      ];

      // Store the file list
      localStorage.setItem('ai-ley-puml-files', JSON.stringify(demoFiles));

      // Create sample content for each file
      const sampleContents = {
        'customer-onboarding.puml': `@startuml Customer Onboarding
!theme plain

title Customer Onboarding Process

rectangle "Welcome" as welcome #lightblue
rectangle "Collect Info" as collect #lightgreen
rectangle "Verify Email" as verify #yellow
rectangle "Setup Account" as setup #orange
rectangle "Send Welcome Email" as email #lightgreen
rectangle "Complete" as complete #lightgray

welcome --> collect
collect --> verify
verify --> setup : Valid
verify --> collect : Invalid
setup --> email
email --> complete

@enduml`,
        'data-processing.puml': `@startuml Data Processing
!theme plain

title Data Processing Workflow

rectangle "Input Data" as input #lightblue
rectangle "Validate" as validate #yellow
rectangle "Transform" as transform #lightgreen
rectangle "Store" as store #orange
rectangle "Notify" as notify #pink
rectangle "Error Handler" as error #red

input --> validate
validate --> transform : Valid
validate --> error : Invalid
transform --> store
store --> notify
error --> notify

@enduml`,
        'user-authentication.puml': `@startuml User Authentication
!theme plain

title User Authentication Flow

rectangle "Login Request" as login #lightblue
rectangle "Check Credentials" as check #yellow
rectangle "Generate Token" as token #lightgreen
rectangle "Access Granted" as granted #lightgreen
rectangle "Access Denied" as denied #red
rectangle "Logout" as logout #orange

login --> check
check --> token : Valid
check --> denied : Invalid
token --> granted
granted --> logout
logout --> login

@enduml`
      };

      // Store content for each demo file
      demoFiles.forEach(file => {
        const content = sampleContents[file.name as keyof typeof sampleContents];
        if (content) {
          localStorage.setItem(`puml-content-${file.path}`, content);
        }
      });

      console.log('✅ Created demo PlantUML files');
    } catch (error) {
      console.error('Failed to create demo PlantUML files:', error);
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

      // 1. First try to get the PlantUML content from localStorage
      let plantumlContent = localStorage.getItem(`puml-content-${file.path}`);

      // 2. If not found in localStorage, try to load the actual file content
      if (!plantumlContent) {
        console.log(`📂 No cached content found, attempting to load file content for: ${file.path}`);

        // For demo purposes, create sample PlantUML content based on the file name
        // In a real implementation, this would read from the actual file system
        const workflowName = file.name.replace('.puml', '');
        plantumlContent = `@startuml ${workflowName}
!theme plain

title ${workflowName}

' Sample workflow structure
rectangle "Start" as start #lightblue
rectangle "Process Data" as process #lightgreen
rectangle "Decision Point" as decision #pink
rectangle "Output Result" as output #lightgray
rectangle "End" as end #lightblue

start --> process
process --> decision
decision --> output : Yes
decision --> end : No
output --> end

@enduml`;

        // Store the generated content for future use
        localStorage.setItem(`puml-content-${file.path}`, plantumlContent);
        console.log(`📝 Generated sample PlantUML content for ${file.name}`);
      }

      console.log(`📄 Using PlantUML content (${plantumlContent.length} characters)`);

      // 3. Create a new tab with the file name
      const workflowName = file.name.replace('.puml', '');
      const newTabId = await createNewTab(workflowName);

      console.log(`📝 Created new tab: "${workflowName}" (ID: ${newTabId})`);

      // 4. Parse PlantUML content to visual flow
      const { nodes: parsedNodes, edges: parsedEdges } = parsePlantUMLToFlow(plantumlContent);

      console.log(`🔄 Parsed PlantUML to visual flow:`, {
        nodes: parsedNodes.length,
        edges: parsedEdges.length
      });

      // 5. Update the canvas with the parsed visual elements
      setNodes(parsedNodes);
      setEdges(parsedEdges);
      setViewport({ x: 0, y: 0, zoom: 1 });

      // 6. Store the PlantUML content for this new tab
      const storageKey = `tab-plantuml-${newTabId}`;
      localStorage.setItem(`puml-content-${storageKey}`, plantumlContent);

      console.log(`✅ Successfully loaded "${workflowName}" into new tab with visual conversion`);

      // 7. Close the dialog
      onClose();

    } catch (error) {
      console.error('❌ Failed to load PlantUML workflow:', error);
      alert(`Failed to load workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
              Manage your saved workflows ({workflows.length + pumlFiles.length} total: {workflows.length} legacy, {pumlFiles.length} PlantUML)
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
                            selectedWorkflowId === `puml-${file.path}` ? null : `puml-${file.path}`
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
                              <span>Modified {formatDate(file.lastModified.toISOString())}</span>
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
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-600">
            {(filteredWorkflows.length + filteredPumlFiles.length) !== (workflows.length + pumlFiles.length) && (
              <span>
                Showing {filteredWorkflows.length + filteredPumlFiles.length} of {workflows.length + pumlFiles.length}{' '}
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
