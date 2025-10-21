# TASK-005: Integration Tests for View Switching - EXECUTION PLAN

**Status**: 🟡 IN PROGRESS  
**Started**: October 19, 2025  
**Estimated**: 6-8 hours  
**Assignees**: Senior Fullstack Developer, QA Engineer

---

## Overview

Create comprehensive integration tests that validate the end-to-end workflow of view switching between visual and source modes in the WorkflowTabs component, including state synchronization, persistence, and UI updates.

## Success Criteria

- [ ] End-to-end view switching workflow tests
- [ ] State synchronization between canvas and tabs validated
- [ ] Persistence across view switches tested
- [ ] UI rendering and component integration tested
- [ ] > 80% integration test coverage
- [ ] All tests passing
- [ ] No regressions in existing unit tests

---

## Integration Test Scope

### What Integration Tests Cover (vs Unit Tests)

**Unit Tests (TASK-004 - Complete)**:

- ✅ Individual hook functions (`useTabState`, `useMultiTabState`)
- ✅ State management logic in isolation
- ✅ Mocked dependencies (PlantUML, React Flow)

**Integration Tests (TASK-005 - This Task)**:

- 🎯 Full component workflows with real interactions
- 🎯 WorkflowTabs + useTabState + React Flow integration
- 🎯 Actual PlantUML conversion (or realistic mocks)
- 🎯 Multi-component state synchronization
- 🎯 localStorage persistence with real storage
- 🎯 UI rendering and user interactions

---

## Test Plan

### Phase 1: Setup Integration Test Environment (1 hour)

**Goals**:

- Configure test environment for full component rendering
- Set up React Flow test providers
- Create test utilities for integration scenarios
- Set up realistic mocks for PlantUML utilities

**Deliverables**:

- `src/test/integration-utils.tsx` - Integration test helpers
- Enhanced test setup for React Flow components
- Mock PlantUML utilities that return realistic data

### Phase 2: View Switching Integration Tests (2 hours)

**Test Scenarios**:

1. **Complete Visual → Source Workflow**

   - User creates nodes/edges in visual view
   - User clicks "Source View" button
   - Verify: PlantUML generated from nodes/edges
   - Verify: UI switches to source editor
   - Verify: Source content is editable
   - Verify: State persists to localStorage

2. **Complete Source → Visual Workflow**

   - User enters PlantUML in source view
   - User clicks "Visual View" button
   - Verify: PlantUML parsed to nodes/edges
   - Verify: Canvas renders nodes/edges
   - Verify: UI switches to visual canvas
   - Verify: State persists to localStorage

3. **Round-Trip Conversion**
   - Start with nodes in visual
   - Switch to source (conversion 1)
   - Switch back to visual (conversion 2)
   - Verify: Nodes preserved with minimal data loss
   - Verify: State consistency maintained

**Files to Create**:

- `src/features/tabs/components/__tests__/WorkflowTabs.integration.test.tsx`

### Phase 3: State Synchronization Integration Tests (2 hours)

**Test Scenarios**:

1. **Canvas State → Tab State Sync**

   - Add nodes/edges to canvas
   - Trigger state update
   - Verify: Tab state reflects canvas changes
   - Verify: localStorage updated
   - Verify: Modified flag set correctly

2. **Tab State → Canvas State Sync**

   - Update tab state programmatically
   - Switch views
   - Verify: Canvas updates with new state
   - Verify: Viewport preserved
   - Verify: Edge connections maintained

3. **Multi-Tab State Isolation**

   - Create multiple tabs
   - Modify state in tab 1
   - Switch to tab 2
   - Verify: Tab 2 state unaffected
   - Verify: Switch back to tab 1, state preserved
   - Verify: Each tab has independent localStorage

4. **State Sync During View Switch**
   - Make changes in visual view
   - Switch to source view mid-edit
   - Verify: Changes captured in PlantUML
   - Switch back to visual
   - Verify: Changes restored

**Files to Create**:

- `src/features/tabs/hooks/__tests__/useTabState.integration.test.ts`

### Phase 4: Persistence Integration Tests (1.5 hours)

**Test Scenarios**:

1. **localStorage Persistence Workflow**

   - Create tab with content
   - Switch views multiple times
   - Verify: State persists after each switch
   - Verify: localStorage keys correct
   - Verify: Data serialization works

2. **State Restoration After "Reload"**

   - Save state to localStorage
   - Unmount component
   - Remount component
   - Verify: State restored correctly
   - Verify: View mode restored
   - Verify: Content intact

3. **Migration from Old Storage Keys**

   - Set old storage keys (puml-content-\*)
   - Mount component
   - Verify: Old data migrated
   - Verify: New storage keys created
   - Verify: Old keys cleaned up

4. **Concurrent Tab Persistence**
   - Create tabs A, B, C
   - Make changes in each
   - Verify: All tabs persisted independently
   - Verify: No cross-tab contamination

**Files to Enhance**:

- `src/features/tabs/hooks/__tests__/useTabState.integration.test.ts` (add scenarios)

### Phase 5: UI Rendering Integration Tests (1.5 hours)

**Test Scenarios**:

1. **View Toggle Button Rendering**

   - Render WorkflowTabs component
   - Verify: Toggle button visible
   - Click toggle button
   - Verify: View switches
   - Verify: Button text/icon updates

2. **Tab UI State Updates**

   - Create tabs with different states
   - Verify: Modified indicator shows
   - Save tab
   - Verify: Modified indicator clears
   - Verify: Save button disabled when saved

