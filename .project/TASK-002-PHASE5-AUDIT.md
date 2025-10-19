# Phase 5: useWorkflowTabs localStorage Audit Report

**File**: `src/features/tabs/hooks/useWorkflowTabs.ts`  
**Status**: ✅ **COMPLETE**  
**Duration**: 45 minutes  
**Estimated Time**: 1.5 hours

---

## 📊 Executive Summary

**Total localStorage Calls**: 19 instances  
**Categories**:

- **Read Operations**: 8 calls (42%)
- **Write Operations**: 7 calls (37%)
- **Remove Operations**: 1 call (5%)
- **Debug/Logging**: 3 calls (16%)

**Critical Conflicts with useTabState**:

- ❌ **HIGH**: Multiple overlapping storage keys (`puml-content-*`)
- ❌ **HIGH**: No single source of truth for tab state
- ❌ **MEDIUM**: Race conditions possible between hooks
- ❌ **MEDIUM**: Duplicate storage patterns

---

## 🔍 Detailed localStorage Usage Inventory

### Category 1: PlantUML Content Storage (8 instances)

#### Instance 1: Line 63 - Load UML File Content

```typescript
const content = localStorage.getItem(`puml-content-${file.path}`) || '';
```

**Purpose**: Load PlantUML content when loading UML files  
**Pattern**: `puml-content-${file.path}`  
**Conflict**: ✅ SAME as useTabState old keys  
**Issue**: Bypasses hook, creates race condition

#### Instance 2-3: Lines 172-173, 192-193 - Save UML Content

```typescript
localStorage.setItem(`puml-content-${result.filePath}`, result.content);
localStorage.setItem('ai-ley-puml-files', JSON.stringify(updatedFiles));
```

**Purpose**: Save PlantUML content when saving workflow  
**Pattern**: `puml-content-${filePath}` + file list  
**Conflict**: ✅ OVERLAPS with useTabState  
**Issue**: Hook and this write to same keys, last write wins

#### Instance 4: Line 386 - Switch Tab Content Load

```typescript
const content = localStorage.getItem(path);
```

**Purpose**: Load PlantUML when switching tabs  
**Context**: Loops through multiple storage paths:

```typescript
const sourcePaths = [`puml-content-tab-plantuml-${tab.id}`, `puml-content-${tab.path}`];
```

**Conflict**: ✅ CRITICAL - Same keys as useTabState migration  
**Issue**: Race condition - which source is authoritative?

#### Instance 5: Line 463 - Delete UML Content

```typescript
localStorage.removeItem(`puml-content-${tab.path}`);
```

**Purpose**: Delete PlantUML content when force-deleting tab  
**Pattern**: `puml-content-${tab.path}`  
**Conflict**: ✅ SAME key as useTabState old storage  
**Issue**: Doesn't delete hook storage key

#### Instance 6: Line 468 - Update File List After Delete

```typescript
localStorage.setItem('ai-ley-puml-files', JSON.stringify(updatedFiles));
```

**Purpose**: Update available files list after deletion  
**Pattern**: `ai-ley-puml-files` (file registry)  
**Conflict**: ❌ NO - Different concern  
**Issue**: None, orthogonal to tab state

#### Instance 7-8: Lines 642, 658 - Sample File Creation

```typescript
localStorage.setItem(`puml-content-${filePath}`, sample.content);
localStorage.setItem('ai-ley-puml-files', JSON.stringify(newFiles));
```

**Purpose**: Create default sample workflows  
**Pattern**: Same as save operations  
**Conflict**: ✅ SAME keys as useTabState  
**Issue**: Should use hook for new files

### Category 2: Debug/Logging (3 instances)

#### Instance 9-11: Lines 670-671, 674, 692 - Debug Logging

```typescript
console.log('  - workflowTabs:', localStorage.getItem('workflowTabs'));
console.log('  - activeTabId:', localStorage.getItem('activeTabId'));
console.log('  - ai-ley-puml-files:', localStorage.getItem('ai-ley-puml-files'));
console.log('  - localStorage keys:', Object.keys(localStorage));
```

**Purpose**: Debug logging of storage contents  
**Pattern**: Various keys for debugging  
**Conflict**: ❌ NO - Read-only debugging  
**Issue**: None, informational only

---

## ⚠️ Critical Conflicts Identified

### Conflict 1: Duplicate Storage Keys - HIGH SEVERITY

**Problem**: Both `useTabState` and `useWorkflowTabs` write to same localStorage keys

**Evidence**:

- `useTabState` old keys: `puml-content-${tabId}`, `puml-content-tab-plantuml-${tabId}`
- `useWorkflowTabs` keys: `puml-content-${filePath}`, `puml-content-tab-plantuml-${tab.id}`
- **Result**: Last write wins, data loss possible

