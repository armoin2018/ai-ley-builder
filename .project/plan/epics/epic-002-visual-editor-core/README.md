# Epic 002: Visual Editor Core

## Overview

**Epic ID**: EPIC-002  
**Priority**: High  
**Status**: Not Started  
**Estimated Effort**: 42 Story Points  
**Sprint Assignment**: Sprint 3-6  
**Dependencies**: Epic 001 (Foundation Infrastructure)

## Business Value

**Objective**: Implement the core visual editing interface enabling users to drag AI workflow nodes onto a canvas, connect them with visual edges, and edit properties through an inspector panel, transforming the user experience from text-based to visual workflow design.

**Success Metrics**:

- 90% of users can create their first workflow within 10 minutes
- 95% user task completion rate for basic node placement and connection
- 70% reduction in workflow creation time compared to text-based approach
- Zero visual glitches or performance issues with flows up to 100 nodes

**Acceptance Criteria**:

- [ ] React Flow canvas renders with smooth pan, zoom, and selection capabilities
- [ ] Component palette supports drag-and-drop for all 7 AI-specific node types
- [ ] Inspector panel provides context-sensitive property editing with live validation
- [ ] Multi-tab interface enables concurrent editing of multiple workflows
- [ ] Visual feedback system guides users through connection and editing operations
- [ ] Keyboard accessibility enables complete workflow creation without mouse
- [ ] Node styling uses white fonts for optimal contrast and accessibility (R18)
- [ ] Connection points support flexible positioning (top/left inputs, bottom/right outputs) (R19)
- [ ] AI Persona nodes validate successfully with clear error messaging (R20)
- [ ] Persona dropdown populated dynamically from `.ai-ley/shared/personas/*` directory (R21)
- [ ] Instructions dropdown populated dynamically from `.ai-ley/shared/instructions/*` directory (R22)

**ROI Impact**: $180,000 in user productivity improvements through visual workflow creation

## Technical Context

**Architecture Impact**:

- React Flow integration as core canvas rendering engine
- Redux state management for complex flow state and undo/redo operations
- Component-based architecture for reusable UI elements across palette, canvas, and inspector
- Event-driven architecture for drag-and-drop operations and real-time validation

**Technology Stack**:

- **Graph Engine**: React Flow 11.x for node-based canvas interface
- **State Management**: Redux Toolkit with normalized state structure for flows, nodes, and edges
- **Drag & Drop**: React DnD for palette-to-canvas interactions with visual feedback
- **Form System**: React Hook Form with Zod validation for inspector property editing
- **Styling**: Tailwind CSS with custom components for consistent design language

**Integration Points**:

- File system integration for flow persistence in `.ai-ley/shared/flows/` directory
- Node type system aligned with existing .ai-ley persona and instruction files
- Property validation using existing .ai-ley schemas and validation patterns
- Canvas state synchronization with browser localStorage for session persistence
- Dynamic file system scanning for persona and instruction dropdown population (R21, R22)
- Real-time file watcher integration for live updates when personas/instructions change
- Enhanced connection routing system for flexible input/output positioning (R19)

**Performance Requirements**:

- Canvas operations (drag, zoom, pan): <100ms response time
- Node creation and property updates: <50ms
- Flow rendering with 100 nodes: <2 seconds initial load
- Memory usage: <150MB for typical workflows (50 nodes)

## Stories

- [ ] [Story 1: Canvas Implementation](story-001-canvas/README.md) - 8 SP
- [ ] [Story 2: Component Palette](story-002-palette/README.md) - 8 SP
- [ ] [Story 3: Inspector Panel](story-003-inspector/README.md) - 10 SP
- [ ] [Story 4: Tab Management](story-004-tabs/README.md) - 8 SP
- [ ] [Story 5: Node Styling & Connection Enhancement](story-005-styling/README.md) - 8 SP

## Risk Assessment

**Technical Risks**:

- **React Flow Performance** (Medium Impact, Medium Probability)

  - _Risk_: Canvas performance degradation with complex flows and multiple connections
  - _Mitigation_: Early performance testing, canvas virtualization implementation, efficient re-rendering strategies
  - _Contingency_: Custom canvas implementation or alternative graph libraries (vis.js, D3.js)

