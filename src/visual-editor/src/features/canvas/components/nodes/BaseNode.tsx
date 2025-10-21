import { Handle, type NodeProps, Position } from '@xyflow/react';
import { type ReactNode, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../../../shared/components';
import { cn } from '../../../../utils';

/**
 * Base data structure for all node types
 */
export interface BaseNodeData {
  /** Display label for the node */
  label: string;
  /** Optional description shown below the label */
  description?: string;
  /** Node-specific properties (varies by node type) */
  properties: Record<string, unknown>;
}

/**
 * Configuration for individual connection handles (R19)
 *
 * @example
 * ```tsx
 * const handleConfig: HandleConfig = {
 *   id: 'primary-input',
 *   position: Position.Left,
 *   className: 'w-3 h-3 bg-blue-400',
 *   label: 'Primary Input'
 * };
 * ```
 */
export interface HandleConfig {
  /** Unique identifier for the handle (optional for single handles) */
  id?: string;
  /** Position on the node edge (Top, Bottom, Left, Right) */
  position: Position;
  /** Custom CSS classes for styling */
  className?: string;
  /** Tooltip label shown on hover */
  label?: string;
}

/**
 * Props for BaseNode component with R19 flexible connection points
 *
 * @see {@link https://github.com/ai-ley-builder Requirements R19}
 */
interface BaseNodeProps extends NodeProps {
  /** Child elements rendered inside the node card */
  children?: ReactNode;
  /** Additional CSS classes for the node container */
  className?: string;
  /** Visual variant determining node colors and styling */
  variant?:
    | 'command'
    | 'logic'
    | 'output'
    | 'loop'
    | 'custom'
    | 'persona'
    | 'instruction'
    | 'trigger';
  /** Whether to show connection handles (default: true) */
  showHandles?: boolean;
  /**
   * R19: Flexible input handle positions
   *
   * @example
   * ```tsx
   * // Single input from top (default)
   * inputPositions={[Position.Top]}
   *
   * // Multiple inputs from top and left
   * inputPositions={[Position.Top, Position.Left]}
   * ```
   */
  inputPositions?: Position[];
  /**
   * R19: Flexible output handle positions
   *
   * @example
   * ```tsx
   * // Single output to bottom (default)
   * outputPositions={[Position.Bottom]}
   *
   * // Multiple outputs to bottom and right
   * outputPositions={[Position.Bottom, Position.Right]}
   * ```
   */
  outputPositions?: Position[];
  /**
   * R19: Advanced handle configuration for complex nodes
   *
   * Use this for full control over handle IDs, positions, styling, and labels.
   * Takes precedence over inputPositions/outputPositions.
   *
   * @example
   * ```tsx
   * handleConfig={{
   *   inputs: [
   *     { id: 'data-in', position: Position.Left, label: 'Data Input' },
   *     { id: 'control-in', position: Position.Top, label: 'Control' }
   *   ],
   *   outputs: [
   *     { id: 'success', position: Position.Right, label: 'Success', className: 'bg-green-400' },
   *     { id: 'error', position: Position.Bottom, label: 'Error', className: 'bg-red-400' }
   *   ]
   * }}
   * ```
   */
  handleConfig?: {
    /** Input handle configurations */
    inputs?: HandleConfig[];
    /** Output handle configurations */
    outputs?: HandleConfig[];
  };
  /** Callback when node label is changed */
  onLabelChange?: (newLabel: string) => void;
  /** Callback when node description is changed */
  onDescriptionChange?: (newDescription: string) => void;
}

const variantClasses = {
  command:
    'border-2 border-blue-500 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200',
  logic:
    'border-2 border-purple-500 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200',
  output:
    'border-2 border-green-500 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200',
  loop: 'border-2 border-orange-500 bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200',
  custom:
    'border-2 border-indigo-500 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200',
  persona:
    'border-2 border-pink-500 bg-gradient-to-br from-pink-500 to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200',
  instruction:
    'border-2 border-teal-500 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200',
  trigger:
    'border-2 border-red-500 bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200',
};

export function BaseNode({
  data,
  selected,
  className,
  variant = 'command',
  showHandles = true,
  inputPositions,
  outputPositions,
  handleConfig,
  children,
  onLabelChange,
  onDescriptionChange,
}: BaseNodeProps) {
  const nodeData = data as unknown as BaseNodeData;
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempLabel, setTempLabel] = useState(nodeData.label);
  const [tempDescription, setTempDescription] = useState(
    nodeData.description || ''
  );

  // R19: Determine handle positions - use custom config, or positions array, or defaults
  const getInputHandles = (): HandleConfig[] => {
    if (handleConfig?.inputs) return handleConfig.inputs;
    if (inputPositions) {
      return inputPositions.map((pos, idx) => ({
        id: inputPositions.length > 1 ? `input-${idx}` : undefined,
        position: pos,
        className: 'w-3 h-3 bg-gray-400 border-2 border-white',
      }));
    }
    // Default: single input at top (backward compatible)
    return [
      {
        position: Position.Top,
        className: 'w-3 h-3 bg-gray-400 border-2 border-white',
      },
    ];
  };

  const getOutputHandles = (): HandleConfig[] => {
    if (handleConfig?.outputs) return handleConfig.outputs;
    if (outputPositions) {
      return outputPositions.map((pos, idx) => ({
        id: outputPositions.length > 1 ? `output-${idx}` : undefined,
        position: pos,
        className: 'w-3 h-3 bg-gray-400 border-2 border-white',
      }));
    }
    // Default: single output at bottom (backward compatible)
    return [
      {
        position: Position.Bottom,
        className: 'w-3 h-3 bg-gray-400 border-2 border-white',
      },
    ];
  };

  const inputHandles = getInputHandles();
  const outputHandles = getOutputHandles();

  const handleLabelSave = () => {
    if (onLabelChange && tempLabel.trim()) {
      onLabelChange(tempLabel.trim());
    }
    setIsEditingLabel(false);
  };

  const handleDescriptionSave = () => {
    if (onDescriptionChange) {
      onDescriptionChange(tempDescription.trim());
    }
    setIsEditingDescription(false);
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleLabelSave();
    } else if (e.key === 'Escape') {
      setTempLabel(nodeData.label);
      setIsEditingLabel(false);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleDescriptionSave();
    } else if (e.key === 'Escape') {
      setTempDescription(nodeData.description || '');
      setIsEditingDescription(false);
    }
  };
  return (
    <>
      {showHandles && (
        <>
          {/* R19: Render input handles at flexible positions */}
          {inputHandles.map((handle, idx) => (
            <Handle
              key={`input-${handle.id || idx}`}
              type="target"
              id={handle.id}
              position={handle.position}
              className={handle.className}
              title={handle.label || 'Input'}
            />
          ))}
          {/* R19: Render output handles at flexible positions */}
          {outputHandles.map((handle, idx) => (
            <Handle
              key={`output-${handle.id || idx}`}
              type="source"
              id={handle.id}
              position={handle.position}
              className={handle.className}
              title={handle.label || 'Output'}
            />
          ))}
        </>
      )}

      <Card
        className={cn(
          'min-w-[180px] max-w-[250px] transition-all duration-200 cursor-pointer',
          'hover:scale-102 hover:shadow-2xl',
          variantClasses[variant],
          {
            'ring-4 ring-blue-400 ring-offset-2 shadow-2xl scale-105 transform':
              selected,
            'hover:ring-2 hover:ring-white hover:ring-opacity-50': !selected,
          },
          className
        )}
      >
        <CardHeader className="pb-2">
          {isEditingLabel ? (
            <input
              type="text"
              value={tempLabel}
              onChange={e => setTempLabel(e.target.value)}
              onBlur={handleLabelSave}
              onKeyDown={handleLabelKeyDown}
              className="font-semibold text-sm w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-white/50 rounded px-1 text-white placeholder-white/70"
              autoFocus
            />
          ) : (
            <h3
              className="font-semibold text-sm truncate cursor-pointer hover:bg-white/20 rounded px-1 py-0.5 transition-colors text-white"
              title={`${nodeData.label} (double-click to edit)`}
              onDoubleClick={() => {
                setTempLabel(nodeData.label);
                setIsEditingLabel(true);
              }}
            >
              {nodeData.label}
            </h3>
          )}

          {nodeData.description || isEditingDescription ? (
            isEditingDescription ? (
              <input
                type="text"
                value={tempDescription}
                onChange={e => setTempDescription(e.target.value)}
                onBlur={handleDescriptionSave}
                onKeyDown={handleDescriptionKeyDown}
                className="text-xs text-white w-full bg-transparent border-none outline-none focus:ring-2 focus:ring-white/50 rounded px-1 placeholder-white/70"
                placeholder="Add description..."
                autoFocus
              />
            ) : (
              <p
                className="text-xs text-white/90 line-clamp-2 cursor-pointer hover:bg-white/20 rounded px-1 py-0.5 transition-colors"
                title={`${nodeData.description || 'Add description'} (double-click to edit)`}
                onDoubleClick={() => {
                  setTempDescription(nodeData.description || '');
                  setIsEditingDescription(true);
                }}
              >
                {nodeData.description || 'Double-click to add description'}
              </p>
            )
          ) : null}
        </CardHeader>

        {children && (
          <CardContent className="pt-0 pb-3">{children}</CardContent>
        )}
      </Card>
    </>
  );
}
