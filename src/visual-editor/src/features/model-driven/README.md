# Model-Driven AI Agent Instruction System

## Overview

The Model-Driven AI Agent Instruction System (R36) is a comprehensive framework for designing, compiling, and executing AI agent instruction workflows using a visual, template-based approach. The system transforms complex AI workflows into manageable, reusable models that can be edited through forms, compiled to diagrams, and executed with AI services.

## Architecture

The system follows a layered architecture:

```
┌─────────────────────────────────────────────┐
│                UI Layer                     │
│  ModelEditor | CompilationPanel | Exec     │
├─────────────────────────────────────────────┤
│               Service Layer                 │
│  Template | Compilation | Execution        │
├─────────────────────────────────────────────┤
│               Data Layer                    │
│  Templates | Models | Schemas              │
└─────────────────────────────────────────────┘
```

### Core Components

1. **Template System**: Markdown-based templates with YAML frontmatter
2. **Form Editors**: Dynamic React forms for model editing
3. **Compilation System**: PlantUML and Markdown generation
4. **Execution System**: AI-integrated workflow runtime
5. **Type System**: Comprehensive TypeScript definitions

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# The model-driven system is located at:
# src/visual-editor/src/features/model-driven/
```

### Basic Usage

```typescript
import { ModelDrivenSystem } from './features/model-driven';

// Use the complete system
function App() {
  return <ModelDrivenSystem />;
}

// Or use individual components
import {
  ModelEditor,
  CompilationPanel,
  ExecutionPanel
} from './features/model-driven';
```

## Core Concepts

### Node Models

Node models represent individual processing units in AI workflows:

```typescript
interface NodeModel {
  id: string;
  type: NodeType; // 'CommandPromptFile' | 'LogicCondition' | etc.
  name: string;
  description: string;
  properties: Record<string, unknown>;
  inputs: NodePort[];
  outputs: NodePort[];
  metadata?: NodeModelMetadata;
}
```

### Flow Models

Flow models represent complete workflows with connected nodes:

```typescript
interface FlowModel {
  id: string;
  name: string;
  description: string;
  nodes: NodeInstance[];
  connections: FlowConnection[];
  dependencies?: FlowDependency[];
}
```

### Templates

Templates are Markdown files with YAML frontmatter that define reusable model structures:

```markdown
---
id: 'custom-prompt-template'
type: 'node'
nodeType: 'CustomPromptText'
name: 'Custom Prompt Template'
description: 'Template for custom AI prompts'
---

# Custom Prompt Template

This template creates a customizable AI prompt node.

## Configuration

- **Prompt Text**: The AI prompt template
- **Temperature**: Response creativity (0-2)
- **Max Tokens**: Maximum response length
```

## System Features

### 1. Template Loading System

```typescript
import { templateService } from './services/templateService';

// Load all templates
const templates = await templateService.loadTemplates();

// Load specific template
const template = await templateService.loadTemplate('custom-prompt');
```

### 2. Form Generation

```typescript
import { useFormGenerator } from './hooks/useFormGenerator';

function ModelEditor({ template }) {
  const { formConfig, generateForm } = useFormGenerator();
  const form = generateForm(template);

  return <ModelForm config={form} />;
}
```

### 3. Compilation

```typescript
import { compilationService } from './services/compilationService';

// Compile node to PlantUML and Markdown
const result = compilationService.compileNode(nodeModel, {
  includeMetadata: true,
  diagramTheme: 'azure',
  exportFormat: 'svg',
});

console.log(result.plantuml); // PlantUML diagram code
console.log(result.markdown); // Documentation
```

### 4. Execution

```typescript
import { executionService } from './services/executionService';

// Configure AI service
executionService.configureAI({
  provider: 'openai',
  model: 'gpt-4',
  temperature: 0.7,
});

// Execute flow
const result = await executionService.executeFlow(flowModel, {
  variables: { input: 'Hello world' },
  debugMode: true,
});
```

## Component Reference

### ModelEditor

Main orchestrator component for model editing:

```typescript
<ModelEditor
  onSave={(model) => console.log('Saved:', model)}
  onCancel={() => console.log('Cancelled')}
  initialTemplate={template}
/>
```

### CompilationPanel

Displays compilation output with download options:

```typescript
<CompilationPanel
  model={currentModel}
  className="h-full"
/>
```

### ExecutionPanel

Provides execution interface with configuration:

```typescript
<ExecutionPanel
  flow={flowModel}
  className="h-full"
