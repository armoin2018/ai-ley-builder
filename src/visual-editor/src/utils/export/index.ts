// PlantUML export utilities

import type { Edge, Node } from '@xyflow/react';
import type { SerializedWorkflow } from '../../features/workflow/utils/serialization';
import type { ExportResult, PlantUMLExportOptions } from '../../types/export';

export class PlantUMLExporter {
  /**
   * Convert workflow to PlantUML format
   */
  static convertWorkflowToPlantUML(
    workflow:
      | SerializedWorkflow
      | { nodes: Node[]; edges: Edge[]; name: string; description?: string },
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

    // Get nodes from various possible workflow structures
    // Handle different possible workflow formats
    let nodes = [];
    let edges = [];

    try {
      if (workflow.nodes) {
        // Direct nodes/edges format (SerializedWorkflow)
        nodes = workflow.nodes || [];
        edges = workflow.edges || [];
      } else if ('canvas' in workflow) {
        // Canvas format (legacy)
        const legacyWorkflow = workflow as any;
        nodes = legacyWorkflow.canvas?.nodes || [];
        edges = legacyWorkflow.canvas?.edges || [];
      } else {
        // Empty workflow
        console.warn('Workflow has no nodes or canvas structure:', workflow);
        nodes = [];
        edges = [];
      }
    } catch (error) {
      console.error(
        'Error extracting nodes/edges from workflow:',
        error,
        workflow
      );
      nodes = [];
      edges = [];
    }

    // Add nodes
    nodes.forEach((node: Node) => {
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
    edges.forEach((edge: Edge) => {
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

    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[T:]/g, '-');
    return `${sanitized}-${timestamp}.puml`;
  }

  /**
   * Get default export path
   */
  static getDefaultExportPath(): string {
    return '../../.ai-ley/shared/uml-flows/user/';
  }

  /**
   * Export workflow to PlantUML file
   */
  static async exportWorkflowToPUML(
    workflow:
      | SerializedWorkflow
      | { nodes: Node[]; edges: Edge[]; name: string; description?: string },
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
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get all available PlantUML files in the user directory
   */
  static async getAvailablePUMLFiles(): Promise<
    Array<{ name: string; path: string; lastModified: Date }>
  > {
    try {
      // Try to fetch real files from the filesystem via a backend endpoint
      // If that fails, fall back to localStorage simulation

      try {
        // First try to fetch real files through the development server
        const response = await fetch('/api/puml-files');
        if (response.ok) {
          const files = await response.json();
          console.log('✅ Loaded real PlantUML files from filesystem:', files);
          return files;
        }
      } catch (fetchError) {
        console.log(
          '📁 No backend API available, using local file discovery...'
        );
      }

      // Fallback: Use known file paths and try to load them
      const knownFilePaths = [
        '../../.ai-ley/shared/uml-flows/user/build-project.puml',
        '../../.ai-ley/shared/uml-flows/examples/simple-website-deploy.puml',
        '../../.ai-ley/shared/uml-flows/templates/deployment-pipeline.puml',
        '../../.ai-ley/shared/uml-flows/templates/data-backup.puml',
      ];

      const discoveredFiles: Array<{
        name: string;
        path: string;
        lastModified: Date;
      }> = [];

      for (const filePath of knownFilePaths) {
        try {
          // Try to fetch the file content directly
          const fullPath = `/${filePath}`;
          const fileResponse = await fetch(fullPath);

          if (fileResponse.ok) {
            const content = await fileResponse.text();
            const fileName = filePath.split('/').pop() || 'unknown.puml';

            // Store the content in localStorage for later access
            localStorage.setItem(`puml-content-${filePath}`, content);

            discoveredFiles.push({
              name: fileName,
              path: filePath,
              lastModified: new Date(),
            });

            console.log(`✅ Discovered and cached: ${fileName}`);
          }
        } catch (error) {
          console.log(`⚠️ Could not load ${filePath}:`, error);
        }
      }

      if (discoveredFiles.length > 0) {
        // Store the discovered files list
        localStorage.setItem(
          'ai-ley-puml-files',
          JSON.stringify(discoveredFiles)
        );
        console.log(`📁 Discovered ${discoveredFiles.length} PlantUML files`);
        return discoveredFiles;
      }

      // Final fallback: check localStorage for previously stored files
      const stored = localStorage.getItem('ai-ley-puml-files');
      if (stored) {
        console.log('📦 Using cached PlantUML files from localStorage');
        return JSON.parse(stored);
      }

      console.log('❌ No PlantUML files found');
      return [];
    } catch (error) {
      console.error('Error loading PUML files:', error);
      return [];
    }
  }

  /**
   * Import PlantUML file and convert to workflow format
   */
  static async importFromPUML(
    filePath?: string
  ): Promise<SerializedWorkflow | null> {
    try {
      if (!filePath) {
        // If no file path provided, get the most recent one
        const files = await this.getAvailablePUMLFiles();
        if (files.length === 0) return null;

        // Sort by lastModified and get the most recent
        files.sort(
          (a, b) => b.lastModified.getTime() - a.lastModified.getTime()
        );
        filePath = files[0].path;
      }

      // In browser environment, get content from localStorage
      const pumlContent = localStorage.getItem(`puml-content-${filePath}`);
      if (!pumlContent) {
        console.warn(`No content found for PUML file: ${filePath}`);
        return null;
      }

      return this.parsePUMLContent(pumlContent, filePath);
    } catch (error) {
      console.error('Error importing PUML file:', error);
      return null;
    }
  }

  /**
   * Parse PlantUML content and convert to workflow format
   */
  static parsePUMLContent(
    content: string,
    filePath: string
  ): SerializedWorkflow | null {
    try {
      // Extract workflow name from file path or content
      const fileName =
        filePath.split('/').pop()?.replace('.puml', '') || 'Imported Workflow';
      const workflowName = fileName
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      // Extract title from PlantUML content
      const titleMatch = content.match(/title\s+(.+)/i);
      const title = titleMatch ? titleMatch[1] : workflowName;

      // Extract description from note
      const noteMatch = content.match(/note\s+top\s*:\s*(.+)/i);
      const description = noteMatch ? noteMatch[1] : undefined;

      // Parse rectangles (nodes)
      const rectanglePattern =
        /rectangle\s+"([^"]+)(?:\\\\n\[([^\]]+)\])?"(?:\s+as\s+(\w+))?\s*(\w+)?/gi;
      const nodes: any[] = [];
      let rectangleMatch;

      while ((rectangleMatch = rectanglePattern.exec(content)) !== null) {
        const [, label, nodeType, nodeId, color] = rectangleMatch;
        const id = nodeId || this.generateNodeId();

        // Map color back to node type
        const type =
          this.mapColorToNodeType(color || '') ||
          this.mapLabelToNodeType(nodeType || label);

        nodes.push({
          id,
          type,
          position: { x: Math.random() * 400, y: Math.random() * 300 }, // Random positioning
          data: {
            label: label || `Node ${id}`,
            description: nodeType ? `Type: ${nodeType}` : undefined,
            properties: this.getDefaultPropertiesForType(type),
          },
        });
      }

      // Parse connections (edges)
      const connectionPattern = /(\w+)\s*-->\s*(\w+)(?:\s*:\s*(.+))?/gi;
      const edges: any[] = [];
      let connectionMatch;

      while ((connectionMatch = connectionPattern.exec(content)) !== null) {
        const [, source, target, label] = connectionMatch;

        edges.push({
          id: `e${source}-${target}`,
          source,
          target,
          type: 'default',
          data: { label },
        });
      }

      return {
        id: this.generateWorkflowId(),
        name: title,
        description,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 },
        metadata: {
          nodeCount: nodes.length,
          edgeCount: edges.length,
        },
      };
    } catch (error) {
      console.error('Error parsing PUML content:', error);
      return null;
    }
  }

