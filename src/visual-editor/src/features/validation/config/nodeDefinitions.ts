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

  persona: {
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

  instruction: {
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

  loop: {
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
    description:
      'Outputs data from the workflow with optional template and encoding',
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
          options: [
            'json',
            'csv',
            'text',
            'xml',
            'yaml',
            'html',
            'markdown',
            'pdf',
            'binary',
          ],
        },
        description: 'Format for the output data',
      },
      {
        key: 'template',
        name: 'Output Template',
        type: 'textarea',
        required: false,
        description:
          'Optional template for formatting output data. Use {{variable}} syntax for data interpolation.',
      },
      {
        key: 'templateType',
        name: 'Template Type',
        type: 'select',
        required: false,
        defaultValue: 'mustache',
        validation: {
          options: [
            'mustache',
            'handlebars',
            'jinja2',
            'ejs',
            'nunjucks',
            'plain',
          ],
        },
        description: 'Template engine type for processing the output template',
      },
      {
        key: 'encoding',
        name: 'Character Encoding',
        type: 'select',
        required: false,
        defaultValue: 'utf-8',
        validation: {
          options: ['utf-8', 'utf-16', 'ascii', 'iso-8859-1', 'base64', 'hex'],
        },
        description: 'Character encoding for the output data',
      },
      {
        key: 'compression',
        name: 'Compression',
        type: 'select',
        required: false,
        defaultValue: 'none',
        validation: {
          options: ['none', 'gzip', 'deflate', 'brotli'],
        },
        description: 'Compression method for the output data',
      },
      {
        key: 'destination',
        name: 'Output Destination',
        type: 'select',
        required: false,
        defaultValue: 'console',
        validation: {
          options: ['console', 'file', 'http', 'clipboard', 'variable'],
        },
        description: 'Where to send the output data',
      },
      {
        key: 'destinationPath',
        name: 'Destination Path',
        type: 'text',
        required: false,
        description:
          'File path or URL for output destination (when destination is file or http)',
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

  // Trigger Nodes
  injector: {
    type: 'injector',
    name: 'Injector',
    category: 'trigger',
    description:
      'Triggers workflow execution at scheduled intervals or manually',
    inputs: [],
    outputs: [
      {
        id: 'output',
        name: 'Output',
        dataType: 'any',
        required: false,
        description: 'Triggered payload output',
      },
    ],
    properties: [
      {
        key: 'label',
        name: 'Label',
        type: 'text',
        required: true,
        defaultValue: 'Injector',
        description: 'Display name for the injector node',
      },
      {
        key: 'triggerType',
        name: 'Trigger Type',
        type: 'select',
        required: true,
        defaultValue: 'manual',
        validation: {
          options: ['manual', 'interval', 'cron', 'webhook'],
        },
        description: 'How the injector is triggered',
      },
      {
        key: 'payload',
        name: 'Payload',
        type: 'textarea',
        required: false,
        defaultValue: '{}',
        description: 'JSON payload to inject when triggered',
      },
      {
        key: 'payloadType',
        name: 'Payload Type',
        type: 'select',
        required: false,
        defaultValue: 'json',
        validation: {
          options: [
            'json',
            'string',
            'number',
            'boolean',
            'timestamp',
            'buffer',
          ],
        },
        description: 'Type of payload data',
      },
      {
        key: 'interval',
        name: 'Interval (seconds)',
        type: 'number',
        required: false,
        defaultValue: 60,
        description: 'Interval in seconds for interval trigger type',
      },
      {
        key: 'cronExpression',
        name: 'Cron Expression',
        type: 'text',
        required: false,
        defaultValue: '0 * * * * *',
        description:
          'Cron expression for scheduled triggers (e.g., "0 * * * * *" for every minute)',
      },
      {
        key: 'autoStart',
        name: 'Auto Start',
        type: 'boolean',
        required: false,
        defaultValue: false,
        description: 'Start trigger automatically when workflow runs',
      },
      {
        key: 'repeatCount',
        name: 'Repeat Count',
        type: 'number',
        required: false,
        defaultValue: 0,
        description: 'Number of times to repeat (0 = infinite)',
      },
    ],
    validation: {
      required: ['label', 'triggerType'],
      custom: (node: any, _context: ValidationContext): ValidationResult => {
        const errors: ValidationError[] = [];
        const warnings: ValidationWarning[] = [];

        const triggerType = node.data?.properties?.triggerType;
        const interval = node.data?.properties?.interval;
        const cronExpression = node.data?.properties?.cronExpression;
        const payload = node.data?.properties?.payload;

        // Validate interval for interval trigger
        if (triggerType === 'interval' && (!interval || interval < 1)) {
          errors.push({
            id: `${node.id}_invalid_interval`,
            type: 'INVALID_FORMAT' as const,
            severity: 'error' as const,
            message: 'Interval must be at least 1 second for interval trigger',
            nodeId: node.id,
            property: 'interval',
            suggestedFix: 'Set interval to a positive number',
          });
        }

        // Validate cron expression for cron trigger
        if (triggerType === 'cron' && !cronExpression) {
          errors.push({
            id: `${node.id}_missing_cron`,
            type: 'MISSING_REQUIRED_INPUT' as const,
            severity: 'error' as const,
            message: 'Cron expression is required for cron trigger',
            nodeId: node.id,
            property: 'cronExpression',
            suggestedFix: 'Provide a valid cron expression',
          });
        }

        // Validate JSON payload if provided
        if (payload && payload.trim()) {
          try {
            JSON.parse(payload);
          } catch (error) {
            warnings.push({
              id: `${node.id}_invalid_json`,
              type: 'INVALID_FORMAT' as const,
              severity: 'warning' as const,
              message: 'Payload is not valid JSON',
              nodeId: node.id,
              property: 'payload',
              suggestedFix: 'Check JSON syntax in payload',
            });
          }
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
        };
      },
    },
  },

  // Local AI Tool Nodes
  'ai-local-ollama': {
    type: 'ai-local-ollama',
    name: 'Ollama AI',
    category: 'ai-local',
    description: 'Local Ollama AI model runner for inference',
    inputs: [
      {
        id: 'prompt',
        name: 'Prompt',
        dataType: 'string',
        required: true,
        description: 'Input prompt for the AI model',
      },
      {
        id: 'context',
        name: 'Context',
        dataType: 'string',
        required: false,
        description: 'Additional context for the AI model',
      },
    ],
    outputs: [
      {
        id: 'response',
        name: 'AI Response',
        dataType: 'string',
        required: false,
        description: 'Response from the Ollama AI model',
      },
    ],
    properties: [
      {
        key: 'model',
        name: 'Model',
        type: 'text',
        required: true,
        defaultValue: 'llama2',
        description: 'Ollama model to use (e.g., llama2, codellama)',
      },
      {
        key: 'temperature',
        name: 'Temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        description: 'Model temperature (0.0 to 1.0)',
      },
      {
        key: 'maxTokens',
        name: 'Max Tokens',
        type: 'number',
        required: false,
        defaultValue: 1000,
        description: 'Maximum number of tokens to generate',
      },
    ],
    validation: {
      required: ['model'],
    },
  },

  'ai-local-llamacpp': {
    type: 'ai-local-llamacpp',
    name: 'Llama.cpp AI',
    category: 'ai-local',
    description: 'Local Llama.cpp AI inference using Python bindings',
    inputs: [
      {
        id: 'prompt',
        name: 'Prompt',
        dataType: 'string',
        required: true,
        description: 'Input prompt for the AI model',
      },
      {
        id: 'context',
        name: 'Context',
        dataType: 'string',
        required: false,
        description: 'Additional context for the AI model',
      },
    ],
    outputs: [
      {
        id: 'response',
        name: 'AI Response',
        dataType: 'string',
        required: false,
        description: 'Response from the Llama.cpp AI model',
      },
    ],
    properties: [
      {
        key: 'modelPath',
        name: 'Model Path',
        type: 'text',
        required: true,
        defaultValue: 'models/llama-2-7b-chat.gguf',
        description: 'Path to the GGUF model file',
      },
      {
        key: 'temperature',
        name: 'Temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        description: 'Model temperature (0.0 to 1.0)',
      },
      {
        key: 'maxTokens',
        name: 'Max Tokens',
        type: 'number',
        required: false,
        defaultValue: 1000,
        description: 'Maximum number of tokens to generate',
      },
      {
        key: 'nCtx',
        name: 'Context Length',
        type: 'number',
        required: false,
        defaultValue: 2048,
        description: 'Context window size',
      },
    ],
    validation: {
      required: ['modelPath'],
    },
  },

  'ai-local-claude-code-cli': {
    type: 'ai-local-claude-code-cli',
    name: 'Claude Code CLI',
    category: 'ai-local',
    description: 'Anthropic Claude Code CLI for local AI assistance',
    inputs: [
      {
        id: 'prompt',
        name: 'Prompt',
        dataType: 'string',
        required: true,
        description: 'Input prompt for Claude Code CLI',
      },
      {
        id: 'context',
        name: 'Context',
        dataType: 'string',
        required: false,
        description: 'Additional context or file content',
      },
    ],
    outputs: [
      {
        id: 'response',
        name: 'Claude Response',
        dataType: 'string',
        required: false,
        description: 'Response from Claude Code CLI',
      },
    ],
    properties: [
      {
        key: 'task',
        name: 'Task Type',
        type: 'select',
        required: false,
        defaultValue: 'ask',
        validation: {
          options: ['ask', 'code', 'review', 'explain', 'debug'],
        },
        description: 'Type of task for Claude Code CLI',
      },
      {
        key: 'model',
        name: 'Model',
        type: 'select',
        required: false,
        defaultValue: 'claude-3-5-sonnet',
        validation: {
          options: ['claude-3-5-sonnet', 'claude-3-opus', 'claude-3-haiku'],
        },
        description: 'Claude model to use',
      },
      {
        key: 'project',
        name: 'Project Path',
        type: 'text',
        required: false,
        description: 'Path to project directory for context',
      },
    ],
    validation: {
      required: [],
    },
  },

  'ai-local-github-copilot-cli': {
    type: 'ai-local-github-copilot-cli',
    name: 'GitHub Copilot CLI',
    category: 'ai-local',
    description: 'GitHub Copilot CLI for code suggestions and assistance',
    inputs: [
      {
        id: 'prompt',
        name: 'Prompt',
        dataType: 'string',
        required: true,
        description: 'Input prompt for GitHub Copilot',
      },
      {
        id: 'code',
        name: 'Code Context',
        dataType: 'string',
        required: false,
        description: 'Existing code for context',
      },
    ],
    outputs: [
      {
        id: 'response',
        name: 'Copilot Response',
        dataType: 'string',
        required: false,
        description: 'Response from GitHub Copilot CLI',
      },
      {
        id: 'suggestions',
        name: 'Code Suggestions',
        dataType: 'array',
        required: false,
        description: 'Code suggestions from Copilot',
      },
    ],
    properties: [
      {
        key: 'command',
        name: 'Copilot Command',
        type: 'select',
        required: false,
        defaultValue: 'suggest',
        validation: {
          options: ['suggest', 'explain', 'fix', 'test', 'review'],
        },
        description: 'GitHub Copilot command to execute',
      },
      {
        key: 'language',
        name: 'Programming Language',
        type: 'select',
        required: false,
        defaultValue: 'auto',
        validation: {
          options: [
            'auto',
            'javascript',
            'typescript',
            'python',
            'java',
            'go',
            'rust',
            'php',
            'ruby',
          ],
        },
        description: 'Target programming language',
      },
      {
        key: 'format',
        name: 'Output Format',
        type: 'select',
        required: false,
        defaultValue: 'text',
        validation: {
          options: ['text', 'json', 'markdown'],
        },
        description: 'Output format preference',
      },
    ],
    validation: {
      required: [],
    },
  },

  'ai-local-gemini-code-cli': {
    type: 'ai-local-gemini-code-cli',
    name: 'Gemini Code CLI',
    category: 'ai-local',
    description: 'Google Gemini Code CLI for AI-powered coding assistance',
    inputs: [
      {
        id: 'prompt',
        name: 'Prompt',
        dataType: 'string',
        required: true,
        description: 'Input prompt for Gemini Code CLI',
      },
      {
        id: 'code',
        name: 'Code Context',
        dataType: 'string',
        required: false,
        description: 'Code context for analysis',
      },
    ],
    outputs: [
      {
        id: 'response',
        name: 'Gemini Response',
        dataType: 'string',
        required: false,
        description: 'Response from Gemini Code CLI',
      },
      {
        id: 'analysis',
        name: 'Code Analysis',
        dataType: 'object',
        required: false,
        description: 'Code analysis results',
      },
    ],
    properties: [
      {
        key: 'mode',
        name: 'Operation Mode',
        type: 'select',
        required: false,
        defaultValue: 'chat',
        validation: {
          options: ['chat', 'code', 'analyze', 'optimize', 'document'],
        },
        description: 'Gemini operation mode',
      },
      {
        key: 'model',
        name: 'Gemini Model',
        type: 'select',
        required: false,
        defaultValue: 'gemini-pro',
        validation: {
          options: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
        },
        description: 'Gemini model variant',
      },
      {
        key: 'temperature',
        name: 'Temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        description: 'Model temperature (0.0 to 1.0)',
      },
      {
        key: 'maxTokens',
        name: 'Max Tokens',
        type: 'number',
        required: false,
        defaultValue: 2048,
        description: 'Maximum number of tokens to generate',
      },
    ],
    validation: {
      required: [],
    },
  },

  // AI REST Endpoint Nodes
  'ai-rest-openai': {
    type: 'ai-rest-openai',
    name: 'OpenAI GPT',
    category: 'ai-rest',
    description: 'OpenAI GPT API integration for AI inference',
    inputs: [
      {
        id: 'prompt',
        name: 'Prompt',
        dataType: 'string',
        required: true,
        description: 'Input prompt for the AI model',
      },
      {
        id: 'systemMessage',
        name: 'System Message',
        dataType: 'string',
        required: false,
        description: 'System message to set AI behavior',
      },
    ],
    outputs: [
      {
        id: 'response',
        name: 'AI Response',
        dataType: 'string',
        required: false,
        description: 'Response from the OpenAI GPT model',
      },
      {
        id: 'usage',
        name: 'Usage Stats',
        dataType: 'object',
        required: false,
        description: 'Token usage statistics',
      },
    ],
    properties: [
      {
        key: 'model',
        name: 'Model',
        type: 'select',
        required: true,
        defaultValue: 'gpt-4',
        validation: {
          options: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-4o'],
        },
        description: 'OpenAI model to use',
      },
      {
        key: 'temperature',
        name: 'Temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        description: 'Model temperature (0.0 to 2.0)',
      },
      {
        key: 'maxTokens',
        name: 'Max Tokens',
        type: 'number',
        required: false,
        defaultValue: 4096,
        description: 'Maximum number of tokens to generate',
      },
      {
        key: 'apiKey',
        name: 'API Key',
        type: 'password',
        required: true,
        description: 'OpenAI API key',
      },
    ],
    validation: {
      required: ['model', 'apiKey'],
    },
  },

  'ai-rest-anthropic': {
    type: 'ai-rest-anthropic',
    name: 'Anthropic Claude',
    category: 'ai-rest',
    description: 'Anthropic Claude API integration for AI inference',
    inputs: [
      {
        id: 'prompt',
        name: 'Prompt',
        dataType: 'string',
        required: true,
        description: 'Input prompt for the AI model',
      },
      {
        id: 'systemMessage',
        name: 'System Message',
        dataType: 'string',
        required: false,
        description: 'System message to set AI behavior',
      },
    ],
    outputs: [
      {
        id: 'response',
        name: 'AI Response',
        dataType: 'string',
        required: false,
        description: 'Response from the Anthropic Claude model',
      },
      {
        id: 'usage',
        name: 'Usage Stats',
        dataType: 'object',
        required: false,
        description: 'Token usage statistics',
      },
    ],
    properties: [
      {
        key: 'model',
        name: 'Model',
        type: 'select',
        required: true,
        defaultValue: 'claude-3-sonnet-20240229',
        validation: {
          options: [
            'claude-3-sonnet-20240229',
            'claude-3-opus-20240229',
            'claude-3-haiku-20240307',
          ],
        },
        description: 'Anthropic Claude model to use',
      },
      {
        key: 'temperature',
        name: 'Temperature',
        type: 'number',
        required: false,
        defaultValue: 0.7,
        description: 'Model temperature (0.0 to 1.0)',
      },
      {
        key: 'maxTokens',
        name: 'Max Tokens',
        type: 'number',
        required: false,
        defaultValue: 4096,
        description: 'Maximum number of tokens to generate',
      },
      {
        key: 'apiKey',
        name: 'API Key',
        type: 'password',
        required: true,
        description: 'Anthropic API key',
      },
    ],
    validation: {
      required: ['model', 'apiKey'],
    },
  },

  // Script Executor Nodes
  'script-shell': {
    type: 'script-shell',
    name: 'Shell Script',
    category: 'script',
    description: 'Execute shell/bash scripts with input data',
    inputs: [
      {
        id: 'input',
        name: 'Input Data',
        dataType: 'any',
        required: false,
        description: 'Input data for the script',
      },
      {
        id: 'script',
        name: 'Script Content',
        dataType: 'string',
        required: false,
        description: 'Dynamic script content',
      },
    ],
    outputs: [
      {
        id: 'stdout',
        name: 'Standard Output',
        dataType: 'string',
        required: false,
        description: 'Script standard output',
      },
      {
        id: 'stderr',
        name: 'Standard Error',
        dataType: 'string',
        required: false,
        description: 'Script error output',
      },
      {
        id: 'exitCode',
        name: 'Exit Code',
        dataType: 'number',
        required: false,
        description: 'Script exit code',
      },
    ],
    properties: [
      {
        key: 'script',
        name: 'Script',
        type: 'textarea',
        required: true,
        defaultValue: '#!/bin/bash\necho "Hello World"',
        description: 'Shell script to execute',
      },
      {
        key: 'workingDirectory',
        name: 'Working Directory',
        type: 'text',
        required: false,
        description: 'Working directory for script execution',
      },
      {
        key: 'timeout',
        name: 'Timeout (seconds)',
        type: 'number',
        required: false,
        defaultValue: 30,
        description: 'Script execution timeout',
      },
      {
        key: 'environment',
        name: 'Environment Variables',
        type: 'object',
        required: false,
        description: 'Environment variables for the script',
      },
    ],
    validation: {
      required: ['script'],
    },
  },

  'script-python': {
    type: 'script-python',
    name: 'Python Script',
    category: 'script',
    description: 'Execute Python scripts with input data',
    inputs: [
      {
        id: 'input',
        name: 'Input Data',
        dataType: 'any',
        required: false,
        description: 'Input data for the script',
      },
      {
        id: 'script',
        name: 'Script Content',
        dataType: 'string',
        required: false,
        description: 'Dynamic script content',
      },
    ],
    outputs: [
      {
        id: 'stdout',
        name: 'Standard Output',
        dataType: 'string',
        required: false,
        description: 'Script standard output',
      },
      {
        id: 'stderr',
        name: 'Standard Error',
        dataType: 'string',
        required: false,
        description: 'Script error output',
      },
      {
        id: 'result',
        name: 'Return Value',
        dataType: 'any',
        required: false,
        description: 'Script return value',
      },
    ],
    properties: [
      {
        key: 'script',
        name: 'Python Script',
        type: 'textarea',
        required: true,
        defaultValue: 'print("Hello World")\nresult = "success"',
        description: 'Python script to execute',
      },
      {
        key: 'pythonPath',
        name: 'Python Path',
        type: 'text',
        required: false,
        defaultValue: 'python3',
        description: 'Python executable path',
      },
      {
        key: 'timeout',
        name: 'Timeout (seconds)',
        type: 'number',
        required: false,
        defaultValue: 30,
        description: 'Script execution timeout',
      },
      {
        key: 'requirements',
        name: 'Requirements',
        type: 'array',
        required: false,
        description: 'Python package requirements',
      },
    ],
    validation: {
      required: ['script'],
    },
  },

  'script-php': {
    type: 'script-php',
    name: 'PHP Script',
    category: 'script',
    description: 'Execute PHP scripts with input data',
    inputs: [
      {
        id: 'input',
        name: 'Input Data',
        dataType: 'any',
        required: false,
        description: 'Input data for the script',
      },
      {
        id: 'script',
        name: 'Script Content',
        dataType: 'string',
        required: false,
        description: 'Dynamic script content',
      },
    ],
    outputs: [
      {
        id: 'stdout',
        name: 'Standard Output',
        dataType: 'string',
        required: false,
        description: 'Script standard output',
      },
      {
        id: 'stderr',
        name: 'Standard Error',
        dataType: 'string',
        required: false,
        description: 'Script error output',
      },
      {
        id: 'result',
        name: 'Return Value',
        dataType: 'any',
        required: false,
        description: 'Script return value',
      },
    ],
    properties: [
      {
        key: 'script',
        name: 'PHP Script',
        type: 'textarea',
        required: true,
        defaultValue: '<?php\necho "Hello World";\n$result = "success";',
        description: 'PHP script to execute',
      },
      {
        key: 'phpPath',
        name: 'PHP Path',
        type: 'text',
        required: false,
        defaultValue: 'php',
        description: 'PHP executable path',
      },
      {
        key: 'timeout',
        name: 'Timeout (seconds)',
        type: 'number',
        required: false,
        defaultValue: 30,
        description: 'Script execution timeout',
      },
    ],
    validation: {
      required: ['script'],
    },
  },

  'script-nodejs': {
    type: 'script-nodejs',
    name: 'Node.js Script',
    category: 'script',
    description: 'Execute Node.js/JavaScript scripts with input data',
    inputs: [
      {
        id: 'input',
        name: 'Input Data',
        dataType: 'any',
        required: false,
        description: 'Input data for the script',
      },
      {
        id: 'script',
        name: 'Script Content',
        dataType: 'string',
        required: false,
        description: 'Dynamic script content',
      },
    ],
    outputs: [
      {
        id: 'stdout',
        name: 'Standard Output',
        dataType: 'string',
        required: false,
        description: 'Script standard output',
      },
      {
        id: 'stderr',
        name: 'Standard Error',
        dataType: 'string',
        required: false,
        description: 'Script error output',
      },
      {
        id: 'result',
        name: 'Return Value',
        dataType: 'any',
        required: false,
        description: 'Script return value',
      },
    ],
    properties: [
      {
        key: 'script',
        name: 'JavaScript Code',
        type: 'textarea',
        required: true,
        defaultValue: 'console.log("Hello World");\nconst result = "success";',
        description: 'JavaScript/Node.js script to execute',
      },
      {
        key: 'nodePath',
        name: 'Node.js Path',
        type: 'text',
        required: false,
        defaultValue: 'node',
        description: 'Node.js executable path',
      },
      {
        key: 'timeout',
        name: 'Timeout (seconds)',
        type: 'number',
        required: false,
        defaultValue: 30,
        description: 'Script execution timeout',
      },
      {
        key: 'modules',
        name: 'Required Modules',
        type: 'array',
        required: false,
        description: 'Node.js modules to require',
      },
    ],
    validation: {
      required: ['script'],
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
