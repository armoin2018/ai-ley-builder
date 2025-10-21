# TASK-010: QA Testing Guide
**Date**: October 20, 2025  
**Status**: Manual Testing Required  
**Environment**: Development Mode (localhost:5173)

---

## Executive Summary

TASK-010 (QA Testing) has been **prepared for manual execution**. The development server is running at **http://localhost:5173** and ready for comprehensive quality assurance testing.

**Critical Note**: Production build testing is **BLOCKED** due to 167 TypeScript compilation errors (documented in TASK-006-STATUS.md). This QA testing will be performed in **development mode only**.

---

## Testing Environment Setup

### ✅ Server Status

- **Development Server**: Running at http://localhost:5173
- **Port**: 5173
- **Mode**: Development (with HMR, source maps, React dev tools)
- **Browser**: Simple Browser opened

### ⚠️ Limitations

**Cannot Test** (Production Build Required):
- Production bundle performance
- Production build optimizations
- Production Lighthouse audit
- Minified code behavior
- Tree-shaking effects
- Production error boundaries

**Can Test** (Development Mode):
- All functional features
- User interactions
- R19 flexible connections
- Performance Dashboard (dev metrics)
- Browser compatibility (dev mode)
- Accessibility features
- User experience flows

---

## QA Test Plan

### Test Category 1: End-to-End Workflow Testing

**Estimated Time**: 90 minutes  
**Status**: Manual testing required

#### Test Scenarios

**1.1 Create New Workflow**
- [ ] Open application at http://localhost:5173
- [ ] Verify canvas loads without errors
- [ ] Check console for warnings/errors
- [ ] Verify all UI panels visible (Canvas, Palette, Inspector, Settings)

**1.2 Add Nodes to Canvas**
- [ ] Drag 10+ nodes from palette to canvas
- [ ] Test different node types: AI Agent, HTTP Request, Script, Conditional, etc.
- [ ] Verify nodes render correctly
- [ ] Check node positioning is accurate
- [ ] Verify node labels are readable

**1.3 Create Connections**
- [ ] Connect nodes using drag-and-drop handles
- [ ] Create at least 10 connections
- [ ] Verify connections render correctly
- [ ] Test connection deletion (select and press Delete)
- [ ] Verify edge routing is clean

**1.4 Edit Node Properties**
- [ ] Select individual nodes
- [ ] Verify Inspector panel updates with node properties
- [ ] Edit properties (text, numbers, selections)
- [ ] Verify changes are reflected in nodes
- [ ] Test property validation (if any)

**1.5 Test Auto-Layout**
- [ ] Create complex workflow (20+ nodes)
- [ ] Click auto-layout button (if available)
- [ ] Verify nodes are arranged logically
- [ ] Check for node overlaps (should be none)
- [ ] Verify connections remain intact

**1.6 Workflow Persistence**
- [ ] Save workflow (File → Save or Cmd+S)
- [ ] Note workflow name/location
- [ ] Close and reload application
- [ ] Load saved workflow (File → Open)
- [ ] Verify all nodes restored correctly
- [ ] Verify all connections restored correctly
- [ ] Check node properties are preserved

**1.7 Delete Operations**
- [ ] Select single node and delete (Delete key)
- [ ] Select multiple nodes (Shift+Click) and delete
- [ ] Verify connected edges are also deleted
- [ ] Test Undo (Cmd+Z) if available
- [ ] Test Redo (Cmd+Shift+Z) if available

**1.8 Canvas Operations**
- [ ] Pan canvas (click and drag background)
- [ ] Zoom in (mouse wheel up or pinch)
- [ ] Zoom out (mouse wheel down or pinch)
- [ ] Fit view (if button available)
- [ ] Test minimap (if available)

#### Expected Results

✅ **PASS Criteria**:
- All nodes can be added/deleted without errors
- Connections work smoothly
- Properties can be edited
- Workflows save and load correctly
- Canvas interactions are responsive

❌ **FAIL Criteria**:
- Application crashes
- Nodes don't render
- Connections fail to create
- Data loss on save/load
- Console errors during operations

#### Test Data