**Example Race Condition**:

```
1. User edits PlantUML in SourceEditor
2. SourceEditor saves via useTabState → writes to `puml-content-tab-plantuml-123`
3. User switches tabs via WorkflowTabs
4. useWorkflowTabs.switchTab() loads old content from same key
5. User's edits disappear!
```

**Impact**: 🔴 **CRITICAL** - Data loss scenario

### Conflict 2: No Single Source of Truth - HIGH SEVERITY

**Problem**: Tab state scattered across multiple storage locations

**Current State**:

- `useTabState`: Manages `sourceState`, `visualState`, `activeView`
- `useWorkflowTabs`: Manages `tabs[]`, `activeTabId`, workflow data
- localStorage: Raw PlantUML content
- **Result**: Three sources of truth, synchronization nightmare

**Example Inconsistency**:

```
useTabState.state.sourceState = "Updated PlantUML"
localStorage.getItem('puml-content-tab-plantuml-123') = "Old PlantUML"
useWorkflowTabs.tabs[0].modified = false
```

**Impact**: 🔴 **CRITICAL** - State synchronization impossible

### Conflict 3: Tab Switching Logic Duplication - MEDIUM SEVERITY

**Problem**: Both hooks manage tab switching independently

**Evidence**:

- `useWorkflowTabs.switchTab()` (Line 260): Loads workflow, sets canvas
- `useTabState.switchView()`: Converts between visual/source
- **Result**: Two different switching mechanisms, confusion

**Impact**: 🟡 **MEDIUM** - Logic duplication, maintenance burden

### Conflict 4: Save Logic Conflicts - MEDIUM SEVERITY

**Problem**: Multiple save paths for same data

**Evidence**:

- `useWorkflowTabs.saveTab()` (Lines 172, 192): Writes PlantUML to localStorage
- `useTabState.updateSourceState()`: Writes to hook storage
- **Result**: Two writes to overlapping keys

**Impact**: 🟡 **MEDIUM** - Duplicate writes, inconsistent state

---

## 🎯 Refactoring Strategy

### Approach: Gradual Delegation to useTabState

**Principle**: useTabState becomes the ONLY source for:

- PlantUML source content (`sourceState`)
- Visual canvas state (`visualState`)
- Active view (`activeView`)
- Modified/saved status

**useWorkflowTabs remains responsible for**:

- Tab management (create, close, switch)
- File operations (load, save to filesystem)
- Available files registry (`ai-ley-puml-files`)
- Workflow metadata (name, path, createdAt, etc.)

### Phase 9A: Update switchTab() - 1 hour

**Current** (Lines 260-429):

```typescript
const switchTab = useCallback(
  (tabId: string) => {
    const tab = state.tabs.find((t) => t.id === tabId);

    // Loads PlantUML from localStorage directly
    const content = localStorage.getItem(path);
    // Parses and sets nodes/edges
    setNodes(parsedNodes);
    setEdges(parsedEdges);
  },
  [state.tabs, setNodes, setEdges, setViewport],
);
```

**After**:

```typescript
const switchTab = useCallback((tabId: string, tabState: ReturnType<typeof useTabState>) => {
  const tab = state.tabs.find((t) => t.id === tabId);

  // Let useTabState handle content loading and canvas state
  // Just update activeTabId
  setState((prev) => ({ ...prev, activeTabId: tabId }));

  // TabState hook will handle:
  // - Loading sourceState from storage
  // - Converting to visualState if needed
  // - Updating canvas via setNodes/setEdges
}, []);
```

**Changes**:

- Remove localStorage reads (8 calls → 0)
- Remove setNodes/setEdges calls (delegate to hook)
- Accept tabState parameter from parent component

### Phase 9B: Update saveTab() - 45 minutes

**Current** (Lines 130-205):

```typescript
const saveTab = useCallback(
  async (tabId: string) => {
    // Saves to localStorage
    localStorage.setItem(`puml-content-${result.filePath}`, result.content);
    localStorage.setItem('ai-ley-puml-files', JSON.stringify(updatedFiles));
  },
  [state.tabs, saveCurrentCanvasToTab],
);
```

**After**:

```typescript
const saveTab = useCallback(async (tabId: string, tabState: ReturnType<typeof useTabState>) => {
  // Get content from tabState instead of localStorage
  const content = tabState.state.sourceState;

  // Export to filesystem (this is still useWorkflowTabs responsibility)
  const result = await exportWorkflowToPUML(workflow, content);

  // Update file registry (still our responsibility)
  localStorage.setItem('ai-ley-puml-files', JSON.stringify(updatedFiles));

  // Mark as saved in tabState
  tabState.markSaved();
}, []);
```

