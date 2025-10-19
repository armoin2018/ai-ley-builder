# Project Ask Items

_Last Updated: 2025-09-18_

## Active Ask Items

### High Priority - Immediate Attention Required

#### ASK-011: Panel Management System

- **Date**: 2025-09-18
- **Requestor**: User
- **Description**: Panel Management - View / hide toggles on panels, add show-hide checkboxes. Allow drag and drop of the panels like VSCode to snap into zones, have template zones like VSCode
- **Business Impact**: Critical UX enhancement that provides VSCode-like workspace customization, dramatically improving user experience and workflow efficiency through flexible panel management and layout optimization
- **Status**: Complete - integrated into requirements
- **Integration Status**:
  - [x] Added to requirements as R33 (Panel Management System)
  - [x] Requirements analysis completed for four panel management components
  - [x] Sub-requirements defined for visibility controls, drag-and-drop, template zones, and state persistence
  - [ ] Technical implementation needed for panel layout engine and drag-and-drop library integration
  - [ ] UI component development for toggle controls and zone indicators
  - [ ] Layout template system design and configuration management
  - [ ] Testing required for cross-browser drag-and-drop and state persistence

#### ASK-010: Core Workflow Node Types Extension

- **Date**: 2025-09-18
- **Requestor**: User
- **Description**: Create six essential node types: Log Node, Debug Node, Parallel Executor, Split based on regex pattern, Join, and Optimize nodes
- **Business Impact**: Fundamental expansion of workflow capabilities enabling debugging, logging, parallel processing, data manipulation, and optimization - essential building blocks for professional workflow development
- **Status**: Complete - integrated into requirements
- **Integration Status**:
  - [x] Added to requirements as R31 (Core Workflow Node Types Extension)
  - [x] Requirements analysis completed for six node type categories
  - [x] Sub-requirements defined for debug/logging, parallel processing, data processing, and optimization nodes
  - [ ] Technical implementation needed for node type architecture and execution logic
  - [ ] UI component development for node property panels and configuration
  - [ ] Integration with workflow execution engine and performance monitoring
  - [ ] Testing required for node functionality and performance impact

#### ASK-009: Scoped Storage System

- **Date**: 2025-09-18
- **Requestor**: User
- **Description**: Add support for scoped storage: node, flow, global - structure access to the storage similar to node-red - create a storage structure under .ai-ley/state - create nodes to get/set the stored memory
- **Business Impact**: Critical workflow capability enhancement that enables stateful operations, complex data sharing patterns, and advanced workflow modularity similar to Node-RED's proven context system
- **Status**: Complete - integrated into requirements
- **Integration Status**:
  - [x] Added to requirements as R30 (Scoped Storage System)
  - [x] Requirements analysis completed for three-tier storage architecture
  - [x] Sub-requirements defined for storage architecture, node types, and management
  - [ ] Technical implementation needed for storage scoping and persistence
  - [ ] Node type development for storage get/set operations
  - [ ] Storage management interface and monitoring system
  - [ ] Testing required for storage lifecycle and data integrity

#### ASK-008: Codex CLI Integration Support

- **Date**: 2025-09-18
- **Requestor**: User
- **Description**: Add support for Codex CLI to enable advanced code generation, analysis, and refactoring capabilities within the visual flow editor
- **Business Impact**: Significant developer productivity enhancement through AI-powered code assistance, expands platform capabilities with specialized code-focused AI, and strengthens competitive position in AI development tools market
- **Status**: Complete - integrated into requirements
- **Integration Status**:
  - [x] Added to requirements as R29 (Codex CLI Integration Support)
  - [x] Requirements analysis completed for Codex CLI integration
  - [x] Sub-requirements defined for tool integration, workflow support, and multi-AI comparison
  - [ ] Technical implementation needed for CLI wrapper and node types
  - [ ] UI integration required for settings and command palette
  - [ ] Authentication and rate limiting implementation
  - [ ] Testing required for code generation workflows

#### ASK-007: GitHub Node Repository Import System

- **Date**: 2025-09-18
- **Requestor**: User
- **Description**: The ability to import nodes from a github repo, repo should be defined in the settings
- **Business Impact**: Critical extensibility feature that enables community-driven node ecosystem, accelerates workflow development through reusable components, and provides platform for innovation
- **Status**: Complete - integrated into requirements
- **Integration Status**:
  - [x] Added to requirements as R28 (GitHub Node Repository Import System)
  - [x] Requirements analysis completed for GitHub API integration
  - [x] Settings system enhancement design completed
  - [x] Node validation and security framework designed
  - [x] Import mechanism and node registration system planned
  - [x] Version control and dependency management specified
  - [ ] Technical implementation needed for GitHub API integration
  - [ ] Settings UI updates required for repository configuration
  - [ ] Node security validation implementation

#### ASK-006: TinyMCE to Trumbowyg Editor Migration

- **Date**: 2025-09-18
- **Requestor**: User
- **Description**: Update the TinyMCE editor to Trumbowyg for better performance, smaller bundle size, and improved user experience
- **Business Impact**: Significant performance improvement (~25x smaller bundle), better mobile responsiveness, improved accessibility, and enhanced developer experience
- **Status**: New - ready for requirements integration
- **Integration Status**:
  - [x] Added to requirements as R27 (Trumbowyg Rich Text Editor Integration)
  - [ ] Technical implementation needed for component migration
  - [ ] Dependency updates required in package.json
  - [ ] Settings component references need updating
  - [ ] Testing required for functionality preservation

