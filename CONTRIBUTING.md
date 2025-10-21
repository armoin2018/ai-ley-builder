# Contributing to AI-Ley Visual Flow Editor

Thank you for your interest in contributing to AI-Ley! This guide will help you understand our development workflow, coding standards, and best practices.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [TypeScript Guidelines](#typescript-guidelines)
- [Component Patterns](#component-patterns)
- [Testing Requirements](#testing-requirements)
- [Performance Considerations](#performance-considerations)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)
- [Pull Request Process](#pull-request-process)

## Getting Started

### Prerequisites

- Node.js 20+ and npm 10+
- Git
- VS Code (recommended)

### Setup

```bash
# Clone repository
git clone https://github.com/your-org/ai-ley-builder.git
cd ai-ley-builder/src/visual-editor

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Type check
npm run type-check
```

### Project Structure

```
src/visual-editor/
├── src/
│   ├── components/        # Shared UI components
│   ├── features/          # Feature modules
│   │   ├── canvas/        # Flow canvas (nodes, edges, connections)
│   │   ├── inspector/     # Property inspector panel
│   │   ├── palette/       # Node palette
│   │   ├── settings/      # Settings & preferences
│   │   └── validation/    # Workflow validation
│   ├── hooks/             # Shared React hooks
│   ├── services/          # Business logic & API services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── docs/                  # Documentation
└── public/                # Static assets
```

## Development Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation updates

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add flexible connection points (R19)
fix: resolve TypeScript error in plantuml-parser
docs: update connection patterns guide
refactor: optimize node rendering performance
test: add unit tests for HandleConfig
```

### Branch Naming

```
feature/r19-flexible-connections
fix/typescript-strict-mode-errors
docs/performance-monitoring-guide
refactor/base-node-optimization
```

## Coding Standards

### General Principles

1. **Clarity over Cleverness**: Write code that's easy to understand
2. **Consistency**: Follow existing patterns in the codebase
3. **Simplicity**: Prefer simple solutions over complex ones
4. **Maintainability**: Write code that's easy to modify and extend

### Code Style

We use ESLint and Prettier for consistent formatting:

```bash
# Auto-fix formatting
npm run lint:fix

# Check formatting
npm run lint
```

**Key Rules**:

- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multi-line
- Max line length: 100 characters

### File Organization

```tsx
// 1. Imports (external, then internal)
import { useState, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';

import { BaseNode } from '@/features/canvas/components/nodes';
import { useNodeStore } from '@/features/store';
import { cn } from '@/utils';

// 2. Types and Interfaces
interface MyComponentProps {
  id: string;
  data: NodeData;
}

// 3. Constants
const DEFAULT_POSITION = Position.Top;

// 4. Component
export function MyComponent({ id, data }: MyComponentProps) {
  // Hooks first
  const [state, setState] = useState<string>('');
  const updateNode = useNodeStore((s) => s.updateNode);

  // Event handlers
  const handleChange = useCallback(
    (value: string) => {
      setState(value);
      updateNode(id, { value });
    },
    [id, updateNode],
  );

  // Render
  return <div className={cn('p-4', { 'bg-blue-100': !!state })}>{/* Component content */}</div>;
}
```

## TypeScript Guidelines

### Strict Mode Compliance

AI-Ley uses TypeScript strict mode. All code must:

- ✅ Have explicit types for function parameters and return values
- ✅ Avoid `any` type (use `unknown` if necessary)
- ✅ Handle null/undefined cases explicitly
- ✅ Use proper type guards for type narrowing

### Type Definitions

**DO**:

```tsx
// ✅ Good: Explicit types
interface NodeData {
  label: string;
  description?: string;
  properties: Record<string, unknown>;
}

function updateNode(id: string, data: Partial<NodeData>): void {
  // Implementation
}

// ✅ Good: Type guard
function isNodeData(value: unknown): value is NodeData {
  return (
    typeof value === 'object' &&
    value !== null &&
    'label' in value &&
    typeof value.label === 'string'
  );
}
```

**DON'T**:

```tsx
// ❌ Bad: Implicit any
function updateNode(id, data) {
  // TypeScript error
}

// ❌ Bad: Using any
function processData(data: any) {
  // Loses type safety
}

// ❌ Bad: Unsafe property access
function getProperty(obj: Record<string, unknown>, key: string) {
  return obj[key].value; // Error: unknown has no property 'value'
}
```

### Safe Property Access Pattern

When working with dynamic objects:

```tsx
// ✅ Correct pattern
const value = obj[key];
if (value && typeof value === 'object' && 'property' in value) {
  const typedValue = value as Record<string, unknown>;
  return typedValue.property;
}

// Or use type casting with validation
const typedObj = obj as Record<string, Record<string, unknown>>;
return typedObj[key]?.property;
```

### Generic Types

```tsx
// ✅ Good: Proper generics
function createNode<T extends BaseNodeData>(type: string, data: T): Node<T> {
  return {
    id: generateId(),
    type,
    data,
    position: { x: 0, y: 0 },
  };
}

// Usage
const commandNode = createNode('command', {
  label: 'Execute',
  properties: { command: 'ls' },
});
```

## Component Patterns

### React Flow Nodes

All custom nodes should extend `BaseNode`:

```tsx
import { BaseNode, type BaseNodeData } from '@/features/canvas/components/nodes';
import { Position } from '@xyflow/react';

interface MyNodeData extends BaseNodeData {
  customProperty: string;
}

export function MyCustomNode(props: NodeProps<MyNodeData>) {
  return (
    <BaseNode
      {...props}
      variant="command"
      inputPositions={[Position.Top]}
      outputPositions={[Position.Bottom]}
    >
      <div className="p-2">
        <p>{props.data.customProperty}</p>
      </div>
    </BaseNode>
  );
}
```

### R19 Flexible Connection Points

When implementing nodes with custom connection patterns:

```tsx
// Simple: Multiple inputs/outputs at specific positions
<BaseNode
  inputPositions={[Position.Top, Position.Left]}
  outputPositions={[Position.Bottom, Position.Right]}
>
  {/* Node content */}
</BaseNode>

// Advanced: Fully configured handles with IDs and labels
<BaseNode
  handleConfig={{
    inputs: [
      { id: 'data-in', position: Position.Left, label: 'Data Input' },
      { id: 'control-in', position: Position.Top, label: 'Control' }
    ],
    outputs: [
      {
        id: 'success',
        position: Position.Right,
        label: 'Success',
        className: 'bg-green-400'
      },
      {
        id: 'error',
        position: Position.Bottom,
        label: 'Error',
        className: 'bg-red-400'
      }
    ]
  }}
>
  {/* Node content */}
</BaseNode>
```

**Guidelines**:

- Use `inputPositions`/`outputPositions` for simple cases
- Use `handleConfig` when you need IDs, labels, or custom styling
- Maintain consistency within a workflow (don't mix patterns randomly)
- Document any custom connection patterns in JSDoc comments

**See**: [Connection Patterns Guide](./src/docs/connection-patterns.md)

### State Management with Zustand

```tsx
import { create } from 'zustand';

interface NodeStore {
  nodes: Node[];
  addNode: (node: Node) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
}

export const useNodeStore = create<NodeStore>((set) => ({
  nodes: [],

  addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),

  updateNode: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...data } } : n)),
    })),
}));
```

### Custom Hooks

```tsx
// useNodeSelection.ts
export function useNodeSelection(nodeId: string) {
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const selectNode = useFlowStore((s) => s.selectNode);

  const isSelected = selectedNodeId === nodeId;

  const handleSelect = useCallback(() => {
    selectNode(nodeId);
  }, [nodeId, selectNode]);

  return { isSelected, handleSelect };
}
```

## Testing Requirements

### Unit Tests

All components and utilities must have unit tests:

```tsx
// MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders with label', () => {
    render(<MyComponent label="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<MyComponent label="Test" onClick={onClick} />);

    await userEvent.click(screen.getByText('Test'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Specific file
npm test -- MyComponent.test.tsx
```

### Coverage Requirements

- Minimum coverage: 80% overall
- Critical paths (validation, execution): 95%+
- UI components: 70%+

## Performance Considerations

### Use ProfilerWrapper for Expensive Components

```tsx
import { ProfilerWrapper } from '@/features/ui-common/components/ProfilerWrapper';

export function ExpensiveComponent() {
  return <ProfilerWrapper id="ExpensiveComponent">{/* Complex rendering logic */}</ProfilerWrapper>;
}
```

### Optimization Patterns

**1. Memoization**

```tsx
// Memoize expensive calculations
const processedData = useMemo(() => expensiveCalculation(rawData), [rawData]);

// Memoize callbacks to prevent re-renders
const handleChange = useCallback((value: string) => updateNode(id, { value }), [id, updateNode]);

// Memoize components
const MemoizedNode = React.memo(CustomNode, (prev, next) => {
  return prev.data === next.data && prev.selected === next.selected;
});
```

**2. React Flow Optimization**

```tsx
<ReactFlow
  nodes={nodes}
  edges={edges}
  onlyRenderVisibleElements={true} // Key optimization for large workflows
  nodesDraggable={true}
  elementsSelectable={true}
/>
```

**3. Lazy Loading**

```tsx
const NodePalette = lazy(() => import('./NodePalette'));
const InspectorPanel = lazy(() => import('./InspectorPanel'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <NodePalette />
      <InspectorPanel />
    </Suspense>
  );
}
```

### Performance Testing

Before submitting PRs with UI changes:

1. Open Performance Dashboard (⌘⇧M)
2. Profile your changes with typical workflows
3. Ensure 60 FPS during interactions
4. Run Lighthouse CI: `npm run lighthouse-ci`
5. Verify performance score ≥ 90

**See**: [Performance Monitoring Guide](./src/docs/performance-monitoring.md)

## Documentation

### JSDoc Requirements

All exported components, functions, and types must have JSDoc comments:

````tsx
/**
 * Custom node for executing command prompts with file output
 *
 * Features:
 * - Flexible input positions (top, left) for workflow integration
 * - Dual output positions (bottom, right) for branching
 * - Integrated file editor with syntax highlighting
 *
 * @example
 * ```tsx
 * <CommandPromptFileNode
 *   id="node-1"
 *   data={{ label: 'Run Script', properties: { command: 'npm test' } }}
 * />
 * ```
 */
export function CommandPromptFileNode(props: NodeProps<CommandPromptData>) {
  // Implementation
}
````

### README Updates

When adding features, update:

1. **Feature List**: Add new capability
2. **Getting Started**: Update if setup changes
3. **Usage Examples**: Add code samples
4. **Screenshots**: Include visual changes

### Inline Comments

Use comments sparingly for complex logic:

```tsx
// Calculate node position using force-directed layout algorithm
// See: https://github.com/d3/d3-force for algorithm details
const position = calculateForceLayout(nodes, edges, {
  strength: -400, // Repulsion force between nodes
  distance: 100, // Target distance for connected nodes
  iterations: 300, // Simulation steps for convergence
});
```

## Troubleshooting

### Common Issues

#### TypeScript Errors: "Property does not exist on type 'unknown'"

**Solution**: Use type guards or type casting with validation

```tsx
// ❌ Error
const value = obj[key].property;

// ✅ Fix
const value = obj[key];
if (value && typeof value === 'object' && 'property' in value) {
  const typed = value as Record<string, unknown>;
  return typed.property;
}
```

#### React Flow Connections Not Working

**Solution**: Ensure handle IDs match edge source/target handles

```tsx
// Edge definition
{ id: 'e1', source: 'node-1', target: 'node-2', sourceHandle: 'out-1' }

// Node must have matching handle ID
<Handle type="source" position={Position.Right} id="out-1" />
```

#### Performance Issues with Large Workflows

**Solution**: Enable viewport optimization

```tsx
<ReactFlow onlyRenderVisibleElements={true} nodesDraggable={true} />
```

#### Tests Failing Due to React Flow

**Solution**: Use test utilities from `@/test/utils`

```tsx
import { renderWithFlow } from '@/test/utils';

const { getByText } = renderWithFlow(<MyFlowComponent />);
```

### Getting Help

- **Documentation**: Check `src/docs/` for guides
- **Issues**: Search [GitHub Issues](https://github.com/your-org/ai-ley-builder/issues)
- **Discussions**: Post in [GitHub Discussions](https://github.com/your-org/ai-ley-builder/discussions)
- **Code Review**: Ask maintainers for guidance in PR comments

## Pull Request Process

### Before Submitting

**Checklist**:

- [ ] Code follows style guidelines (lint passes)
- [ ] All tests pass (`npm test`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Added/updated tests for changes
- [ ] Updated documentation
- [ ] Performance tested for UI changes
- [ ] Added JSDoc comments to new exports

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues

Closes #123

## Testing

How to test the changes:

1. Step 1
2. Step 2

## Screenshots (if applicable)

![Before](...)
![After](...)

## Performance Impact

- Performance Dashboard results
- Lighthouse CI score

## Checklist

- [ ] Tests pass
- [ ] Documentation updated
- [ ] No TypeScript errors
```

### Review Process

1. **Automated Checks**: CI must pass (tests, linting, type check, Lighthouse)
2. **Code Review**: At least one maintainer approval required
3. **Performance Review**: Check dashboard metrics for UI changes
4. **Documentation Review**: Verify docs are clear and complete
5. **Merge**: Squash and merge to `develop`

### After Merge

- [ ] Delete feature branch
- [ ] Update project tracking (if applicable)
- [ ] Monitor CI/CD for any issues
- [ ] Celebrate! 🎉

---

## Additional Resources

- [Connection Patterns Guide](./src/docs/connection-patterns.md)
- [Performance Monitoring Guide](./src/docs/performance-monitoring.md)
- [React Flow Documentation](https://reactflow.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vitest Documentation](https://vitest.dev/)

---

**Questions?** Open an issue or discussion on GitHub!

**Last Updated**: October 20, 2025
