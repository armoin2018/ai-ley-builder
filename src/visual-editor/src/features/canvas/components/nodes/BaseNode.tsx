import { type ReactNode, useState } from 'react';
import { Handle, type NodeProps, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '../../../../shared/components';
import { cn } from '../../../../utils';

export interface BaseNodeData {
  label: string;
  description?: string;
  properties: Record<string, unknown>;
}

interface BaseNodeProps extends NodeProps {
  children?: ReactNode;
  className?: string;
  variant?:
    | 'command'
    | 'logic'
    | 'output'
    | 'loop'
    | 'custom'
    | 'persona'
    | 'instruction';
  showHandles?: boolean;
  onLabelChange?: (newLabel: string) => void;
  onDescriptionChange?: (newDescription: string) => void;
}

const variantClasses = {
  command: 'border border-blue-500 bg-blue-500 text-white shadow-sm',
  logic: 'border border-purple-500 bg-purple-500 text-white shadow-sm',
  output: 'border border-green-500 bg-green-500 text-white shadow-sm',
  loop: 'border border-orange-500 bg-orange-500 text-white shadow-sm',
  custom: 'border border-indigo-500 bg-indigo-500 text-white shadow-sm',
  persona: 'border border-pink-500 bg-pink-500 text-white shadow-sm',
  instruction: 'border border-teal-500 bg-teal-500 text-white shadow-sm',
};

export function BaseNode({
  data,
  selected,
  className,
  variant = 'command',
  showHandles = true,
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
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 bg-gray-400 border-2 border-white"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 bg-gray-400 border-2 border-white"
          />
        </>
      )}

      <Card
        className={cn(
          'min-w-[180px] max-w-[250px] transition-all duration-200',
          variantClasses[variant],
          {
            'ring-4 ring-blue-500 ring-offset-2 shadow-xl scale-105': selected,
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
