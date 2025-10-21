import { act, renderHook, waitFor } from '@testing-library/react';
import type { Edge, Node, Viewport } from '@xyflow/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useMultiTabState, useTabState, type TabState } from '../useTabState';

/**
 * TASK-004: Unit Tests for State Management
 *
 * Comprehensive test suite for the useTabState hook implemented in TASK-002.
 * Tests cover:
 * - State initialization and defaults
 * - State persistence to localStorage
 * - View switching (visual ↔ source)
 * - State updates and synchronization
 * - Migration from old storage keys
 * - Edge cases and error handling
 *
 * Success Criteria:
 * - >80% test coverage for state management code
 * - All state transitions tested
 * - Persistence logic validated
 * - Synchronization tests passing
 * - Edge cases covered
 */

// Mock the PlantUML utilities
vi.mock('../../../../utils/plantuml-parser', () => ({
  flowToPlantUML: vi.fn((nodes: Node[], edges: Edge[], name: string) => {
    return `@startuml\n' ${name}\n' Nodes: ${nodes.length}\n' Edges: ${edges.length}\n@enduml`;
  }),
  parsePlantUMLToFlow: vi.fn((content: string) => {
    // Simple mock parser - returns nodes/edges based on content
    if (content.includes('ERROR')) {
      throw new Error('Parse error');
    }
    return {
      nodes: [
        {
          id: '1',
          type: 'default',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' },
        },
      ],
      edges: [],
    };
  }),
}));