  /**
   * Auto-load the most recent PlantUML file
   */
  static async autoLoadLatestPUML(): Promise<SerializedWorkflow | null> {
    try {
      const files = await this.getAvailablePUMLFiles();
      if (files.length === 0) return null;

      // Sort by lastModified and get the most recent
      files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());

      console.log(`Auto-loading latest PUML file: ${files[0].name}`);
      return await this.importFromPUML(files[0].path);
    } catch (error) {
      console.error('Error auto-loading PUML file:', error);
      return null;
    }
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

  private static mapColorToNodeType(color: string): string {
    switch (color) {
      case 'COMMAND_PROMPT_FILE':
      case '#lightblue':
        return 'command-prompt-file';
      case 'CUSTOM_PROMPT_TEXT':
      case '#lightgreen':
        return 'custom-prompt-text';
      case 'PERSONA':
      case '#yellow':
        return 'persona';
      case 'INSTRUCTION':
      case '#orange':
        return 'instruction';
      case 'LOGIC_CONDITION':
      case '#pink':
        return 'logic-condition';
      case 'LOOP':
      case '#violet':
        return 'loop';
      case 'OUTPUT_TYPE':
      case '#lightgray':
        return 'output-type';
      default:
        return 'command-prompt-file'; // Default fallback
    }
  }

  private static mapLabelToNodeType(label: string): string {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('command') || lowerLabel.includes('prompt'))
      return 'command-prompt-file';
    if (lowerLabel.includes('custom') || lowerLabel.includes('text'))
      return 'custom-prompt-text';
    if (lowerLabel.includes('persona')) return 'persona';
    if (lowerLabel.includes('instruction')) return 'instruction';
    if (lowerLabel.includes('logic') || lowerLabel.includes('condition'))
      return 'logic-condition';
    if (lowerLabel.includes('loop')) return 'loop';
    if (lowerLabel.includes('output')) return 'output-type';
    return 'command-prompt-file'; // Default fallback
  }

  private static generateNodeId(): string {
    return `node_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateWorkflowId(): string {
    return `workflow_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getDefaultPropertiesForType(
    nodeType: string
  ): Record<string, any> {
    switch (nodeType) {
      case 'command-prompt-file':
        return { fileName: '', content: '', variables: [] };
      case 'custom-prompt-text':
        return { promptText: '', variables: [] };
      case 'persona':
        return {
          personaType: '',
          tone: 'professional',
          expertise: [],
          characteristics: [],
        };
      case 'instruction':
        return { instructionText: '', priority: 'medium' };
      case 'logic-condition':
        return { condition: '', trueLabel: 'True', falseLabel: 'False' };
      case 'loop':
        return {
          loopType: 'for',
          maxIterations: 10,
          iteratorVariable: 'i',
          condition: '',
        };
      case 'output-type':
        return { outputType: 'text', format: 'structured', template: '' };
      default:
        return {};
    }
  }
}

// Convenience exports
export const {
  convertWorkflowToPlantUML,
  exportWorkflowToPUML,
  generateFileName,
  getDefaultExportPath,
  importFromPUML,
  getAvailablePUMLFiles,
  autoLoadLatestPUML,
  parsePUMLContent,
} = PlantUMLExporter;
