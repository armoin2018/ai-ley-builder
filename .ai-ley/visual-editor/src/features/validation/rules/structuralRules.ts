import type {
  ValidationContext,
  ValidationError,
  ValidationResult,
  ValidationRule,
  ValidationWarning,
} from '../types/validation';
import { getNodeTypeDefinition } from '../config/nodeDefinitions';

export const structuralValidationRules: ValidationRule[] = [
  {
    id: 'no_duplicate_ids',
    name: 'No Duplicate IDs',
    description: 'Ensures all nodes and edges have unique IDs',
    category: 'structure',
    severity: 'error',
    enabled: true,
    validate: (context: ValidationContext): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // Check for duplicate node IDs
      const nodeIds = new Set();
      const duplicateNodeIds = new Set();

      context.nodes.forEach(node => {
        if (nodeIds.has(node.id)) {
          duplicateNodeIds.add(node.id);
        } else {
          nodeIds.add(node.id);
        }
      });

      duplicateNodeIds.forEach(id => {
        errors.push({
          id: `duplicate_node_${id}`,
          type: 'DUPLICATE_ID' as const,
          severity: 'error' as const,
          message: `Duplicate node ID found: ${id}`,
          nodeId: String(id),
          suggestedFix: 'Assign unique IDs to all nodes',
        });
      });

      // Check for duplicate edge IDs
      const edgeIds = new Set();
      const duplicateEdgeIds = new Set();

      context.edges.forEach(edge => {
        if (edgeIds.has(edge.id)) {
          duplicateEdgeIds.add(edge.id);
        } else {
          edgeIds.add(edge.id);
        }
      });

      duplicateEdgeIds.forEach(id => {
        errors.push({
          id: `duplicate_edge_${id}`,
          type: 'DUPLICATE_ID' as const,
          severity: 'error' as const,
          message: `Duplicate edge ID found: ${id}`,
          edgeId: String(id),
          suggestedFix: 'Assign unique IDs to all edges',
        });
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  },

  {
    id: 'valid_node_types',
    name: 'Valid Node Types',
    description: 'Ensures all nodes have supported types',
    category: 'structure',
    severity: 'error',
    enabled: true,
    validate: (context: ValidationContext): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      context.nodes.forEach(node => {
        const definition = getNodeTypeDefinition(node.type);
        if (!definition) {
          errors.push({
            id: `invalid_type_${node.id}`,
            type: 'NODE_TYPE_NOT_SUPPORTED' as const,
            severity: 'error' as const,
            message: `Unsupported node type: ${node.type}`,
            nodeId: node.id,
            suggestedFix: `Change node type to a supported type`,
          });
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  },

  {
    id: 'valid_connections',
    name: 'Valid Connections',
    description: 'Ensures all edges connect to valid nodes and handles',
    category: 'structure',
    severity: 'error',
    enabled: true,
    validate: (context: ValidationContext): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      const nodeIds = new Set(context.nodes.map(n => n.id));

      context.edges.forEach(edge => {
        // Check if source node exists
        if (!nodeIds.has(edge.source)) {
          errors.push({
            id: `invalid_source_${edge.id}`,
            type: 'INVALID_CONNECTION' as const,
            severity: 'error' as const,
            message: `Edge references non-existent source node: ${edge.source}`,
            edgeId: String(edge.id),
            suggestedFix: 'Remove invalid edge or add missing source node',
          });
        }

        // Check if target node exists
        if (!nodeIds.has(edge.target)) {
          errors.push({
            id: `invalid_target_${edge.id}`,
            type: 'INVALID_CONNECTION' as const,
            severity: 'error' as const,
            message: `Edge references non-existent target node: ${edge.target}`,
            edgeId: String(edge.id),
            suggestedFix: 'Remove invalid edge or add missing target node',
          });
        }

        // Validate handles exist on node types
        const sourceNode = context.nodes.find(n => n.id === edge.source);
        const targetNode = context.nodes.find(n => n.id === edge.target);

        if (sourceNode && edge.sourceHandle) {
          const sourceDefinition = getNodeTypeDefinition(sourceNode.type);
          if (sourceDefinition) {
            const validOutput = sourceDefinition.outputs.find(
              o => o.id === edge.sourceHandle
            );
            if (!validOutput) {
              errors.push({
                id: `invalid_source_handle_${edge.id}`,
                type: 'INVALID_CONNECTION' as const,
                severity: 'error' as const,
                message: `Invalid source handle: ${edge.sourceHandle} on node type ${sourceNode.type}`,
                edgeId: String(edge.id),
                suggestedFix: 'Use a valid output handle for this node type',
              });
            }
          }
        }

        if (targetNode && edge.targetHandle) {
          const targetDefinition = getNodeTypeDefinition(targetNode.type);
          if (targetDefinition) {
            const validInput = targetDefinition.inputs.find(
              i => i.id === edge.targetHandle
            );
            if (!validInput) {
              errors.push({
                id: `invalid_target_handle_${edge.id}`,
                type: 'INVALID_CONNECTION' as const,
                severity: 'error' as const,
                message: `Invalid target handle: ${edge.targetHandle} on node type ${targetNode.type}`,
                edgeId: String(edge.id),
                suggestedFix: 'Use a valid input handle for this node type',
              });
            }
          }
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  },

  {
    id: 'circular_dependency',
    name: 'No Circular Dependencies',
    description: 'Ensures the workflow has no circular dependencies',
    category: 'structure',
    severity: 'error',
    enabled: true,
    validate: (context: ValidationContext): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      // Build adjacency list
      const adjacencyList = new Map<string, string[]>();
      context.nodes.forEach(node => {
        adjacencyList.set(node.id, []);
      });

      context.edges.forEach(edge => {
        const sourceConnections = adjacencyList.get(edge.source) || [];
        sourceConnections.push(edge.target);
        adjacencyList.set(edge.source, sourceConnections);
      });

      // DFS to detect cycles
      const visited = new Set<string>();
      const recursionStack = new Set<string>();
      const cycleNodes = new Set<string>();

      function detectCycle(nodeId: string, path: string[]): boolean {
        if (recursionStack.has(nodeId)) {
          // Found a cycle, add all nodes in the cycle
          const cycleStart = path.indexOf(nodeId);
          path.slice(cycleStart).forEach(id => cycleNodes.add(id));
          return true;
        }

        if (visited.has(nodeId)) {
          return false;
        }

        visited.add(nodeId);
        recursionStack.add(nodeId);

        const connections = adjacencyList.get(nodeId) || [];
        for (const connectedId of connections) {
          if (detectCycle(connectedId, [...path, nodeId])) {
            return true;
          }
        }

        recursionStack.delete(nodeId);
        return false;
      }

      // Check each unvisited node
      for (const node of context.nodes) {
        if (!visited.has(node.id)) {
          detectCycle(node.id, []);
        }
      }

      // Report cycle errors
      if (cycleNodes.size > 0) {
        const cycleNodeList = Array.from(cycleNodes);
        cycleNodeList.forEach(nodeId => {
          errors.push({
            id: `circular_dependency_${nodeId}`,
            type: 'CIRCULAR_DEPENDENCY' as const,
            severity: 'error' as const,
            message: `Node is part of a circular dependency: ${cycleNodeList.join(' → ')}`,
            nodeId,
            suggestedFix: 'Remove one or more connections to break the cycle',
          });
        });
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  },

  {
    id: 'disconnected_nodes',
    name: 'Check Disconnected Nodes',
    description: 'Warns about nodes that are not connected to the workflow',
    category: 'structure',
    severity: 'warning',
    enabled: true,
    validate: (context: ValidationContext): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      if (context.allowUnconnectedNodes) {
        return { isValid: true, errors, warnings };
      }

      const connectedNodes = new Set<string>();
      context.edges.forEach(edge => {
        connectedNodes.add(edge.source);
        connectedNodes.add(edge.target);
      });

      context.nodes.forEach(node => {
        if (!connectedNodes.has(node.id)) {
          warnings.push({
            id: `disconnected_${node.id}`,
            type: 'UNUSED_OUTPUT' as const,
            severity: 'warning' as const,
            message: `Node is not connected to any other nodes`,
            nodeId: node.id,
            suggestedFix: 'Connect this node to other nodes or remove it',
          });
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  },
];
