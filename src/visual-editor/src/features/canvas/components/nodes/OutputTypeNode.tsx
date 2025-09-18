import { type NodeProps } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';
import { Badge } from '../../../../shared/components';

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'json':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'xml':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'yaml':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'markdown':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  return (
    <BaseNode {...props} variant="output">
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium">Type:</span>
          <Badge
            className={`text-xs py-0 ${getTypeColor(outputType)}`}
            variant="outline"
          >
            {outputType.toUpperCase()}
          </Badge>
        </div>

        {format && (
          <div className="space-y-1">
            <span className="text-xs font-medium">Format:</span>
            <div className="text-xs text-muted-foreground truncate">
              {format}
            </div>
          </div>
        )}

        <div className="flex items-center text-xs text-muted-foreground">
          <span>📄 Final Output</span>
        </div>
      </div>
    </BaseNode>
  );
}
