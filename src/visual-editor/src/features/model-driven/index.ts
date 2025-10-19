/**
 * Model-Driven AI Agent Instruction System
 * Entry point for all exports
 */

// Core Types
export type {
  FlowConnection,
  FlowDependency,
  FlowMetadata,
  FlowModel,
  FlowValidation,
  FormField,
  FormSection,
  ModelEditorState,
  ModelTemplate,
  NodeInstance,
  NodeModel,
  NodeModelMetadata,
  NodeModelValidation,
  NodePort,
  NodeType,
  ValidationRule,
} from './types';

// Services
export { compilationService } from './services/compilationService';
export { executionService } from './services/executionService';
export { templateService } from './services/templateService';

export type {
  CompilationOptions,
  CompilationResult,
} from './services/compilationService';

export type {
  AIServiceConfig,
  ExecutionContext,
  ExecutionOptions,
  FlowExecutionResult,
  NodeExecutionResult,
} from './services/executionService';

// Hooks
export { useCompilation } from './hooks/useCompilation';
export { useFormGenerator } from './hooks/useFormGenerator';

export type {
  UseCompilationOptions,
  UseCompilationReturn,
} from './hooks/useCompilation';

// Components
export { CompilationPanel } from './components/CompilationPanel';
export { ExecutionPanel } from './components/ExecutionPanel';
export { ModelDrivenSystem } from './components/ModelDrivenSystem';
export { ModelEditor } from './components/ModelEditor';
export { ModelForm } from './components/ModelForm';
export { ModelPreview } from './components/ModelPreview';
export { TemplateSelector } from './components/TemplateSelector';

// Default export
export { ModelDrivenSystem as default } from './components/ModelDrivenSystem';
