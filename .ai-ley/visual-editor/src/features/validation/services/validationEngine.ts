import type {
  ValidationContext,
  ValidationError,
  ValidationResult,
  ValidationRule,
  ValidationWarning,
} from '../types/validation';
import { structuralValidationRules } from '../rules/structuralRules';
import { dataValidationRules } from '../rules/dataRules';
import { NODE_TYPE_DEFINITIONS } from '../config/nodeDefinitions';

export class ValidationEngine {
  private rules: Map<string, ValidationRule> = new Map();

  constructor() {
    this.loadDefaultRules();
  }

  private loadDefaultRules(): void {
    [...structuralValidationRules, ...dataValidationRules].forEach(rule => {
      this.rules.set(rule.id, rule);
    });
  }

  addRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  enableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = true;
    }
  }

  disableRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = false;
    }
  }

  getRule(ruleId: string): ValidationRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  getEnabledRules(): ValidationRule[] {
    return Array.from(this.rules.values()).filter(rule => rule.enabled);
  }

  validateWorkflow(
    nodes: any[],
    edges: any[],
    options: {
      allowUnconnectedNodes?: boolean;
      strictMode?: boolean;
      enabledRuleCategories?: string[];
      disabledRules?: string[];
    } = {}
  ): ValidationResult {
    const context: ValidationContext = {
      nodes,
      edges,
      nodeTypes: NODE_TYPE_DEFINITIONS,
      allowUnconnectedNodes: options.allowUnconnectedNodes || false,
      strictMode: options.strictMode || false,
    };

    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];

    // Get rules to execute
    const rulesToExecute = this.getEnabledRules().filter(rule => {
      // Filter by disabled rules
      if (options.disabledRules?.includes(rule.id)) {
        return false;
      }

      // Filter by enabled categories
      if (
        options.enabledRuleCategories &&
        !options.enabledRuleCategories.includes(rule.category)
      ) {
        return false;
      }

      return true;
    });

    // Execute each rule
    for (const rule of rulesToExecute) {
      try {
        const result = rule.validate(context);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
      } catch (error) {
        // If a rule fails, add it as a validation error
        allErrors.push({
          id: `rule_error_${rule.id}`,
          type: 'INVALID_FORMAT',
          severity: 'error' as const,
          message: `Validation rule '${rule.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          suggestedFix: 'Check the validation rule implementation',
        });
      }
    }

    // Execute custom node validations
    for (const node of nodes) {
      const nodeDefinition = NODE_TYPE_DEFINITIONS[node.type];
      if (nodeDefinition?.validation?.custom) {
        try {
          const result = nodeDefinition.validation.custom(node, context);
          allErrors.push(...result.errors);
          allWarnings.push(...result.warnings);
        } catch (error) {
          allErrors.push({
            id: `node_validation_error_${node.id}`,
            type: 'INVALID_FORMAT',
            severity: 'error' as const,
            message: `Custom validation failed for node ${node.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            nodeId: node.id,
            suggestedFix: 'Check the node configuration',
          });
        }
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: this.deduplicateIssues(allErrors),
      warnings: this.deduplicateIssues(allWarnings),
    };
  }

  validateNode(node: any, allNodes: any[], allEdges: any[]): ValidationResult {
    const context: ValidationContext = {
      nodes: allNodes,
      edges: allEdges,
      nodeTypes: NODE_TYPE_DEFINITIONS,
    };

    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Run node-specific rules
    const nodeRules = this.getEnabledRules().filter(
      rule => rule.category === 'data' || rule.category === 'structure'
    );

    for (const rule of nodeRules) {
      try {
        const result = rule.validate(context);
        // Filter results to only include issues for this specific node
        errors.push(...result.errors.filter(error => error.nodeId === node.id));
        warnings.push(
          ...result.warnings.filter(warning => warning.nodeId === node.id)
        );
      } catch (error) {
        // Skip failed rules for single node validation
      }
    }

    // Run custom node validation
    const nodeDefinition = NODE_TYPE_DEFINITIONS[node.type];
    if (nodeDefinition?.validation?.custom) {
      try {
        const result = nodeDefinition.validation.custom(node, context);
        errors.push(...result.errors);
        warnings.push(...result.warnings);
      } catch (error) {
        errors.push({
          id: `node_validation_error_${node.id}`,
          type: 'INVALID_FORMAT',
          severity: 'error' as const,
          message: `Custom validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          nodeId: node.id,
          suggestedFix: 'Check the node configuration',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors: this.deduplicateIssues(errors),
      warnings: this.deduplicateIssues(warnings),
    };
  }

  getValidationSummary(result: ValidationResult): {
    errorCount: number;
    warningCount: number;
    errorsByType: Record<string, number>;
    warningsByType: Record<string, number>;
    affectedNodes: string[];
  } {
    const errorsByType: Record<string, number> = {};
    const warningsByType: Record<string, number> = {};
    const affectedNodes = new Set<string>();

    result.errors.forEach(error => {
      errorsByType[error.type] = (errorsByType[error.type] || 0) + 1;
      if (error.nodeId) {
        affectedNodes.add(error.nodeId);
      }
    });

    result.warnings.forEach(warning => {
      warningsByType[warning.type] = (warningsByType[warning.type] || 0) + 1;
      if (warning.nodeId) {
        affectedNodes.add(warning.nodeId);
      }
    });

    return {
      errorCount: result.errors.length,
      warningCount: result.warnings.length,
      errorsByType,
      warningsByType,
      affectedNodes: Array.from(affectedNodes),
    };
  }

  private deduplicateIssues<T extends ValidationError | ValidationWarning>(
    issues: T[]
  ): T[] {
    const seen = new Set<string>();
    return issues.filter(issue => {
      const key = `${issue.type}_${issue.nodeId || ''}_${issue.edgeId || ''}_${issue.property || ''}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// Export singleton instance
export const validationEngine = new ValidationEngine();
