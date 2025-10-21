/**
 * Integration Test Utilities
 * 
 * Provides comprehensive test utilities for integration testing including:
 * - ReactFlowProvider wrapper for React Flow integration
 * - WorkflowTabsProvider wrapper for tab state management
 * - Realistic mocks for PlantUML conversion
 * - Test fixtures for common scenarios
 * - Helper functions for integration tests
 */

import type { RenderOptions } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { Edge, Node } from '@xyflow/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { ReactElement } from 'react';
import { WorkflowTabsProvider } from '../features/tabs/components/WorkflowTabsProvider';

// ============================================================================
// Test Providers
// ============================================================================

/**
 * AllTheProviders Component
 * Wraps test components with all necessary providers for integration testing
 */
function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReactFlowProvider>
      <WorkflowTabsProvider>
        {children}
      </WorkflowTabsProvider>
    </ReactFlowProvider>
  );
}

/**
 * Custom render function for integration tests
 * Automatically wraps components with all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// ============================================================================
// PlantUML Test Fixtures
// ============================================================================

/**
 * Sample PlantUML workflow with multiple nodes and edges
 */
export const SAMPLE_PLANTUML = `@startuml
!theme plain
skinparam BackgroundColor transparent

start
:Initialize System;
if (Is Configured?) then (yes)
  :Load Settings;
else (no)
  :Use Defaults;
endif
:Process Data;
:Generate Output;
stop

@enduml`;

/**
 * Sample workflow nodes (result of PlantUML parsing)
 */
export const SAMPLE_NODES: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 0 },
    data: { label: 'Start' },
  },
  {
    id: 'process-1',
    type: 'process',
    position: { x: 200, y: 100 },
    data: { label: 'Initialize System' },
  },
  {
    id: 'decision-1',
    type: 'decision',
    position: { x: 175, y: 200 },
    data: { label: 'Is Configured?' },
  },
  {
    id: 'process-2',
    type: 'process',
    position: { x: 100, y: 300 },
    data: { label: 'Load Settings' },
  },
  {
    id: 'process-3',
    type: 'process',
    position: { x: 300, y: 300 },
    data: { label: 'Use Defaults' },
  },
  {
    id: 'process-4',
    type: 'process',
    position: { x: 200, y: 400 },
    data: { label: 'Process Data' },
  },
  {
    id: 'process-5',
    type: 'process',
    position: { x: 200, y: 500 },
    data: { label: 'Generate Output' },
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 250, y: 600 },
    data: { label: 'End' },
  },
];

/**
 * Sample workflow edges (result of PlantUML parsing)
 */
export const SAMPLE_EDGES: Edge[] = [
  { id: 'e1', source: 'start-1', target: 'process-1' },
  { id: 'e2', source: 'process-1', target: 'decision-1' },
  { id: 'e3', source: 'decision-1', target: 'process-2', label: 'yes' },
  { id: 'e4', source: 'decision-1', target: 'process-3', label: 'no' },
  { id: 'e5', source: 'process-2', target: 'process-4' },
  { id: 'e6', source: 'process-3', target: 'process-4' },
  { id: 'e7', source: 'process-4', target: 'process-5' },
  { id: 'e8', source: 'process-5', target: 'end-1' },
];

/**
 * Simple PlantUML workflow (minimal case)
 */
export const SIMPLE_PLANTUML = `@startuml
start
:Task;
stop
@enduml`;

export const SIMPLE_NODES: Node[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 250, y: 0 },
    data: { label: 'Start' },
  },
  {
    id: 'process-1',
    type: 'process',
    position: { x: 200, y: 100 },
    data: { label: 'Task' },
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 250, y: 200 },
    data: { label: 'End' },
  },
];

export const SIMPLE_EDGES: Edge[] = [
  { id: 'e1', source: 'start-1', target: 'process-1' },
  { id: 'e2', source: 'process-1', target: 'end-1' },
];

/**
 * Invalid PlantUML (for error handling tests)
 */
export const INVALID_PLANTUML = `@startuml
This is not valid PlantUML syntax
missing proper structure
@enduml`;

// ============================================================================
// Mock Helpers
// ============================================================================

/**
 * Creates a realistic flowToPlantUML mock that generates PlantUML from nodes/edges
 */
