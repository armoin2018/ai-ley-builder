import { useCallback, useEffect, useState } from 'react';
import { validationEngine } from '../services/validationEngine';
import type { ValidationResult, ValidationRule } from '../types/validation';

export interface UseValidationReturn {
  validationResult: ValidationResult;
  isValidating: boolean;
  validateWorkflow: (nodes: any[], edges: any[]) => void;
  validateNode: (
    node: any,
    allNodes: any[],
    allEdges: any[]
  ) => ValidationResult;
  clearValidation: () => void;
  enableRule: (ruleId: string) => void;
  disableRule: (ruleId: string) => void;
  getRules: () => ValidationRule[];
  getEnabledRules: () => ValidationRule[];
  isRuleEnabled: (ruleId: string) => boolean;
}

export interface UseValidationOptions {
  autoValidate?: boolean;
  debounceMs?: number;
  enabledRuleCategories?: string[];
  disabledRules?: string[];
}

export function useValidation(
  options: UseValidationOptions = {}
): UseValidationReturn {
  const {
    debounceMs = 500,
    enabledRuleCategories,
    disabledRules = [],
  } = options;

  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [isValidating, setIsValidating] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const validateWorkflow = useCallback(
    (nodes: any[], edges: any[]) => {
      setIsValidating(true);

      // Clear existing debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      // Set up debounced validation
      const timer = setTimeout(() => {
        try {
          const result = validationEngine.validateWorkflow(nodes, edges, {
            enabledRuleCategories,
            disabledRules,
          });
          setValidationResult(result);
        } catch (error) {
          console.error('Validation failed:', error);
          setValidationResult({
            isValid: false,
            errors: [
              {
                id: 'validation_engine_error',
                type: 'INVALID_FORMAT',
                severity: 'error' as const,
                message: `Validation engine failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                suggestedFix: 'Check the workflow structure and try again',
              },
            ],
            warnings: [],
          });
        } finally {
          setIsValidating(false);
        }
      }, debounceMs);

      setDebounceTimer(timer);
    },
    [debounceMs, debounceTimer, enabledRuleCategories, disabledRules]
  );

  const validateNode = useCallback(
    (node: any, allNodes: any[], allEdges: any[]): ValidationResult => {
      try {
        return validationEngine.validateNode(node, allNodes, allEdges);
      } catch (error) {
        console.error('Node validation failed:', error);
        return {
          isValid: false,
          errors: [
            {
              id: `node_validation_error_${node.id}`,
              type: 'INVALID_FORMAT',
              severity: 'error' as const,
              message: `Node validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              nodeId: node.id,
              suggestedFix: 'Check the node configuration',
            },
          ],
          warnings: [],
        };
      }
    },
    []
  );

  const clearValidation = useCallback(() => {
    setValidationResult({
      isValid: true,
      errors: [],
      warnings: [],
    });

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [debounceTimer]);

  const enableRule = useCallback((ruleId: string) => {
    validationEngine.enableRule(ruleId);
  }, []);

  const disableRule = useCallback((ruleId: string) => {
    validationEngine.disableRule(ruleId);
  }, []);

  const getRules = useCallback(() => {
    return validationEngine.getAllRules();
  }, []);

  const getEnabledRules = useCallback(() => {
    return validationEngine.getEnabledRules();
  }, []);

  const isRuleEnabled = useCallback((ruleId: string) => {
    const rule = validationEngine.getRule(ruleId);
    return rule?.enabled ?? false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    validationResult,
    isValidating,
    validateWorkflow,
    validateNode,
    clearValidation,
    enableRule,
    disableRule,
    getRules,
    getEnabledRules,
    isRuleEnabled,
  };
}
