import { type NodeProps } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';
import { Badge } from '../../../../shared/components';

export interface PersonaNodeData extends BaseNodeData {
  properties: {
    personaType?: string;
    expertise?: string[];
    tone?: 'professional' | 'casual' | 'formal' | 'friendly';
    characteristics?: string[];
  };
}

export function PersonaNode(props: NodeProps) {
  const { data } = props;
  const nodeData = data as unknown as PersonaNodeData;
  const personaType = nodeData.properties.personaType as string;
  const expertise = (nodeData.properties.expertise as string[]) || [];
  const tone = nodeData.properties.tone as string;

  const getToneColor = (toneValue: string) => {
    switch (toneValue) {
      case 'professional':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'casual':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'formal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'friendly':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <BaseNode {...props} variant="persona">
      <div className="space-y-2">
        {personaType && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">Role:</span>
            <Badge variant="outline" className="text-xs py-0">
              {personaType}
            </Badge>
          </div>
        )}

        {tone && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium">Tone:</span>
            <Badge
              className={`text-xs py-0 ${getToneColor(tone)}`}
              variant="outline"
            >
              {tone}
            </Badge>
          </div>
        )}

        {expertise.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium">Expertise:</span>
            <div className="flex flex-wrap gap-1">
              {expertise.slice(0, 2).map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs py-0">
                  {skill}
                </Badge>
              ))}
              {expertise.length > 2 && (
                <Badge variant="secondary" className="text-xs py-0">
                  +{expertise.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center text-xs text-muted-foreground">
          <span>👤 AI Persona</span>
        </div>
      </div>
    </BaseNode>
  );
}
