import { type NodeProps } from '@xyflow/react';
import { ScriptNode } from './ScriptNode';

export function NodejsScriptNode(props: NodeProps) {
  return <ScriptNode {...props} scriptType="nodejs" />;
}
