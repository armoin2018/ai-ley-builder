export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  id: string;
  type: ValidationErrorType;
  severity: 'error';
  message: string;
  nodeId?: string;
  edgeId?: string;
  property?: string;
  suggestedFix?: string;
}

export interface ValidationWarning {
  id: string;
  type: ValidationWarningType;
  severity: 'warning';
  message: string;
  nodeId?: string;
  edgeId?: string;
  property?: string;
  suggestedFix?: string;
}

export type ValidationErrorType =
  | 'REQUIRED_FIELD_MISSING'
  | 'INVALID_DATA_TYPE'
  | 'INVALID_FORMAT'
  | 'CIRCULAR_DEPENDENCY'
  | 'DISCONNECTED_NODE'
  | 'INVALID_CONNECTION'
  | 'DUPLICATE_ID'
  | 'MISSING_REQUIRED_INPUT'
  | 'INVALID_OUTPUT_TYPE'
  | 'NODE_TYPE_NOT_SUPPORTED';

export type ValidationWarningType =
  | 'UNUSED_OUTPUT'
  | 'PERFORMANCE_CONCERN'
  | 'DEPRECATED_NODE_TYPE'
  | 'SUBOPTIMAL_CONFIGURATION'
  | 'POTENTIAL_DATA_LOSS'
  | 'MISSING_OPTIONAL_FIELD'
  | 'INVALID_FORMAT';

export interface ValidationContext {
  nodes: any[];
  edges: any[];
  nodeTypes: Record<string, NodeTypeDefinition>;
  allowUnconnectedNodes?: boolean;
  strictMode?: boolean;
}

export interface NodeTypeDefinition {
  type: string;
  name: string;
  category: string;
  description?: string;
  inputs: NodePortDefinition[];
  outputs: NodePortDefinition[];
  properties: NodePropertyDefinition[];
  validation?: {
    required?: string[];
    custom?: (node: any, context: ValidationContext) => ValidationResult;
  };
}

export interface NodePortDefinition {
  id: string;
  name: string;
  dataType: DataType;
  required: boolean;
  multiple?: boolean;
  description?: string;
}

export interface NodePropertyDefinition {
  key: string;
  name: string;
  type: PropertyType;
  required: boolean;
  defaultValue?: any;
  validation?: PropertyValidation;
  description?: string;
}

export type DataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'any'
  | 'date'
  | 'file'
  | 'url';

export type PropertyType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'date'
  | 'file'
  | 'json'
  | 'array'
  | 'password'
  | 'object';

export interface PropertyValidation {
  min?: number;
  max?: number;
  pattern?: RegExp;
  options?: string[];
  custom?: (value: any) => boolean | string;
}

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: ValidationRuleCategory;
  severity: 'error' | 'warning';
  validate: (context: ValidationContext) => ValidationResult;
  enabled: boolean;
}

export type ValidationRuleCategory =
  | 'structure'
  | 'data'
  | 'connectivity'
  | 'performance'
  | 'security'
  | 'compatibility';
