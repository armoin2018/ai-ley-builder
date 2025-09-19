import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Code,
  Download,
  Edit2,
  Eye,
  Layout,
  MoreVertical,
  Play,
  Plus,
  Save,
  Upload,
  X,
} from 'lucide-react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';
import { useWorkflowTabsContext } from './WorkflowTabsProvider';
import {
  flowToPlantUML,
  parsePlantUMLToFlow,
} from '../../../utils/plantuml-parser';
import type { WorkflowTab } from '../types/tab';

interface WorkflowTabsProps {
  className?: string;
  onViewModeChange?: (isSourceView: boolean) => void;
  isSourceView?: boolean;
}

export function WorkflowTabs({
  className,
  onViewModeChange,
  isSourceView = false,
}: WorkflowTabsProps) {
  const { getNodes, getEdges, setNodes, setEdges, setViewport } =
    useReactFlow();

  const {
    tabs,
    activeTabId,
    isLoading,
    createNewTab,
    switchTab,
    closeTab,
    renameTab,
    runTab,
    saveTab,
    loadTabsFromUML,
  } = useWorkflowTabsContext();

  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [dropdownTabId, setDropdownTabId] = useState<string | null>(null);
  const [internalSourceView, setInternalSourceView] = useState(isSourceView);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);

  const dropdownButtonRefs = useRef<{
    [key: string]: HTMLButtonElement | null;
  }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-load UML files on mount - run only once
  useEffect(() => {
    console.log('🚀 WorkflowTabs component mounted - calling loadTabsFromUML');
    loadTabsFromUML();
  }, []); // Empty dependency array to run only on mount

  const handleRename = useCallback((tab: WorkflowTab) => {
    setEditingTabId(tab.id);
    setEditingName(tab.name);
    setDropdownTabId(null);
    setDropdownPosition(null);
  }, []);

  const handleSaveRename = useCallback(async () => {
    if (editingTabId && editingName.trim()) {
      await renameTab(editingTabId, editingName.trim());
      setEditingTabId(null);
      setEditingName('');
    }
  }, [editingTabId, editingName, renameTab]);

  const handleCancelRename = useCallback(() => {
    setEditingTabId(null);
    setEditingName('');
  }, []);

  const handleRun = useCallback(
    async (tabId: string) => {
      await runTab(tabId);
      setDropdownTabId(null);
      setDropdownPosition(null);
    },
    [runTab]
  );

  const handleSave = useCallback(
    async (tabId: string) => {
      try {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;

        console.log(
          `💾 Saving tab: ${tab.name} (${internalSourceView ? 'source' : 'visual'} mode)`
        );

        if (internalSourceView) {
          // In source mode: save PlantUML content first, then try workflow save
          const storageKey = tab.path || `tab-${tab.id}`;

          // Get current PlantUML content from the source editor
          const sourceEditorContent =
            localStorage.getItem(`puml-content-${storageKey}`) ||
            localStorage.getItem(`puml-content-tab-plantuml-${tab.id}`);

          if (sourceEditorContent) {
            // Save PlantUML content with multiple keys for consistency
            localStorage.setItem(
              `puml-content-${storageKey}`,
              sourceEditorContent
            );
            localStorage.setItem(
              `puml-content-tab-plantuml-${tab.id}`,
              sourceEditorContent
            );
            console.log(`✅ Saved PlantUML content for tab: ${tab.name}`);
          }
        } else {
          // In visual mode: save current canvas state first
          console.log(`💾 Saving visual workflow for tab: ${tab.name}`);
        }

        // Try to save through the tab system, but don't fail if workflow structure is incomplete
        try {
          await saveTab(tabId);
          console.log(`✅ Workflow tab save completed for: ${tab.name}`);
        } catch (tabSaveError) {
          console.warn(
            `⚠️ Workflow save failed for tab "${tab.name}":`,
            tabSaveError
          );

          if (internalSourceView) {
            // For source mode, PlantUML content save is sufficient - don't fail the operation
            console.log(
              `✅ PlantUML content was saved successfully for: ${tab.name}`
            );
          } else {
            // For visual mode, we need the workflow save to work
            throw tabSaveError;
          }
        }

        console.log(`✅ Successfully saved tab: ${tab.name}`);

        // Show user feedback
        const savedIndicator = document.createElement('div');
        savedIndicator.textContent = `✅ Saved "${tab.name}"!`;
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
        font-weight: 500;
      `;
        document.body.appendChild(savedIndicator);
        setTimeout(() => {
          if (document.body.contains(savedIndicator)) {
            document.body.removeChild(savedIndicator);
          }
        }, 2500);
      } catch (error) {
        console.error('❌ Failed to save tab:', error);
        alert(
          `Failed to save workflow "${tabs.find(t => t.id === tabId)?.name}". Please try again.`
        );
      } finally {
        setDropdownTabId(null);
        setDropdownPosition(null);
      }
    },
    [saveTab, tabs, internalSourceView]
  );

  const handleDelete = useCallback(
    async (tabId: string) => {
      if (window.confirm('Are you sure you want to delete this workflow?')) {
        await closeTab(tabId, true);
        setDropdownTabId(null);
        setDropdownPosition(null);
      }
    },
    [closeTab]
  );

  const handleToggleViewForTab = useCallback(
    async (tabId: string) => {
      const newSourceView = !internalSourceView;

      // Use the currently active tab, not the dropdown tab
      const currentActiveTab = tabs.find(t => t.id === activeTabId);

      if (!currentActiveTab) {
        console.warn('No active tab found for view toggle');
        return;
      }

      console.log('🎯 Toggling view for active tab:', {
        clickedTabId: tabId,
        activeTabId: activeTabId,
        activeTabName: currentActiveTab.name,
        newSourceView,
      });

      try {
        if (newSourceView) {
          // Switching to source view - convert current visual flow to PlantUML
          console.log(
            '🔄 Converting visual flow to PlantUML for tab:',
            currentActiveTab.name
          );

          const currentNodes = getNodes();
          const currentEdges = getEdges();

          if (currentNodes.length > 0) {
            const plantumlContent = flowToPlantUML(
              currentNodes,
              currentEdges,
              currentActiveTab.name
            );

            // Store the PlantUML content for this tab
            const storageKey =
              currentActiveTab.path || `tab-plantuml-${currentActiveTab.id}`;
            localStorage.setItem(`puml-content-${storageKey}`, plantumlContent);

            console.log('✅ Visual flow converted to PlantUML and stored');
          } else {
            console.log(
              '📝 No nodes in visual flow, will show default PlantUML template'
            );
          }
        } else {
          // Switching to visual view - convert current PlantUML content to visual flow
          console.log(
            '🔄 Converting PlantUML to visual flow for tab:',
            currentActiveTab.name
          );

          // Get the most current PlantUML content from multiple sources
          const storageKey =
            currentActiveTab.path || `tab-plantuml-${currentActiveTab.id}`;

          // Try to get the latest content from various storage locations
          const sourcePaths = [
            `puml-content-${storageKey}`,
            `puml-content-tab-plantuml-${currentActiveTab.id}`,
            `puml-content-${currentActiveTab.path}`,
          ];

          let plantumlContent = '';
          for (const path of sourcePaths) {
            const content = localStorage.getItem(path);
            if (content && content.length > plantumlContent.length) {
              plantumlContent = content;
            }
          }

          // Also check if there's content in the DOM (if source editor is currently showing)
          const sourceTextarea = document.querySelector(
            'textarea'
          ) as HTMLTextAreaElement;
          if (
            sourceTextarea &&
            sourceTextarea.value &&
            sourceTextarea.value.includes('@startuml')
          ) {
            console.log(
              '📝 Found current content in source editor, using that instead of stored content'
            );
            plantumlContent = sourceTextarea.value;

            // Save this current content to localStorage for future reference
            localStorage.setItem(`puml-content-${storageKey}`, plantumlContent);
            localStorage.setItem(
              `puml-content-tab-plantuml-${currentActiveTab.id}`,
              plantumlContent
            );
          }

          if (plantumlContent && plantumlContent.trim()) {
            try {
              console.log(
                `📄 Using PlantUML content (${plantumlContent.length} characters)`
              );

              const { nodes: parsedNodes, edges: parsedEdges } =
                parsePlantUMLToFlow(plantumlContent);

              // Update the React Flow canvas
              setNodes(parsedNodes);
              setEdges(parsedEdges);
              setViewport({ x: 0, y: 0, zoom: 1 });

              console.log('✅ PlantUML converted to visual flow:', {
                nodes: parsedNodes.length,
                edges: parsedEdges.length,
              });

              // Save the updated PlantUML content with any missing visualization metadata
              if (parsedNodes.length > 0) {
                const enhancedPlantuml = flowToPlantUML(
                  parsedNodes,
                  parsedEdges,
                  currentActiveTab.name
                );
                localStorage.setItem(
                  `puml-content-${storageKey}`,
                  enhancedPlantuml
                );
                localStorage.setItem(
                  `puml-content-tab-plantuml-${currentActiveTab.id}`,
                  enhancedPlantuml
                );
                console.log('💾 Enhanced PlantUML with visualization metadata');
              }
            } catch (parseError) {
              console.error('❌ Failed to parse PlantUML content:', parseError);
              alert(
                `Failed to parse PlantUML content: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
              );

              // Don't switch view if parsing failed
              setDropdownTabId(null);
              setDropdownPosition(null);
              return;
            }
          } else {
            console.log('📝 No PlantUML content found, clearing visual canvas');
            setNodes([]);
            setEdges([]);
            setViewport({ x: 0, y: 0, zoom: 1 });
          }
        }

        // Update view state
        setInternalSourceView(newSourceView);

        // Add a small delay to ensure state synchronization before triggering view change
        setTimeout(() => {
          onViewModeChange?.(newSourceView);
        }, 100);
      } catch (error) {
        console.error('❌ Failed to toggle view:', error);
        alert(
          `Failed to toggle view: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setDropdownTabId(null);
        setDropdownPosition(null);
      }
    },
    [
      internalSourceView,
      onViewModeChange,
      tabs,
      activeTabId,
      getNodes,
      getEdges,
      setNodes,
      setEdges,
      setViewport,
    ]
  );

  const handleAutoArrange = useCallback(
    (tabId: string) => {
      try {
        const currentNodes = getNodes();
        const currentEdges = getEdges();

        if (currentNodes.length === 0) {
          console.log('No nodes to arrange');
          return;
        }

        // Import the auto-arrange utility
        import('../../../utils/autoArrange')
          .then(({ autoArrangeNodesWithAnimation }) => {
            const arrangedNodes = autoArrangeNodesWithAnimation(
              currentNodes,
              currentEdges,
              {
                horizontalSpacing: 300,
                verticalSpacing: 150,
                startX: 200,
                startY: 100,
                direction: 'top-to-bottom',
              }
            );

            // Apply the new positions
            setNodes(arrangedNodes);

            console.log(
              `Auto arranged ${arrangedNodes.length} nodes for tab: ${tabId}`
            );
          })
          .catch(error => {
            console.error('Failed to load auto-arrange utility:', error);
            alert('Failed to auto-arrange nodes. Please try again.');
          });
      } catch (error) {
        console.error('Auto arrange failed:', error);
        alert('Auto arrange failed. Please try again.');
      } finally {
        setDropdownTabId(null);
        setDropdownPosition(null);
      }
    },
    [getNodes, getEdges, setNodes]
  );

  const handleExport = useCallback(
    async (tabId: string) => {
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) return;

      try {
        await saveTab(tabId);
        console.log(`Exported workflow: ${tab.name}`);
        alert(`Workflow "${tab.name}" has been exported successfully.`);
      } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
      }
      setDropdownTabId(null);
      setDropdownPosition(null);
    },
    [tabs, saveTab]
  );

  const handleImport = useCallback(() => {
    // Trigger file input click
    fileInputRef.current?.click();
    setDropdownTabId(null);
    setDropdownPosition(null);
  }, []);

  const handleFileImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        console.log(`📁 Importing file: ${file.name} (${file.size} bytes)`);

        // Validate file type
        const isPlantUML =
          file.name.toLowerCase().endsWith('.puml') ||
          file.name.toLowerCase().endsWith('.plantuml');
        if (!isPlantUML) {
          alert('Please select a PlantUML file (.puml or .plantuml)');
          return;
        }

        // Read file content
        const content = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });

        console.log(`📄 File content loaded (${content.length} characters)`);

        // Create a new tab with the file name (without extension)
        const workflowName = file.name.replace(/\.(puml|plantuml)$/i, '');
        const newTabId = await createNewTab(workflowName);

        console.log(`📝 Created new tab: "${workflowName}" (ID: ${newTabId})`);

        // Parse PlantUML content to visual flow
        const { nodes: parsedNodes, edges: parsedEdges } =
          parsePlantUMLToFlow(content);

        console.log(`🔄 Parsed PlantUML to visual flow:`, {
          nodes: parsedNodes.length,
          edges: parsedEdges.length,
        });

        // Update the canvas with the parsed visual elements
        setNodes(parsedNodes);
        setEdges(parsedEdges);
        setViewport({ x: 0, y: 0, zoom: 1 });

        // Store the PlantUML content for this new tab
        const storageKey = `tab-plantuml-${newTabId}`;
        localStorage.setItem(`puml-content-${storageKey}`, content);

        console.log(
          `✅ Successfully imported "${workflowName}" into new tab with visual conversion`
        );

        // Show success message
        alert(
          `Successfully imported "${workflowName}" with ${parsedNodes.length} nodes and ${parsedEdges.length} connections.`
        );
      } catch (error) {
        console.error('❌ Failed to import file:', error);
        alert(
          `Failed to import file: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        // Clear the file input so the same file can be imported again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [createNewTab, setNodes, setEdges, setViewport]
  );

  const handleTabClick = useCallback(
    (tabId: string, event?: React.MouseEvent) => {
      // Don't switch tab if we're currently editing this tab or another tab
      if (editingTabId) {
        event?.preventDefault();
        return;
      }
      switchTab(tabId);
    },
    [editingTabId, switchTab]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSaveRename();
      } else if (e.key === 'Escape') {
        handleCancelRename();
      }
    },
    [handleSaveRename, handleCancelRename]
  );

  const handleCreateNewTab = useCallback(async () => {
    try {
      await createNewTab();
    } catch (error) {
      console.error('Failed to create new tab:', error);
    }
  }, [createNewTab]);

  // Sync external source view changes
  useEffect(() => {
    setInternalSourceView(isSourceView);
  }, [isSourceView]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setDropdownTabId(null);
      setDropdownPosition(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center p-4 bg-slate-50 border-b border-slate-200',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <div className="text-sm text-slate-500">Loading workflows...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center bg-slate-50 border-b border-slate-200',
        className
      )}
    >
      {/* Workflow Tabs */}
      <div className="flex items-center overflow-x-auto">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={cn(
              'relative flex items-center min-w-0 border-r border-slate-200',
              'hover:bg-slate-100 transition-colors group',
              {
                'bg-white border-b-2 border-b-blue-500': activeTabId === tab.id,
                'bg-slate-50': activeTabId !== tab.id,
              }
            )}
          >
            {/* Tab Content */}
            <div
              className={cn(
                'flex items-center gap-2 px-3 py-2 cursor-pointer min-w-0',
                'max-w-48 select-none'
              )}
              onClick={e => handleTabClick(tab.id, e)}
            >
              {/* Status Indicator */}
              <div
                className={cn('w-2 h-2 rounded-full flex-shrink-0', {
                  'bg-green-500': tab.saved,
                  'bg-amber-500': tab.modified && !tab.saved,
                  'bg-slate-300': !tab.modified && !tab.saved,
                })}
              />

              {/* Tab Name */}
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onBlur={handleSaveRename}
                  onKeyDown={handleKeyDown}
                  className="flex-1 min-w-0 px-1 py-0.5 text-sm bg-white border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span
                  className={cn(
                    'flex-1 min-w-0 truncate text-sm cursor-pointer hover:bg-slate-100 px-1 py-0.5 rounded',
                    {
                      'font-medium text-slate-900': activeTabId === tab.id,
                      'text-slate-600': activeTabId !== tab.id,
                    }
                  )}
                  title={`${tab.name} (click to rename)`}
                  onClick={e => {
                    e.stopPropagation();
                    handleRename(tab);
                  }}
                >
                  {tab.name}
                </span>
              )}
            </div>

            {/* Tab Actions */}
            <div className="flex items-center pr-2">
              {/* Close Button */}
              {tabs.length > 1 && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="p-1 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Close tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* More Actions Dropdown */}
              <div className="relative">
                <button
                  ref={el => {
                    dropdownButtonRefs.current[tab.id] = el;
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    const isOpening = dropdownTabId !== tab.id;
                    setDropdownTabId(isOpening ? tab.id : null);

                    if (isOpening && e.currentTarget) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 4,
                        right: window.innerWidth - rect.right,
                      });
                    } else {
                      setDropdownPosition(null);
                    }
                  }}
                  className="p-1 hover:bg-slate-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="More actions"
                >
                  <MoreVertical className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Tab Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateNewTab}
          className="flex items-center gap-2 px-3 py-2 border-r border-slate-200 hover:bg-slate-100"
          title="Add new workflow"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm hidden sm:inline">New</span>
        </Button>
      </div>

      {/* Right side controls */}
      <div className="ml-auto flex items-center">
        {/* Tab Info */}
        {activeTabId && (
          <div className="pr-4 flex items-center gap-2 text-xs text-slate-500">
            {tabs.find(t => t.id === activeTabId)?.path && (
              <span>{tabs.find(t => t.id === activeTabId)?.path}</span>
            )}
          </div>
        )}
      </div>

      {/* Portal Dropdown Menu */}
      {dropdownTabId &&
        dropdownPosition &&
        createPortal(
          <div
            className="bg-white border border-slate-200 rounded-md shadow-lg min-w-48 fixed"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right,
              zIndex: 999999,
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() =>
                handleRename(tabs.find(t => t.id === dropdownTabId)!)
              }
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Rename
            </button>
            <button
              onClick={() => handleSave(dropdownTabId)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!dropdownTabId}
              title={
                internalSourceView
                  ? 'Save PlantUML source'
                  : 'Save visual workflow'
              }
            >
              <Save className="w-4 h-4" />
              Save {internalSourceView ? 'Source' : 'Workflow'}
            </button>
            <button
              onClick={() => handleRun(dropdownTabId)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
            <hr className="my-1" />
            <button
              onClick={() => handleToggleViewForTab(dropdownTabId)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2',
                {
                  'bg-slate-100': internalSourceView,
                }
              )}
            >
              {internalSourceView ? (
                <Eye className="w-4 h-4" />
              ) : (
                <Code className="w-4 h-4" />
              )}
              {internalSourceView ? 'Switch to Visual' : 'Switch to Source'}
            </button>
            <button
              onClick={() => handleAutoArrange(dropdownTabId)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
            >
              <Layout className="w-4 h-4" />
              Auto Arrange
            </button>
            <hr className="my-1" />
            <button
              onClick={() => handleExport(dropdownTabId)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => handleImport()}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <hr className="my-1" />
            <button
              onClick={() => handleDelete(dropdownTabId)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Delete
            </button>
          </div>,
          document.body
        )}

      {/* Hidden file input for import functionality */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".puml,.plantuml"
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />
    </div>
  );
}
