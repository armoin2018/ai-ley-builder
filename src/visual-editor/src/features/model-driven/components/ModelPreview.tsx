/**
 * Preview component showing the generated model
 */

import { useMemo } from 'react';
import type { FlowModel, ModelTemplate, NodeModel } from '../types';

interface ModelPreviewProps {
  template: ModelTemplate;
  formData: Record<string, unknown>;
}

export function ModelPreview({ template, formData }: ModelPreviewProps) {
  const previewModel = useMemo(() => {
    if (template.type === 'node') {
      return createNodePreview(template, formData);
    } else {
      return createFlowPreview(template, formData);
    }
  }, [template, formData]);

  return (
    <div className="space-y-4">
      {/* Model Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Model Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-gray-700">ID:</span>{' '}
            <span className="text-gray-900">
              {String(formData.id || 'Not set')}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Name:</span>{' '}
            <span className="text-gray-900">
              {String(formData.name || 'Not set')}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Type:</span>{' '}
            <span className="text-gray-900">{template.type}</span>
            {template.nodeType && (
              <span className="ml-1 text-gray-500">({template.nodeType})</span>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-700">Version:</span>{' '}
            <span className="text-gray-900">
              {String(formData.version || '1.0.0')}
            </span>
          </div>
        </div>
      </div>

      {/* Properties Preview */}
      {template.type === 'node' && (
        <NodePropertiesPreview
          nodeModel={previewModel as NodeModel}
          formData={formData}
        />
      )}

      {/* JSON Preview */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 py-2 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Generated Model</h4>
        </div>
        <div className="p-4">
          <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-gray-50 p-3 rounded">
            {JSON.stringify(previewModel, null, 2)}
          </pre>
        </div>
      </div>

      {/* Markdown Preview */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 py-2 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900">Markdown Output</h4>
        </div>
        <div className="p-4">
          <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-gray-50 p-3 rounded whitespace-pre-wrap">
            {generateMarkdown(previewModel, template)}
          </pre>
        </div>
      </div>
    </div>
  );
}

interface NodePropertiesPreviewProps {
  nodeModel: NodeModel;
  formData: Record<string, unknown>;
}

function NodePropertiesPreview({
  nodeModel,
  formData,
}: NodePropertiesPreviewProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Node Configuration
      </h4>

      <div className="space-y-3">
        {/* Properties */}
        {Object.keys(nodeModel.properties).length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-2">
              Properties
            </h5>
            <div className="space-y-1 text-xs">
              {Object.entries(nodeModel.properties).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium text-gray-600 w-24">{key}:</span>
                  <span className="text-gray-900 flex-1">
                    {typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inputs */}
        {nodeModel.inputs.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-2">
              Input Ports
            </h5>
            <div className="space-y-1 text-xs">
              {nodeModel.inputs.map(input => (
                <div key={input.id} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  <span className="font-medium">{input.name}</span>
                  <span className="text-gray-500">({input.type})</span>
                  {input.required && (
                    <span className="text-red-500 text-xs">*</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Outputs */}
        {nodeModel.outputs.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-2">
              Output Ports
            </h5>
            <div className="space-y-1 text-xs">
              {nodeModel.outputs.map(output => (
                <div key={output.id} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="font-medium">{output.name}</span>
                  <span className="text-gray-500">({output.type})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Style */}
        <div>
          <h5 className="text-xs font-medium text-gray-700 mb-2">
            Visual Style
          </h5>
          <div className="flex items-center space-x-4 text-xs">
            {formData.icon && (
              <div className="flex items-center space-x-1">
                <span>Icon:</span>
                <span className="font-medium">{String(formData.icon) as React.ReactNode}</span>
              </div>
            )}
            {formData.color && (
              <div className="flex items-center space-x-1">
                <span>Color:</span>
                <div
                  className="w-4 h-4 rounded border border-gray-300"
                  style={{ backgroundColor: String(formData.color) }}
                ></div>
                <span className="font-medium">{String(formData.color) as React.ReactNode}</span>
              </div>
            )}
            {formData.category && (
              <div className="flex items-center space-x-1">
                <span>Category:</span>
                <span className="font-medium">{String(formData.category) as React.ReactNode}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function createNodePreview(
  template: ModelTemplate,
  formData: Record<string, unknown>
): NodeModel {
  const nodeTemplate = template.template as NodeModel;

  return {
    id: (formData.id as string) || 'preview-node',
    type: nodeTemplate.type,
    name: (formData.name as string) || 'Preview Node',
    description: (formData.description as string) || 'Preview description',
    version: (formData.version as string) || '1.0.0',
    properties: extractNodeProperties(formData, nodeTemplate.properties),
    inputs: (formData.inputs as NodeModel['inputs']) || nodeTemplate.inputs,
    outputs: (formData.outputs as NodeModel['outputs']) || nodeTemplate.outputs,
    metadata: {
      icon: (formData.icon as string) || nodeTemplate.metadata?.icon,
      color: (formData.color as string) || nodeTemplate.metadata?.color,
      category:
        (formData.category as string) || nodeTemplate.metadata?.category,
      tags: (formData.tags as string[]) || nodeTemplate.metadata?.tags || [],
      author: 'Model Editor',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    },
    validation: nodeTemplate.validation,
  };
}

function createFlowPreview(
  template: ModelTemplate,
  formData: Record<string, unknown>
): FlowModel {
  const flowTemplate = template.template as FlowModel;

  return {
    id: (formData.id as string) || 'preview-flow',
    name: (formData.name as string) || 'Preview Flow',
    description: (formData.description as string) || 'Preview description',
    version: (formData.version as string) || '1.0.0',
    nodes: (formData.nodes as FlowModel['nodes']) || flowTemplate.nodes,
    connections:
      (formData.connections as FlowModel['connections']) ||
      flowTemplate.connections,
    metadata: {
      category:
        (formData.category as string) || flowTemplate.metadata?.category,
      tags: (formData.tags as string[]) || flowTemplate.metadata?.tags || [],
      author: 'Model Editor',
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      executionConfig: flowTemplate.metadata?.executionConfig,
    },
    dependencies: flowTemplate.dependencies,
    validation: flowTemplate.validation,
  };
}

function extractNodeProperties(
  formData: Record<string, unknown>,
  templateProperties: Record<string, unknown>
): Record<string, unknown> {
  const properties: Record<string, unknown> = {};

  // Copy template property keys from form data
  for (const key of Object.keys(templateProperties)) {
    if (key in formData) {
      properties[key] = formData[key];
    }
  }

  return properties;
}

function generateMarkdown(
  model: NodeModel | FlowModel,
  template: ModelTemplate
): string {
  const frontmatter = `---
${Object.entries(model)
  .map(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      return `${key}: ${JSON.stringify(value, null, 2).replace(/\n/g, '\n  ')}`;
    }
    return `${key}: ${JSON.stringify(value)}`;
  })
  .join('\n')}
---`;

  const content = `
# ${model.name}

## Description
${model.description}

## Features
${template.type === 'node' ? 'Node-specific functionality' : 'Flow-specific functionality'}

## Usage
This ${template.type} can be used in AI agent instruction workflows.

## Configuration
Configure the properties as needed for your specific use case.
`;

  return `${frontmatter}\n${content}`;
}
