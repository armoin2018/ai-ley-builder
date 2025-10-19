import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from 'react';
import type {
  DragState,
  DropZone,
  LayoutAction,
  LayoutContainer,
  LayoutContextType,
  LayoutState,
  LayoutTemplate,
  Panel,
} from '../types/layout';

// Initial state
const initialLayoutState: LayoutState = {
  containers: {
    root: {
      id: 'root',
      type: 'horizontal',
      children: [],
    },
  },
  panels: {},
  rootContainer: 'root',
  activeDropZones: [],
  draggedPanel: undefined,
};

const initialDragState: DragState = {
  isDragging: false,
  draggedPanel: undefined,
  dragOffset: undefined,
  hoveredDropZone: undefined,
};

// Layout reducer
function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'ADD_PANEL': {
      const { panel, containerId = 'root' } = action;
      const newState = {
        ...state,
        panels: {
          ...state.panels,
          [panel.id]: panel,
        },
        containers: {
          ...state.containers,
          [containerId]: {
            ...state.containers[containerId],
            children: [...state.containers[containerId].children, panel],
          },
        },
      };
      return newState;
    }

    case 'UPDATE_PANEL': {
      const { panel } = action;
      return {
        ...state,
        panels: {
          ...state.panels,
          [panel.id]: panel,
        },
      };
    }

    case 'REMOVE_PANEL': {
      const { panelId } = action;
      const newPanels = { ...state.panels };
      delete newPanels[panelId];

      const newContainers = { ...state.containers };
      Object.keys(newContainers).forEach(containerId => {
        newContainers[containerId] = {
          ...newContainers[containerId],
          children: newContainers[containerId].children.filter(child =>
            typeof child === 'object' && 'id' in child
              ? child.id !== panelId
              : true
          ),
        };
      });

      return {
        ...state,
        panels: newPanels,
        containers: newContainers,
      };
    }

    case 'DROP_PANEL': {
      const { panelId, zoneId } = action;
      const panel = state.panels[panelId];
      if (!panel) return state;

      // Remove panel from current container
      const newContainers = { ...state.containers };
      Object.keys(newContainers).forEach(containerId => {
        newContainers[containerId] = {
          ...newContainers[containerId],
          children: newContainers[containerId].children.filter(child =>
            typeof child === 'object' && 'id' in child
              ? child.id !== panelId
              : true
          ),
        };
      });

      // Add panel to new location based on zone
      const zone = state.activeDropZones.find(z => z.id === zoneId);
      if (zone) {
        const targetContainerId = zone.parentId || 'root';
        if (newContainers[targetContainerId]) {
          // Handle different drop zone types
          switch (zone.type) {
            case 'left':
            case 'right':
            case 'top':
            case 'bottom': {
              // Create new container if needed
              const newContainerId = `container-${Date.now()}`;
              const isHorizontal =
                zone.type === 'left' || zone.type === 'right';

              newContainers[newContainerId] = {
                id: newContainerId,
                type: isHorizontal ? 'horizontal' : 'vertical',
                children:
                  zone.type === 'left' || zone.type === 'top'
                    ? [panel, ...newContainers[targetContainerId].children]
                    : [...newContainers[targetContainerId].children, panel],
              };

              // Replace target container's children
              const parentContainer = Object.values(newContainers).find(c =>
                c.children.some(
                  child =>
                    typeof child === 'object' &&
                    'id' in child &&
                    child.id === targetContainerId
                )
              );

              if (parentContainer) {
                parentContainer.children = parentContainer.children.map(
                  child =>
                    typeof child === 'object' &&
                    'id' in child &&
                    child.id === targetContainerId
                      ? newContainers[newContainerId]
                      : child
                );
              } else {
                // This is the root container
                state.rootContainer = newContainerId;
              }
              break;
            }
            case 'center':
            case 'tab': {
              // Add to existing container
              newContainers[targetContainerId] = {
                ...newContainers[targetContainerId],
                children: [...newContainers[targetContainerId].children, panel],
              };
              break;
            }
          }
        }
      }

      return {
        ...state,
        containers: newContainers,
        activeDropZones: [],
        draggedPanel: undefined,
      };
    }

    case 'APPLY_TEMPLATE': {
      const { template } = action;
      return {
        ...state,
        containers: {
          ...state.containers,
          [template.layout.id]: template.layout,
        },
        panels: {
          ...state.panels,
          ...template.defaultPanels.reduce(
            (acc, panel) => ({ ...acc, [panel.id]: panel }),
            {}
          ),
        },
        rootContainer: template.layout.id,
      };
    }

    case 'RESIZE_CONTAINER': {
      const { containerId, size } = action;
      return {
        ...state,
        containers: {
          ...state.containers,
          [containerId]: {
            ...state.containers[containerId],
            size,
          },
        },
      };
    }

    case 'SAVE_NAMED_VIEW': {
      const { name, description } = action;
      // Import namedViewsService dynamically to avoid circular imports
      import('../services/namedViews').then(({ namedViewsService }) => {
        namedViewsService.saveView(name, description || '', state);
      });
      return state;
    }

    case 'LOAD_NAMED_VIEW': {
      const { viewId } = action;
      // Import namedViewsService dynamically to avoid circular imports
      import('../services/namedViews').then(({ namedViewsService }) => {
        const view = namedViewsService.getView(viewId);
        if (view) {
          const template = namedViewsService.viewToTemplate(view);
          // Apply the view as a template
          // This will be handled by the component calling this action
        }
      });
      return state;
    }

    case 'TOGGLE_PANEL_COLLAPSE': {
      const { panelId } = action;
      const panel = state.panels[panelId];
      if (!panel) return state;

      return {
        ...state,
        panels: {
          ...state.panels,
          [panelId]: {
            ...panel,
            collapsed: !panel.collapsed,
          },
        },
      };
    }

    default:
      return state;
  }
}