**Test Workflow Structure**:
```
Workflow Name: QA Test Workflow 1
Node Count: 15
Connections: 12
Node Types: 
  - 3x AI Agent nodes
  - 2x HTTP Request nodes
  - 2x Script nodes
  - 2x Conditional nodes
  - 2x Transform Data nodes
  - 2x Logger nodes
  - 2x Command Prompt File nodes
```

---

### Test Category 2: R19 Flexible Connection Testing

**Estimated Time**: 45 minutes  
**Status**: Manual testing required

#### Test Scenarios

**2.1 Default Connection Behavior (Backward Compatibility)**
- [ ] Add standard nodes (AI Agent, HTTP Request)
- [ ] Verify default handles appear (top input, bottom output)
- [ ] Create connections using defaults
- [ ] Verify connections work as expected
- [ ] Check Position.Top and Position.Bottom alignment

**2.2 Multiple Input Positions**
- [ ] Find CommandPromptFileNode or similar with multiple inputs
- [ ] Verify node shows multiple input handles
- [ ] Test connecting to each input handle
- [ ] Verify handles are positioned correctly (top + left)
- [ ] Check handle labels/IDs if present

**2.3 Multiple Output Positions**
- [ ] Find CommandPromptFileNode or similar with multiple outputs
- [ ] Verify node shows multiple output handles
- [ ] Test connecting from each output handle
- [ ] Verify handles are positioned correctly (bottom + right)
- [ ] Check handle labels/IDs if present

**2.4 Advanced HandleConfig Testing**
- [ ] Test node with custom handleConfig (if available)
- [ ] Verify handle IDs are unique
- [ ] Verify handle positions match config
- [ ] Test handle styling (className)
- [ ] Verify custom labels display correctly

**2.5 Connection Patterns (from connection-patterns.md)**
- [ ] Test Linear Flow (A → B → C)
- [ ] Test Branching (A → B, A → C)
- [ ] Test Merging (A → C, B → C)
- [ ] Test Conditional (A → B [condition], A → C [else])
- [ ] Test Parallel (A → B, A → C, B → D, C → D)
- [ ] Test Loop (A → B → C → A)

**2.6 Edge Cases**
- [ ] Test node with no handles (should use defaults)
- [ ] Test node with only inputs or only outputs
- [ ] Test mixed configurations in same workflow
- [ ] Verify backward compatibility with old workflows

#### Expected Results

✅ **PASS Criteria**:
- Multiple handles render correctly
- All connection patterns work
- Handle positions match specifications
- Backward compatibility maintained
- R19 features match documentation

❌ **FAIL Criteria**:
- Handles don't appear
- Connections fail with multiple handles
- Handle positions incorrect
- Breaking changes to old workflows

---

### Test Category 3: Performance Dashboard Testing

**Estimated Time**: 30 minutes  
**Status**: Manual testing required

#### Test Scenarios

**3.1 Open Performance Dashboard**
- [ ] Press `⌘⇧M` (Mac) or `Ctrl+Shift+M` (Windows/Linux)
- [ ] Verify Performance Dashboard opens
- [ ] Check dashboard UI renders correctly
- [ ] Verify all sections visible (metrics, controls, charts)

**3.2 Start Profiling**
- [ ] Click "Start Profiling" button
- [ ] Perform workflow operations (add nodes, connections, pan/zoom)
- [ ] Verify profiler is collecting data
- [ ] Check for performance metrics display

**3.3 Stop Profiling**
- [ ] Click "Stop Profiling" button
- [ ] Verify metrics are displayed:
  - Component render counts
  - Average render duration
  - Total render time
  - Slowest renders
- [ ] Check for any renders > 16ms (slower than 60fps)

**3.4 Profiler Metrics**
- [ ] Verify FlowCanvas metrics collected
- [ ] Verify InspectorPanel metrics collected
- [ ] Verify NodePalette metrics collected
- [ ] Check component render counts are reasonable
- [ ] Verify phase information (mount vs update)

**3.5 Export Functionality**
- [ ] Click "Export" button (if available)
- [ ] Verify JSON/CSV export options
- [ ] Export metrics data
- [ ] Verify exported file contains correct data

