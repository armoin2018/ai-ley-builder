import { useCallback, useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import {
  deserializeWorkflow,
  type SerializedWorkflow,
  serializeWorkflow,
} from '../utils/serialization';
import {
  type WorkflowMetadata,
  workflowStorage,
} from '../services/workflowStorage';

export interface WorkflowState {
  currentWorkflow: SerializedWorkflow | null;
  isModified: boolean;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: Date | null;
  error: string | null;
}

export interface WorkflowOperations {
  // Core operations
  newWorkflow: (name?: string) => void;
  saveWorkflow: (name?: string, description?: string) => Promise<void>;
  loadWorkflow: (id: string) => Promise<void>;
  exportWorkflow: () => Promise<void>;
  importWorkflow: () => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  duplicateWorkflow: (id: string, newName?: string) => Promise<string>;

  // Metadata operations
  setWorkflowName: (name: string) => void;
  setWorkflowDescription: (description: string) => void;

  // State management
  markAsModified: () => void;
  clearError: () => void;

  // Auto-save functionality
  enableAutoSave: (intervalMs?: number) => void;
  disableAutoSave: () => void;
}

export interface UseWorkflowReturn extends WorkflowState, WorkflowOperations {
  workflows: WorkflowMetadata[];
  refreshWorkflows: () => Promise<void>;
}

export function useWorkflow(): UseWorkflowReturn {
  const { getNodes, getEdges, setNodes, setEdges, getViewport, setViewport } =
    useReactFlow();
  const [state, setState] = useState<WorkflowState>({
    currentWorkflow: null,
    isModified: false,
    isSaving: false,
    isLoading: false,
    lastSaved: null,
    error: null,
  });

  const [workflows, setWorkflows] = useState<WorkflowMetadata[]>([]);
  const [autoSaveInterval, setAutoSaveInterval] =
    useState<NodeJS.Timeout | null>(null);

  // Load available workflows on mount
  const refreshWorkflows = useCallback(async () => {
    try {
      const availableWorkflows = await workflowStorage.listWorkflows();
      setWorkflows(availableWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  }, []);

  useEffect(() => {
    refreshWorkflows();
  }, [refreshWorkflows]);

  // Create a new workflow
  const newWorkflow = useCallback(
    (_name: string = 'New Workflow') => {
      setState(prev => ({
        ...prev,
        currentWorkflow: null,
        isModified: false,
        error: null,
      }));

      // Clear the canvas
      setNodes([]);
      setEdges([]);
      setViewport({ x: 0, y: 0, zoom: 1 });
    },
    [setNodes, setEdges, setViewport]
  );

  // Save current workflow
  const saveWorkflow = useCallback(
    async (name?: string, description?: string) => {
      setState(prev => ({ ...prev, isSaving: true, error: null }));

      try {
        const nodes = getNodes();
        const edges = getEdges();
        const viewport = getViewport();

        // Use existing workflow data or create new
        const workflowMetadata = {
          id: state.currentWorkflow?.id,
          name: name || state.currentWorkflow?.name || 'Untitled Workflow',
          description: description || state.currentWorkflow?.description,
        };

        const serialized = serializeWorkflow(
          nodes,
          edges,
          viewport,
          workflowMetadata
        );

        // If this is an existing workflow, preserve the creation date
        if (state.currentWorkflow) {
          serialized.createdAt = state.currentWorkflow.createdAt;
        }

        const savedId = await workflowStorage.saveWorkflow(serialized);

        setState(prev => ({
          ...prev,
          currentWorkflow: { ...serialized, id: savedId },
          isModified: false,
          isSaving: false,
          lastSaved: new Date(),
        }));

        await refreshWorkflows();
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSaving: false,
          error:
            error instanceof Error ? error.message : 'Failed to save workflow',
        }));
      }
    },
    [getNodes, getEdges, getViewport, state.currentWorkflow, refreshWorkflows]
  );

  // Load a workflow
  const loadWorkflow = useCallback(
    async (id: string) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const workflow = await workflowStorage.loadWorkflow(id);
        const { nodes, edges, viewport } = deserializeWorkflow(workflow);

        // Apply the workflow to the canvas
        setNodes(nodes);
        setEdges(edges);
        setViewport(viewport);

        setState(prev => ({
          ...prev,
          currentWorkflow: workflow,
          isModified: false,
          isLoading: false,
          lastSaved: new Date(workflow.updatedAt),
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Failed to load workflow',
        }));
      }
    },
    [setNodes, setEdges, setViewport]
  );

  // Export workflow to file
  const exportWorkflow = useCallback(async () => {
    try {
      if (!state.currentWorkflow?.id) {
        throw new Error('No workflow to export');
      }

      await workflowStorage.exportWorkflow(state.currentWorkflow.id);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Failed to export workflow',
      }));
    }
  }, [state.currentWorkflow]);

  // Import workflow from file
  const importWorkflow = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const workflow = await workflowStorage.importWorkflow();

      // Validate and deserialize
      const { nodes, edges, viewport } = deserializeWorkflow(workflow);

      // Generate new ID to avoid conflicts
      const newId = `workflow_${Date.now()}`;
      const importedWorkflow = {
        ...workflow,
        id: newId,
        name: `${workflow.name} (Imported)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save the imported workflow
      await workflowStorage.saveWorkflow(importedWorkflow);

      // Apply to canvas
      setNodes(nodes);
      setEdges(edges);
      setViewport(viewport);

      setState(prev => ({
        ...prev,
        currentWorkflow: importedWorkflow,
        isModified: false,
        isLoading: false,
        lastSaved: new Date(),
      }));

      await refreshWorkflows();
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to import workflow',
      }));
    }
  }, [setNodes, setEdges, setViewport, refreshWorkflows]);

  // Delete a workflow
  const deleteWorkflow = useCallback(
    async (id: string) => {
      try {
        await workflowStorage.deleteWorkflow(id);
        await refreshWorkflows();
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to delete workflow',
        }));
      }
    },
    [refreshWorkflows]
  );

  // Duplicate a workflow
  const duplicateWorkflow = useCallback(
    async (id: string, newName?: string) => {
      try {
        const duplicatedId = await workflowStorage.duplicateWorkflow(
          id,
          newName
        );
        await refreshWorkflows();
        return duplicatedId;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to duplicate workflow',
        }));
        throw error;
      }
    },
    [refreshWorkflows]
  );

  // Set workflow name
  const setWorkflowName = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      currentWorkflow: prev.currentWorkflow
        ? {
            ...prev.currentWorkflow,
            name,
          }
        : null,
      isModified: true,
    }));
  }, []);

  // Set workflow description
  const setWorkflowDescription = useCallback((description: string) => {
    setState(prev => ({
      ...prev,
      currentWorkflow: prev.currentWorkflow
        ? {
            ...prev.currentWorkflow,
            description,
          }
        : null,
      isModified: true,
    }));
  }, []);

  // Mark workflow as modified
  const markAsModified = useCallback(() => {
    setState(prev => ({ ...prev, isModified: true }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Auto-save functionality
  const enableAutoSave = useCallback(
    (intervalMs: number = 30000) => {
      // Clear existing interval
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }

      const interval = setInterval(async () => {
        // Only auto-save if there are unsaved changes and a current workflow
        if (state.isModified && state.currentWorkflow && !state.isSaving) {
          await saveWorkflow();
        }
      }, intervalMs);

      setAutoSaveInterval(interval);
    },
    [
      autoSaveInterval,
      state.isModified,
      state.currentWorkflow,
      state.isSaving,
      saveWorkflow,
    ]
  );

  const disableAutoSave = useCallback(() => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval);
      setAutoSaveInterval(null);
    }
  }, [autoSaveInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [autoSaveInterval]);

  return {
    ...state,
    workflows,
    refreshWorkflows,
    newWorkflow,
    saveWorkflow,
    loadWorkflow,
    exportWorkflow,
    importWorkflow,
    deleteWorkflow,
    duplicateWorkflow,
    setWorkflowName,
    setWorkflowDescription,
    markAsModified,
    clearError,
    enableAutoSave,
    disableAutoSave,
  };
}
