import { Handle, type NodeProps, Position, useReactFlow } from '@xyflow/react';
import { Badge } from '../../../../shared/components';
import { BaseNode, type BaseNodeData } from './BaseNode';

export interface LogicConditionNodeData extends BaseNodeData {
  properties: {
    condition?: string;
    trueLabel?: string;
    falseLabel?: string;
  };
}

export function LogicConditionNode(props: NodeProps) {
  const { data, id } = props;
  const { setNodes } = useReactFlow();
  const nodeData = data as unknown as LogicConditionNodeData;
  const condition = nodeData.properties?.condition || '';
  const trueLabel = (nodeData.properties?.trueLabel as string) || 'True';
  const falseLabel = (nodeData.properties?.falseLabel as string) || 'False';

  const handleLabelChange = (newLabel: string) => {
    setNodes(nodes =>
      nodes.map(node =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                label: newLabel,
              },
            }
          : node
      )
    );
  };

  const handleDescriptionChange = (newDescription: string) => {
    setNodes(nodes =>
      nodes.map(node =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                description: newDescription,
              },
            }
          : node
      )
    );
  };

  return (
    <>
      {/* Custom handles for logic node - input at top, two outputs */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        style={{ left: '25%' }}
        className="w-3 h-3 bg-green-400 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        style={{ left: '75%' }}
        className="w-3 h-3 bg-red-400 border-2 border-white"
      />

      <BaseNode
        {...props}
        variant="logic"
        showHandles={false}
        onLabelChange={handleLabelChange}
        onDescriptionChange={handleDescriptionChange}
      >
        <div className="space-y-2">
          {condition && (
            <div className="space-y-1">
              <span className="text-xs font-medium text-white">Condition:</span>
              <code className="text-xs bg-black/20 text-white px-2 py-1 rounded block truncate">
                {condition}
              </code>
            </div>
          )}

          <div className="flex justify-between gap-2">
            <div className="flex flex-col items-center">
              <Badge
                variant="success"
                className="text-xs py-0 text-white border-white/20"
              >
                {trueLabel}
              </Badge>
            </div>
            <div className="flex flex-col items-center">
              <Badge
                variant="destructive"
                className="text-xs py-0 text-white border-white/20"
              >
                {falseLabel}
              </Badge>
            </div>
          </div>
        </div>
      </BaseNode>
    </>
  );
}