describe('useTabState', () => {
  let mockGetNodes: ReturnType<typeof vi.fn>;
  let mockGetEdges: ReturnType<typeof vi.fn>;
  let mockSetNodes: ReturnType<typeof vi.fn>;
  let mockSetEdges: ReturnType<typeof vi.fn>;
  let mockSetViewport: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();

    // Reset mocks
    mockGetNodes = vi.fn(() => []);
    mockGetEdges = vi.fn(() => []);
    mockSetNodes = vi.fn();
    mockSetEdges = vi.fn();
    mockSetViewport = vi.fn();
  });

  describe('Initialization', () => {
    it('should initialize with default state when no storage exists', () => {
      const { result } = renderHook(() =>
        useTabState(
          'test-tab-1',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      expect(result.current.state.id).toBe('test-tab-1');
      expect(result.current.state.name).toBe('Tab test-tab-1');
      expect(result.current.state.activeView).toBe('visual');
      expect(result.current.state.visualState.nodes).toEqual([]);
      expect(result.current.state.visualState.edges).toEqual([]);
      expect(result.current.state.sourceState).toBe('');
      expect(result.current.state.modified).toBe(false);
      expect(result.current.state.saved).toBe(true);
    });

    it('should load state from localStorage if it exists', () => {
      const existingState: TabState = {
        id: 'test-tab-2',
        name: 'My Tab',
        activeView: 'source',
        visualState: {
          nodes: [
            {
              id: '1',
              type: 'default',
              position: { x: 0, y: 0 },
              data: { label: 'Test' },
            },
          ],
          edges: [],
          viewport: { x: 0, y: 0, zoom: 1 },
        },
        sourceState: '@startuml\nTest\n@enduml',
        modified: true,
        saved: false,
        lastModified: Date.now(),
      };

      localStorage.setItem(
        'ailey-tab-state-test-tab-2',
        JSON.stringify(existingState)
      );

      const { result } = renderHook(() =>
        useTabState(
          'test-tab-2',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      expect(result.current.state.id).toBe('test-tab-2');
      expect(result.current.state.name).toBe('My Tab');
      expect(result.current.state.activeView).toBe('source');
      expect(result.current.state.sourceState).toBe('@startuml\nTest\n@enduml');
      expect(result.current.state.modified).toBe(true);
      expect(result.current.state.saved).toBe(false);
    });

    it('should migrate from old storage keys if modern storage not found', () => {
      // Set up old storage key
      localStorage.setItem(
        'puml-content-tab-plantuml-old-tab',
        '@startuml\nOld Content\n@enduml'
      );

      const { result } = renderHook(() =>
        useTabState(
          'old-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      expect(result.current.state.sourceState).toBe(
        '@startuml\nOld Content\n@enduml'
      );
      expect(result.current.state.activeView).toBe('source');
      expect(result.current.state.modified).toBe(true);
      expect(result.current.state.saved).toBe(false);
    });

    it('should clean up old storage keys after migration', async () => {
      localStorage.setItem(
        'puml-content-tab-plantuml-cleanup-tab',
        'Old Content'
      );
      localStorage.setItem('puml-content-cleanup-tab', 'Old Content 2');

      renderHook(() =>
        useTabState(
          'cleanup-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      // Wait for cleanup to occur
      await waitFor(() => {
        expect(
          localStorage.getItem('puml-content-tab-plantuml-cleanup-tab')
        ).toBeNull();
        expect(localStorage.getItem('puml-content-cleanup-tab')).toBeNull();
      });
    });
  });

  describe('State Persistence', () => {
    it('should persist state to localStorage when state changes', async () => {
      const { result } = renderHook(() =>
        useTabState(
          'persist-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      act(() => {
        result.current.updateName('New Name');
      });

      await waitFor(() => {
        const stored = localStorage.getItem('ailey-tab-state-persist-tab');
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(parsed.name).toBe('New Name');
      });
    });

    it('should handle localStorage errors gracefully', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });

      const { result } = renderHook(() =>
        useTabState(
          'error-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      act(() => {
        result.current.updateName('Test');
      });

      // Should not throw, but should log error
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      // Restore
      localStorage.setItem = originalSetItem;
      consoleErrorSpy.mockRestore();
    });
  });

  describe('View Switching', () => {
    it('should switch from visual to source view', () => {
      mockGetNodes.mockReturnValue([
        {
          id: '1',
          type: 'default',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' },
        },
      ]);
      mockGetEdges.mockReturnValue([{ id: 'e1-2', source: '1', target: '2' }]);

      const { result } = renderHook(() =>
        useTabState(
          'switch-tab-1',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      expect(result.current.state.activeView).toBe('visual');

      act(() => {
        result.current.switchToSource();
      });

      expect(result.current.state.activeView).toBe('source');
      expect(result.current.state.sourceState).toContain('@startuml');
      expect(result.current.state.modified).toBe(true);
      expect(result.current.state.saved).toBe(false);
      expect(mockGetNodes).toHaveBeenCalled();
      expect(mockGetEdges).toHaveBeenCalled();
    });

    it('should switch from source to visual view', () => {
      const { result } = renderHook(() =>
        useTabState(
          'switch-tab-2',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      // First switch to source view
      act(() => {
        mockGetNodes.mockReturnValue([]);
        mockGetEdges.mockReturnValue([]);
        result.current.switchToSource();
      });

      // Set source content
      act(() => {
        result.current.updateSourceState('@startuml\nTest Content\n@enduml');
      });

      // Clear the mocks before switching to visual
      mockSetNodes.mockClear();
      mockSetEdges.mockClear();

      // Switch to visual
      act(() => {
        result.current.switchToVisual();
      });

      expect(result.current.state.activeView).toBe('visual');
      expect(mockSetNodes).toHaveBeenCalled();
      expect(mockSetEdges).toHaveBeenCalled();
    });

    it('should not change view if already in requested view', () => {
      const { result } = renderHook(() =>
        useTabState(
          'same-view-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      const initialState = result.current.state;

      act(() => {
        result.current.switchToVisual(); // Already in visual
      });

      expect(result.current.state).toBe(initialState); // Same reference, no change
    });

    it('should handle PlantUML parse errors when switching to visual', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() =>
        useTabState(
          'parse-error-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      // First switch to source view
      act(() => {
        mockGetNodes.mockReturnValue([]);
        mockGetEdges.mockReturnValue([]);
        result.current.switchToSource();
      });

      // Set content that will cause parse error
      act(() => {
        result.current.updateSourceState('@startuml\nERROR Content\n@enduml');
      });

      // Try to switch to visual
      act(() => {
        result.current.switchToVisual();
      });

      // Should stay in source view if parsing fails
      expect(result.current.state.activeView).toBe('source');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should use switchView directly with specific view', () => {
      const { result } = renderHook(() =>
        useTabState(
          'direct-switch-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      act(() => {
        result.current.switchView('source');
      });

      expect(result.current.state.activeView).toBe('source');

      act(() => {
        result.current.switchView('visual');
      });

      expect(result.current.state.activeView).toBe('visual');
    });
  });

  describe('State Updates', () => {
    it('should update visual state correctly', () => {
      const { result } = renderHook(() =>
        useTabState(
          'update-visual-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      const newNodes: Node[] = [
        {
          id: '1',
          type: 'default',
          position: { x: 100, y: 100 },
          data: { label: 'New Node' },
        },
      ];
      const newEdges: Edge[] = [{ id: 'e1-2', source: '1', target: '2' }];
      const newViewport: Viewport = { x: 50, y: 50, zoom: 1.5 };

      act(() => {
        result.current.updateVisualState(newNodes, newEdges, newViewport);
      });

      expect(result.current.state.visualState.nodes).toEqual(newNodes);
      expect(result.current.state.visualState.edges).toEqual(newEdges);
      expect(result.current.state.visualState.viewport).toEqual(newViewport);
      expect(result.current.state.modified).toBe(true);
      expect(result.current.isModified).toBe(true);
    });

    it('should update visual state without changing viewport if not provided', () => {
      const { result } = renderHook(() =>
        useTabState(
          'update-no-viewport-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      const initialViewport = result.current.state.visualState.viewport;

      act(() => {
        result.current.updateVisualState([], []);
      });

      expect(result.current.state.visualState.viewport).toEqual(
        initialViewport
      );
    });

    it('should update source state correctly', () => {
      const { result } = renderHook(() =>
        useTabState(
          'update-source-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      const newContent = '@startuml\nNew PlantUML Content\n@enduml';

      act(() => {
        result.current.updateSourceState(newContent);
      });

      expect(result.current.state.sourceState).toBe(newContent);
      expect(result.current.state.modified).toBe(true);
      expect(result.current.state.lastModified).toBeDefined();
    });

    it('should update tab name', () => {
      const { result } = renderHook(() =>
        useTabState(
          'rename-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      act(() => {
        result.current.updateName('My Workflow');
      });

      expect(result.current.state.name).toBe('My Workflow');
      expect(result.current.name).toBe('My Workflow');
      expect(result.current.state.modified).toBe(true);
    });

    it('should update tab path', () => {
      const { result } = renderHook(() =>
        useTabState(
          'path-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      act(() => {
        result.current.updatePath('/path/to/file.puml');
      });

      expect(result.current.state.path).toBe('/path/to/file.puml');
      expect(result.current.state.modified).toBe(true);
    });
  });

  describe('Status Management', () => {
    it('should mark as saved', () => {
      const { result } = renderHook(() =>
        useTabState(
          'mark-saved-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      // First modify
      act(() => {
        result.current.updateName('Modified');
      });

      expect(result.current.state.modified).toBe(true);
      // Note: updateName doesn't explicitly set saved: false, it only sets modified: true
      // The initial state has saved: true, so it remains true until explicitly changed

      // Now mark as modified explicitly which sets saved: false
      act(() => {
        result.current.markModified();
      });

      expect(result.current.state.modified).toBe(true);
      expect(result.current.state.saved).toBe(false);

      // Then mark as saved
      act(() => {
        result.current.markSaved();
      });

      expect(result.current.state.saved).toBe(true);
      expect(result.current.state.modified).toBe(false);
      expect(result.current.isSaved).toBe(true);
      expect(result.current.state.lastSaved).toBeDefined();
    });

    it('should mark as modified', () => {
      const { result } = renderHook(() =>
        useTabState(
          'mark-modified-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      act(() => {
        result.current.markModified();
      });

      expect(result.current.state.modified).toBe(true);
      expect(result.current.state.saved).toBe(false);
      expect(result.current.isModified).toBe(true);
    });
  });

  describe('Utilities', () => {
    it('should reset to default state while preserving name', () => {
      const { result } = renderHook(() =>
        useTabState(
          'reset-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      // Modify state
      act(() => {
        result.current.updateName('My Tab');
        result.current.updateSourceState('Some content');
        result.current.updatePath('/some/path');
      });

      const tabName = result.current.state.name;

      act(() => {
        result.current.reset();
      });

      expect(result.current.state.name).toBe(tabName); // Name preserved
      expect(result.current.state.sourceState).toBe('');
      expect(result.current.state.path).toBeUndefined();
      expect(result.current.state.activeView).toBe('visual');
    });

    it('should get current content based on active view - visual', () => {
      const { result } = renderHook(() =>
        useTabState(
          'content-visual-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      const nodes: Node[] = [
        {
          id: '1',
          type: 'default',
          position: { x: 0, y: 0 },
          data: { label: 'Node' },
        },
      ];

      act(() => {
        result.current.updateVisualState(nodes, []);
      });

      const content = result.current.getCurrentContent();

      expect(typeof content).toBe('object');
      expect((content as { nodes: Node[] }).nodes).toEqual(nodes);
    });

    it('should get current content based on active view - source', () => {
      mockGetNodes.mockReturnValue([]);
      mockGetEdges.mockReturnValue([]);

      const { result } = renderHook(() =>
        useTabState(
          'content-source-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      // First switch to source view (this will generate PlantUML from empty visual state)
      act(() => {
        result.current.switchView('source');
      });

      // Now update source state
      const sourceContent = '@startuml\nTest\n@enduml';
      act(() => {
        result.current.updateSourceState(sourceContent);
      });

      const content = result.current.getCurrentContent();

      expect(typeof content).toBe('string');
      expect(content).toBe(sourceContent);
    });
  });

  describe('Computed Properties', () => {
    it('should expose computed properties correctly', () => {
      const { result } = renderHook(() =>
        useTabState(
          'computed-tab',
          mockGetNodes,
          mockGetEdges,
          mockSetNodes,
          mockSetEdges,
          mockSetViewport
        )
      );

      expect(result.current.isModified).toBe(false);
      expect(result.current.isSaved).toBe(true);
      expect(result.current.activeView).toBe('visual');
      expect(result.current.name).toBe('Tab computed-tab');

      act(() => {
        result.current.updateName('New Name');
      });

      expect(result.current.isModified).toBe(true);
      // Note: updateName doesn't explicitly set saved: false
      // We need to call markModified to change saved status
      expect(result.current.name).toBe('New Name');

      // Now explicitly mark as modified to change saved status
      act(() => {
        result.current.markModified();
      });

      expect(result.current.isSaved).toBe(false);
    });
  });
});

describe('useMultiTabState', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Multi-Tab Management', () => {
    it('should initialize with empty tab states', () => {
      const { result } = renderHook(() => useMultiTabState());

      expect(result.current.tabStates.size).toBe(0);
      expect(result.current.activeTabId).toBeNull();
    });

    it('should add a new tab', () => {
      const { result } = renderHook(() => useMultiTabState());

      let newTab: TabState | undefined;

      act(() => {
        newTab = result.current.addTab('tab-1', 'First Tab');
      });

      expect(result.current.tabStates.size).toBe(1);
      expect(newTab).toBeDefined();
      expect(newTab?.id).toBe('tab-1');
      expect(newTab?.name).toBe('First Tab');
    });

    it('should add tab with default name if not provided', () => {
      const { result } = renderHook(() => useMultiTabState());

      act(() => {
        result.current.addTab('tab-2');
      });

      const tab = result.current.getTabState('tab-2');
      expect(tab?.name).toBe('Untitled');
    });

    it('should get tab state by ID', () => {
      const { result } = renderHook(() => useMultiTabState());

      act(() => {
        result.current.addTab('tab-3', 'Test Tab');
      });

      const tab = result.current.getTabState('tab-3');
      expect(tab).toBeDefined();
      expect(tab?.name).toBe('Test Tab');
    });

    it('should return undefined for non-existent tab', () => {
      const { result } = renderHook(() => useMultiTabState());

      const tab = result.current.getTabState('non-existent');
      expect(tab).toBeUndefined();
    });

    it('should update tab state', () => {
      const { result } = renderHook(() => useMultiTabState());

      act(() => {
        result.current.addTab('tab-4', 'Original Name');
      });

      act(() => {
        result.current.updateTabState('tab-4', prev => ({
          ...prev,
          name: 'Updated Name',
          modified: true,
        }));
      });

      const tab = result.current.getTabState('tab-4');
      expect(tab?.name).toBe('Updated Name');
      expect(tab?.modified).toBe(true);
    });

    it('should not update if tab does not exist', () => {
      const { result } = renderHook(() => useMultiTabState());

      const initialSize = result.current.tabStates.size;

      act(() => {
        result.current.updateTabState('non-existent', prev => ({
          ...prev,
          name: 'Test',
        }));
      });

      expect(result.current.tabStates.size).toBe(initialSize);
    });

    it('should remove a tab', () => {
      const { result } = renderHook(() => useMultiTabState());

      act(() => {
        result.current.addTab('tab-5', 'To Remove');
      });

      expect(result.current.tabStates.size).toBe(1);

      act(() => {
        result.current.removeTab('tab-5');
      });

      expect(result.current.tabStates.size).toBe(0);
      expect(result.current.getTabState('tab-5')).toBeUndefined();
    });

    it('should clean up localStorage when removing tab', async () => {
      const { result } = renderHook(() => useMultiTabState());

      act(() => {
        result.current.addTab('tab-6', 'Storage Test');
      });

      // Manually add to localStorage to simulate persistence
      localStorage.setItem(
        'ailey-tab-state-tab-6',
        JSON.stringify({ id: 'tab-6' })
      );

      act(() => {
        result.current.removeTab('tab-6');
      });

      await waitFor(() => {
        expect(localStorage.getItem('ailey-tab-state-tab-6')).toBeNull();
      });
    });

    it('should set active tab ID', () => {
      const { result } = renderHook(() => useMultiTabState());

      act(() => {
        result.current.setActiveTabId('tab-7');
      });

      expect(result.current.activeTabId).toBe('tab-7');
    });

    it('should handle multiple tabs', () => {
      const { result } = renderHook(() => useMultiTabState());

      act(() => {
        result.current.addTab('tab-8', 'Tab 8');
        result.current.addTab('tab-9', 'Tab 9');
        result.current.addTab('tab-10', 'Tab 10');
      });

      expect(result.current.tabStates.size).toBe(3);
      expect(result.current.getTabState('tab-8')?.name).toBe('Tab 8');
      expect(result.current.getTabState('tab-9')?.name).toBe('Tab 9');
      expect(result.current.getTabState('tab-10')?.name).toBe('Tab 10');
    });
  });
});
