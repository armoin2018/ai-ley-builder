import { type NodeProps } from '@xyflow/react';
import { Badge } from '../../../../shared/components';
import { BaseNode, type BaseNodeData } from './BaseNode';

export interface OutputTypeNodeData extends BaseNodeData {
  properties: {
    outputType?: 'json' | 'xml' | 'yaml' | 'text' | 'markdown';
    format?: string;
    template?: string;
  };
}

export function OutputTypeNode(props: NodeProps) {
  const { data } = props;
  const nodeData = data as unknown as OutputTypeNodeData;
  const outputType = (nodeData.properties?.outputType as string) || 'text';
  const format = nodeData.properties?.format || '';

  const getTypeColor = () => {
    // All badges should use white text for consistency
    return 'text-white border-white/20';
  };

  return (
    <BaseNode {...props} variant="output">
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-white">Type:</span>
          <Badge
            className={`text-xs py-0 ${getTypeColor()}`}
            variant="outline"
          >
            {outputType.toUpperCase()}
          </Badge>
        </div>

        {format && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-white">Format:</span>
            <div className="text-xs text-white truncate">
              {format}
            </div>
          </div>
        )}

        <div className="flex items-center text-xs text-white">
          <span>📄 Final Output</span>
        </div>
      </div>
    </BaseNode>
  );
}
