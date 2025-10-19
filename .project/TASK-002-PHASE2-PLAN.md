# Phase 2: SourceEditor localStorage Refactoring Plan

**File**: `src/features/tabs/components/SourceEditor.tsx`  
**Status**: 🔄 In Progress  
**Estimated Time**: 1.5 hours

---

## 📊 Current State Analysis

### localStorage Usage Inventory

**Total Calls**: 5 instances

#### Instance 1 & 2: Lines 51-56 (Read - First Tab Fallback)

```typescript
if (firstTab.path && localStorage.getItem(`puml-content-${firstTab.path}`)) {
  const originalContent = localStorage.getItem(`puml-content-${firstTab.path}`);
  setContent(originalContent || getDefaultPlantUMLContent(firstTab.name));
}
```

**Purpose**: Load PlantUML content when no active tab but tabs exist  
**Pattern**: `puml-content-${path}`  
**Issue**: Bypasses hook state management

#### Instance 3: Lines 107-108 (Read - Active Tab)

```typescript
const originalContent = localStorage.getItem(`puml-content-${activeTab.path}`);
if (originalContent) {
  setContent(originalContent);
  return;
}
```

**Purpose**: Load original PlantUML source when tab has a path  
**Pattern**: `puml-content-${path}`  
**Issue**: Hook should be source of truth, not localStorage

#### Instance 4 & 5: Lines 379-385 (Write - Content Save)

```typescript
localStorage.setItem(`puml-content-${storageKey}`, content);
localStorage.setItem(`puml-content-tab-plantuml-${activeTab.id}`, content);
```

**Purpose**: Save PlantUML content on change  
**Pattern**: Both old patterns being written  
**Issue**: Duplicate writes, conflicts with hook

---

## 🎯 Refactoring Strategy

### Approach: Gradual Integration with Backward Compatibility

**Phase 2A**: Prepare SourceEditor for Hook Integration (30 min)

- Import useTabState hook
- Add hook initialization
- Keep old code paths temporarily

**Phase 2B**: Replace localStorage Reads (30 min)

- Replace Instances 1-3 with hook state reads
- Add migration support (check new then old)

**Phase 2C**: Replace localStorage Writes (20 min)

- Replace Instances 4-5 with hook state updates
- Remove duplicate writes

**Phase 2D**: Testing & Cleanup (10 min)

- Test view switching
- Verify content persistence
- Remove old code paths

---

## 🔧 Implementation Details

### Step 1: Import and Initialize Hook (Lines 1-30)

**Current**:

```typescript
export function SourceEditor({ className, onUpdate, refreshTrigger }: SourceEditorProps) {
  const { activeTab, saveTab, isLoading: tabsLoading, tabs } = useWorkflowTabsContext();
  const { getNodes, getEdges } = useReactFlow();
  const [content, setContent] = useState('');
```

**After**:

```typescript
import { useTabState } from '../hooks/useTabState';

export function SourceEditor({ className, onUpdate, refreshTrigger }: SourceEditorProps) {
  const { activeTab, saveTab, isLoading: tabsLoading, tabs } = useWorkflowTabsContext();
  const { getNodes, getEdges, setNodes, setEdges, setViewport } = useReactFlow();

  // Initialize tab state hook for active tab
  const tabState = activeTab
    ? useTabState(activeTab.id, activeTab.name)
    : null;

  const [content, setContent] = useState('');
```

**Changes**:

- Import useTabState
- Add React Flow mutators (needed by hook)
- Initialize hook conditionally (only if activeTab exists)

---

### Step 2: Replace Read Instance 1-2 (Lines 51-56)

**Current**:

```typescript
if (firstTab.path && localStorage.getItem(`puml-content-${firstTab.path}`)) {
  const originalContent = localStorage.getItem(`puml-content-${firstTab.path}`);
  setContent(originalContent || getDefaultPlantUMLContent(firstTab.name));
  return;
}
```

**After**:

```typescript
// Try to get content from tab state hook (if available)
// Fall back to localStorage for backward compatibility during migration
const getTabContent = (tab: WorkflowTab): string | null => {
  // New way: Check tab state hook storage
  const newKey = `ailey-tab-state-${tab.id}`;
  const newState = localStorage.getItem(newKey);
  if (newState) {
    try {
      const parsed = JSON.parse(newState);
      return parsed.sourceState || null;
    } catch (e) {
      console.error('Failed to parse tab state:', e);
    }
  }

  // Old way: Check old localStorage keys (migration support)
  if (tab.path) {
    return localStorage.getItem(`puml-content-${tab.path}`);
  }
  return localStorage.getItem(`puml-content-tab-plantuml-${tab.id}`);
};

const firstTabContent = getTabContent(firstTab);
if (firstTabContent) {
  setContent(firstTabContent);
  return;
}
```