**3.6 Dashboard Features**
- [ ] Test filtering by component name
- [ ] Test sorting metrics (by duration, count, etc.)
- [ ] Test clearing profiler data
- [ ] Close dashboard (⌘⇧M again or close button)

#### Expected Results

✅ **PASS Criteria**:
- Dashboard opens with keyboard shortcut
- Profiling starts/stops successfully
- Metrics are collected and displayed
- Export functionality works
- No performance degradation during profiling

❌ **FAIL Criteria**:
- Dashboard doesn't open
- Profiler doesn't collect data
- Metrics are incorrect/missing
- Export fails
- App becomes unresponsive

#### Performance Targets (Development Mode)

**Note**: Development mode is inherently slower than production. These targets are relaxed:

- **First Contentful Paint**: < 3000ms (dev mode)
- **Time to Interactive**: < 5000ms (dev mode)
- **Component Render Time**: < 50ms per render (dev mode)
- **Frame Rate**: ≥ 30 FPS during interactions (dev mode)

Production targets (when build is fixed):
- FCP < 2000ms
- TTI < 3500ms
- Render < 16ms
- FPS ≥ 60

---

### Test Category 4: Browser Compatibility Testing

**Estimated Time**: 60 minutes  
**Status**: Manual testing required

#### Test Scenarios

**4.1 Chrome (Latest)**
- [ ] Open http://localhost:5173 in Chrome
- [ ] Test all workflow operations
- [ ] Check console for errors
- [ ] Verify R19 connections work
- [ ] Test Performance Dashboard
- [ ] Note any Chrome-specific issues

**4.2 Firefox (Latest)**
- [ ] Open http://localhost:5173 in Firefox
- [ ] Test all workflow operations
- [ ] Check console for errors
- [ ] Verify R19 connections work
- [ ] Test Performance Dashboard
- [ ] Compare behavior to Chrome
- [ ] Note any Firefox-specific issues

**4.3 Safari (Latest)**
- [ ] Open http://localhost:5173 in Safari
- [ ] Test all workflow operations
- [ ] Check console for errors
- [ ] Verify R19 connections work
- [ ] Test Performance Dashboard
- [ ] Compare behavior to Chrome/Firefox
- [ ] Note any Safari-specific issues

**4.4 Cross-Browser Consistency**
- [ ] Compare UI rendering across browsers
- [ ] Verify keyboard shortcuts work in all browsers
- [ ] Check drag-and-drop in all browsers
- [ ] Verify connection rendering is consistent
- [ ] Test save/load in each browser

#### Expected Results

✅ **PASS Criteria**:
- All features work in all tested browsers
- UI renders consistently
- No browser-specific crashes
- Performance is acceptable in all browsers
- Minor visual differences acceptable

❌ **FAIL Criteria**:
- Features broken in any browser
- Significant visual inconsistencies
- Browser-specific crashes
- Major performance differences

#### Browser Testing Matrix

| Feature | Chrome | Firefox | Safari | Notes |
|---------|--------|---------|--------|-------|
| Canvas Rendering | [ ] | [ ] | [ ] | |
| Node Drag/Drop | [ ] | [ ] | [ ] | |
| Connection Creation | [ ] | [ ] | [ ] | |
| R19 Multiple Handles | [ ] | [ ] | [ ] | |
| Performance Dashboard | [ ] | [ ] | [ ] | |
| Keyboard Shortcuts | [ ] | [ ] | [ ] | |
| Save/Load Workflows | [ ] | [ ] | [ ] | |
| Auto-Layout | [ ] | [ ] | [ ] | |

---

### Test Category 5: Accessibility Validation

**Estimated Time**: 45 minutes  
**Status**: Manual testing required

#### Test Scenarios

**5.1 Keyboard Navigation**
- [ ] Tab through all interactive elements
- [ ] Verify focus indicators visible
- [ ] Test Cmd/Ctrl+S (Save)
- [ ] Test Cmd/Ctrl+O (Open)
- [ ] Test Cmd/Ctrl+Z (Undo)
- [ ] Test Cmd/Ctrl+Shift+Z (Redo)
- [ ] Test Delete key (delete nodes)
- [ ] Test ⌘⇧M (Performance Dashboard)
- [ ] Test Escape key (cancel operations)

