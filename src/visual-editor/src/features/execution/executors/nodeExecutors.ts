import type { ExecutionContext, NodeExecutor } from '../types/execution';

/**
 * Input Node Executor - Provides static data or prompts for user input
 */
export const inputNodeExecutor: NodeExecutor = {
  nodeType: 'input',
  execute: async (
    node: any,
    _inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const dataType = properties.dataType || 'string';
    const defaultValue = properties.defaultValue;

    // In a real implementation, this could prompt the user or use provided variables
    const variableName = properties.label || node.id;
    let value = context.variables[variableName] ?? defaultValue;

    // Type conversion based on dataType
    switch (dataType) {
      case 'number':
        value = value ? parseFloat(value) : 0;
        break;
      case 'boolean':
        value = value === 'true' || value === true;
        break;
      case 'array':
        value = Array.isArray(value) ? value : value ? [value] : [];
        break;
      case 'object':
        value = typeof value === 'object' ? value : {};
        break;
      default:
        value = String(value || '');
    }

    return value;
  },
  timeout: 1000,
};

/**
 * Output Node Executor - Collects and formats final output
 */
export const outputNodeExecutor: NodeExecutor = {
  nodeType: 'output',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const format = properties.format || 'json';
    const input = inputs.input;

    // Store in context outputs
    const outputName = properties.label || node.id;
    context.outputs[outputName] = input;

    // Format the output based on specified format
    switch (format) {
      case 'json':
        return JSON.stringify(input, null, 2);
      case 'csv':
        return Array.isArray(input) ? arrayToCsv(input) : String(input);
      case 'text':
        return String(input);
      case 'xml':
        return objectToXml(input);
      default:
        return input;
    }
  },
  timeout: 2000,
};

/**
 * Transform Node Executor - Applies transformations using JavaScript
 */
