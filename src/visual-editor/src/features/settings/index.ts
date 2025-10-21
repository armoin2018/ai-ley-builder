// Export component functions
export {
  AIRestSettings,
  LocalAISettings,
  Settings,
  UMLFlowsSettings,
} from './components';

// Export hook
export { useSettings } from '../../hooks/useSettings';

// Export type interfaces (with type qualifier to avoid conflict)
export type {
  AIRestSettings as AIRestSettingsType,
  LocalAISettings as LocalAISettingsType,
  SettingsState,
  UMLFlowsSettings as UMLFlowsSettingsType,
} from '../../types/settings';
