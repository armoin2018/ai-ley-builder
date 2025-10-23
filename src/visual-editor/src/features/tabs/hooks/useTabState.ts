import type { Edge, Node, Viewport } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import {
  flowToPlantUML,
  parsePlantUMLToFlow,
} from '../../../utils/plantuml-parser';

/**
 * Tab State Interface
 * Single source of truth for tab state management
 */
export interface TabState {
  id: string;
  name: string;
  path?: string;
  visualState: {
    nodes: Node[];
    edges: Edge[];
    viewport: Viewport;
  };
  sourceState: string;
  activeView: 'visual' | 'source';
  modified: boolean;
  saved: boolean;
  lastSaved?: number;
  lastModified?: number;
}

/**
 * Default state factory
 */
/**
 * Create default tab state
 */
function createDefaultState(tabId: string): TabState {
  return {
    id: tabId,
    name: `Tab ${tabId}`,
    activeView: 'visual',
    visualState: {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
    },
    sourceState: '',
    lastModified: Date.now(),
    saved: true,
    modified: false,
  };
}

/**
 * Migrate old storage keys to new format
 * CRITICAL: This function READS the old keys before deletion to prevent data loss
 */
/**
 * Migrate data from old storage keys to new format
 * This function reads old keys, extracts data, and returns it for migration
 * WITHOUT deleting the old keys yet (that happens after successful migration)
 */
function migrateOldStorageKeys(tabId: string): TabState | null {
  // Try multiple old key patterns (in order of preference)
  const oldContentKeys = [
    `puml-content-tab-plantuml-${tabId}`,
    `puml-content-${tabId}`,
    `puml-content-tab-${tabId}`,
  ];

  let migratedContent: string | null = null;

  // Find the first old key that has content
  for (const key of oldContentKeys) {
    const content = localStorage.getItem(key);
    if (content) {
      migratedContent = content;
      break;
    }
  }

  if (migratedContent) {
    return {
      id: tabId,
      name: `Tab ${tabId}`,
      activeView: 'source', // Assume they were in source view if content exists
      visualState: {
        nodes: [],
        edges: [],
        viewport: { x: 0, y: 0, zoom: 1 },
      },
      sourceState: migratedContent,
      lastModified: Date.now(),
      saved: false, // Mark as unsaved so user knows to save
      modified: true,
    };
  }

  return null;
}

/**
 * Storage key helper
 */
function getStorageKey(tabId: string): string {
  return `ailey-tab-state-${tabId}`;
}

/**
 * Save state to localStorage
 */
function saveStateToStorage(state: TabState): void {
  try {
    const key = getStorageKey(state.id);
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error(`❌ Failed to save state for tab ${state.id}:`, error);
  }
}

/**
 * Clean up old storage keys after successful migration
 * Only call this AFTER the new state has been successfully saved
 */
