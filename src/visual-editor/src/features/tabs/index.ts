// Tab feature exports
export { SourceEditor } from './components/SourceEditor';
export { TabbedRightPanel } from './components/TabbedRightPanel';
export { WorkflowTabs } from './components/WorkflowTabs';
export {
  WorkflowTabsProvider,
  useWorkflowTabsContext,
} from './components/WorkflowTabsProvider';
export { useTabState } from './hooks/useTabState';
export { useWorkflowTabs } from './hooks/useWorkflowTabs';
export type {
  TabOperations,
  TabState,
  UMLFileInfo,
  UseWorkflowTabsReturn,
  WorkflowTab,
} from './types/tab';
