import type {
  NodeTypeDefinition,
  ValidationContext,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from '../types/validation';

export const NODE_TYPE_DEFINITIONS: Record<string, NodeTypeDefinition> = {
  'command-prompt-file': {
    type: 'command-prompt-file',
    name: 'Command Prompt File',
    category: 'prompt',
    description: 'A prompt file node that executes a specific command prompt',
    inputs: [],
    outputs: [
      {
        id: 'output',
        name: 'Output',
        dataType: 'string',
        required: false,
        description: 'Output from the command prompt execution',
      },
    ],
    properties: [
      {
        key: 'fileName',
        name: 'File Name',
        type: 'text',
        required: true,
        defaultValue: 'prompt.md',
        description: 'Name of the prompt file',
      },
      {
        key: 'content',
        name: 'Content',
        type: 'textarea',
        required: false,
        description: 'Content of the prompt file',
      },
      {
        key: 'variables',
        name: 'Variables',
        type: 'array',
        required: false,
        description: 'Variables used in the prompt',
      },
    ],
    validation: {
      required: ['fileName'],
    },
  },

  'custom-prompt-text': {
    type: 'custom-prompt-text',
    name: 'Custom Prompt Text',
    category: 'prompt',
    description: 'A node for custom text prompts',
    inputs: [],
    outputs: [
      {
        id: 'output',
        name: 'Output',
        dataType: 'string',
        required: false,
        description: 'Output from the custom prompt',
      },
    ],
    properties: [
      {
        key: 'promptText',
        name: 'Prompt Text',
        type: 'textarea',
        required: true,
        defaultValue: '',
        description: 'The custom prompt text',
      },
      {
        key: 'variables',
        name: 'Variables',
        type: 'array',
        required: false,
        description: 'Variables used in the prompt',
      },
    ],
    validation: {
      required: ['promptText'],
    },
  },

  'persona': {
    type: 'persona',
    name: 'Persona',
    category: 'context',
    description: 'Defines a persona or character for the AI',
    inputs: [],
    outputs: [
      {
        id: 'output',
        name: 'Output',
        dataType: 'object',
        required: false,
        description: 'Persona configuration output',
      },
    ],
    properties: [
      {
        key: 'personaType',
        name: 'Persona Type',
        type: 'text',
        required: true,
        defaultValue: 'Expert Assistant',
        description: 'Type or role of the persona',
      },
      {
        key: 'tone',
        name: 'Tone',
        type: 'select',
        required: false,
        defaultValue: 'professional',
        validation: {
          options: ['professional', 'casual', 'formal', 'friendly'],
        },
        description: 'Communication tone of the persona',
      },
      {
        key: 'expertise',
        name: 'Expertise',
        type: 'array',
        required: false,
        description: 'Areas of expertise for the persona',
      },
      {
        key: 'characteristics',
        name: 'Characteristics',
        type: 'array',
        required: false,
        description: 'Key characteristics of the persona',
      },
    ],
    validation: {
      required: ['personaType'],
    },
  },

  'instruction': {
    type: 'instruction',
    name: 'Instruction',
    category: 'context',
    description: 'Provides system instructions or context',
    inputs: [],
    outputs: [
      {
        id: 'output',
        name: 'Output',
        dataType: 'string',
        required: false,
        description: 'Instruction output',
      },
    ],
    properties: [
      {
        key: 'instructionText',
        name: 'Instruction Text',
        type: 'textarea',
        required: true,
        defaultValue: '',
        description: 'The instruction text',
      },
      {
        key: 'priority',
        name: 'Priority',
        type: 'select',
        required: false,
        defaultValue: 'medium',
        validation: {
          options: ['low', 'medium', 'high', 'critical'],
        },
        description: 'Priority level of the instruction',
      },
    ],
    validation: {
      required: ['instructionText'],
    },
  },

  'logic-condition': {
    type: 'logic-condition',
    name: 'Logic Condition',
    category: 'logic',
    description: 'Evaluates a condition and provides branching logic',
    inputs: [
      {
        id: 'input',
        name: 'Input',
        dataType: 'any',
        required: true,
        description: 'Input data to evaluate',
      },
    ],
    outputs: [
      {
        id: 'true',
        name: 'True',
        dataType: 'any',
        required: false,
        description: 'Output when condition is true',
      },
      {
        id: 'false',
        name: 'False',
        dataType: 'any',
        required: false,
        description: 'Output when condition is false',
      },
    ],
    properties: [
      {
        key: 'condition',
        name: 'Condition',
        type: 'text',
        required: true,
        defaultValue: '',
        description: 'The logical condition to evaluate',
      },
      {
        key: 'trueLabel',
        name: 'True Label',
        type: 'text',
        required: false,
        defaultValue: 'True',
        description: 'Label for the true branch',
      },
      {
        key: 'falseLabel',
        name: 'False Label',
        type: 'text',
        required: false,
        defaultValue: 'False',
        description: 'Label for the false branch',
      },
    ],
    validation: {
      required: ['condition'],
    },
  },

  'loop': {
    type: 'loop',
    name: 'Loop',
    category: 'logic',
    description: 'Provides looping and iteration logic',
    inputs: [
      {
        id: 'input',
        name: 'Input',
        dataType: 'any',
        required: true,
        description: 'Input data for the loop',
      },
    ],
    outputs: [
      {
        id: 'output',
        name: 'Output',
        dataType: 'any',
        required: false,
        description: 'Loop output',
      },
      {
        id: 'each',
        name: 'Each Item',
        dataType: 'any',
        required: false,
        description: 'Output for each iteration',
      },
    ],
    properties: [
      {
        key: 'loopType',
        name: 'Loop Type',
        type: 'select',
        required: true,
        defaultValue: 'for',
        validation: {
          options: ['for', 'while', 'forEach'],
        },
        description: 'Type of loop to execute',
      },
      {
        key: 'maxIterations',
        name: 'Max Iterations',
        type: 'number',
        required: false,
        defaultValue: 10,
        description: 'Maximum number of iterations',
      },
      {
        key: 'iteratorVariable',
        name: 'Iterator Variable',
        type: 'text',
        required: false,
        defaultValue: 'i',
        description: 'Variable name for the iterator',
      },
      {
        key: 'condition',
        name: 'Condition',
        type: 'text',
        required: false,
        description: 'Loop condition (for while loops)',
      },
    ],
    validation: {
      required: ['loopType'],
    },
  },

  'output-type': {
    type: 'output-type',
    name: 'Output Type',
    category: 'output',
    description: 'Defines the output format and type',
    inputs: [
      {
        id: 'input',
        name: 'Input',
        dataType: 'any',
        required: true,
        description: 'Input data to format',
      },
    ],
    outputs: [
      {
        id: 'output',
        name: 'Formatted Output',
        dataType: 'any',
        required: false,
        description: 'Formatted output data',
      },
    ],
    properties: [
      {
        key: 'outputType',
        name: 'Output Type',
        type: 'select',
        required: true,
        defaultValue: 'text',
        validation: {
          options: ['text', 'json', 'xml', 'csv', 'markdown', 'html'],
        },
        description: 'Type of output format',
      },
      {
        key: 'format',
        name: 'Format',
        type: 'select',
        required: false,
        defaultValue: 'structured',
        validation: {
          options: ['structured', 'raw', 'formatted', 'compressed'],
        },
        description: 'Output formatting style',
      },
      {
        key: 'template',
        name: 'Template',
        type: 'textarea',
        required: false,
        description: 'Output template for formatting',
      },
    ],
    validation: {
      required: ['outputType'],
    },
  },

  input: {
    type: 'input',
    name: 'Input',
    category: 'data',
    description: 'Provides input data to the workflow',
    inputs: [],
    outputs: [
      {
        id: 'output',
        name: 'Output',
        dataType: 'any',
        required: false,
        description: 'Output data from this input node',
      },
    ],
    properties: [
      {
        key: 'label',
        name: 'Label',
        type: 'text',
        required: true,
        defaultValue: 'Input Node',
        description: 'Display name for the input node',
      },
      {
        key: 'dataType',
        name: 'Data Type',
        type: 'select',
        required: true,
        defaultValue: 'string',
        validation: {
          options: ['string', 'number', 'boolean', 'object', 'array'],
        },
        description: 'Type of data this input provides',
      },
      {
        key: 'defaultValue',
        name: 'Default Value',
        type: 'text',
        required: false,
        description: 'Default value when no input is provided',
      },
    ],
    validation: {
      required: ['label', 'dataType'],
    },
  },

  output: {
    type: 'output',
    name: 'Output',
    category: 'data',
    description: 'Outputs data from the workflow',
    inputs: [
      {
        id: 'input',
        name: 'Input',
        dataType: 'any',
        required: true,
        description: 'Input data to output',
      },
    ],
    outputs: [],
    properties: [
      {
        key: 'label',
        name: 'Label',
        type: 'text',
        required: true,
        defaultValue: 'Output Node',
        description: 'Display name for the output node',
      },
      {
        key: 'format',
        name: 'Output Format',
        type: 'select',
        required: false,
        defaultValue: 'json',
        validation: {
          options: ['json', 'csv', 'text', 'xml'],
        },
        description: 'Format for the output data',
      },
    ],
    validation: {
      required: ['label'],
      custom: (node: any, _context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check if output node has input connections
        const hasInputConnection = _context.edges.some(
          (edge: any) => edge.target === node.id
        );
        if (!hasInputConnection) {
          warnings.push({
            id: `${node.id}_no_input`,
            type: 'UNUSED_OUTPUT' as const,
            severity: 'warning' as const,
            message: 'Output node has no input connections',
            nodeId: node.id,
            suggestedFix: 'Connect an input to this output node',
          });
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
        };
      },
    },
  },

  transform: {
    type: 'transform',
    name: 'Transform',
    category: 'processing',
    description: 'Transforms data using custom logic',
    inputs: [
      {
        id: 'input',
        name: 'Input',
        dataType: 'any',
        required: true,
        description: 'Data to transform',
      },
    ],
    outputs: [
      {
        id: 'output',
        name: 'Output',
        dataType: 'any',
        required: false,
        description: 'Transformed data',
      },
    ],
    properties: [
      {
        key: 'label',
        name: 'Label',
        type: 'text',
        required: true,
        defaultValue: 'Transform Node',
        description: 'Display name for the transform node',
      },
      {
        key: 'transformType',
        name: 'Transform Type',
        type: 'select',
        required: true,
        defaultValue: 'map',
        validation: {
          options: ['map', 'filter', 'reduce', 'sort', 'group', 'custom'],
        },
        description: 'Type of transformation to apply',
      },
      {
        key: 'expression',
        name: 'Expression',
        type: 'textarea',
        required: true,
        defaultValue: '// Transform logic here\nreturn input;',
        description: 'JavaScript expression for transformation',
      },
    ],
    validation: {
      required: ['label', 'transformType', 'expression'],
      custom: (node: any, _context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Validate expression syntax
        try {
          new Function('input', node.data?.properties?.expression || '');
        } catch (error) {
          errors.push({
            id: `${node.id}_invalid_expression`,
            type: 'INVALID_FORMAT' as const,
            severity: 'error' as const,
            message: `Invalid JavaScript expression: ${(error as Error).message}`,
            nodeId: node.id,
            property: 'expression',
            suggestedFix: 'Fix the JavaScript syntax in the expression',
          });
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
        };
      },
    },
  },

  filter: {
    type: 'filter',
    name: 'Filter',
    category: 'processing',
    description: 'Filters data based on conditions',
    inputs: [
      {
        id: 'input',
        name: 'Input',
        dataType: 'any',
        required: true,
        description: 'Data to filter',
      },
    ],
    outputs: [
      {
        id: 'passed',
        name: 'Passed',
        dataType: 'any',
        required: false,
        description: 'Data that passed the filter',
      },
      {
        id: 'failed',
        name: 'Failed',
        dataType: 'any',
        required: false,
        description: 'Data that failed the filter',
      },
    ],
    properties: [
      {
        key: 'label',
        name: 'Label',
        type: 'text',
        required: true,
        defaultValue: 'Filter Node',
        description: 'Display name for the filter node',
      },
      {
        key: 'condition',
        name: 'Filter Condition',
        type: 'textarea',
        required: true,
        defaultValue:
          '// Return true to pass, false to filter out\nreturn true;',
        description: 'JavaScript condition for filtering',
      },
    ],
    validation: {
      required: ['label', 'condition'],
      custom: (node: any, _context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Validate condition syntax
        try {
          new Function('item', 'index', node.data?.properties?.condition || '');
        } catch (error) {
          errors.push({
            id: `${node.id}_invalid_condition`,
            type: 'INVALID_FORMAT' as const,
            severity: 'error' as const,
            message: `Invalid filter condition: ${(error as Error).message}`,
            nodeId: node.id,
            property: 'condition',
            suggestedFix: 'Fix the JavaScript syntax in the condition',
          });
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
        };
      },
    },
  },

  join: {
    type: 'join',
    name: 'Join',
    category: 'processing',
    description: 'Joins multiple data streams',
    inputs: [
      {
        id: 'input1',
        name: 'Input 1',
        dataType: 'any',
        required: true,
        description: 'First data stream to join',
      },
      {
        id: 'input2',
        name: 'Input 2',
        dataType: 'any',
        required: true,
        description: 'Second data stream to join',
      },
    ],
    outputs: [
      {
        id: 'output',
        name: 'Joined Output',
        dataType: 'any',
        required: false,
        description: 'Joined data output',
      },
    ],
    properties: [
      {
        key: 'label',
        name: 'Label',
        type: 'text',
        required: true,
        defaultValue: 'Join Node',
        description: 'Display name for the join node',
      },
      {
        key: 'joinType',
        name: 'Join Type',
        type: 'select',
        required: true,
        defaultValue: 'inner',
        validation: {
          options: ['inner', 'left', 'right', 'full', 'concat'],
        },
        description: 'Type of join operation',
      },
      {
        key: 'joinKey',
        name: 'Join Key',
        type: 'text',
        required: false,
        description: 'Key field for joining data (if applicable)',
      },
    ],
    validation: {
      required: ['label', 'joinType'],
      custom: (node: any, context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        // Check if both inputs are connected
        const input1Connected = context.edges.some(
          (edge: any) =>
            edge.target === node.id && edge.targetHandle === 'input1'
        );
        const input2Connected = context.edges.some(
          (edge: any) =>
            edge.target === node.id && edge.targetHandle === 'input2'
        );

        if (!input1Connected) {
          errors.push({
            id: `${node.id}_missing_input1`,
            type: 'MISSING_REQUIRED_INPUT' as const,
            severity: 'error' as const,
            message: 'Join node requires Input 1 to be connected',
            nodeId: node.id,
            suggestedFix: 'Connect a data source to Input 1',
          });
        }

        if (!input2Connected) {
          errors.push({
            id: `${node.id}_missing_input2`,
            type: 'MISSING_REQUIRED_INPUT' as const,
            severity: 'error' as const,
            message: 'Join node requires Input 2 to be connected',
            nodeId: node.id,
            suggestedFix: 'Connect a data source to Input 2',
          });
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
        };
      },
    },
  },
};

export function getNodeTypeDefinition(
  nodeType: string
): NodeTypeDefinition | undefined {
  return NODE_TYPE_DEFINITIONS[nodeType];
}

export function getAllNodeTypes(): NodeTypeDefinition[] {
  return Object.values(NODE_TYPE_DEFINITIONS);
}

export function getNodeTypesByCategory(category: string): NodeTypeDefinition[] {
  return Object.values(NODE_TYPE_DEFINITIONS).filter(
    def => def.category === category
  );
}