3. **Source Editor Rendering**

   - Switch to source view
   - Verify: SourceEditor component renders
   - Verify: Content editable
   - Type content
   - Verify: State updates

4. **Canvas Rendering**
   - Switch to visual view
   - Verify: React Flow canvas renders
   - Verify: Nodes render correctly
   - Verify: Edges render correctly
   - Verify: Interactive controls work

**Files to Create/Enhance**:

- `src/features/tabs/components/__tests__/WorkflowTabs.integration.test.tsx`

### Phase 6: Error Handling Integration Tests (1 hour)

**Test Scenarios**:

1. **PlantUML Parse Errors**

   - Enter invalid PlantUML
   - Try to switch to visual
   - Verify: Error handled gracefully
   - Verify: User stays in source view
   - Verify: Error message shown

2. **localStorage Errors**

   - Mock localStorage.setItem to throw
   - Make state changes
   - Verify: App doesn't crash
   - Verify: User notified
   - Verify: In-memory state maintained

3. **Missing Tab State Recovery**
   - Delete localStorage entry
   - Try to restore state
   - Verify: Falls back to defaults
   - Verify: App continues working

**Files to Enhance**:

- All integration test files (add error scenarios)

---

## Test File Structure

```
src/
├── test/
│   ├── integration-utils.tsx (NEW - integration test helpers)
│   └── setup.ts (ENHANCE - add integration setup)
├── features/
│   └── tabs/
│       ├── components/
│       │   └── __tests__/
│       │       └── WorkflowTabs.integration.test.tsx (NEW)
│       └── hooks/
│           └── __tests__/
│               ├── useTabState.test.ts (EXISTING - unit tests)
│               └── useTabState.integration.test.ts (NEW)
```

---

## Implementation Strategy

### 1. Start with Component Integration Tests

- Most visible and comprehensive
- Tests full user workflows
- Easier to debug and understand
- Covers multiple layers at once

### 2. Add Hook Integration Tests

- Focus on hook + React Flow integration
- Test state synchronization
- Validate persistence workflows

### 3. Add Error Scenarios

- Test graceful degradation
- Validate error messages
- Ensure app stability

### 4. Measure Coverage

- Run coverage report
- Identify gaps
- Add tests to reach >80%

---

## Technical Approach

### React Flow Test Setup

```typescript
import { ReactFlowProvider } from '@xyflow/react';

const IntegrationWrapper = ({ children }) => (
  <ReactFlowProvider>
    <WorkflowTabsProvider>{children}</WorkflowTabsProvider>
  </ReactFlowProvider>
);
```

### Realistic PlantUML Mocks

```typescript
// Return actual parseable content, not just empty arrays
vi.mock('../../../utils/plantuml-parser', () => ({
  flowToPlantUML: (nodes, edges, name) => {
    // Generate realistic PlantUML from nodes/edges
    return `@startuml\n${name}\n...\n@enduml`;
  },
  parsePlantUMLToFlow: (content) => {
    // Parse realistic PlantUML to nodes/edges
    return { nodes: [...], edges: [...] };
  },
}));
```

### localStorage Testing

```typescript
// Use real localStorage (already mocked in setup.ts)
// Test actual persistence workflows
beforeEach(() => {
  localStorage.clear();
});

test('persists across unmount/remount', () => {
  const { unmount, rerender } = render(<Component />);
  // Make changes
  unmount();
  rerender(<Component />);
  // Verify persistence
});
```

---

## Quality Gates

### Before Marking Complete

1. ✅ All integration tests passing
2. ✅ >80% coverage for view switching code
3. ✅ No regressions in unit tests
4. ✅ Tests execute in <5 seconds
5. ✅ Tests are deterministic (no flakiness)
6. ✅ Error scenarios covered
7. ✅ Documentation complete

### Coverage Targets

- WorkflowTabs component: >80%
- View switching logic: >85%
- State synchronization: >85%
- Persistence logic: 100% (critical path)

---

## Execution Timeline

| Phase     | Task                               | Time   | Status |
| --------- | ---------------------------------- | ------ | ------ |
| 1         | Setup Integration Test Environment | 1h     | ⏸️     |
| 2         | View Switching Integration Tests   | 2h     | ⏸️     |
| 3         | State Synchronization Tests        | 2h     | ⏸️     |
| 4         | Persistence Tests                  | 1.5h   | ⏸️     |
| 5         | UI Rendering Tests                 | 1.5h   | ⏸️     |
| 6         | Error Handling Tests               | 1h     | ⏸️     |
| **Total** |                                    | **9h** | ⏸️     |

---

## Risk Assessment

### Potential Challenges

1. **React Flow Testing Complexity**

   - Mitigation: Use ReactFlowProvider wrapper
   - Mitigation: Mock complex interactions if needed

2. **Async State Updates**

   - Mitigation: Use waitFor extensively
   - Mitigation: Test timing carefully

3. **PlantUML Parsing Complexity**

   - Mitigation: Use realistic but simplified mocks
   - Mitigation: Focus on integration, not parsing logic

4. **Test Execution Time**
   - Mitigation: Keep tests focused
   - Mitigation: Avoid unnecessary re-renders
   - Target: <5s for all integration tests

---

## Success Metrics

- **Coverage**: >80% for view switching code
- **Tests**: 20-30 integration tests
- **Execution Time**: <5 seconds
- **Failure Rate**: 0% (deterministic tests)
- **Regressions**: 0 (all unit tests still pass)

---

**Status**: Ready to begin Phase 1