**5.2 Focus Management**
- [ ] Verify focus moves logically through UI
- [ ] Check focus visible on all elements
- [ ] Test focus trap in modals (if any)
- [ ] Verify focus returns after modal close
- [ ] Test keyboard-only workflow creation

**5.3 ARIA Labels**
- [ ] Inspect nodes with browser dev tools
- [ ] Verify buttons have aria-label
- [ ] Check icons have aria-hidden or aria-label
- [ ] Verify form inputs have labels
- [ ] Check for role attributes on custom components

**5.4 Color Contrast**
- [ ] Test with browser accessibility checker
- [ ] Verify text meets WCAG 2.1 AA contrast (4.5:1)
- [ ] Check button text contrast
- [ ] Verify icon contrast
- [ ] Test different themes (if available)

**5.5 Screen Reader Compatibility (Optional)**
- [ ] Test with VoiceOver (Mac) or NVDA (Windows)
- [ ] Verify nodes are announced correctly
- [ ] Check connections are described
- [ ] Verify form labels are read
- [ ] Test navigation with screen reader

#### Expected Results

✅ **PASS Criteria**:
- All interactive elements keyboard accessible
- Focus indicators visible
- ARIA labels present and accurate
- Color contrast meets WCAG 2.1 AA
- Basic screen reader support

❌ **FAIL Criteria**:
- Keyboard navigation broken
- Focus indicators missing
- ARIA labels missing or incorrect
- Color contrast fails WCAG 2.1 AA
- Screen reader cannot navigate

---

### Test Category 6: User Experience Validation

**Estimated Time**: 30 minutes  
**Status**: Manual testing required

#### Test Scenarios

**6.1 Drag-and-Drop Smoothness**
- [ ] Drag nodes from palette to canvas
- [ ] Verify smooth dragging (no jank)
- [ ] Test dragging multiple nodes
- [ ] Verify drop position accurate
- [ ] Check for visual lag

**6.2 Visual Feedback**
- [ ] Hover over nodes (hover state visible?)
- [ ] Select nodes (selection state clear?)
- [ ] Hover over connections (highlight?)
- [ ] Click buttons (click feedback visible?)
- [ ] Test loading states (if any)

**6.3 Error Messages**
- [ ] Trigger validation errors (if possible)
- [ ] Verify error messages are clear
- [ ] Check error message placement
- [ ] Test error recovery
- [ ] Verify error messages dismissible

**6.4 Loading States**
- [ ] Trigger slow operations (large workflow load)
- [ ] Verify loading indicators appear
- [ ] Check loading messages are clear
- [ ] Verify app remains responsive
- [ ] Test loading state cancellation (if available)

**6.5 Responsive Design**
- [ ] Resize browser window (smaller)
- [ ] Verify UI adapts appropriately
- [ ] Check for horizontal scrollbar
- [ ] Test at 1024px width (laptop)
- [ ] Test at 1920px width (desktop)
- [ ] Verify panels resize/collapse gracefully

**6.6 Overall UX**
- [ ] Rate overall user experience (1-10)
- [ ] Note any confusing UI elements
- [ ] Identify any unexpected behaviors
- [ ] List any missing features
- [ ] Suggest UX improvements

#### Expected Results

✅ **PASS Criteria**:
- Drag-and-drop is smooth (no visible lag)
- Visual feedback is clear and immediate
- Error messages are helpful
- Loading states provide feedback
- Responsive design works at common resolutions
- Overall UX is intuitive

❌ **FAIL Criteria**:
- Drag-and-drop is laggy or broken
- Visual feedback missing or unclear
- Error messages confusing or missing
- No loading indicators
- UI breaks at common resolutions
- Major UX issues

---

## Test Execution Instructions

### Before Starting

1. **Clear Browser Cache**: Ensure clean testing environment
2. **Open Browser DevTools**: Console tab visible for errors
3. **Prepare Test Data**: Have test workflow structure ready
4. **Time Tracking**: Note start time for each category
5. **Screen Recording**: Optional but recommended for bug reports

### During Testing

1. **Document Everything**:
   - Screenshot issues
   - Copy console errors
   - Note steps to reproduce bugs
   - Record performance metrics

