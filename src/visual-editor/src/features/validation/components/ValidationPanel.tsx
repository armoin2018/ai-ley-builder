import { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronRight,
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
    new Set(['errors', 'warnings'])
  );
  const [autoValidate, setAutoValidate] = useState(true);

  useEffect(() => {
    if (autoValidate && isOpen) {
      validateWorkflow();
    }
  }, [nodes, edges, autoValidate, isOpen]);

  const validateWorkflow = () => {
    const result = validationEngine.validateWorkflow(nodes, edges);
    setValidationResult(result);
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
            disabled={autoValidate}
          >
            Validate
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

      {/* Summary */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span>{summary.errorCount} errors</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{summary.warningCount} warnings</span>
          </div>
        </div>
        {summary.affectedNodes.length > 0 && (
          <div className="mt-2 text-xs text-slate-600">
            Affected nodes: {summary.affectedNodes.length}
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
                    <div className="flex items-start gap-2">
                      {getIssueIcon(error.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-red-800 mb-1">
                          {error.message}
                        </div>
                        <div className="text-xs text-red-600 mb-2">
                          Type: {getIssueTypeLabel(error.type)}
                          {error.nodeId && ` • Node: ${error.nodeId}`}
                          {error.property && ` • Property: ${error.property}`}
                        </div>
                        {error.suggestedFix && (
                          <div className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded">
                            💡 {error.suggestedFix}
                          </div>
                        )}
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
                    <div className="flex items-start gap-2">
                      {getIssueIcon(warning.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-amber-800 mb-1">
                          {warning.message}
                        </div>
                        <div className="text-xs text-amber-600 mb-2">
                          Type: {getIssueTypeLabel(warning.type)}
                          {warning.nodeId && ` • Node: ${warning.nodeId}`}
                          {warning.property &&
                            ` • Property: ${warning.property}`}
                        </div>
                        {warning.suggestedFix && (
                          <div className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded">
                            💡 {warning.suggestedFix}
                          </div>
                        )}
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
