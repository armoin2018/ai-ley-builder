import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  HardDrive,
  Users,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { cn } from '../../../utils';

interface StatusBarProps {
  className?: string;
  nodeCount?: number;
  connectionCount?: number;
  lastSaved?: Date;
  validationStatus?: 'valid' | 'invalid' | 'pending';
  executionStatus?: 'idle' | 'running' | 'completed' | 'failed';
  isOnline?: boolean;
}

export function StatusBar({
  className,
  nodeCount = 0,
  connectionCount = 0,
  lastSaved,
  validationStatus = 'pending',
  executionStatus = 'idle',
  isOnline = true,
}: StatusBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getValidationStatusIcon = () => {
    switch (validationStatus) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invalid':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getExecutionStatusIcon = () => {
    switch (executionStatus) {
      case 'running':
        return <Zap className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Zap className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        'h-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between px-4 text-xs text-slate-600',
        'select-none',
        className
      )}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Workflow Stats */}
        <div className="flex items-center gap-1">
          <HardDrive className="w-3 h-3" />
          <span>{nodeCount} nodes</span>
        </div>

        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{connectionCount} connections</span>
        </div>

        {/* Validation Status */}
        <div className="flex items-center gap-1">
          {getValidationStatusIcon()}
          <span className="capitalize">{validationStatus}</span>
        </div>

        {/* Execution Status */}
        <div className="flex items-center gap-1">
          {getExecutionStatusIcon()}
          <span className="capitalize">{executionStatus}</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Last Saved */}
        {lastSaved && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Saved {formatLastSaved(lastSaved)}</span>
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center gap-1">
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Current Time */}
        <div className="flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3" />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
