# Architecture Overview: Node-RED-style .ai-ley Builder

## System Context

The Node-RED-style .ai-ley Builder is a React-based visual workflow editor that extends the existing .ai-ley AI prompt engineering platform. The system enables drag-and-drop construction of AI automation flows while maintaining full backward compatibility with existing text-based configurations and generating automatic PlantUML documentation.

## Architecture Principles

### 1. **Local-First Architecture**
All operations execute locally within the repository without external service dependencies. Flow data persists to local JSON files, ensuring security and eliminating network latency concerns.

### 2. **Non-Destructive Integration**  
The visual editor extends existing .ai-ley functionality without breaking current workflows or file structures. All legacy configurations remain fully functional alongside new visual flows.

### 3. **Type-Safe Development**
TypeScript 5.0+ with strict mode ensures compile-time error detection, reducing runtime issues and improving development velocity. All interfaces, components, and data structures utilize comprehensive type definitions.

### 4. **Component-Driven Design**
Modular React component architecture enables independent development, testing, and maintenance of UI elements. Each node type, UI panel, and interaction pattern exists as reusable, testable components.

### 5. **Performance-First Optimization**
Canvas virtualization, intelligent caching, and optimized rendering ensure smooth performance with complex flows containing 100+ nodes while maintaining sub-100ms response times.

## Technology Stack

### Frontend Framework
- **React 18+**: Modern React with concurrent features, Suspense, and improved performance
- **TypeScript 5.0+**: Strict type checking with advanced type inference and utility types
- **React Flow**: Proven graph editing library with extensive customization capabilities
- **Redux Toolkit**: Predictable state management with built-in performance optimizations

### Build System and Development Tools
- **Vite**: Fast build tool with hot module reload and optimized production builds
- **Tailwind CSS**: Utility-first CSS framework with custom design system tokens
- **ESLint + Prettier**: Code quality enforcement and consistent formatting
- **Husky + lint-staged**: Pre-commit hooks ensuring code quality gates

### Testing and Quality Assurance
- **Jest**: Unit testing framework with comprehensive React component testing
- **React Testing Library**: User-centric testing approach focusing on behavior over implementation
- **Playwright**: End-to-end testing for complete user workflow validation
- **Lighthouse**: Performance and accessibility auditing integration

### Integration and Deployment
- **Node.js 18+**: Runtime environment for development and build processes
- **GitHub Actions**: Automated CI/CD pipeline with quality gates and deployment
- **PlantUML CLI**: Diagram generation integration for documentation export
- **.ai-ley CLI**: Command integration for export functionality

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Visual Flow Editor                       │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Component      │   Canvas &      │    Inspector &          │
│  Palette        │   Flow Editor   │    Validation           │
│                 │                 │                         │
│ ┌─────────────┐ │ ┌─────────────┐ │ ┌─────────────────────┐ │
│ │ Node Types  │ │ │ React Flow  │ │ │ Property Editor     │ │
│ │ - CommandPF │ │ │ Integration │ │ │ - Live Validation   │ │
│ │ - LogicCond │ │ │             │ │ │ - Form Management   │ │
│ │ - OutputType│ │ │ Canvas      │ │ │ - Error Display     │ │
│ │ - Loop      │ │ │ Rendering   │ │ │                     │ │
│ │ - CustomPT  │ │ │             │ │ │ Validation Engine   │ │
│ │ - Persona   │ │ │ Connection  │ │ │ - Graph Analysis    │ │
│ │ - Instruct  │ │ │ Management  │ │ │ - Type Checking     │ │
│ └─────────────┘ │ └─────────────┘ │ │ - Quick Fixes       │ │
└─────────────────┴─────────────────┴─┴─────────────────────┴─┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 State Management Layer                      │
├─────────────────┬─────────────────┬─────────────────────────┤
│ Flow State      │ UI State        │ Validation State        │
│ - Node Data     │ - Selection     │ - Error Tracking        │
│ - Connections   │ - Tab Manager   │ - Type Validation       │
│ - Layouts       │ - Inspector     │ - Quick-Fix Suggestions │
└─────────────────┴─────────────────┴─────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Persistence & Export Layer                │
├─────────────────┬─────────────────┬─────────────────────────┤
│ JSON Persistence│ PlantUML Export │ CLI Integration         │
│ - Flow Schema   │ - Diagram Gen   │ - Export Commands       │
│ - File I/O      │ - Batch Process │ - Configuration         │
│ - Versioning    │ - Validation    │ - Path Management       │
└─────────────────┴─────────────────┴─────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                .ai-ley Ecosystem Integration                │
│  .ai-ley/shared/flows/      .ai-ley/shared/uml-flows/      │
│  .ai-ley/config.json        .ai-ley/personas/              │
│  .ai-ley/instructions/      CLI Commands                   │
└─────────────────────────────────────────────────────────────┘
```

## Core Component Architecture

### 1. **Visual Flow Editor Components**

**Component Palette**:
- Searchable node type library with drag initiation
- Category-based organization (Logic, I/O, AI-Specific)
- Visual previews and documentation tooltips
- Keyboard navigation and accessibility support

**Canvas and Flow Editor**:
- React Flow integration with custom node renderers
- Grid snapping, zoom controls, and mini-map navigation
- Real-time connection validation and visual feedback
- Undo/redo state management with Redux integration

**Inspector and Property Panel**:
- Dynamic form generation based on selected node type
- Live validation with immediate error feedback
- File path browsing and autocomplete for node properties
- Integration with validation engine for error display

### 2. **State Management Architecture**

**Redux Store Structure**:
```typescript
interface AppState {
  flows: {
    activeFlowId: string;
    flows: Record<string, FlowDefinition>;
    tabs: TabState[];
  };
  ui: {
    selectedNodes: string[];
    inspectorState: InspectorState;
    validationPanel: ValidationPanelState;
  };
  validation: {
    errors: ValidationError[];
    suggestions: QuickFixSuggestion[];
    isValidating: boolean;
  };
}
```

**Performance Optimizations**:
- Normalized state structure preventing unnecessary re-renders
- Memoized selectors using Reselect for computed values
- Debounced validation to prevent UI blocking
- Virtual scrolling for large node palettes

### 3. **Data Layer Architecture**

**JSON Flow Schema** (Authoritative):
```typescript
interface FlowDefinition {
  version: '1.0.0';
  name: string;
  nodes: NodeDefinition[];
  edges: EdgeDefinition[];
  metadata: FlowMetadata;
}

