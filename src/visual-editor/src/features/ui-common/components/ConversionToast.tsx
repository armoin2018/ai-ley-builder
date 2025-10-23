import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ValidationResult } from '../../../utils/conversion-validator';

interface ConversionToastProps {
  validationResult: ValidationResult | null;
  onClose: () => void;
  autoCloseDuration?: number;
}

/**
 * Toast notification for conversion validation results
 * Shows success or warning messages when switching between visual and text views
 */
export function ConversionToast({
  validationResult,
  onClose,
  autoCloseDuration = 5000,
}: ConversionToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (validationResult) {
      setIsVisible(true);

      // Auto-close for successful conversions
      if (validationResult.valid && autoCloseDuration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 300); // Wait for fade animation
        }, autoCloseDuration);

        return () => clearTimeout(timer);
      }
    }
  }, [validationResult, autoCloseDuration, onClose]);

  if (!validationResult) return null;

  const { valid, summary, issues } = validationResult;
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');

  const getIcon = () => {
    if (valid) {
      return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
    if (errors.length > 0) {
      return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    }
    return <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
  };

  const getBackgroundColor = () => {
    if (valid) {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    }
    if (errors.length > 0) {
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
    return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  };

  const getMessage = () => {
    if (valid) {
      return `Conversion validated successfully (${summary.nodesMatched}/${summary.nodesTotal} nodes, ${summary.edgesMatched}/${summary.edgesTotal} edges)`;
    }
    return `Conversion completed with ${errors.length} error(s) and ${warnings.length} warning(s)`;
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md ${getBackgroundColor()}`}
      >
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {getMessage()}
          </p>

          {summary.positionDrift > 0 && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Average position drift: {summary.positionDrift}px
            </p>
          )}

          {!valid && issues.length > 0 && (
            <div className="mt-2 space-y-1">
              {issues.slice(0, 3).map((issue, idx) => (
                <p key={idx} className="text-xs text-gray-700 dark:text-gray-300">
                  • {issue.message}
                </p>
              ))}
              {issues.length > 3 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                  ... and {issues.length - 3} more (check console for details)
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