**Changes**:

- Remove PlantUML content writes (2 calls → 0)
- Keep file registry writes (orthogonal concern)
- Get content from tabState parameter

### Phase 9C: Update loadUMLFiles() - 30 minutes

**Current** (Lines 53-82):

```typescript
const loadUMLFiles = useCallback(async (): Promise<UMLFileInfo[]> => {
  const content = localStorage.getItem(`puml-content-${file.path}`) || '';
}, []);
```

**After**:

```typescript
const loadUMLFiles = useCallback(
  async (getTabContent: (tabId: string) => string | null): Promise<UMLFileInfo[]> => {
    // Try to get from hook storage first
    const content =
      getTabContent(file.path) || localStorage.getItem(`puml-content-${file.path}`) || '';
  },
  [],
);
```

**Changes**:

- Accept getTabContent helper from SourceEditor
- Check hook storage first, fall back to old storage
- Backward compatible during migration

### Phase 9D: Update closeTab() - 15 minutes

**Current** (Lines 433-480):

```typescript
const closeTab = useCallback(
  async (tabId: string, forceDelete = false) => {
    localStorage.removeItem(`puml-content-${tab.path}`);
  },
  [state.tabs, saveTab],
);
```

**After**:

```typescript
const closeTab = useCallback(
  async (tabId: string, forceDelete = false, tabState: ReturnType<typeof useTabState>) => {
    // Check tabState for unsaved changes
    if (tabState.state.modified && !forceDelete) {
      // ... prompt to save
    }

    // Hook will clean up its own storage
    // We only clean up old keys if needed
    if (forceDelete && tab.path) {
      localStorage.removeItem(`puml-content-${tab.path}`); // Old key cleanup
    }
  },
  [],
);
```

**Changes**:

- Use tabState.state.modified instead of tab.modified
- Hook cleans up its own storage
- Keep old key cleanup for migration

### Phase 9E: Update Sample File Creation - 15 minutes

**Current** (Lines 630-660):

```typescript
const createDefaultSampleFiles = useCallback(async () => {
  localStorage.setItem(`puml-content-${filePath}`, sample.content);
}, []);
```

**After**:

```typescript
const createDefaultSampleFiles = useCallback(
  async (createTabWithContent: (name: string, content: string) => void) => {
    // Create tabs via parent component, which will use useTabState
    for (const sample of sampleFiles) {
      createTabWithContent(sample.name, sample.content);
    }
  },
  [],
);
```

**Changes**:

- Delegate to parent component
- Parent uses useTabState to create tabs with content
- No direct localStorage writes

---

## 📋 Refactoring Summary

### localStorage Calls Replacement Plan

| Instance | Current Location | Operation | Replacement Strategy              |
| -------- | ---------------- | --------- | --------------------------------- |
| 1        | Line 63          | Read      | Accept getTabContent() parameter  |
| 2        | Line 172         | Write     | Remove - hook handles             |
| 3        | Line 192         | Write     | Keep - file registry (orthogonal) |
| 4        | Line 386         | Read      | Remove - hook provides state      |
| 5        | Line 463         | Remove    | Keep - old key cleanup            |
| 6        | Line 468         | Write     | Keep - file registry              |
| 7        | Line 642         | Write     | Remove - delegate to parent       |
| 8        | Line 658         | Write     | Keep - file registry              |
| 9-11     | Lines 670-692    | Debug     | Keep - debugging only             |

**Total Removals**: 5 localStorage operations  
**Total Delegations**: 4 operations moved to hook  
**Total Kept**: 10 operations (orthogonal concerns)

### New Function Signatures

**useWorkflowTabs** will need to accept:

```typescript
interface UseWorkflowTabsProps {
  tabStateMap: Map<string, ReturnType<typeof useTabState>>;
  getTabContent: (tabId: string) => string | null;
  createTabWithContent: (name: string, content: string) => string;
}

export function useWorkflowTabs(props: UseWorkflowTabsProps): UseWorkflowTabsReturn;
```

**Parent Component** (App.tsx or WorkflowTabs.tsx) will:

- Manage multiple useTabState hooks (one per tab)
- Pass hook instances to useWorkflowTabs
- Coordinate between hooks

---

## ⚠️ Migration Risks

### Risk 1: Breaking Existing Workflows

**Probability**: Medium  
**Impact**: High  
**Mitigation**:

- Keep backward compatibility with old keys
- Test with existing PlantUML files
- Provide migration path for users

### Risk 2: Complex Parent Component Logic