/>
```

### ModelDrivenSystem

Complete system with integrated tabs:

```typescript
<ModelDrivenSystem className="h-screen" />
```

## Node Types

The system supports these node types:

### CommandPromptFile

Executes command prompt files with variable substitution.

**Properties:**

- `filePath`: Path to command file
- `variables`: Variable substitutions

### LogicCondition

Evaluates logical conditions for flow control.

**Properties:**

- `condition`: Boolean expression
- `trueOutput`: Value when true
- `falseOutput`: Value when false

### OutputType

Formats output in various formats.

**Properties:**

- `outputType`: 'json' | 'text' | 'markdown'
- `template`: Optional format template

### Loop

Iterates over data collections.

**Properties:**

- `iterations`: Number of iterations
- `data`: Input data array
- `itemVariable`: Variable name for each item

### CustomPromptText

Executes custom AI prompts.

**Properties:**

- `promptText`: AI prompt template
- `temperature`: Creativity setting
- `maxTokens`: Response limit

### Persona

Applies persona characteristics to AI responses.

**Properties:**

- `personaName`: Persona identifier
- `instructions`: Persona-specific instructions

### Instruction

Executes specific AI instructions.

**Properties:**

- `instruction`: Task instruction
- `context`: Additional context

## Workflow Examples

### Simple AI Processing

```typescript
const simpleFlow: FlowModel = {
  id: 'simple-ai',
  name: 'Simple AI Processing',
  description: 'Basic AI text processing',
  nodes: [
    {
      id: 'input',
      nodeModelId: 'CustomPromptText',
      config: {
        promptText: 'Summarize this text: {{input}}',
      },
    },
  ],
  connections: [],
};
```

### Multi-Step Processing

```typescript
const complexFlow: FlowModel = {
  id: 'complex-processing',
  name: 'Multi-Step AI Processing',
  description: 'Complex workflow with conditions',
  nodes: [
    {
      id: 'analyzer',
      nodeModelId: 'CustomPromptText',
      config: {
        promptText: 'Analyze sentiment: {{input}}',
      },
    },
    {
      id: 'condition',
      nodeModelId: 'LogicCondition',
      config: {
        condition: 'sentiment === "positive"',
      },
    },
    {
      id: 'responder',
      nodeModelId: 'Persona',
      config: {
        personaName: 'helpful-assistant',
      },
    },
  ],
  connections: [
    {
      id: 'conn1',
      from: { nodeId: 'analyzer', outputId: 'sentiment' },
      to: { nodeId: 'condition', inputId: 'sentiment' },
    },
    {
      id: 'conn2',
      from: { nodeId: 'condition', outputId: 'result' },
      to: { nodeId: 'responder', inputId: 'trigger' },
    },
  ],
};
```

## Customization

### Custom Node Types

Add new node types by extending the NodeType union:

```typescript
// types.ts
export type NodeType =
  | 'CommandPromptFile'
  | 'LogicCondition'
  // ... existing types
  | 'MyCustomNode'; // Add custom type

// executionService.ts
private async executeMyCustomNode(
  node: NodeModel,
  inputs: Record<string, unknown>,
  context: ExecutionContext
): Promise<Record<string, unknown>> {
  // Custom execution logic
  return { result: 'custom output' };
}
```

### Custom Templates

Create new templates in the templates directory:

```markdown
---
id: 'my-custom-template'
type: 'node'
nodeType: 'MyCustomNode'
name: 'My Custom Template'
description: 'Custom template for specialized tasks'
---

# My Custom Template

Configuration options for the custom node.
```

### Custom Compilation

Extend compilation options:

```typescript
const customResult = compilationService.compileNode(node, {
  diagramTheme: 'custom',
  includeValidation: true,
  customOptions: {
    // Your custom options
  },
});
```

## Integration

### With AI Services

```typescript
// Configure for OpenAI
executionService.configureAI({
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY,
  model: 'gpt-4',
});

// Configure for Azure OpenAI
executionService.configureAI({
  provider: 'azure',
  endpoint: process.env.AZURE_ENDPOINT,
  apiKey: process.env.AZURE_API_KEY,
  model: 'gpt-4',
});
```

### With File System

```typescript
// Load templates from file system
const templates = await templateService.loadNodeTemplates('./templates');

// Save compiled models
const compilation = compilationService.compileFlow(flow);
await fs.writeFile('output.puml', compilation.plantuml);
await fs.writeFile('documentation.md', compilation.markdown);
```

## Performance Considerations

### Template Caching

Templates are cached automatically:

```typescript
// First load: reads from file system
const template1 = await templateService.loadTemplate('my-template');

// Second load: returns cached version
const template2 = await templateService.loadTemplate('my-template');
```

### Compilation Optimization

Compilation is synchronous and optimized:

```typescript
// Batch compilation
const results = await Promise.all(models.map(model => compilationService.compileNode(model)));
```

### Execution Scaling

Configure execution for performance:

```typescript
await executionService.executeFlow(flow, {
  parallelExecution: true, // Enable parallel node execution
  timeout: 60000, // 60 second timeout
  retryCount: 3, // Retry failed nodes
});
```

## Troubleshooting

### Common Issues

1. **Template Loading Fails**
   - Check file paths and permissions
   - Verify YAML frontmatter syntax

2. **Compilation Errors**
   - Validate model structure
   - Check for circular dependencies

3. **Execution Failures**
   - Verify AI service configuration
   - Check node input/output compatibility

### Debug Mode

Enable detailed logging:

```typescript
const result = await executionService.executeFlow(flow, {
  debugMode: true,
  validateInputs: true,
});

// Check node logs
result.nodeResults.forEach((nodeResult, nodeId) => {
  console.log(`Node ${nodeId}:`, nodeResult.logs);
});
```

## API Reference

### Types

All TypeScript types are exported from the main index:

```typescript
import type {
  NodeModel,
  FlowModel,
  ModelTemplate,
  CompilationResult,
  ExecutionResult,
} from './features/model-driven';
```

### Services

```typescript
import { templateService, compilationService, executionService } from './features/model-driven';
```

### Components

```typescript
import {
  ModelEditor,
  CompilationPanel,
  ExecutionPanel,
  ModelDrivenSystem,
} from './features/model-driven';
```

## Contributing

The Model-Driven AI Agent Instruction System is designed to be extensible. Key areas for contribution:

1. **New Node Types**: Add specialized processing nodes
2. **AI Integrations**: Support for additional AI services
3. **Template Library**: Create reusable template collections
4. **Visualization**: Enhanced PlantUML generation
5. **Performance**: Optimization for large workflows

## License

This system is part of the ai-ley-builder project and follows the same licensing terms.

---

For more information and updates, see the main project documentation.
