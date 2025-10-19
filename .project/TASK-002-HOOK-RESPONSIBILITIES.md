# TASK-002: Hook Responsibilities & Architectural Boundaries

**Date**: October 19, 2025  
**Phase**: 8 - Clarify Hook Responsibilities  
**Status**: ✅ Complete

---

## 🎯 Purpose

Define clear boundaries between `useTabState`, `useWorkflowTabs`, and parent components to prevent conflicts, duplication, and race conditions during Phase 9 integration.

---

## 📐 Architectural Principles

### **Single Source of Truth**

Each piece of state must have exactly ONE authoritative owner. All other components are consumers that read (never write) this state.

### **Clear Ownership Hierarchy**

```
useTabState (Per-Tab State)
    ↓
useWorkflowTabs (Tab Collection Management)
    ↓
Parent Components (UI Coordination & User Actions)
```

### **No Cross-Hook Writes**

- `useTabState` NEVER writes to tab collection state
- `useWorkflowTabs` NEVER writes to individual tab content state
- Parents delegate writes to the appropriate hook

---

## 🔑 Hook #1: useTabState

**Purpose**: Owns and manages state for a SINGLE tab

### **✅ Responsibilities (OWNS)**

| State Property         | Type                   | Description                            |
| ---------------------- | ---------------------- | -------------------------------------- |
| `activeView`           | `'visual' \| 'source'` | Current view mode (canvas or PlantUML) |
| `sourceState`          | `string`               | PlantUML/source code content           |
| `visualState.nodes`    | `Node[]`               | React Flow nodes array                 |
| `visualState.edges`    | `Edge[]`               | React Flow edges array                 |
| `visualState.viewport` | `Viewport`             | Canvas zoom/pan position               |
| `modified`             | `boolean`              | Dirty flag indicating unsaved changes  |
| `lastSaved`            | `Date`                 | Timestamp of last save operation       |

### **✅ Methods (PROVIDES)**

```typescript
interface TabState {
  // View Management
  switchView(newView: 'visual' | 'source'): void;
  switchToSource(): Promise<void>; // Converts visual → PlantUML
  switchToVisual(): Promise<void>; // Converts PlantUML → visual

  // State Updates
  updateSourceState(content: string): void;
  updateVisualState(nodes?: Node[], edges?: Edge[]): void;

  // Lifecycle
  markSaved(): void;
  reset(): void;
}
```

### **✅ Storage Location**

**localStorage Key**: `tab-state-${tabId}`

**Storage Format**:

```json
{
  "id": "tab-12345",
  "name": "My Workflow",
  "activeView": "visual",
  "sourceState": "@startuml\n...\n@enduml",
  "visualState": {
    "nodes": [...],
    "edges": [...],
    "viewport": {...}
  },
  "modified": false,
  "lastSaved": "2025-10-19T10:30:00.000Z"
}
```

### **❌ NOT Responsible For**

- Tab list management (add/remove/reorder tabs)
- Active tab selection
- File operations (import/export)
- Tab metadata (name, path, type)
- Multi-tab operations (close all, save all)
- Sample/template creation

---

## 🔑 Hook #2: useWorkflowTabs

**Purpose**: Manages the collection of tabs and tab lifecycle

### **✅ Responsibilities (OWNS)**

| State Property | Type             | Description                  |
| -------------- | ---------------- | ---------------------------- |
| `tabs`         | `Tab[]`          | Array of all open tabs       |
| `activeTabId`  | `string \| null` | ID of currently selected tab |
| `tabOrder`     | `string[]`       | Display order of tabs        |

**Tab Metadata Structure**:

```typescript
interface Tab {
  id: string; // Unique identifier
  name: string; // Display name
  path?: string; // File path (if saved)
  type: 'workflow' | 'template' | 'sample';
  created: Date;
  icon?: string;
}
```

### **✅ Methods (PROVIDES)**