// Drag reducer
function dragReducer(state: DragState, action: LayoutAction): DragState {
  switch (action.type) {
    case 'START_DRAG':
      return {
        ...state,
        isDragging: true,
        draggedPanel: action.panel,
        dragOffset: action.offset,
      };

    case 'END_DRAG':
      return {
        ...state,
        isDragging: false,
        draggedPanel: undefined,
        dragOffset: undefined,
        hoveredDropZone: undefined,
      };

    case 'SET_HOVERED_DROP_ZONE':
      return {
        ...state,
        hoveredDropZone: action.zoneId,
      };

    default:
      return state;
  }
}

// Context
const LayoutContext = createContext<LayoutContextType | null>(null);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [layoutState, layoutDispatch] = useReducer(
    layoutReducer,
    initialLayoutState
  );
  const [dragState, dragDispatch] = useReducer(dragReducer, initialDragState);

  const dispatch = useCallback((action: LayoutAction) => {
    layoutDispatch(action);
    dragDispatch(action);
  }, []);

  const registerDropZone = useCallback((zone: DropZone) => {
    layoutDispatch({
      type: 'ADD_PANEL' as any, // We'll handle this differently
      panel: zone as any,
    });
  }, []);

  const unregisterDropZone = useCallback((zoneId: string) => {
    layoutDispatch({
      type: 'REMOVE_PANEL',
      panelId: zoneId,
    });
  }, []);

  const getAvailablePanels = useCallback((): Panel[] => {
    return Object.values(layoutState.panels);
  }, [layoutState.panels]);

  const applyTemplate = useCallback(
    (template: LayoutTemplate) => {
      dispatch({ type: 'APPLY_TEMPLATE', template });
    },
    [dispatch]
  );

  const value: LayoutContextType = {
    state: layoutState,
    dragState,
    dispatch,
    registerDropZone,
    unregisterDropZone,
    getAvailablePanels,
    applyTemplate,
  };

  return (
    <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
