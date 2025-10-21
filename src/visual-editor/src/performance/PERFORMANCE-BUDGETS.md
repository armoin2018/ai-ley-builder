# Performance Budgets

This document defines the performance budgets and thresholds for the AI-LEY Visual Flow Editor.

## Overview

Performance budgets help ensure the application remains fast and responsive as features are added. These budgets are enforced through Lighthouse CI in our build pipeline.

## Core Web Vitals Targets

Based on [Web Vitals](https://web.dev/vitals/) guidelines:

| Metric                             | Good    | Needs Improvement | Poor    | Our Target  |
| ---------------------------------- | ------- | ----------------- | ------- | ----------- |
| **First Contentful Paint (FCP)**   | < 1.8s  | 1.8s - 3.0s       | > 3.0s  | **< 1.8s**  |
| **Largest Contentful Paint (LCP)** | < 2.5s  | 2.5s - 4.0s       | > 4.0s  | **< 2.5s**  |
| **Cumulative Layout Shift (CLS)**  | < 0.1   | 0.1 - 0.25        | > 0.25  | **< 0.1**   |
| **Total Blocking Time (TBT)**      | < 200ms | 200ms - 600ms     | > 600ms | **< 200ms** |
| **Speed Index**                    | < 3.4s  | 3.4s - 5.8s       | > 5.8s  | **< 3.4s**  |
| **Time to Interactive (TTI)**      | < 3.8s  | 3.8s - 7.3s       | > 7.3s  | **< 3.8s**  |

## Lighthouse Score Targets

| Category       | Minimum Score | Target Score |
| -------------- | ------------- | ------------ |
| Performance    | 90            | 95+          |
| Accessibility  | 90            | 100          |
| Best Practices | 90            | 100          |
| SEO            | 90            | 100          |

## Resource Budgets

### JavaScript

| Resource      | Budget      | Current | Status       |
| ------------- | ----------- | ------- | ------------ |
| Total JS      | 500 KB      | TBD     | 🟡 Measuring |
| Main Bundle   | 200 KB      | TBD     | 🟡 Measuring |
| Vendor Bundle | 300 KB      | TBD     | 🟡 Measuring |
| Async Chunks  | 100 KB each | TBD     | 🟡 Measuring |

### CSS

| Resource     | Budget | Current | Status       |
| ------------ | ------ | ------- | ------------ |
| Total CSS    | 100 KB | TBD     | 🟡 Measuring |
| Critical CSS | 14 KB  | TBD     | 🟡 Measuring |

### Images

| Resource     | Budget | Current | Status       |
| ------------ | ------ | ------- | ------------ |
| Total Images | 500 KB | TBD     | 🟡 Measuring |
| Hero Image   | 50 KB  | N/A     | ✅ No hero   |
| Icons        | 20 KB  | TBD     | 🟡 Measuring |

### Total Page Weight

| Metric               | Budget      | Current | Status       |
| -------------------- | ----------- | ------- | ------------ |
| Total Transfer Size  | 2 MB        | TBD     | 🟡 Measuring |
| Total Resource Count | 50 requests | TBD     | 🟡 Measuring |

## Render Performance

### Component Render Times

| Threshold  | Target          |
| ---------- | --------------- |
| Good       | < 16ms (60 FPS) |
| Acceptable | < 50ms          |
| Poor       | > 50ms          |

### Interaction Response

| Interaction    | Target           |
| -------------- | ---------------- |
| Button Click   | < 100ms          |
| Drag & Drop    | < 16ms per frame |
| Input Response | < 50ms           |
| Tab Switch     | < 200ms          |

## Network Performance

| Metric                | Target  |
| --------------------- | ------- |
| Round Trip Time (RTT) | < 150ms |
| Server Latency        | < 150ms |
| Request Count         | < 50    |
| Failed Requests       | 0       |

## DOM Performance

| Metric         | Target          |
| -------------- | --------------- |
| DOM Size       | < 1,500 nodes   |
| DOM Depth      | < 32 levels     |
| Child Elements | < 60 per parent |

## Memory Budget

| Metric        | Target        |
| ------------- | ------------- |
| JS Heap Size  | < 50 MB       |
| Memory Growth | < 5 MB/minute |
| Memory Leaks  | 0 detected    |

## CI Enforcement

### Failure Conditions (Build Fails)

- Performance score < 80
- Total JS size > 512 KB
- Total CSS size > 102 KB
- Unminified JavaScript detected
- Unminified CSS detected
- Bundle size > 2 MB

### Warning Conditions (Build Succeeds with Warnings)

- Performance score 80-89
- FCP > 1.8s
- LCP > 2.5s
- CLS > 0.1
- TBT > 200ms
- DOM size > 1,500 nodes
- Request count > 50
- Unused JavaScript detected
- Unused CSS detected

## Monitoring Strategy

1. **Pre-commit**: Local performance testing with `npm run lighthouse`
2. **Pull Request**: Automated Lighthouse CI runs on every PR
3. **Main Branch**: Performance monitoring on merge to main
4. **Production**: Real User Monitoring (RUM) via Performance Observer API

## Performance Testing Commands

```bash
# Run Lighthouse locally
npm run lighthouse

# Build and analyze bundle
npm run build
npx vite-bundle-visualizer

# Run performance profiling
npm run dev
# Open http://localhost:5173
# Press Cmd+Shift+M to open Performance Dashboard

# Export performance report
# In Performance Dashboard: Click "Export" button
```

## Budget Adjustments

Performance budgets should be reviewed and adjusted:

- **Quarterly**: Review and adjust based on actual usage patterns
- **Major Features**: Re-evaluate budgets before large feature additions
- **Technology Updates**: Update budgets after major dependency upgrades
- **User Feedback**: Adjust based on real-world performance complaints

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Performance Budgets Guide](https://web.dev/performance-budgets-101/)
- [Bundle Size Best Practices](https://web.dev/your-first-performance-budget/)

---

**Last Updated**: October 19, 2025  
**Next Review**: January 2026