#### ASK-005: Auto-Arrangement of Visual Dialog Boxes - INTEGRATED ✅

- **Date**: 2025-09-17
- **Requestor**: User
- **Description**: the visual dialog boxes should be able to be auto arranged based on the connection points
- **Business Impact**: Essential UX improvement that will significantly reduce manual layout work and improve workflow readability through intelligent automatic positioning
- **Status**: Complete - integrated into requirements
- **Integration Status**:
  - [x] Added to requirements as R37 (Auto-Arrangement of Visual Dialog Boxes)
  - [x] Requirements analysis completed for intelligent node layout engine
  - [x] Sub-requirements defined for layout algorithms, control interface, and user preferences
  - [ ] Technical implementation needed for React Flow layout extensions and graph algorithms
  - [ ] UI component development for auto-arrange controls and layout preferences
  - [ ] Performance optimization implementation for large workflow handling
  - [ ] Testing required for layout algorithm accuracy and performance

#### ASK-004: AI Integration Node Modules - INTEGRATED ✅

- **Date**: 2025-09-17
- **Requestor**: User
- **Description**: create node modules for calling AI CLI tools that includes a selection of the configured AI CLI tools. create a node module for calling AI APIs that include a selection of the configured AI APIs.
- **Business Impact**: Essential functionality that enables users to execute AI tools and API endpoints directly from the visual editor, bridging the settings configuration with actual execution capabilities
- **Status**: COMPLETE - All components integrated into application
- **Integration Status**:
  - [x] Added to requirements as R23 (AI CLI Integration Service)
  - [x] Added to requirements as R24 (AI API Integration Service)
  - [x] Added to requirements as R25 (AI Tool Selection Components)
  - [x] Created AICliService for local AI tool execution
  - [x] Created AIApiService for REST API communication
  - [x] Built AICliToolSelector UI component
  - [x] Built AIApiSelector UI component
  - [x] Created AIDemo for testing and demonstration
  - [x] Integrated with command palette (⌘⇧A)
  - [x] Connected to existing settings system

#### ASK-001: Visual Flow Editor Enhancement Suite - INTEGRATED ✅

- **Date**: 2025-09-11
- **Requestor**: User
- **Description**: flows should be automatically loaded into the interface from .ai-ley/shared/uml-flows/user/_.puml, when new flows are created they are automatically created in .ai-ley/shared/uml-flows/user/ as a puml file. set all the fonts within the node boxes as white. in flows can come from the top of the box or left of the box. out flows can come from the bottom or right of the box. AI persona nodes are coming up with required property is missing. AI personas should provide a dropdown list of personas available in .ai-ley/shared/personas/_. Instructions should provide a dropdown list of instructions available in .ai-ley/shared/instructions/\*.
- **Business Impact**: Critical workflow improvements that will enhance user experience and resolve blocking validation issues
- **Status**: COMPLETE - All items integrated into requirements
- **Integration Status**:
  - [x] Added to requirements as R16 (PlantUML Auto-Loading)
  - [x] Added to requirements as R17 (PlantUML Auto-Save)
  - [x] Added to requirements as R18 (Node Visual Styling)
  - [x] Added to requirements as R19 (Enhanced Connection Points)
  - [x] Added to requirements as R20 (AI Persona Validation Fix)
  - [x] Added to requirements as R21 (Persona File Integration)
  - [x] Added to requirements as R22 (Instructions File Integration)
  - [x] Requirements documentation updated
  - [x] Changelog created with version 2025.09.11-00001

### Medium Priority - Enhancement Suggestions

#### ASK-002: Advanced Flow Templates

- **Date**: 2025-09-11
- **Description**: Pre-built flow templates for common AI-Ley patterns to accelerate workflow creation
- **Potential Value**: Reduced learning curve and faster workflow development for new users
- **Status**: Added to suggestions as SUG-001
- **Complexity Assessment**: Medium - requires template design and integration
- **Dependencies**: Core visual editor functionality (R16-R22)

### Future Consideration - Backlog

#### ASK-003: Real-time Flow Validation

- **Date**: 2025-09-11
- **Description**: Advanced real-time validation of flow logic and connections beyond current linting
- **Deferral Reason**: Current validation engine sufficient for MVP; advanced validation is enhancement
- **Future Context**: Could become relevant for enterprise workflows with complex logic

## Processed Ask Items (Reference)

### Recently Integrated

#### ASK-004: AI Integration Node Modules - INTEGRATED

- **Integration Date**: 2025-09-17
- **Requirements Created**: R23, R24, R25
- **Status**: Complete - integrated into requirements and implemented

#### ASK-001: Visual Flow Editor Enhancement Suite - INTEGRATED

- **Integration Date**: 2025-09-11
- **Requirements Created**: R16, R17, R18, R19, R20, R21, R22
- **Status**: Complete - integrated into requirements

### Historical Items

#### Legacy Items from 2025-09-09 - INTEGRATED

- **Integration Date**: 2025-09-09
- **Requirements Created**: R1-R15, US1-US7
- **Status**: Complete - comprehensive requirements framework established
