# Requirements Specification: Node-RED-style .ai-ley Builder + PlantUML Flows

## Executive Summary and Overview

### Project Context and Background

The .ai-ley Builder is an advanced AI prompt engineering and workflow automation platform that currently operates through text-based configuration files and command-line interfaces. The growing complexity of AI workflows and the need for visual understanding of prompt chains has identified a critical gap: the lack of a visual, intuitive interface for designing and managing AI automation flows.

### High-level Goals and Objectives

- Transform the .ai-ley Builder into a visual, Node-RED-style workflow editor
- Enable drag-and-drop construction of AI prompt chains and logic flows
- Provide seamless export to PlantUML for documentation and visualization
- Maintain full backward compatibility with existing .ai-ley infrastructure
- Accelerate AI workflow development through visual paradigm

### Business Case Summary

**Problem**: Current text-based workflow configuration creates barriers to adoption, slows development, and limits collaboration between technical and non-technical stakeholders.

**Solution**: Visual workflow editor enabling rapid prototyping, intuitive flow design, and automatic documentation generation.

**Value Proposition**:

- 70% reduction in workflow development time
- Improved collaboration through visual representation
- Enhanced maintainability via automatic documentation
- Lower barrier to entry for new users

### Key Stakeholders and Their Interests

- **AI Engineers**: Require powerful node types, type safety, and integration capabilities
- **Product Managers**: Need visual oversight of complex AI workflows and dependencies
- **Business Users**: Want intuitive interface for understanding and modifying workflows
- **DevOps Teams**: Require reliable export, version control, and deployment integration
- **Technical Writers**: Need automatic documentation generation from visual flows

### Success Criteria and Measurable Outcomes

- **User Adoption**: 90% of new workflows created through visual editor within 6 months
- **Development Velocity**: 70% reduction in time-to-deploy for new AI workflows
- **User Satisfaction**: Net Promoter Score (NPS) > 50 for visual editor experience
- **Technical Quality**: Zero regression bugs in existing .ai-ley functionality
- **Documentation Coverage**: 100% automatic PlantUML generation for all visual flows

---

## R1. Project Overview

**R1.1 Mission Statement**  
Upgrade the .ai-ley builder to a visual, Node-RED-style editor that provides a palette of node types (prompts, logic, outputs, loops, custom text, personas, instructions). The system shall allow users to drag nodes onto a canvas, wire nodes left→right, support 1:many and many:1 connections, organize multiple flows as tabs, and export each tab to PlantUML artifacts under a configurable path (default: `.ai-ley/shared/uml-flows/user`).

**R1.2 Scope**  
This system extends the existing .ai-ley builder without breaking existing functionality, creating a visual workflow editor for AI prompt engineering and automation workflows.

---

## R2. Operating Constraints

**R2.1 Non-destructive Integration**  
The system SHALL add functionality without breaking existing .ai-ley behaviors or file structures.

**R2.2 Deterministic Behavior**  
The system SHALL avoid placeholder text beyond what is strictly necessary and state any assumptions explicitly in documentation.

**R2.3 Local Operation**  
The system SHALL NOT require cloud services to render flows; everything MUST run locally within the repository.

**R2.4 Node-RED-like Visual Style**  
The UI SHALL provide Node-RED-like visual affordances including:

- Left input handles and right output handles
- Tidy orthogonal edge routing
- Compact node cards with clear visual hierarchy

**R2.5 Accessibility Compliance**  
The system SHALL support:

- Keyboard navigation for node selection and movement
- Focus outlines meeting WCAG guidelines
- ARIA labels for all palette items and interactive elements

**R2.6 Configurable Export Path**  
The system SHALL use `.ai-ley/shared/uml-flows/user` as the default PlantUML export path, overridable via `.ai-ley/config.json` → `uml.exportPath`.

---

## R3. Functional Requirements

### R3.1 Visual Flow Editor

**R3.1.1 Component Palette**  
The system SHALL provide a left-docked palette containing node types: `CommandPromptFile`, `LogicCondition`, `OutputType`, `Loop`, `CustomPromptText`, `Persona`, and `Instruction`.

**R3.1.2 Canvas Interface**  
The system SHALL provide a canvas that supports:

- Drag-and-drop from palette to canvas
- Nodes rendered with input port(s) on the left and output port(s) on the right
- Visual feedback during drag operations

**R3.1.3 Connection System**  
The connection system SHALL support:

- 1:many fan-out connections from a single output port
- Many:1 fan-in connections to a single input port
- Cycle prevention except when passing through a `Loop` node
- Visual connection previews during wiring

**R3.1.4 Tab Management**  
Each flow SHALL be represented as a tab with capabilities to:

- Add new tabs
- Rename existing tabs
- Duplicate tabs with all nodes and connections
- Delete tabs with confirmation dialog

**R3.1.5 Inspector Panel**  
The system SHALL provide a right-docked inspector panel with:

- Editable properties for selected nodes
- Live validation with error/warning indicators
- Links to source artifacts (e.g., command prompt file paths)
- Context-sensitive help text

**R3.1.6 Navigation Features**  
The canvas SHALL provide:

- Mini-map for large flow navigation
- Zoom controls (fit-to-screen, zoom in/out, actual size)
- Snap-to-grid functionality with configurable grid size

### R3.2 Serialization & Export

**R3.2.1 JSON Flow Storage**  
The system SHALL store flow definitions as JSON files under `.ai-ley/shared/flows/*.json` following the defined schema.

**R3.2.2 PlantUML Export**  
The system SHALL export each flow tab as a `.puml` file under the configured path with:

- One file per flow tab
- Descriptive node representations
- Proper edge connections and labels
- Stereotypes for different node types

**R3.2.3 CLI Integration**  
The system SHALL provide a CLI command `ai-ley flows export` that regenerates all `.puml` files from JSON flows.

### R3.3 Validation & Rules Engine

**R3.3.1 Type-aware Wiring**  
The validation engine SHALL enforce connection rules based on node types and port compatibility as defined in the wiring rules specification.

**R3.3.2 Flow Linting**  
The system SHALL detect and report:

- Orphaned nodes (no connections)
- Dangling edges (incomplete connections)
- Unreachable sink nodes
- Missing required node properties
- Potential cycles not involving Loop nodes

**R3.3.3 Quick-fix Suggestions**  
The inspector panel SHALL provide actionable suggestions for resolving validation issues.

### R3.4 Documentation & Testing

**R3.4.1 Test Coverage**  
The system SHALL include:

- Unit tests for serializers, validators, and exporters (minimum 80% coverage)
- End-to-end tests covering the complete workflow: add-node→wire→export
- Integration tests for CLI commands

**R3.4.2 Documentation**  
The project SHALL provide:

- Updated README with screenshots/animated gifs
- Keyboard shortcuts reference
- CLI usage documentation
- API documentation for extensibility

---

## R4. Node Type Specifications

### R4.1 CommandPromptFile Node

**R4.1.1 Properties**

- `path` (string, required): File path to reusable prompt template
- `inputs` (record): Input parameter definitions
- `outputs` (record): Output type definitions
- `label` (string): Display name for the node

**R4.1.2 Behavior**  
References a reusable prompt file and produces typed outputs based on template execution.

**R4.1.3 Port Configuration**

- Input ports: 0 to 1 (optional data input)
- Output ports: 1 to n (configurable based on output definitions)

### R4.2 LogicCondition Node

**R4.2.1 Properties**

- `expression` (string, required): JavaScript-like boolean expression or DSL
- `cases` (array, required): Array of `{label, when}` condition objects
- `defaultCase` (object, optional): Fallback case when no conditions match

**R4.2.2 Port Configuration**

- Input ports: 1 (data input for evaluation)
- Output ports: 1 to n (one per case plus optional default)

### R4.3 OutputType Node

**R4.3.1 Properties**

- `format` (enum, required): One of `markdown|json|plantuml|csv|html|text|custom`
- `destination` (string, required): File path or sink identifier

**R4.3.2 Port Configuration**

- Input ports: 1 to n (multiple inputs for aggregation)
- Output ports: 0 to 1 (usually terminal, optional for chaining)

### R4.4 Loop Node

**R4.4.1 Properties**

- `iterableExpr` (string, required): Expression defining iteration data
- `maxIterations` (integer, required): Maximum iteration limit for safety
- `breakCondition` (string, optional): Early termination condition

**R4.4.2 Port Configuration**

- Input ports: 1 (seed data)
- Output ports: 2 (body execution, completion notification)

**R4.4.3 Special Behavior**
Allows sanctioned cycles in flow validation; loop edges SHALL NOT be flagged as validation errors.

### R4.5 CustomPromptText Node

**R4.5.1 Properties**