export const transformNodeExecutor: NodeExecutor = {
  nodeType: 'transform',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const transformType = properties.transformType || 'map';
    const expression = properties.expression || 'return input;';
    const input = inputs.input;

    try {
      // Create a safe execution context
      const func = new Function('input', 'context', 'console', expression);
      const safeConsole = {
        log: (...args: any[]) => console.log(`[${node.id}]`, ...args),
        warn: (...args: any[]) => console.warn(`[${node.id}]`, ...args),
        error: (...args: any[]) => console.error(`[${node.id}]`, ...args),
      };

      let result;

      switch (transformType) {
        case 'map':
          if (Array.isArray(input)) {
            result = input.map((item, index) =>
              func(item, { ...context, index }, safeConsole)
            );
          } else {
            result = func(input, context, safeConsole);
          }
          break;

        case 'filter':
          if (Array.isArray(input)) {
            result = input.filter((item, index) =>
              func(item, { ...context, index }, safeConsole)
            );
          } else {
            result = func(input, context, safeConsole) ? input : null;
          }
          break;

        case 'reduce':
          if (Array.isArray(input)) {
            result = input.reduce(
              (acc, item, index) =>
                func({ acc, item, index }, context, safeConsole),
              null
            );
          } else {
            result = func(input, context, safeConsole);
          }
          break;

        case 'sort':
          if (Array.isArray(input)) {
            result = [...input].sort((a, b) =>
              func({ a, b }, context, safeConsole)
            );
          } else {
            result = input;
          }
          break;

        case 'group':
          if (Array.isArray(input)) {
            const groups: Record<string, any[]> = {};
            input.forEach((item, index) => {
              const key = String(
                func(item, { ...context, index }, safeConsole)
              );
              if (!groups[key]) groups[key] = [];
              groups[key].push(item);
            });
            result = groups;
          } else {
            result = { [String(func(input, context, safeConsole))]: [input] };
          }
          break;

        case 'custom':
        default:
          result = func(input, context, safeConsole);
          break;
      }

      return result;
    } catch (error) {
      throw new Error(
        `Transform execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
  validate: (node: any) => {
    const expression = node.data?.properties?.expression;
    if (!expression) return false;

    try {
      new Function('input', 'context', 'console', expression);
      return true;
    } catch {
      return false;
    }
  },
  timeout: 5000,
};

/**
 * Filter Node Executor - Filters data based on conditions
 */
export const filterNodeExecutor: NodeExecutor = {
  nodeType: 'filter',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    _context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const condition = properties.condition || 'return true;';
    const input = inputs.input;

    try {
      const func = new Function('item', 'index', 'context', condition);

      let passed: any;
      let failed: any;

      if (Array.isArray(input)) {
        const passedItems: any[] = [];
        const failedItems: any[] = [];

        input.forEach((item, index) => {
          if (func(item, index, _context)) {
            passedItems.push(item);
          } else {
            failedItems.push(item);
          }
        });

        passed = passedItems;
        failed = failedItems;
      } else {
        if (func(input, 0, _context)) {
          passed = input;
          failed = null;
        } else {
          passed = null;
          failed = input;
        }
      }

      return { passed, failed };
    } catch (error) {
      throw new Error(
        `Filter execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
  validate: (node: any) => {
    const condition = node.data?.properties?.condition;
    if (!condition) return false;

    try {
      new Function('item', 'index', 'context', condition);
      return true;
    } catch {
      return false;
    }
  },
  timeout: 3000,
};

/**
 * Join Node Executor - Joins multiple data streams
 */
export const joinNodeExecutor: NodeExecutor = {
  nodeType: 'join',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    _context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const joinType = properties.joinType || 'inner';
    const joinKey = properties.joinKey;

    const input1 = inputs.input1;
    const input2 = inputs.input2;

    if (input1 === undefined || input2 === undefined) {
      throw new Error('Join node requires both input1 and input2');
    }

    switch (joinType) {
      case 'concat':
        // Simple concatenation
        if (Array.isArray(input1) && Array.isArray(input2)) {
          return [...input1, ...input2];
        } else if (Array.isArray(input1)) {
          return [...input1, input2];
        } else if (Array.isArray(input2)) {
          return [input1, ...input2];
        } else {
          return [input1, input2];
        }

      case 'inner':
      case 'left':
      case 'right':
      case 'full':
        if (!joinKey) {
          throw new Error('Join key is required for relational joins');
        }

        return performRelationalJoin(input1, input2, joinKey, joinType);

      default:
        return { input1, input2 };
    }
  },
  timeout: 4000,
};

// Utility functions
function arrayToCsv(arr: any[]): string {
  if (!Array.isArray(arr) || arr.length === 0) return '';

  const headers = Object.keys(arr[0] || {});
  const csvHeaders = headers.join(',');
  const csvRows = arr.map(item =>
    headers
      .map(header => {
        const value = item[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value.replace(/"/g, '""')}"`
          : String(value || '');
      })
      .join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
}

function objectToXml(obj: any): string {
  const toXml = (data: any, tagName = 'root'): string => {
    if (typeof data !== 'object' || data === null) {
      return `<${tagName}>${String(data)}</${tagName}>`;
    }

    if (Array.isArray(data)) {
      return data.map((item, index) => toXml(item, `item${index}`)).join('');
    }

    const entries = Object.entries(data);
    const content = entries.map(([key, value]) => toXml(value, key)).join('');
    return `<${tagName}>${content}</${tagName}>`;
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(obj)}`;
}

function performRelationalJoin(
  left: any[],
  right: any[],
  joinKey: string,
  joinType: string
): any[] {
  if (!Array.isArray(left) || !Array.isArray(right)) {
    throw new Error('Relational joins require array inputs');
  }

  const result: any[] = [];

  switch (joinType) {
    case 'inner':
      left.forEach(leftItem => {
        right.forEach(rightItem => {
          if (leftItem[joinKey] === rightItem[joinKey]) {
            result.push({ ...leftItem, ...rightItem });
          }
        });
      });
      break;

    case 'left':
      left.forEach(leftItem => {
        const matches = right.filter(
          rightItem => leftItem[joinKey] === rightItem[joinKey]
        );
        if (matches.length > 0) {
          matches.forEach(rightItem => {
            result.push({ ...leftItem, ...rightItem });
          });
        } else {
          result.push(leftItem);
        }
      });
      break;

    case 'right':
      right.forEach(rightItem => {
        const matches = left.filter(
          leftItem => leftItem[joinKey] === rightItem[joinKey]
        );
        if (matches.length > 0) {
          matches.forEach(leftItem => {
            result.push({ ...leftItem, ...rightItem });
          });
        } else {
          result.push(rightItem);
        }
      });
      break;

    case 'full':
      const processedLeft = new Set<number>();
      const processedRight = new Set<number>();

      left.forEach((leftItem, leftIndex) => {
        right.forEach((rightItem, rightIndex) => {
          if (leftItem[joinKey] === rightItem[joinKey]) {
            result.push({ ...leftItem, ...rightItem });
            processedLeft.add(leftIndex);
            processedRight.add(rightIndex);
          }
        });
      });

      // Add unmatched left items
      left.forEach((leftItem, index) => {
        if (!processedLeft.has(index)) {
          result.push(leftItem);
        }
      });

      // Add unmatched right items
      right.forEach((rightItem, index) => {
        if (!processedRight.has(index)) {
          result.push(rightItem);
        }
      });
      break;
  }

  return result;
}

/**
 * Local AI Executors
 */
export const ollamaNodeExecutor: NodeExecutor = {
  nodeType: 'ai-local-ollama',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const model = properties.model || 'llama2';
    const temperature = properties.temperature || 0.7;
    const maxTokens = properties.maxTokens || 1000;

    const prompt = inputs.prompt || '';
    const contextInput = inputs.context || '';

    // In a real implementation, this would call Ollama API
    // For now, return a placeholder response
    return `[Ollama ${model}] Response to: "${prompt}" with context: "${contextInput}"`;
  },
  timeout: 30000,
};

export const llamacppNodeExecutor: NodeExecutor = {
  nodeType: 'ai-local-llamacpp',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const modelPath = properties.modelPath || 'models/llama-2-7b-chat.gguf';
    const temperature = properties.temperature || 0.7;
    const maxTokens = properties.maxTokens || 1000;

    const prompt = inputs.prompt || '';
    const contextInput = inputs.context || '';

    // In a real implementation, this would call Llama.cpp Python bindings
    // For now, return a placeholder response
    return `[Llama.cpp ${modelPath}] Response to: "${prompt}" with context: "${contextInput}"`;
  },
  timeout: 30000,
};

export const claudeCodeCliExecutor: NodeExecutor = {
  nodeType: 'ai-local-claude-code-cli',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const task = properties.task || 'ask';
    const model = properties.model || 'claude-3-5-sonnet';
    const project = properties.project;

    const prompt = inputs.prompt || '';
    const contextInput = inputs.context || '';

    // In a real implementation, this would call Claude Code CLI
    // Example: claude ask "How to implement this function?" --project=./my-project
    return `[Claude Code CLI - ${task}] ${model} response to: "${prompt}" with context: "${contextInput}" ${project ? `in project: ${project}` : ''}`;
  },
  timeout: 60000,
};

export const githubCopilotCliExecutor: NodeExecutor = {
  nodeType: 'ai-local-github-copilot-cli',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const command = properties.command || 'suggest';
    const language = properties.language || 'auto';
    const format = properties.format || 'text';

    const prompt = inputs.prompt || '';
    const codeContext = inputs.code || '';

    // In a real implementation, this would call GitHub Copilot CLI
    // Example: gh copilot suggest "write a function to sort an array"
    return {
      response: `[GitHub Copilot CLI - ${command}] Suggestion for: "${prompt}" in ${language}`,
      suggestions: [
        `// Generated ${language} code suggestion`,
        `function example() { /* ${prompt} */ }`,
      ],
    };
  },
  timeout: 60000,
};

export const geminiCodeCliExecutor: NodeExecutor = {
  nodeType: 'ai-local-gemini-code-cli',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const mode = properties.mode || 'chat';
    const model = properties.model || 'gemini-pro';
    const temperature = properties.temperature || 0.7;
    const maxTokens = properties.maxTokens || 2048;

    const prompt = inputs.prompt || '';
    const codeContext = inputs.code || '';

    // In a real implementation, this would call Gemini Code CLI
    // Example: gemini code --mode=analyze "explain this function"
    return {
      response: `[Gemini Code CLI - ${mode}] ${model} response to: "${prompt}"`,
      analysis: {
        mode,
        model,
        temperature,
        tokensUsed: Math.floor(Math.random() * maxTokens),
        codeQuality: 'good',
        suggestions: ['Consider adding error handling', 'Add type annotations'],
      },
    };
  },
  timeout: 60000,
};

/**
 * AI REST Executors
 */
export const openaiNodeExecutor: NodeExecutor = {
  nodeType: 'ai-rest-openai',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const model = properties.model || 'gpt-4';
    const temperature = properties.temperature || 0.7;
    const maxTokens = properties.maxTokens || 4096;
    const apiKey = properties.apiKey;

    const prompt = inputs.prompt || '';
    const systemMessage = inputs.systemMessage || '';

    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    // In a real implementation, this would call OpenAI API
    // For now, return a placeholder response
    return {
      response: `[OpenAI ${model}] Response to: "${prompt}" with system: "${systemMessage}"`,
      usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150 },
    };
  },
  timeout: 60000,
};