```typescript
interface WorkflowTabsHook {
  // Tab Lifecycle
  createTab(name: string, type?: TabType): Tab;
  closeTab(tabId: string): void;
  duplicateTab(tabId: string): Tab;

  // Tab Selection
  switchTab(tabId: string): void;

  // Tab Management
  renameTab(tabId: string, newName: string): void;
  reorderTabs(newOrder: string[]): void;

  // File Operations
  loadUMLFiles(files: FileList): Promise<Tab[]>;
  saveTab(tabId: string, path?: string): Promise<void>;
  exportTab(tabId: string, format: ExportFormat): Promise<void>;

  // Bulk Operations
  closeAllTabs(): void;
  closeOtherTabs(keepTabId: string): void;
  saveAllTabs(): Promise<void>;

  // Sample/Template Management
  createSampleTab(sampleType: string): Tab;
  loadTemplate(templateId: string): Tab;
}
```

### **✅ Storage Location**

**localStorage Key**: `workflow-tabs-registry`

**Storage Format**:

```json
{
  "tabs": [
    { "id": "tab-1", "name": "Workflow 1", "path": "/path/file.puml", "type": "workflow" },
    { "id": "tab-2", "name": "Sample Flow", "type": "sample" }
  ],
  "activeTabId": "tab-1",
  "tabOrder": ["tab-1", "tab-2"]
}
```

### **❌ NOT Responsible For**

- Tab content (PlantUML source, visual nodes/edges)
- View mode (source vs visual)
- Modified/dirty state of tab content
- Canvas state (zoom, pan, viewport)
- PlantUML ↔ Visual conversion

---

## 🔑 Parent Components

**Examples**: App.tsx, WorkflowTabs.tsx, SourceEditor.tsx

### **✅ Responsibilities (COORDINATES)**

| Responsibility             | Description                              | Implementation                      |
| -------------------------- | ---------------------------------------- | ----------------------------------- |
| **User Actions**           | Handle button clicks, keyboard shortcuts | Event handlers delegate to hooks    |
| **UI Rendering**           | Display tab bar, canvas, editor          | Read state from hooks (never write) |
| **Error Handling**         | Show notifications, error modals         | Wrap hook calls in try/catch        |
| **Component Coordination** | Sync multiple components                 | Pass callbacks, trigger refreshes   |
| **Feature Flags**          | Enable/disable features                  | Check flags before hook operations  |

### **✅ Methods (UI ACTIONS)**

```typescript
// Example: Parent component handlers
const handleUserClickViewToggle = () => {
  const tabState = useTabState(activeTabId, ...);

  if (tabState.state.activeView === 'visual') {
    tabState.switchToSource();
  } else {
    tabState.switchToVisual();
  }

  // Show notification
  showNotification('View switched');
};

const handleUserClickSave = async () => {
  const tabState = useTabState(activeTabId, ...);
  const tabsHook = useWorkflowTabs();

  try {
    // Save file metadata (useWorkflowTabs owns this)
    await tabsHook.saveTab(activeTabId);

    // Mark content as saved (useTabState owns this)
    tabState.markSaved();

    showNotification('Saved successfully');
  } catch (error) {
    showError('Save failed', error);
  }
};
```

### **❌ NOT Responsible For**

- Directly writing to localStorage
- Managing state persistence logic
- PlantUML parsing/generation
- Canvas state management
- Tab metadata updates

---

## 🔄 Data Flow Patterns

### **Pattern 1: User Toggles View**

```
User clicks "Source View" button
    ↓
Parent: handleViewModeChange()
    ↓
useTabState: switchToSource()
    ↓
    ├─ Get current visual state (nodes, edges)
    ├─ Convert to PlantUML using converter
    ├─ Update sourceState
    ├─ Set activeView = 'source'
    └─ Save to localStorage (tab-state-${tabId})
    ↓
Parent: Re-renders with new view
```

### **Pattern 2: User Edits PlantUML**