- `template` (string, required): Multiline template with variable substitution
- `variables` (record, optional): Variable definitions and default values

**R4.5.2 Port Configuration**

- Input ports: 0 to 1 (optional data binding)
- Output ports: 1 (rendered prompt text)

### R4.6 Persona Node

**R4.6.1 Properties**

- `id` or `path` (string, required): Persona identifier or file path
- `traits` (array, optional): Additional persona characteristics
- `overrideTone` (string, optional): Tone override for this instance

**R4.6.2 Port Configuration**

- Input ports: 1 (upstream data context)
- Output ports: 1 (persona-contextualized prompt)

### R4.7 Instruction Node

**R4.7.1 Properties**

- `id` or `path` (string, required): Instruction identifier or file path
- `priority` (integer, required): Execution priority level
- `mode` (enum, required): One of `strict|advisory`

**R4.7.2 Port Configuration**

- Input ports: 1 (data input)
- Output ports: 1 (processed output)

---

## R5. Connection Rules and Constraints

### R5.1 Directional Flow

**R5.1.1 Left-to-Right Flow**  
All connections SHALL flow strictly left-to-right, enforcing a clear data flow direction.

### R5.2 Cardinality Rules

**R5.2.1 Fan-out and Fan-in**  
The system SHALL support:

- 1:many connections (single output to multiple inputs)
- Many:1 connections (multiple outputs to single input)
- Prohibition of many:many at a single port (use explicit join/fork patterns)

### R5.3 Type Compatibility Matrix

**R5.3.1 Valid Connection Paths**  
The following connection types SHALL be enforced:

- `CustomPromptText` output → `Persona`, `Instruction`, or `CommandPromptFile` input
- `Persona` or `Instruction` output → `CommandPromptFile`, `LogicCondition`, or `OutputType` input
- `LogicCondition` branch outputs → any downstream compatible node input
- `CommandPromptFile` outputs → `LogicCondition`, `OutputType`, or `Loop` input
- `Loop` body output → any node input; closing edge may return to pre-loop node (marked as loopback)
- `OutputType` typically terminal (no downstream), unless piping to another sink node

### R5.4 Cycle Prevention

**R5.4.1 Loop Validation**  
Only edges marked as **loopback** exiting a `Loop` node SHALL be permitted to create cycles in the flow graph.

---

## R6. Data Schema Specifications

### R6.1 Flow JSON Schema

**R6.1.1 Schema Structure**  
Flow definitions SHALL conform to the following JSON schema:

```json
{
  "version": "1.0.0",
  "name": "string",
  "nodes": [
    {
      "id": "node-uuid",
      "type": "CommandPromptFile|LogicCondition|OutputType|Loop|CustomPromptText|Persona|Instruction",
      "label": "string",
      "position": { "x": 0, "y": 0 },
      "props": {},
      "ports": {
        "in": [{ "id": "pin", "label": "in", "type": "any" }],
        "out": [{ "id": "pout", "label": "out", "type": "any" }]
      },
      "meta": { "icon": "string", "color": "#hex" }
    }
  ],
  "edges": [
    {
      "id": "edge-uuid",
      "from": { "nodeId": "node-uuid", "portId": "pout" },
      "to": { "nodeId": "node-uuid", "portId": "pin" },
      "kind": "normal|loopback",
      "label": "string"
    }
  ]
}
```

**R6.1.2 Schema Validation**  
All flow files SHALL be validated against the JSON schema before saving or exporting.

---

## R7. PlantUML Export Specification

### R7.1 Export Requirements

**R7.1.1 File Path Convention**  
PlantUML files SHALL be exported to `.ai-ley/shared/uml-flows/user/<flow-name>.puml` by default.

**R7.1.2 Template Mapping Rules**

- Each node SHALL be represented as: `rectangle "<label>\n<<type>>" as N<ID>` with stereotype matching the node type
- Each edge SHALL be represented as: `N<from> --> N<to> : <label>`
- Loopback edges SHALL use `..>` notation and append `<<loop>>` stereotype
- Each flow tab SHALL generate a separate .puml file

**R7.1.3 Example Output**

```plantuml
@startuml
title Flow: Onboard User
skinparam rectangle {
  BackgroundColor<<Loop>> #eef7ff
  BackgroundColor<<LogicCondition>> #fff7e6
}
rectangle "Persona: BlaineAI
<<Persona>>" as N1
rectangle "Welcome Template
<<CustomPromptText>>" as N2
rectangle "Select Path
<<LogicCondition>>" as N3
rectangle "Onboard Cmd
<<CommandPromptFile>>" as N4
rectangle "Save as Markdown
<<OutputType>>" as N5
N1 --> N2 : apply persona
N2 --> N3 : render
N3 --> N4 : when isNew
N4 --> N5 : write file
@enduml
```

---

## R8. User Experience Requirements

### R8.1 Palette Interaction

**R8.1.1 Search and Discovery**  
The palette SHALL provide:

- Search functionality to filter available node types
- Drag start announcement of node names for accessibility
- Automatic snap-to-grid on drop operations

### R8.2 Canvas Interaction

**R8.2.1 Connection Feedback**
The canvas SHALL provide:

- Orthogonal connector routing for clean visual appearance
- Hover highlighting of valid connection targets
- Connection preview showing type compatibility during wiring

### R8.3 Inspector Panel

**R8.3.1 Property Editing**
The inspector SHALL provide:

- Focus-first behavior on required fields when nodes are selected
- Inline validation messages with clear error descriptions
- Direct links to backing files for file-based nodes

### R8.4 Tab Management Interface

**R8.4.1 Tab Operations**  
Tab interface SHALL support:

- '+' button to add new tabs
- Right-click context menu for duplicate/export/rename/delete operations
- Unsaved indicator (e.g., dot notation) for modified flows

### R8.5 Keyboard Shortcuts

**R8.5.1 Standard Operations**
The system SHALL support keyboard shortcuts:

- `Del`: Delete selected nodes/connections
- `Cmd/Ctrl+D`: Duplicate selected node
- `Cmd/Ctrl+E`: Export current flow to PlantUML
- `Cmd/Ctrl+S`: Save flow JSON to disk

---

## R9. Non-Functional Requirements

### R9.1 Performance

**R9.1.1 Response Time**

- Canvas operations (drag, zoom, connect) SHALL respond within 100ms
- Flow export to PlantUML SHALL complete within 2 seconds for flows up to 100 nodes

**R9.1.2 Scalability**

- System SHALL support flows with up to 500 nodes without performance degradation
- Memory usage SHALL not exceed 200MB for typical flows (< 50 nodes)

### R9.2 Reliability

**R9.2.1 Data Persistence**

- Auto-save SHALL occur every 30 seconds when changes are detected
- Recovery mechanism SHALL restore unsaved work after unexpected application closure

### R9.3 Usability

**R9.3.1 Learning Curve**

- New users SHALL be able to create a basic flow within 5 minutes using provided tutorials
- Keyboard shortcuts SHALL be discoverable through tooltips and help documentation

## R10. Acceptance Criteria

### R10.1 Core Functionality Validation

**R10.1.1 Node Management**

- ✅ User CAN create each node type from palette
- ✅ User CAN edit node properties with live validation
- ✅ User CAN wire valid edges between compatible nodes
- ✅ System PREVENTS invalid connections with clear error messages

**R10.1.2 Connection System**

- ✅ System SUPPORTS 1:many and many:1 connections
- ✅ Loopback connections are ONLY permitted via Loop nodes
- ✅ Connection validation provides immediate visual feedback

**R10.1.3 Data Persistence**

- ✅ Save/Load round-trip maintains JSON → UI → JSON stability (no ID churn)
- ✅ Export produces valid PlantUML file per tab at configured path
- ✅ Flow serialization preserves all node properties and connections

**R10.1.4 Validation Engine**

- ✅ Linting reports: orphan nodes, dangling edges, unreachable sinks, missing properties
- ✅ Quick-fix suggestions are actionable and resolve reported issues

**R10.1.5 Accessibility**

- ✅ Keyboard accessibility works for palette and canvas selection
- ✅ ARIA labels provide meaningful descriptions for screen readers
- ✅ Focus management follows logical tab order

**R10.1.6 Testing and Documentation**

- ✅ Unit tests cover serializer/validator with minimum 80% coverage
- ✅ End-to-end tests verify complete workflow: create→wire→export
- ✅ Documentation includes screenshots, keyboard shortcuts, and CLI usage

## R11. Implementation Guidance (Non-Binding)

### R11.1 Technology Recommendations

- **Frontend**: React with React Flow library for graph editing capabilities
- **State Management**: Serialize to Flow JSON Schema on save; derive PlantUML via pure function `toPlantUml(flowJson)`
- **Persistence**: Store flow JSON under `.ai-ley/shared/flows/` with idempotent export
- **CLI**: Implement `ai-ley flows export [--out <path>] [--flow <name>]` command

