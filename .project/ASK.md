# Project Ask Items

_Last Updated: 2025-09-17_

## Active Ask Items

### High Priority - Immediate Attention Required

#### ASK-005: Auto-Arrangement of Visual Dialog Boxes

- **Date**: 2025-09-17
- **Requestor**: User
- **Description**: the visual dialog boxes should be able to be auto arranged based on the connection points
- **Business Impact**: Essential UX improvement that will significantly reduce manual layout work and improve workflow readability through intelligent automatic positioning
- **Status**: New - ready for requirements integration
- **Integration Status**:
  - [ ] Requirements analysis needed for auto-layout algorithms
  - [ ] Technical research required for React Flow layout integration
  - [ ] UI/UX design needed for layout controls and options
  - [ ] Performance considerations for large workflow graphs
  - [ ] User preference handling for manual vs automatic positioning

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
- **Description**: flows should be automatically loaded into the interface from .ai-ley/shared/uml-flows/user/*.puml, when new flows are created they are automatically created in .ai-ley/shared/uml-flows/user/ as a puml file. set all the fonts within the node boxes as white. in flows can come from the top of the box or left of the box. out flows can come from the bottom or right of the box. AI persona nodes are coming up with required property is missing. AI personas should provide a dropdown list of personas available in .ai-ley/shared/personas/*. Instructions should provide a dropdown list of instructions available in .ai-ley/shared/instructions/*.
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