// Layout system exports
export { LayoutProvider, useLayout } from './context/LayoutContext';
export { DraggableLayoutEngine } from './components/DraggableLayoutEngine';
export { DraggablePanel, DragGhost } from './components/DraggablePanel';
export { DropZone, DropZoneContainer } from './components/DropZone';
export {
  LayoutTemplateSelector,
  LayoutQuickToggles,
  LayoutResetButton,
} from './components/LayoutTemplateSelector';

// Types
export type {
  Panel,
  LayoutContainer,
  LayoutTemplate,
  LayoutState,
  DropZone as DropZoneType,
} from './types/layout';

// Templates
export {
  LAYOUT_TEMPLATES,
  getLayoutTemplate,
  getTemplatesByCategory,
} from './templates/layoutTemplates';
