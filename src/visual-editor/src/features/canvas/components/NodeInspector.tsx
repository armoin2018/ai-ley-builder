import { useCallback, useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button, PromptDropdown, PersonaDropdown, InstructionDropdown } from '../../../shared/components';
import { NodeType } from '../../../types/nodes';
import { cn } from '../../../utils';
import { useWorkflow } from '../../workflow';
import { useValidation } from '../../validation/hooks/useValidation';
import type { Node } from '@xyflow/react';
import type { PromptFile } from '../../../services/promptService';
import type { PersonaFile, InstructionFile } from '../../../services/fileSystem';

interface NodeInspectorProps {
  className?: string;
}

interface PropertyFieldProps {
  label: string;
  value: string | number | boolean | string[];
  onChange: (value: any) => void;
  type?: 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'tags';
  options?: string[];
  placeholder?: string;
}

function PropertyField({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder,
}: PropertyFieldProps) {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const newValue =
      type === 'number' ? parseFloat(e.target.value) : e.target.value;
    onChange(newValue);
  };

  const handleBooleanChange = (checked: boolean) => {
    onChange(checked);
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);
    onChange(tags);
  };

  switch (type) {
    case 'textarea':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <textarea
            value={value as string}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <input
            type="number"
            value={value as number}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <select
            value={value as string}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={e => handleBooleanChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-slate-700">{label}</label>
        </div>
      );

    case 'tags':
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <input
            type="text"
            value={Array.isArray(value) ? value.join(', ') : ''}
            onChange={handleTagsChange}
            placeholder={placeholder || 'Enter comma-separated tags'}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {Array.isArray(value) && value.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {value.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <input
            type="text"
            value={value as string}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      );
  }
}

