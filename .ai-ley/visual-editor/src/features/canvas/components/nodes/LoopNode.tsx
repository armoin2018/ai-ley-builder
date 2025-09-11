import { Handle, type NodeProps, Position } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';
import { Badge } from '../../../../shared/components';

export interface LoopNodeData extends BaseNodeData {
  properties: {
    loopType?: 'for' | 'while' | 'forEach';
    condition?: string;
    maxIterations?: number;
    iteratorVariable?: string;
  };
}

export function LoopNode(props: NodeProps) {
  const { data } = props;
  const nodeData = data as unknown as LoopNodeData;
  const loopType = (nodeData.properties.loopType as string) || 'for';
  const maxIterations = nodeData.properties.maxIterations as number;
  const iteratorVariable = nodeData.properties.iteratorVariable as string;

  return (
    <>
      {/* Custom handles for loop node */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      {/* Main flow output */}
      <Handle
        type="source"
        position={Position.Right}
        id="next"
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
      {/* Loop body output */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="loop"
        className="w-3 h-3 bg-orange-400 border-2 border-white"
      />
      {/* Loop body input */}
      <Handle
        type="target"
        position={Position.Left}
        id="loopback"
        className="w-3 h-3 bg-orange-400 border-2 border-white"
      />

      <BaseNode {...props} variant="loop" showHandles={false}>
        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">Type:</span>
            <Badge variant="outline" className="text-xs py-0">
              {loopType}
            </Badge>
          </div>

          {maxIterations && (
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">Max:</span>
              <Badge variant="secondary" className="text-xs py-0">
                {maxIterations}
              </Badge>
            </div>
          )}

          {iteratorVariable && (
            <div className="space-y-1">
              <span className="text-xs font-medium">Variable:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded block truncate">
                {iteratorVariable}
              </code>
            </div>
          )}

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>🔄 Loop</span>
            <span>➡️ Next</span>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
