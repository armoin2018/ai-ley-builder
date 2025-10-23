import type { Edge, Node } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import { flowToPlantUML, parsePlantUMLToFlow } from '../plantuml-parser';

describe('PlantUML Parser Robustness', () => {
  describe('Edge Cases', () => {
    it('should handle empty PlantUML content gracefully', () => {
      const result = parsePlantUMLToFlow('');

      expect(result.nodes).toHaveLength(1); // Default start node
      expect(result.nodes[0].type).toBe('input');
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.length).toBeGreaterThan(0);
    });

    it('should handle whitespace-only content', () => {
      const result = parsePlantUMLToFlow('   \n\n   \t\t   ');

      expect(result.nodes).toHaveLength(1);
      expect(result.warnings).toBeDefined();
    });

    it('should handle malformed metadata JSON gracefully', () => {
      const plantuml = `@startuml Test
'@node-meta {invalid json
rectangle "Test" as test1
@enduml`;

      const result = parsePlantUMLToFlow(plantuml);

      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.message.includes('metadata'))).toBe(
        true
      );
    });

    it('should handle unknown PlantUML shapes', () => {
      const plantuml = `@startuml Test
hexagon "Unknown Shape" as hex1
@enduml`;

      const result = parsePlantUMLToFlow(plantuml);

      // Should create node with default type
      expect(result.nodes.length).toBeGreaterThan(0);
    });
  });

  describe('Round-Trip Conversion', () => {
    it('should preserve node positions in round-trip conversion', () => {
      const nodes: Node[] = [
        {
          id: 'node1',
          type: 'custom-prompt',
          position: { x: 150, y: 250 },
          data: { label: 'Test Node', shape: 'rectangle' },
        },
      ];
      const edges: Edge[] = [];

      const plantuml = flowToPlantUML(nodes, edges, 'TestWorkflow');
      const result = parsePlantUMLToFlow(plantuml);

      expect(result.nodes).toHaveLength(1);
      expect(result.nodes[0].position.x).toBe(150);
      expect(result.nodes[0].position.y).toBe(250);
    });

    it('should preserve node IDs in round-trip conversion', () => {
      const nodes: Node[] = [
        {
          id: 'custom_node_id_123',
          type: 'instruction',
          position: { x: 100, y: 100 },
          data: { label: 'Instruction Node', shape: 'rectangle' },
        },
      ];
      const edges: Edge[] = [];

      const plantuml = flowToPlantUML(nodes, edges, 'TestWorkflow');
      const result = parsePlantUMLToFlow(plantuml);

      expect(result.nodes[0].id).toBe('custom_node_id_123');
    });

    it('should preserve node types in round-trip conversion', () => {
      const nodeTypes = [
        'custom-prompt',
        'command-prompt-file',
        'persona',
        'instruction',
        'conditional',
        'loop',
        'output-formatter',
        'input',
        'output',
        'injector',
      ];

      nodeTypes.forEach((type, index) => {
        const nodes: Node[] = [
          {
            id: `node_${index}`,
            type,
            position: { x: index * 100, y: 100 },
            data: { label: `${type} Node`, shape: 'rectangle' },
          },
        ];
        const edges: Edge[] = [];

        const plantuml = flowToPlantUML(nodes, edges, 'TypeTest');
        const result = parsePlantUMLToFlow(plantuml);

        expect(result.nodes[0].type).toBe(type);
      });
    });

    it('should preserve edge connections in round-trip', () => {
      const nodes: Node[] = [
        {
          id: 'node1',
          type: 'input',
          position: { x: 0, y: 0 },
          data: { label: 'Start', shape: 'rectangle' },
        },
        {
          id: 'node2',
          type: 'output',
          position: { x: 200, y: 0 },
          data: { label: 'End', shape: 'rectangle' },
        },
      ];
      const edges: Edge[] = [
        {
          id: 'edge1',
          source: 'node1',
          target: 'node2',
        },
      ];

      const plantuml = flowToPlantUML(nodes, edges, 'EdgeTest');
      const result = parsePlantUMLToFlow(plantuml);

      expect(result.edges).toHaveLength(1);
      expect(result.edges[0].source).toBe('node1');
      expect(result.edges[0].target).toBe('node2');
    });

    it('should preserve node properties in round-trip', () => {
      const nodes: Node[] = [
        {
          id: 'prompt_node',
          type: 'custom-prompt',
          position: { x: 100, y: 100 },
          data: {
            label: 'Custom Prompt',
            shape: 'rectangle',
            properties: {
              promptText: 'This is a test prompt',
              variables: ['var1', 'var2'],
            },
          },
        },
      ];
      const edges: Edge[] = [];

      const plantuml = flowToPlantUML(nodes, edges, 'PropertiesTest');
      const result = parsePlantUMLToFlow(plantuml);

      expect(result.nodes[0].data.properties).toBeDefined();
      expect(result.nodes[0].data.properties.promptText).toBe(
        'This is a test prompt'
      );
      expect(result.nodes[0].data.properties.variables).toEqual([
        'var1',
        'var2',
      ]);
    });
  });

  describe('Complex Workflows', () => {
    it('should handle multiple nodes and edges', () => {
      const nodes: Node[] = Array.from({ length: 10 }, (_, i) => ({
        id: `node_${i}`,
        type: i % 2 === 0 ? 'custom-prompt' : 'instruction',
        position: { x: i * 150, y: Math.floor(i / 3) * 200 },
        data: { label: `Node ${i}`, shape: 'rectangle' },
      }));

      const edges: Edge[] = Array.from({ length: 9 }, (_, i) => ({
        id: `edge_${i}`,
        source: `node_${i}`,
        target: `node_${i + 1}`,
      }));

      const plantuml = flowToPlantUML(nodes, edges, 'ComplexWorkflow');
      const result = parsePlantUMLToFlow(plantuml);

      expect(result.nodes).toHaveLength(10);
      expect(result.edges).toHaveLength(9);
    });

    it('should handle workflows with loops (cycles)', () => {
      const nodes: Node[] = [
        {
          id: 'A',
          type: 'input',
          position: { x: 0, y: 0 },
          data: { label: 'A', shape: 'rectangle' },
        },
        {
          id: 'B',
          type: 'custom-prompt',
          position: { x: 200, y: 0 },
          data: { label: 'B', shape: 'rectangle' },
        },
        {
          id: 'C',
          type: 'output',
          position: { x: 400, y: 0 },
          data: { label: 'C', shape: 'rectangle' },
        },
      ];

      // Create a cycle: A -> B -> C -> A
      const edges: Edge[] = [
        { id: 'e1', source: 'A', target: 'B' },
        { id: 'e2', source: 'B', target: 'C' },
        { id: 'e3', source: 'C', target: 'A' },
      ];

      const plantuml = flowToPlantUML(nodes, edges, 'CycleTest');
      const result = parsePlantUMLToFlow(plantuml);

      // Should handle cycles gracefully
      expect(result.nodes).toHaveLength(3);
      expect(result.edges).toHaveLength(3);
    });
  });

  describe('Node Type Mapping', () => {
    it('should correctly map activity nodes to AI-LEY types', () => {
      const activities = [
        { name: 'requirements', expectedType: 'input' },
        { name: 'learn', expectedType: 'custom-prompt' },
        { name: 'build', expectedType: 'command-prompt-file' },
        { name: 'test', expectedType: 'output-formatter' },
        { name: 'inject-data', expectedType: 'injector' },
      ];

      activities.forEach(({ name, expectedType }) => {
        const plantuml = `@startuml Test
:${name};
@enduml`;

        const result = parsePlantUMLToFlow(plantuml);

        expect(result.nodes.length).toBeGreaterThan(0);
        expect(result.nodes[0].type).toBe(expectedType);
      });
    });
  });

  describe('Error Reporting', () => {
    it('should report errors array when parsing fails', () => {
      const plantuml = `@startuml Test
'@node-meta {broken: json
rectangle "Test"
@enduml`;

      const result = parsePlantUMLToFlow(plantuml);

      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });

    it('should report line numbers for errors', () => {
      const plantuml = `@startuml Test
'@node-meta invalid
@enduml`;

      const result = parsePlantUMLToFlow(plantuml);

      if (result.errors && result.errors.length > 0) {
        expect(result.errors[0].line).toBeGreaterThan(0);
      }
    });
  });

  describe('Special Characters and Edge Cases', () => {
    it('should handle node labels with special characters', () => {
      const nodes: Node[] = [
        {
          id: 'node1',
          type: 'custom-prompt',
          position: { x: 0, y: 0 },
          data: {
            label: 'Node with "quotes" and \'apostrophes\'',
            shape: 'rectangle',
          },
        },
      ];
      const edges: Edge[] = [];

      const plantuml = flowToPlantUML(nodes, edges, 'SpecialChars');
      const result = parsePlantUMLToFlow(plantuml);

      expect(result.nodes).toHaveLength(1);
    });

    it('should handle multi-line property values', () => {
      const nodes: Node[] = [
        {
          id: 'node1',
          type: 'custom-prompt',
          position: { x: 0, y: 0 },
          data: {
            label: 'Multi-line',
            shape: 'rectangle',
            properties: {
              promptText: 'Line 1\nLine 2\nLine 3',
            },
          },
        },
      ];
      const edges: Edge[] = [];

      const plantuml = flowToPlantUML(nodes, edges, 'MultiLine');
      const result = parsePlantUMLToFlow(plantuml);

      expect(result.nodes).toHaveLength(1);
    });
  });
});
