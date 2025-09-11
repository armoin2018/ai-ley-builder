import type { Edge, Node } from '@xyflow/react';
import { NodeType } from '../../../types/nodes';

// Workflow data structure for serialization
export interface SerializedWorkflow {
  id: string;
  name: string;
  description?: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  metadata: {
    nodeCount: number;
    edgeCount: number;
    executionOrder?: string[];
  };
}

export interface SerializedNode {
  id: string;
  type: NodeType;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    description?: string;
    properties: Record<string, any>;
  };
  selected?: boolean;
  dragging?: boolean;
}

export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  markerEnd?: {
    type: string;
    color: string;
  };
}

// Validation schemas for imported workflows
const SUPPORTED_VERSIONS = ['1.0.0'];
const CURRENT_VERSION = '1.0.0';

/**
 * Serialize a workflow from React Flow nodes and edges
 */
export function serializeWorkflow(
  nodes: Node[],
  edges: Edge[],
  viewport: { x: number; y: number; zoom: number },
  metadata: {
    id?: string;
    name?: string;
    description?: string;
  } = {}
): SerializedWorkflow {
  // Clean and serialize nodes
  const serializedNodes: SerializedNode[] = nodes.map(node => ({
    id: node.id,
    type: node.type as NodeType,
    position: node.position,
    data: {
      label: (node.data.label as string) || `${node.type} Node`,
      description: node.data.description as string,
      properties: (node.data.properties as Record<string, any>) || {},
    },
    selected: node.selected,
    dragging: node.dragging,
  }));

  // Clean and serialize edges
  const serializedEdges: SerializedEdge[] = edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type,
    animated: edge.animated,
    style: edge.style as Record<string, any>,
    markerEnd: edge.markerEnd
      ? {
          type: (edge.markerEnd as any).type || 'arrowclosed',
          color: (edge.markerEnd as any).color || '#3b82f6',
        }
      : undefined,
  }));

  // Generate execution order based on node connections
  const executionOrder = generateExecutionOrder(
    serializedNodes,
    serializedEdges
  );

  const now = new Date().toISOString();

  return {
    id: metadata.id || `workflow_${Date.now()}`,
    name: metadata.name || 'Untitled Workflow',
    description: metadata.description,
    version: CURRENT_VERSION,
    createdAt: now,
    updatedAt: now,
    nodes: serializedNodes,
    edges: serializedEdges,
    viewport,
    metadata: {
      nodeCount: serializedNodes.length,
      edgeCount: serializedEdges.length,
      executionOrder,
    },
  };
}

/**
 * Deserialize a workflow to React Flow nodes and edges
 */
export function deserializeWorkflow(workflow: SerializedWorkflow): {
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
  metadata: SerializedWorkflow['metadata'];
} {
  // Validate workflow version
  if (!SUPPORTED_VERSIONS.includes(workflow.version)) {
    throw new Error(
      `Unsupported workflow version: ${workflow.version}. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`
    );
  }

  // Convert serialized nodes back to React Flow nodes
  const nodes: Node[] = workflow.nodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      label: node.data.label,
      description: node.data.description,
      properties: node.data.properties,
    },
    selected: false, // Reset selection state
    dragging: false, // Reset dragging state
  }));

  // Convert serialized edges back to React Flow edges
  const edges: Edge[] = workflow.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: edge.type || 'smoothstep',
    animated: edge.animated || false,
    style: edge.style,
    markerEnd: edge.markerEnd
      ? {
          type: edge.markerEnd.type as any,
          color: edge.markerEnd.color,
        }
      : undefined,
  }));

  return {
    nodes,
    edges,
    viewport: workflow.viewport,
    metadata: workflow.metadata,
  };
}

/**
 * Generate execution order for nodes based on their connections
 */
function generateExecutionOrder(
  nodes: SerializedNode[],
  edges: SerializedEdge[]
): string[] {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const incomingEdges = new Map<string, string[]>();
  const outgoingEdges = new Map<string, string[]>();
  const visited = new Set<string>();
  const executionOrder: string[] = [];

  // Build adjacency lists
  edges.forEach(edge => {
    if (!incomingEdges.has(edge.target)) {
      incomingEdges.set(edge.target, []);
    }
    if (!outgoingEdges.has(edge.source)) {
      outgoingEdges.set(edge.source, []);
    }

    incomingEdges.get(edge.target)!.push(edge.source);
    outgoingEdges.get(edge.source)!.push(edge.target);
  });

  // Find nodes with no incoming edges (start nodes)
  const startNodes = nodes.filter(node => !incomingEdges.has(node.id));

  // Topological sort using DFS
  function visit(nodeId: string) {
    if (visited.has(nodeId)) return;

    visited.add(nodeId);

    // Visit all nodes that this node depends on first
    const incoming = incomingEdges.get(nodeId) || [];
    incoming.forEach(visit);

    // Add this node to execution order
    if (nodeMap.has(nodeId)) {
      executionOrder.push(nodeId);
    }
  }

  // Start with nodes that have no dependencies
  startNodes.forEach(node => visit(node.id));

  // Visit any remaining nodes (in case of cycles or disconnected components)
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      visit(node.id);
    }
  });

  return executionOrder;
}

/**
 * Validate a serialized workflow
 */
export function validateWorkflow(
  workflow: any
): workflow is SerializedWorkflow {
  if (!workflow || typeof workflow !== 'object') {
    return false;
  }

  // Check required fields
  const requiredFields = [
    'id',
    'name',
    'version',
    'createdAt',
    'updatedAt',
    'nodes',
    'edges',
    'viewport',
    'metadata',
  ];
  for (const field of requiredFields) {
    if (!(field in workflow)) {
      return false;
    }
  }

  // Check version
  if (!SUPPORTED_VERSIONS.includes(workflow.version)) {
    return false;
  }

  // Check nodes array
  if (!Array.isArray(workflow.nodes)) {
    return false;
  }

  // Check edges array
  if (!Array.isArray(workflow.edges)) {
    return false;
  }

  // Validate each node
  for (const node of workflow.nodes) {
    if (!node.id || !node.type || !node.position || !node.data) {
      return false;
    }
    if (!Object.values(NodeType).includes(node.type)) {
      return false;
    }
  }

  // Validate each edge
  for (const edge of workflow.edges) {
    if (!edge.id || !edge.source || !edge.target) {
      return false;
    }
  }

  return true;
}

/**
 * Export workflow to JSON string
 */
export function exportWorkflowToJSON(workflow: SerializedWorkflow): string {
  return JSON.stringify(workflow, null, 2);
}

/**
 * Import workflow from JSON string
 */
export function importWorkflowFromJSON(json: string): SerializedWorkflow {
  try {
    const parsed = JSON.parse(json);

    if (!validateWorkflow(parsed)) {
      throw new Error('Invalid workflow format');
    }

    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    throw error;
  }
}

/**
 * Create a minimal workflow template
 */
export function createEmptyWorkflow(
  name: string = 'New Workflow'
): SerializedWorkflow {
  const now = new Date().toISOString();

  return {
    id: `workflow_${Date.now()}`,
    name,
    version: CURRENT_VERSION,
    createdAt: now,
    updatedAt: now,
    nodes: [],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
    metadata: {
      nodeCount: 0,
      edgeCount: 0,
      executionOrder: [],
    },
  };
}
