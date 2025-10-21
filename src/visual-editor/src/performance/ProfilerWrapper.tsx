/**
 * Performance Profiler Wrapper Component
 *
 * Wraps components with React Profiler to collect performance metrics.
 */

import type { ProfilerOnRenderCallback, ReactNode } from 'react';
import React, { Profiler } from 'react';
import type { ComponentMetrics } from './types';

interface ProfilerWrapperProps {
  /** Unique identifier for this profiled section */
  id: string;
  /** Children to profile */
  children: ReactNode;
  /** Callback for performance data */
  onData?: (metrics: ComponentMetrics) => void;
  /** Enable/disable profiling */
  enabled?: boolean;
}

/**
 * Store for accumulated performance data
 */
class PerformanceStore {
  private metrics: ComponentMetrics[] = [];
  private callbacks: Array<(metrics: ComponentMetrics) => void> = [];

  /**
   * Add performance metrics
   */
  addMetrics(metrics: ComponentMetrics): void {
    this.metrics.push(metrics);
    this.notifyCallbacks(metrics);
  }

  /**
   * Register callback for new metrics
   */
  subscribe(callback: (metrics: ComponentMetrics) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all subscribers
   */
  private notifyCallbacks(metrics: ComponentMetrics): void {
    this.callbacks.forEach(callback => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('Error in performance callback:', error);
      }
    });
  }

  /**
   * Get all collected metrics
   */
  getMetrics(): ComponentMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for specific component
   */
  getComponentMetrics(componentName: string): ComponentMetrics[] {
    return this.metrics.filter(m => m.componentName === componentName);
  }

  /**
   * Get average metrics for component
   */
  getAverageMetrics(componentName: string): {
    avgActualDuration: number;
    avgBaseDuration: number;
    renderCount: number;
  } {
    const componentMetrics = this.getComponentMetrics(componentName);

    if (componentMetrics.length === 0) {
      return {
        avgActualDuration: 0,
        avgBaseDuration: 0,
        renderCount: 0,
      };
    }

    const sum = componentMetrics.reduce(
      (acc, m) => ({
        actualDuration: acc.actualDuration + m.actualDuration,
        baseDuration: acc.baseDuration + m.baseDuration,
      }),
      { actualDuration: 0, baseDuration: 0 }
    );

    return {
      avgActualDuration: sum.actualDuration / componentMetrics.length,
      avgBaseDuration: sum.baseDuration / componentMetrics.length,
      renderCount: componentMetrics.length,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get slowest components
   */
  getSlowestComponents(limit: number = 10): Array<{
    name: string;
    avgDuration: number;
    renderCount: number;
  }> {
    const componentMap = new Map<string, { total: number; count: number }>();

    this.metrics.forEach(m => {
      const existing = componentMap.get(m.componentName) || {
        total: 0,
        count: 0,
      };
      componentMap.set(m.componentName, {
        total: existing.total + m.actualDuration,
        count: existing.count + 1,
      });
    });

    return Array.from(componentMap.entries())
      .map(([name, data]) => ({
        name,
        avgDuration: data.total / data.count,
        renderCount: data.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, limit);
  }
}

// Global performance store singleton
export const performanceStore = new PerformanceStore();

/**
 * React Profiler wrapper component
 *
 * @example
 * ```tsx
 * <ProfilerWrapper id="MyComponent" onData={handleMetrics}>
 *   <MyComponent />
 * </ProfilerWrapper>
 * ```
 */
export function ProfilerWrapper({
  id,
  children,
  onData,
  enabled = true,
}: ProfilerWrapperProps): React.ReactElement {
  const onRender: ProfilerOnRenderCallback = React.useCallback(
    (
      profilerId: string,
      phase: 'mount' | 'update' | 'nested-update',
      actualDuration: number,
      baseDuration: number,
      startTime: number,
      commitTime: number
    ) => {
      const metrics: ComponentMetrics = {
        componentName: profilerId,
        phase,
        actualDuration,
        baseDuration,
        startTime,
        commitTime,
        interactions: new Set(),
      };

      // Store metrics globally
      performanceStore.addMetrics(metrics);

      // Call component-specific callback
      if (onData) {
        onData(metrics);
      }

      // Log slow renders in development (only when console is available)
      if (typeof console !== 'undefined' && actualDuration > 16) {
        console.warn(
          `[Performance] Slow render detected in "${id}": ${actualDuration.toFixed(2)}ms`,
          {
            phase,
            actualDuration,
            baseDuration,
          }
        );
      }
    },
    [onData]
  );

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
}

/**
 * Hook to access performance store
 */
export function usePerformanceStore() {
  return {
    getMetrics: () => performanceStore.getMetrics(),
    getComponentMetrics: (name: string) =>
      performanceStore.getComponentMetrics(name),
    getAverageMetrics: (name: string) =>
      performanceStore.getAverageMetrics(name),
    getSlowestComponents: (limit?: number) =>
      performanceStore.getSlowestComponents(limit),
    clear: () => performanceStore.clear(),
    subscribe: (callback: (metrics: ComponentMetrics) => void) =>
      performanceStore.subscribe(callback),
  };
}

/**
 * Higher-order component to wrap a component with profiler
 *
 * @example
 * ```tsx
 * const ProfiledComponent = withProfiler(MyComponent, 'MyComponent');
 * ```
 */
export function withProfiler<P extends object>(
  Component: React.ComponentType<P>,
  id: string,
  onData?: (metrics: ComponentMetrics) => void
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <ProfilerWrapper id={id} onData={onData}>
      <Component {...props} />
    </ProfilerWrapper>
  );

  WrappedComponent.displayName = `withProfiler(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