---

## R12. User Stories with Acceptance Criteria

### R12.1 Visual Flow Creation Stories

**US1: Basic Flow Creation**
**As a** AI Engineer  
**I want** to drag nodes from a palette onto a canvas  
**So that** I can visually construct AI prompt workflows without writing configuration files

**Acceptance Criteria**:

- [ ] I can see a searchable palette with all 7 node types available
- [ ] I can drag any node type onto the canvas and it appears at the correct position
- [ ] Dropped nodes snap to a visible grid for alignment
- [ ] Each node displays its type and a user-editable label
- [ ] I can select and delete nodes using keyboard shortcuts

**Priority**: High  
**Complexity**: Moderate  
**Related Requirements**: R3.1.1, R3.1.2, R8.1.1

**US2: Flow Connectivity**
**As a** AI Engineer  
**I want** to connect nodes with visual wires  
**So that** I can define the data flow and execution order of my AI workflow

**Acceptance Criteria**:

- [ ] I can click and drag from output ports to input ports to create connections
- [ ] Invalid connections are prevented with visual feedback
- [ ] Connection previews show type compatibility before completing the connection
- [ ] I can delete connections by selecting and pressing Delete key
- [ ] 1:many and many:1 connections are supported and visually clear

**Priority**: High  
**Complexity**: High  
**Related Requirements**: R3.1.3, R5.1.1, R5.2.1, R5.3.1

**US3: Multi-tab Workflow Management**
**As a** Product Manager  
**I want** to organize different workflows in separate tabs  
**So that** I can manage multiple AI automation scenarios in a single interface

**Acceptance Criteria**:

- [ ] I can create new tabs with descriptive names
- [ ] I can switch between tabs to view different workflows
- [ ] I can duplicate existing tabs to create workflow variations
- [ ] Unsaved changes are indicated with visual markers
- [ ] I can export individual tabs or all tabs at once

**Priority**: High  
**Complexity**: Moderate  
**Related Requirements**: R3.1.4, R8.4.1

### R12.2 Advanced Workflow Stories

**US4: Node Property Configuration**
**As a** AI Engineer  
**I want** to configure node-specific properties through an inspector panel  
**So that** I can customize the behavior of each node in my workflow

**Acceptance Criteria**:

- [ ] Selecting a node shows its properties in the inspector panel
- [ ] Required fields are clearly marked and validated
- [ ] File path properties provide browse/autocomplete functionality
- [ ] Changes are applied immediately with live validation feedback
- [ ] Property errors are displayed with clear, actionable messages

**Priority**: High  
**Complexity**: High  
**Related Requirements**: R3.1.5, R4.1.1-R4.7.2

**US5: PlantUML Export and Documentation**
**As a** Technical Writer  
**I want** to export visual flows as PlantUML diagrams  
**So that** I can automatically generate documentation for AI workflows

**Acceptance Criteria**:

- [ ] I can export the current flow to PlantUML with a single keyboard shortcut
- [ ] Generated PlantUML files are saved to the configured export directory
- [ ] Exported diagrams accurately represent nodes, connections, and labels
- [ ] Different node types have visually distinct representations
- [ ] Export operation completes within 2 seconds for flows up to 100 nodes

**Priority**: High  
**Complexity**: Moderate  
**Related Requirements**: R3.2.2, R7.1.1, R7.1.2

### R12.3 User Experience Stories

**US6: Workflow Validation and Error Detection**
**As a** Business User  
**I want** to receive clear feedback about workflow issues  
**So that** I can identify and resolve problems before deploying AI workflows

**Acceptance Criteria**:

- [ ] Orphaned nodes are highlighted with warning indicators
- [ ] Missing required properties show error badges on nodes
- [ ] Validation errors are listed in an easily accessible panel
- [ ] Quick-fix suggestions are provided for common issues
- [ ] Validation runs automatically when workflows are modified

**Priority**: Medium  
**Complexity**: High  
**Related Requirements**: R3.3.1, R3.3.2, R3.3.3

**US7: Keyboard Accessibility**
**As a** user with accessibility needs  
**I want** to navigate and edit flows using only the keyboard  
**So that** I can use the visual editor regardless of motor limitations

**Acceptance Criteria**:

- [ ] Tab key moves focus through palette, canvas, and inspector in logical order
- [ ] Arrow keys move selection between nodes on the canvas
- [ ] Space bar activates drag mode for selected nodes
- [ ] Enter key opens property editing for selected nodes
- [ ] All functionality has keyboard shortcuts with discoverable help

**Priority**: Medium
**Complexity**: High
**Related Requirements**: R2.5, R8.5.1, R10.1.5

---

## R23. AI CLI Integration Service

**R23.1 Local AI Tool Execution**
The system SHALL provide a service layer that interfaces with configured local AI CLI tools, enabling users to execute prompts through tools like Ollama, Llama.cpp, or other command-line AI interfaces.

**R23.2 Tool Configuration Integration**
The service SHALL automatically discover and utilize AI CLI tools configured in the settings system, respecting tool enablement status, timeout settings, and custom arguments.

**R23.3 Command Execution Management**
The system SHALL support:

- Asynchronous command execution with progress callbacks
- Configurable timeout handling per tool
- Process cancellation and cleanup
- Error handling and reporting
- Usage statistics tracking

**R23.4 Cross-Platform Compatibility**
The service SHALL provide browser simulation mode for development while maintaining actual CLI execution capabilities in Node.js environments.

**Priority**: High
**Complexity**: Moderate
**Related Requirements**: R2.1, R2.3

---

## R24. AI API Integration Service

**R24.1 Multi-Provider API Support**
The system SHALL provide a unified service layer for communicating with various AI API providers including OpenAI, Anthropic, Google, Azure, and custom endpoints.

**R24.2 Provider-Specific Handling**
The service SHALL implement provider-specific request formatting, authentication, and response parsing while presenting a consistent interface to consumers.

**R24.3 Advanced API Features**
The system SHALL support:

- Streaming responses for real-time interaction
- Token usage tracking and reporting
- Retry logic with exponential backoff
- Request/response validation
- Usage analytics and performance metrics

**R24.4 Security and Authentication**
The service SHALL securely handle API keys from the settings system and provide proper error handling for authentication failures.

**Priority**: High
**Complexity**: High
**Related Requirements**: R2.1, R2.3

---

## R25. AI Tool Selection Components

**R25.1 CLI Tool Selector Interface**
The system SHALL provide a React component that allows users to:

- Select from available AI CLI tools
- Configure tool-specific parameters
- Execute prompts with real-time feedback
- View execution results and error messages
- Test tool availability and connectivity

**R25.2 API Endpoint Selector Interface**
The system SHALL provide a React component that enables users to:

- Choose from configured AI API endpoints
- Build multi-message conversations
- Configure request parameters (model, temperature, tokens)
- Send both standard and streaming requests
- Monitor token usage and response times

**R25.3 Integration and Accessibility**
Both components SHALL:

- Integrate seamlessly with the existing settings system
- Provide accessible keyboard navigation
- Display usage statistics and tool status
- Support both modal and embedded usage patterns
- Offer comprehensive error handling and user feedback

**R25.4 Demonstration Interface**
The system SHALL include a demonstration interface accessible via command palette that showcases both CLI and API integration capabilities.

**Priority**: Medium
**Complexity**: Moderate
**Related Requirements**: R23.1, R24.1, R2.5

---

## R26. Automatic Layout and Arrangement System

**R26.1 Connection-Based Auto-Layout Engine**
The system SHALL provide an intelligent auto-layout engine that analyzes node connections and dependencies to automatically arrange visual dialog boxes (nodes) in optimal positions based on their input/output relationships.

**R26.2 Multi-Algorithm Layout Support**
The system SHALL support multiple layout algorithms including:

- Hierarchical layout (top-to-bottom, left-to-right)
- Force-directed layout for complex interconnected workflows
- Layered layout for sequential processing chains
- Grid-based layout for structured arrangements

**R26.3 Smart Spacing and Alignment**
The auto-layout engine SHALL provide:

- Automatic spacing calculation based on node content size
- Alignment of nodes with similar functions or types
- Collision detection and resolution for overlapping nodes
- Consistent spacing ratios across the entire workflow

**R26.4 Layout Trigger Mechanisms**
The system SHALL offer multiple ways to trigger auto-arrangement:

- Manual trigger via toolbar button or keyboard shortcut
- Optional automatic arrangement on node addition/removal
- Batch arrangement for imported or pasted node groups
- Layout suggestions when workflow becomes cluttered

**R26.5 User Control and Preferences**
The auto-layout system SHALL respect user preferences by:

