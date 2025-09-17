# Task 001: Component Palette Container & Layout

## Overview

**Task ID**: TASK-006  
**Story**: Component Palette Implementation (STORY-006)  
**Priority**: High  
**Status**: In Progress  
**Estimated Hours**: 2 hours  
**Assignee**: React Developer  
**Started**: September 11, 2025

## Description

Create the main component palette container with proper layout, categories, and responsive design. This will serve as the foundation for the searchable node library.

## Acceptance Criteria

- [ ] ComponentPalette component renders with proper layout
- [ ] Category sections for Input, Logic, Output, and AI nodes
- [ ] Responsive design adapts to sidebar and full-width modes
- [ ] Proper TypeScript interfaces for node types
- [ ] Integration with existing design system
- [ ] Collapsible categories for better space management

## Technical Context

**Files to Create**:
- `src/types/node.ts` - Node type definitions
- `src/components/palette/ComponentPalette.tsx` - Main container
- `src/components/palette/PaletteCategory.tsx` - Category component
- `src/components/palette/index.ts` - Exports

## Implementation Steps

### Step 1: Node Type Definitions (30 minutes)

```typescript
// src/types/node.ts
export interface NodeType {
  id: string;
  name: string;
  category: 'Input' | 'Logic' | 'Output' | 'AI';
  description: string;
  color: string;
  icon?: string;
  inputs?: ConnectionPoint[];
  outputs?: ConnectionPoint[];
}

export interface ConnectionPoint {
  id: string;
  type: string;
  label: string;
}

export const NODE_TYPES: NodeType[] = [
  {
    id: 'command-prompt-file',
    name: 'Command Prompt File',
    category: 'Input',
    description: 'Load prompts from external files',
    color: 'node-command',
  },
  {
    id: 'logic-condition', 
    name: 'Logic Condition',
    category: 'Logic',
    description: 'Conditional branching logic',
    color: 'node-logic',
  },
  // ... additional node types
];
```

### Step 2: Palette Container (60 minutes)

```typescript
// src/components/palette/ComponentPalette.tsx
import React, { useState } from 'react';
import { Card } from '@/components/ui';
import { NODE_TYPES } from '@/types/node';
import PaletteCategory from './PaletteCategory';

const ComponentPalette: React.FC = () => {
  const categories = ['Input', 'Logic', 'Output', 'AI'] as const;
  
  return (
    <Card title="Component Palette" className="h-full">
      <div className="space-y-4">
        {categories.map(category => (
          <PaletteCategory 
            key={category}
            name={category}
            nodes={NODE_TYPES.filter(node => node.category === category)}
          />
        ))}
      </div>
    </Card>
  );
};
```

### Step 3: Category Component (30 minutes)

```typescript
// src/components/palette/PaletteCategory.tsx  
import React, { useState } from 'react';
import { NodeType } from '@/types/node';

interface PaletteCategoryProps {
  name: string;
  nodes: NodeType[];
}

const PaletteCategory: React.FC<PaletteCategoryProps> = ({ name, nodes }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left py-2 hover:bg-gray-50 rounded"
      >
        <span className="font-medium text-gray-900">{name}</span>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
          ▶
        </span>
      </button>
      
      {isExpanded && (
        <div className="mt-2 space-y-2">
          {nodes.map(node => (
            <div key={node.id} className={`p-3 rounded-lg bg-${node.color} text-white cursor-pointer hover:opacity-90 transition-opacity`}>
              <div className="font-medium">{node.name}</div>
              <div className="text-sm opacity-90">{node.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Quality Gates

- [ ] Component renders without errors
- [ ] All 7 node types display in correct categories  
- [ ] Responsive layout works on mobile and desktop
- [ ] TypeScript compilation passes
- [ ] Categories can be collapsed/expanded
- [ ] Design system integration consistent

## Validation Steps

1. Create node type definitions with all 7 types
2. Implement ComponentPalette with category organization
3. Create PaletteCategory with collapsible behavior
4. Test responsive design and interactions
5. Verify TypeScript types and compilation
6. Update component exports