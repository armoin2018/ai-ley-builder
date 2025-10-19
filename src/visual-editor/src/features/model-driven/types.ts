/**
 * Type definitions for the Model-Driven AI Agent Instruction System
 */

export type NodeType =
  | 'CommandPromptFile'
  | 'LogicCondition'
  | 'OutputType'
  | 'Loop'
  | 'CustomPromptText'
  | 'Persona'
  | 'Instruction';
export interface NodePort {
  id: string;
  name: string;
  type: string;
  required?: boolean;
  description?: string;
}

export interface NodeModelMetadata {
  icon?: string;
  color?: string;
  category?: string;
  tags?: string[];
  author?: string;
  created?: string;
  modified?: string;
}

export interface ValidationRule {
  rule: string;
  message: string;
}

export interface NodeModelValidation {
  requiredProperties?: string[];
  customRules?: ValidationRule[];
}

export interface NodeModel {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  version?: string;
  properties: Record<string, unknown>;
  inputs: NodePort[];
  outputs: NodePort[];
  metadata?: NodeModelMetadata;
  validation?: NodeModelValidation;
}

export interface NodeInstance {
  id: string;
  nodeModelId: string;
  label?: string;
  position: {
    x: number;
    y: number;
  };
  config?: Record<string, unknown>;
  disabled?: boolean;
}

export interface FlowConnection {
  id: string;
  from: {
    nodeId: string;
    outputId: string;
  };
  to: {
    nodeId: string;
    inputId: string;
  };
  label?: string;
  kind?: 'normal' | 'loopback';
  disabled?: boolean;
}

export interface FlowDependency {
  type: 'flow' | 'node' | 'persona' | 'instruction' | 'command';
  reference: string;
  version?: string;
  optional?: boolean;
}

export interface FlowMetadata {
  category?: string;
  tags?: string[];
  author?: string;
  created?: string;
  modified?: string;
  executionConfig?: {
    timeout?: number;
    retryCount?: number;
    parallelExecution?: boolean;
  };
}

export interface FlowValidation {
  strictMode?: boolean;
  allowCycles?: boolean;
  requiredConnections?: string[];
}

export interface FlowModel {
  id: string;
  name: string;
  description: string;
  version?: string;
  nodes: NodeInstance[];
  connections: FlowConnection[];
  metadata?: FlowMetadata;
  dependencies?: FlowDependency[];
  validation?: FlowValidation;
}

export interface ModelTemplate {
  id: string;
  type: 'node' | 'flow';
  nodeType?: NodeType;
  name: string;
  description: string;
  template: NodeModel | FlowModel;
  content: string; // Markdown content
}

export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'boolean'
    | 'select'
    | 'array'
    | 'object';
  required?: boolean;
  description?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface ModelForm {
  title: string;
  description: string;
  sections: FormSection[];
}

export interface ModelEditorState {
  selectedTemplate?: ModelTemplate;
  currentModel?: NodeModel | FlowModel;
  formData: Record<string, unknown>;
  validation: {
    isValid: boolean;
    errors: Record<string, string>;
  };
  isDirty: boolean;
  isLoading: boolean;
}
