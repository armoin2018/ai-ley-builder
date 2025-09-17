# Story 005: Node Styling & Connection Enhancement

## Overview

**Story ID**: STORY-005  
**Epic**: Epic 002 (Visual Editor Core)  
**Priority**: Medium  
**Status**: Not Started  
**Effort**: 8 SP  
**Sprint**: Sprint 6  
**Assignee**: React Developer

## User Story

**As a** workflow designer  
**I want** enhanced node styling and flexible connection points  
**So that** I can create visually appealing and organized workflows with optimal readability and connection flexibility

## Acceptance Criteria

- [ ] All node text displays in white font color (#FFFFFF) for optimal contrast (R18.1)
- [ ] Text remains readable against all node background colors with WCAG 2.1 AA compliance
- [ ] Connection points accept inputs from top/left edges and outputs from bottom/right edges (R19.1) 
- [ ] Connection routing automatically selects optimal path based on node positions
- [ ] Visual feedback shows available connection points during wiring operations
- [ ] AI Persona nodes validate successfully without missing property errors (R20.1)
- [ ] Persona dropdown dynamically populated from `.ai-ley/shared/personas/*` directory (R21.1)
- [ ] Instructions dropdown dynamically populated from `.ai-ley/shared/instructions/*` directory (R22.1)
- [ ] Dropdowns support search/filter functionality for large file collections
- [ ] Real-time updates when persona/instruction files are added/modified/removed

## Technical Details

**Personas**: `react-developer.md`, `css-developer.md`, `frontend-engineer.md`  
**Instructions**: `react-component-styling.md`, `file-system-integration.md`  
**Context**: `src/components/`, `src/styles/`, `src/utils/`  
**Complexity**: High  
**Style**: Technical

## Tasks

- [ ] [Task 1: Node Font Styling Implementation](task-001-node-fonts.md)
- [ ] [Task 2: Enhanced Connection Points](task-002-connection-points.md)
- [ ] [Task 3: Persona Validation Fix](task-003-persona-validation.md)
- [ ] [Task 4: Dynamic Persona Dropdown](task-004-persona-dropdown.md)
- [ ] [Task 5: Dynamic Instructions Dropdown](task-005-instructions-dropdown.md)
- [ ] [Task 6: File Watcher Integration](task-006-file-watcher.md)

## Dependencies

**Prerequisite Stories**: Story 001 (Canvas), Story 003 (Inspector Panel)  
**Blocking Stories**: None  
**External Dependencies**: File system access permissions, file watcher APIs

## Definition of Done

- [ ] All tasks completed with acceptance criteria met
- [ ] Code review completed by senior developer
- [ ] Unit tests written for all new components and utilities
- [ ] Integration tests verify file system scanning and dropdown population
- [ ] Accessibility testing confirms WCAG 2.1 AA compliance for contrast ratios
- [ ] Performance testing validates <100ms response for dropdown operations
- [ ] Manual testing confirms all styling and connection enhancements work as expected
- [ ] Documentation updated for new styling conventions and connection behavior

## Technical Implementation Notes

### Node Styling (R18)
- CSS custom properties for consistent white text styling
- CSS-in-JS theme system integration with Tailwind CSS
- Contrast ratio validation against all node background colors

### Connection Points (R19) 
- React Flow handle positioning configuration
- Custom connection routing algorithms for optimal path selection
- Visual feedback system for available connection points during drag operations

### File System Integration (R21, R22)
- Node.js fs module integration for directory scanning
- File watcher implementation using chokidar library
- Caching strategy for dropdown options to optimize performance
- Error handling for missing or corrupted files

### Validation Enhancement (R20)
- Enhanced Zod schema validation for AI Persona node properties
- Clear error messaging with field-level validation feedback
- Real-time validation during property editing

## Risk Mitigation

**File System Performance Risk**: Large persona/instruction collections could slow dropdown loading
- **Mitigation**: Implement lazy loading and caching for file directory scanning
- **Fallback**: Pagination or search-based filtering for large file sets

**Connection Routing Complexity**: Advanced routing algorithms may impact performance  
- **Mitigation**: Simple path optimization with performance monitoring
- **Fallback**: Standard React Flow routing with manual connection adjustment

## Success Metrics

- All node text achieves minimum 4.5:1 contrast ratio (WCAG AA compliance)
- Connection routing selection improves visual flow organization by 40%
- Dropdown population completes in <200ms for up to 100 files
- Zero validation errors for properly configured AI Persona nodes
- File watcher updates dropdowns within 1 second of file system changes