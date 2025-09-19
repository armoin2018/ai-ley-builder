import type { Edge, Node } from '@xyflow/react';
import { CANVAS_CONFIG } from '../constants';

export interface ArrangeOptions {
  horizontalSpacing?: number;
  verticalSpacing?: number;
  startX?: number;
  startY?: number;
  direction?: 'top-to-bottom' | 'left-to-right';
  enableCollisionDetection?: boolean;
  minSpacing?: number;
  maxIterations?: number;
  connectionSpacing?: number;
  enableConnectionAwareSpacing?: boolean;
}

interface NodeLayer {
  level: number;
  nodes: Node[];
}

interface NodePosition {
  x: number;
  y: number;
}

/**
 * Auto-arrange nodes based on their connections using a layered layout algorithm
 */
export class AutoArrangeEngine {
  private nodes: Node[];
  private edges: Edge[];
  private options: Required<ArrangeOptions>;

  constructor(nodes: Node[], edges: Edge[], options: ArrangeOptions = {}) {
    this.nodes = [...nodes];
    this.edges = [...edges];
    this.options = {
      horizontalSpacing:
        options.horizontalSpacing ?? CANVAS_CONFIG.NODE_WIDTH + 100,
      verticalSpacing:
        options.verticalSpacing ?? CANVAS_CONFIG.NODE_HEIGHT + 60,
      startX: options.startX ?? 100,
      startY: options.startY ?? 100,
      direction: options.direction ?? 'top-to-bottom',
      enableCollisionDetection: options.enableCollisionDetection ?? true,
      minSpacing: options.minSpacing ?? 50,
      maxIterations: options.maxIterations ?? 100,
      connectionSpacing: options.connectionSpacing ?? 50,
      enableConnectionAwareSpacing:
        options.enableConnectionAwareSpacing ?? true,
    };
  }

  /**
   * Arrange nodes and return updated node positions
   */
  public arrange(): Node[] {
    if (this.nodes.length === 0) return this.nodes;

    // Find root nodes (nodes with no incoming connections)
    const rootNodes = this.findRootNodes();

    if (rootNodes.length === 0) {
      // Handle cycles - use the first node as root
      return this.arrangeFallback();
    }

    // Build dependency graph and calculate levels
    const layers = this.calculateLayers(rootNodes);

    // Position nodes layer by layer
    let positionedNodes = this.positionNodesInLayers(layers);

    // Apply collision detection and spacing adjustments if enabled
    if (this.options.enableCollisionDetection) {
      positionedNodes = this.resolveCollisions(positionedNodes);
    }

    return positionedNodes;
  }

  /**
   * Find nodes with no incoming connections (root nodes)
   */
  private findRootNodes(): Node[] {
    const nodeIds = new Set(this.nodes.map(n => n.id));
    const targetIds = new Set(this.edges.map(e => e.target));

    return this.nodes.filter(node => !targetIds.has(node.id));
  }

  /**
   * Calculate layers using breadth-first traversal
   */
  private calculateLayers(rootNodes: Node[]): NodeLayer[] {
    const layers: NodeLayer[] = [];
    const visited = new Set<string>();
    const queue: { node: Node; level: number }[] = [];

    // Initialize with root nodes
    rootNodes.forEach(node => {
      queue.push({ node, level: 0 });
    });

    while (queue.length > 0) {
      const { node, level } = queue.shift()!;

      if (visited.has(node.id)) continue;
      visited.add(node.id);

      // Ensure layer exists
      while (layers.length <= level) {
        layers.push({ level: layers.length, nodes: [] });
      }

      layers[level].nodes.push(node);

      // Add connected nodes to next layer
      const outgoingEdges = this.edges.filter(e => e.source === node.id);
      outgoingEdges.forEach(edge => {
        const targetNode = this.nodes.find(n => n.id === edge.target);
        if (targetNode && !visited.has(targetNode.id)) {
          queue.push({ node: targetNode, level: level + 1 });
        }
      });
    }

    // Handle any remaining unvisited nodes (isolated nodes)
    const unvisitedNodes = this.nodes.filter(n => !visited.has(n.id));
    if (unvisitedNodes.length > 0) {
      layers.push({ level: layers.length, nodes: unvisitedNodes });
    }

    return layers;
  }

