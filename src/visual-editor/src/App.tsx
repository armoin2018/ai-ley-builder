import './App.css';
import { useEffect, useState } from 'react';
import { Button, ThemeProvider } from '@shared/components';
import { X } from 'lucide-react';
import {
  ContentArea,
  Header,
  Layout,
  MainContent,
  Panel,
  Sidebar,
} from '@features/ui-common/components';
import {
  FlowCanvas,
  NodeInspector,
  NodePalette,
} from '@features/canvas/components';
import { WorkflowControls } from '@features/workflow';
import { ValidationPanel } from '@features/validation/components/ValidationPanel';
import { ExecutionPanel } from '@features/execution/components/ExecutionPanel';
import { CommandPalette, QuickActions, StatusBar } from '@features/ui-advanced';
import { WorkflowTabs, WorkflowTabsProvider, SourceEditor, useWorkflowTabsContext } from '@features/tabs';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { PromptService } from './services/promptService';
import { parsePlantUMLToFlow, flowToPlantUML } from './utils/plantuml-parser';
import { Settings } from './features/settings';
import { AIDemo } from './components/ai';

function AppContent() {
  const [showValidation, setShowValidation] = useState(false);
  const [showExecution, setShowExecution] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAIDemo, setShowAIDemo] = useState(false);
  const [isSourceView, setIsSourceView] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const { getNodes, getEdges, setNodes, setEdges, setViewport } = useReactFlow();
  const { activeTab } = useWorkflowTabsContext();


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
      default:
        console.log('Quick action:', action);
    }
  };

  const handleViewModeChange = (sourceView: boolean) => {
    setIsSourceView(sourceView);
    // When switching to source view, we want to refresh the PlantUML content
    if (sourceView) {
      console.log('🔄 Switching to source view, will trigger PlantUML refresh');
      // Wait a moment for the SourceEditor to mount, then trigger refresh
      setTimeout(() => {
        setLastSaved(new Date());
        console.log('⚡ Triggered PlantUML refresh');
      }, 100);
    }
  };

  const handlePlantUMLUpdate = (content: string) => {
    try {
      console.log('Parsing PlantUML content and updating visual flow...');
      
      // Parse PlantUML content to get nodes and edges
      const { nodes: parsedNodes, edges: parsedEdges } = parsePlantUMLToFlow(content);
      
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
      alert(`Failed to parse PlantUML content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Automatic visual-to-PlantUML synchronization
  useEffect(() => {
    if (!isSourceView && activeTab) {
      // Only update PlantUML when in visual mode to avoid circular updates
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      // Debounce updates to avoid too frequent regeneration
      const timeoutId = setTimeout(() => {
        if (currentNodes.length > 0 || currentEdges.length > 0) {
          console.log('🔄 Auto-updating PlantUML from visual changes');

          const plantumlContent = flowToPlantUML(currentNodes, currentEdges, activeTab.name);

          // Store updated PlantUML content in localStorage for the active tab
          if (activeTab.path) {
            localStorage.setItem(`puml-content-${activeTab.path}`, plantumlContent);
          }
          localStorage.setItem(`puml-content-tab-plantuml-${activeTab.id}`, plantumlContent);

          console.log('✅ PlantUML content updated automatically from visual changes');
        }
      }, 1000); // 1 second debounce

      return () => clearTimeout(timeoutId);
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
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showValidation, showExecution, showSettings]);

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
    // Add prompt commands dynamically from PromptService
    ...PromptService.getCommandPaletteEntries(),
  ];

  return (
    <Layout>
      <Sidebar side="left" width="w-80">
        <NodePalette />
      </Sidebar>

      <MainContent>
        <Header>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-lg font-semibold">AI-LEY Visual Flow Editor</h1>
            <div className="flex items-center gap-4">
              <QuickActions onAction={handleQuickAction} />
              <WorkflowControls />
            </div>
          </div>
        </Header>

        <WorkflowTabs 
          onViewModeChange={handleViewModeChange}
          isSourceView={isSourceView}
        />

        <ContentArea>
          {isSourceView ? (
            <SourceEditor 
              onUpdate={handlePlantUMLUpdate} 
              className="flex-1" 
              refreshTrigger={lastSaved}
            />
          ) : (
            <div className="flex-1 bg-muted/50 p-4">
              <Panel title="Canvas" className="h-full">
                <FlowCanvas />
              </Panel>
            </div>
          )}
        </ContentArea>
      </MainContent>

      <Sidebar side="right" width="w-72">
        <div className="p-3 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowValidation(!showValidation)}
              className="w-full"
            >
              Validation Panel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExecution(!showExecution)}
              className="w-full"
            >
              Execute Panel
            </Button>
          </div>
        </div>
        <NodeInspector />
      </Sidebar>

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

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {showAIDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-5/6 overflow-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">AI Tools Demo</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowAIDemo(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <AIDemo />
            </div>
          </div>
        </div>
      )}

      <StatusBar
        nodeCount={nodes.length}
        connectionCount={edges.length}
        lastSaved={lastSaved}
        validationStatus={showValidation ? 'valid' : 'pending'}
        executionStatus={showExecution ? 'running' : 'idle'}
        isOnline={true}
        className="fixed bottom-0 left-0 right-0 z-40"
      />
    </Layout>
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
