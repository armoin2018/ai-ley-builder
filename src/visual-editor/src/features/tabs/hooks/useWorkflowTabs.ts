import { useCallback, useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { 
  WorkflowTab, 
  TabState, 
  UseWorkflowTabsReturn, 
  UMLFileInfo 
} from '../types/tab';
import { deserializeWorkflow, serializeWorkflow } from '../../workflow/utils/serialization';
import { 
  importFromPUML, 
  exportWorkflowToPUML, 
  getAvailablePUMLFiles 
} from '../../../utils/export';

export function useWorkflowTabs(): UseWorkflowTabsReturn {
  const { getNodes, getEdges, getViewport, setNodes, setEdges, setViewport } = useReactFlow();
  
  const [state, setState] = useState<TabState>({
    tabs: [],
    activeTabId: null,
    isLoading: false,
    error: null,
  });

  // Debug: Log when useWorkflowTabs hook is initialized
  useEffect(() => {
    console.log('🎣 useWorkflowTabs hook initialized');
  }, []);

  // Generate unique tab ID
  const generateTabId = useCallback(() => {
    return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Generate unique workflow name
  const generateWorkflowName = useCallback(() => {
    const existingNames = state.tabs.map(tab => tab.name);
    let counter = 1;
    let name = 'New Workflow';
    
    while (existingNames.includes(name)) {
      name = `New Workflow ${counter}`;
      counter++;
    }
    
    return name;
  }, [state.tabs]);

  // Load UML files from directory
  const loadUMLFiles = useCallback(async (): Promise<UMLFileInfo[]> => {
    try {
      const files = await getAvailablePUMLFiles();
      const umlFiles: UMLFileInfo[] = [];

      for (const file of files) {
        try {
          const content = localStorage.getItem(`puml-content-${file.path}`) || '';
          
          if (content) {
            umlFiles.push({
              name: file.name.replace('.puml', ''),
              path: file.path,
              content,
              lastModified: new Date(file.lastModified),
            });
          }
        } catch (error) {
          console.warn(`Failed to load UML file: ${file.path}`, error);
        }
      }

      return umlFiles;
    } catch (error) {
      console.error('Failed to load UML files:', error);
      return [];
    }
  }, []);

  // Save current canvas state to tab
  const saveCurrentCanvasToTab = useCallback((tabId: string) => {
    const nodes = getNodes();
    const edges = getEdges();
    const viewport = getViewport();

    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => {
        if (t.id === tabId) {
          const workflowData = {
            id: t.workflow?.id || `workflow_${Date.now()}`,
            name: t.name,
            description: t.workflow?.description,
            createdAt: t.workflow?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const serializedWorkflow = serializeWorkflow(nodes, edges, viewport, workflowData);
          
          return {
            ...t,
            workflow: serializedWorkflow,
            modified: false,
            saved: true,
            isNew: false,
            lastSaved: new Date(),
          };
        }
        return t;
      }),
    }));
  }, [getNodes, getEdges, getViewport]);

  // Save a tab
  const saveTab = useCallback(async (tabId: string) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab) return;

    try {
      // Save current canvas state to tab
      saveCurrentCanvasToTab(tabId);
      
      // Get the updated tab with saved workflow
      const updatedTab = state.tabs.find(t => t.id === tabId);
      if (!updatedTab?.workflow) return;

      // Export to PlantUML file
      const result = await exportWorkflowToPUML(updatedTab.workflow);
      
      if (result.success && result.filePath) {
        // Update tab with file path
        setState(prev => ({
          ...prev,
          tabs: prev.tabs.map(t => 
            t.id === tabId 
              ? { ...t, path: result.filePath, saved: true }
              : t
          ),
        }));

        // Store the UML content in localStorage
        if (result.content) {
          localStorage.setItem(`puml-content-${result.filePath}`, result.content);
          
          // Update the available PUML files list
          const currentFiles = await getAvailablePUMLFiles();
          const fileExists = currentFiles.some(f => f.path === result.filePath);
          
          if (!fileExists) {
            const newFile = {
              name: `${updatedTab.workflow.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.puml`,
              path: result.filePath,
              lastModified: new Date(),
            };
            const updatedFiles = [...currentFiles, newFile];
            localStorage.setItem('ai-ley-puml-files', JSON.stringify(updatedFiles));
          }
        }

        console.log(`Saved workflow "${updatedTab.name}" to ${result.filePath}`);
      } else {
        throw new Error(result.error || 'Failed to save UML file');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: `Failed to save workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      throw error;
    }
  }, [state.tabs, saveCurrentCanvasToTab]);

  // Create new tab
  const createNewTab = useCallback(async (name?: string): Promise<string> => {
    const tabId = generateTabId();
    const tabName = name || generateWorkflowName();
    
    const newTab: WorkflowTab = {
      id: tabId,
      name: tabName,
      workflow: null,
      modified: false,
      saved: false,
      isNew: true,
      createdAt: new Date(),
    };

    setState(prev => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: tabId,
    }));

    // Clear canvas for new workflow
    setNodes([]);
    setEdges([]);
    setViewport({ x: 0, y: 0, zoom: 1 });

    return tabId;
  }, [generateTabId, generateWorkflowName, setNodes, setEdges, setViewport]);

  // Switch to a tab
  const switchTab = useCallback((tabId: string) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab) {
      console.warn(`Tab not found: ${tabId}`);
      return;
    }

    console.log(`Switching to tab: ${tab.name}`, { hasWorkflow: !!tab.workflow });
    setState(prev => ({ ...prev, activeTabId: tabId }));

    // Load workflow into canvas
    if (tab.workflow) {
      try {
        console.log('Tab workflow structure:', tab.workflow);
        
        // Check if workflow has canvas data directly or needs deserialization
        let nodes, edges, viewport;
        
        if (tab.workflow.canvas) {
          // Workflow has canvas data (from our serialization)
          nodes = tab.workflow.canvas.nodes || [];
          edges = tab.workflow.canvas.edges || [];
          viewport = tab.workflow.canvas.viewport || { x: 0, y: 0, zoom: 1 };
        } else if (tab.workflow.nodes && tab.workflow.edges) {
          // Workflow has direct nodes/edges (from PlantUML import)
          nodes = tab.workflow.nodes || [];
          edges = tab.workflow.edges || [];
          viewport = { x: 0, y: 0, zoom: 1 };
        } else {
          // Try deserializing as last resort
          const deserialized = deserializeWorkflow(tab.workflow);
          nodes = deserialized.nodes;
          edges = deserialized.edges;
          viewport = deserialized.viewport || { x: 0, y: 0, zoom: 1 };
        }
        
        // Enhanced logging for visual elements loading
        console.log('=== Loading Visual Elements into Canvas ===');
        console.log(`✓ Loading workflow: ${nodes.length} nodes, ${edges.length} edges`);
        console.log(`✓ Viewport: x=${viewport.x}, y=${viewport.y}, zoom=${viewport.zoom}`);
        
        // Log sample node data if available
        if (nodes.length > 0) {
          console.log('📊 Sample node data (first 3 nodes):');
          const sampleNodes = nodes.slice(0, 3).map((node, index) => ({
            index: index + 1,
            id: node.id,
            type: node.type,
            label: node.data?.label || 'No label',
            position: node.position,
            dimensions: node.width && node.height ? { width: node.width, height: node.height } : 'auto'
          }));
          console.table(sampleNodes);
          
          // Log PlantUML-specific data if present
          const plantUMLNodes = nodes.filter(node => 
            node.data?.source === 'plantuml' || 
            node.data?.originalText || 
            node.data?.umlType
          );
          if (plantUMLNodes.length > 0) {
            console.log(`🌱 PlantUML-derived nodes detected: ${plantUMLNodes.length}/${nodes.length}`);
            console.log('PlantUML node details:', plantUMLNodes.slice(0, 2).map(node => ({
              id: node.id,
              type: node.type,
              umlType: node.data?.umlType,
              originalText: node.data?.originalText?.substring(0, 50) + '...',
              source: node.data?.source
            })));
          }
        }
        
        // Log edge data if available
        if (edges.length > 0) {
          console.log('🔗 Edge data (first 3 edges):');
          const sampleEdges = edges.slice(0, 3).map((edge, index) => ({
            index: index + 1,
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type,
            label: edge.label || 'No label'
          }));
          console.table(sampleEdges);
        }
        
        console.log(`🎨 Setting visual elements on canvas...`);
        setNodes(nodes);
        setEdges(edges);
        setViewport(viewport);
        console.log('✅ Visual elements loaded successfully');
        console.log('==========================================');
        
      } catch (error) {
        console.error('Failed to load workflow into canvas:', error);
        console.error('Workflow data:', tab.workflow);
        setState(prev => ({
          ...prev,
          error: `Failed to load workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
        }));
        
        // Clear canvas on error
        setNodes([]);
        setEdges([]);
        setViewport({ x: 0, y: 0, zoom: 1 });
      }
    } else {
      // Clear canvas for empty workflow
      console.log('No workflow data, clearing canvas');
      setNodes([]);
      setEdges([]);
      setViewport({ x: 0, y: 0, zoom: 1 });
    }
  }, [state.tabs, setNodes, setEdges, setViewport]);

  // Close a tab
  const closeTab = useCallback(async (tabId: string, forceDelete = false) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab) return;

    // Check for unsaved changes
    if (tab.modified && !forceDelete) {
      const shouldSave = window.confirm(
        `"${tab.name}" has unsaved changes. Do you want to save before closing?`
      );
      
      if (shouldSave) {
        try {
          await saveTab(tabId);
        } catch (error) {
          console.error('Failed to save tab before closing:', error);
          const forceClose = window.confirm('Failed to save. Close anyway?');
          if (!forceClose) return;
        }
      }
    }

    // If deleting, also remove the UML file
    if (forceDelete && tab.path) {
      try {
        localStorage.removeItem(`puml-content-${tab.path}`);
        
        // Update the available PUML files list
        const currentFiles = await getAvailablePUMLFiles();
        const updatedFiles = currentFiles.filter(f => f.path !== tab.path);
        localStorage.setItem('ai-ley-puml-files', JSON.stringify(updatedFiles));
      } catch (error) {
        console.warn('Failed to delete UML file:', error);
      }
    }

    setState(prev => {
      const newTabs = prev.tabs.filter(t => t.id !== tabId);
      let newActiveTabId = prev.activeTabId;

      // Switch to another tab if this was the active tab
      if (prev.activeTabId === tabId && newTabs.length > 0) {
        const currentIndex = prev.tabs.findIndex(t => t.id === tabId);
        const newIndex = Math.min(currentIndex, newTabs.length - 1);
        newActiveTabId = newTabs[newIndex].id;
      } else if (newTabs.length === 0) {
        newActiveTabId = null;
      }

      return {
        ...prev,
        tabs: newTabs,
        activeTabId: newActiveTabId,
      };
    });

    // If we switched to a different tab, load its workflow
    const remainingTabs = state.tabs.filter(t => t.id !== tabId);
    if (remainingTabs.length > 0 && state.activeTabId === tabId) {
      const currentIndex = state.tabs.findIndex(t => t.id === tabId);
      const newIndex = Math.min(currentIndex, remainingTabs.length - 1);
      const newActiveTab = remainingTabs[newIndex];
      setTimeout(() => switchTab(newActiveTab.id), 0);
    } else if (remainingTabs.length === 0) {
      // No tabs left, clear canvas
      setNodes([]);
      setEdges([]);
      setViewport({ x: 0, y: 0, zoom: 1 });
    }
  }, [state.tabs, state.activeTabId, switchTab, setNodes, setEdges, setViewport, saveTab]);

  // Rename a tab
  const renameTab = useCallback(async (tabId: string, newName: string) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab || !newName.trim()) return;

    const sanitizedName = newName.trim();
    
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => 
        t.id === tabId 
          ? { ...t, name: sanitizedName, modified: true }
          : t
      ),
    }));

    // Update workflow name if it exists
    if (tab.workflow) {
      setState(prev => ({
        ...prev,
        tabs: prev.tabs.map(t => 
          t.id === tabId && t.workflow
            ? { ...t, workflow: { ...t.workflow, name: sanitizedName } }
            : t
        ),
      }));
    }
  }, [state.tabs]);

  // Run a tab (placeholder for execution functionality)
  const runTab = useCallback(async (tabId: string) => {
    const tab = state.tabs.find(t => t.id === tabId);
    if (!tab) return;

    console.log(`Running workflow: ${tab.name}`);
    // TODO: Implement actual workflow execution
    alert(`Running workflow: ${tab.name}\n\nExecution functionality would be implemented here.`);
  }, [state.tabs]);

  // Create default sample PlantUML files
  const createDefaultSampleFiles = useCallback(async () => {
    console.log('🌱 Creating default sample PlantUML files...');
    
    const sampleFiles = [
      {
        name: 'Welcome Tutorial',
        fileName: 'welcome-tutorial.puml',
        content: `@startuml
title Welcome Tutorial

start
:Welcome to AI-ley Builder!;
:This is your first workflow;
:Click and drag to move elements;
:Use the toolbar to add new nodes;
:Connect elements with edges;
:Save your work when done;
stop

@enduml`
      },
      {
        name: 'Process Management',
        fileName: 'process-management.puml',
        content: `@startuml
title Process Management

start
:Receive Request;
if (Valid Request?) then (yes)
  :Process Request;
  :Update Database;
  :Generate Response;
else (no)
  :Log Error;
  :Send Error Response;
endif
:Send Response;
stop

@enduml`
      },
      {
        name: 'Data Pipeline',
        fileName: 'data-pipeline.puml',
        content: `@startuml
title Data Pipeline

start
:Extract Data from Source;
:Validate Data Quality;
if (Data Quality OK?) then (yes)
  :Transform Data;
  :Load to Data Warehouse;
  :Update Metadata;
  :Notify Success;
else (no)
  :Log Data Issues;
  :Send Alert;
  :Queue for Manual Review;
endif
stop

@enduml`
      }
    ];

    const currentFiles = await getAvailablePUMLFiles();
    const newFiles = [...currentFiles];

    for (const sample of sampleFiles) {
      const filePath = `.ai-ley/shared/uml-flows/user/${sample.fileName}`;
      
      // Store content in localStorage
      localStorage.setItem(`puml-content-${filePath}`, sample.content);
      
      // Add to file list
      const fileInfo = {
        name: sample.fileName,
        path: filePath,
        lastModified: new Date(),
      };
      
      newFiles.push(fileInfo);
      console.log(`  ✅ Created sample file: ${sample.name} (${sample.fileName})`);
    }

    // Update the file list in localStorage
    localStorage.setItem('ai-ley-puml-files', JSON.stringify(newFiles));
    console.log(`🎉 Successfully created ${sampleFiles.length} default sample files`);
  }, []);

  // Load tabs from UML files - auto-load existing flows
  const loadTabsFromUML = useCallback(async () => {
    console.group('🔄 loadTabsFromUML - Starting tab loading process');
    
    // Debug: Log localStorage contents
    console.log('📦 localStorage contents before loading:');
    console.log('  - workflowTabs:', localStorage.getItem('workflowTabs'));
    console.log('  - activeTabId:', localStorage.getItem('activeTabId'));
    console.log('  - ai-ley-puml-files:', localStorage.getItem('ai-ley-puml-files'));
    
    // Check if our specific PlantUML content exists
    const buildProjectContent = localStorage.getItem('puml-content-.ai-ley/shared/uml-flows/user/build-project.puml');
    console.log('  - build-project.puml content length:', buildProjectContent?.length || 'NOT FOUND');
    if (buildProjectContent) {
      console.log('  - build-project.puml preview:', buildProjectContent.substring(0, 200) + '...');
    }
    
    console.log('  - localStorage keys:', Object.keys(localStorage));
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('📂 Step 1: Loading UML files from .ai-ley/shared/uml-flows/user/');
      
      let umlFiles = await loadUMLFiles();
      
      // Check if no UML files exist and create default samples
      if (umlFiles.length === 0) {
        console.log('📝 No UML files found - creating default sample files...');
        await createDefaultSampleFiles();
        
        // Re-load UML files after creating samples
        umlFiles = await loadUMLFiles();
        console.log(`✨ After creating samples: Found ${umlFiles.length} UML files`);
      }
      
      console.log(`📊 Step 2: Found ${umlFiles.length} UML files`);
      if (umlFiles.length > 0) {
        console.log('  Files found:');
        umlFiles.forEach((file, index) => {
          console.log(`    ${index + 1}. ${file.name} (${file.path})`);
          console.log(`       Last modified: ${new Date(file.lastModified).toISOString()}`);
        });
      } else {
        console.warn('  ⚠️ No UML files found in directory');
      }
      
      const newTabs: WorkflowTab[] = [];

      // Load each UML file into a tab
      console.log('🔄 Step 3: Processing each UML file...');
      for (let i = 0; i < umlFiles.length; i++) {
        const file = umlFiles[i];
        console.log(`  📄 Processing file ${i + 1}/${umlFiles.length}: ${file.name}`);
        
        try {
          console.log(`    🔍 Importing PUML from: ${file.path}`);
          const workflow = await importFromPUML(file.path);
          
          if (workflow) {
            const tabId = generateTabId();
            const tabName = workflow.name || file.name.replace('.puml', '');
            
            console.log(`    ✅ Successfully imported workflow: "${tabName}"`);
            console.log(`    🆔 Generated tab ID: ${tabId}`);
            console.log(`    📈 Workflow nodes: ${workflow.canvas?.nodes?.length || 0}`);
            console.log(`    🔗 Workflow edges: ${workflow.canvas?.edges?.length || 0}`);
            
            const tab: WorkflowTab = {
              id: tabId,
              name: tabName,
              path: file.path,
              workflow,
              modified: false,
              saved: true,
              isNew: false,
              lastSaved: file.lastModified,
              createdAt: new Date(workflow.metadata?.createdAt || file.lastModified),
            };
            
            newTabs.push(tab);
            console.log(`    ✨ Tab created and added to newTabs array (total: ${newTabs.length})`);
          } else {
            console.warn(`    ⚠️ importFromPUML returned null/undefined for ${file.path}`);
          }
        } catch (fileError) {
          console.error(`    ❌ Failed to import UML file: ${file.path}`);
          console.error('    Error details:', fileError);
          console.error('    Error stack:', fileError instanceof Error ? fileError.stack : 'No stack available');
        }
      }

      console.log(`📋 Step 4: Processed all files. Total tabs created: ${newTabs.length}`);

      // If no tabs were loaded, create a default tab
      if (newTabs.length === 0) {
        console.log('🆕 Step 5a: No tabs loaded - creating default Welcome tab');
        const defaultTabId = generateTabId();
        const defaultTab: WorkflowTab = {
          id: defaultTabId,
          name: 'Welcome',
          workflow: null,
          modified: false,
          saved: false,
          isNew: true,
          createdAt: new Date(),
        };
        
        console.log(`  🆔 Default tab ID: ${defaultTabId}`);
        
        setState(prev => { 
          const newState = {
            ...prev, 
            tabs: [defaultTab],
            activeTabId: defaultTabId,
            isLoading: false,
          };
          console.log('  📝 Setting state with default tab:', newState);
          return newState;
        });

        // Clear canvas for new workflow
        console.log('  🧹 Clearing canvas for new workflow');
        setNodes([]);
        setEdges([]);
        setViewport({ x: 0, y: 0, zoom: 1 });
        
        console.groupEnd();
        return;
      }

      // Set all loaded tabs and activate the first one
      console.log('✅ Step 5b: Setting all loaded tabs');
      const activeTabId = newTabs[0].id;
      
      console.log(`  🎯 Setting active tab to: "${newTabs[0].name}" (ID: ${activeTabId})`);
      console.log('  📋 All tabs being set:');
      newTabs.forEach((tab, index) => {
        console.log(`    ${index + 1}. "${tab.name}" (ID: ${tab.id}, saved: ${tab.saved}, modified: ${tab.modified})`);
      });
      
      setState(prev => {
        const newState = {
          ...prev,
          tabs: newTabs,
          activeTabId,
          isLoading: false,
        };
        console.log('  📝 Setting state with loaded tabs:', newState);
        return newState;
      });

      // Load the first tab's workflow into canvas
      console.log('  🎨 Scheduling canvas load with setTimeout...');
      setTimeout(() => {
        console.log(`  🔄 Executing switchTab(${activeTabId})`);
        switchTab(activeTabId);
      }, 0);
      
      console.log('✅ loadTabsFromUML completed successfully');
      
    } catch (error) {
      console.error('❌ Error in loadTabsFromUML:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack available',
        type: typeof error,
        toString: error?.toString?.()
      });
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load workflows: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
      
      // Create default tab on error
      console.log('🆘 Creating default tab due to error...');
      const defaultTabId = generateTabId();
      const defaultTab: WorkflowTab = {
        id: defaultTabId,
        name: 'Welcome',
        workflow: null,
        modified: false,
        saved: false,
        isNew: true,
        createdAt: new Date(),
      };
      
      console.log(`  🆔 Error recovery tab ID: ${defaultTabId}`);
      
      setState(prev => { 
        const newState = {
          ...prev, 
          tabs: [defaultTab],
          activeTabId: defaultTabId,
        };
        console.log('  📝 Setting error recovery state:', newState);
        return newState;
      });

      // Clear canvas
      console.log('  🧹 Clearing canvas due to error');
      setNodes([]);
      setEdges([]);
      setViewport({ x: 0, y: 0, zoom: 1 });
    }
    
    console.groupEnd();
  }, [generateTabId, loadUMLFiles, createDefaultSampleFiles, importFromPUML, switchTab, setNodes, setEdges, setViewport]);

  // Save all tabs
  const saveAllTabs = useCallback(async () => {
    const unsavedTabs = state.tabs.filter(tab => tab.modified || !tab.saved);
    
    for (const tab of unsavedTabs) {
      try {
        await saveTab(tab.id);
      } catch (error) {
        console.error(`Failed to save tab ${tab.name}:`, error);
      }
    }
  }, [state.tabs, saveTab]);

  // Close all tabs
  const closeAllTabs = useCallback(async () => {
    const tabIds = [...state.tabs.map(t => t.id)];
    
    for (const tabId of tabIds) {
      await closeTab(tabId);
    }
  }, [state.tabs, closeTab]);

  // Mark tab as modified
  const markTabModified = useCallback((tabId: string) => {
    setState(prev => ({
      ...prev,
      tabs: prev.tabs.map(t => 
        t.id === tabId 
          ? { ...t, modified: true, saved: false }
          : t
      ),
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-save current tab when canvas changes
  useEffect(() => {
    if (state.activeTabId) {
      const tab = state.tabs.find(t => t.id === state.activeTabId);
      if (tab && !tab.isNew) {
        // Mark as modified when canvas changes (debounced)
        const timeoutId = setTimeout(() => {
          if (state.activeTabId) {
            markTabModified(state.activeTabId);
          }
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [state.activeTabId, state.tabs.length, markTabModified]); // Remove getNodes() and getEdges() to prevent infinite loops

  // Computed properties
  const hasUnsavedTabs = state.tabs.some(tab => tab.modified && !tab.saved);
  const activeTab = state.tabs.find(tab => tab.id === state.activeTabId) || null;

  return {
    ...state,
    hasUnsavedTabs,
    activeTab,
    createNewTab,
    switchTab,
    closeTab,
    renameTab,
    saveTab,
    runTab,
    loadTabsFromUML,
    saveAllTabs,
    closeAllTabs,
    markTabModified,
    clearError,
  };
}