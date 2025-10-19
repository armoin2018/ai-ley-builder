import { ExecutionPanel } from '@features/execution/components/ExecutionPanel';
import {
    DraggableLayoutEngine,
    LayoutProvider,
    LayoutQuickToggles,
    LayoutTemplateSelector
} from '@features/layout';
import {
    useTabState,
    useWorkflowTabsContext,
    WorkflowTabs,
    WorkflowTabsProvider
} from '@features/tabs';
import { CommandPalette, QuickActions, StatusBar } from '@features/ui-advanced';
import {
    Header
} from '@features/ui-common/components';
import { ValidationPanel } from '@features/validation/components/ValidationPanel';
import { WorkflowControls } from '@features/workflow';
import { Button, ThemeProvider } from '@shared/components';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import './App.css';
import { AIDemo } from './components/ai';
import { LayoutInitializer } from './components/LayoutInitializer';
import { ChatPanel } from './features/chat/components/ChatPanel';
import { FileEditorTabs } from './features/file-editor';
import { Settings } from './features/settings';
import { FlowStoreManager, NodeStoreManager } from './features/store';
import { PromptService } from './services/promptService';
import { flowToPlantUML, parsePlantUMLToFlow } from './utils/plantuml-parser';

function AppContent() {
  const [showValidation, setShowValidation] = useState(false);
  const [showExecution, setShowExecution] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIDemo, setShowAIDemo] = useState(false);
  const [showFileEditor, setShowFileEditor] = useState(false);
  const [showNodeStore, setShowNodeStore] = useState(false);
  const [showFlowStore, setShowFlowStore] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const { getNodes, getEdges, setNodes, setEdges, setViewport } =
    useReactFlow();
  const { activeTab } = useWorkflowTabsContext();

  // Use tab state hook for active tab - single source of truth for view state
  const tabId = activeTab?.id || 'no-tab';
  const tabState = useTabState(
    tabId,
    getNodes,
    getEdges,
    setNodes,
    setEdges,
    setViewport
  );

  // Determine current view mode from tab state (single source of truth)
  const isSourceView = activeTab ? tabState.activeView === 'source' : false;

  const nodes = getNodes();
  const edges = getEdges();

  const handleNodeSelect = (nodeId: string) => {
    // This would typically focus on the node in the canvas
    console.log('Selected node:', nodeId);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'execute':
        setShowExecution(true);
        break;
      case 'validate':
        setShowValidation(true);
        break;
      case 'search':
        setShowCommandPalette(true);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'ai-demo':
        setShowAIDemo(true);
        break;
      case 'file-editor':
        setShowFileEditor(true);
        break;
      case 'node-store':
        setShowNodeStore(true);
        break;
      case 'flow-store':
        setShowFlowStore(true);
        break;
      default:
        console.log('Quick action:', action);
    }
  };

  const handleViewModeChange = (sourceView: boolean) => {
    // Use tabState hook to switch views (single source of truth)
    if (activeTab) {
      const newView = sourceView ? 'source' : 'visual';
      tabState.switchView(newView);
      
      // When switching to source view, trigger PlantUML refresh
      if (sourceView) {
        console.log('🔄 Switching to source view, will trigger PlantUML refresh');
        // Wait a moment for the SourceEditor to mount, then trigger refresh
        setTimeout(() => {
          setLastSaved(new Date());
          console.log('⚡ Triggered PlantUML refresh');
        }, 100);
      }
    }
  };

  const handlePlantUMLUpdate = (content: string) => {
    try {
      console.log('Parsing PlantUML content and updating visual flow...');

      // Parse PlantUML content to get nodes and edges
      const { nodes: parsedNodes, edges: parsedEdges } =
        parsePlantUMLToFlow(content);

      console.log('Parsed nodes:', parsedNodes.length);
      console.log('Parsed edges:', parsedEdges.length);

      // Update the React Flow canvas
      setNodes(parsedNodes);
      setEdges(parsedEdges);

      // Reset viewport to center the new content
      setViewport({ x: 0, y: 0, zoom: 1 });

      console.log('Visual flow updated successfully from PlantUML');
    } catch (error) {
      console.error('Failed to parse PlantUML content:', error);
      alert(
        `Failed to parse PlantUML content: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  // Automatic visual-to-PlantUML synchronization
  useEffect(() => {
    if (!isSourceView && activeTab) {
      // Only update PlantUML when in visual mode to avoid circular updates
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      // Clear existing timeout to avoid stacked updates
      if (
        typeof window !== 'undefined' &&
        (window as any).visualUpdateTimeout
      ) {
        clearTimeout((window as any).visualUpdateTimeout);
      }

      // Debounce updates to avoid too frequent regeneration
      (window as any).visualUpdateTimeout = setTimeout(() => {
        try {
          if (currentNodes.length > 0 || currentEdges.length > 0) {
            console.log('🔄 Auto-updating PlantUML from visual changes');
            console.log('🖼️ Visual canvas state:', {
              nodes: currentNodes.length,
              edges: currentEdges.length,
              tabName: activeTab.name,
            });

            const plantumlContent = flowToPlantUML(
              currentNodes,
              currentEdges,
              activeTab.name
            );

            // Store updated PlantUML content in localStorage for the active tab
            if (activeTab.path) {
              localStorage.setItem(
                `puml-content-${activeTab.path}`,
                plantumlContent
              );
            }
            localStorage.setItem(
              `puml-content-tab-plantuml-${activeTab.id}`,
              plantumlContent
            );

            console.log(
              '✅ PlantUML content updated automatically from visual changes'
            );
            console.log(
              '📝 Generated PlantUML preview:',
              `${plantumlContent.substring(0, 200)}...`
            );
          } else {
            console.log('🔍 No nodes/edges to sync to PlantUML');
          }
        } catch (error) {
          console.error(
            '❌ Failed to auto-update PlantUML from visual changes:',
            error
          );
        }
      }, 800); // Reduced to 800ms to match SourceEditor debounce timing

      return () => {
        if (
          typeof window !== 'undefined' &&
          (window as any).visualUpdateTimeout
        ) {
          clearTimeout((window as any).visualUpdateTimeout);
        }
      };
    }
  }, [nodes, edges, isSourceView, activeTab, getNodes, getEdges]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCmd = event.metaKey || event.ctrlKey;
      const isShift = event.shiftKey;

      if (isCmd && isShift) {
        switch (event.key.toLowerCase()) {
          case 'p':
            event.preventDefault();
            setShowCommandPalette(true);
            break;
          case 'v':
            event.preventDefault();
            setShowValidation(!showValidation);
            break;
          case 'e':
            event.preventDefault();
            setShowExecution(!showExecution);
            break;
          case ',':
            event.preventDefault();
            setShowSettings(!showSettings);
            break;
          case 'f':
            event.preventDefault();
            setShowFileEditor(!showFileEditor);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showValidation, showExecution, showSettings]);

  const handleImportFlow = (nodes: any[], edges: any[]) => {
    setNodes(nodes);
    setEdges(edges);
    setViewport({ x: 0, y: 0, zoom: 1 });
    setShowFlowStore(false);
  };

  const commandPaletteCommands = [
    {
      id: 'toggle-validation',
      title: 'Toggle Validation Panel',
      description: 'Show or hide the workflow validation panel',
      category: 'Panels',
      shortcut: '⌘⇧V',
      action: () => setShowValidation(!showValidation),
      keywords: ['validation', 'panel', 'toggle'],
    },
    {
      id: 'toggle-execution',
      title: 'Toggle Execution Panel',
      description: 'Show or hide the workflow execution panel',
      category: 'Panels',
      shortcut: '⌘⇧E',
      action: () => setShowExecution(!showExecution),
      keywords: ['execution', 'panel', 'toggle'],
    },
    {
      id: 'save-workflow',
      title: 'Save Workflow',
      description: 'Save the current workflow',
      category: 'File',
      shortcut: '⌘S',
      action: () => {
        setLastSaved(new Date());
        console.log('Workflow saved');
      },
      keywords: ['save', 'file', 'workflow'],
    },
    {
      id: 'command-palette',
      title: 'Command Palette',
      description: 'Open the command palette',
      category: 'Navigation',
      shortcut: '⌘⇧P',
      action: () => setShowCommandPalette(true),
      keywords: ['command', 'palette', 'search'],
    },
    {
      id: 'toggle-settings',
      title: 'Settings',
      description: 'Open application settings',
      category: 'Preferences',
      shortcut: '⌘⇧,',
      action: () => setShowSettings(!showSettings),
      keywords: ['settings', 'preferences', 'config'],
    },
    {
      id: 'ai-demo',
      title: 'AI Tools Demo',
      description: 'Test AI CLI tools and API endpoints',
      category: 'AI Tools',
      shortcut: '⌘⇧A',
      action: () => setShowAIDemo(!showAIDemo),
      keywords: ['ai', 'demo', 'cli', 'api', 'tools', 'test'],
    },
    {
      id: 'file-editor',
      title: 'File Editor',
      description:
        'Open AI-LEY file editor for personas, instructions, and prompts',
      category: 'Editor',
      shortcut: '⌘⇧F',
      action: () => setShowFileEditor(!showFileEditor),
      keywords: [
        'file',
        'editor',
        'persona',
        'instruction',
        'prompt',
        'plantuml',
      ],
    },
    {
      id: 'node-store',
      title: 'Node Store',
      description: 'Browse and manage custom nodes from the store',
      category: 'Store',
      shortcut: '⌘⇧N',
      action: () => setShowNodeStore(!showNodeStore),
      keywords: ['node', 'store', 'palette', 'custom', 'download'],
    },
    {
      id: 'flow-store',
      title: 'Flow Store',
      description: 'Browse and manage workflow templates from the store',
      category: 'Store',
      shortcut: '⌘⇧W',
      action: () => setShowFlowStore(!showFlowStore),
      keywords: ['flow', 'store', 'workflow', 'template', 'download'],
    },
    // Add prompt commands dynamically from PromptService
    ...PromptService.getCommandPaletteEntries(),
  ];

  return (
    <LayoutProvider>
      <div className="flex flex-col h-screen">
        {/* Fixed Header */}
        <Header>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-lg font-semibold">AI-LEY Visual Flow Editor</h1>
            <div className="flex items-center gap-4">
              <LayoutQuickToggles />
              <LayoutTemplateSelector />
              <QuickActions onAction={handleQuickAction} />
              <WorkflowControls />
            </div>
          </div>
        </Header>

        <WorkflowTabs
          onViewModeChange={handleViewModeChange}
          isSourceView={isSourceView}
        />

        {/* Draggable Layout Area */}
        <div className="flex-1 overflow-hidden">
          <LayoutInitializer
            nodes={nodes}
            edges={edges}
            isSourceView={isSourceView}
            onPlantUMLUpdate={handlePlantUMLUpdate}
            lastSaved={lastSaved}
          />
          <DraggableLayoutEngine className="h-full" />
        </div>
      </div>

      <ValidationPanel
        nodes={nodes}
        edges={edges}
        isOpen={showValidation}
        onClose={() => setShowValidation(false)}
        onNodeSelect={handleNodeSelect}
      />

      <ExecutionPanel
        nodes={nodes}
        edges={edges}
        isOpen={showExecution}
        onClose={() => setShowExecution(false)}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={commandPaletteCommands}
      />

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {showAIDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                AI Tools Demo
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIDemo(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <AIDemo />
            </div>
          </div>
        </div>
      )}

      {showFileEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                AI-LEY File Editor
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFileEditor(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="h-full">
              <FileEditorTabs className="h-full" />
            </div>
          </div>
        </div>
      )}

      <NodeStoreManager
        isOpen={showNodeStore}
        onClose={() => setShowNodeStore(false)}
      />

      <FlowStoreManager
        isOpen={showFlowStore}
        onClose={() => setShowFlowStore(false)}
        onImportFlow={handleImportFlow}
      />

      <StatusBar
        nodeCount={nodes.length}
        connectionCount={edges.length}
        lastSaved={lastSaved}
        validationStatus={showValidation ? 'valid' : 'pending'}
        executionStatus={showExecution ? 'running' : 'idle'}
        isOnline={true}
        className="fixed bottom-0 left-0 right-0 z-40"
      />

      <ChatPanel />
      {/* Fixed JSX structure */}
    </LayoutProvider>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="visual-editor-theme">
      <ReactFlowProvider>
        <WorkflowTabsProvider>
          <AppContent />
        </WorkflowTabsProvider>
      </ReactFlowProvider>
    </ThemeProvider>
  );
}

export default App;