- Preserving manually positioned nodes when requested
- Allowing selective auto-arrangement of specific node groups
- Providing undo/redo for layout operations
- Maintaining layout history for comparison
- Offering layout preview before application

**R26.6 Performance Optimization**
The layout engine SHALL maintain responsive performance by:

- Processing layouts asynchronously for large workflows (>50 nodes)
- Using incremental layout updates for minor changes
- Implementing layout caching for repeated operations
- Providing progress feedback for lengthy layout calculations

**Priority**: High
**Complexity**: High
**Related Requirements**: R3.1.2, R3.1.3, R8.2.1

---

## R27. Trumbowyg Rich Text Editor Integration

**R27.1 TinyMCE to Trumbowyg Migration**

Replace the existing TinyMCE rich text editor implementation with Trumbowyg to improve performance, reduce bundle size, and enhance user experience.

- **Description**: Migrate from TinyMCE (@tinymce/tinymce-react ^6.3.0, tinymce ^8.1.2) to Trumbowyg for all rich text editing functionality within the visual flow editor
- **Business Value**: Significant performance improvements, smaller application bundle size (~20KB vs ~500KB), better mobile responsiveness, and improved accessibility
- **Acceptance Criteria**:
  - [ ] Remove TinyMCE dependencies from package.json
  - [ ] Install and configure Trumbowyg with React integration
  - [ ] Update RichTextEditor component to use Trumbowyg API
  - [ ] Maintain existing PlantUML editing functionality
  - [ ] Preserve current toolbar features (bold, italic, lists, code blocks)
  - [ ] Maintain fullscreen editing capability
  - [ ] Ensure PlantUML validation and rendering features remain functional
  - [ ] Update UMLFlowsSettings to reference Trumbowyg instead of TinyMCE
  - [ ] Verify accessibility improvements meet WCAG 2.1 AA standards
  - [ ] Test mobile and tablet responsiveness
  - [ ] Ensure backward compatibility with existing content
- **Priority**: Medium
- **Complexity**: Moderate
- **Dependencies**: RichTextEditor component, UMLFlowsSettings component
- **Source**: ASK-006 - 2025-09-18 - TinyMCE to Trumbowyg editor migration request

**R27.2 Enhanced Editor Features**

Leverage Trumbowyg's plugin ecosystem to provide enhanced editing capabilities specific to PlantUML and technical documentation.

- **Description**: Implement Trumbowyg plugins and custom extensions to enhance the editing experience for technical content and PlantUML workflows
- **Business Value**: Improved user experience for technical documentation, better syntax support, and enhanced workflow efficiency
- **Acceptance Criteria**:
  - [ ] Implement syntax highlighting for PlantUML code blocks
  - [ ] Add emoji support for enhanced documentation
  - [ ] Configure table editing plugins for structured content
  - [ ] Implement file upload handling for images and attachments
  - [ ] Add custom toolbar for PlantUML-specific formatting
  - [ ] Provide keyboard shortcuts for common formatting actions
  - [ ] Implement auto-save functionality with draft recovery
- **Priority**: Low
- **Complexity**: Simple
- **Dependencies**: R27.1 (Trumbowyg Migration)
- **Source**: Enhancement derived from ASK-006

**R27.3 Performance and Bundle Optimization**

Optimize application performance and bundle size through the Trumbowyg migration.

- **Description**: Achieve measurable performance improvements in loading time, runtime performance, and mobile experience through the editor change
- **Business Value**: Better user experience, faster application startup, and improved mobile device support
- **Acceptance Criteria**:
  - [ ] Reduce JavaScript bundle size by at least 400KB
  - [ ] Improve editor initialization time by 50%
  - [ ] Maintain or improve rich text editing performance
  - [ ] Verify mobile touch interaction responsiveness
  - [ ] Ensure accessibility features perform equivalently to TinyMCE
- **Priority**: Medium
- **Complexity**: Simple
- **Dependencies**: R27.1 (Trumbowyg Migration)
- **Source**: Performance optimization goals from ASK-006

---

## R28. GitHub Node Repository Import System

**R28.1 Repository Configuration and Management**

Enable users to configure GitHub repositories as sources for importing custom node definitions through the settings system.

- **Description**: Implement a settings interface that allows users to specify GitHub repository URLs, authentication credentials, and import preferences for custom node libraries
- **Business Value**: Creates extensible platform for community-driven node ecosystem, enabling organizations to share and reuse workflow components
- **Acceptance Criteria**:
  - [ ] Settings panel for adding/removing GitHub repository sources
  - [ ] Support for public and private GitHub repositories
  - [ ] Repository URL validation and authentication handling
  - [ ] Repository metadata caching (name, description, last updated)
  - [ ] Import preferences configuration (auto-update, version selection)
  - [ ] Repository browsing interface showing available node packages
  - [ ] Connection testing and validation for configured repositories
- **Priority**: High
- **Complexity**: High
- **Dependencies**: Settings system (existing), GitHub API integration
- **Source**: ASK-007 - 2025-09-18 - GitHub node import functionality request

**R28.2 Node Discovery and Import Engine**

Implement the core functionality to discover, validate, and import node definitions from configured GitHub repositories.

- **Description**: Create a robust import system that can fetch node definitions from GitHub repositories, validate their structure, and integrate them into the visual flow editor's node palette
- **Business Value**: Accelerates workflow development by providing access to community-contributed node libraries and reusable components
- **Acceptance Criteria**:
  - [ ] GitHub API integration for repository content discovery
  - [ ] Node definition file format specification and validation
  - [ ] Import wizard with repository browsing and node selection
  - [ ] Node metadata extraction (name, description, category, version)
  - [ ] Dependency resolution for imported nodes
  - [ ] Import progress tracking and error handling
  - [ ] Rollback mechanism for failed imports
  - [ ] Import history and audit logging
- **Priority**: High
- **Complexity**: Expert
- **Dependencies**: R28.1 (Repository Configuration), Node system architecture
- **Source**: Core functionality from ASK-007

**R28.3 Security and Validation Framework**

Ensure imported nodes are secure, valid, and do not compromise the application or user data.

- **Description**: Implement comprehensive security measures and validation processes for imported node definitions to prevent malicious code execution and ensure compatibility
- **Business Value**: Maintains platform security while enabling extensibility, builds user trust in the import system
- **Acceptance Criteria**:
  - [ ] Node definition schema validation and enforcement
  - [ ] Code sandboxing for imported node execution logic
  - [ ] Security scanning for potentially dangerous operations
  - [ ] Digital signature verification for trusted repositories
  - [ ] Permission system for node capabilities (file access, network, etc.)
  - [ ] Quarantine system for suspicious imports
  - [ ] User consent flow for security-sensitive imports
  - [ ] Security audit trail for all import operations
- **Priority**: High
- **Complexity**: Expert
- **Dependencies**: R28.2 (Import Engine), Security framework
- **Source**: Security requirements derived from ASK-007

**R28.4 Version Control and Update Management**

Manage node versions, updates, and compatibility across imported node libraries.

- **Description**: Implement version control system for imported nodes including update notifications, compatibility checking, and migration support
- **Business Value**: Ensures imported nodes remain functional and up-to-date, provides smooth upgrade path for evolving node libraries
- **Acceptance Criteria**:
  - [ ] Semantic versioning support for imported nodes
  - [ ] Update notification system for newer node versions
  - [ ] Compatibility matrix for node dependencies
  - [ ] Automatic and manual update workflows
  - [ ] Breaking change detection and migration support
  - [ ] Rollback capability to previous node versions
  - [ ] Impact analysis before applying updates
  - [ ] Bulk update operations for multiple nodes
- **Priority**: Medium
- **Complexity**: High
- **Dependencies**: R28.2 (Import Engine), Version control system
- **Source**: Version management requirements from ASK-007

---

## R29. Codex CLI Integration Support

**R29.1 Codex CLI Tool Integration**

Add OpenAI Codex CLI support to the existing AI integration framework, enabling code generation, analysis, and refactoring capabilities within visual workflows.

- **Description**: Integrate OpenAI Codex CLI tool into the AI CLI service layer, providing access to advanced code generation, explanation, and refactoring capabilities through the visual flow editor
- **Business Value**: Enhances developer productivity with AI-powered code assistance, expands the AI tool ecosystem, and provides specialized code-focused AI capabilities
- **Acceptance Criteria**:
  - [ ] Add Codex CLI configuration to AI tools settings panel
  - [ ] Implement Codex CLI wrapper in AICliService
  - [ ] Create Codex-specific node types for code generation and analysis
  - [ ] Support common Codex operations (generate, explain, refactor, translate)
  - [ ] Add authentication and API key management for Codex
  - [ ] Implement rate limiting and usage tracking for Codex API calls
  - [ ] Create code-specific input/output handling (syntax highlighting, validation)
  - [ ] Add Codex to command palette integration (⌘⇧A)
  - [ ] Support multiple programming languages and frameworks
  - [ ] Implement error handling and fallback mechanisms
