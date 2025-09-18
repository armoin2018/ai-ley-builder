import { type NodeProps } from '@xyflow/react';
import { ScriptNode } from './ScriptNode';

export function PythonScriptNode(props: NodeProps) {
  return <ScriptNode {...props} scriptType="python" />;
}