  /**
   * Position nodes within their calculated layers
   */
  private positionNodesInLayers(layers: NodeLayer[]): Node[] {
    const positionedNodes = [...this.nodes];
    const nodePositions = new Map<string, NodePosition>();

    layers.forEach((layer, layerIndex) => {
      // Sort nodes in layer to minimize edge crossings
      const sortedNodes = this.sortNodesInLayer(
        layer.nodes,
        layerIndex > 0 ? layers[layerIndex - 1] : null
      );

      // Calculate positions for nodes in this layer
      sortedNodes.forEach((node, nodeIndex) => {
        const position = this.calculateNodePosition(
          layerIndex,
          nodeIndex,
          sortedNodes.length
        );
        nodePositions.set(node.id, position);
      });
    });

    // Apply positions to nodes
    positionedNodes.forEach(node => {
      const position = nodePositions.get(node.id);
      if (position) {
        node.position = position;
      }
    });

    return positionedNodes;
  }

  /**
   * Sort nodes within a layer to minimize edge crossings
   */
  private sortNodesInLayer(
    nodes: Node[],
    previousLayer: NodeLayer | null
  ): Node[] {
    if (!previousLayer || nodes.length <= 1) {
      return [...nodes];
    }

    // Calculate average position of parent nodes for each node in current layer
    const nodeParentPositions = new Map<string, number>();

    nodes.forEach(node => {
      const parentEdges = this.edges.filter(e => e.target === node.id);
      const parentNodes = parentEdges
        .map(e => previousLayer.nodes.find(n => n.id === e.source))
        .filter(Boolean) as Node[];

      if (parentNodes.length > 0) {
        const avgPosition =
          parentNodes.reduce((sum, parent, index) => {
            const parentIndex = previousLayer.nodes.findIndex(
              n => n.id === parent.id
            );
            return sum + parentIndex;
          }, 0) / parentNodes.length;
        nodeParentPositions.set(node.id, avgPosition);
      } else {
        // No parents - place at end
        nodeParentPositions.set(node.id, Infinity);
      }
    });

    // Sort by average parent position
    return nodes.sort((a, b) => {
      const posA = nodeParentPositions.get(a.id) ?? Infinity;
      const posB = nodeParentPositions.get(b.id) ?? Infinity;
      return posA - posB;
    });
  }

  /**
   * Calculate the position for a specific node
   */
  private calculateNodePosition(
    layerIndex: number,
    nodeIndex: number,
    totalNodesInLayer: number
  ): NodePosition {
    if (this.options.direction === 'left-to-right') {
      const baseHorizontalSpacing = this.options.enableConnectionAwareSpacing
        ? this.options.horizontalSpacing + this.options.connectionSpacing
        : this.options.horizontalSpacing;

      return {
        x: this.options.startX + layerIndex * baseHorizontalSpacing,
        y:
          this.options.startY +
          this.calculateVerticalOffset(nodeIndex, totalNodesInLayer),
      };
    } else {
      // top-to-bottom
      const baseVerticalSpacing = this.options.enableConnectionAwareSpacing
        ? this.options.verticalSpacing + this.options.connectionSpacing
        : this.options.verticalSpacing;

      return {
        x:
          this.options.startX +
          this.calculateHorizontalOffset(nodeIndex, totalNodesInLayer),
        y: this.options.startY + layerIndex * baseVerticalSpacing,
      };
    }
  }

  /**
   * Calculate horizontal offset for centering nodes in a layer
   */
  private calculateHorizontalOffset(
    nodeIndex: number,
    totalNodes: number
  ): number {
    if (totalNodes === 1) return 0;

    const totalWidth = (totalNodes - 1) * this.options.horizontalSpacing;
    const startOffset = -totalWidth / 2;
    return startOffset + nodeIndex * this.options.horizontalSpacing;
  }

  /**
   * Calculate vertical offset for centering nodes in a layer
   */
  private calculateVerticalOffset(
    nodeIndex: number,
    totalNodes: number
  ): number {
    if (totalNodes === 1) return 0;

    const totalHeight = (totalNodes - 1) * this.options.verticalSpacing;
    const startOffset = -totalHeight / 2;
    return startOffset + nodeIndex * this.options.verticalSpacing;
  }