- **Priority**: Medium
- **Complexity**: Moderate
- **Dependencies**: AICliService (R23), Settings system, Command palette integration
- **Source**: ASK-008 - 2025-09-18 - Codex CLI support request

**R29.2 Code Generation Workflow Integration**

Implement specialized workflows and node types that leverage Codex's code generation capabilities for common development tasks.

- **Description**: Create code-focused workflow components that utilize Codex for generating boilerplate code, API implementations, test cases, and documentation
- **Business Value**: Accelerates development workflows by automating repetitive coding tasks and providing intelligent code suggestions within the visual editor context
- **Acceptance Criteria**:
  - [ ] Code generation node with language/framework selection
  - [ ] Code explanation and documentation generation nodes
  - [ ] Code refactoring and optimization suggestion nodes
  - [ ] Unit test generation based on existing code
  - [ ] API endpoint generation from specifications
  - [ ] Code translation between programming languages
  - [ ] Integration with existing project context and files
  - [ ] Output formatting and syntax highlighting
  - [ ] Code validation and quality checks
  - [ ] Template system for common code patterns
- **Priority**: Low
- **Complexity**: Moderate
- **Dependencies**: R29.1 (Codex CLI Integration), Node system architecture
- **Source**: Code workflow enhancement from ASK-008

**R29.3 Multi-AI Model Comparison**

Enable side-by-side comparison of code suggestions and outputs from different AI models including Codex, Claude, Copilot, and Gemini.

- **Description**: Implement comparison interface that allows users to request the same task from multiple AI models and compare results for quality, approach, and suitability
- **Business Value**: Helps users choose the best AI tool for specific tasks, improves code quality through multiple perspectives, and provides learning opportunities
- **Acceptance Criteria**:
  - [ ] Multi-model request orchestration system
  - [ ] Side-by-side comparison UI for code outputs
  - [ ] Quality scoring and metrics for different models
  - [ ] User feedback and preference tracking
  - [ ] Performance comparison (speed, accuracy, relevance)
  - [ ] Integration with existing AI tool configurations
  - [ ] Export and sharing of comparison results
  - [ ] Historical comparison analysis and trends
- **Priority**: Low
- **Complexity**: High
- **Dependencies**: R29.1 (Codex Integration), R23 (AI CLI Service), R24 (AI API Service)
- **Source**: Multi-AI enhancement derived from ASK-008

---

## R30. Scoped Storage System

**R30.1 Storage Architecture and Scoping**

Implement a Node-RED-style scoped storage system that provides node, flow, and global scope access for state management within visual workflows.

- **Description**: Create a hierarchical storage system that allows workflow nodes to store and retrieve data at different scoping levels (node-specific, flow-specific, and global), with persistent storage under `.ai-ley/state` directory
- **Business Value**: Enables complex stateful workflows, improves workflow modularity, supports data sharing between nodes, and provides foundation for advanced workflow patterns
- **Acceptance Criteria**:
  - [ ] Implement three-tier scoping system: node, flow, and global
  - [ ] Create storage structure under `.ai-ley/state` with organized directory hierarchy
  - [ ] Node scope: storage isolated to individual node instances
  - [ ] Flow scope: storage shared between nodes within the same flow
  - [ ] Global scope: storage accessible across all flows and nodes
  - [ ] Automatic cleanup of node-scoped data when nodes are deleted
  - [ ] Flow-scoped data persistence across flow edits
  - [ ] Global data persistence across application restarts
  - [ ] JSON-based storage format for complex data structures
  - [ ] Storage size limits and monitoring (configurable per scope)
- **Priority**: High
- **Complexity**: High
- **Dependencies**: File system access, Workflow execution engine, Node lifecycle management
- **Source**: ASK-009 - 2025-09-18 - Scoped storage support request

**R30.2 Storage Access Node Types**

Create specialized node types for getting and setting data in the scoped storage system, providing intuitive interface for storage operations.

- **Description**: Implement "Storage Get" and "Storage Set" node types that allow workflows to interact with the scoped storage system through visual nodes with scope selection and key-value operations
- **Business Value**: Provides user-friendly interface for storage operations, enables visual workflow design with storage, and maintains consistency with Node-RED storage patterns
- **Acceptance Criteria**:
  - [ ] "Storage Set" node type with scope selector (node/flow/global)
  - [ ] "Storage Get" node type with scope selector and default value support
  - [ ] Key-value interface with string keys and JSON-serializable values
  - [ ] Node property panels for configuring storage keys and scopes
  - [ ] Visual indicators showing storage scope in node appearance
  - [ ] Support for dynamic key names using input connections
  - [ ] Error handling for storage access failures
  - [ ] Storage browser/inspector for debugging stored values
  - [ ] Bulk operations for clearing scope-specific storage
  - [ ] Storage import/export functionality for workflow sharing
- **Priority**: High
- **Complexity**: Moderate
- **Dependencies**: R30.1 (Storage Architecture), Node system, Visual editor
- **Source**: Storage node interface from ASK-009

**R30.3 Storage Persistence and Management**

Implement robust storage persistence, cleanup, and management capabilities to ensure reliable data handling and optimal performance.

- **Description**: Create storage management system that handles data persistence, automatic cleanup, backup/restore, and storage monitoring with configurable policies
- **Business Value**: Ensures data reliability and system performance, provides operational control over storage usage, and enables backup/recovery workflows
- **Acceptance Criteria**:
  - [ ] Automatic persistence of storage changes to disk
  - [ ] Configurable storage limits per scope (node: 1MB, flow: 10MB, global: 100MB)
  - [ ] Storage cleanup policies for unused data
  - [ ] Backup and restore functionality for storage data
  - [ ] Storage usage monitoring and reporting
  - [ ] Migration tools for storage format updates
  - [ ] Compression for large storage files
  - [ ] Storage integrity validation and repair
  - [ ] Audit logging for storage operations
  - [ ] Admin interface for storage management and monitoring
- **Priority**: Medium
- **Complexity**: High
- **Dependencies**: R30.1 (Storage Architecture), File system monitoring, Configuration system
- **Source**: Storage management requirements from ASK-009

---

## R31. Core Workflow Node Types Extension

**R31.1 Debug and Logging Node Types**

Implement essential debugging and logging nodes to support workflow development, troubleshooting, and monitoring capabilities.

- **Description**: Create Log Node and Debug Node types that provide comprehensive logging, debugging, and data inspection capabilities for workflow development and production monitoring
- **Business Value**: Significantly improves developer productivity by providing essential debugging tools, reduces troubleshooting time, and enables production monitoring and logging
- **Acceptance Criteria**:
  - [ ] Log Node with configurable log levels (debug, info, warn, error)
  - [ ] Log Node output to console, file, and in-app log viewer
  - [ ] Debug Node with real-time data inspection and breakpoint capabilities
  - [ ] Debug Node with data formatting, filtering, and export functionality
  - [ ] Timestamp and source node identification in all log outputs
  - [ ] Integration with workflow execution engine for runtime debugging
  - [ ] Log rotation and retention policies for file-based logging
  - [ ] Performance impact monitoring (minimal overhead during execution)
  - [ ] Configurable output formats (JSON, plain text, structured)
  - [ ] Search and filtering capabilities in log viewer
- **Priority**: High
- **Complexity**: Moderate
- **Dependencies**: Workflow execution engine, Node system architecture, UI components
- **Source**: ASK-010 - 2025-09-18 - Core node types development request

**R31.2 Parallel Processing Node Types**

Create Parallel Executor node that enables concurrent execution of workflow branches to improve performance and enable sophisticated processing patterns.

- **Description**: Implement Parallel Executor node that can execute multiple workflow branches concurrently, with synchronization, error handling, and result aggregation capabilities
- **Business Value**: Dramatically improves workflow performance for I/O-bound and CPU-intensive operations, enables advanced workflow patterns, and provides scalability for complex processing tasks
- **Acceptance Criteria**:
  - [ ] Parallel Executor node with configurable parallelism levels
  - [ ] Support for parallel execution of multiple output branches
  - [ ] Synchronization mechanism to wait for all parallel operations
  - [ ] Error handling and rollback strategies for failed parallel operations
  - [ ] Result aggregation and ordering options
  - [ ] Progress monitoring and status reporting for parallel tasks
  - [ ] Resource management and throttling to prevent system overload
  - [ ] Timeout configuration for parallel operations
  - [ ] Integration with workflow scheduler and execution engine
  - [ ] Performance metrics and monitoring for parallel execution
