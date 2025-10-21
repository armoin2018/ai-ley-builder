/**
 * Performance Monitoring Module
 *
 * Exports all performance monitoring utilities and components.
 */

export { PerformanceDashboard } from './PerformanceDashboard';
export {
  ProfilerWrapper,
  performanceStore,
  usePerformanceStore,
  withProfiler,
} from './ProfilerWrapper';
export type {
  BundleMetrics,
  ComponentMetrics,
  CoreWebVitals,
  InteractionMetrics,
  MemoryMetrics,
  NetworkMetrics,
  PerformanceConfig,
  PerformanceReport,
  PerformanceSnapshot,
  PerformanceThresholds,
} from './types';
export { usePerformanceMonitor } from './usePerformanceMonitor';
