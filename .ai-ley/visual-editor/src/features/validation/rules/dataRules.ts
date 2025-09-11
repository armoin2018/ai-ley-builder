import type {
  ValidationContext,
  ValidationError,
  ValidationResult,
  ValidationRule,
  ValidationWarning,
} from '../types/validation';
import { getNodeTypeDefinition } from '../config/nodeDefinitions';

export const dataValidationRules: ValidationRule[] = [
  {
    id: 'required_properties',
    name: 'Required Properties',
    description: 'Ensures all required node properties are provided',
    category: 'data',
    severity: 'error',
    enabled: true,
    validate: (context: ValidationContext): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      context.nodes.forEach(node => {
        const definition = getNodeTypeDefinition(node.type);
        if (!definition) return;

        // Check required properties from definition
        definition.properties.forEach(propDef => {
          if (propDef.required) {
            const value = node.data?.properties?.[propDef.key];
            if (value === undefined || value === null || value === '') {
              errors.push({
                id: `missing_prop_${node.id}_${propDef.key}`,
                type: 'REQUIRED_FIELD_MISSING' as const,
                severity: 'error' as const,
                message: `Required property '${propDef.name}' is missing`,
                nodeId: node.id,
                property: propDef.key,
                suggestedFix: `Set a value for the '${propDef.name}' property`,
              });
            }
          }
        });

        // Check validation.required from definition
        if (definition.validation?.required) {
          definition.validation.required.forEach(requiredKey => {
            const value =
              node.data?.properties?.[requiredKey] || node.data?.[requiredKey];
            if (value === undefined || value === null || value === '') {
              errors.push({
                id: `missing_required_${node.id}_${requiredKey}`,
                type: 'REQUIRED_FIELD_MISSING' as const,
                severity: 'error' as const,
                message: `Required field '${requiredKey}' is missing`,
                nodeId: node.id,
                property: requiredKey,
                suggestedFix: `Provide a value for '${requiredKey}'`,
              });
            }
          });
        }
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  },

  {
    id: 'data_type_validation',
    name: 'Data Type Validation',
    description: 'Validates data types of node properties',
    category: 'data',
    severity: 'error',
    enabled: true,
    validate: (context: ValidationContext): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      context.nodes.forEach(node => {
        const definition = getNodeTypeDefinition(node.type);
        if (!definition) return;

        definition.properties.forEach(propDef => {
          const value = node.data?.properties?.[propDef.key];
          if (value === undefined || value === null) return;

          let isValid = true;
          let expectedType = '';

          switch (propDef.type) {
            case 'number':
              isValid = typeof value === 'number' && !isNaN(value);
              expectedType = 'number';
              break;
            case 'boolean':
              isValid = typeof value === 'boolean';
              expectedType = 'boolean';
              break;
            case 'text':
            case 'textarea':
              isValid = typeof value === 'string';
              expectedType = 'string';
              break;
            case 'select':
            case 'multiselect':
              if (propDef.validation?.options) {
                if (propDef.type === 'multiselect' && Array.isArray(value)) {
                  isValid = value.every(v =>
                    propDef.validation!.options!.includes(v)
                  );
                } else {
                  isValid = propDef.validation.options.includes(value);
                }
                expectedType = `one of: ${propDef.validation.options.join(', ')}`;
              }
              break;
            case 'json':
              try {
                if (typeof value === 'string') {
                  JSON.parse(value);
                }
                isValid = true;
              } catch {
                isValid = false;
                expectedType = 'valid JSON';
              }
              break;
          }

          if (!isValid) {
            errors.push({
              id: `invalid_type_${node.id}_${propDef.key}`,
              type: 'INVALID_DATA_TYPE' as const,
              severity: 'error' as const,
              message: `Property '${propDef.name}' has invalid type. Expected: ${expectedType}`,
              nodeId: node.id,
              property: propDef.key,
              suggestedFix: `Provide a ${expectedType} value`,
            });
          }
        });
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  },

  {
    id: 'property_format_validation',
    name: 'Property Format Validation',
    description: 'Validates property formats using patterns and ranges',
    category: 'data',
    severity: 'error',
    enabled: true,
    validate: (context: ValidationContext): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      context.nodes.forEach(node => {
        const definition = getNodeTypeDefinition(node.type);
        if (!definition) return;

        definition.properties.forEach(propDef => {
          const value = node.data?.properties?.[propDef.key];
          if (value === undefined || value === null) return;

          if (propDef.validation) {
            const validation = propDef.validation;

            // Pattern validation
            if (validation.pattern && typeof value === 'string') {
              if (!validation.pattern.test(value)) {
                errors.push({
                  id: `invalid_format_${node.id}_${propDef.key}`,
                  type: 'INVALID_FORMAT' as const,
                  severity: 'error' as const,
                  message: `Property '${propDef.name}' does not match required format`,
                  nodeId: node.id,
                  property: propDef.key,
                  suggestedFix: `Ensure '${propDef.name}' matches the required pattern`,
                });
              }
            }

            // Min/Max validation for numbers
            if (typeof value === 'number') {
              if (validation.min !== undefined && value < validation.min) {
                errors.push({
                  id: `below_min_${node.id}_${propDef.key}`,
                  type: 'INVALID_FORMAT' as const,
                  severity: 'error' as const,
                  message: `Property '${propDef.name}' must be at least ${validation.min}`,
                  nodeId: node.id,
                  property: propDef.key,
                  suggestedFix: `Set '${propDef.name}' to ${validation.min} or higher`,
                });
              }

              if (validation.max !== undefined && value > validation.max) {
                errors.push({
                  id: `above_max_${node.id}_${propDef.key}`,
                  type: 'INVALID_FORMAT' as const,
                  severity: 'error' as const,
                  message: `Property '${propDef.name}' must be at most ${validation.max}`,
                  nodeId: node.id,
                  property: propDef.key,
                  suggestedFix: `Set '${propDef.name}' to ${validation.max} or lower`,
                });
              }
            }

            // Min/Max validation for strings (length)
            if (typeof value === 'string') {
              if (
                validation.min !== undefined &&
                value.length < validation.min
              ) {
                errors.push({
                  id: `too_short_${node.id}_${propDef.key}`,
                  type: 'INVALID_FORMAT' as const,
                  severity: 'error' as const,
                  message: `Property '${propDef.name}' must be at least ${validation.min} characters`,
                  nodeId: node.id,
                  property: propDef.key,
                  suggestedFix: `Increase length of '${propDef.name}' to at least ${validation.min} characters`,
                });
              }

              if (
                validation.max !== undefined &&
                value.length > validation.max
              ) {
                errors.push({
                  id: `too_long_${node.id}_${propDef.key}`,
                  type: 'INVALID_FORMAT' as const,
                  severity: 'error' as const,
                  message: `Property '${propDef.name}' must be at most ${validation.max} characters`,
                  nodeId: node.id,
                  property: propDef.key,
                  suggestedFix: `Reduce length of '${propDef.name}' to at most ${validation.max} characters`,
                });
              }
            }

            // Custom validation
            if (validation.custom) {
              const result = validation.custom(value);
              if (result !== true) {
                const message =
                  typeof result === 'string'
                    ? result
                    : `Property '${propDef.name}' failed custom validation`;
                errors.push({
                  id: `custom_validation_${node.id}_${propDef.key}`,
                  type: 'INVALID_FORMAT' as const,
                  severity: 'error' as const,
                  message,
                  nodeId: node.id,
                  property: propDef.key,
                  suggestedFix: `Fix the validation issue for '${propDef.name}'`,
                });
              }
            }
          }
        });
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  },

  {
    id: 'required_inputs',
    name: 'Required Input Connections',
    description: 'Ensures nodes have all required input connections',
    category: 'data',
    severity: 'error',
    enabled: true,
    validate: (context: ValidationContext): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      context.nodes.forEach(node => {
        const definition = getNodeTypeDefinition(node.type);
        if (!definition) return;

        definition.inputs.forEach(inputDef => {
          if (inputDef.required) {
            const hasConnection = context.edges.some(
              edge =>
                edge.target === node.id &&
                (edge.targetHandle === inputDef.id ||
                  (!edge.targetHandle && inputDef.id === 'input'))
            );

            if (!hasConnection) {
              errors.push({
                id: `missing_input_${node.id}_${inputDef.id}`,
                type: 'MISSING_REQUIRED_INPUT' as const,
                severity: 'error' as const,
                message: `Required input '${inputDef.name}' is not connected`,
                nodeId: node.id,
                suggestedFix: `Connect a data source to the '${inputDef.name}' input`,
              });
            }
          }
        });
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  },

  {
    id: 'unused_outputs',
    name: 'Unused Output Detection',
    description: 'Warns about outputs that are not connected to anything',
    category: 'data',
    severity: 'warning',
    enabled: true,
    validate: (context: ValidationContext): ValidationResult => {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];

      context.nodes.forEach(node => {
        const definition = getNodeTypeDefinition(node.type);
        if (!definition) return;

        definition.outputs.forEach(outputDef => {
          const hasConnection = context.edges.some(
            edge =>
              edge.source === node.id &&
              (edge.sourceHandle === outputDef.id ||
                (!edge.sourceHandle && outputDef.id === 'output'))
          );

          if (!hasConnection && node.type !== 'output') {
            warnings.push({
              id: `unused_output_${node.id}_${outputDef.id}`,
              type: 'UNUSED_OUTPUT' as const,
              severity: 'warning' as const,
              message: `Output '${outputDef.name}' is not connected to anything`,
              nodeId: node.id,
              suggestedFix: `Connect the '${outputDef.name}' output to another node or add an output node`,
            });
          }
        });
      });

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    },
  },
];
