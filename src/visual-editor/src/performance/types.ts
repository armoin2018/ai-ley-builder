/**
 * Performance Monitoring Types
 *
 * Type definitions for performance tracking and profiling.
 */

/**
 * Core Web Vitals metrics
 */
export interface CoreWebVitals {
  /** First Contentful Paint - Time to first content render */
  FCP: number;
  /** Largest Contentful Paint - Time to largest content render */
  LCP: number;
  /** Time to Interactive - Time until page is fully interactive */
  TTI: number;
  /** Cumulative Layout Shift - Visual stability score */
  CLS: number;
  /** First Input Delay - Time from first interaction to browser response */
  FID?: number;
  /** Total Blocking Time - Time page is blocked from responding */
  TBT?: number;
}

/**
 * React component performance metrics
 */
export interface ComponentMetrics {
  /** Component display name */
  componentName: string;
  /** Phase: mount, update, or nested-update */
  phase: 'mount' | 'update' | 'nested-update';
  /** Actual time spent rendering */
  actualDuration: number;
  /** Base time estimated for rendering */
  baseDuration: number;
  /** Time when rendering started */
  startTime: number;
  /** Time when rendering committed */
  commitTime: number;
  /** Interactions tracked during this render */
  interactions: Set<unknown>;
}

/**
 * User interaction performance
 */
export interface InteractionMetrics {
  /** Interaction type */
  type: 'click' | 'drag' | 'input' | 'navigation';
  /** Interaction target */
  target: string;
  /** Time from start to completion */
  duration: number;
  /** Timestamp when interaction started */
  startTime: number;
  /** Timestamp when interaction completed */
  endTime: number;
  /** Whether interaction met performance target */
  performant: boolean;
}

/**
 * Bundle size and loading metrics
 */
export interface BundleMetrics {
  /** Total bundle size in bytes */
  totalSize: number;
  /** Main bundle size */
  mainBundleSize: number;
  /** Vendor bundle size */
  vendorBundleSize: number;
  /** Async chunks sizes */
  chunkSizes: Record<string, number>;
  /** Time to load main bundle */
  loadTime: number;
}

/**
 * Network performance metrics
 */
export interface NetworkMetrics {
  /** Number of HTTP requests */
  requestCount: number;
  /** Total bytes transferred */
  bytesTransferred: number;
  /** Average request duration */
  avgRequestDuration: number;
  /** Failed requests count */
  failedRequests: number;
  /** Cached resources count */
  cachedResources: number;
}

/**
 * Memory usage metrics
 */
export interface MemoryMetrics {
  /** Used JS heap size in bytes */
  usedJSHeapSize: number;
  /** Total JS heap size in bytes */
  totalJSHeapSize: number;
  /** JS heap size limit in bytes */
  jsHeapSizeLimit: number;
  /** Memory usage percentage */
  usagePercentage: number;
}

/**
 * Complete performance snapshot
 */
export interface PerformanceSnapshot {
  /** Timestamp of snapshot */
  timestamp: number;
  /** Core Web Vitals */
  webVitals: CoreWebVitals;
  /** Component performance data */
  components: ComponentMetrics[];
  /** User interaction metrics */
  interactions: InteractionMetrics[];
  /** Bundle and loading metrics */
  bundle: BundleMetrics;
  /** Network performance */
  network: NetworkMetrics;
  /** Memory usage */
  memory: MemoryMetrics;
  /** User agent information */
  userAgent: string;
  /** Viewport dimensions */
  viewport: { width: number; height: number };
}

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
  /** Core Web Vitals thresholds */
  webVitals: {
    FCP: { good: number; needsImprovement: number };
    LCP: { good: number; needsImprovement: number };
    TTI: { good: number; needsImprovement: number };
    CLS: { good: number; needsImprovement: number };
  };
  /** Component render time thresholds (ms) */
  componentRender: {
    good: number;
    needsImprovement: number;
  };
  /** Interaction response thresholds (ms) */
  interactionResponse: {
    good: number;
    needsImprovement: number;
  };
  /** Bundle size thresholds (bytes) */
  bundleSize: {
    good: number;
    needsImprovement: number;
  };
}

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  /** Enable performance monitoring */
  enabled: boolean;
  /** Sample rate (0-1) */
  sampleRate: number;
  /** Performance thresholds */
  thresholds: PerformanceThresholds;
  /** Enable component profiling */
  profileComponents: boolean;
  /** Enable interaction tracking */
  trackInteractions: boolean;
  /** Enable memory monitoring */
  trackMemory: boolean;
  /** Callback for performance data */
  onData?: (snapshot: PerformanceSnapshot) => void;
}

/**
 * Performance report for analysis
 */
export interface PerformanceReport {
  /** Report timestamp */
  timestamp: number;
  /** Time period covered */
  period: {
    start: number;
    end: number;
  };
  /** Summary statistics */
  summary: {
    totalSnapshots: number;
    avgWebVitals: CoreWebVitals;
    slowestComponents: Array<{
      name: string;
      avgDuration: number;
      callCount: number;
    }>;
    slowestInteractions: Array<{
      type: string;
      target: string;
      avgDuration: number;
    }>;
  };
  /** Recommendations */
  recommendations: Array<{
    category: 'webvitals' | 'component' | 'interaction' | 'bundle' | 'memory';
    priority: 'high' | 'medium' | 'low';
    issue: string;
    suggestion: string;
  }>;
}
