import { type NodeProps } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';

export interface CustomPromptTextNodeData extends BaseNodeData {
  properties: {
    promptText?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  };
}

export function CustomPromptTextNode(props: NodeProps) {
  const { data } = props;
  const nodeData = data as unknown as CustomPromptTextNodeData;
  const promptText = nodeData.properties?.promptText || '';
  const temperature = nodeData.properties?.temperature || 0.7;
  const maxTokens = nodeData.properties?.maxTokens || 2000;

  return (
    <BaseNode {...props} variant="custom">
      <div className="space-y-2">
        {promptText && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-white">Prompt:</span>
            <div className="text-xs bg-black/20 text-white px-2 py-1 rounded max-h-16 overflow-hidden">
              <div className="line-clamp-3">{promptText}</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {typeof temperature === 'number' && (
            <div className="flex flex-col">
              <span className="text-xs text-white">Temp</span>
              <span className="text-xs font-mono text-white">{temperature}</span>
            </div>
          )}

          {typeof maxTokens === 'number' && (
            <div className="flex flex-col">
              <span className="text-xs text-white">Tokens</span>
              <span className="text-xs font-mono text-white">{maxTokens}</span>
            </div>
          )}
        </div>

        <div className="flex items-center text-xs text-white">
          <span>✨ Custom AI Prompt</span>
        </div>
      </div>
    </BaseNode>
  );
}
