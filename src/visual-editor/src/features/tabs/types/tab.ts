import type { SerializedWorkflow } from '../../workflow/utils/serialization';

export interface WorkflowTab {
  id: string;
  name: string;
  path?: string; // Path to the UML file
  workflow: SerializedWorkflow | null;
  modified: boolean;
  saved: boolean;
  isNew: boolean; // True for newly created tabs that haven't been saved yet
  lastSaved?: Date;
  createdAt: Date;
}

export interface TabState {
  tabs: WorkflowTab[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface TabOperations {
  // Tab management
  createNewTab: (name?: string, path?: string) => Promise<string>;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string, forceDelete?: boolean) => Promise<void>;
  
  // Tab operations
  renameTab: (tabId: string, newName: string) => Promise<void>;
  saveTab: (tabId: string) => Promise<void>;
  runTab: (tabId: string) => Promise<void>;
  
  // Bulk operations
  loadTabsFromUML: () => Promise<void>;
  saveAllTabs: () => Promise<void>;
  closeAllTabs: () => Promise<void>;
  
  // State management
  markTabModified: (tabId: string) => void;
  clearError: () => void;
}

export interface UseWorkflowTabsReturn extends TabState, TabOperations {
  // Additional computed properties
  hasUnsavedTabs: boolean;
  activeTab: WorkflowTab | null;
}

export interface UMLFileInfo {
  name: string;
  path: string;
  content: string;
  lastModified: Date;
}