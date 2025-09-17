import { useCallback, useEffect, useState } from 'react';
import { type Edge, type Node, type Viewport } from '@xyflow/react';

export interface Task {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface TaskManagerState {
  tasks: Task[];
  activeTaskId: string | null;
  isModified: boolean;
}

export interface TaskOperations {
  createTask: (name: string, description?: string) => string;
  deleteTask: (taskId: string) => void;
  duplicateTask: (taskId: string, newName?: string) => string;
  switchToTask: (taskId: string) => void;
  updateTaskName: (taskId: string, name: string) => void;
  updateTaskDescription: (taskId: string, description: string) => void;
  updateTaskContent: (
    taskId: string,
    nodes: Node[],
    edges: Edge[],
    viewport: Viewport
  ) => void;
  getActiveTask: () => Task | null;
  markAsModified: () => void;
}

export interface UseTaskManagerReturn
  extends TaskManagerState,
    TaskOperations {}

export function useTaskManager(): UseTaskManagerReturn {
  const [state, setState] = useState<TaskManagerState>({
    tasks: [],
    activeTaskId: null,
    isModified: false,
  });

  // Initialize with a default task
  useEffect(() => {
    if (state.tasks.length === 0) {
      const defaultTask: Task = {
        id: `task_${Date.now()}`,
        name: 'Main Flow',
        description: 'Primary workflow task',
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
      };

      setState(prev => ({
        ...prev,
        tasks: [defaultTask],
        activeTaskId: defaultTask.id,
      }));
    }
  }, [state.tasks.length]);

  const createTask = useCallback(
    (name: string, description?: string): string => {
      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
      };

      setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, newTask],
        isModified: true,
      }));

      return newTask.id;
    },
    []
  );

  const deleteTask = useCallback((taskId: string) => {
    setState(prev => {
      const filteredTasks = prev.tasks.filter(task => task.id !== taskId);

      // If we're deleting the active task, switch to another one
      let newActiveTaskId = prev.activeTaskId;
      if (prev.activeTaskId === taskId) {
        newActiveTaskId = filteredTasks.length > 0 ? filteredTasks[0].id : null;
      }

      return {
        ...prev,
        tasks: filteredTasks,
        activeTaskId: newActiveTaskId,
        isModified: true,
      };
    });
  }, []);

  const duplicateTask = useCallback(
    (taskId: string, newName?: string): string => {
      const originalTask = state.tasks.find(task => task.id === taskId);
      if (!originalTask) {
        throw new Error('Task not found');
      }

      const duplicatedTask: Task = {
        ...originalTask,
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newName || `${originalTask.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: false,
        // Deep clone nodes and edges to avoid references
        nodes: originalTask.nodes.map(node => ({
          ...node,
          id: `${node.id}_copy_${Date.now()}`,
        })),
        edges: originalTask.edges.map(edge => ({
          ...edge,
          id: `${edge.id}_copy_${Date.now()}`,
          source: `${edge.source}_copy_${Date.now()}`,
          target: `${edge.target}_copy_${Date.now()}`,
        })),
      };

      setState(prev => ({
        ...prev,
        tasks: [...prev.tasks, duplicatedTask],
        isModified: true,
      }));

      return duplicatedTask.id;
    },
    [state.tasks]
  );

  const switchToTask = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => ({
        ...task,
        isActive: task.id === taskId,
      })),
      activeTaskId: taskId,
    }));
  }, []);

  const updateTaskName = useCallback((taskId: string, name: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId
          ? { ...task, name, updatedAt: new Date().toISOString() }
          : task
      ),
      isModified: true,
    }));
  }, []);

  const updateTaskDescription = useCallback(
    (taskId: string, description: string) => {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId
            ? { ...task, description, updatedAt: new Date().toISOString() }
            : task
        ),
        isModified: true,
      }));
    },
    []
  );

  const updateTaskContent = useCallback(
    (taskId: string, nodes: Node[], edges: Edge[], viewport: Viewport) => {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(task =>
          task.id === taskId
            ? {
                ...task,
                nodes,
                edges,
                viewport,
                updatedAt: new Date().toISOString(),
              }
            : task
        ),
        isModified: true,
      }));
    },
    []
  );

  const getActiveTask = useCallback((): Task | null => {
    return state.tasks.find(task => task.id === state.activeTaskId) || null;
  }, [state.tasks, state.activeTaskId]);

  const markAsModified = useCallback(() => {
    setState(prev => ({ ...prev, isModified: true }));
  }, []);

  return {
    ...state,
    createTask,
    deleteTask,
    duplicateTask,
    switchToTask,
    updateTaskName,
    updateTaskDescription,
    updateTaskContent,
    getActiveTask,
    markAsModified,
  };
}
