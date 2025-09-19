import { type NodeProps } from '@xyflow/react';
import { Badge } from '../../../../shared/components';
import { BaseNode, type BaseNodeData } from './BaseNode';

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

  const getTypeColor = () => {
    // All badges should use white text for consistency
    return 'text-white border-white/20';
  };

  const getPriorityColor = () => {
    // All badges should use white text for consistency
    return 'text-white border-white/20';
  };

  return (
    <BaseNode {...props} variant="instruction">
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-white">Type:</span>
          <Badge
            className={`text-xs py-0 ${getTypeColor()}`}
            variant="outline"
          >
            {instructionType}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-white">Priority:</span>
          <Badge className={`text-xs py-0 ${getPriorityColor()}`}>
            {priority}
          </Badge>
        </div>

        {instruction && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-white">Instruction:</span>
            <div className="text-xs bg-black/20 text-white px-2 py-1 rounded max-h-12 overflow-hidden">
              <div className="line-clamp-2">{instruction}</div>
            </div>
          </div>
        )}

        <div className="flex items-center text-xs text-white">
          <span>📋 Behavior Rule</span>
        </div>
      </div>
    </BaseNode>
  );
}
