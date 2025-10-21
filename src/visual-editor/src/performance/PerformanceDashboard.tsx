/**
 * Performance Dashboard Component
 *
 * Displays real-time performance metrics and profiling data.
 */

import { Button } from '@shared/components';
import {
  Activity,
  BarChart3,
  Download,
  Pause,
  Play,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { usePerformanceMonitor, usePerformanceStore } from './index';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerformanceDashboard({
  isOpen,
  onClose,
}: PerformanceDashboardProps) {
  const [enabled] = useState(true);

  const {
    isMonitoring,
    snapshotCount,
    startMonitoring,
    stopMonitoring,
    generateReport,
    exportData,
    getSlowestComponents,
    clearData,
  } = usePerformanceMonitor({ enabled });

  const { getMetrics } = usePerformanceStore();

  if (!isOpen) return null;

  const handleToggleMonitoring = () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      startMonitoring();
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const report = generateReport();
  const slowestComponents = getSlowestComponents();
  const allMetrics = getMetrics();
  const totalRenders = allMetrics.length;
  const avgRenderTime =
    totalRenders > 0
      ? allMetrics.reduce((acc, m) => acc + m.actualDuration, 0) / totalRenders
      : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold text-slate-900">
              Performance Dashboard
            </h2>
            {isMonitoring && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                Monitoring
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMonitoring}
              title={isMonitoring ? 'Pause monitoring' : 'Start monitoring'}
            >
              {isMonitoring ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              title="Export report"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearData}
              title="Clear data"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Metrics Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Total Renders</div>
              <div className="text-2xl font-bold text-slate-900">
                {totalRenders}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Avg Render Time</div>
              <div className="text-2xl font-bold text-slate-900">
                {avgRenderTime.toFixed(2)}ms
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Snapshots</div>
              <div className="text-2xl font-bold text-slate-900">
                {snapshotCount}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Issues</div>
              <div className="text-2xl font-bold text-slate-900">
                {report.recommendations.length}
              </div>
            </div>
          </div>

          {/* Slowest Components */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-slate-700" />
              <h3 className="text-lg font-semibold text-slate-900">
                Slowest Components
              </h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">
                      Component
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">
                      Avg Duration
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">
                      Renders
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {slowestComponents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        No component data yet. Start interacting with the app to
                        collect metrics.
                      </td>
                    </tr>
                  ) : (
                    slowestComponents.map(component => (
                      <tr key={component.name}>
                        <td className="px-4 py-2 text-sm font-mono text-slate-900">
                          {component.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-900">
                          {component.avgDuration.toFixed(2)}ms
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-900">
                          {component.renderCount}
                        </td>
                        <td className="px-4 py-2">
                          {component.avgDuration < 16 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Good
                            </span>
                          ) : component.avgDuration < 50 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Needs Improvement
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Poor
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Recommendations
              </h3>
              <div className="space-y-3">
                {report.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      rec.priority === 'high'
                        ? 'bg-red-50 border-red-200'
                        : rec.priority === 'medium'
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          rec.priority === 'high'
                            ? 'bg-red-100 text-red-800'
                            : rec.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 mb-1">
                          {rec.issue}
                        </div>
                        <div className="text-sm text-slate-600">
                          {rec.suggestion}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Web Vitals */}
          {report.summary.avgWebVitals && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                Core Web Vitals (Average)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600 mb-1">FCP</div>
                  <div className="text-xl font-bold text-slate-900">
                    {report.summary.avgWebVitals.FCP.toFixed(0)}ms
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600 mb-1">LCP</div>
                  <div className="text-xl font-bold text-slate-900">
                    {report.summary.avgWebVitals.LCP.toFixed(0)}ms
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600 mb-1">TTI</div>
                  <div className="text-xl font-bold text-slate-900">
                    {report.summary.avgWebVitals.TTI.toFixed(0)}ms
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="text-sm text-slate-600 mb-1">CLS</div>
                  <div className="text-xl font-bold text-slate-900">
                    {report.summary.avgWebVitals.CLS.toFixed(3)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
