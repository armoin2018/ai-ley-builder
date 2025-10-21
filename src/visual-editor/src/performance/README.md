# Performance Monitoring

Comprehensive performance monitoring and profiling system for the AI-LEY Visual Flow Editor.

## Overview

This module provides real-time performance monitoring, profiling, and analysis capabilities to ensure the application remains fast and responsive.

## Features

- **React Profiler Integration**: Automatic component render time tracking
- **Core Web Vitals Monitoring**: FCP, LCP, TTI, CLS measurements
- **Memory Tracking**: JS heap size and memory leak detection
- **Interaction Profiling**: Track user interaction response times
- **Performance Dashboard**: Visual UI for metrics and recommendations
- **Lighthouse CI**: Automated performance testing in CI/CD pipeline
- **Performance Budgets**: Enforced resource and timing budgets

## Quick Start

### View Performance Dashboard

```bash
# Start the dev server
npm run dev

# Open the application
# Press Cmd+Shift+M (or Ctrl+Shift+M on Windows/Linux)
# Or use Command Palette: "Performance Dashboard"
```

### Run Lighthouse Locally

```bash
# Quick test (requires build first)
npm run lighthouse:local

# Or run manually
npm run build
npm run preview
# In another terminal:
npx @lhci/cli autorun
```

### Export Performance Data

1. Open Performance Dashboard (Cmd+Shift+M)
2. Interact with the application to collect metrics
3. Click "Export" button to download JSON report

## Architecture

### Components

#### `ProfilerWrapper.tsx`
React component that wraps sections of the app with React Profiler API.

```tsx
import { ProfilerWrapper } from './performance';

function MyComponent() {
  return (
    <ProfilerWrapper id="MyComponent">
      {/* Your component tree */}
    </ProfilerWrapper>
  );
}
```

#### `usePerformanceMonitor.ts`
Custom hook for performance monitoring and analysis.

```tsx
import { usePerformanceMonitor } from './performance';

function MyComponent() {
  const {
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    generateReport,
    exportData,
  } = usePerformanceMonitor();

  // Use monitoring features
}
```

#### `PerformanceDashboard.tsx`
Interactive dashboard for viewing metrics and recommendations.

```tsx
import { PerformanceDashboard } from './performance';

<PerformanceDashboard
  isOpen={isOpen}
  onClose={handleClose}
/>
```

### Data Collection

Performance data is collected automatically when the app is wrapped with `ProfilerWrapper`:

- **Component Renders**: Every component render is tracked with timing
- **Snapshots**: Taken every 10 seconds while monitoring is active
- **Interactions**: Tracked when using `trackInteraction()` helper
- **Web Vitals**: Collected using Performance Observer API
- **Memory**: Tracked using `performance.memory` API (Chrome only)

## Performance Budgets

See [PERFORMANCE-BUDGETS.md](./PERFORMANCE-BUDGETS.md) for detailed budget definitions.

### Key Targets

- **FCP**: < 1.8s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **Component Render**: < 16ms (60 FPS)
- **Bundle Size**: < 2 MB total

## CI/CD Integration

Lighthouse CI runs automatically on:
- Every push to `main` or `develop`
- Every pull request

### Workflow

1. Build the application
2. Start preview server
3. Run Lighthouse (3 runs, median taken)
4. Upload results as artifacts
5. Comment on PR with results
6. Fail build if budgets exceeded

See [.github/workflows/performance.yml](../../.github/workflows/performance.yml)

## API Reference

### ProfilerWrapper

```tsx
interface ProfilerWrapperProps {
  id: string;              // Unique identifier
  children: ReactNode;     // Components to profile
  onData?: (metrics: ComponentMetrics) => void;  // Callback
  enabled?: boolean;       // Enable/disable profiling
}
```

### usePerformanceMonitor

```tsx
interface UsePerformanceMonitorReturn {
  // State
  isMonitoring: boolean;
  snapshots: PerformanceSnapshot[];
  snapshotCount: number;

  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  createSnapshot: () => PerformanceSnapshot | null;
  trackInteraction: (type, target) => () => void;
  clearData: () => void;

  // Analysis
  generateReport: () => PerformanceReport;
  exportData: () => string;
  getSlowestComponents: () => Array<SlowComponent>;
  getComponentMetrics: (name: string) => ComponentMetrics[];
}
```

### usePerformanceStore

```tsx
const {
  getMetrics,              // Get all collected metrics
  getComponentMetrics,     // Get metrics for specific component
  getAverageMetrics,       // Get average for component
  getSlowestComponents,    // Get top slowest components
  clear,                   // Clear all data
  subscribe,               // Subscribe to new metrics
} = usePerformanceStore();
```

## Types

All TypeScript types are exported from `./types.ts`:

- `CoreWebVitals`
- `ComponentMetrics`
- `InteractionMetrics`
- `MemoryMetrics`
- `PerformanceSnapshot`
- `PerformanceReport`
- `PerformanceConfig`

## Troubleshooting

### Performance Dashboard Not Opening

1. Check keyboard shortcut: Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows/Linux)
2. Try Command Palette: Cmd+Shift+P → "Performance Dashboard"
3. Check console for errors

### No Metrics Showing

1. Ensure app is wrapped with `ProfilerWrapper`
2. Interact with the app to generate render events
3. Wait for first snapshot (10 seconds)
4. Check that monitoring is started (green indicator)

### Lighthouse CI Failing

1. Check bundle size: `npm run build && du -sh dist`
2. Run locally: `npm run lighthouse:local`
3. Review budgets in `lighthouserc.js`
4. Check GitHub Actions logs for specific failures

### High Memory Usage

1. Open Performance Dashboard
2. Check memory metrics section
3. Look for growing heap size over time
4. Profile in Chrome DevTools for detailed analysis

## Best Practices

### 1. Profile Critical Paths

Wrap important sections with ProfilerWrapper:

```tsx
<ProfilerWrapper id="WorkflowCanvas">
  <Canvas />
</ProfilerWrapper>
```

### 2. Track User Interactions

Measure response times for important actions:

```tsx
const { trackInteraction } = usePerformanceMonitor();

function handleClick() {
  const endTracking = trackInteraction('click', 'save-button');
  
  // Perform action
  await saveWorkflow();
  
  endTracking(); // Records duration
}
```

### 3. Monitor in Development

Enable the dashboard during development to catch performance regressions early.

### 4. Review Recommendations

The dashboard provides automated recommendations based on thresholds. Act on high-priority items.

### 5. Export Reports

Export performance data before and after optimizations to measure impact.

## Resources

- [React Profiler API](https://react.dev/reference/react/Profiler)
- [Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance)

## Contributing

When adding new features:

1. Wrap new major components with `ProfilerWrapper`
2. Add performance tests if adding heavy computations
3. Check bundle impact: run `npm run build` before/after
4. Verify Lighthouse CI passes on your branch
5. Document any new performance considerations

---

**Maintainer**: AI-LEY Team  
**Last Updated**: October 19, 2025
