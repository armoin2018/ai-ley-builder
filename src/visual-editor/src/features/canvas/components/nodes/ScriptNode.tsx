import { type NodeProps } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { BaseNode, type BaseNodeData } from './BaseNode';
import { Badge, Input, Label } from '../../../../shared/components';
import { useSettings } from '../../../../hooks/useSettings';
import { useState } from 'react';
import { Code, Play, Settings, Clock } from 'lucide-react';

export interface ScriptNodeData extends BaseNodeData {
  properties: {
    scriptType: 'shell' | 'python' | 'php' | 'nodejs';
    script?: string;
    timeout?: number;
    environment?: Record<string, string>;
    workingDirectory?: string;
  };
}

interface ScriptNodeProps extends NodeProps {
  scriptType: 'shell' | 'python' | 'php' | 'nodejs';
}

export function ScriptNode(props: ScriptNodeProps) {
  const { data, id, scriptType } = props;
  const { setNodes } = useReactFlow();
  const { settings } = useSettings();
  const nodeData = data as unknown as ScriptNodeData;

  const [isExpanded, setIsExpanded] = useState(false);
  const [scriptContent, setScriptContent] = useState(nodeData.properties?.script || '');
  const [timeout, setTimeout] = useState(nodeData.properties?.timeout || settings.umlFlows.scriptNodes.defaultTimeout);

  // Find the executor configuration for this script type
  const executor = settings.umlFlows.scriptNodes.executors.find(e => e.id === scriptType);

  if (!executor) {
    return null; // Should not happen if settings are configured correctly
  }

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

  const handleScriptChange = (newScript: string) => {
    setScriptContent(newScript);
    setNodes(nodes =>
      nodes.map(node =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                properties: {
                  ...nodeData.properties,
                  script: newScript,
                },
              },
            }
          : node
      )
    );
  };

  const handleTimeoutChange = (newTimeout: number) => {
    setTimeout(newTimeout);
    setNodes(nodes =>
      nodes.map(node =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                properties: {
                  ...nodeData.properties,
                  timeout: newTimeout,
                },
              },
            }
          : node
      )
    );
  };

  const getVariantFromScriptType = () => {
    switch (scriptType) {
      case 'shell':
        return 'command' as const;
      case 'python':
        return 'logic' as const;
      case 'php':
        return 'custom' as const;
      case 'nodejs':
        return 'output' as const;
      default:
        return 'command' as const;
    }
  };

  return (
    <BaseNode
      {...props}
      variant={getVariantFromScriptType()}
      onLabelChange={handleLabelChange}
      onDescriptionChange={handleDescriptionChange}
    >
      <div className="space-y-3">
        {/* Script Type Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label={executor.name}>
              {executor.icon}
            </span>
            <Badge variant="outline" className="text-xs py-0">
              {executor.name}
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-white/80 hover:text-white transition-colors p-1 rounded"
              title="Configure script"
            >
              <Settings className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Timeout Display */}
        <div className="flex items-center gap-1 text-xs text-white/90">
          <Clock className="w-3 h-3" />
          <span>{timeout}s timeout</span>
        </div>

        {/* Script Preview */}
        {scriptContent && (
          <div className="bg-black/20 rounded px-2 py-1 border border-white/20">
            <div className="flex items-center gap-1 mb-1">
              <Code className="w-3 h-3 text-white/80" />
              <span className="text-xs font-medium text-white/90">Script:</span>
            </div>
            <pre className="text-xs text-white/80 whitespace-pre-wrap break-words max-h-16 overflow-y-auto">
              {scriptContent.length > 100 ? `${scriptContent.substring(0, 100)}...` : scriptContent}
            </pre>
          </div>
        )}

        {/* Expanded Configuration */}
        {isExpanded && (
          <div className="bg-black/20 rounded p-3 border border-white/20 space-y-3">
            <div className="space-y-2">
              <Label htmlFor={`script-${id}`} className="text-xs font-medium text-white">
                Script Code
              </Label>
              <textarea
                id={`script-${id}`}
                value={scriptContent}
                onChange={(e) => handleScriptChange(e.target.value)}
                placeholder={`Enter ${executor.name.toLowerCase()} code...`}
                className="w-full h-20 text-xs bg-black/30 border border-white/30 rounded px-2 py-1 text-white placeholder-white/50 resize-none focus:outline-none focus:ring-1 focus:ring-white/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`timeout-${id}`} className="text-xs font-medium text-white">
                Timeout (seconds)
              </Label>
              <Input
                id={`timeout-${id}`}
                type="number"
                value={timeout}
                onChange={(e) => handleTimeoutChange(parseInt(e.target.value) || settings.umlFlows.scriptNodes.defaultTimeout)}
                min="1"
                max="300"
                className="text-xs bg-black/30 border-white/30 text-white"
              />
            </div>

            <div className="text-xs text-white/70 bg-black/20 rounded p-2">
              <div className="font-medium mb-1">Executor Command:</div>
              <code className="text-white/90">{executor.command} {executor.args.join(' ')}</code>
            </div>
          </div>
        )}

        {/* Execution Status Placeholder */}
        {!isExpanded && (
          <div className="flex items-center gap-1 text-xs text-white/70">
            <Play className="w-3 h-3" />
            <span>Ready to execute</span>
          </div>
        )}
      </div>
    </BaseNode>
  );
}