- **Priority**: High
- **Complexity**: High
- **Dependencies**: Workflow execution engine, Concurrency management, Resource monitoring
- **Source**: Parallel processing enhancement from ASK-010

**R31.3 Data Processing Node Types**

Implement Split (regex-based) and Join nodes for advanced data manipulation and workflow control patterns.

- **Description**: Create specialized nodes for data splitting using regular expressions and data joining/merging operations, enabling sophisticated data processing workflows
- **Business Value**: Enables complex data processing patterns, improves workflow modularity through data transformation capabilities, and provides essential building blocks for data-intensive applications
- **Acceptance Criteria**:
  - [ ] Split Node with regex pattern configuration and testing interface
  - [ ] Split Node with multiple output modes (all matches, first match, groups)
  - [ ] Split Node with error handling for invalid regex patterns
  - [ ] Join Node with multiple joining strategies (merge, concatenate, aggregate)
  - [ ] Join Node with configurable key-based joining and sorting options
  - [ ] Data type preservation and transformation options
  - [ ] Preview functionality for split and join operations
  - [ ] Performance optimization for large data sets
  - [ ] Schema validation and data type checking
  - [ ] Integration with storage system for temporary data handling
- **Priority**: High
- **Complexity**: Moderate
- **Dependencies**: Data processing engine, Regex engine, Storage system (R30)
- **Source**: Data processing nodes from ASK-010

**R31.4 Workflow Optimization Node**

Create Optimize node that provides workflow analysis, performance recommendations, and automated optimization capabilities.

- **Description**: Implement intelligent optimization node that analyzes workflow patterns, identifies performance bottlenecks, and provides automated optimization suggestions and transformations
- **Business Value**: Improves workflow performance through intelligent analysis, reduces manual optimization effort, and provides learning opportunities for workflow best practices
- **Acceptance Criteria**:
  - [ ] Workflow analysis engine for performance bottleneck identification
  - [ ] Optimization recommendations with impact assessment
  - [ ] Automated optimization transformations (with user approval)
  - [ ] Performance benchmarking and before/after comparisons
  - [ ] Best practice validation and compliance checking
  - [ ] Resource usage analysis and optimization suggestions
  - [ ] Integration with workflow execution metrics and monitoring
  - [ ] Optimization history and rollback capabilities
  - [ ] Custom optimization rules and user-defined patterns
  - [ ] Reporting and documentation of applied optimizations
- **Priority**: Medium
- **Complexity**: High
- **Dependencies**: Workflow analysis engine, Performance monitoring, Machine learning capabilities
- **Source**: Workflow optimization enhancement from ASK-010

---

## R33. Panel Management System

**R33.1 Panel Visibility Controls**

Implement view/hide toggle functionality for all interface panels to enable customizable workspace organization similar to VSCode's panel management system.

- **Description**: Provide checkbox controls and toggle buttons that allow users to show or hide individual panels (palette, inspector, tabs, canvas) to optimize workspace usage and accommodate different workflow preferences
- **Business Value**: Significantly improves user experience by enabling workspace customization, supports different user workflows and screen sizes, and provides familiar VSCode-like interface patterns that reduce learning curve
- **Acceptance Criteria**:
  - [ ] View/hide toggle buttons available for Component Palette (left panel)
  - [ ] View/hide toggle buttons available for Inspector Panel (right panel)
  - [ ] View/hide toggle buttons available for Tab Management area
  - [ ] Checkbox controls in settings or context menu for panel visibility
  - [ ] Panel visibility state persists across application sessions
  - [ ] Keyboard shortcuts for common panel toggles (e.g., Cmd+B for palette)
  - [ ] Visual indicators show current panel visibility state
  - [ ] Smooth animation transitions when panels show/hide
  - [ ] Canvas automatically resizes when panels are toggled
  - [ ] Minimum panel sizes maintained for usability when shown
- **Priority**: High
- **Complexity**: Moderate
- **Dependencies**: Existing panel architecture (R3.1.1, R3.1.5, R3.1.4), Settings persistence system
- **Source**: ASK-011 - 2025-09-18 - Panel management system request

**R33.2 Panel Drag-and-Drop System**

Enable VSCode-style drag-and-drop functionality for panels with zone snapping and flexible layout configuration.

- **Description**: Implement sophisticated panel repositioning system that allows users to drag panels to different locations within the interface, with intelligent zone detection and snapping similar to VSCode's panel management
- **Business Value**: Provides maximum workspace flexibility, accommodates diverse user preferences and workflows, and delivers professional-grade IDE experience that enhances productivity and user satisfaction
- **Acceptance Criteria**:
  - [ ] Drag handles or areas clearly identified on all panels
  - [ ] Drag preview shows panel outline during drag operations
  - [ ] Drop zones highlighted when dragging panels over valid areas
  - [ ] Support for left, right, top, and bottom panel docking positions
  - [ ] Panel auto-snapping to designated zones with visual feedback
  - [ ] Prevent invalid drop operations with clear visual rejection
  - [ ] Drag operations work with mouse and touch interfaces
  - [ ] Panel size constraints maintained in all valid positions
  - [ ] Collision detection prevents overlapping panels
  - [ ] Undo/redo support for layout changes
- **Priority**: High
- **Complexity**: High
- **Dependencies**: R33.1 (Panel Visibility), Drag-and-drop library, Layout calculation engine
- **Source**: Panel drag-and-drop functionality from ASK-011

**R33.3 Template Zone System**

Provide pre-configured panel layout templates similar to VSCode's workspace layout presets for quick workspace configuration.

- **Description**: Create system of layout templates that instantly arrange panels in common configurations optimized for different workflow types (development, debugging, design, minimal)
- **Business Value**: Accelerates workspace setup for new users, provides optimized layouts for specific tasks, and enables quick switching between different working modes
- **Acceptance Criteria**:
  - [ ] Default layout templates: Standard, Minimal, Debug, Design modes
  - [ ] Template selector accessible via View menu or command palette
  - [ ] One-click application of layout templates
  - [ ] Custom template creation and saving functionality
  - [ ] Template preview thumbnails showing panel arrangements
  - [ ] Template import/export for sharing configurations
  - [ ] Smart template suggestions based on current workflow type
  - [ ] Template restoration after panel customization
  - [ ] Responsive template behavior for different screen sizes
  - [ ] Template compatibility with panel visibility settings
- **Priority**: Medium
- **Complexity**: Moderate
- **Dependencies**: R33.1 (Panel Visibility), R33.2 (Drag-and-Drop), Configuration system
- **Source**: Template zone system from ASK-011

**R33.4 Panel State Persistence and Configuration**

Ensure panel layouts, visibility states, and custom configurations persist across application sessions with robust state management.

- **Description**: Implement comprehensive state management system that preserves all panel customizations, layout preferences, and workspace configurations between application sessions
- **Business Value**: Maintains user productivity by preserving personalized workspace configurations, reduces setup time on application restart, and provides reliable user experience
- **Acceptance Criteria**:
  - [ ] Panel positions and sizes saved automatically on changes
  - [ ] Panel visibility states persist across sessions
  - [ ] Custom layout templates saved with user preferences
  - [ ] Configuration export/import for backup and sharing
  - [ ] Graceful handling of invalid or corrupted layout data
  - [ ] Reset to default layout option always available
  - [ ] Multi-screen layout support and persistence
  - [ ] Configuration versioning for backward compatibility
  - [ ] User profile-specific configurations when applicable
  - [ ] Performance optimization for frequent state updates
- **Priority**: Medium
- **Complexity**: Moderate
- **Dependencies**: R33.1-R33.3 (Panel Management), Configuration system, Local storage
- **Source**: State persistence requirements derived from ASK-011

---

## R32. Success Metrics and KPIs

### R32.1 Business Metrics

- **User Adoption Rate**: Percentage of AI Engineers using visual editor for new workflows (Target: 90% within 6 months)
- **Workflow Development Time**: Average time to create and deploy AI workflows (Target: 70% reduction from baseline)
- **User Satisfaction Score**: Net Promoter Score for visual editor experience (Target: >50)
- **Support Ticket Reduction**: Decrease in workflow-related support requests (Target: 40% reduction)

### R32.2 Technical Metrics

- **System Performance**: Canvas response time for drag/zoom operations (Target: <100ms)
- **Export Performance**: PlantUML generation time for 100-node flows (Target: <2 seconds)
- **Memory Efficiency**: Application memory usage for typical workflows (Target: <200MB)
- **Error Rate**: Frequency of application crashes or data loss (Target: <0.1% of operations)

### R29.3 User Experience Metrics

