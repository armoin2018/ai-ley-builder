# Visual Flow Editor - Source Code Structure

This document describes the organization and conventions of the visual flow editor source code.

## Directory Structure

```
src/
├── features/           # Feature-based modules
│   ├── canvas/          # Canvas and flow editing
│   │   ├── components/   # Canvas-specific components
│   │   │   ├── nodes/     # Node type components
│   │   │   │   ├── command/
│   │   │   │   ├── logic/
│   │   │   │   ├── output/
│   │   │   │   ├── loop/
│   │   │   │   ├── custom/
│   │   │   │   ├── persona/
│   │   │   │   └── instruction/
│   │   │   ├── connections/ # Connection components
│   │   │   ├── ports/       # Port components
│   │   │   └── grid/        # Grid components
│   │   ├── hooks/        # Canvas-specific hooks
│   │   ├── types/        # Canvas type definitions
│   │   └── utils/        # Canvas utilities
│   ├── palette/         # Node palette
│   ├── inspector/       # Property inspector
│   ├── validation/      # Validation engine
│   ├── export/          # PlantUML export
│   └── ui-common/       # Shared UI components
├── shared/             # Shared across features
│   ├── components/     # Reusable components
│   ├── hooks/          # Shared custom hooks
│   └── utils/          # Shared utilities
├── types/              # Global type definitions
│   ├── api/            # API-related types
│   ├── canvas/         # Canvas type definitions
│   ├── nodes/          # Node type definitions
│   ├── validation/     # Validation types
│   └── export/         # Export types
├── utils/              # Utility functions
│   ├── canvas/         # Canvas-related utilities
│   ├── validation/     # Validation utilities
│   ├── export/         # Export utilities
│   └── file-operations/# File I/O utilities
├── hooks/              # Global custom hooks
│   ├── canvas/         # Canvas hooks
│   ├── drag-drop/      # Drag and drop hooks
│   ├── validation/     # Validation hooks
│   └── persistence/    # Data persistence hooks
├── services/           # Business logic services
│   ├── flow-persistence/ # Flow data management
│   ├── plantuml-export/  # PlantUML generation
│   └── validation-engine/# Validation logic
├── assets/             # Static assets
│   ├── icons/          # Icon files
│   ├── images/         # Image files
│   └── styles/         # Additional styles
└── constants/          # Application constants
```

## Path Aliases

The following TypeScript path aliases are configured for clean imports:

- `@/*` - src root
- `@components/*` - src/components
- `@features/*` - src/features
- `@shared/*` - src/shared
- `@types/*` - src/types
- `@utils/*` - src/utils
- `@assets/*` - src/assets
- `@hooks/*` - src/hooks
- `@services/*` - src/services
- `@constants/*` - src/constants

### Feature-Specific Aliases

- `@canvas/*` - src/features/canvas
- `@palette/*` - src/features/palette
- `@inspector/*` - src/features/inspector
- `@validation/*` - src/features/validation
- `@export/*` - src/features/export

## Import Conventions

### Preferred Import Order

1. React and external libraries
2. Internal features (using aliases)
3. Types (using @types alias)
4. Utilities and constants
5. Relative imports (./)

### Example

```typescript
// External libraries
import React from 'react';
import { Node, Edge } from '@xyflow/react';

// Internal features
import { CanvasComponent } from '@canvas/components';
import { PaletteProvider } from '@palette/hooks';

// Types
import { NodeType, FlowData } from '@types/nodes';

// Utils and constants
import { validateFlow } from '@utils/validation';
import { NODE_TYPES } from '@constants';

// Relative imports
import './ComponentName.css';
```

## Feature Architecture

Each feature follows a consistent structure:

- `components/` - React components specific to the feature
- `hooks/` - Custom hooks for feature logic
- `types/` - TypeScript types specific to the feature
- `utils/` - Utility functions for the feature
- `index.ts` - Barrel export file

## Naming Conventions

- **Components**: PascalCase (e.g., `CanvasGrid.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useCanvasState.ts`)
- **Utilities**: camelCase (e.g., `validateConnection.ts`)
- **Types**: PascalCase for interfaces, UPPER_SNAKE_CASE for enums
- **Constants**: UPPER_SNAKE_CASE
- **Files**: kebab-case for directories, PascalCase for components

## Best Practices

1. **Feature Isolation**: Each feature should be self-contained with minimal cross-dependencies
2. **Barrel Exports**: Use index.ts files to create clean public APIs for modules
3. **Type Safety**: Leverage TypeScript strictly - avoid `any` types
4. **Path Aliases**: Use aliases to avoid deep relative imports
5. **Component Composition**: Prefer composition over inheritance
6. **Custom Hooks**: Extract complex logic into reusable hooks
7. **Constants**: Define magic numbers and strings in constants files

## Testing Structure

Test files should mirror the source structure:

- `__tests__/` directories alongside source files
- `.test.tsx` suffix for component tests
- `.test.ts` suffix for utility tests
- Test utilities in `src/shared/test-utils/`
