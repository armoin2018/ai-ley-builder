import { type NodeProps, Position, useReactFlow } from '@xyflow/react';
import { Badge } from '../../../../shared/components';
import { BaseNode, type BaseNodeData } from './BaseNode';

export interface CommandPromptFileNodeData extends BaseNodeData {
  properties: {
    fileName?: string;
    content?: string;
    variables?: string[];
  };
}

export function CommandPromptFileNode(props: NodeProps) {
  const { data, id } = props;
  const { setNodes } = useReactFlow();
  const nodeData = data as unknown as CommandPromptFileNodeData;
  const fileName = nodeData.properties?.fileName || '';
  const variables = (nodeData.properties?.variables as string[]) || [];

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
    <BaseNode
      {...props}
      variant="command"
      // R19: Flexible connection points - inputs from top OR left, outputs to bottom OR right
      inputPositions={[Position.Top, Position.Left]}
      outputPositions={[Position.Bottom, Position.Right]}
      onLabelChange={handleLabelChange}
      onDescriptionChange={handleDescriptionChange}
    >
      <div className="space-y-2">
        {fileName && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-white">File:</span>
            <Badge
              variant="outline"
              className="text-xs py-0 text-white border-white/20"
            >
              {fileName}
            </Badge>
          </div>
        )}

        {variables.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-white">Variables:</span>
            <div className="flex flex-wrap gap-1">
              {variables.slice(0, 3).map((variable, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs py-0 text-white border-white/20"
                >
                  {variable}
                </Badge>
              ))}
              {variables.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs py-0 text-white border-white/20"
                >
                  +{variables.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </BaseNode>
  );
}
