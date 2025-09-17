// Tab feature exports
export { WorkflowTabs } from './components/WorkflowTabs';
export { WorkflowTabsProvider, useWorkflowTabsContext } from './components/WorkflowTabsProvider';
export { SourceEditor } from './components/SourceEditor';
export { useWorkflowTabs } from './hooks/useWorkflowTabs';
export type { 
  WorkflowTab, 
  TabState, 
  TabOperations, 
  UseWorkflowTabsReturn,
  UMLFileInfo 
} from './types/tab';