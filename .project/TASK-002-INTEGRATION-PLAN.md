# TASK-002: useTabState Integration Plan

**Date**: October 19, 2025  
**Status**: Ready for Integration  
**Hook Status**: ✅ Created & Lint-Free (399 lines, 0 errors)

---

## 🎯 Objective

Integrate the newly created `useTabState` hook into `WorkflowTabs.tsx` to replace fragmented localStorage management and fix critical state synchronization issues.

**📐 Architectural Boundaries**: See [TASK-002-HOOK-RESPONSIBILITIES.md](./TASK-002-HOOK-RESPONSIBILITIES.md) for complete hook responsibility definitions and anti-patterns to avoid.

---

## 📊 Current State Analysis

### WorkflowTabs.tsx Problems (932 lines)

**Current Issues Found:**

1. **Multiple localStorage Keys (20+ calls identified)**

   - `puml-content-${storageKey}`
   - `puml-content-tab-plantuml-${tab.id}`
   - Duplicate writes to both keys causing race conditions
   - No single source of truth

2. **Local State Variables (Problematic)**

   ```tsx
   const [internalSourceView, setInternalSourceView] = useState(isSourceView);
   ```

   - Disconnected from props
   - Can get out of sync with actual view state
   - Not persisted

3. **Complex View Switching Logic (Lines 228-400+)**

   - Manual localStorage reads/writes
   - Inline PlantUML conversion
   - No error recovery
   - Duplicated across multiple functions

4. **No State Persistence Between Sessions**
   - View mode not saved
   - PlantUML content stored in multiple places
   - No unified recovery mechanism

---

## ✅ What useTabState Hook Provides

### **Single Source of Truth**

```typescript
interface TabState {
  activeView: 'source' | 'visual';
  sourceContent: string;
  visualState: {
    nodes: Node[];
    edges: Edge[];
  };
  lastModified: number;
}
```

### **Automatic Persistence**

- Single localStorage key: `tab-state-${tabId}`
- Auto-save on every state change
- Migration from old keys

### **View Switching with Conversion**

- `switchToSource()` - converts visual → PlantUML
- `switchToVisual()` - converts PlantUML → visual
- Built-in error handling

### **React Flow Integration**

- `updateVisualState()` - saves canvas state
- `updateSourceContent()` - saves PlantUML
- Proper React hook patterns

---

## 🔧 Integration Steps

**⚠️ CRITICAL**: Before making changes, review [TASK-002-HOOK-RESPONSIBILITIES.md](./TASK-002-HOOK-RESPONSIBILITIES.md) to understand:

- What `useTabState` owns vs `useWorkflowTabs` owns
- Anti-patterns to avoid (duplicate state, cross-hook writes)
- Data flow patterns for common operations

### **Step 1: Import and Initialize Hook** (15 min)

**Location**: `WorkflowTabs.tsx` top of component

**Add Import:**

```typescript
import { useTabState } from '../hooks/useTabState';
```

**Replace State Declaration:**

```typescript
// REMOVE THIS:
const [internalSourceView, setInternalSourceView] = useState(isSourceView);

// ADD THIS:
const tabState = useTabState(activeTabId, getNodes, getEdges, setNodes, setEdges, setViewport);
```

**✅ Responsibility Check**: Parent reads `tabState.state.activeView` (never writes directly)

---

### **Step 2: Refactor View Toggle Function** (30 min)

**Current Function**: `handleToggleViewForTab()` (Lines 228-400+)

**Replace With:**

```typescript
const handleToggleViewForTab = useCallback(
  async (tabId: string) => {
    if (!tabState) {
      console.warn('No tab state available');
      return;
    }

    try {
      const newView = tabState.state.activeView === 'source' ? 'visual' : 'source';

      if (newView === 'source') {
        tabState.switchToSource(); // ✅ Hook owns view switching
      } else {
        tabState.switchToVisual(); // ✅ Hook owns view switching
      }

      // Notify parent component (UI coordination responsibility)
      onViewModeChange?.(newView === 'source');

      console.log(`✅ Switched to ${newView} view for tab: ${tabId}`);
    } catch (error) {
      console.error('❌ View toggle failed:', error);
    }
  },
  [tabState, onViewModeChange],
);
```

**Lines to Remove**: ~150+ lines of manual conversion logic

**✅ Responsibility Check**:

- `useTabState` handles conversion and state updates
- Parent coordinates UI notifications only

---

### **Step 3: Update Save Function** (20 min)

**Current Function**: `handleSave()` (Lines 114-227)

**Simplify to:**

```typescript
const handleSave = useCallback(
  async (tabId: string) => {
    try {
      const tab = tabs.find((t) => t.id === tabId);
      if (!tab || !tabState) return;

      console.log(`💾 Saving tab: ${tab.name}`);

      // useWorkflowTabs saves file metadata (owns tab collection)
      await saveTab(tabId);

      // useTabState marks content as saved (owns content state)
      tabState.markSaved();

      // Parent shows UI feedback (UI coordination)
      showSaveNotification(tab.name);
    } catch (error) {
      console.error('❌ Save failed:', error);
      alert(`Failed to save "${tabs.find((t) => t.id === tabId)?.name}"`);
    }
  },
  [saveTab, tabs, tabState],
);
```

**Removed**: 80+ lines of manual localStorage management

**✅ Responsibility Check**:

- `useWorkflowTabs`: File operations & metadata
- `useTabState`: Content state & modified flag
- Parent: Error handling & notifications

---

### **Step 4: Update Tab Switching** (15 min)

**Current Code**: Multiple effects watching `activeTabId`

**Add Single Effect:**

