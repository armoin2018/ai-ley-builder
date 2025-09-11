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

// Export all executors
export const nodeExecutors: Record<string, NodeExecutor> = {
  input: inputNodeExecutor,
  output: outputNodeExecutor,
  transform: transformNodeExecutor,
  filter: filterNodeExecutor,
  join: joinNodeExecutor,
};
