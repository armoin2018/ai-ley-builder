/**
 * Hook for compilation functionality
 */

import { useCallback, useMemo, useState } from 'react';
import {
  type CompilationOptions,
  type CompilationResult,
  compilationService,
} from '../services/compilationService';
import type { FlowModel, NodeModel } from '../types';

export interface UseCompilationOptions {
  autoCompile?: boolean;
  defaultOptions?: Partial<CompilationOptions>;
}

export function useCompilation(options: UseCompilationOptions = {}) {
  const { defaultOptions = {} } = options;

  const [compilationOptions, setCompilationOptions] =
    useState<CompilationOptions>({
      includeMetadata: true,
      diagramTheme: 'default',
      includeValidation: true,
      exportFormat: 'puml',
      ...defaultOptions,
    });

  const [results, setResults] = useState<Map<string, CompilationResult>>(
    new Map()
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const compileModel = useCallback(
    (
      model: NodeModel | FlowModel,
      customOptions?: Partial<CompilationOptions>
    ): Promise<CompilationResult> => {
      setIsCompiling(true);
      setErrors([]);

      try {
        const finalOptions = { ...compilationOptions, ...customOptions };

        let result: CompilationResult;
        if (isNodeModel(model)) {
          result = compilationService.compileNode(model, finalOptions);
        } else {
          result = compilationService.compileFlow(model, finalOptions);
        }

        // Cache the result
        setResults(prev => new Map(prev).set(model.id, result));

        return Promise.resolve(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown compilation error';
        setErrors([errorMessage]);

        const errorResult: CompilationResult = {
          plantuml: '',
          markdown: '',
          errors: [errorMessage],
          warnings: [],
        };

        setResults(prev => new Map(prev).set(model.id, errorResult));
        return Promise.resolve(errorResult);
      } finally {
        setIsCompiling(false);
      }
    },
    [compilationOptions]
  );

  const getResult = useCallback(
    (modelId: string): CompilationResult | undefined => {
      return results.get(modelId);
    },
    [results]
  );

  const clearResults = useCallback(() => {
    setResults(new Map());
    setErrors([]);
  }, []);

  const clearResult = useCallback((modelId: string) => {
    setResults(prev => {
      const newResults = new Map(prev);
      newResults.delete(modelId);
      return newResults;
    });
  }, []);

  const updateOptions = useCallback(
    (newOptions: Partial<CompilationOptions>) => {
      setCompilationOptions(prev => ({ ...prev, ...newOptions }));
    },
    []
  );

  const compileMultiple = useCallback(
    async (
      models: (NodeModel | FlowModel)[],
      customOptions?: Partial<CompilationOptions>
    ): Promise<Map<string, CompilationResult>> => {
      setIsCompiling(true);
      const compilationResults = new Map<string, CompilationResult>();

      try {
        // Compile models in parallel
        const promises = models.map(async model => {
          const result = await compileModel(model, customOptions);
          return [model.id, result] as const;
        });

        const results = await Promise.allSettled(promises);

        for (const result of results) {
          if (result.status === 'fulfilled') {
            const [modelId, compilationResult] = result.value;
            compilationResults.set(modelId, compilationResult);
          }
        }

        return compilationResults;
      } finally {
        setIsCompiling(false);
      }
    },
    [compileModel]
  );

  const exportResult = useCallback(
    (modelId: string, format: 'plantuml' | 'markdown', filename?: string) => {
      const result = results.get(modelId);
      if (!result) return;

      const content = format === 'plantuml' ? result.plantuml : result.markdown;
      const defaultFilename = `${modelId}.${format === 'plantuml' ? 'puml' : 'md'}`;
      const finalFilename = filename || defaultFilename;

      const mimeType = format === 'plantuml' ? 'text/plain' : 'text/markdown';

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [results]
  );

  const exportAll = useCallback(
    (format: 'plantuml' | 'markdown') => {
      for (const [modelId] of results) {
        exportResult(modelId, format);
      }
    },
    [results, exportResult]
  );

  const getStatistics = useMemo(() => {
    const stats = {
      totalModels: results.size,
      modelsWithErrors: 0,
      modelsWithWarnings: 0,
      totalErrors: 0,
      totalWarnings: 0,
    };

    for (const result of results.values()) {
      if (result.errors.length > 0) {
        stats.modelsWithErrors++;
        stats.totalErrors += result.errors.length;
      }
      if (result.warnings.length > 0) {
        stats.modelsWithWarnings++;
        stats.totalWarnings += result.warnings.length;
      }
    }

    return stats;
  }, [results]);

  const isNodeModel = (model: NodeModel | FlowModel): model is NodeModel => {
    return 'type' in model && 'inputs' in model && 'outputs' in model;
  };

  return {
    // State
    compilationOptions,
    results: results,
    isCompiling,
    errors,
    statistics: getStatistics,

    // Actions
    compileModel,
    compileMultiple,
    getResult,
    clearResults,
    clearResult,
    updateOptions,
    exportResult,
    exportAll,

    // Utilities
    setCompilationOptions,
  };
}

export type UseCompilationReturn = ReturnType<typeof useCompilation>;
