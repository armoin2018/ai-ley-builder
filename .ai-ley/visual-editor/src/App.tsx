import './App.css';
import { useEffect, useState } from 'react';
import { Button, ThemeProvider } from '@shared/components';
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
import { TaskManager } from '@features/workflow/components/TaskManager';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { useTaskManager } from '@features/workflow/hooks/useTaskManager';
import { PromptService } from './services/promptService';

function AppContent() {
  const [showValidation, setShowValidation] = useState(false);
  const [showExecution, setShowExecution] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>(new Date());
  const { getNodes, getEdges } = useReactFlow();

  const taskManager = useTaskManager();

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
      default:
        console.log('Quick action:', action);
    }
  };

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
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showValidation, showExecution]);

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

        <TaskManager
          tasks={taskManager.tasks}
          activeTaskId={taskManager.activeTaskId}
          onCreateTask={taskManager.createTask}
          onDeleteTask={taskManager.deleteTask}
          onSwitchTask={taskManager.switchToTask}
          onDuplicateTask={taskManager.duplicateTask}
          onUpdateTaskName={taskManager.updateTaskName}
        />

        <ContentArea>
          <div className="flex-1 bg-muted/50 p-4">
            <Panel title="Canvas" className="h-full">
              <FlowCanvas />
            </Panel>
          </div>
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
        <AppContent />
      </ReactFlowProvider>
    </ThemeProvider>
  );
}

export default App;
