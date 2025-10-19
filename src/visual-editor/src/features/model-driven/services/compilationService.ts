/**
 * Compilation service for converting models to PlantUML and markdown
 */

import type { FlowModel, NodeModel } from '../types';

export interface CompilationResult {
  plantuml: string;
  markdown: string;
  errors: string[];
  warnings: string[];
}

export interface CompilationOptions {
  includeMetadata?: boolean;
  diagramTheme?: 'default' | 'cerulean' | 'bluegray' | 'aws' | 'azure';
  includeValidation?: boolean;
  exportFormat?: 'svg' | 'png' | 'puml';
}

export class CompilationService {
  /**
   * Compile a node model to PlantUML
   */
  compileNode(
    node: NodeModel,
    options: CompilationOptions = {}
  ): CompilationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate node before compilation
    const validationResult = this.validateNode(node);
    errors.push(...validationResult.errors);
    warnings.push(...validationResult.warnings);

    // Generate PlantUML
    const plantuml = this.generateNodePlantUML(node, options);

    // Generate markdown
    const markdown = this.generateNodeMarkdown(node, options);

    return {
      plantuml,
      markdown,
      errors,
      warnings,
    };
  }

  /**
   * Compile a flow model to PlantUML
   */
  compileFlow(
    flow: FlowModel,
    options: CompilationOptions = {}
  ): CompilationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate flow before compilation
    const validationResult = this.validateFlow(flow);
    errors.push(...validationResult.errors);
    warnings.push(...validationResult.warnings);

    // Generate PlantUML
    const plantuml = this.generateFlowPlantUML(flow, options);

    // Generate markdown
    const markdown = this.generateFlowMarkdown(flow, options);

    return {
      plantuml,
      markdown,
      errors,
      warnings,
    };
  }

  private generateNodePlantUML(
    node: NodeModel,
    options: CompilationOptions
  ): string {
    const lines: string[] = [];

    // PlantUML header
    lines.push('@startuml');
    lines.push(`!theme ${options.diagramTheme || 'default'}`);
    lines.push('');

    // Title
    lines.push(`title ${node.name} - ${node.type} Node`);
    lines.push('');

    // Node definition
    const nodeColor = node.metadata?.color || '#E1F5FE';
    const nodeIcon = this.getPlantUMLIcon(node.metadata?.icon || 'box');

    lines.push(
      `rectangle "${node.name}\\n${node.description}" as ${this.sanitizeId(node.id)} ${nodeColor} {`
    );

    // Properties section
    if (Object.keys(node.properties).length > 0) {
      lines.push('  === Properties ===');
      for (const [key, value] of Object.entries(node.properties)) {
        lines.push(`  ${key}: ${this.formatValue(value)}`);
      }
      lines.push('');
    }

    // Inputs section
    if (node.inputs.length > 0) {
      lines.push('  === Inputs ===');
      for (const input of node.inputs) {
        const required = input.required ? ' (required)' : '';
        lines.push(`  ${nodeIcon} ${input.name}: ${input.type}${required}`);
      }
      lines.push('');
    }

    // Outputs section
    if (node.outputs.length > 0) {
      lines.push('  === Outputs ===');
      for (const output of node.outputs) {
        lines.push(`  ${nodeIcon} ${output.name}: ${output.type}`);
      }
    }

    lines.push('}');

    // Metadata annotations
    if (options.includeMetadata && node.metadata) {
      lines.push('');
      lines.push(`note right of ${this.sanitizeId(node.id)}`);
      lines.push(`  Category: ${node.metadata.category || 'General'}`);
      lines.push(`  Version: ${node.version}`);
      if (node.metadata.tags && node.metadata.tags.length > 0) {
        lines.push(`  Tags: ${node.metadata.tags.join(', ')}`);
      }
      lines.push('end note');
    }

    lines.push('');
    lines.push('@enduml');

    return lines.join('\n');
  }

  private generateFlowPlantUML(
    flow: FlowModel,
    options: CompilationOptions
  ): string {
    const lines: string[] = [];

    // PlantUML header
    lines.push('@startuml');
    lines.push(`!theme ${options.diagramTheme || 'default'}`);
    lines.push('');

    // Title
    lines.push(`title ${flow.name} - Flow Diagram`);
    lines.push('');

    // Start/End nodes
    lines.push('start');
    lines.push('');

    // Flow nodes
    for (const nodeInstance of flow.nodes) {
      const nodeColor = '#E1F5FE'; // Default color since instances don't have metadata
      const shape = this.getNodeShape(nodeInstance.nodeModelId);

      lines.push(
        `${shape} "${nodeInstance.label || nodeInstance.id}\\n${nodeInstance.nodeModelId}" as ${this.sanitizeId(nodeInstance.id)} ${nodeColor}`
      );
    }

    lines.push('');

    // Connections
    const processedConnections = new Set<string>();
    for (const connection of flow.connections) {
      const connectionKey = `${connection.from.nodeId}:${connection.from.outputId}->${connection.to.nodeId}:${connection.to.inputId}`;
      if (processedConnections.has(connectionKey)) continue;
      processedConnections.add(connectionKey);

      const sourceId = this.sanitizeId(connection.from.nodeId);
      const targetId = this.sanitizeId(connection.to.nodeId);

      let label = '';
      if (
        connection.from.outputId !== 'output' ||
        connection.to.inputId !== 'input'
      ) {
        label = ` : ${connection.from.outputId} → ${connection.to.inputId}`;
      }

      lines.push(`${sourceId} --> ${targetId}${label}`);
    }

    lines.push('');
    lines.push('stop');
    lines.push('');
    lines.push('@enduml');

    return lines.join('\n');
  }

  private generateNodeMarkdown(
    node: NodeModel,
    options: CompilationOptions
  ): string {
    const sections: string[] = [];

    // Frontmatter
    const frontmatter = {
      id: node.id,
      type: node.type,
      name: node.name,
      version: node.version,
      ...node.metadata,
    };

    sections.push('---');
    sections.push(this.yamlStringify(frontmatter));
    sections.push('---');
    sections.push('');

    // Main content
    sections.push(`# ${node.name}`);
    sections.push('');
    sections.push(node.description);
    sections.push('');

    // Properties
    if (Object.keys(node.properties).length > 0) {
      sections.push('## Properties');
      sections.push('');
      for (const [key, value] of Object.entries(node.properties)) {
        sections.push(`- **${key}**: ${this.formatValue(value)}`);
      }
      sections.push('');
    }

    // Inputs
    if (node.inputs.length > 0) {
      sections.push('## Input Ports');
      sections.push('');
      sections.push('| Name | Type | Required | Description |');
      sections.push('|------|------|----------|-------------|');
      for (const input of node.inputs) {
        const required = input.required ? 'Yes' : 'No';
        const description = input.description || '-';
        sections.push(
          `| ${input.name} | ${input.type} | ${required} | ${description} |`
        );
      }
      sections.push('');
    }

    // Outputs
    if (node.outputs.length > 0) {
      sections.push('## Output Ports');
      sections.push('');
      sections.push('| Name | Type | Description |');
      sections.push('|------|------|-------------|');
      for (const output of node.outputs) {
        const description = output.description || '-';
        sections.push(`| ${output.name} | ${output.type} | ${description} |`);
      }
      sections.push('');
    }

    // Validation rules
    if (options.includeValidation && node.validation) {
      sections.push('## Validation Rules');
      sections.push('');

      if (node.validation.requiredProperties) {
        sections.push('### Required Properties');
        for (const prop of node.validation.requiredProperties) {
          sections.push(`- **${prop}**: Required property`);
        }
        sections.push('');
      }

      if (node.validation.customRules) {
        sections.push('### Custom Rules');
        for (const rule of node.validation.customRules) {
          sections.push(`- **${rule.rule}**: ${rule.message}`);
        }
        sections.push('');
      }
    }

    return sections.join('\n');
  }

  private generateFlowMarkdown(
    flow: FlowModel,
    _options: CompilationOptions
  ): string {
    const sections: string[] = [];

    // Frontmatter
    const frontmatter = {
      id: flow.id,
      name: flow.name,
      version: flow.version,
      type: 'flow',
      ...flow.metadata,
    };

    sections.push('---');
    sections.push(this.yamlStringify(frontmatter));
    sections.push('---');
    sections.push('');

    // Main content
    sections.push(`# ${flow.name}`);
    sections.push('');
    sections.push(flow.description);
    sections.push('');

    // Flow nodes
    if (flow.nodes.length > 0) {
      sections.push('## Flow Nodes');
      sections.push('');
      sections.push('| ID | Label | Node Model | Description |');
      sections.push('|----|-------|------------|-------------|');
      for (const node of flow.nodes) {
        const label = node.label || node.id;
        const description = '-'; // NodeInstance doesn't have description
        sections.push(
          `| ${node.id} | ${label} | ${node.nodeModelId} | ${description} |`
        );
      }
      sections.push('');
    }

    // Connections
    if (flow.connections.length > 0) {
      sections.push('## Connections');
      sections.push('');
      sections.push('| Source | Output Port | Target | Input Port |');
      sections.push('|--------|-------------|--------|------------|');
      for (const connection of flow.connections) {
        sections.push(
          `| ${connection.from.nodeId} | ${connection.from.outputId} | ${connection.to.nodeId} | ${connection.to.inputId} |`
        );
      }
      sections.push('');
    }

    // Dependencies
    if (flow.dependencies && flow.dependencies.length > 0) {
      sections.push('## Dependencies');
      sections.push('');
      for (const dep of flow.dependencies) {
        sections.push(
          `- ${dep.type}: ${dep.reference} ${dep.version ? `(${dep.version})` : ''}`
        );
      }
      sections.push('');
    }

    return sections.join('\n');
  }

  private validateNode(node: NodeModel): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!node.id || node.id.trim() === '') {
      errors.push('Node ID is required');
    }

    if (!node.name || node.name.trim() === '') {
      errors.push('Node name is required');
    }

    if (!node.type || node.type.trim() === '') {
      errors.push('Node type is required');
    }

    // Input/output validation
    const inputIds = new Set<string>();
    for (const input of node.inputs) {
      if (inputIds.has(input.id)) {
        errors.push(`Duplicate input ID: ${input.id}`);
      }
      inputIds.add(input.id);
    }

    const outputIds = new Set<string>();
    for (const output of node.outputs) {
      if (outputIds.has(output.id)) {
        errors.push(`Duplicate output ID: ${output.id}`);
      }
      outputIds.add(output.id);
    }

    // Custom validation rules
    if (node.validation) {
      // Check required properties
      if (node.validation.requiredProperties) {
        for (const propName of node.validation.requiredProperties) {
          if (!node.properties[propName]) {
            errors.push(`Required property missing: ${propName}`);
          }
        }
      }

      // Check custom rules
      if (node.validation.customRules) {
        for (const rule of node.validation.customRules) {
          // Apply validation logic based on rule type
          // This is a simplified example
          errors.push(rule.message);
        }
      }
    }

    return { errors, warnings };
  }

  private validateFlow(flow: FlowModel): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!flow.id || flow.id.trim() === '') {
      errors.push('Flow ID is required');
    }

    if (!flow.name || flow.name.trim() === '') {
      errors.push('Flow name is required');
    }

    // Node validation
    const nodeIds = new Set<string>();
    for (const node of flow.nodes) {
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node ID: ${node.id}`);
      }
      nodeIds.add(node.id);
    }

    // Connection validation
    for (const connection of flow.connections) {
      if (!nodeIds.has(connection.from.nodeId)) {
        errors.push(
          `Connection references unknown source node: ${connection.from.nodeId}`
        );
      }
      if (!nodeIds.has(connection.to.nodeId)) {
        errors.push(
          `Connection references unknown target node: ${connection.to.nodeId}`
        );
      }
    }

    // Circular dependency check
    if (this.hasCircularDependencies(flow.connections)) {
      warnings.push('Flow contains circular dependencies');
    }

    return { errors, warnings };
  }

  private hasCircularDependencies(
    connections: FlowModel['connections']
  ): boolean {
    const graph = new Map<string, string[]>();

    // Build adjacency list
    for (const connection of connections) {
      const sources = graph.get(connection.from.nodeId) || [];
      sources.push(connection.to.nodeId);
      graph.set(connection.from.nodeId, sources);
    }

    // DFS for cycle detection
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(node);
      return false;
    };

    for (const [node] of graph) {
      if (!visited.has(node)) {
        if (hasCycle(node)) return true;
      }
    }

    return false;
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private getPlantUMLIcon(iconName: string): string {
    const iconMap: Record<string, string> = {
      box: '▢',
      circle: '●',
      diamond: '◆',
      triangle: '▲',
      star: '★',
      gear: '⚙',
      arrow: '→',
      check: '✓',
      cross: '✗',
      plus: '+',
      minus: '-',
    };
    return iconMap[iconName] || '▢';
  }

  private getNodeShape(nodeType: string): string {
    const shapeMap: Record<string, string> = {
      process: 'rectangle',
      decision: 'diamond',
      data: 'storage',
      connector: 'circle',
      terminal: 'ellipse',
      action: 'rectangle',
      condition: 'diamond',
    };
    return shapeMap[nodeType] || 'rectangle';
  }

  private formatValue(value: unknown): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private yamlStringify(obj: unknown): string {
    // Simple YAML stringifier
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }

    const lines: string[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        lines.push(`${key}:`);
        const subLines = this.yamlStringify(value).split('\n');
        for (const line of subLines) {
          if (line.trim()) {
            lines.push(`  ${line}`);
          }
        }
      } else {
        lines.push(`${key}: ${JSON.stringify(value)}`);
      }
    }
    return lines.join('\n');
  }
}

// Export singleton instance
export const compilationService = new CompilationService();
