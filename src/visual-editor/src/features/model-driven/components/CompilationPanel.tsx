/**
 * Compilation panel component for converting models to PlantUML and markdown
 */

import { useEffect, useState } from 'react';
import {
  type CompilationOptions,
  type CompilationResult,
  compilationService,
} from '../services/compilationService';
import type { FlowModel, NodeModel } from '../types';

interface CompilationPanelProps {
  model: NodeModel | FlowModel | null;
  className?: string;
}

export function CompilationPanel({
  model,
  className = '',
}: CompilationPanelProps) {
  const [options, setOptions] = useState<CompilationOptions>({
    includeMetadata: true,
    diagramTheme: 'default',
    includeValidation: true,
    exportFormat: 'puml',
  });
  const [result, setResult] = useState<CompilationResult | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeTab, setActiveTab] = useState<'plantuml' | 'markdown'>(
    'plantuml'
  );

  // Auto-compile when model changes
  useEffect(() => {
    if (model) {
      compileModel();
    } else {
      setResult(null);
    }
  }, [model, options]);

  const compileModel = async () => {
    if (!model) return;

    setIsCompiling(true);
    try {
      const compilationResult = isNodeModel(model)
        ? compilationService.compileNode(model, options)
        : compilationService.compileFlow(model, options);

      setResult(compilationResult);
    } catch (error) {
      console.error('Compilation failed:', error);
      setResult({
        plantuml: '',
        markdown: '',
        errors: [
          `Compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        warnings: [],
      });
    } finally {
      setIsCompiling(false);
    }
  };

  const isNodeModel = (model: NodeModel | FlowModel): model is NodeModel => {
    return 'type' in model && 'inputs' in model && 'outputs' in model;
  };

  const handleDownload = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPlantUML = () => {
    if (result?.plantuml && model) {
      handleDownload(result.plantuml, `${model.id}.puml`, 'text/plain');
    }
  };

  const downloadMarkdown = () => {
    if (result?.markdown && model) {
      handleDownload(result.markdown, `${model.id}.md`, 'text/markdown');
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (!model) {
    return (
      <div
        className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}
      >
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg font-medium">No Model Selected</p>
          <p className="text-sm">Select a model to see compilation output</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Compilation Output
            </h3>
            <p className="text-sm text-gray-500">
              {isNodeModel(model) ? 'Node Model' : 'Flow Model'}: {model.name}
            </p>
          </div>
          {isCompiling && (
            <div className="animate-spin h-5 w-5 text-blue-500">
              <svg fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              value={options.diagramTheme}
              onChange={e =>
                setOptions(prev => ({
                  ...prev,
                  diagramTheme: e.target.value as any,
                }))
              }
              className="block w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="default">Default</option>
              <option value="cerulean">Cerulean</option>
              <option value="bluegray">Blue Gray</option>
              <option value="aws">AWS</option>
              <option value="azure">Azure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <select
              value={options.exportFormat}
              onChange={e =>
                setOptions(prev => ({
                  ...prev,
                  exportFormat: e.target.value as any,
                }))
              }
              className="block w-full text-xs border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="puml">PlantUML (.puml)</option>
              <option value="svg">SVG Image</option>
              <option value="png">PNG Image</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeMetadata}
                onChange={e =>
                  setOptions(prev => ({
                    ...prev,
                    includeMetadata: e.target.checked,
                  }))
                }
                className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-1 text-xs text-gray-700">
                Include Metadata
              </span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeValidation}
                onChange={e =>
                  setOptions(prev => ({
                    ...prev,
                    includeValidation: e.target.checked,
                  }))
                }
                className="text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-1 text-xs text-gray-700">
                Include Validation
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Error/Warning Messages */}
      {result && (result.errors.length > 0 || result.warnings.length > 0) && (
        <div className="px-4 py-3 border-b border-gray-200">
          {result.errors.length > 0 && (
            <div className="mb-2">
              <h4 className="text-sm font-medium text-red-800 mb-1">Errors:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-1">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.warnings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">
                Warnings:
              </h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-yellow-500 mr-1">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('plantuml')}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'plantuml'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            PlantUML
          </button>
          <button
            onClick={() => setActiveTab('markdown')}
            className={`py-2 px-4 text-sm font-medium border-b-2 ${
              activeTab === 'markdown'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Markdown
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="relative">
        {result && (
          <>
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 z-10 flex space-x-2">
              <button
                onClick={() =>
                  copyToClipboard(
                    activeTab === 'plantuml' ? result.plantuml : result.markdown
                  )
                }
                className="p-1 text-gray-400 hover:text-gray-600 bg-white rounded border border-gray-300 shadow-sm"
                title="Copy to clipboard"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
              <button
                onClick={
                  activeTab === 'plantuml' ? downloadPlantUML : downloadMarkdown
                }
                className="p-1 text-gray-400 hover:text-gray-600 bg-white rounded border border-gray-300 shadow-sm"
                title="Download file"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Code Content */}
            <div className="p-4">
              <pre className="text-xs text-gray-700 bg-gray-50 p-4 rounded border overflow-auto max-h-96 whitespace-pre-wrap">
                {activeTab === 'plantuml' ? result.plantuml : result.markdown}
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