- **State Management Complexity** (High Impact, Low Probability)
  - _Risk_: Redux state becoming unwieldy with complex flow operations and undo/redo requirements
  - _Mitigation_: Normalized state structure, comprehensive state design, modular reducer organization
  - _Contingency_: Migration to Zustand or custom state management solution

**User Experience Risks**:

- **Learning Curve Steeper Than Expected** (Medium Impact, Medium Probability)
  - _Risk_: Users struggle with visual interface despite improvement over text-based system
  - _Mitigation_: Extensive user testing, onboarding flow, contextual help system
  - _Contingency_: Hybrid interface supporting both visual and text-based editing modes

**Integration Risks**:

- **Existing System Compatibility** (High Impact, Low Probability)
  - _Risk_: Visual editor conflicts with existing .ai-ley file structures or workflows
  - _Mitigation_: Comprehensive integration testing, backward compatibility validation
  - _Contingency_: Isolation layer preventing interference with existing functionality

## Model Selection Guidance

**Recommended Models by Task Type**:

**UI/UX Implementation Tasks**:

- **Model**: Claude-3-Sonnet (High/Creative personas)
- **Use Case**: React component design, user interface implementation, visual design systems
- **Personas**: `react-developer.md`, `ui-ux-designer.md`, `frontend-engineer.md`

**Complex State Management**:

- **Model**: GPT-4 (Expert/Technical personas)
- **Use Case**: Redux architecture, state normalization, performance optimization
- **Personas**: `senior-fullstack-developer.md`, `javascript-developer.md`

**Canvas and Graph Operations**:

- **Model**: Claude-3-Sonnet (High/Technical personas)
- **Use Case**: React Flow integration, drag-and-drop implementation, canvas optimization
- **Personas**: `react-developer.md`, `javascript-developer.md`

**User Experience Testing**:

- **Model**: GPT-3.5-Turbo (Moderate/Analytical personas)
- **Use Case**: User testing scenarios, accessibility validation, usability analysis
- **Personas**: `qa-engineer.md`, `ui-ux-designer.md`

## Epic Success Criteria

**Core Functionality**:

- [ ] Users can drag all 7 node types from palette to canvas with visual feedback
- [ ] Canvas supports standard interactions: pan, zoom, select, multi-select
- [ ] Inspector panel updates dynamically when nodes are selected with live validation
- [ ] Tab interface enables switching between multiple flows with unsaved change indicators
- [ ] Keyboard navigation enables complete workflow creation for accessibility compliance

**Performance Benchmarks**:

- [ ] Canvas renders 100-node flow in under 2 seconds
- [ ] Drag operations maintain 60fps frame rate during interaction
- [ ] Memory usage remains under 150MB for typical workflows
- [ ] UI responsiveness maintained during complex operations

**User Experience Quality**:

- [ ] First-time users can create basic 3-node workflow within 5 minutes
- [ ] Error states provide clear guidance with actionable next steps
- [ ] Visual design maintains consistency with modern UI/UX standards
- [ ] Accessibility testing passes WCAG 2.1 AA requirements for interactive elements

## Integration Dependencies

**Frontend Dependencies**:

- Epic 001 completion with React TypeScript foundation
- React Flow 11.x library integration and configuration
- Redux Toolkit setup with persistence layer
- Tailwind CSS design system implementation

**File System Integration**:

- `.ai-ley/shared/flows/` directory structure establishment
- JSON schema definition for flow persistence format
- Integration with existing .ai-ley configuration system
- Browser localStorage for session and preference persistence

**Future Epic Enablement**:

- Canvas state structure enables connection validation system (Epic 003)
- Node property system supports business rule implementation (Epic 003)
- Flow serialization foundation enables PlantUML export (Epic 004)
- Component architecture supports testing and accessibility features (Epic 005)

---

**Epic Owner**: Senior Frontend Developer  
**Created**: September 10, 2025  
**Last Updated**: September 10, 2025  
**Target Completion**: February 12, 2026