```
User types in SourceEditor
    ↓
Parent: onChange(content)
    ↓
useTabState: updateSourceState(content)
    ↓
    ├─ Update sourceState property
    ├─ Set modified = true
    └─ Save to localStorage
    ↓
Parent: Save button becomes enabled (detects modified flag)
```

### **Pattern 3: User Switches Tabs**

```
User clicks tab "Workflow 2"
    ↓
Parent: handleTabClick(tabId)
    ↓
useWorkflowTabs: switchTab(tabId)
    ↓
    ├─ Update activeTabId
    └─ Save to localStorage (workflow-tabs-registry)
    ↓
Parent: Re-renders with new activeTabId
    ↓
useTabState: Hook reinitializes for new tabId
    ↓
    ├─ Load tab-state-${newTabId} from localStorage
    └─ Return state for new tab
    ↓
Parent: Displays new tab's content
```

### **Pattern 4: User Saves Tab**

```
User clicks "Save" button
    ↓
Parent: handleSave()
    ↓
useWorkflowTabs: saveTab(tabId, path)
    ↓
    ├─ Get tab metadata from tabs array
    ├─ Write file to disk (if path provided)
    ├─ Update tab.path in tabs array
    └─ Save tabs registry to localStorage
    ↓
useTabState: markSaved()
    ↓
    ├─ Set modified = false
    ├─ Update lastSaved timestamp
    └─ Save tab state to localStorage
    ↓
Parent: Show "Saved successfully" notification
```

---

## ⚠️ Anti-Patterns (DO NOT DO)

### **❌ Cross-Hook Writes**

```typescript
// WRONG: useWorkflowTabs trying to update tab content
const switchTab = (tabId: string) => {
  setActiveTabId(tabId);

  // ❌ NEVER DO THIS - useTabState owns content
  localStorage.setItem(
    `tab-state-${tabId}`,
    JSON.stringify({
      activeView: 'visual',
    }),
  );
};

// CORRECT: Let useTabState manage its own state
const switchTab = (tabId: string) => {
  setActiveTabId(tabId);
  // useTabState hook will automatically load state for new tab
};
```

### **❌ Parent Components Writing State**

```typescript
// WRONG: Parent bypassing hooks
const handleViewChange = (sourceView: boolean) => {
  // ❌ NEVER DO THIS - bypasses single source of truth
  localStorage.setItem(`puml-content-${tabId}`, content);
  setIsSourceView(sourceView);
};

// CORRECT: Delegate to hook
const handleViewChange = (sourceView: boolean) => {
  const newView = sourceView ? 'source' : 'visual';
  tabState.switchView(newView);
};
```

### **❌ Duplicate State in Parent**

```typescript
// WRONG: Parent maintaining duplicate state
const [isSourceView, setIsSourceView] = useState(false);  // ❌
const tabState = useTabState(tabId, ...);

// Now have TWO sources of truth - will get out of sync!

// CORRECT: Read from hook, never duplicate
const tabState = useTabState(tabId, ...);
const isSourceView = tabState.state.activeView === 'source';  // ✅
```

### **❌ Direct localStorage Access**

```typescript
// WRONG: Component reading localStorage directly
const content = localStorage.getItem(`puml-content-${tabId}`); // ❌

// CORRECT: Read from hook
const content = tabState.state.sourceState; // ✅
```

---

## 🧪 Conflict Resolution Matrix

**From Phase 5 Audit - 4 Critical Conflicts Identified**

| Conflict                      | Current Problem                          | Resolution                                                 | Owner              |
| ----------------------------- | ---------------------------------------- | ---------------------------------------------------------- | ------------------ |
| **Duplicate Storage Keys**    | Both hooks write `puml-content-${tabId}` | ONLY `useTabState` writes content                          | `useTabState`      |
| **No Single Source of Truth** | State in 3 places (hooks + localStorage) | Hook state IS the truth, localStorage is persistence layer | `useTabState`      |
| **Tab Switching Duplication** | Two independent switching mechanisms     | ONLY `useWorkflowTabs` manages active tab                  | `useWorkflowTabs`  |
| **Save Logic Conflicts**      | Multiple save paths for same data        | `useWorkflowTabs` saves file, `useTabState` marks clean    | Both (coordinated) |

