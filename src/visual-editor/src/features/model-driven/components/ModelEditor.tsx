/**
 * Main model editor component for creating and editing node/flow models
 */

import { useEffect, useState } from 'react';
import { useFormGenerator } from '../hooks/useFormGenerator';
import { templateService } from '../services/templateService';
import type { FlowModel, ModelTemplate, NodeModel } from '../types';
import { ModelForm } from './ModelForm';
import { ModelPreview } from './ModelPreview';
import { TemplateSelector } from './TemplateSelector';

interface ModelEditorProps {
  onSave?: (model: NodeModel | FlowModel) => void;
  onCancel?: () => void;
  initialTemplate?: ModelTemplate;
}

export function ModelEditor({
  onSave,
  onCancel,
  initialTemplate,
}: ModelEditorProps) {
  const [templates, setTemplates] = useState<ModelTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ModelTemplate | null>(initialTemplate || null);
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formConfig = useFormGenerator(selectedTemplate);

  // Load templates on mount
  useEffect(() => {
    async function loadTemplates() {
      try {
        setIsLoading(true);
        const [nodeTemplates, flowTemplates] = await Promise.all([
          templateService.loadNodeTemplates(),
          templateService.loadFlowTemplates(),
        ]);
        setTemplates([...nodeTemplates, ...flowTemplates]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load templates'
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadTemplates();
  }, []);

  // Initialize form data when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialData = getInitialFormData(selectedTemplate);
      setFormData(initialData);
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template: ModelTemplate) => {
    setSelectedTemplate(template);
    setError(null);
  };

  const handleFormChange = (data: Record<string, unknown>) => {
    setFormData(data);
  };

  const handleSave = () => {
    if (!selectedTemplate || !formConfig) {
      return;
    }

    try {
      const model = createModelFromFormData(selectedTemplate, formData);
      onSave?.(model);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create model');
    }
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    setFormData({});
    onCancel?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="bg-red-100 px-2 py-1 text-sm font-medium text-red-800 rounded-md hover:bg-red-200"
                onClick={() => setError(null)}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Template Selection Sidebar */}
      <div className="w-1/3 border-r border-gray-200 bg-gray-50">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Select Template
          </h2>
          <TemplateSelector
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelect={handleTemplateSelect}
          />
        </div>
      </div>

      {/* Form Editor */}
      <div className="flex-1 flex">
        {selectedTemplate && formConfig ? (
          <>
            {/* Form */}
            <div className="w-1/2 p-4 overflow-y-auto">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {formConfig.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {formConfig.description}
                </p>
              </div>

              <ModelForm
                config={formConfig}
                data={formData}
                onChange={handleFormChange}
              />

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                >
                  Create Model
                </button>
              </div>
            </div>

            {/* Preview */}
            <div className="w-1/2 p-4 border-l border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preview
              </h3>
              <ModelPreview template={selectedTemplate} formData={formData} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg font-medium">
                Select a template to get started
              </p>
              <p className="text-sm mt-2">
                Choose from the available node or flow templates to create your
                model
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get initial form data from template
 */
function getInitialFormData(template: ModelTemplate): Record<string, unknown> {
  if (template.type === 'node') {
    const nodeModel = template.template as NodeModel;
    return {
      id: '',
      name: '',
      description: '',
      version: nodeModel.version || '1.0.0',
      ...nodeModel.properties,
      inputs: nodeModel.inputs,
      outputs: nodeModel.outputs,
      icon: nodeModel.metadata?.icon || '',
      color: nodeModel.metadata?.color || '#3B82F6',
      category: nodeModel.metadata?.category || '',
      tags: nodeModel.metadata?.tags || [],
    };
  } else {
    const flowModel = template.template as FlowModel;
    return {
      id: '',
      name: '',
      description: '',
      version: flowModel.version || '1.0.0',
      nodes: flowModel.nodes,
      connections: flowModel.connections,
      category: flowModel.metadata?.category || '',
      tags: flowModel.metadata?.tags || [],
    };
  }
}

/**
 * Create model from form data
 */
function createModelFromFormData(
  template: ModelTemplate,
  formData: Record<string, unknown>
): NodeModel | FlowModel {
  if (template.type === 'node') {
    const nodeModel = template.template as NodeModel;

    return {
      ...nodeModel,
      id: formData.id as string,
      name: formData.name as string,
      description: formData.description as string,
      version: (formData.version as string) || '1.0.0',
      properties: extractProperties(formData, nodeModel.properties),
      inputs: (formData.inputs as NodeModel['inputs']) || nodeModel.inputs,
      outputs: (formData.outputs as NodeModel['outputs']) || nodeModel.outputs,
      metadata: {
        ...nodeModel.metadata,
        icon: formData.icon as string,
        color: formData.color as string,
        category: formData.category as string,
        tags: formData.tags as string[],
        modified: new Date().toISOString(),
      },
    };
  } else {
    const flowModel = template.template as FlowModel;

    return {
      ...flowModel,
      id: formData.id as string,
      name: formData.name as string,
      description: formData.description as string,
      version: (formData.version as string) || '1.0.0',
      nodes: (formData.nodes as FlowModel['nodes']) || flowModel.nodes,
      connections:
        (formData.connections as FlowModel['connections']) ||
        flowModel.connections,
      metadata: {
        ...flowModel.metadata,
        category: formData.category as string,
        tags: formData.tags as string[],
        modified: new Date().toISOString(),
      },
    };
  }
}

/**
 * Extract properties from form data
 */
function extractProperties(
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