export function NodeInspector({ className }: NodeInspectorProps) {
  const { getNodes, setNodes, getEdges } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { markAsModified } = useWorkflow();
  const { validateNode } = useValidation();

  // Listen for node selection changes
  useEffect(() => {
    const interval = setInterval(() => {
      const nodes = getNodes();
      const selected = nodes.find(node => node.selected);
      if (selected?.id !== selectedNode?.id) {
        setSelectedNode(selected || null);
      } else if (selected && selectedNode) {
        // Update the selected node data if it has changed
        const hasDataChanged = JSON.stringify(selected.data) !== JSON.stringify(selectedNode.data);
        if (hasDataChanged) {
          setSelectedNode(selected);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [getNodes, selectedNode]);

  const updateNodeData = useCallback(
    (path: string, value: any) => {
      if (!selectedNode) return;

      const updatedNodes = getNodes().map(node => {
        if (node.id === selectedNode.id) {
          const updatedData = { ...node.data };
          const pathArray = path.split('.');

          if (pathArray.length === 1) {
            updatedData[pathArray[0]] = value;
          } else if (
            pathArray.length === 2 &&
            pathArray[0] === 'properties'
          ) {
            updatedData.properties = {
              ...(updatedData.properties || {}),
              [pathArray[1]]: value,
            };
          }

          const updatedNode = {
            ...node,
            data: updatedData,
          };

          // Update the local selected node state immediately
          setSelectedNode(updatedNode);
          
          return updatedNode;
        }
        return node;
      });

      setNodes(updatedNodes);
      markAsModified();
    },
    [selectedNode, setNodes, markAsModified, getNodes]
  );

  // Helper function to safely get property values with defaults
  const getProperty = (key: string, defaultValue: any = '') => {
    if (!selectedNode?.data?.properties) return defaultValue;
    const properties = selectedNode.data.properties as Record<string, any>;
    return properties[key] ?? defaultValue;
  };

  const renderNodeProperties = () => {
    if (!selectedNode) return null;

    const nodeType = selectedNode.type as NodeType;

    switch (nodeType) {
      case NodeType.COMMAND_PROMPT_FILE:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Prompt</label>
              <PromptDropdown
                selectedPromptId={getProperty('selectedPromptId', '')}
                onSelect={(prompt: PromptFile) => {
                  // Update both fileName and content in a single operation
                  if (!selectedNode) return;
                  
                  const updatedNodes = getNodes().map(node => {
                    if (node.id === selectedNode.id) {
                      const updatedData = { ...node.data };
                      updatedData.properties = {
                        ...(updatedData.properties || {}),
                        fileName: `${prompt.name}.md`,
                        content: prompt.description,
                        selectedPromptId: prompt.id,
                        selectedPromptName: prompt.displayName,
                      };

                      const updatedNode = {
                        ...node,
                        data: updatedData,
                      };

                      // Update the local selected node state immediately
                      setSelectedNode(updatedNode);
                      
                      return updatedNode;
                    }
                    return node;
                  });

                  setNodes(updatedNodes);
                  markAsModified();
                }}
                placeholder="Choose a prompt file..."
              />
            </div>
            <PropertyField
              label="File Name"
              value={getProperty('fileName', '')}
              onChange={value => updateNodeData('properties.fileName', value)}
              placeholder="e.g., prompt.md"
            />
            <PropertyField
              label="Content"
              value={getProperty('content', '')}
              onChange={value => updateNodeData('properties.content', value)}
              type="textarea"
              placeholder="Enter file content..."
            />
            <PropertyField
              label="Variables"
              value={getProperty('variables', [])}
              onChange={value => updateNodeData('properties.variables', value)}
              type="tags"
              placeholder="variable1, variable2"
            />
          </div>
        );

      case NodeType.CUSTOM_PROMPT_TEXT:
        return (
          <div className="space-y-4">
            <PropertyField
              label="Prompt Text"
              value={getProperty('promptText', '')}
              onChange={value => updateNodeData('properties.promptText', value)}
              type="textarea"
              placeholder="Enter your custom prompt..."
            />
            <PropertyField
              label="Variables"
              value={getProperty('variables', [])}
              onChange={value => updateNodeData('properties.variables', value)}
              type="tags"
              placeholder="variable1, variable2"
            />
          </div>
        );

      case NodeType.PERSONA:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Persona</label>
              <PersonaDropdown
                selectedPersonaId={getProperty('selectedPersonaId', '')}
                onSelect={(persona: PersonaFile) => {
                  // Update both persona properties and content in a single operation
                  if (!selectedNode) return;
                  
                  const updatedNodes = getNodes().map(node => {
                    if (node.id === selectedNode.id) {
                      const updatedData = { ...node.data };
                      updatedData.properties = {
                        ...(updatedData.properties || {}),
                        selectedPersonaId: persona.id,
                        selectedPersonaName: persona.name,
                        personaType: persona.name,
                        personaContent: persona.content,
                      };

                      const updatedNode = {
                        ...node,
                        data: updatedData,
                      };

                      // Update the local selected node state immediately
                      setSelectedNode(updatedNode);
                      
                      return updatedNode;
                    }
                    return node;
                  });

                  setNodes(updatedNodes);
                  markAsModified();
                }}
                placeholder="Choose a persona..."
              />
            </div>
            <PropertyField
              label="Persona Type"
              value={getProperty('personaType', '')}
              onChange={value =>
                updateNodeData('properties.personaType', value)
              }
              placeholder="e.g., Expert Assistant"
            />
            <PropertyField
              label="Persona Content"
              value={getProperty('personaContent', '')}
              onChange={value =>
                updateNodeData('properties.personaContent', value)
              }
              type="textarea"
              placeholder="Persona definition..."
            />
            <PropertyField
              label="Tone"
              value={getProperty('tone', 'professional')}
              onChange={value => updateNodeData('properties.tone', value)}
              type="select"
              options={['professional', 'casual', 'formal', 'friendly']}
            />
            <PropertyField
              label="Expertise"
              value={getProperty('expertise', [])}
              onChange={value => updateNodeData('properties.expertise', value)}
              type="tags"
              placeholder="skill1, skill2"
            />
            <PropertyField
              label="Characteristics"
              value={getProperty('characteristics', [])}
              onChange={value =>
                updateNodeData('properties.characteristics', value)
              }
              type="tags"
              placeholder="trait1, trait2"
            />
          </div>
        );

      case NodeType.INSTRUCTION:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Instruction</label>
              <InstructionDropdown
                selectedInstructionId={getProperty('selectedInstructionId', '')}
                onSelect={(instruction: InstructionFile) => {
                  // Update both instruction properties and content in a single operation
                  if (!selectedNode) return;
                  
                  const updatedNodes = getNodes().map(node => {
                    if (node.id === selectedNode.id) {
                      const updatedData = { ...node.data };
                      updatedData.properties = {
                        ...(updatedData.properties || {}),
                        selectedInstructionId: instruction.id,
                        selectedInstructionName: instruction.name,
                        instructionText: instruction.content,
                      };

                      const updatedNode = {
                        ...node,
                        data: updatedData,
                      };

                      // Update the local selected node state immediately
                      setSelectedNode(updatedNode);
                      
                      return updatedNode;
                    }
                    return node;
                  });

                  setNodes(updatedNodes);
                  markAsModified();
                }}
                placeholder="Choose an instruction..."
              />
            </div>
            <PropertyField
              label="Instruction Text"
              value={getProperty('instructionText', '')}
              onChange={value =>
                updateNodeData('properties.instructionText', value)
              }
              type="textarea"
              placeholder="Enter system instructions..."
            />
            <PropertyField
              label="Priority"
              value={getProperty('priority', 'medium')}
              onChange={value => updateNodeData('properties.priority', value)}
              type="select"
              options={['low', 'medium', 'high', 'critical']}
            />
          </div>
        );

      case NodeType.LOGIC_CONDITION:
        return (
          <div className="space-y-4">
            <PropertyField
              label="Condition"
              value={getProperty('condition', '')}
              onChange={value => updateNodeData('properties.condition', value)}
              placeholder="e.g., input != null"
            />
            <PropertyField
              label="True Label"
              value={getProperty('trueLabel', 'True')}
              onChange={value => updateNodeData('properties.trueLabel', value)}
            />
            <PropertyField
              label="False Label"
              value={getProperty('falseLabel', 'False')}
              onChange={value => updateNodeData('properties.falseLabel', value)}
            />
          </div>
        );

      case NodeType.LOOP:
        return (
          <div className="space-y-4">
            <PropertyField
              label="Loop Type"
              value={getProperty('loopType', 'for')}
              onChange={value => updateNodeData('properties.loopType', value)}
              type="select"
              options={['for', 'while', 'forEach']}
            />
            <PropertyField
              label="Max Iterations"
              value={getProperty('maxIterations', 10)}
              onChange={value =>
                updateNodeData('properties.maxIterations', value)
              }
              type="number"
            />
            <PropertyField
              label="Iterator Variable"
              value={getProperty('iteratorVariable', 'i')}
              onChange={value =>
                updateNodeData('properties.iteratorVariable', value)
              }
              placeholder="e.g., i, item"
            />
            <PropertyField
              label="Condition"
              value={getProperty('condition', '')}
              onChange={value => updateNodeData('properties.condition', value)}
              placeholder="Loop condition (for while loops)"
            />
          </div>
        );

      case NodeType.OUTPUT_TYPE:
        return (
          <div className="space-y-4">
            <PropertyField
              label="Output Type"
              value={getProperty('outputType', 'text')}
              onChange={value => updateNodeData('properties.outputType', value)}
              type="select"
              options={['text', 'json', 'xml', 'csv', 'markdown', 'html']}
            />
            <PropertyField
              label="Format"
              value={getProperty('format', 'structured')}
              onChange={value => updateNodeData('properties.format', value)}
              type="select"
              options={['structured', 'raw', 'formatted', 'compressed']}
            />
            <PropertyField
              label="Template"
              value={getProperty('template', '')}
              onChange={value => updateNodeData('properties.template', value)}
              type="textarea"
              placeholder="Output template..."
            />
          </div>
        );

      default:
        return (
          <p className="text-sm text-slate-500">
            No properties available for this node type.
          </p>
        );
    }
  };

  // Get validation status for selected node
  const nodeValidation = selectedNode
    ? validateNode(selectedNode, getNodes(), getEdges())
    : null;

  return (
    <div
      className={cn(
        'w-72 bg-white border-l border-slate-200 overflow-y-auto',
        'flex flex-col h-full shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Node Inspector
          </h2>
          {selectedNode && nodeValidation && (
            <div className="flex items-center gap-1">
              {nodeValidation.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 mt-1">
          {selectedNode
            ? 'Edit node properties'
            : 'Select a node to edit properties'}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1">
        {selectedNode ? (
          <div className="p-4 space-y-6">
            {/* Node Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                Node Information
              </h3>
              <div className="space-y-3">
                <PropertyField
                  label="Label"
                  value={(selectedNode.data.label as string) || ''}
                  onChange={value => updateNodeData('label', value)}
                  placeholder="Node label"
                />
                <PropertyField
                  label="Description"
                  value={(selectedNode.data.description as string) || ''}
                  onChange={value => updateNodeData('description', value)}
                  type="textarea"
                  placeholder="Node description..."
                />
              </div>
            </div>

            {/* Validation Status */}
            {nodeValidation && !nodeValidation.isValid && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                  Validation Issues
                </h3>
                <div className="space-y-2">
                  {nodeValidation.errors.map((error, index) => (
                    <div
                      key={`error-${index}`}
                      className="p-3 bg-red-50 border border-red-200 rounded-md"
                    >
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-red-800 mb-1">
                            {error.message}
                          </div>
                          {error.suggestedFix && (
                            <div className="text-xs text-red-700">
                              💡 {error.suggestedFix}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {nodeValidation.warnings.map((warning, index) => (
                    <div
                      key={`warning-${index}`}
                      className="p-3 bg-amber-50 border border-amber-200 rounded-md"
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-amber-800 mb-1">
                            {warning.message}
                          </div>
                          {warning.suggestedFix && (
                            <div className="text-xs text-amber-700">
                              💡 {warning.suggestedFix}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Node Properties */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
                Properties
              </h3>
              {renderNodeProperties()}
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // Reset to default properties
                    setNodes(nodes =>
                      nodes.map(node => {
                        if (node.id === selectedNode.id) {
                          return {
                            ...node,
                            selected: false,
                          };
                        }
                        return node;
                      })
                    );
                  }}
                  className="flex-1"
                >
                  Deselect
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    // Delete node
                    setNodes(nodes =>
                      nodes.filter(node => node.id !== selectedNode.id)
                    );
                  }}
                  className="flex-1"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">
            <div className="mt-8">
              <svg
                className="mx-auto h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-slate-900">
                No node selected
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Click on a node in the canvas to view and edit its properties.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