  /**
   * Fallback arrangement for cycles or complex graphs
   */
  private arrangeFallback(): Node[] {
    const positionedNodes = [...this.nodes];

    // Simple grid layout as fallback
    const cols = Math.ceil(Math.sqrt(this.nodes.length));

    positionedNodes.forEach((node, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      node.position = {
        x: this.options.startX + col * this.options.horizontalSpacing,
        y: this.options.startY + row * this.options.verticalSpacing,
      };
    });

    return positionedNodes;
  }

  /**
   * Resolve collisions between nodes using force-based adjustment
   */
  private resolveCollisions(nodes: Node[]): Node[] {
    const adjustedNodes = [...nodes];
    let hasCollisions = true;
    let iterations = 0;

    while (hasCollisions && iterations < this.options.maxIterations) {
      hasCollisions = false;

      for (let i = 0; i < adjustedNodes.length; i++) {
        for (let j = i + 1; j < adjustedNodes.length; j++) {
          const nodeA = adjustedNodes[i];
          const nodeB = adjustedNodes[j];

          if (this.nodesCollide(nodeA, nodeB)) {
            hasCollisions = true;
            this.separateNodes(nodeA, nodeB);
          }
        }
      }

      iterations++;
    }

    return adjustedNodes;
  }

  /**
   * Check if two nodes are colliding (overlapping or too close)
   */
  private nodesCollide(nodeA: Node, nodeB: Node): boolean {
    const aLeft = nodeA.position.x;
    const aRight = nodeA.position.x + CANVAS_CONFIG.NODE_WIDTH;
    const aTop = nodeA.position.y;
    const aBottom = nodeA.position.y + CANVAS_CONFIG.NODE_HEIGHT;

    const bLeft = nodeB.position.x;
    const bRight = nodeB.position.x + CANVAS_CONFIG.NODE_WIDTH;
    const bTop = nodeB.position.y;
    const bBottom = nodeB.position.y + CANVAS_CONFIG.NODE_HEIGHT;

    // Check for overlap with minimum spacing
    const minSpacing = this.options.minSpacing;

    return !(
      aRight + minSpacing < bLeft ||
      bRight + minSpacing < aLeft ||
      aBottom + minSpacing < bTop ||
      bBottom + minSpacing < aTop
    );
  }

  /**
   * Separate two colliding nodes
   */
  private separateNodes(nodeA: Node, nodeB: Node): void {
    const centerA = {
      x: nodeA.position.x + CANVAS_CONFIG.NODE_WIDTH / 2,
      y: nodeA.position.y + CANVAS_CONFIG.NODE_HEIGHT / 2,
    };

    const centerB = {
      x: nodeB.position.x + CANVAS_CONFIG.NODE_WIDTH / 2,
      y: nodeB.position.y + CANVAS_CONFIG.NODE_HEIGHT / 2,
    };

    // Calculate separation vector
    const dx = centerB.x - centerA.x;
    const dy = centerB.y - centerA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      // Nodes are exactly on top of each other, separate them arbitrarily
      nodeB.position.x += this.options.minSpacing;
      return;
    }

    // Normalize the separation vector
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;

    // Calculate minimum separation distance
    const minSeparation = this.options.minSpacing + CANVAS_CONFIG.NODE_WIDTH;

    // Calculate how much to move each node
    const moveDistance = (minSeparation - distance) / 2;

    // Move nodes apart
    nodeA.position.x -= normalizedDx * moveDistance;
    nodeA.position.y -= normalizedDy * moveDistance;
    nodeB.position.x += normalizedDx * moveDistance;
    nodeB.position.y += normalizedDy * moveDistance;
  }
}

/**
 * Convenience function to auto-arrange nodes
 */
export function autoArrangeNodes(
  nodes: Node[],
  edges: Edge[],
  options?: ArrangeOptions
): Node[] {
  const engine = new AutoArrangeEngine(nodes, edges, options);
  return engine.arrange();
}

/**
 * Auto-arrange with animation support - returns the new nodes with smooth transition
 */
export function autoArrangeNodesWithAnimation(
  nodes: Node[],
  edges: Edge[],
  options?: ArrangeOptions
): Node[] {
  const arrangedNodes = autoArrangeNodes(nodes, edges, options);

  // Add transition class for smooth animation
  return arrangedNodes.map(node => ({
    ...node,
    style: {
      ...node.style,
      transition: 'all 0.3s ease-in-out',
    },
  }));
}