- **Task Completion Rate**: Percentage of users completing first workflow within 10 minutes (Target: 80%)
- **Feature Discovery**: Average time to discover key features like export and validation (Target: <5 minutes)
- **Accessibility Compliance**: Percentage of WCAG 2.1 AA criteria met (Target: 100%)
- **Mobile Responsiveness**: Usability score on tablet devices (Target: >4.0/5.0)

### R29.4 Quality Metrics

- **Test Coverage**: Code coverage for new visual editor components (Target: >90%)
- **Bug Density**: Defects per thousand lines of code (Target: <2.0)
- **Documentation Coverage**: Percentage of features documented with examples (Target: 100%)
- **API Stability**: Breaking changes in public interfaces (Target: 0 during v1.x lifecycle)

---

## R28. Technical Considerations

### R28.1 Architecture Constraints

- **Frontend Framework**: React 18+ with React Flow library for graph editing capabilities
- **State Management**: Redux Toolkit for complex state management with undo/redo support
- **Build System**: Vite for fast development and optimized production builds
- **Component Library**: Headless UI components for accessibility compliance
- **Styling**: Tailwind CSS for consistent design system implementation

### R14.2 Data Architecture

- **Flow Storage**: JSON files under `.ai-ley/shared/flows/` with atomic save operations
- **Schema Validation**: JSON Schema validation for flow file integrity
- **Version Control**: Git-friendly format with stable node ID generation
- **Backup Strategy**: Automatic local backups with configurable retention
- **Migration Support**: Schema versioning for backward compatibility

### R14.3 Security Architecture

- **Input Validation**: Comprehensive sanitization of node properties and file paths
- **File System Access**: Sandboxed file operations within designated directories
- **Cross-Site Scripting**: Content Security Policy implementation
- **Dependency Security**: Regular vulnerability scanning of npm packages
- **Data Privacy**: No external network requests from visual editor

### R14.4 Performance Architecture

- **Virtualization**: Canvas virtualization for flows with 500+ nodes
- **Lazy Loading**: On-demand loading of node property editors
- **Caching Strategy**: Intelligent caching of parsed flow files and validation results
- **Memory Management**: Automatic cleanup of unused flow data
- **Progressive Enhancement**: Core functionality works without JavaScript

---

## R15. Dependencies and Assumptions

### R15.1 Internal Dependencies

- **Existing .ai-ley Infrastructure**: Visual editor builds upon current file structure
- **CLI Framework**: Integration with existing command-line tools and scripts
- **Global Instructions**: Alignment with Universal Project Coding & Management Guide
- **Persona System**: Integration with existing persona management
- **Instruction Files**: Compatibility with current instruction file format

### R15.2 External Dependencies

- **React Flow Library**: Third-party graph editing component (MIT license)
- **Node.js Runtime**: Version 18+ for development and build processes
- **Modern Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **File System Access**: Local file read/write permissions
- **PlantUML**: Optional integration for enhanced diagram rendering

### R15.3 Technical Dependencies

- **TypeScript**: Version 5.0+ for type safety and developer experience
- **Webpack/Vite**: Modern build toolchain for asset optimization
- **Jest Testing Framework**: Unit and integration testing infrastructure
- **Prettier/ESLint**: Code formatting and quality enforcement
- **GitHub Actions**: CI/CD pipeline for automated testing and deployment

### R15.4 Business Assumptions

- **User Technical Proficiency**: Target users have basic understanding of workflow concepts
- **Development Resources**: 2-3 frontend developers available for 3-month development cycle
- **Stakeholder Availability**: Product owners available for weekly review sessions
- **Browser Environment**: Users primarily work in desktop browser environments
- **Network Connectivity**: Application operates in offline-capable mode

### R15.5 Resource Assumptions

- **Development Timeline**: 12-week development cycle for MVP release
- **Testing Resources**: QA engineer available for 4 weeks of testing
- **Design Support**: UX designer available for 2 weeks of interface design
- **Documentation**: Technical writer available for final 2 weeks
- **Deployment Infrastructure**: Existing CI/CD pipeline can accommodate new build artifacts

---

## R16. Implementation Plan

### R12.1 Development Phases

**Phase 1: Foundation**

1. Scaffold UI components: palette + canvas + inspector + tabs
2. Implement basic drag-drop functionality
3. Define and implement JSON schema with stable ID generation

**Phase 2: Core Features**  
4. Implement node types with default port configurations 5. Add node-specific property editors in inspector panel 6. Enforce wiring rules (types, cardinality, cycle detection)

**Phase 3: Validation and Export** 7. Implement validation engine with linting capabilities 8. Add quick-fix suggestions with visual indicators 9. Implement PlantUML exporter with JSON → .puml mapping

**Phase 4: Polish and Documentation** 10. Add configuration persistence (`uml.exportPath` setting) 11. Create comprehensive test suite and documentation 12. Record demonstration materials and finalize user guide

### R12.2 Quality Gates

Each phase SHALL complete only after passing defined acceptance criteria and code review.

---

## R16. PlantUML Flow Auto-Loading

**R16.1 Automatic Flow Loading**

- **Description**: Automatically load and display existing flows from `.ai-ley/shared/uml-flows/user/*.puml` directory on application startup
- **Acceptance Criteria**:
  - [ ] Application scans `.ai-ley/shared/uml-flows/user/*.puml` on startup
  - [ ] Each .puml file creates a corresponding tab in the visual editor
  - [ ] Flow nodes and connections are accurately reconstructed from PlantUML syntax
  - [ ] File modification timestamps determine tab loading order
  - [ ] Loading errors are gracefully handled with user notification
- **Priority**: High
- **Complexity**: High
- **Dependencies**: R7.1.1 (PlantUML Export), file system access permissions, PlantUML parser library
- **Source**: ASK-001 - 2025-09-11 - Auto-load flows from PlantUML files

## R17. PlantUML Auto-Save Integration

**R17.1 Automatic Flow Persistence**

- **Description**: Automatically save new flows to `.ai-ley/shared/uml-flows/user/` directory as PlantUML files upon creation or modification
- **Acceptance Criteria**:
  - [ ] New flows trigger automatic .puml file creation in configured directory
  - [ ] Flow modifications update corresponding .puml files within 2 seconds
  - [ ] File naming follows pattern: `<flow-name>.puml` with conflict resolution
  - [ ] Auto-save operations don't interrupt user workflow
  - [ ] Save status indicators provide user feedback
- **Priority**: High
- **Complexity**: Moderate
- **Dependencies**: R3.2.2 (PlantUML Export), R2.6 (Configurable Export Path)
- **Source**: ASK-001 - 2025-09-11 - Auto-save flows as PlantUML files

## R18. Node Visual Styling Enhancement

**R18.1 Node Text Styling**