export const anthropicNodeExecutor: NodeExecutor = {
  nodeType: 'ai-rest-anthropic',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const model = properties.model || 'claude-3-sonnet-20240229';
    const temperature = properties.temperature || 0.7;
    const maxTokens = properties.maxTokens || 4096;
    const apiKey = properties.apiKey;

    const prompt = inputs.prompt || '';
    const systemMessage = inputs.systemMessage || '';

    if (!apiKey) {
      throw new Error('Anthropic API key is required');
    }

    // In a real implementation, this would call Anthropic API
    // For now, return a placeholder response
    return {
      response: `[Anthropic ${model}] Response to: "${prompt}" with system: "${systemMessage}"`,
      usage: { inputTokens: 50, outputTokens: 100, totalTokens: 150 },
    };
  },
  timeout: 60000,
};

/**
 * Script Executors
 */
export const shellScriptExecutor: NodeExecutor = {
  nodeType: 'script-shell',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const script = inputs.script || properties.script || '';
    const workingDirectory = properties.workingDirectory;
    const timeout = properties.timeout || 30;
    const environment = properties.environment || {};

    const inputData = inputs.input;

    // In a real implementation, this would execute the shell script
    // For now, return a placeholder response
    return {
      stdout: `[Shell Script] Executed: ${script.substring(0, 50)}... with input: ${JSON.stringify(inputData)}`,
      stderr: '',
      exitCode: 0,
    };
  },
  timeout: 30000,
};

