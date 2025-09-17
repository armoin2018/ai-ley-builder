
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
      "position": {"x": 0, "y": 0},
      "props": {},
      "ports": {
        "in": [{"id":"pin","label":"in","type":"any"}],
        "out": [{"id":"pout","label":"out","type":"any"}]
      },
      "meta": {"icon":"string","color":"#hex"}
    }
  ],
  "edges": [
    {
      "id": "edge-uuid",
      "from": {"nodeId":"node-uuid","portId":"pout"},
      "to": {"nodeId":"node-uuid","portId":"pin"},
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

## R13. Success Metrics and KPIs

### R13.1 Business Metrics
- **User Adoption Rate**: Percentage of AI Engineers using visual editor for new workflows (Target: 90% within 6 months)
- **Workflow Development Time**: Average time to create and deploy AI workflows (Target: 70% reduction from baseline)
- **User Satisfaction Score**: Net Promoter Score for visual editor experience (Target: >50)
- **Support Ticket Reduction**: Decrease in workflow-related support requests (Target: 40% reduction)

### R13.2 Technical Metrics
- **System Performance**: Canvas response time for drag/zoom operations (Target: <100ms)
- **Export Performance**: PlantUML generation time for 100-node flows (Target: <2 seconds)
- **Memory Efficiency**: Application memory usage for typical workflows (Target: <200MB)
- **Error Rate**: Frequency of application crashes or data loss (Target: <0.1% of operations)

### R13.3 User Experience Metrics
- **Task Completion Rate**: Percentage of users completing first workflow within 10 minutes (Target: 80%)
- **Feature Discovery**: Average time to discover key features like export and validation (Target: <5 minutes)
- **Accessibility Compliance**: Percentage of WCAG 2.1 AA criteria met (Target: 100%)
- **Mobile Responsiveness**: Usability score on tablet devices (Target: >4.0/5.0)

### R13.4 Quality Metrics
- **Test Coverage**: Code coverage for new visual editor components (Target: >90%)
- **Bug Density**: Defects per thousand lines of code (Target: <2.0)
- **Documentation Coverage**: Percentage of features documented with examples (Target: 100%)
- **API Stability**: Breaking changes in public interfaces (Target: 0 during v1.x lifecycle)

---

## R14. Technical Considerations

### R14.1 Architecture Constraints
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
4. Implement node types with default port configurations
5. Add node-specific property editors in inspector panel
6. Enforce wiring rules (types, cardinality, cycle detection)

**Phase 3: Validation and Export**
7. Implement validation engine with linting capabilities
8. Add quick-fix suggestions with visual indicators
9. Implement PlantUML exporter with JSON → .puml mapping

**Phase 4: Polish and Documentation**
10. Add configuration persistence (`uml.exportPath` setting)
11. Create comprehensive test suite and documentation
12. Record demonstration materials and finalize user guide

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
