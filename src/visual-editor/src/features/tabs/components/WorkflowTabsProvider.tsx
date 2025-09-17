import { createContext, useContext, useEffect } from 'react';
import { useWorkflowTabs } from '../hooks/useWorkflowTabs';
import { useWorkflow } from '../../workflow/hooks/useWorkflow';
import type { UseWorkflowTabsReturn } from '../types/tab';

const WorkflowTabsContext = createContext<UseWorkflowTabsReturn | null>(null);

export function useWorkflowTabsContext() {
  const context = useContext(WorkflowTabsContext);
  if (!context) {
    throw new Error('useWorkflowTabsContext must be used within WorkflowTabsProvider');
  }
  return context;
}

interface WorkflowTabsProviderProps {
  children: React.ReactNode;
}

export function WorkflowTabsProvider({ children }: WorkflowTabsProviderProps) {
  const tabs = useWorkflowTabs();
  const workflow = useWorkflow();

  // Sync tab modifications with workflow changes
  useEffect(() => {
    if (tabs.activeTabId && workflow.isModified) {
      tabs.markTabModified(tabs.activeTabId);
    }
  }, [workflow.isModified, tabs.activeTabId, tabs.markTabModified]);

  // Override the workflow save function to integrate with tabs
  useEffect(() => {
    const originalSave = workflow.saveWorkflow;
    
    // Create a wrapper save function that also saves the active tab
    const wrappedSave = async (name?: string, description?: string) => {
      if (tabs.activeTabId) {
        await tabs.saveTab(tabs.activeTabId);
      } else {
        await originalSave(name, description);
      }
    };

    // Note: This is a conceptual integration - in practice you'd want a more sophisticated approach
    // The tabs system is designed to replace the workflow system entirely
  }, [workflow.saveWorkflow, tabs.activeTabId, tabs.saveTab]);

  return (
    <WorkflowTabsContext.Provider value={tabs}>
      {children}
    </WorkflowTabsContext.Provider>
  );
}