export const pythonScriptExecutor: NodeExecutor = {
  nodeType: 'script-python',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const script = inputs.script || properties.script || '';
    const pythonPath = properties.pythonPath || 'python3';
    const timeout = properties.timeout || 30;
    const requirements = properties.requirements || [];

    const inputData = inputs.input;

    // In a real implementation, this would execute the Python script
    // For now, return a placeholder response
    return {
      stdout: `[Python Script] Executed: ${script.substring(0, 50)}... with input: ${JSON.stringify(inputData)}`,
      stderr: '',
      result: 'success',
    };
  },
  timeout: 30000,
};

export const phpScriptExecutor: NodeExecutor = {
  nodeType: 'script-php',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const script = inputs.script || properties.script || '';
    const phpPath = properties.phpPath || 'php';
    const timeout = properties.timeout || 30;

    const inputData = inputs.input;

    // In a real implementation, this would execute the PHP script
    // For now, return a placeholder response
    return {
      stdout: `[PHP Script] Executed: ${script.substring(0, 50)}... with input: ${JSON.stringify(inputData)}`,
      stderr: '',
      result: 'success',
    };
  },
  timeout: 30000,
};

export const nodejsScriptExecutor: NodeExecutor = {
  nodeType: 'script-nodejs',
  execute: async (
    node: any,
    inputs: Record<string, any>,
    context: ExecutionContext
  ) => {
    const properties = node.data?.properties || {};
    const script = inputs.script || properties.script || '';
    const nodePath = properties.nodePath || 'node';
    const timeout = properties.timeout || 30;
    const modules = properties.modules || [];

    const inputData = inputs.input;

    // In a real implementation, this would execute the Node.js script
    // For now, return a placeholder response
    return {
      stdout: `[Node.js Script] Executed: ${script.substring(0, 50)}... with input: ${JSON.stringify(inputData)}`,
      stderr: '',
      result: 'success',
    };
  },
  timeout: 30000,
};

// Export all executors
export const nodeExecutors: Record<string, NodeExecutor> = {
  input: inputNodeExecutor,
  output: outputNodeExecutor,
  transform: transformNodeExecutor,
  filter: filterNodeExecutor,
  join: joinNodeExecutor,

  // Local AI executors
  'ai-local-ollama': ollamaNodeExecutor,
  'ai-local-llamacpp': llamacppNodeExecutor,
  'ai-local-claude-code-cli': claudeCodeCliExecutor,
  'ai-local-github-copilot-cli': githubCopilotCliExecutor,
  'ai-local-gemini-code-cli': geminiCodeCliExecutor,

  // AI REST executors
  'ai-rest-openai': openaiNodeExecutor,
  'ai-rest-anthropic': anthropicNodeExecutor,

  // Script executors
  'script-shell': shellScriptExecutor,
  'script-python': pythonScriptExecutor,
  'script-php': phpScriptExecutor,
  'script-nodejs': nodejsScriptExecutor,
};