---

## 📋 Responsibility Checklist

Use this checklist during Phase 9 refactoring:

### **For useTabState Integration:**

- [ ] Content updates go through `updateSourceState()` or `updateVisualState()`
- [ ] View switching uses `switchView()` or convenience methods
- [ ] Modified state checked via `tabState.state.modified`
- [ ] No direct localStorage reads/writes for content
- [ ] Parent components read `tabState.state.*` properties (never set)

### **For useWorkflowTabs Integration:**

- [ ] Tab creation uses `createTab()`
- [ ] Tab switching uses `switchTab()`
- [ ] Tab metadata updates go through hook methods
- [ ] File operations use `saveTab()`, `loadUMLFiles()`, `exportTab()`
- [ ] No direct manipulation of tabs array

### **For Parent Components:**

- [ ] UI event handlers delegate to appropriate hook
- [ ] No duplicate state variables (isSourceView, content, etc.)
- [ ] Error handling wraps hook calls
- [ ] Notifications shown after hook operations complete
- [ ] Feature flags checked before hook usage

---

## 🎯 Phase 9 Integration Strategy

**Based on these boundaries, Phase 9 will follow this approach:**

### **Step 1: Identify localStorage Operations** (30 min)

- Scan WorkflowTabs.tsx for all localStorage calls
- Categorize: content (useTabState) vs metadata (useWorkflowTabs)

### **Step 2: Replace Content Operations** (1.5 hours)

- Replace `localStorage.getItem('puml-content-*')` with `tabState.state.sourceState`
- Replace `localStorage.setItem('puml-content-*')` with `tabState.updateSourceState()`
- Remove duplicate isSourceView state

### **Step 3: Delegate View Switching** (1 hour)

- Replace manual view toggle with `tabState.switchToSource()` / `switchToVisual()`
- Remove inline PlantUML conversion code
- Add error handling

### **Step 4: Update Tab Operations** (45 min)

- Ensure `switchTab()` only changes activeTabId
- Update `saveTab()` to coordinate both hooks
- Update `closeTab()` to clean up both hook states

### **Step 5: Create Parent Coordination Layer** (45 min)

- Build UI handlers that delegate correctly
- Add error boundaries
- Implement notifications

### **Step 6: Cleanup & Testing** (45 min)

- Remove all direct localStorage calls
- Remove duplicate state variables
- Test all 37 requirements

**Total Estimated Time**: 4.75 hours

---

## ✅ Success Criteria

After Phase 9 integration:

- [ ] Zero direct localStorage calls in WorkflowTabs.tsx
- [ ] All state ownership follows this document's rules
- [ ] No duplicate state variables in parent components
- [ ] Clear separation: metadata (useWorkflowTabs) vs content (useTabState)
- [ ] All 4 Phase 5 conflicts resolved
- [ ] Integration checklist 100% complete

---

## 📚 References

- **Phase 5 Audit**: TASK-002-PHASE5-AUDIT.md (Conflict analysis)
- **Integration Plan**: TASK-002-INTEGRATION-PLAN.md (Original strategy)
- **Hook Source**: src/features/tabs/hooks/useTabState.ts (481 lines)
- **Target Component**: src/features/tabs/components/WorkflowTabs.tsx (932 lines)

---

**Document Status**: ✅ Complete  
**Phase 8 Duration**: 1 hour  
**Next Phase**: Phase 9 - Execute WorkflowTabs Integration (4.75 hours)

---

_Generated by AI-LEY Builder Development Agent_  
_Task: TASK-002 Phase 8 - Clarify Hook Responsibilities_  
_Completion Date: October 19, 2025_
