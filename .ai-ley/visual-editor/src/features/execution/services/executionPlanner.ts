import type { ExecutionPlan } from '../types/execution';

export class ExecutionPlanner {
  /**
   * Creates an execution plan for a workflow by analyzing dependencies
   */
  static createExecutionPlan(nodes: any[], edges: any[]): ExecutionPlan {
    const nodeIds = new Set(nodes.map(n => n.id));
    const dependencies: Record<string, string[]> = {};
    const reverseDependencies: Record<string, string[]> = {};

    // Initialize dependency maps
    nodes.forEach(node => {
      dependencies[node.id] = [];
      reverseDependencies[node.id] = [];
    });

    // Build dependency graph from edges
    edges.forEach(edge => {
      if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
        dependencies[edge.target].push(edge.source);
        reverseDependencies[edge.source].push(edge.target);
      }
    });

    // Find entry points (nodes with no dependencies)
    const entryPoints = nodes
      .filter(node => dependencies[node.id].length === 0)
      .map(node => node.id);

    // Find exit points (nodes with no dependents)
    const exitPoints = nodes
      .filter(node => reverseDependencies[node.id].length === 0)
      .map(node => node.id);

    // Generate topological sort for execution order
    const executionOrder = this.topologicalSort(nodes, dependencies);

    // Identify parallel execution groups
    const parallelGroups = this.identifyParallelGroups(
      executionOrder,
      dependencies
    );

    return {
      executionOrder,
      dependencies,
      parallelGroups,
      entryPoints,
      exitPoints,
    };
  }

  /**
   * Performs topological sort to determine execution order
   */
  private static topologicalSort(
    nodes: any[],
    dependencies: Record<string, string[]>
  ): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const result: string[] = [];

    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        throw new Error(
          `Circular dependency detected involving node: ${nodeId}`
        );
      }
      if (visited.has(nodeId)) {
        return;
      }

      temp.add(nodeId);

      // Visit all dependencies first
      dependencies[nodeId].forEach(depId => {
        if (dependencies[depId] !== undefined) {
          visit(depId);
        }
      });

      temp.delete(nodeId);
      visited.add(nodeId);
      result.push(nodeId);
    };

    // Visit all nodes
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    });

    return result;
  }

  /**
   * Identifies groups of nodes that can be executed in parallel
   */
  private static identifyParallelGroups(
    executionOrder: string[],
    dependencies: Record<string, string[]>
  ): string[][] {
    const groups: string[][] = [];
    const processed = new Set<string>();

    for (const nodeId of executionOrder) {
      if (processed.has(nodeId)) continue;

      const group: string[] = [nodeId];
      processed.add(nodeId);

      // Find other nodes at the same level (same dependency depth)
      const nodeDeps = dependencies[nodeId];

      for (const otherId of executionOrder) {
        if (processed.has(otherId)) continue;

        const otherDeps = dependencies[otherId];

        // Check if nodes can run in parallel (no direct dependency between them)
        const canRunInParallel =
          !nodeDeps.includes(otherId) &&
          !otherDeps.includes(nodeId) &&
          this.haveSimilarDependencyDepth(nodeDeps, otherDeps, processed);

        if (canRunInParallel) {
          group.push(otherId);
          processed.add(otherId);
        }
      }

      groups.push(group);
    }

    return groups;
  }

  /**
   * Checks if two nodes have similar dependency depths
   */
  private static haveSimilarDependencyDepth(
    deps1: string[],
    deps2: string[],
    processed: Set<string>
  ): boolean {
    // Count how many dependencies have already been processed
    const processed1 = deps1.filter(dep => processed.has(dep)).length;
    const processed2 = deps2.filter(dep => processed.has(dep)).length;

    // Allow nodes to be parallel if their processed dependency counts are similar
    return Math.abs(processed1 - processed2) <= 1;
  }

  /**
   * Validates the execution plan for correctness
   */
  static validateExecutionPlan(plan: ExecutionPlan, nodes: any[]): boolean {
    const nodeIds = new Set(nodes.map(n => n.id));

    // Check that all nodes are included in execution order
    const executionSet = new Set(plan.executionOrder);
    if (executionSet.size !== nodeIds.size) {
      return false;
    }

    for (const nodeId of nodeIds) {
      if (!executionSet.has(nodeId)) {
        return false;
      }
    }

    // Validate that dependencies are respected in execution order
    const positionMap = new Map<string, number>();
    plan.executionOrder.forEach((nodeId, index) => {
      positionMap.set(nodeId, index);
    });

    for (const [nodeId, deps] of Object.entries(plan.dependencies)) {
      const nodePosition = positionMap.get(nodeId);
      if (nodePosition === undefined) continue;

      for (const depId of deps) {
        const depPosition = positionMap.get(depId);
        if (depPosition === undefined || depPosition >= nodePosition) {
          console.error(`Dependency violation: ${depId} -> ${nodeId}`);
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Gets the next nodes that can be executed given current completed nodes
   */
  static getExecutableNodes(
    plan: ExecutionPlan,
    completedNodes: Set<string>
  ): string[] {
    const executable: string[] = [];

    for (const nodeId of plan.executionOrder) {
      if (completedNodes.has(nodeId)) continue;

      // Check if all dependencies are completed
      const deps = plan.dependencies[nodeId];
      const allDepsCompleted = deps.every(depId => completedNodes.has(depId));

      if (allDepsCompleted) {
        executable.push(nodeId);
      }
    }

    return executable;
  }
}
