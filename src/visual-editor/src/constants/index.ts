// Application constants
// Global constants for the visual flow editor

import { NodeType } from '../types/nodes';
import { AI_LEY_PATHS } from '../utils/paths';

// Node type configurations
export const NODE_TYPES = {
  [NodeType.COMMAND_PROMPT_FILE]: {
    label: 'Command Prompt File',
    description: 'References reusable prompt templates',
    color: 'node-command',
    icon: '📄',
  },
  [NodeType.LOGIC_CONDITION]: {
    label: 'Logic Condition',
    description: 'Conditional branching logic',
    color: 'node-logic',
    icon: '🔀',
  },
  [NodeType.OUTPUT_TYPE]: {
    label: 'Output Type',
    description: 'Terminal output formatting',
    color: 'node-output',
    icon: '📤',
  },
  [NodeType.LOOP]: {
    label: 'Loop',
    description: 'Iteration control structure',
    color: 'node-loop',
    icon: '🔄',
  },
  [NodeType.CUSTOM_PROMPT_TEXT]: {
    label: 'Custom Prompt Text',
    description: 'Inline prompt with variables',
    color: 'node-custom',
    icon: '✏️',
  },
  [NodeType.PERSONA]: {
    label: 'Persona',
    description: 'AI personality configuration',
    color: 'node-persona',
    icon: '🎭',
  },
  [NodeType.INSTRUCTION]: {
    label: 'Instruction',
    description: 'Behavioral directive',
    color: 'node-instruction',
    icon: '📋',
  },
};

// Canvas configuration
export const CANVAS_CONFIG = {
  GRID_SIZE: 20,
  NODE_WIDTH: 200,
  NODE_HEIGHT: 80,
  CONNECTION_WIDTH: 2,
  ZOOM_MIN: 0.25,
  ZOOM_MAX: 2,
  ZOOM_STEP: 0.1,
};

// File paths - using dynamic git root detection
export const FILE_PATHS = {
  get FLOWS_DIR() {
    return AI_LEY_PATHS.FLOWS;
  },
  get UML_EXPORT_DIR() {
    return AI_LEY_PATHS.UML_FLOWS_USER;
  },
  get BACKUP_DIR() {
    return AI_LEY_PATHS.FLOWS_BACKUP;
  },
};