export function createFlowToPlantUMLMock() {
  return vi.fn((nodes: Node[], edges: Edge[]): string => {
    if (!nodes || nodes.length === 0) {
      return '@startuml\n@enduml';
    }

    let plantuml = '@startuml\n!theme plain\nskinparam BackgroundColor transparent\n\n';

    // Add start node
    const startNode = nodes.find(n => n.type === 'start');
    if (startNode) {
      plantuml += 'start\n';
    }

    // Add process nodes
    nodes
      .filter(n => n.type === 'process')
      .forEach(node => {
        plantuml += `:${node.data.label};\n`;
      });

    // Add decision nodes (simplified)
    nodes
      .filter(n => n.type === 'decision')
      .forEach(node => {
        const outgoingEdges = edges.filter(e => e.source === node.id);
        if (outgoingEdges.length >= 2) {
          plantuml += `if (${node.data.label}) then (yes)\n`;
          plantuml += '  :Branch 1;\n';
          plantuml += 'else (no)\n';
          plantuml += '  :Branch 2;\n';
          plantuml += 'endif\n';
        }
      });

    // Add end node
    const endNode = nodes.find(n => n.type === 'end');
    if (endNode) {
      plantuml += 'stop\n';
    }

    plantuml += '\n@enduml';
    return plantuml;
  });
}

/**
 * Creates a realistic parsePlantUMLToFlow mock that parses PlantUML to nodes/edges
 */
export function createParsePlantUMLToFlowMock() {
  return vi.fn((plantuml: string): { nodes: Node[]; edges: Edge[] } => {
    // Handle invalid PlantUML
    if (!plantuml.includes('@startuml') || !plantuml.includes('@enduml')) {
      throw new Error('Invalid PlantUML: Missing @startuml or @enduml tags');
    }

    if (plantuml === INVALID_PLANTUML) {
      throw new Error('Invalid PlantUML: Unable to parse syntax');
    }

    // Return sample data based on PlantUML content
    if (plantuml === SAMPLE_PLANTUML) {
      return { nodes: SAMPLE_NODES, edges: SAMPLE_EDGES };
    }

    if (plantuml === SIMPLE_PLANTUML || plantuml.includes(':Task;')) {
      return { nodes: SIMPLE_NODES, edges: SIMPLE_EDGES };
    }

    // Default: return simple workflow
    return { nodes: SIMPLE_NODES, edges: SIMPLE_EDGES };
  });
}

/**
 * Setup all PlantUML mocks for integration tests
 */
export function setupPlantUMLMocks() {
  const flowToPlantUML = createFlowToPlantUMLMock();
  const parsePlantUMLToFlow = createParsePlantUMLToFlowMock();

  // Mock the plantuml-parser module
  vi.mock('../../../utils/plantuml-parser', () => ({
    flowToPlantUML,
    parsePlantUMLToFlow,
  }));

  return { flowToPlantUML, parsePlantUMLToFlow };
}

// ============================================================================
// Test Data Helpers
// ============================================================================

/**
 * Creates a realistic workflow object for testing
 */
export function createTestWorkflow(overrides?: {
  name?: string;
  nodes?: Node[];
  edges?: Edge[];
  viewport?: { x: number; y: number; zoom: number };
}) {
  return {
    name: overrides?.name || 'Test Workflow',
    description: 'A test workflow',
    nodes: overrides?.nodes || SIMPLE_NODES,
    edges: overrides?.edges || SIMPLE_EDGES,
    canvas: {
      nodes: overrides?.nodes || SIMPLE_NODES,
      edges: overrides?.edges || SIMPLE_EDGES,
      viewport: overrides?.viewport || { x: 0, y: 0, zoom: 1 },
    },
  };
}

/**
 * Creates a realistic tab object for testing
 */
export function createTestTab(overrides?: {
  id?: string;
  name?: string;
  path?: string;
  workflow?: any;
  modified?: boolean;
  saved?: boolean;
}) {
  return {
    id: overrides?.id || `tab_${Date.now()}`,
    name: overrides?.name || 'Test Tab',
    path: overrides?.path,
    workflow: overrides?.workflow || createTestWorkflow(),
    modified: overrides?.modified ?? false,
    saved: overrides?.saved ?? false,
    isNew: true,
    createdAt: new Date(),
  };
}

// ============================================================================
// localStorage Helpers
// ============================================================================

/**
 * Setup localStorage mock for integration tests
 */
export function setupLocalStorageMock() {
  const storage = new Map<string, string>();

  const localStorageMock = {
    getItem: vi.fn((key: string) => storage.get(key) || null),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      storage.delete(key);
    }),
    clear: vi.fn(() => {
      storage.clear();
    }),
    key: vi.fn((index: number) => {
      const keys = Array.from(storage.keys());
      return keys[index] || null;
    }),
    get length() {
      return storage.size;
    },
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return { storage, localStorageMock };
}

/**
 * Clear localStorage between tests
 */
export function clearLocalStorage() {
  if (window.localStorage) {
    window.localStorage.clear();
  }
}

// ============================================================================
// Wait Helpers
// ============================================================================

/**
 * Wait for a specific condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 1000,
  interval = 50
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('Timeout waiting for condition');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

/**
 * Wait for async updates to complete
 */
export async function waitForAsync() {
  await new Promise(resolve => setTimeout(resolve, 0));
}

// ============================================================================
// Re-export common testing utilities
// ============================================================================

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

