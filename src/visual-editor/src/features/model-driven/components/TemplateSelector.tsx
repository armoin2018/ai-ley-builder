/**
 * Template selector component for choosing node/flow templates
 */

import { useState } from 'react';
import type { ModelTemplate } from '../types';

interface TemplateSelectorProps {
  templates: ModelTemplate[];
  selectedTemplate: ModelTemplate | null;
  onSelect: (template: ModelTemplate) => void;
}

export function TemplateSelector({
  templates,
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'node' | 'flow'>('all');

  // Filter templates based on search and type
  const filteredTemplates = templates.filter(template => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || template.type === filterType;

    return matchesSearch && matchesType;
  });

  // Group templates by type
  const nodeTemplates = filteredTemplates.filter(t => t.type === 'node');
  const flowTemplates = filteredTemplates.filter(t => t.type === 'flow');

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filterType === 'all'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilterType('node')}
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filterType === 'node'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Nodes
          </button>
          <button
            type="button"
            onClick={() => setFilterType('flow')}
            className={`px-3 py-1 text-xs font-medium rounded-full ${
              filterType === 'flow'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Flows
          </button>
        </div>
      </div>

      {/* Template Lists */}
      <div className="space-y-4">
        {nodeTemplates.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Node Templates
            </h3>
            <div className="space-y-1">
              {nodeTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => onSelect(template)}
                />
              ))}
            </div>
          </div>
        )}

        {flowTemplates.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Flow Templates
            </h3>
            <div className="space-y-1">
              {flowTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSelected={selectedTemplate?.id === template.id}
                  onSelect={() => onSelect(template)}
                />
              ))}
            </div>
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-2xl mb-2">🔍</div>
            <p className="text-sm">No templates found</p>
            {searchTerm && (
              <p className="text-xs mt-1">
                Try adjusting your search or filter
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: ModelTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const getTypeIcon = (type: string, nodeType?: string) => {
    if (type === 'flow') return '🔄';

    switch (nodeType) {
      case 'CommandPromptFile':
        return '📄';
      case 'LogicCondition':
        return '🔀';
      case 'OutputType':
        return '📤';
      case 'Loop':
        return '🔁';
      case 'CustomPromptText':
        return '✏️';
      case 'Persona':
        return '👤';
      case 'Instruction':
        return '📋';
      default:
        return '⚡';
    }
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="text-lg">
          {getTypeIcon(template.type, template.nodeType)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {template.name}
          </div>
          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
            {template.description}
          </div>
          <div className="flex items-center mt-2 space-x-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                template.type === 'node'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-purple-100 text-purple-800'
              }`}
            >
              {template.type}
            </span>
            {template.nodeType && (
              <span className="text-xs text-gray-400">{template.nodeType}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
