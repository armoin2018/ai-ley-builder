import { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Gauge,
  Lightbulb,
  RefreshCw,
  Shield,
  Target,
  X,
} from 'lucide-react';
import { Button } from '../../../shared/components';
import { validationEngine } from '../services/validationEngine';
import type {
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from '../types/validation';
import { cn } from '../../../utils';

interface ValidationPanelProps {
  nodes: any[];
  edges: any[];
  isOpen: boolean;
  onClose: () => void;
  onNodeSelect?: (nodeId: string) => void;
  className?: string;
}

export function ValidationPanel({
  nodes,
  edges,
  isOpen,
  onClose,
  onNodeSelect,
  className,
}: ValidationPanelProps) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['errors', 'warnings', 'summary'])
  );
  const [autoValidate, setAutoValidate] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidationTime, setLastValidationTime] = useState<Date | null>(
    null
  );
  const [validationHistory, setValidationHistory] = useState<
    ValidationResult[]
  >([]);

  useEffect(() => {
    if (autoValidate && isOpen) {
      validateWorkflow();
    }
  }, [nodes, edges, autoValidate, isOpen]);

  const validateWorkflow = async () => {
    setIsValidating(true);
    try {
      // Simulate validation time for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = validationEngine.validateWorkflow(nodes, edges);
      setValidationResult(result);
      setLastValidationTime(new Date());

      // Keep validation history (last 5 results)
      setValidationHistory(prev => {
        const newHistory = [result, ...prev.slice(0, 4)];
        return newHistory;
      });
    } finally {
      setIsValidating(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleIssueClick = (issue: ValidationError | ValidationWarning) => {
    if (issue.nodeId && onNodeSelect) {
      onNodeSelect(issue.nodeId);
    }
  };

  const getIssueIcon = (severity: 'error' | 'warning') => {
    return severity === 'error' ? (
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
    ) : (
      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
    );
  };

  const getIssueTypeLabel = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const summary = validationEngine.getValidationSummary(validationResult);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-lg z-50 flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {validationResult.isValid ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <h2 className="font-semibold text-slate-900">Validation</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={validateWorkflow}
            disabled={autoValidate || isValidating}
            className="flex items-center gap-1"
          >
            {isValidating ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Shield className="w-3 h-3" />
            )}
            {isValidating ? 'Validating...' : 'Validate'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Auto-validate toggle */}
      <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoValidate}
            onChange={e => setAutoValidate(e.target.checked)}
            className="rounded border-slate-300"
          />
          Auto-validate on changes
        </label>
      </div>

      {/* Enhanced Summary */}
      <div className="border-b border-slate-200">
        <button
          onClick={() => toggleSection('summary')}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
        >
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-slate-600" />
            <span className="font-medium">Validation Summary</span>
          </div>
          {expandedSections.has('summary') ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {expandedSections.has('summary') && (
          <div className="p-4 space-y-4">
            {/* Overall Health Score */}
            <div className="bg-slate-50 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">
                  Workflow Health
                </span>
                <span
                  className={cn(
                    'text-lg font-bold',
                    validationResult.isValid
                      ? 'text-green-600'
                      : summary.errorCount > 0
                        ? 'text-red-600'
                        : 'text-amber-600'
                  )}
                >
                  {validationResult.isValid
                    ? '100%'
                    : `${Math.max(0, 100 - (summary.errorCount * 20 + summary.warningCount * 5))}%`}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={cn(
                    'h-2 rounded-full transition-all duration-500',
                    validationResult.isValid
                      ? 'bg-green-500'
                      : summary.errorCount > 0
                        ? 'bg-red-500'
                        : 'bg-amber-500'
                  )}
                  style={{
                    width: `${validationResult.isValid ? 100 : Math.max(0, 100 - (summary.errorCount * 20 + summary.warningCount * 5))}%`,
                  }}
                />
              </div>
            </div>

            {/* Issue Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700">
                    Critical Issues
                  </span>
                </div>
                <div className="text-lg font-bold text-red-800">
                  {summary.errorCount}
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-700">
                    Warnings
                  </span>
                </div>
                <div className="text-lg font-bold text-amber-800">
                  {summary.warningCount}
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">
                    Affected Nodes
                  </span>
                </div>
                <div className="text-lg font-bold text-blue-800">
                  {summary.affectedNodes.length}
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">
                    Healthy Nodes
                  </span>
                </div>
                <div className="text-lg font-bold text-green-800">
                  {nodes.length - summary.affectedNodes.length}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {(summary.errorCount > 0 || summary.warningCount > 0) && (
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Quick Actions
                  </span>
                </div>
                <div className="space-y-1 text-xs text-blue-700">
                  {summary.errorCount > 0 && (
                    <div>
                      • Click on errors below to navigate to affected nodes
                    </div>
                  )}
                  {summary.warningCount > 0 && (
                    <div>• Review warnings to improve workflow quality</div>
                  )}
                  <div>• Enable auto-validation for real-time feedback</div>
                </div>
              </div>
            )}

            {/* Last Validation Info */}
            {lastValidationTime && (
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Last validated: {lastValidationTime.toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  <span>
                    {nodes.length} nodes, {edges.length} connections
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Results */}
      <div className="flex-1 overflow-auto">
        {/* Errors Section */}
        {validationResult.errors.length > 0 && (
          <div className="border-b border-slate-200">
            <button
              onClick={() => toggleSection('errors')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="font-medium text-red-700">
                  Errors ({validationResult.errors.length})
                </span>
              </div>
              {expandedSections.has('errors') ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedSections.has('errors') && (
              <div className="pb-2">
                {validationResult.errors.map((error, index) => (
                  <div
                    key={`error-${index}`}
                    onClick={() => handleIssueClick(error)}
                    className={cn(
                      'px-4 py-3 mx-2 mb-2 bg-red-50 border border-red-200 rounded-md cursor-pointer hover:bg-red-100 transition-colors',
                      { 'hover:border-red-300': error.nodeId }
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getIssueIcon(error.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-red-800 mb-2">
                          {error.message}
                        </div>

                        {/* Enhanced Error Details */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              {getIssueTypeLabel(error.type)}
                            </span>
                            {error.nodeId && (
                              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {error.nodeId}
                              </span>
                            )}
                            {error.property && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {error.property}
                              </span>
                            )}
                          </div>

                          {error.suggestedFix && (
                            <div className="bg-red-100 border border-red-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Lightbulb className="w-4 h-4 text-red-600" />
                                <span className="text-xs font-medium text-red-700">
                                  Suggested Fix
                                </span>
                              </div>
                              <div className="text-xs text-red-700">
                                {error.suggestedFix}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Warnings Section */}
        {validationResult.warnings.length > 0 && (
          <div className="border-b border-slate-200">
            <button
              onClick={() => toggleSection('warnings')}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-50"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-amber-700">
                  Warnings ({validationResult.warnings.length})
                </span>
              </div>
              {expandedSections.has('warnings') ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {expandedSections.has('warnings') && (
              <div className="pb-2">
                {validationResult.warnings.map((warning, index) => (
                  <div
                    key={`warning-${index}`}
                    onClick={() => handleIssueClick(warning)}
                    className={cn(
                      'px-4 py-3 mx-2 mb-2 bg-amber-50 border border-amber-200 rounded-md cursor-pointer hover:bg-amber-100 transition-colors',
                      { 'hover:border-amber-300': warning.nodeId }
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {getIssueIcon(warning.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-amber-800 mb-2">
                          {warning.message}
                        </div>

                        {/* Enhanced Warning Details */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                              {getIssueTypeLabel(warning.type)}
                            </span>
                            {warning.nodeId && (
                              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {warning.nodeId}
                              </span>
                            )}
                            {warning.property && (
                              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {warning.property}
                              </span>
                            )}
                          </div>

                          {warning.suggestedFix && (
                            <div className="bg-amber-100 border border-amber-200 rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Lightbulb className="w-4 h-4 text-amber-600" />
                                <span className="text-xs font-medium text-amber-700">
                                  Suggestion
                                </span>
                              </div>
                              <div className="text-xs text-amber-700">
                                {warning.suggestedFix}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Issues */}
        {validationResult.isValid && (
          <div className="p-8 text-center text-slate-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <h3 className="font-medium text-slate-900 mb-1">All Good!</h3>
            <p className="text-sm">Your workflow has no validation issues.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-600">
          Last validated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
