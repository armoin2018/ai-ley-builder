import { useReactFlow } from '@xyflow/react';
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
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';
import { parsePlantUMLToFlow } from '../../../utils/plantuml-parser';
import { useTabState } from '../hooks/useTabState';
import type { WorkflowTab } from '../types/tab';
import { useWorkflowTabsContext } from './WorkflowTabsProvider';

interface WorkflowTabsProps {
  className?: string;
  onViewModeChange?: (isSourceView: boolean) => void;
  isSourceView?: boolean;
}

/**
 * WorkflowTabs Component
 *
 * @remarks
 * The `isSourceView` parameter is intentionally unused. It's preserved for API compatibility
 * and future features. TASK-002 integration made this parameter redundant as view state is
 * now managed centrally, but we maintain it in the interface to avoid breaking changes.
 *
 * @param isSourceView - Unused parameter maintained for API compatibility
 */
export function WorkflowTabs({
  className,
  onViewModeChange,
  isSourceView = false, // Intentionally unused - maintained for API compatibility
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
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);

  // Initialize useTabState hook for active tab (single source of truth)
  const tabId = activeTabId || 'no-tab';
  const tabState = useTabState(
    tabId,
    getNodes,
    getEdges,
    setNodes,
    setEdges,
    setViewport
  );

  // Derive source view state from hook (remove duplicate internalSourceView state)
  const internalSourceView = activeTabId
    ? tabState.state.activeView === 'source'
    : false;

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

        // useWorkflowTabs saves file metadata (owns tab collection)
        await saveTab(tabId);
        console.log(`✅ Workflow tab save completed for: ${tab.name}`);

        // useTabState marks content as saved (owns content state)
        tabState.markSaved();
        console.log(`✅ Tab state marked as saved for: ${tab.name}`);

        // Parent shows UI feedback (UI coordination)
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
    [saveTab, tabs, tabState, internalSourceView]
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

  /**
   * Toggle view mode for a specific tab
   *
   * @remarks
   * The `tabId` parameter is intentionally unused in the current implementation.
   * The function uses `activeTabId` from state instead, but the parameter is preserved
   * for API compatibility and potential future features where we might need to toggle
   * views for non-active tabs.
   *
   * @param tabId - Unused parameter maintained for API compatibility
   */
  const handleToggleViewForTab = useCallback(
    async (tabId: string) => {
      // Intentionally unused - uses activeTabId from state instead
      if (!activeTabId) {
        console.warn('No active tab found for view toggle');
        return;
      }

      const currentActiveTab = tabs.find(t => t.id === activeTabId);
      if (!currentActiveTab) {
        console.warn('Active tab not found in tabs array');
        return;
      }

      try {
        // Determine new view mode
        const newView =
          tabState.state.activeView === 'source' ? 'visual' : 'source';

        console.log('🎯 Toggling view for active tab:', {
          tabId: activeTabId,
          tabName: currentActiveTab.name,
          currentView: tabState.state.activeView,
          newView,
        });

        // Delegate to useTabState hook - handles conversion & persistence
        if (newView === 'source') {
          await tabState.switchToSource();
          console.log('✅ Switched to source view via hook');
        } else {
          await tabState.switchToVisual();
          console.log('✅ Switched to visual view via hook');
        }

        // Notify parent component (UI coordination responsibility)
        onViewModeChange?.(newView === 'source');
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
    [activeTabId, tabs, tabState, onViewModeChange]
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

        // Note: After tab creation, the hook for the new tab will be initialized
        // The content will be stored via useTabState when the tab becomes active
        // For now, store in the visual state which the hook will persist
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

  // Note: internalSourceView now derived from tabState.state.activeView
  // External prop sync handled via hook's state management

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
                  className="flex-1 min-w-0 px-1 py-0.5 text-sm bg-white dark:bg-input border border-blue-300 dark:border-blue-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-foreground"
                  autoFocus
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span
                  className={cn(
                    'flex-1 min-w-0 truncate text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-accent px-1 py-0.5 rounded',
                    {
                      'font-medium text-slate-900 dark:text-slate-100': activeTabId === tab.id,
                      'text-slate-600 dark:text-slate-400': activeTabId !== tab.id,
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
            className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-md shadow-lg min-w-48 fixed"
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
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-accent flex items-center gap-2 dark:text-foreground"
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
