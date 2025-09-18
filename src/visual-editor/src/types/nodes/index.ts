// Node type definitions
// All node types and their properties for the visual editor

export interface BaseNodeProps {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
  selected?: boolean;
  dragging?: boolean;
}

export const NodeType = {
  COMMAND_PROMPT_FILE: 'command-prompt-file',
  LOGIC_CONDITION: 'logic-condition',
  OUTPUT_TYPE: 'output-type',
  LOOP: 'loop',
  CUSTOM_PROMPT_TEXT: 'custom-prompt-text',
  PERSONA: 'persona',
  INSTRUCTION: 'instruction',
  // Script execution nodes
  SHELL_SCRIPT: 'shell-script',
  PYTHON_SCRIPT: 'python-script',
  PHP_SCRIPT: 'php-script',
  NODEJS_SCRIPT: 'nodejs-script',
  // Additional types for PlantUML compatibility
  CUSTOM_PROMPT: 'custom-prompt',
  INPUT: 'input',
  OUTPUT: 'output',
  CONDITIONAL: 'conditional',
  OUTPUT_FORMATTER: 'output-formatter',
  DEFAULT: 'default',
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export interface NodeData {
  label: string;
  description?: string;
  properties: Record<string, unknown>;
}

export interface ConnectionPoint {
  nodeId: string;
  portId: string;
  type: 'input' | 'output';
}

export interface NodeConnection {
  id: string;
  source: ConnectionPoint;
  target: ConnectionPoint;
  animated?: boolean;
  style?: React.CSSProperties;
}
