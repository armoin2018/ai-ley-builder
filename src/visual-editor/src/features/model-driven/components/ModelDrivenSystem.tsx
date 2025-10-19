/**
 * Main Model-Driven System Component
 */

import { useState } from 'react';
import type { FlowModel, ModelTemplate, NodeModel } from '../types';
import { CompilationPanel } from './CompilationPanel';
import { ExecutionPanel } from './ExecutionPanel';
import { ModelEditor } from './ModelEditor';

type ViewMode = 'editor' | 'compilation' | 'execution';

interface ModelDrivenSystemProps {
  className?: string;
}

export function ModelDrivenSystem({ className = '' }: ModelDrivenSystemProps) {
  const [currentModel, setCurrentModel] = useState<
    NodeModel | FlowModel | null
  >(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ModelTemplate | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('editor');

  const handleModelSave = (model: NodeModel | FlowModel) => {
    setCurrentModel(model);
    console.log('Model saved:', model);
    // In a real implementation, this would save to a backend or file system
  };

  const isFlowModel = (
    model: NodeModel | FlowModel | null
  ): model is FlowModel => {
    return model !== null && 'nodes' in model && 'connections' in model;
  };

  return (
    <div className={`h-full flex flex-col bg-gray-100 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Model-Driven AI Agent System
            </h1>
            <p className="text-sm text-gray-600">
              Design, compile, and execute AI agent instruction workflows
            </p>
          </div>

          {/* View Mode Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('editor')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'editor'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setViewMode('compilation')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'compilation'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Compilation
            </button>
            <button
              onClick={() => setViewMode('execution')}
              disabled={!isFlowModel(currentModel)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'execution'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : isFlowModel(currentModel)
                    ? 'text-gray-600 hover:text-gray-900'
                    : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              Execution
            </button>
          </div>
        </div>

        {/* Current Model Info */}
        {currentModel && (
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isFlowModel(currentModel) ? 'bg-purple-400' : 'bg-blue-400'
                }`}
              ></div>
              <span className="font-medium">
                {isFlowModel(currentModel) ? 'Flow' : 'Node'}:{' '}
                {currentModel.name}
              </span>
            </div>
            <div>ID: {currentModel.id}</div>
            <div>Version: {currentModel.version || '1.0.0'}</div>
            {isFlowModel(currentModel) && (
              <div>Nodes: {currentModel.nodes.length}</div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'editor' && (
          <div className="flex-1 p-6">
            <ModelEditor
              onSave={handleModelSave}
              initialTemplate={selectedTemplate || undefined}
            />
          </div>
        )}

        {viewMode === 'compilation' && (
          <div className="flex-1 p-6">
            <CompilationPanel model={currentModel} className="h-full" />
          </div>
        )}

        {viewMode === 'execution' && (
          <div className="flex-1 p-6">
            {isFlowModel(currentModel) ? (
              <ExecutionPanel flow={currentModel} className="h-full" />
            ) : (
              <div className="h-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 mb-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Flow Required</p>
                  <p className="text-sm">
                    Execution is only available for flow models
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Create or load a flow model to enable execution
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Model-Driven AI Agent Instruction System v1.0.0</span>
            {currentModel && (
              <span>Last modified: {new Date().toLocaleTimeString()}</span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>Status: Ready</span>
            {viewMode === 'execution' && isFlowModel(currentModel) && (
              <span>Execution available</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelDrivenSystem;
