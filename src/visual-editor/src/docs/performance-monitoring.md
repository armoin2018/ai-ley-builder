# Performance Monitoring Guide

This guide explains how to use AI-Ley's performance monitoring tools to profile React components, measure render performance, and establish performance baselines.

## Table of Contents

- [Overview](#overview)
- [Performance Dashboard](#performance-dashboard)
- [React Profiler Integration](#react-profiler-integration)
- [Lighthouse CI Integration](#lighthouse-ci-integration)
- [Baseline Measurements](#baseline-measurements)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## Overview

AI-Ley includes comprehensive performance monitoring capabilities:

- **React Profiler**: Real-time component render tracking
- **Performance Dashboard**: Visual metrics and insights (⌘⇧M)
- **Lighthouse CI**: Automated performance auditing in CI/CD
- **Baseline Measurements**: Repeatable performance testing procedures

### Why Performance Monitoring?

- **Early Detection**: Catch performance regressions before production
- **Data-Driven**: Make optimization decisions based on real metrics
- **User Experience**: Ensure smooth interactions with visual flow editor
- **Scalability**: Verify performance with large, complex workflows

## Performance Dashboard

### Opening the Dashboard

**Keyboard Shortcut**: `⌘⇧M` (Mac) / `Ctrl+Shift+M` (Windows/Linux)

**Menu**: View → Performance Dashboard

### Dashboard Features

The Performance Dashboard provides:

1. **Component Render Metrics**
   - Render count per component
   - Average render duration
   - Total render time
   - Slowest renders

2. **Real-Time Profiling**
   - Start/stop profiling sessions
   - Filter by component name
   - Export metrics as JSON/CSV

3. **Historical Trends**
   - Compare sessions
   - Identify performance trends
   - Track optimization impact

4. **Visual Insights**
   - Flame graphs for render trees
   - Timeline view of interactions
   - Component hierarchy analysis

### Example Workflow

```bash
1. Open workflow in editor
2. Press ⌘⇧M to open Performance Dashboard
3. Click "Start Profiling"
4. Perform user actions (add nodes, connect, zoom)
5. Click "Stop Profiling"
6. Review metrics in dashboard
7. Export data for analysis
```

## React Profiler Integration

### ProfilerWrapper Component

The `ProfilerWrapper` component automatically tracks React component performance.

#### Basic Usage

```tsx
import { ProfilerWrapper } from '@/features/ui-common/components/ProfilerWrapper';

function MyComponent() {
  return (
    <ProfilerWrapper id="MyComponent" disabled={!isDevelopment}>
      <div>Your component content</div>
    </ProfilerWrapper>
  );
}
```

#### Props

| Prop       | Type        | Default     | Description                     |
| ---------- | ----------- | ----------- | ------------------------------- |
| `id`       | `string`    | required    | Unique identifier for profiling |
| `children` | `ReactNode` | required    | Component tree to profile       |
| `disabled` | `boolean`   | `false`     | Disable profiling in production |
| `onRender` | `function`  | `undefined` | Custom callback for metrics     |

#### Advanced Usage

```tsx
<ProfilerWrapper
  id="FlowCanvas"
  onRender={(id, phase, actualDuration) => {
    if (actualDuration > 16) {
      // Slower than 60fps
      console.warn(`Slow render detected: ${id} took ${actualDuration}ms`);
      // Send to analytics, trigger alert, etc.
    }
  }}
>
  <ReactFlow nodes={nodes} edges={edges} />
</ProfilerWrapper>
```

### Where ProfilerWrapper is Used

Current implementations:

```tsx
// src/features/canvas/components/FlowCanvas.tsx
<ProfilerWrapper id="FlowCanvas">
  <ReactFlow ... />
</ProfilerWrapper>

// src/features/inspector/InspectorPanel.tsx
<ProfilerWrapper id="InspectorPanel">
  <PropertyEditor ... />
</ProfilerWrapper>

// src/features/palette/NodePalette.tsx
<ProfilerWrapper id="NodePalette">
  <PaletteItems ... />
</ProfilerWrapper>
```

### Profiler Phases

React Profiler tracks two render phases:

1. **mount**: First-time rendering (component initialization)
2. **update**: Re-renders (state/prop changes)

```tsx
onRender={(id, phase, actualDuration) => {
  if (phase === 'mount') {
    console.log(`${id} initial mount: ${actualDuration}ms`);
  } else {
    console.log(`${id} re-render: ${actualDuration}ms`);
  }
}}
```

## Lighthouse CI Integration

### What is Lighthouse CI?

Lighthouse CI runs Google Lighthouse performance audits automatically in your CI/CD pipeline, ensuring performance standards are maintained.

### Setup (Already Configured)

Lighthouse CI is configured via `.lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4173"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["warn", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "interactive": ["error", { "maxNumericValue": 3500 }]
      }
    }
  }
}
```

### Running Lighthouse CI Locally

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview

# In another terminal, run Lighthouse CI
npx lighthouse-ci autorun
```

### CI/CD Integration

Lighthouse CI runs automatically in GitHub Actions on every pull request:

```yaml
# .github/workflows/lighthouse-ci.yml (excerpt)
- name: Run Lighthouse CI
  run: |
    npm run build
    npm run lighthouse-ci
```

### Interpreting Results

Lighthouse CI checks:

- **Performance Score**: Must be ≥ 90%
- **Accessibility Score**: Warning if < 90%
- **First Contentful Paint**: Must be ≤ 2000ms
- **Time to Interactive**: Must be ≤ 3500ms

**Example Output**:

```
✅ Performance: 92 (target: ≥ 90)
✅ Accessibility: 94 (target: ≥ 90)
✅ First Contentful Paint: 1850ms (target: ≤ 2000ms)
❌ Time to Interactive: 3800ms (target: ≤ 3500ms) [FAILED]
```

### Performance Budgets

Lighthouse CI enforces performance budgets:

```json
"budgets": [
  {
    "resourceCounts": [
      {"resourceType": "script", "budget": 10},
      {"resourceType": "stylesheet", "budget": 5}
    ],
    "resourceSizes": [
      {"resourceType": "total", "budget": 500}
    ]
  }
]
```

## Baseline Measurements

### Purpose

Baseline measurements establish performance expectations for common workflows, enabling:

- Regression detection (is new code slower?)
- Optimization validation (did the fix work?)
- User experience guarantees (minimum performance level)

### TASK-006 Phase 3: Baseline Procedure

This procedure measures performance for typical visual editor workflows.

#### Prerequisites

1. **Clean Environment**
   - Fresh browser profile (no extensions)
   - Close other tabs/applications
   - Ensure system is idle (no background tasks)

2. **Test Data**
   - Use standardized test workflows (small, medium, large)
   - Consistent node counts and complexity

#### Measurement Process

**Step 1: Setup**

```bash
# Build and start dev server
npm run build
npm run preview

# Open browser in profiling mode
open -a "Google Chrome" --args --remote-debugging-port=9222
```

**Step 2: Profile Workflow Operations**

For each test workflow (small/medium/large):

1. **Load Workflow**
   - Open Performance Dashboard (⌘⇧M)
   - Click "Start Profiling"
   - Load workflow file
   - Wait for full render (2-3 seconds)
   - Click "Stop Profiling"
   - Record metrics: Initial Load Time, Node Count

2. **Add Nodes**
   - Start profiling
   - Drag 10 nodes from palette to canvas
   - Stop profiling
   - Record: Total Time, Avg Time per Node, Render Count

3. **Create Connections**
   - Start profiling
   - Connect 10 pairs of nodes
   - Stop profiling
   - Record: Total Time, Avg Time per Connection

4. **Pan & Zoom**
   - Start profiling
   - Pan canvas 5 times
   - Zoom in/out 5 times
   - Stop profiling
   - Record: Avg Pan Time, Avg Zoom Time, FPS

5. **Select & Edit**
   - Start profiling
   - Select 5 nodes sequentially
   - Edit properties for each
   - Stop profiling
   - Record: Selection Time, Inspector Render Time

**Step 3: Lighthouse Audit**

```bash
# Run full audit
npx lighthouse http://localhost:4173 \
  --output html \
  --output-path ./lighthouse-report.html \
  --only-categories=performance
```

**Step 4: Document Results**

Create baseline report:

```markdown
# Performance Baseline - [Date]

## Environment

- OS: macOS 14.0
- Browser: Chrome 120
- Hardware: Apple M1, 16GB RAM
- Node Version: 20.10.0

## Test Workflows

- Small: 10 nodes, 8 connections
- Medium: 50 nodes, 45 connections
- Large: 200 nodes, 180 connections

## Results

### Small Workflow

| Operation         | Time (ms) | FPS | Notes      |
| ----------------- | --------- | --- | ---------- |
| Initial Load      | 450       | 60  | Fast       |
| Add Node (avg)    | 12        | 60  | Smooth     |
| Create Connection | 8         | 60  | Instant    |
| Pan               | 10        | 60  | Fluid      |
| Zoom              | 15        | 60  | Responsive |

### Medium Workflow

...

### Lighthouse Scores

- Performance: 92
- FCP: 1.2s
- TTI: 2.8s
```

### Automated Baseline Collection

For repeated measurements, use the baseline script:

```bash
# Create baseline measurement
npm run test:performance:baseline

# Compare against baseline
npm run test:performance:compare
```

**Script Location**: `scripts/test_persona_performance.py` (adapted for canvas testing)

## Performance Optimization

### Common Bottlenecks

1. **Excessive Re-renders**
   - **Symptom**: Component renders too frequently
   - **Fix**: Use React.memo, useMemo, useCallback
   - **Example**:
     ```tsx
     const MemoizedNode = React.memo(CustomNode, (prev, next) => {
       return prev.data === next.data && prev.selected === next.selected;
     });
     ```

2. **Large Node Counts**
   - **Symptom**: Slow panning/zooming with 100+ nodes
   - **Fix**: Enable React Flow's viewport optimization
   - **Example**:
     ```tsx
     <ReactFlow
       nodesDraggable={true}
       elementsSelectable={true}
       onlyRenderVisibleElements={true} // Key optimization
     />
     ```

3. **Heavy Inspector Updates**
   - **Symptom**: Lag when selecting nodes
   - **Fix**: Debounce property updates
   - **Example**:
     ```tsx
     const debouncedUpdate = useMemo(() => debounce(value => onUpdate(value), 300), [onUpdate]);
     ```

4. **Unoptimized Connections**
   - **Symptom**: Slow connection creation/deletion
   - **Fix**: Use React Flow's edge update handlers efficiently
   - **Example**:
     ```tsx
     const onEdgesChange = useCallback(changes => {
       setEdges(eds => applyEdgeChanges(changes, eds));
     }, []);
     ```

### Optimization Checklist

Before releasing features:

- [ ] Profile with Performance Dashboard
- [ ] Check render counts (should be minimal)
- [ ] Verify 60 FPS during interactions
- [ ] Test with large workflows (200+ nodes)
- [ ] Run Lighthouse CI (score ≥ 90)
- [ ] Compare against baseline metrics
- [ ] Document any performance trade-offs

### Performance Best Practices

1. **Lazy Load Components**

   ```tsx
   const NodePalette = lazy(() => import('./NodePalette'));
   ```

2. **Virtualize Long Lists**

   ```tsx
   import { FixedSizeList } from 'react-window';
   ```

3. **Optimize React Flow**

   ```tsx
   <ReactFlow onlyRenderVisibleElements={true} nodesDraggable={true} zoomOnDoubleClick={false} />
   ```

4. **Use Web Workers for Heavy Computation**
   ```tsx
   const worker = new Worker('./layout.worker.ts');
   worker.postMessage({ nodes, edges });
   worker.onmessage = e => setLayout(e.data);
   ```

## Troubleshooting

### Issue: Performance Dashboard Not Opening

**Problem**: ⌘⇧M doesn't open dashboard

**Solutions**:

1. Check keyboard shortcut in settings
2. Try menu: View → Performance Dashboard
3. Verify component is imported in main app
4. Check browser console for errors

### Issue: ProfilerWrapper Not Collecting Data

**Problem**: No metrics appear in dashboard

**Solutions**:

1. Ensure `disabled={false}` in development
2. Check that `id` prop is unique
3. Verify React DevTools Profiler is enabled
4. Check Performance Dashboard is open

### Issue: Lighthouse CI Failing Locally

**Problem**: `npx lighthouse-ci autorun` fails

**Solutions**:

1. Ensure production build exists: `npm run build`
2. Verify preview server is running: `npm run preview`
3. Check port 4173 is not in use
4. Try manual Lighthouse: `npx lighthouse http://localhost:4173`

### Issue: Inconsistent Baseline Measurements

**Problem**: Results vary significantly between runs

**Solutions**:

1. Close all other applications
2. Use dedicated browser profile
3. Run multiple times and average results
4. Disable browser extensions
5. Ensure system is not under load

### Issue: Poor Performance Scores

**Problem**: Lighthouse score < 90 or slow interactions

**Investigation Steps**:

1. Run Performance Dashboard during slow operation
2. Identify components with high render counts
3. Check for unnecessary re-renders (React DevTools)
4. Profile with Chrome DevTools Performance tab
5. Review network waterfall for blocking resources

**Common Fixes**:

- Add React.memo to expensive components
- Use code splitting for large features
- Optimize images/assets
- Enable gzip/brotli compression
- Remove unused dependencies

---

## Further Reading

- [React Profiler API](https://react.dev/reference/react/Profiler)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [React Flow Performance](https://reactflow.dev/learn/troubleshooting/performance)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

**Last Updated**: October 20, 2025  
**Related Tasks**: TASK-006 (Performance Monitoring Implementation)
