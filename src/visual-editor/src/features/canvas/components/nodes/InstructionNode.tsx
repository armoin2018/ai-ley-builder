import { type NodeProps } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';
import { Badge } from '../../../../shared/components';

export interface InstructionNodeData extends BaseNodeData {
  properties: {
    instructionType?: 'system' | 'user' | 'assistant' | 'tool';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    instruction?: string;
    conditions?: string[];
  };
}

export function InstructionNode(props: NodeProps) {
  const { data } = props;
  const nodeData = data as unknown as InstructionNodeData;
  const instructionType =
    (nodeData.properties?.instructionType as string) || 'system';
  const priority = (nodeData.properties?.priority as string) || 'medium';
  const instruction = nodeData.properties?.instruction as string;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'user':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'assistant':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'tool':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priorityValue: string) => {
    switch (priorityValue) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <BaseNode {...props} variant="instruction">
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">Type:</span>
          <Badge
            className={`text-xs py-0 ${getTypeColor(instructionType)}`}
            variant="outline"
          >
            {instructionType}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">Priority:</span>
          <Badge className={`text-xs py-0 ${getPriorityColor(priority)}`}>
            {priority}
          </Badge>
        </div>

        {instruction && (
          <div className="space-y-1">
            <span className="text-xs font-medium">Instruction:</span>
            <div className="text-xs bg-muted px-2 py-1 rounded max-h-12 overflow-hidden">
              <div className="line-clamp-2">{instruction}</div>
            </div>
          </div>
        )}

        <div className="flex items-center text-xs text-muted-foreground">
          <span>📋 Behavior Rule</span>
        </div>
      </div>
    </BaseNode>
  );
}
