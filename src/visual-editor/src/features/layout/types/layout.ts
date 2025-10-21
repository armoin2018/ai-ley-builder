import type { ReactNode } from 'react';

export interface Panel {
  id: string;
  title: string;
  content: ReactNode;
  icon?: ReactNode;
  closable?: boolean;
  collapsible?: boolean;
  collapsed?: boolean;
  minWidth?: number;
  minHeight?: number;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface DropZone {
  id: string;
  type: 'left' | 'right' | 'top' | 'middle' | 'bottom' | 'center' | 'tab';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  parentId?: string;
}

export interface LayoutContainer {
  id: string;
  type: 'horizontal' | 'vertical' | 'tabbed';
  children: (LayoutContainer | Panel)[];
  size?: number; // percentage or pixel size
  minSize?: number;
  maxSize?: number;
}

export interface LayoutState {
  containers: Record<string, LayoutContainer>;
  panels: Record<string, Panel>;
  rootContainer: string;
  activeDropZones: DropZone[];
  draggedPanel?: string;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  layout: LayoutContainer;
  defaultPanels: Panel[];
}

export interface DragState {
  isDragging: boolean;
  draggedPanel?: Panel;
  dragOffset?: { x: number; y: number };
  hoveredDropZone?: string;
}

export type LayoutAction =
  | { type: 'START_DRAG'; panel: Panel; offset: { x: number; y: number } }
  | { type: 'END_DRAG' }
  | { type: 'SET_HOVERED_DROP_ZONE'; zoneId?: string }
  | { type: 'DROP_PANEL'; panelId: string; zoneId: string }
  | { type: 'APPLY_TEMPLATE'; template: LayoutTemplate }
  | { type: 'ADD_PANEL'; panel: Panel; containerId?: string }
  | { type: 'UPDATE_PANEL'; panel: Panel }
  | { type: 'REMOVE_PANEL'; panelId: string }
  | { type: 'RESIZE_CONTAINER'; containerId: string; size: number }
  | { type: 'TOGGLE_PANEL'; panelId: string; visible: boolean }
  | { type: 'TOGGLE_PANEL_COLLAPSE'; panelId: string }
  | { type: 'SAVE_NAMED_VIEW'; name: string; description?: string }
  | { type: 'LOAD_NAMED_VIEW'; viewId: string };

export interface LayoutContextType {
  state: LayoutState;
  dragState: DragState;
  dispatch: (action: LayoutAction) => void;
  registerDropZone: (zone: DropZone) => void;
  unregisterDropZone: (zoneId: string) => void;
  getAvailablePanels: () => Panel[];
  applyTemplate: (template: LayoutTemplate) => void;
}
