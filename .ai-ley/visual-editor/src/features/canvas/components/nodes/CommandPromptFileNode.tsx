import { type NodeProps } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';
import { Badge } from '../../../../shared/components';

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
  const fileName = nodeData.properties.fileName as string;
  const variables = (nodeData.properties.variables as string[]) || [];

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
      onLabelChange={handleLabelChange}
      onDescriptionChange={handleDescriptionChange}
    >
      <div className="space-y-2">
        {fileName && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">File:</span>
            <Badge variant="outline" className="text-xs py-0">
              {fileName}
            </Badge>
          </div>
        )}

        {variables.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Variables:</span>
            <div className="flex flex-wrap gap-1">
              {variables.slice(0, 3).map((variable, index) => (
                <Badge key={index} variant="secondary" className="text-xs py-0">
                  {variable}
                </Badge>
              ))}
              {variables.length > 3 && (
                <Badge variant="secondary" className="text-xs py-0">
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