interface NodeDefinition {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeProperties;
  ports: PortConfiguration;
}
```

**File System Integration**:
- Atomic file operations preventing corruption during saves
- JSON Schema validation ensuring data integrity
- Auto-save functionality with user-configurable intervals
- Backup and recovery mechanisms for critical flow data

## Node Type System Architecture

### Custom Node Implementation Pattern

Each of the 7 node types follows a consistent architecture pattern:

```typescript
interface NodeComponent {
  // Visual rendering component
  NodeRenderer: React.FC<NodeRendererProps>;
  
  // Property configuration schema  
  PropertySchema: JSONSchema7;
  
  // Connection rules and validation
  ConnectionRules: ConnectionValidationRules;
  
  // Export transformation for PlantUML
  ExportTransform: (node: NodeData) => PlantUMLElement;
}
```

### Node Types Specification

1. **CommandPromptFile**: References reusable prompt templates with typed I/O
2. **LogicCondition**: Conditional branching with JavaScript-like expression evaluation
3. **OutputType**: Terminal nodes for various output formats (markdown, JSON, PlantUML, etc.)
4. **Loop**: Iteration control with cycle validation and break conditions
5. **CustomPromptText**: Inline prompt text with variable substitution
6. **Persona**: AI personality application with trait configuration
7. **Instruction**: Behavioral directive application with priority levels

## Connection and Validation System

### Type-Safe Connection Engine

The connection system enforces type compatibility at multiple levels:

**Port-Level Validation**:
- Input/output type matching with strict compatibility rules
- Cardinality enforcement (1:many, many:1 support)
- Cycle detection with Loop node exception handling

**Flow-Level Validation**:
- Graph traversal algorithms detecting orphaned nodes
- Reachability analysis ensuring all paths lead to valid outputs
- Dependency analysis preventing impossible execution orders

**Real-Time Validation Pipeline**:
```typescript
ValidationPipeline = [
  ConnectionTypeValidator,
  GraphStructureValidator, 
  NodePropertyValidator,
  AccessibilityValidator,
  PerformanceValidator
];
```

## Export and Documentation System

### PlantUML Generation Pipeline

**Phase 1: JSON Analysis**
- Parse flow definition with full type validation
- Build dependency graph for proper sequencing
- Extract node metadata and connection relationships

**Phase 2: PlantUML Transformation**
- Map node types to PlantUML stereotypes with visual styling
- Generate connection syntax with proper labeling
- Apply layout hints for optimal diagram rendering

**Phase 3: Export Operations**
- File system operations with configurable path management
- Batch processing for multiple flow export
- Validation of generated PlantUML syntax correctness

### CLI Integration Architecture

```bash
ai-ley flows export [options]
  --out <path>          Export directory (default: .ai-ley/shared/uml-flows/user)
  --flow <name>         Specific flow name (default: all flows)
  --format <type>       Export format (default: plantuml)
  --validate           Validate before export (default: true)
```

## Performance and Scalability

### Canvas Performance Optimization

**Virtualization Strategy**:
- Viewport-based rendering for flows with 500+ nodes
- Intelligent culling of off-screen elements
- Progressive loading for complex node property panels

**Memory Management**:
- Automatic cleanup of unused flow data and undo history
- Efficient data structures minimizing memory footprint
- Garbage collection optimization for long-running sessions

### Scalability Considerations

**Data Structure Optimization**:
- Normalized Redux state preventing redundant data storage
- Efficient graph algorithms with O(n log n) complexity bounds
- Indexed data access patterns for large flow management

**Browser Performance**:
- Web Worker integration for heavy validation operations
- RequestIdleCallback utilization for non-critical updates
- Bundle splitting and lazy loading for optimal load times

## Quality Attributes

### Security Architecture
- **Input Validation**: Comprehensive sanitization of all user inputs and file operations
- **File System Safety**: Sandboxed operations within designated .ai-ley directories
- **XSS Prevention**: Content Security Policy implementation and safe DOM manipulation

### Accessibility Implementation
- **WCAG 2.1 AA Compliance**: Full keyboard navigation and screen reader support
- **Focus Management**: Logical tab order and focus trapping in modal interfaces
- **Visual Accessibility**: High contrast mode support and scalable text rendering

### Maintainability Design
- **Component Modularity**: Independent, testable components with clear interfaces
- **Type Safety**: Comprehensive TypeScript coverage preventing runtime errors
- **Documentation**: Inline code documentation and architectural decision records

This architecture provides a robust foundation for the visual flow editor while ensuring seamless integration with existing .ai-ley systems and supporting future enhancements and scalability requirements.