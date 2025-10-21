/**
 * Performance Monitoring Hook
 *
 * Custom React hook for collecting and analyzing performance metrics.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { performanceStore } from './ProfilerWrapper';
import type {
  CoreWebVitals,
  InteractionMetrics,
  MemoryMetrics,
  PerformanceConfig,
  PerformanceReport,
  PerformanceSnapshot,
} from './types';

/**
 * Default performance thresholds based on Web Vitals guidelines
 */
const DEFAULT_THRESHOLDS = {
  webVitals: {
    FCP: { good: 1800, needsImprovement: 3000 },
    LCP: { good: 2500, needsImprovement: 4000 },
    TTI: { good: 3800, needsImprovement: 7300 },
    CLS: { good: 0.1, needsImprovement: 0.25 },
  },
  componentRender: {
    good: 16,
    needsImprovement: 50,
  },
  interactionResponse: {
    good: 100,
    needsImprovement: 300,
  },
  bundleSize: {
    good: 200000, // 200KB
    needsImprovement: 500000, // 500KB
  },
};

/**
 * Hook for monitoring application performance
 */
export function usePerformanceMonitor(config: Partial<PerformanceConfig> = {}) {
  const {
    enabled = true,
    sampleRate = 1.0,
    thresholds = DEFAULT_THRESHOLDS,
    profileComponents = true,
    trackInteractions = true,
    trackMemory = true,
    onData,
  } = config;

  const [snapshots, setSnapshots] = useState<PerformanceSnapshot[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(enabled);
  const interactionsRef = useRef<InteractionMetrics[]>([]);
  const snapshotIntervalRef = useRef<number | undefined>(undefined);

  /**
   * Collect Core Web Vitals
   */
  const collectWebVitals = useCallback((): CoreWebVitals => {
    const paint = performance.getEntriesByType('paint');
    const navigation = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;

    // FCP - First Contentful Paint
    const fcpEntry = paint.find(
      entry => entry.name === 'first-contentful-paint'
    );
    const FCP = fcpEntry?.startTime || 0;

    // LCP - Largest Contentful Paint (approximation from navigation timing)
    const LCP = navigation?.loadEventEnd || 0;

    // TTI - Time to Interactive (approximation)
    const TTI = navigation?.domInteractive || 0;

    // CLS - Cumulative Layout Shift (would need Layout Instability API)
    const CLS = 0; // Placeholder - requires proper instrumentation

    return { FCP, LCP, TTI, CLS };
  }, []);

  /**
   * Collect memory metrics
   */
  const collectMemoryMetrics = useCallback((): MemoryMetrics => {
    // @ts-expect-error - memory API may not be available in all browsers
    const memory = performance.memory;

    if (!memory) {
      return {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
        usagePercentage: 0,
      };
    }

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }, []);

  /**
   * Track user interaction
   */
  const trackInteraction = useCallback(
    (type: InteractionMetrics['type'], target: string) => {
      if (!trackInteractions) return () => {};

      const startTime = performance.now();

      return () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        const performant = duration < thresholds.interactionResponse.good;

        const metrics: InteractionMetrics = {
          type,
          target,
          duration,
          startTime,
          endTime,
          performant,
        };

        interactionsRef.current.push(metrics);

        // Log slow interactions
        if (
          !performant &&
          duration > thresholds.interactionResponse.needsImprovement
        ) {
          console.warn(
            `[Performance] Slow ${type} interaction on "${target}": ${duration.toFixed(2)}ms`
          );
        }
      };
    },
    [trackInteractions, thresholds.interactionResponse]
  );

  /**
   * Create a performance snapshot
   */
  const createSnapshot = useCallback((): PerformanceSnapshot | null => {
    // Sample rate check
    if (Math.random() > sampleRate) return null;

    const webVitals = collectWebVitals();
    const components = performanceStore.getMetrics();
    const interactions = [...interactionsRef.current];
    const memory = trackMemory
      ? collectMemoryMetrics()
      : {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0,
          usagePercentage: 0,
        };

    const snapshot: PerformanceSnapshot = {
      timestamp: Date.now(),
      webVitals,
      components,
      interactions,
      bundle: {
        totalSize: 0, // Would need build-time instrumentation
        mainBundleSize: 0,
        vendorBundleSize: 0,
        chunkSizes: {},
        loadTime: webVitals.LCP,
      },
      network: {
        requestCount: performance.getEntriesByType('resource').length,
        bytesTransferred: 0, // Would need Resource Timing API details
        avgRequestDuration: 0,
        failedRequests: 0,
        cachedResources: 0,
      },
      memory,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    // Call callback if provided
    if (onData) {
      onData(snapshot);
    }

    return snapshot;
  }, [sampleRate, collectWebVitals, trackMemory, collectMemoryMetrics, onData]);

  /**
   * Generate performance report
   */
  const generateReport = useCallback((): PerformanceReport => {
    const now = Date.now();
    const periodStart = snapshots.length > 0 ? snapshots[0].timestamp : now;

    // Calculate average Web Vitals
    const avgWebVitals: CoreWebVitals = snapshots.reduce(
      (acc, snapshot) => ({
        FCP: acc.FCP + snapshot.webVitals.FCP / snapshots.length,
        LCP: acc.LCP + snapshot.webVitals.LCP / snapshots.length,
        TTI: acc.TTI + snapshot.webVitals.TTI / snapshots.length,
        CLS: acc.CLS + snapshot.webVitals.CLS / snapshots.length,
      }),
      { FCP: 0, LCP: 0, TTI: 0, CLS: 0 }
    );

    // Get slowest components
    const slowestComponents = performanceStore
      .getSlowestComponents(5)
      .map(comp => ({
        name: comp.name,
        avgDuration: comp.avgDuration,
        callCount: comp.renderCount,
      }));

    // Get slowest interactions
    const interactionMap = new Map<string, { total: number; count: number }>();
    interactionsRef.current.forEach(interaction => {
      const key = `${interaction.type}:${interaction.target}`;
      const existing = interactionMap.get(key) || { total: 0, count: 0 };
      interactionMap.set(key, {
        total: existing.total + interaction.duration,
        count: existing.count + 1,
      });
    });

    const slowestInteractions = Array.from(interactionMap.entries())
      .map(([key, data]) => {
        const [type, target] = key.split(':');
        return {
          type,
          target,
          avgDuration: data.total / data.count,
        };
      })
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);

    // Generate recommendations
    const recommendations: PerformanceReport['recommendations'] = [];

    if (avgWebVitals.LCP > thresholds.webVitals.LCP.needsImprovement) {
      recommendations.push({
        category: 'webvitals',
        priority: 'high',
        issue: `LCP is ${avgWebVitals.LCP.toFixed(0)}ms (target: ${thresholds.webVitals.LCP.good}ms)`,
        suggestion: 'Optimize image loading, reduce render-blocking resources',
      });
    }

    slowestComponents.forEach(component => {
      if (component.avgDuration > thresholds.componentRender.needsImprovement) {
        recommendations.push({
          category: 'component',
          priority: 'high',
          issue: `${component.name} renders in ${component.avgDuration.toFixed(2)}ms`,
          suggestion:
            'Consider React.memo, useMemo, or useCallback optimizations',
        });
      }
    });

    slowestInteractions.forEach(interaction => {
      if (
        interaction.avgDuration >
        thresholds.interactionResponse.needsImprovement
      ) {
        recommendations.push({
          category: 'interaction',
          priority: 'medium',
          issue: `${interaction.type} on "${interaction.target}" takes ${interaction.avgDuration.toFixed(2)}ms`,
          suggestion:
            'Debounce input, optimize event handlers, use virtual scrolling',
        });
      }
    });

    return {
      timestamp: now,
      period: {
        start: periodStart,
        end: now,
      },
      summary: {
        totalSnapshots: snapshots.length,
        avgWebVitals,
        slowestComponents,
        slowestInteractions,
      },
      recommendations,
    };
  }, [snapshots, thresholds]);

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);

    // Take snapshot every 10 seconds
    snapshotIntervalRef.current = window.setInterval(() => {
      const snapshot = createSnapshot();
      if (snapshot) {
        setSnapshots(prev => [...prev, snapshot]);
      }
    }, 10000);
  }, [createSnapshot]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (snapshotIntervalRef.current) {
      clearInterval(snapshotIntervalRef.current);
    }
  }, []);

  /**
   * Clear all collected data
   */
  const clearData = useCallback(() => {
    setSnapshots([]);
    interactionsRef.current = [];
    performanceStore.clear();
  }, []);

  /**
   * Export data as JSON
   */
  const exportData = useCallback(() => {
    const report = generateReport();
    return JSON.stringify(report, null, 2);
  }, [generateReport]);

  // Auto-start monitoring if enabled
  useEffect(() => {
    if (enabled && profileComponents) {
      startMonitoring();
      return stopMonitoring;
    }
  }, [enabled, profileComponents, startMonitoring, stopMonitoring]);

  return {
    // State
    isMonitoring,
    snapshots,
    snapshotCount: snapshots.length,

    // Actions
    startMonitoring,
    stopMonitoring,
    createSnapshot,
    trackInteraction,
    clearData,

    // Analysis
    generateReport,
    exportData,
    getSlowestComponents: () => performanceStore.getSlowestComponents(),
    getComponentMetrics: (name: string) =>
      performanceStore.getComponentMetrics(name),
  };
}
