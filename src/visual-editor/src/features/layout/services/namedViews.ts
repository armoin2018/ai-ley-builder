import type { LayoutContainer, LayoutState } from '../types/layout';

export interface NamedView {
  id: string;
  name: string;
  description?: string;
  layout: LayoutContainer;
  panelPositions: Record<string, string>; // panelId -> containerId
  timestamp: number;
}

export interface NamedViewsStorage {
  views: NamedView[];
  activeView?: string;
}

const STORAGE_KEY = 'visual-editor-named-views';

class NamedViewsService {
  // Save current layout as a named view
  saveView(name: string, description: string, state: LayoutState): NamedView {
    const currentViews = this.loadViews();
    const newView: NamedView = {
      id: `view-${Date.now()}`,
      name,
      description,
      layout: state.containers[state.rootContainer],
      panelPositions: this.extractPanelPositions(state),
      timestamp: Date.now(),
    };

    const updatedStorage: NamedViewsStorage = {
      views: [...currentViews.views, newView],
      activeView: newView.id,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage));
    return newView;
  }

  // Load all named views
  loadViews(): NamedViewsStorage {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : { views: [], activeView: undefined };
    } catch (error) {
      console.error('Failed to load named views:', error);
      return { views: [], activeView: undefined };
    }
  }

  // Delete a named view
  deleteView(viewId: string): void {
    const currentViews = this.loadViews();
    const updatedStorage: NamedViewsStorage = {
      views: currentViews.views.filter(view => view.id !== viewId),
      activeView:
        currentViews.activeView === viewId
          ? undefined
          : currentViews.activeView,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage));
  }

  // Get a specific named view
  getView(viewId: string): NamedView | undefined {
    const views = this.loadViews();
    return views.views.find(view => view.id === viewId);
  }

  // Set active view
  setActiveView(viewId: string | undefined): void {
    const currentViews = this.loadViews();
    const updatedStorage: NamedViewsStorage = {
      ...currentViews,
      activeView: viewId,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage));
  }

  // Extract panel positions from current layout state
  private extractPanelPositions(state: LayoutState): Record<string, string> {
    const positions: Record<string, string> = {};

    const extractFromContainer = (container: LayoutContainer) => {
      container.children.forEach(child => {
        if (typeof child === 'object' && 'title' in child) {
          // This is a panel
          positions[child.id] = container.id;
        } else if (typeof child === 'object' && 'type' in child) {
          // This is a container
          extractFromContainer(child);
        }
      });
    };

    extractFromContainer(state.containers[state.rootContainer]);
    return positions;
  }

  // Generate a layout template from a named view
  viewToTemplate(view: NamedView) {
    return {
      id: view.id,
      name: view.name,
      description: view.description || 'Custom saved view',
      icon: '🔖', // bookmark icon for saved views
      layout: view.layout,
      defaultPanels: [],
    };
  }

  // Update an existing view
  updateView(
    viewId: string,
    updates: Partial<Pick<NamedView, 'name' | 'description'>>
  ): void {
    const currentViews = this.loadViews();
    const updatedStorage: NamedViewsStorage = {
      ...currentViews,
      views: currentViews.views.map(view =>
        view.id === viewId ? { ...view, ...updates } : view
      ),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStorage));
  }
}

export const namedViewsService = new NamedViewsService();
