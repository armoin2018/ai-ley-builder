import { type NodeProps } from '@xyflow/react';
import { ScriptNode } from './ScriptNode';

export function PhpScriptNode(props: NodeProps) {
  return <ScriptNode {...props} scriptType="php" />;
}
