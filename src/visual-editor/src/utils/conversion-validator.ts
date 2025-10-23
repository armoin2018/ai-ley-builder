import type { Edge, Node } from '@xyflow/react';

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'node' | 'edge' | 'metadata';
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  summary: {
    nodesMatched: number;
    nodesTotal: number;
    edgesMatched: number;
    edgesTotal: number;
    positionDrift: number; // Average position drift in pixels
    propertiesMismatch: number;
  };
}

/**
 * Deep comparison of two objects, ignoring specified keys
 */
function deepEqual(
  obj1: unknown,
  obj2: unknown,
  ignoreKeys: string[] = []
): boolean {
  if (obj1 === obj2) return true;

  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) {
    return obj1 === obj2;
  }

  const keys1 = Object.keys(obj1 as Record<string, unknown>).filter(
    k => !ignoreKeys.includes(k)
  );
  const keys2 = Object.keys(obj2 as Record<string, unknown>).filter(
    k => !ignoreKeys.includes(k)
  );

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (
      !deepEqual(
        (obj1 as Record<string, unknown>)[key],
        (obj2 as Record<string, unknown>)[key],
        ignoreKeys
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate Euclidean distance between two positions
 */
function calculateDistance(
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): number {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
}

/**
 * Validate that a round-trip conversion preserves all data
 * Compares original nodes/edges with converted nodes/edges
 */
export function validateConversion(
  originalNodes: Node[],
  originalEdges: Edge[],
  convertedNodes: Node[],
  convertedEdges: Edge[]
): ValidationResult {
  const issues: ValidationIssue[] = [];
  let totalPositionDrift = 0;
  let propertiesMismatchCount = 0;

  // Check node counts
  if (originalNodes.length !== convertedNodes.length) {
    issues.push({
      type: 'error',
      category: 'node',
      message: `Node count mismatch: ${originalNodes.length} → ${convertedNodes.length}`,
      details: {
        original: originalNodes.length,
        converted: convertedNodes.length,
        missing: originalNodes.length - convertedNodes.length,
      },
    });
  }

  // Check edge counts
  if (originalEdges.length !== convertedEdges.length) {
    issues.push({
      type: 'error',
      category: 'edge',
      message: `Edge count mismatch: ${originalEdges.length} → ${convertedEdges.length}`,
      details: {
        original: originalEdges.length,
        converted: convertedEdges.length,
        missing: originalEdges.length - convertedEdges.length,
      },
    });
  }

  // Validate each node
  const convertedNodesMap = new Map(convertedNodes.map(n => [n.id, n]));
  let nodesMatched = 0;

  for (const originalNode of originalNodes) {
    const convertedNode = convertedNodesMap.get(originalNode.id);

    if (!convertedNode) {
      issues.push({
        type: 'error',
        category: 'node',
        message: `Node lost during conversion: ${originalNode.id}`,
        details: {
          nodeId: originalNode.id,
          nodeType: originalNode.type,
          label: originalNode.data?.label,
        },
      });
      continue;
    }

    let nodeValid = true;

    // Check node type
    if (originalNode.type !== convertedNode.type) {
      issues.push({
        type: 'error',
        category: 'node',
        message: `Node type changed: ${originalNode.type} → ${convertedNode.type}`,
        details: {
          nodeId: originalNode.id,
          original: originalNode.type,
          converted: convertedNode.type,
        },
      });
      nodeValid = false;
    }

    // Check position (allow small drift due to rounding)
    const positionTolerance = 5; // pixels
    const drift = calculateDistance(
      originalNode.position,
      convertedNode.position
    );
    totalPositionDrift += drift;

    if (drift > positionTolerance) {
      issues.push({
        type: 'warning',
        category: 'node',
        message: `Position drift detected for ${originalNode.id}`,
        details: {
          nodeId: originalNode.id,
          drift: Math.round(drift),
          original: originalNode.position,
          converted: convertedNode.position,
        },
      });
      nodeValid = false;
    }

    // Check data/properties (deep comparison)
    // Ignore computed/transient properties
    const ignoreKeys = ['selected', 'dragging'];

    if (!deepEqual(originalNode.data, convertedNode.data, ignoreKeys)) {
      issues.push({
        type: 'error',
        category: 'node',
        message: `Node data mismatch for ${originalNode.id}`,
        details: {
          nodeId: originalNode.id,
          original: originalNode.data,
          converted: convertedNode.data,
        },
      });
      propertiesMismatchCount++;
      nodeValid = false;
    }

    // Check dimensions
    if (
      originalNode.width !== convertedNode.width ||
      originalNode.height !== convertedNode.height
    ) {
      issues.push({
        type: 'info',
        category: 'node',
        message: `Node dimensions changed for ${originalNode.id}`,
        details: {
          nodeId: originalNode.id,
          originalWidth: originalNode.width,
          originalHeight: originalNode.height,
          convertedWidth: convertedNode.width,
          convertedHeight: convertedNode.height,
        },
      });
    }

    if (nodeValid) {
      nodesMatched++;
    }
  }

  // Validate each edge
  const convertedEdgesMap = new Map(convertedEdges.map(e => [e.id, e]));
  let edgesMatched = 0;

  for (const originalEdge of originalEdges) {
    const convertedEdge = convertedEdgesMap.get(originalEdge.id);

    if (!convertedEdge) {
      // Try to find by source/target (edge ID might be regenerated)
      const matchByConnection = convertedEdges.find(
        e =>
          e.source === originalEdge.source && e.target === originalEdge.target
      );

      if (!matchByConnection) {
        issues.push({
          type: 'error',
          category: 'edge',
          message: `Edge lost during conversion: ${originalEdge.id}`,
          details: {
            edgeId: originalEdge.id,
            source: originalEdge.source,
            target: originalEdge.target,
          },
        });
        continue;
      }
    }

    const edgeToCompare =
      convertedEdge ||
      convertedEdges.find(
        e =>
          e.source === originalEdge.source && e.target === originalEdge.target
      );

    if (!edgeToCompare) continue;

    let edgeValid = true;

    // Check source/target
    if (
      originalEdge.source !== edgeToCompare.source ||
      originalEdge.target !== edgeToCompare.target
    ) {
      issues.push({
        type: 'error',
        category: 'edge',
        message: `Edge connection changed: ${originalEdge.id}`,
        details: {
          edgeId: originalEdge.id,
          original: `${originalEdge.source} → ${originalEdge.target}`,
          converted: `${edgeToCompare.source} → ${edgeToCompare.target}`,
        },
      });
      edgeValid = false;
    }

    // Check label
    if (originalEdge.label !== edgeToCompare.label) {
      issues.push({
        type: 'warning',
        category: 'edge',
        message: `Edge label changed: ${originalEdge.id}`,
        details: {
          edgeId: originalEdge.id,
          original: originalEdge.label,
          converted: edgeToCompare.label,
        },
      });
    }

    // Check edge data
    if (!deepEqual(originalEdge.data, edgeToCompare.data)) {
      issues.push({
        type: 'warning',
        category: 'edge',
        message: `Edge data mismatch for ${originalEdge.id}`,
        details: {
          edgeId: originalEdge.id,
          original: originalEdge.data,
          converted: edgeToCompare.data,
        },
      });
    }

    if (edgeValid) {
      edgesMatched++;
    }
  }

  // Check for extra nodes/edges in converted output
  for (const convertedNode of convertedNodes) {
    if (!originalNodes.find(n => n.id === convertedNode.id)) {
      issues.push({
        type: 'warning',
        category: 'node',
        message: `Extra node in converted output: ${convertedNode.id}`,
        details: {
          nodeId: convertedNode.id,
          nodeType: convertedNode.type,
        },
      });
    }
  }

  for (const convertedEdge of convertedEdges) {
    if (!originalEdges.find(e => e.id === convertedEdge.id)) {
      // Check if connection exists with different ID
      const matchByConnection = originalEdges.find(
        e =>
          e.source === convertedEdge.source && e.target === convertedEdge.target
      );

      if (!matchByConnection) {
        issues.push({
          type: 'warning',
          category: 'edge',
          message: `Extra edge in converted output: ${convertedEdge.id}`,
          details: {
            edgeId: convertedEdge.id,
            source: convertedEdge.source,
            target: convertedEdge.target,
          },
        });
      }
    }
  }

  const averagePositionDrift =
    originalNodes.length > 0 ? totalPositionDrift / originalNodes.length : 0;

  const valid =
    issues.filter(i => i.type === 'error').length === 0 &&
    nodesMatched === originalNodes.length &&
    edgesMatched === originalEdges.length;

  return {
    valid,
    issues,
    summary: {
      nodesMatched,
      nodesTotal: originalNodes.length,
      edgesMatched,
      edgesTotal: originalEdges.length,
      positionDrift: Math.round(averagePositionDrift * 100) / 100,
      propertiesMismatch: propertiesMismatchCount,
    },
  };
}

/**
 * Format validation result as a human-readable message
 */
export function formatValidationResult(result: ValidationResult): string {
  const { valid, issues, summary } = result;

  if (valid) {
    return `✓ Conversion validated successfully
- Nodes: ${summary.nodesMatched}/${summary.nodesTotal} matched
- Edges: ${summary.edgesMatched}/${summary.edgesTotal} matched
- Avg position drift: ${summary.positionDrift}px`;
  }

  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  let message = `⚠ Conversion validation failed
- Nodes: ${summary.nodesMatched}/${summary.nodesTotal} matched
- Edges: ${summary.edgesMatched}/${summary.edgesTotal} matched
- ${errors.length} error(s), ${warnings.length} warning(s)`;

  if (errors.length > 0) {
    message += '\n\nErrors:';
    errors.slice(0, 3).forEach(e => {
      message += `\n- ${e.message}`;
    });
    if (errors.length > 3) {
      message += `\n- ... and ${errors.length - 3} more`;
    }
  }

  return message;
}
