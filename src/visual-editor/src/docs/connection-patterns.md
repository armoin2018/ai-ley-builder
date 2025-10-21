# Connection Patterns Guide (R19)

This guide demonstrates best practices for implementing flexible connection points in AI-Ley visual flow nodes using the R19 flexible connection API.

## Table of Contents

- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Common Patterns](#common-patterns)
- [Advanced Configurations](#advanced-configurations)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The R19 flexible connection API allows nodes to define multiple input and output connection points at different positions (top, bottom, left, right). This enables more natural visual flow layouts and better node organization.

### Key Concepts

- **Input Handles**: Connection points where data flows **into** the node
- **Output Handles**: Connection points where data flows **out** of the node
- **Position**: Location on node edge (`Position.Top`, `Position.Bottom`, `Position.Left`, `Position.Right`)
- **HandleConfig**: Advanced configuration with IDs, labels, and custom styling

## Basic Usage

### Default Behavior (No Configuration)

Without any configuration, nodes use standard top/bottom connections:

```tsx
<BaseNode data={nodeData} variant="command">
  <div>Node Content</div>
</BaseNode>
```

**Result**: Single input on top, single output on bottom.

### Simple Position Override

Use `inputPositions` and `outputPositions` for quick customization:

```tsx
<BaseNode
  data={nodeData}
  variant="command"
  inputPositions={[Position.Left]}
  outputPositions={[Position.Right]}
>
  <div>Left-to-Right Flow</div>
</BaseNode>
```

**Result**: Input on left side, output on right side.

## Common Patterns

### Pattern 1: Sequential Flow Node

**Use Case**: Standard workflow steps (e.g., command execution, data processing)

```tsx
<CommandPromptNode
  data={nodeData}
  inputPositions={[Position.Top]}
  outputPositions={[Position.Bottom]}
/>
```

**Visual Flow**: ↓ Vertical, top-to-bottom

### Pattern 2: Side-by-Side Flow

**Use Case**: Parallel processing, horizontal layouts

```tsx
<DataProcessorNode
  data={nodeData}
  inputPositions={[Position.Left]}
  outputPositions={[Position.Right]}
/>
```

**Visual Flow**: → Horizontal, left-to-right

### Pattern 3: Multi-Input Node

**Use Case**: Merge points, conditional logic, aggregators

```tsx
<LogicNode
  data={nodeData}
  inputPositions={[Position.Top, Position.Left]}
  outputPositions={[Position.Bottom]}
/>
```

**Visual Flow**:

```
    ↓
← [Node]
    ↓
```

### Pattern 4: Multi-Output Node

**Use Case**: Branch points, splitters, conditional routing

```tsx
<BranchNode
  data={nodeData}
  inputPositions={[Position.Top]}
  outputPositions={[Position.Bottom, Position.Right]}
/>
```

**Visual Flow**:

```
    ↓
  [Node] →
    ↓
```

### Pattern 5: Hub Node

**Use Case**: Central orchestration, broadcast, fan-out/fan-in

```tsx
<OrchestratorNode
  data={nodeData}
  inputPositions={[Position.Top, Position.Left]}
  outputPositions={[Position.Bottom, Position.Right]}
/>
```

**Visual Flow**:

```
    ↓
← [Node] →
    ↓
```

### Pattern 6: Loop Node

**Use Case**: Iterative processing, retry logic

```tsx
<LoopNode
  data={nodeData}
  inputPositions={[Position.Top]}
  outputPositions={[Position.Bottom, Position.Left]} // Left for loop-back
/>
```

**Visual Flow**:

```
    ↓
  [Node] ⟲
    ↓
```

## Advanced Configurations

### Named Handles with Labels

Use `handleConfig` for fine-grained control:

```tsx
<ConditionalNode
  data={nodeData}
  handleConfig={{
    inputs: [{ id: 'primary', position: Position.Top, label: 'Primary Input' }],
    outputs: [
      {
        id: 'success',
        position: Position.Right,
        label: 'Success Path',
        className: 'w-3 h-3 !bg-green-400',
      },
      {
        id: 'error',
        position: Position.Bottom,
        label: 'Error Path',
        className: 'w-3 h-3 !bg-red-400',
      },
    ],
  }}
/>
```

**Benefits**:

- Unique handle IDs for programmatic connection
- Tooltips via labels for user guidance
- Custom styling to indicate connection semantics

### Complex Multi-Channel Node

```tsx
<DataPipelineNode
  data={nodeData}
  handleConfig={{
    inputs: [
      { id: 'data-in', position: Position.Left, label: 'Data Stream' },
      { id: 'config-in', position: Position.Top, label: 'Configuration' },
      { id: 'control-in', position: Position.Top, label: 'Control Signal' },
    ],
    outputs: [
      { id: 'data-out', position: Position.Right, label: 'Processed Data' },
      { id: 'metrics', position: Position.Bottom, label: 'Metrics' },
      { id: 'logs', position: Position.Bottom, label: 'Logs' },
    ],
  }}
/>
```

### Dynamic Handle Generation

For nodes with variable connection points:

```tsx
const inputCount = 3;
const inputPositions = Array(inputCount).fill(Position.Top);

<AggregatorNode
  data={nodeData}
  inputPositions={inputPositions}
  outputPositions={[Position.Bottom]}
/>;
```

## Best Practices

### 1. Match Visual Flow Direction

Choose handle positions that match the natural reading/flow direction:

- **Top-to-bottom**: Sequential workflows, hierarchies
- **Left-to-right**: Data pipelines, transformations
- **Mixed**: Complex logic, state machines

### 2. Use Consistent Patterns

Within a workflow, maintain consistency:

```tsx
// ✅ Good: All command nodes use same pattern
<CommandPromptNode inputPositions={[Position.Top]} outputPositions={[Position.Bottom]} />
<CommandExecuteNode inputPositions={[Position.Top]} outputPositions={[Position.Bottom]} />

// ❌ Avoid: Inconsistent patterns create visual confusion
<CommandPromptNode inputPositions={[Position.Left]} outputPositions={[Position.Right]} />
<CommandExecuteNode inputPositions={[Position.Top]} outputPositions={[Position.Bottom]} />
```

### 3. Limit Connection Points

Keep nodes simple when possible:

```tsx
// ✅ Good: Clear purpose, minimal connections
<FilterNode inputPositions={[Position.Left]} outputPositions={[Position.Right]} />

// ⚠️ Consider: Is this node too complex? Should it be split?
<SuperNode inputPositions={[Position.Top, Position.Left, Position.Bottom]}
           outputPositions={[Position.Top, Position.Right, Position.Bottom]} />
```

### 4. Use Labels for Clarity

Always add labels to handles when semantics matter:

```tsx
handleConfig={{
  outputs: [
    { id: 'success', position: Position.Right, label: 'Success' },
    { id: 'failure', position: Position.Bottom, label: 'Failure' }
  ]
}}
```

### 5. Color-Code Semantic Handles

Use custom classes to indicate connection types:

```tsx
handleConfig={{
  outputs: [
    { id: 'data', position: Position.Right, className: 'bg-blue-400', label: 'Data' },
    { id: 'error', position: Position.Bottom, className: 'bg-red-400', label: 'Error' },
    { id: 'success', position: Position.Right, className: 'bg-green-400', label: 'Success' }
  ]
}}
```

### 6. Document Custom Patterns

When creating new node types with unique connection patterns, document them:

```tsx
/**
 * Custom state machine node with entry/exit/error outputs
 *
 * Connection Pattern:
 * - Input: Top (previous state)
 * - Output 1: Right (success transition)
 * - Output 2: Bottom (error handler)
 * - Output 3: Left (loop-back for retry)
 */
<StateMachineNode
  handleConfig={{
    inputs: [{ position: Position.Top }],
    outputs: [
      { id: 'success', position: Position.Right },
      { id: 'error', position: Position.Bottom },
      { id: 'retry', position: Position.Left },
    ],
  }}
/>
```

## Troubleshooting

### Issue: Handles Not Appearing

**Problem**: Node shows no connection points

**Solutions**:

1. Check `showHandles` prop (default is `true`)
2. Verify positions are valid React Flow Position enums
3. Ensure BaseNode is rendering correctly

```tsx
// ✅ Correct
import { Position } from '@xyflow/react';
<BaseNode inputPositions={[Position.Top]} />

// ❌ Wrong
<BaseNode inputPositions={['top']} />
```

### Issue: Connections Not Aligning

**Problem**: Connection lines don't align with handles

**Solution**: Ensure handle positions match edge directions:

```tsx
// ✅ Good: Output to right connects naturally to input from left
<NodeA outputPositions={[Position.Right]} />
<NodeB inputPositions={[Position.Left]} />

// ⚠️ Awkward: Both on right side creates bent connection
<NodeA outputPositions={[Position.Right]} />
<NodeB inputPositions={[Position.Right]} />
```

### Issue: Too Many Handles Overlapping

**Problem**: Multiple handles at same position overlap

**Solution 1**: Spread handles across different positions

```tsx
// Instead of:
inputPositions={[Position.Top, Position.Top, Position.Top]}

// Use:
inputPositions={[Position.Top, Position.Left]}
```

**Solution 2**: Use React Flow's handle offset (advanced)

```tsx
handleConfig={{
  inputs: [
    { id: 'in1', position: Position.Top, className: 'left-1/4' },
    { id: 'in2', position: Position.Top, className: 'left-3/4' }
  ]
}}
```

### Issue: Dynamic Handles Not Updating

**Problem**: Handle count changes but UI doesn't update

**Solution**: Ensure proper React re-rendering:

```tsx
// Use state or props, not constants
const [inputCount, setInputCount] = useState(3);
const inputPositions = useMemo(() => Array(inputCount).fill(Position.Top), [inputCount]);
```

## Examples from AI-Ley

### CommandPromptFileNode

Reference implementation showing dual input/output:

```tsx
<BaseNode
  {...props}
  data={data}
  variant="command"
  inputPositions={[Position.Top, Position.Left]}
  outputPositions={[Position.Bottom, Position.Right]}
>
  <FilePromptEditor />
</BaseNode>
```

**Use Case**: File operations that can receive input from workflow or side panel.

---

## Further Reading

- [BaseNode.tsx API Documentation](../components/nodes/BaseNode.tsx)
- [React Flow Handle Documentation](https://reactflow.dev/api-reference/components/handle)
- [REQUIREMENTS.md - R19 Specification](../../../../REQUIREMENTS.md)

---

**Last Updated**: October 20, 2025  
**Related Requirements**: R19.1 - Flexible Connection Points