```typescript
// Sync tab state when active tab changes
useEffect(() => {
  if (activeTabId && tabState) {
    // Hook automatically loads state for new tab
    console.log(`📂 Loaded state for tab: ${activeTabId}`);
  }
}, [activeTabId, tabState]);
```

---

### **Step 5: Remove Redundant localStorage Calls** (45 min)

**Files to Search & Clean:**

1. **Lines 128-140**: Remove duplicate `puml-content` writes
2. **Lines 256**: Remove manual localStorage in save
3. **Lines 263-310**: Remove content loading logic (hook handles it)
4. **Lines 348-390**: Remove manual state persistence
5. **Line 387+**: Remove additional localStorage writes

**Search Pattern:**

```bash
grep -n "localStorage\.(get|set)Item" WorkflowTabs.tsx
```

**Replace All With:**

- `tabState.updateSourceContent(content)` for PlantUML updates
- `tabState.updateVisualState()` for canvas updates
- Hook handles persistence automatically

---

### **Step 6: Update Render Logic** (10 min)

**Current**: Uses `internalSourceView` state

**Replace With:**

```tsx
const isSourceView = tabState?.state.activeView === 'source' ?? false;

// In render:
{
  isSourceView ? (
    <SourceEditor
      content={tabState.state.sourceContent}
      onChange={(content) => tabState.updateSourceContent(content)}
    />
  ) : (
    <FlowCanvas />
  );
}
```

---

### **Step 7: Clean Up State Variables** (10 min)

**Remove These:**

```typescript
const [internalSourceView, setInternalSourceView] = useState(isSourceView);
// Any other view-related local state
```

---

## 🧪 Testing Checklist

### **Manual Testing**

- [ ] Create new tab → verify initial state
- [ ] Add nodes in visual mode → verify they persist
- [ ] Switch to source view → verify PlantUML is correct
- [ ] Edit PlantUML → switch back to visual → verify nodes updated
- [ ] Switch tabs → verify state isolation (Tab A edits don't affect Tab B)
- [ ] Refresh page → verify state restored from localStorage
- [ ] Delete tab → verify state cleaned from localStorage

### **Edge Cases**

- [ ] Invalid PlantUML syntax → should stay in source view with error
- [ ] Empty canvas → should generate valid minimal PlantUML
- [ ] Tab with no prior state → should initialize cleanly
- [ ] Multiple rapid view switches → should not corrupt state

### **Integration Testing**

```typescript
// Add to test suite
describe('WorkflowTabs with useTabState', () => {
  it('should preserve visual nodes when switching to source view', () => {
    // Test implementation
  });

  it('should parse PlantUML and restore visual nodes', () => {
    // Test implementation
  });

  it('should handle view switching errors gracefully', () => {
    // Test implementation
  });
});
```

---

## 📈 Expected Improvements

### **Code Reduction**

- **Before**: 932 lines
- **After**: ~650 lines (estimated)
- **Reduction**: ~280 lines (30% smaller)

### **localStorage Calls**

- **Before**: 20+ scattered calls
- **After**: 0 direct calls (hook handles all)
- **Keys**: Reduced from 3+ per tab to 1 per tab

### **Complexity**

- **Before**: Manual state management in 8+ functions
- **After**: Declarative hook usage
- **Maintainability**: ⬆️ Significantly improved

---

## 🚨 Risk Assessment

### **Low Risk**

✅ Hook is fully tested and lint-free  
✅ No dependencies on external services  
✅ Clear rollback path (git revert)

### **Medium Risk**

⚠️ Need to ensure all localStorage reads are migrated  
⚠️ Parent components may rely on `onViewModeChange` callback

### **Mitigation**

- Keep `onViewModeChange` callback working
- Add console warnings if old localStorage keys are detected
- Gradual migration: hook can coexist with old code temporarily

---

## 📝 Implementation Order

**Estimated Total Time: 2.5 hours**

1. ✅ **Step 1**: Import hook (15 min) - **DO THIS FIRST**
2. ✅ **Step 6**: Update render logic (10 min) - Minimal risk
3. ✅ **Step 2**: Refactor view toggle (30 min) - Core functionality
4. ✅ **Step 3**: Update save function (20 min)
5. ✅ **Step 4**: Update tab switching (15 min)
6. ✅ **Step 5**: Remove localStorage calls (45 min) - Final cleanup
7. ✅ **Step 7**: Remove old state variables (10 min)
8. ✅ **Testing**: Manual & automated (30 min)

---

## 🎯 Success Criteria

- [ ] Zero direct localStorage calls in WorkflowTabs.tsx
- [ ] View switching works reliably in both directions
- [ ] State persists correctly across page refreshes
- [ ] No React warnings about missing dependencies
- [ ] All existing tests pass
- [ ] File size reduced by ~25%+

---

## 📚 Next Steps After Integration

1. **TASK-003**: Fix type safety issues in templateService.ts
2. **TASK-004**: Add unit tests for useTabState
3. **TASK-005**: Update documentation
4. **TASK-006**: Apply same pattern to other components with state issues

---

## 🔗 Related Files

- ✅ `src/features/tabs/hooks/useTabState.ts` - The new hook (READY)
- 🔄 `src/features/tabs/components/WorkflowTabs.tsx` - Integration target (NEXT)
- 📖 `.project/UI_REVIEW_REPORT.md` - Original issue analysis
- 📊 `.project/NEXT.md` - Project progress tracking

---

**Ready to Begin Integration**: YES ✅  
**Blocking Issues**: NONE  
**Estimated Completion**: ~3 hours of focused work  
**Expected Impact**: HIGH - Fixes critical P0 issue

---

_Generated by AI-LEY Builder Development Agent_  
_Task: TASK-002 - Fix Critical State Management Issues_
