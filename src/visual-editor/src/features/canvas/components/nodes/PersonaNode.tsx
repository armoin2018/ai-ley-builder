import { type NodeProps } from '@xyflow/react';
import { Badge } from '../../../../shared/components';
import { BaseNode, type BaseNodeData } from './BaseNode';

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
  const personaType = nodeData.properties?.personaType || '';
  const expertise = (nodeData.properties?.expertise as string[]) || [];
  const tone = nodeData.properties?.tone || 'professional';

  const getToneColor = () => {
    // All badges should use white text for consistency
    return 'text-white border-white/20';
  };

  return (
    <BaseNode {...props} variant="persona">
      <div className="space-y-2">
        {personaType && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-white">Role:</span>
            <Badge
              variant="outline"
              className="text-xs py-0 text-white border-white/20"
            >
              {personaType}
            </Badge>
          </div>
        )}

        {tone && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-white">Tone:</span>
            <Badge
              className={`text-xs py-0 ${getToneColor()}`}
              variant="outline"
            >
              {tone}
            </Badge>
          </div>
        )}

        {expertise.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-white">Expertise:</span>
            <div className="flex flex-wrap gap-1">
              {expertise.map((item, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs py-0 text-white border-white/20"
                >
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center text-xs text-white">
          <span>👤 AI Persona</span>
        </div>
      </div>
    </BaseNode>
  );
}