- **Description**: Set all font colors within node boxes to white for improved contrast and visual consistency
- **Acceptance Criteria**:
  - [ ] All node text displays in white font color (#FFFFFF)
  - [ ] Text remains readable against all node background colors
  - [ ] Styling applies consistently across all 7 node types
  - [ ] High contrast ratios meet WCAG 2.1 AA accessibility standards (4.5:1 minimum)
  - [ ] Font weight and size maintain readability
- **Priority**: Medium
- **Complexity**: Simple
- **Dependencies**: R4.1.1-R4.7.2 (Node Type Specifications), CSS styling system
- **Source**: ASK-001 - 2025-09-11 - White font styling for nodes

## R19. Enhanced Connection Point Configuration

**R19.1 Flexible Connection Points**

- **Description**: Configure connection points so input flows can originate from top or left of node boxes, and output flows can exit from bottom or right
- **Acceptance Criteria**:
  - [ ] Input ports accept connections from top edge or left edge of nodes
  - [ ] Output ports allow connections from bottom edge or right edge of nodes
  - [ ] Connection routing automatically selects optimal path based on node positions
  - [ ] Visual feedback shows available connection points during wiring operations
  - [ ] Connection point selection is context-aware based on flow direction
- **Priority**: Medium
- **Complexity**: Moderate
- **Dependencies**: R3.1.3 (Connection System), React Flow library capabilities
- **Source**: ASK-001 - 2025-09-11 - Flexible connection point positioning

## R20. AI Persona Node Property Validation Fix

**R20.1 Persona Validation Resolution**

- **Description**: Resolve missing required property validation errors for AI Persona nodes
- **Acceptance Criteria**:
  - [ ] AI Persona nodes validate successfully when all required properties are provided
  - [ ] Clear error messages identify specific missing properties with field names
  - [ ] Property requirements align with persona file specifications in `.ai-ley/shared/personas/`
  - [ ] Validation occurs in real-time during property editing
  - [ ] Validation rules are consistent with R4.6.1 persona node specifications
- **Priority**: High
- **Complexity**: Simple
- **Dependencies**: R4.6.1 (Persona Node Properties), R3.3.2 (Flow Linting)
- **Source**: ASK-001 - 2025-09-11 - Fix persona node validation errors

## R21. Persona File Integration

**R21.1 Dynamic Persona Selection**

- **Description**: Provide dropdown list populated with available personas from `.ai-ley/shared/personas/*` directory
- **Acceptance Criteria**:
  - [ ] Persona property editor displays dropdown with all available persona files
  - [ ] Dropdown options show persona names, descriptions, and file paths
  - [ ] File selection automatically populates persona path property
  - [ ] Dropdown refreshes when persona files are added/removed from directory
  - [ ] Search/filter functionality available for large persona collections
  - [ ] Error handling for missing or corrupted persona files
- **Priority**: High
- **Complexity**: Moderate
- **Dependencies**: R4.6.1 (Persona Node Properties), file system scanning capabilities, file watcher integration
- **Source**: ASK-001 - 2025-09-11 - Persona dropdown integration

## R22. Instructions File Integration

**R22.1 Dynamic Instructions Selection**

- **Description**: Provide dropdown list populated with available instructions from `.ai-ley/shared/instructions/*` directory
- **Acceptance Criteria**:
  - [ ] Instruction property editor displays dropdown with all available instruction files
  - [ ] Dropdown options show instruction titles, categories, and file paths
  - [ ] File selection automatically populates instruction path property
  - [ ] Dropdown supports search/filter functionality for large instruction sets
  - [ ] Hierarchical display for nested instruction directories
  - [ ] Real-time updates when instruction files are modified
- **Priority**: High
- **Complexity**: Moderate
- **Dependencies**: R4.7.1 (Instruction Node Properties), file system scanning capabilities, file watcher integration
- **Source**: ASK-001 - 2025-09-11 - Instructions dropdown integration

---

## R13. Project Assumptions

### R13.1 Technology Stack

- React framework is available for UI development
- Node.js/TypeScript environment available for CLI implementation
- File system write permissions granted under `.ai-ley/shared/**`
- PlantUML parser library available for bidirectional flow conversion

### R13.2 Scope Limitations

- PlantUML PNG/SVG rendering is out-of-scope for this implementation
- Integration with external PlantUML renderers is handled by consuming applications
- Multi-user collaboration features are not included in this release
- Advanced PlantUML syntax features may not be fully supported in initial release

---

## R34. Persistent Tab Dropdown Menu Visibility

**R34.1 Always-Visible Tab Actions**

- **Description**: Modify WorkflowTabs component to display tab dropdown menu (three vertical dots) permanently instead of only on hover, improving feature discoverability and user experience
- **Acceptance Criteria**:
  - [ ] Three vertical dots (MoreVertical icon) are always visible on all tabs
  - [ ] Dropdown functionality remains unchanged (click to open menu)
  - [ ] Visual styling maintains professional appearance and consistency
  - [ ] Keyboard navigation and accessibility standards are preserved (WCAG 2.1 AA)
  - [ ] No performance impact from CSS styling changes
  - [ ] Consistent behavior across all supported browsers
- **Priority**: Medium
- **Complexity**: Simple
- **Dependencies**: None
- **Source**: ASK-001 - 2025-01-21 - Tab UX improvement for dropdown visibility

---

## R35. Secure Path Construction and Scoping

**R35.1 Path Separator and Security Validation**

- **Description**: Implement secure path construction that ensures proper path separators and restricts all paths to be scoped below the detected project root, preventing path traversal vulnerabilities and ensuring system integrity
- **Acceptance Criteria**:
  - [ ] `getAiLeyRoot()` function properly joins paths with correct separators using `joinPath()` utility
  - [ ] All paths are constrained to be within or below the detected project root directory
  - [ ] No relative path traversals (../, ../../) are used in path construction functions
  - [ ] Path joining utility handles edge cases (trailing/leading slashes, empty parts, cross-platform compatibility)
  - [ ] Storage folder paths are validated to be within project scope in settings service
  - [ ] Fallback paths maintain security constraints and log appropriate warnings
  - [ ] Cross-platform path handling (Windows/Unix) works correctly with normalized separators
- **Priority**: High
- **Complexity**: Moderate
- **Dependencies**: None
- **Source**: ASK-002 - 2025-09-19 - Path construction security and proper separator issue


---

## R36. Model-Driven AI Agent Instruction System

**R36.1 Model-Driven Architecture Implementation**

- **Description**: Transform the visual editor from drag-and-drop visual nodes to a model-driven approach using markdown-based templates for nodes and flows, with compilation to PlantUML and AI system execution integration
- **Business Value**: Revolutionizes AI agent instruction workflow by providing template-driven development, automated code generation, and seamless AI system integration while maintaining visual representation through PlantUML compilation
- **Acceptance Criteria**:
  - [ ] Create folder structure under `.ai-ley/models/` with `nodes/` and `flows/` subdirectories
  - [ ] Implement node model schema with required fields: id, type, name, description, properties, inputs, outputs
  - [ ] Implement flow model schema with required fields: id, name, description, nodes, connections, metadata
  - [ ] Create template generators for all 7 node types (CommandPromptFile, LogicCondition, OutputType, Loop, CustomPromptText, Persona, Instruction)
  - [ ] Implement form-based editors for creating and editing node and flow models from templates
  - [ ] Build compilation system that converts models to PlantUML syntax with proper node and connection representation
  - [ ] Add "Execute" dropdown with AI system integration options and /run-flow command support
  - [ ] Create model validation engine ensuring required fields, type safety, and referential integrity
  - [ ] Implement dependency management system for inter-model references
  - [ ] Add version control support with semantic versioning for models
  - [ ] Create migration path from current visual editor to model-driven approach
  - [ ] Implement performance optimization for large model sets (100+ nodes/flows)
- **Priority**: High
- **Complexity**: Expert
- **Dependencies**: File system architecture, PlantUML compilation engine, AI system integration, Form validation framework
- **Source**: ASK-003 - 2025-01-21 - Model-driven AI agent instruction system transformation request

---

## R37. Auto-Arrangement of Visual Dialog Boxes

**R37.1 Intelligent Node Layout Engine**

- **Description**: Implement automatic arrangement of visual dialog boxes (nodes) based on connection points and graph structure to optimize workflow readability and minimize manual layout work
- **Business Value**: Significantly reduces time spent on manual node positioning, improves workflow visualization quality, and enhances user productivity through intelligent auto-layout algorithms
- **Acceptance Criteria**:
  - [ ] Implement hierarchical layout algorithm that positions nodes based on connection flow (top-to-bottom, left-to-right)
  - [ ] Add force-directed layout algorithm for complex interconnected nodes with optimal spacing
  - [ ] Create grid-based alignment system ensuring minimum 10px spacing between all adjacent nodes
  - [ ] Implement automatic collision detection and resolution for overlapping nodes
  - [ ] Add layout optimization for different workflow patterns (linear, branching, circular, parallel)
  - [ ] Create user preference system for layout style selection (hierarchical, force-directed, grid, manual)
  - [ ] Implement undo/redo functionality for auto-arrangement operations
  - [ ] Add layout performance optimization for large workflows (100+ nodes)
  - [ ] Create layout preview system showing arrangement changes before application
  - [ ] Implement incremental layout updates when nodes are added/removed/modified
  - [ ] Add export/import functionality for saved layout templates
  - [ ] Create accessibility support for auto-arranged layouts (screen reader compatibility)
- **Priority**: High
- **Complexity**: High
- **Dependencies**: React Flow layout extensions, Graph layout algorithms, Node positioning system
- **Source**: ASK-005 - 2025-09-17 - Auto-arrangement of visual dialog boxes

**R37.2 Layout Control Interface**

- **Description**: Provide user interface controls for triggering auto-arrangement, configuring layout preferences, and managing layout templates
- **Business Value**: Gives users control over automatic layout behavior while providing easy access to arrangement functions
- **Acceptance Criteria**:
  - [ ] Add "Auto Arrange" button to canvas toolbar with dropdown for layout algorithm selection
  - [ ] Create layout preferences panel in settings with algorithm-specific configuration options
  - [ ] Implement layout template manager for saving and applying custom arrangements
  - [ ] Add keyboard shortcuts for common layout operations (Ctrl+Shift+A for auto-arrange)
  - [ ] Create layout status indicator showing current arrangement state
  - [ ] Implement batch operations for selecting and arranging subsets of nodes
  - [ ] Add context menu options for node-specific layout operations
  - [ ] Create layout animation system with smooth transitions between arrangements
- **Priority**: Medium
- **Complexity**: Medium
- **Dependencies**: R37.1 (Layout Engine), UI component framework, Animation library
- **Source**: ASK-005 - 2025-09-17 - Auto-arrangement user interface requirements

