import { type NodeProps } from '@xyflow/react';
import { ScriptNode } from './ScriptNode';

export function ShellScriptNode(props: NodeProps) {
  return <ScriptNode {...props} scriptType="shell" />;
}