function cleanupOldStorageKeys(tabId: string): void {
  const oldKeys = [
    `puml-content-tab-plantuml-${tabId}`,
    `puml-content-${tabId}`,
    `puml-content-tab-${tabId}`,
    `tab-${tabId}`,
  ];

  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Unified Tab State Management Hook
 *
 * This hook provides a single source of truth for tab state management,
 * eliminating the race conditions and inconsistencies from multiple
 * localStorage keys and state sources.
 *
 * Features:
 * - Single source of truth in React state
 * - Automatic persistence to localStorage
 * - Seamless view switching (visual ↔ source)
 * - React Flow integration for canvas state
 * - State synchronization
 * - Cleanup of legacy storage keys
 *
 * @param tabId - Unique identifier for the tab
 * @param getNodes - React Flow function to get current nodes
 * @param getEdges - React Flow function to get current edges
 * @param setNodes - React Flow function to set nodes
 * @param setEdges - React Flow function to set edges
 * @param setViewport - React Flow function to set viewport
 * @returns Tab state and management functions
 */
export function useTabState(
  tabId: string,
  getNodes: () => Node[],
  getEdges: () => Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
  _setViewport: (viewport: Viewport) => void
) {
  // Initialize state from storage or migration
  const [state, setState] = useState<TabState>(() => {
    const stored = localStorage.getItem(getStorageKey(tabId));
    if (stored) {
      try {
        return JSON.parse(stored) as TabState;
      } catch {
        // Fall through to migration
      }
    }

    // No modern storage found - attempt migration from old keys
    const migrated = migrateOldStorageKeys(tabId);
    const defaultState = createDefaultState(tabId);

    // Use migrated state if available, otherwise use default
    const initialState = migrated || defaultState;

    // Clean up old storage keys after successful migration
    if (migrated) {
      cleanupOldStorageKeys(tabId);
    }

    return initialState;
  }); // Auto-persist to localStorage whenever state changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  /**
   * Update visual state (nodes, edges, viewport)
   */
  const updateVisualState = useCallback(
    (nodes: Node[], edges: Edge[], viewport?: Viewport) => {
      setState(prev => ({
        ...prev,
        visualState: {
          nodes,
          edges,
          viewport: viewport || prev.visualState.viewport,
        },
        modified: true,
        lastModified: Date.now(),
      }));
    },
    []
  );

  /**
   * Update source state (PlantUML content)
   */
  const updateSourceState = useCallback((sourceContent: string) => {
    setState(prev => ({
      ...prev,
      sourceState: sourceContent,
      modified: true,
      lastModified: Date.now(),
    }));
  }, []);

  /**
   * Switch between visual and source views
   * Handles conversion between formats
   */
  const switchView = useCallback(
    (newView: 'visual' | 'source') => {
      setState(prev => {
        // If already in the requested view, no change needed
        if (newView === prev.activeView) {
          console.log(`✓ Already in ${newView} view, no switch needed`);
          return prev;
        }

        if (newView === 'source') {
          // Converting visual to source
          const nodes = getNodes();
          const edges = getEdges();

          console.log('🔄 Converting visual to source:', {
            nodesCount: nodes.length,
            edgesCount: edges.length,
            tabName: prev.name,
            sampleNode: nodes[0]
              ? {
                  id: nodes[0].id,
                  type: nodes[0].type,
                  position: nodes[0].position,
                }
              : null,
          });

          const plantuml = flowToPlantUML(nodes, edges, prev.name);

          console.log('✅ Generated PlantUML:', {
            length: plantuml.length,
            preview: `${plantuml.substring(0, 150)}...`,
          });

          return {
            ...prev,
            visualState: {
              ...prev.visualState,
              nodes, // Save current node positions before switching
              edges,
            },
            sourceState: plantuml,
            activeView: 'source',
            saved: false,
            modified: true,
            lastModified: Date.now(),
          };
        } else {
          // Converting source to visual
          try {
            console.log('🔄 Converting source to visual:', {
              sourceLength: prev.sourceState.length,
              sourcePreview: `${prev.sourceState.substring(0, 150)}...`,
            });

            const { nodes, edges } = parsePlantUMLToFlow(prev.sourceState);

            console.log('✅ Parsed PlantUML to nodes/edges:', {
              nodesCount: nodes.length,
              edgesCount: edges.length,
              sampleNode: nodes[0]
                ? {
                    id: nodes[0].id,
                    type: nodes[0].type,
                    position: nodes[0].position,
                  }
                : null,
            });

            // Update React Flow immediately
            setNodes(nodes);
            setEdges(edges);

            console.log('✅ Updated React Flow canvas with parsed nodes/edges');

            return {
              ...prev,
              visualState: {
                ...prev.visualState,
                nodes,
                edges,
              },
              activeView: 'visual',
              saved: false,
              modified: true,
              lastModified: Date.now(),
            };
          } catch (error) {
            console.error('❌ Failed to parse PlantUML:', error);
            // If parsing fails, keep source view active so user can fix the syntax
            return {
              ...prev,
              activeView: 'source',
            };
          }
        }
      });
    },
    [getNodes, getEdges, setNodes, setEdges]
  );

  /**
   * Switch to source view with conversion
   * Convenience method that wraps switchView('source')
   */
  const switchToSource = useCallback(() => {
    switchView('source');
  }, [switchView]);

  /**
   * Switch to visual view with conversion
   * Convenience method that wraps switchView('visual')
   */
  const switchToVisual = useCallback(() => {
    switchView('visual');
  }, [switchView]);

  /**
   * Mark as saved
   */
  const markSaved = useCallback(() => {
    setState(prev => ({
      ...prev,
      saved: true,
      modified: false,
      lastSaved: Date.now(),
    }));
  }, []);

  /**
   * Mark as modified
   */
  const markModified = useCallback(() => {
    setState(prev => ({
      ...prev,
      modified: true,
      saved: false,
      lastModified: Date.now(),
    }));
  }, []);

  /**
   * Update tab name
   */
  const updateName = useCallback((newName: string) => {
    setState(prev => ({
      ...prev,
      name: newName,
      modified: true,
      lastModified: Date.now(),
    }));
  }, []);

  /**
   * Update tab path
   */
  const updatePath = useCallback((newPath: string) => {
    setState(prev => ({
      ...prev,
      path: newPath,
      modified: true,
      lastModified: Date.now(),
    }));
  }, []);

  /**
   * Reset to default state
   */
  const reset = useCallback(() => {
    const defaultState = createDefaultState(tabId);
    // Preserve the tab name when resetting
    setState({ ...defaultState, name: state.name });
    cleanupOldStorageKeys(tabId);
  }, [tabId, state.name]);

  /**
   * Get current content based on active view
   */
  const getCurrentContent = useCallback(():
    | string
    | { nodes: Node[]; edges: Edge[] } => {
    if (state.activeView === 'source') {
      return state.sourceState;
    } else {
      return {
        nodes: state.visualState.nodes,
        edges: state.visualState.edges,
      };
    }
  }, [state.activeView, state.sourceState, state.visualState]);

  return {
    // State
    state,

    // View management
    switchView,
    switchToSource,
    switchToVisual,

    // State updates
    updateVisualState,
    updateSourceState,
    updateName,
    updatePath,

    // Status management
    markSaved,
    markModified,

    // Utilities
    reset,
    getCurrentContent,

    // Computed properties
    isModified: state.modified,
    isSaved: state.saved,
    activeView: state.activeView,
    name: state.name,
  };
}

/**
 * Hook to manage multiple tab states
 */
export function useMultiTabState() {
  const [tabStates, setTabStates] = useState<Map<string, TabState>>(new Map());
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  /**
   * Get state for a specific tab
   */
  const getTabState = useCallback(
    (tabId: string): TabState | undefined => {
      return tabStates.get(tabId);
    },
    [tabStates]
  );

  /**
   * Update state for a specific tab
   */
  const updateTabState = useCallback(
    (tabId: string, updater: (prev: TabState) => TabState) => {
      setTabStates(prev => {
        const newMap = new Map(prev);
        const current = newMap.get(tabId);
        if (current) {
          newMap.set(tabId, updater(current));
        }
        return newMap;
      });
    },
    []
  );

  /**
   * Add a new tab
   */
  const addTab = useCallback((tabId: string, name: string = 'Untitled') => {
    const newState = { ...createDefaultState(tabId), name };
    setTabStates(prev => new Map(prev).set(tabId, newState));
    saveStateToStorage(newState);
    cleanupOldStorageKeys(tabId);
    return newState;
  }, []);

  /**
   * Remove a tab
   */
  const removeTab = useCallback((tabId: string) => {
    setTabStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(tabId);
      return newMap;
    });
    // Clean up storage
    const key = getStorageKey(tabId);
    localStorage.removeItem(key);
    cleanupOldStorageKeys(tabId);
  }, []);

  return {
    tabStates,
    activeTabId,
    setActiveTabId,
    getTabState,
    updateTabState,
    addTab,
    removeTab,
  };
}
