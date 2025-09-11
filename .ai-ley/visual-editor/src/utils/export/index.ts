// PlantUML export utilities

import type { Node, Edge } from '@xyflow/react';
import type { 
  PlantUMLWorkflow, 
  PlantUMLNode, 
  PlantUMLEdge, 
  PlantUMLExportOptions,
  ExportResult 
} from '../../types/export';
import type { SerializedWorkflow } from '../../features/workflow/utils/serialization';

export class PlantUMLExporter {
  /**
   * Convert workflow to PlantUML format
   */
  static convertWorkflowToPlantUML(
    workflow: SerializedWorkflow | { nodes: Node[]; edges: Edge[]; name: string; description?: string },
    options: PlantUMLExportOptions = {}
  ): string {
    const { includeNodeProperties = false, formatStyle = 'simple' } = options;

    let puml = '@startuml\n';
    puml += `!define TITLE ${workflow.name.replace(/[^a-zA-Z0-9]/g, '_')}\n`;
    puml += `title ${workflow.name}\n`;
    
    if (workflow.description) {
      puml += `note top : ${workflow.description}\n`;
    }
    
    puml += '\n';

    // Define node types with colors
    puml += '!define COMMAND_PROMPT_FILE #lightblue\n';
    puml += '!define CUSTOM_PROMPT_TEXT #lightgreen\n';
    puml += '!define PERSONA #yellow\n';
    puml += '!define INSTRUCTION #orange\n';
    puml += '!define LOGIC_CONDITION #pink\n';
    puml += '!define LOOP #violet\n';
    puml += '!define OUTPUT_TYPE #lightgray\n';
    puml += '\n';

    // Add nodes
    workflow.nodes.forEach(node => {
      const nodeId = this.sanitizeId(node.id);
      const label = (node.data.label as string) || node.id;
      const nodeType = node.type || 'unknown';
      
      if (formatStyle === 'detailed') {
        puml += `rectangle "${label}\\n[${nodeType}]" as ${nodeId} ${this.getNodeColor(nodeType)}\n`;
        
        if (includeNodeProperties && node.data.properties) {
          const properties = node.data.properties as Record<string, any>;
          puml += `note right of ${nodeId}\n`;
          Object.entries(properties).forEach(([key, value]) => {
            if (value && typeof value !== 'object') {
              puml += `  ${key}: ${String(value).substring(0, 50)}${String(value).length > 50 ? '...' : ''}\n`;
            }
          });
          puml += `end note\n`;
        }
      } else {
        puml += `rectangle "${label}" as ${nodeId} ${this.getNodeColor(nodeType)}\n`;
      }
    });

    puml += '\n';

    // Add edges
    workflow.edges.forEach(edge => {
      const sourceId = this.sanitizeId(edge.source);
      const targetId = this.sanitizeId(edge.target);
      
      let connection = `${sourceId} --> ${targetId}`;
      
      // Add handle labels if available
      const handleLabels: string[] = [];
      if (edge.sourceHandle) {
        handleLabels.push(`from: ${edge.sourceHandle}`);
      }
      if (edge.targetHandle) {
        handleLabels.push(`to: ${edge.targetHandle}`);
      }
      
      if (handleLabels.length > 0) {
        connection += ` : ${handleLabels.join(', ')}`;
      }
      
      puml += `${connection}\n`;
    });

    puml += '\n@enduml';
    return puml;
  }

  /**
   * Generate default filename for PlantUML export
   */
  static generateFileName(workflowName: string): string {
    const sanitized = workflowName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    return `${sanitized}-${timestamp}.puml`;
  }

  /**
   * Get default export path
   */
  static getDefaultExportPath(): string {
    return '.ai-ley/shared/uml-flows/user/';
  }

  /**
   * Export workflow to PlantUML file
   */
  static async exportWorkflowToPUML(
    workflow: SerializedWorkflow | { nodes: Node[]; edges: Edge[]; name: string; description?: string },
    options: PlantUMLExportOptions = {}
  ): Promise<ExportResult> {
    try {
      const content = this.convertWorkflowToPlantUML(workflow, options);
      const fileName = this.generateFileName(workflow.name);
      const fullPath = options.outputPath 
        ? `${options.outputPath}/${fileName}`
        : `${this.getDefaultExportPath()}${fileName}`;

      // In a browser environment, we'll trigger a download
      // In a Node.js environment, you could write to the file system
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        success: true,
        filePath: fullPath,
        content,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Import PlantUML file (placeholder for future implementation)
   */
  static async importFromPUML(): Promise<SerializedWorkflow | null> {
    // This would parse a .puml file and convert it back to workflow format
    // For now, return null indicating not implemented
    return null;
  }

  private static sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9_]/g, '_');
  }

  private static getNodeColor(nodeType: string): string {
    switch (nodeType) {
      case 'command-prompt-file':
        return 'COMMAND_PROMPT_FILE';
      case 'custom-prompt-text':
        return 'CUSTOM_PROMPT_TEXT';
      case 'persona':
        return 'PERSONA';
      case 'instruction':
        return 'INSTRUCTION';
      case 'logic-condition':
        return 'LOGIC_CONDITION';
      case 'loop':
        return 'LOOP';
      case 'output-type':
        return 'OUTPUT_TYPE';
      default:
        return '#lightgray';
    }
  }
}

// Convenience exports
export const { 
  convertWorkflowToPlantUML, 
  exportWorkflowToPUML, 
  generateFileName,
  getDefaultExportPath,
  importFromPUML
} = PlantUMLExporter;