2. **Use Checklist**:
   - Mark each test item as [ ] → [x] when completed
   - Add notes for failures
   - Skip unavailable features

3. **Track Time**:
   - Note actual time vs. estimated time
   - Identify time-consuming areas

### After Testing

1. **Compile Results**:
   - Count PASS vs. FAIL items
   - Categorize bugs by severity
   - List all issues found

2. **Create Bug Reports**:
   - Clear titles
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots/videos

3. **Document Limitations**:
   - Note production testing blockers
   - Identify manual testing requirements
   - Suggest automated test coverage

---

## Test Result Template

```markdown
### Test Category: [Name]
**Tester**: [Your Name]
**Date**: [Date]
**Duration**: [Actual Time]
**Browser**: [Chrome/Firefox/Safari + Version]

#### Results Summary
- Tests Executed: X
- Tests Passed: Y
- Tests Failed: Z
- Tests Blocked: W

#### Issues Found
1. **Issue Title**
   - Severity: [Critical/High/Medium/Low]
   - Steps to Reproduce: ...
   - Expected: ...
   - Actual: ...
   - Screenshot: ...

#### Notes
- [Any additional observations]
```

---

## Bug Severity Levels

**Critical** 🔴:
- Application crashes
- Data loss
- Security vulnerabilities
- Core features completely broken

**High** 🟠:
- Major features partially broken
- Significant UX issues
- Performance problems
- Accessibility failures

**Medium** 🟡:
- Minor feature issues
- Visual inconsistencies
- Edge case failures
- Non-critical UX issues

**Low** 🟢:
- Cosmetic issues
- Minor visual inconsistencies
- Nice-to-have improvements
- Documentation issues

---

## Known Limitations (Development Mode Testing)

### Cannot Verify

1. **Production Build Performance**
   - Blocked by 167 TypeScript errors
   - Cannot test minified bundle
   - Cannot run production Lighthouse audit
   - Cannot measure true production metrics

2. **Build Optimization Effects**
   - Tree-shaking
   - Code splitting
   - Bundle size optimization
   - Production error boundaries

3. **Production-Specific Features**
   - Service workers (if any)
   - Production analytics
   - Production error reporting
   - CDN behavior

### Workarounds

1. **Performance Testing**:
   - Test in dev mode with Performance Dashboard
   - Document dev mode metrics separately
   - Note: "Production testing pending TASK-011 completion"

2. **Lighthouse Audit**:
   - Skip local Lighthouse testing
   - Note: "Lighthouse CI configured, awaits production build"
   - CI/CD will run automatically when build is fixed

3. **Bundle Analysis**:
   - Skip bundle size testing
   - Note: "Bundle analysis pending production build"

---

## Next Steps After Manual Testing

1. **Complete Test Checklist**:
   - Mark all items as tested
   - Document all issues found
   - Create bug reports

2. **Create TASK-010-COMPLETE.md**:
   - Summary of test results
   - List of issues found
   - Production testing limitations
   - Recommendations

3. **Update Story-001 Progress**:
   - Mark TASK-010 as complete (dev mode)
   - Update Story-001 to 90%
   - Note remaining work (TASK-011, TASK-006 Phase 3)

4. **Create TASK-011**:
   - Title: "Fix TypeScript Compilation Errors"
   - Scope: 167 errors from TASK-006-STATUS.md
   - Estimated: 3.5 hours
   - Priority: HIGH (blocks production)

5. **Update RUN-NEXT-REPORT.md**:
   - Document TASK-010 completion
   - Update project status
   - Update timeline projections

---

## Conclusion

This QA Testing Guide provides comprehensive test coverage for TASK-010. Manual testing is required for all categories.

**Testing Status**: Ready for manual execution  
**Environment**: Development mode at http://localhost:5173  
**Estimated Total Time**: 4-6 hours manual testing  
**Production Testing**: BLOCKED (awaiting TASK-011)

**Guide Created**: October 20, 2025 2:15 PM  
**Author**: AI-Ley Agent  
**Related Tasks**: TASK-010, TASK-006, TASK-011

---

**Ready to Begin Testing!** 🚀