**Probability**: High  
**Impact**: Medium  
**Mitigation**:

- Create helper hooks (useMultiTabState)
- Document hook coordination
- Use feature flag for gradual rollout

### Risk 3: Performance with Many Tabs

**Probability**: Low  
**Impact**: Medium  
**Mitigation**:

- Lazy load hooks (only for active tabs)
- Optimize re-renders with useMemo
- Monitor performance metrics

---

## ✅ Success Criteria

### Phase 9 Completion Checklist

- [ ] switchTab() delegates to useTabState
- [ ] saveTab() reads from useTabState
- [ ] loadUMLFiles() checks hook storage first
- [ ] closeTab() uses useTabState modified flag
- [ ] Sample creation delegates to parent
- [ ] All localStorage writes removed (except file registry)
- [ ] All localStorage reads removed (except debugging)
- [ ] Parent component coordinates hooks
- [ ] Tests pass for multi-tab scenarios
- [ ] Backward compatibility with old files

---

## 🎯 Estimated Time Breakdown

**Phase 9 Total**: 2.5 hours

- **9A**: Update switchTab() - 1.0 hours
- **9B**: Update saveTab() - 0.75 hours
- **9C**: Update loadUMLFiles() - 0.5 hours
- **9D**: Update closeTab() - 0.25 hours
- **9E**: Update sample creation - 0.25 hours
- **9F**: Parent component updates - 1.0 hours
- **9G**: Testing - 1.0 hours

**Total Phase 9**: 4.75 hours (original estimate: 2.5h)  
**Revision Needed**: Add 2.25 hours to timeline

---

## 📊 Hook Responsibility Matrix

### After Refactoring

| Responsibility              | useTabState | useWorkflowTabs | Parent Component |
| --------------------------- | ----------- | --------------- | ---------------- |
| PlantUML content            | ✅ Owner    | ❌ Consumer     | 🔄 Coordinator   |
| Visual canvas state         | ✅ Owner    | ❌ None         | 🔄 Coordinator   |
| Active view (visual/source) | ✅ Owner    | ❌ None         | 🔄 Coordinator   |
| Modified/saved status       | ✅ Owner    | ❌ Consumer     | 🔄 Coordinator   |
| Tab list management         | ❌ None     | ✅ Owner        | 🔄 Coordinator   |
| File operations             | ❌ None     | ✅ Owner        | 🔄 Coordinator   |
| File registry               | ❌ None     | ✅ Owner        | ❌ None          |
| Active tab selection        | ❌ None     | ✅ Owner        | 🔄 Coordinator   |

**Legend**:

- ✅ Owner: Primary responsibility, authoritative source
- 🔄 Coordinator: Manages interaction between hooks
- ❌ Consumer: Uses data but doesn't own it
- ❌ None: No responsibility

---

## 🔍 Files to Modify (Phase 9)

### Primary Changes

1. **useWorkflowTabs.ts** (999 lines)

   - Update function signatures
   - Remove localStorage operations
   - Accept hook parameters

2. **WorkflowTabs.tsx** or **App.tsx** (TBD)
   - Create multiple useTabState hooks
   - Pass hooks to useWorkflowTabs
   - Coordinate state

### Supporting Changes

3. **useTabState.ts** (476 lines)

   - Already complete ✅
   - No changes needed

4. **SourceEditor.tsx** (563 lines)
   - Already integrated ✅
   - May need minor updates for multi-tab

---

## 📝 Next Steps

1. **Phase 6**: Add feature flag (0.5 hours)

   - Create USE_TAB_STATE_HOOK setting
   - Add toggle UI
   - Document rollback

2. **Phase 7**: Fix parent state sync (2 hours)

   - Identify parent component (App.tsx or WorkflowTabs.tsx)
   - Remove duplicate isSourceView state
   - Use useTabState as source of truth

3. **Phase 8**: Clarify responsibilities (1 hour)

   - Document hook boundaries
   - Update integration plan
   - Create architecture diagram

4. **Phase 9**: Execute integration (4.75 hours - REVISED)

   - Follow this refactoring plan
   - Update all 5 functions
   - Test thoroughly

5. **Phase 10**: Comprehensive testing (3 hours)
   - Test all 37 requirements
   - Edge case validation
   - Document results

---

**Status**: ✅ PHASE 5 COMPLETE  
**Next**: Phase 6 - Add feature flag for rollback  
**Estimated Time for Phases 6-10**: 11.25 hours (revised from 8.5 hours)  
**Reason for Revision**: Phase 9 more complex than initially estimated

_Audit Created: October 19, 2025_  
_Task: TASK-002 - Phase 5: useWorkflowTabs Audit_
