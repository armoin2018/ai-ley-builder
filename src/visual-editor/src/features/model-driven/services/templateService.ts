/**
 * Service for loading and parsing model templates from markdown files
 */

import type { FlowModel, ModelTemplate, NodeModel, NodeType } from '../types';

export class TemplateService {
  private static instance: TemplateService;
  private templateCache: Map<string, ModelTemplate> = new Map();

  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  /**
   * Load all available node templates
   */
  public async loadNodeTemplates(): Promise<ModelTemplate[]> {
    const nodeTypes: NodeType[] = [
      'CommandPromptFile',
      'LogicCondition',
      'OutputType',
      'Loop',
      'CustomPromptText',
      'Persona',
      'Instruction',
    ];

    const templates: ModelTemplate[] = [];

    for (const nodeType of nodeTypes) {
      try {
        const template = await this.loadNodeTemplate(nodeType);
        if (template) {
          templates.push(template);
        }
      } catch (error) {
        console.warn(`Failed to load template for ${nodeType}:`, error);
      }
    }

    return templates;
  }

  /**
   * Load a specific node template by type
   */
  public async loadNodeTemplate(
    nodeType: NodeType
  ): Promise<ModelTemplate | null> {
    const templateId = `node-${nodeType.toLowerCase()}`;

    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId) ?? null;
    }

    try {
      const fileName = this.getTemplateFileName(nodeType);
      const response = await fetch(`/.ai-ley/models/templates/${fileName}`);

      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }

      const content = await response.text();
      const template = this.parseNodeTemplate(content, nodeType);

      if (template) {
        this.templateCache.set(templateId, template);
        return template;
      }
    } catch (error) {
      console.error(`Error loading node template ${nodeType}:`, error);
    }

    return null;
  }

  /**
   * Load flow templates
   */
  public async loadFlowTemplates(): Promise<ModelTemplate[]> {
    const templates: ModelTemplate[] = [];

    try {
      const response = await fetch('/.ai-ley/models/templates/basic-flow.md');

      if (response.ok) {
        const content = await response.text();
        const template = this.parseFlowTemplate(content);

        if (template) {
          templates.push(template);
        }
      }
    } catch (error) {
      console.warn('Failed to load flow templates:', error);
    }

    return templates;
  }

  /**
   * Parse node template from markdown content
   */
  private parseNodeTemplate(
    content: string,
    nodeType: NodeType
  ): ModelTemplate | null {
    try {
      const { frontmatter, body } = this.parseFrontmatter(content);

      if (!frontmatter) {
        throw new Error('No frontmatter found in template');
      }

      const nodeModel: NodeModel = {
        id: frontmatter.id || `${nodeType.toLowerCase()}-template`,
        type: nodeType,
        name: frontmatter.name || nodeType,
        description: frontmatter.description || '',
        version: frontmatter.version || '1.0.0',
        properties: frontmatter.properties || {},
        inputs: frontmatter.inputs || [],
        outputs: frontmatter.outputs || [],
        metadata: frontmatter.metadata || {},
        validation: frontmatter.validation || {},
      };

      const template: ModelTemplate = {
        id: `template-${nodeType.toLowerCase()}`,
        type: 'node',
        nodeType,
        name: frontmatter.name || nodeType,
        description: frontmatter.description || '',
        template: nodeModel,
        content: body,
      };

      return template;
    } catch (error) {
      console.error(`Error parsing node template for ${nodeType}:`, error);
      return null;
    }
  }

  /**
   * Parse flow template from markdown content
   */
  private parseFlowTemplate(content: string): ModelTemplate | null {
    try {
      const { frontmatter, body } = this.parseFrontmatter(content);

      if (!frontmatter) {
        throw new Error('No frontmatter found in template');
      }

      const flowModel: FlowModel = {
        id: frontmatter.id || 'basic-flow-template',
        name: frontmatter.name || 'Basic Flow',
        description: frontmatter.description || '',
        version: frontmatter.version || '1.0.0',
        nodes: frontmatter.nodes || [],
        connections: frontmatter.connections || [],
        metadata: frontmatter.metadata || {},
        dependencies: frontmatter.dependencies || [],
        validation: frontmatter.validation || {},
      };

      const template: ModelTemplate = {
        id: 'template-basic-flow',
        type: 'flow',
        name: frontmatter.name || 'Basic Flow',
        description: frontmatter.description || '',
        template: flowModel,
        content: body,
      };

      return template;
    } catch (error) {
      console.error('Error parsing flow template:', error);
      return null;
    }
  }

  /**
   * Parse YAML frontmatter from markdown content
   */
  private parseFrontmatter(content: string): {
    frontmatter: any;
    body: string;
  } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { frontmatter: null, body: content };
    }

    try {
      // Simple YAML parsing - in production, use a proper YAML parser
      const yamlContent = match[1];
      const frontmatter = this.parseSimpleYaml(yamlContent);
      const body = match[2];

      return { frontmatter, body };
    } catch (error) {
      console.error('Error parsing frontmatter:', error);
      return { frontmatter: null, body: content };
    }
  }

  /**
   * Simple YAML parser for basic structures
   * Note: In production, use a proper YAML library like js-yaml
   */
  private parseSimpleYaml(yamlContent: string): any {
    const result: any = {};
    const lines = yamlContent.split('\n');
    let currentKey = '';
    let currentArray: any[] = [];
    let isInArray = false;
    let isInObject = false;
    const currentObject: any = {};
    let indentLevel = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      const leadingSpaces = line.length - line.trimStart().length;

      if (trimmedLine.startsWith('- ')) {
        // Array item
        if (!isInArray) {
          isInArray = true;
          currentArray = [];
        }

        const value = trimmedLine.substring(2).trim();
        if (value.includes(':')) {
          // Object in array
          const [objKey, objValue] = value.split(':').map(s => s.trim());
          const arrayObject: any = {};
          arrayObject[objKey] = this.parseValue(objValue);
          currentArray.push(arrayObject);
        } else {
          currentArray.push(this.parseValue(value));
        }
      } else if (trimmedLine.includes(':')) {
        // Key-value pair
        const colonIndex = trimmedLine.indexOf(':');
        const key = trimmedLine.substring(0, colonIndex).trim();
        const value = trimmedLine.substring(colonIndex + 1).trim();

        if (isInArray && leadingSpaces <= indentLevel) {
          result[currentKey] = currentArray;
          isInArray = false;
        }

        if (leadingSpaces === 0) {
          currentKey = key;
          indentLevel = leadingSpaces;

          if (value) {
            result[key] = this.parseValue(value);
          } else {
            // Might be start of nested structure
            isInArray = false;
            isInObject = false;
          }
        } else {
          // Nested property
          if (!result[currentKey]) {
            result[currentKey] = {};
          }
          result[currentKey][key] = this.parseValue(value);
        }
      }
    }

    // Handle remaining array
    if (isInArray) {
      result[currentKey] = currentArray;
    }

    return result;
  }

  /**
   * Parse individual YAML values
   */
  private parseValue(value: string): any {
    if (!value) return '';

    // Remove quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      return value.slice(1, -1);
    }

    // Boolean values
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (value === 'null') return null;

    // Numbers
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);

    return value;
  }

  /**
   * Get template filename for node type
   */
  private getTemplateFileName(nodeType: NodeType): string {
    const kebabCase = nodeType
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .substring(1);

    return `${kebabCase}.md`;
  }

  /**
   * Clear template cache
   */
  public clearCache(): void {
    this.templateCache.clear();
  }
}

export const templateService = TemplateService.getInstance();