**Benefits**:

- Checks new storage first
- Falls back to old storage during migration
- Centralizes content retrieval logic

---

### Step 3: Replace Read Instance 3 (Lines 107-108)

**Current**:

```typescript
const originalContent = localStorage.getItem(`puml-content-${activeTab.path}`);
if (originalContent) {
  setContent(originalContent);
  return;
}
```

**After**:

```typescript
// Use tab state hook if available
if (tabState) {
  setContent(tabState.state.sourceState);
  return;
}

// Fallback for backward compatibility
const originalContent = getTabContent(activeTab);
if (originalContent) {
  setContent(originalContent);
  return;
}
```

**Benefits**:

- Hook is primary source of truth
- Fallback ensures nothing breaks during migration

---

### Step 4: Replace Write Instances 4-5 (Lines 379-385)

**Current**:

```typescript
localStorage.setItem(`puml-content-${storageKey}`, content);
localStorage.setItem(`puml-content-tab-plantuml-${activeTab.id}`, content);
```

**After**:

```typescript
// Update through tab state hook (primary method)
if (tabState) {
  tabState.updateSourceState(content);
} else {
  // Fallback: Direct localStorage (during migration only)
  console.warn('Tab state hook not available, using fallback storage');
  localStorage.setItem(`puml-content-${storageKey}`, content);
}

// Remove duplicate write - hook handles persistence
// localStorage.setItem(`puml-content-tab-plantuml-${activeTab.id}`, content); ← DELETE
```

**Benefits**:

- Single write through hook
- Hook auto-persists to correct key
- Eliminates duplicate writes

---

### Step 5: Update Content Loading Effect (Lines 36-150)

**Current Pattern**: Complex localStorage reads scattered throughout

**After**: Simplify using hook

```typescript
useEffect(() => {
  const loadContent = async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));

    if (!activeTab) {
      if (!tabsLoading && tabs.length > 0) {
        const firstTabContent = getTabContent(tabs[0]);
        setContent(firstTabContent || getDefaultPlantUMLContent(tabs[0].name));
      } else {
        setContent('');
      }
      return;
    }

    setIsLoading(true);
    try {
      // Primary: Use tab state hook
      if (tabState) {
        setContent(tabState.state.sourceState);
        return;
      }

      // Fallback: Try to load from old storage
      const storedContent = getTabContent(activeTab);
      if (storedContent) {
        setContent(storedContent);
        return;
      }

      // Last resort: Generate from canvas
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      if (currentNodes.length > 0) {
        const plantumlContent = flowToPlantUML(currentNodes, currentEdges, activeTab.name);
        setContent(plantumlContent);
      } else {
        setContent(getDefaultPlantUMLContent(activeTab.name));
      }
    } finally {
      setIsLoading(false);
    }
  };

  loadContent();
}, [activeTab?.id, tabState, refreshTrigger]);
```

**Benefits**:

- Cleaner logic flow
- Hook-first approach
- Proper fallback chain
- Better error handling

---

## ✅ Success Criteria

- [ ] Hook initialized properly when activeTab exists
- [ ] Content loads from hook storage first
- [ ] Falls back to old storage if hook storage empty (migration support)
- [ ] Content updates go through hook's updateSourceState
- [ ] No duplicate localStorage writes
- [ ] View switching preserves content
- [ ] ESLint clean (0 errors)
- [ ] TypeScript compiles without errors

---

## 🧪 Testing Plan

### Manual Tests

1. Create new tab → Verify content initializes
2. Edit PlantUML → Verify hook updates
3. Switch tabs → Verify content persists
4. Refresh page → Verify content restored
5. Switch to visual view → Verify conversion works
6. Switch back to source → Verify content preserved

### Edge Cases

1. Tab with old storage keys → Verify migration works
2. Tab with no content → Verify default content
3. Multiple tabs → Verify state isolation

---

## 📝 Files Modified

- `src/features/tabs/components/SourceEditor.tsx` (PRIMARY)
  - Add useTabState import
  - Add hook initialization
  - Replace 5 localStorage calls
  - Add backward compatibility helper

---

## ⏱️ Time Breakdown

- Import & Initialize: 10 min
- Replace Read Calls (3): 30 min
- Replace Write Calls (2): 20 min
- Refactor loadContent: 20 min
- Testing: 10 min
- **Total**: 1.5 hours

---

## 🔄 Next Steps After Completion

1. Mark Phase 2 complete in TASK-002-PROGRESS.md
2. Move to Phase 3: Audit useWorkflowTabs (GAP-3)
3. Document any issues discovered
4. Update integration plan if needed

---

_Plan Created: October 19, 2025_  
_Task: TASK-002 - Phase 2: SourceEditor Refactoring_
