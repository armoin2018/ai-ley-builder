/**
 * Hook for generating form configurations from model templates
 */

import { useMemo } from 'react';
import type { FormField, ModelForm, ModelTemplate, NodeModel } from '../types';

export function useFormGenerator(
  template: ModelTemplate | null
): ModelForm | null {
  return useMemo(() => {
    if (!template || template.type !== 'node') {
      return null;
    }

    const nodeModel = template.template as NodeModel;

    return {
      title: `Create ${template.name}`,
      description: template.description,
      sections: [
        {
          title: 'Basic Information',
          description: 'Core node identification and metadata',
          fields: [
            {
              name: 'id',
              label: 'Node ID',
              type: 'text',
              required: true,
              description: 'Unique identifier for this node',
              placeholder: 'my-node-id',
              validation: {
                pattern: '^[a-zA-Z0-9-_]+$',
              },
            },
            {
              name: 'name',
              label: 'Display Name',
              type: 'text',
              required: true,
              description: 'Human-readable name for the node',
              placeholder: 'My Custom Node',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              required: true,
              description: "Detailed description of the node's purpose",
              placeholder: 'This node performs...',
            },
            {
              name: 'version',
              label: 'Version',
              type: 'text',
              required: false,
              description: 'Semantic version number',
              placeholder: '1.0.0',
              validation: {
                pattern: '^\\d+\\.\\d+\\.\\d+$',
              },
            },
          ],
        },
        {
          title: 'Properties',
          description: 'Node-specific configuration properties',
          fields: generatePropertyFields(
            nodeModel.properties,
            nodeModel.validation?.requiredProperties
          ),
        },
        {
          title: 'Input Ports',
          description: 'Define input connections for this node',
          fields: [
            {
              name: 'inputs',
              label: 'Input Definitions',
              type: 'array',
              required: false,
              description: 'Input ports that this node accepts',
            },
          ],
        },
        {
          title: 'Output Ports',
          description: 'Define output connections for this node',
          fields: [
            {
              name: 'outputs',
              label: 'Output Definitions',
              type: 'array',
              required: false,
              description: 'Output ports that this node provides',
            },
          ],
        },
        {
          title: 'Metadata',
          description: 'Additional node metadata and styling',
          fields: [
            {
              name: 'icon',
              label: 'Icon',
              type: 'select',
              required: false,
              description: 'Icon for visual representation',
              options: [
                { value: 'file-text', label: 'File Text' },
                { value: 'git-branch', label: 'Branch' },
                { value: 'download', label: 'Download' },
                { value: 'repeat', label: 'Repeat' },
                { value: 'edit-3', label: 'Edit' },
                { value: 'user', label: 'User' },
                { value: 'list', label: 'List' },
              ],
            },
            {
              name: 'color',
              label: 'Color',
              type: 'text',
              required: false,
              description: 'Hex color code for the node',
              placeholder: '#3B82F6',
              validation: {
                pattern: '^#[0-9A-Fa-f]{6}$',
              },
            },
            {
              name: 'category',
              label: 'Category',
              type: 'select',
              required: false,
              description: 'Category for organizing nodes',
              options: [
                { value: 'Prompts', label: 'Prompts' },
                { value: 'Logic', label: 'Logic' },
                { value: 'Outputs', label: 'Outputs' },
                { value: 'Control Flow', label: 'Control Flow' },
                { value: 'AI Characters', label: 'AI Characters' },
                { value: 'Instructions', label: 'Instructions' },
                { value: 'Custom', label: 'Custom' },
              ],
            },
            {
              name: 'tags',
              label: 'Tags',
              type: 'array',
              required: false,
              description: 'Tags for searchability',
            },
          ],
        },
      ],
    };
  }, [template]);
}

function generatePropertyFields(
  properties: Record<string, unknown>,
  requiredProperties: string[] = []
): FormField[] {
  const fields: FormField[] = [];

  for (const [key, value] of Object.entries(properties)) {
    const field: FormField = {
      name: key,
      label: formatLabel(key),
      type: inferFieldType(value),
      required: requiredProperties.includes(key),
      description: `Configure ${formatLabel(key).toLowerCase()}`,
    };

    // Add type-specific configuration
    switch (field.type) {
      case 'select':
        field.options = getSelectOptions(key, value);
        break;
      case 'number':
        if (key.includes('max') || key.includes('limit')) {
          field.validation = { min: 1, max: 10000 };
        }
        break;
      case 'text':
        if (key.includes('path') || key.includes('file')) {
          field.placeholder = 'path/to/file.md';
        } else if (key.includes('expr') || key.includes('expression')) {
          field.placeholder = 'data.property === "value"';
        }
        break;
      case 'textarea':
        if (key.includes('template') || key.includes('content')) {
          field.placeholder = 'Enter template content with {{variables}}';
        }
        break;
    }

    fields.push(field);
  }

  return fields;
}

function inferFieldType(value: unknown): FormField['type'] {
  if (typeof value === 'boolean') {
    return 'boolean';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'object' && value !== null) {
    return 'object';
  }

  if (typeof value === 'string') {
    // Heuristics for textarea vs text
    if (value.length > 100 || value.includes('\n') || value.includes('{{')) {
      return 'textarea';
    }
    return 'text';
  }

  return 'text';
}

function getSelectOptions(
  key: string,
  value: unknown
): { value: string; label: string }[] {
  // Predefined options for common fields
  const optionsMap: Record<string, { value: string; label: string }[]> = {
    format: [
      { value: 'markdown', label: 'Markdown' },
      { value: 'json', label: 'JSON' },
      { value: 'plantuml', label: 'PlantUML' },
      { value: 'csv', label: 'CSV' },
      { value: 'html', label: 'HTML' },
      { value: 'text', label: 'Plain Text' },
      { value: 'custom', label: 'Custom' },
    ],
    mode: [
      { value: 'strict', label: 'Strict' },
      { value: 'advisory', label: 'Advisory' },
    ],
    contextMode: [
      { value: 'prepend', label: 'Prepend' },
      { value: 'append', label: 'Append' },
      { value: 'wrap', label: 'Wrap' },
    ],
    aggregation: [
      { value: 'single', label: 'Single' },
      { value: 'merge', label: 'Merge' },
      { value: 'concatenate', label: 'Concatenate' },
      { value: 'join', label: 'Join' },
    ],
  };

  if (optionsMap[key]) {
    return optionsMap[key];
  }

  // If it's a string with limited known values, create options
  if (typeof value === 'string' && value.length < 50) {
    return [{ value: value, label: formatLabel(value) }];
  }

  return [];
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/\s+/g, ' ')
    .trim();
}
