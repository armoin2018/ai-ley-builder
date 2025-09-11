import { useState } from 'react';
import {
  Copy,
  Download,
  Keyboard,
  MoreVertical,
  Play,
  Search,
  Settings,
  Trash2,
  Upload,
  Zap,
} from 'lucide-react';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';

interface QuickActionsProps {
  className?: string;
  onAction?: (action: string) => void;
}

export function QuickActions({ className, onAction }: QuickActionsProps) {
  const [showMore, setShowMore] = useState(false);

  const handleAction = (action: string) => {
    onAction?.(action);
    if (action !== 'more') {
      setShowMore(false);
    }
  };

  const primaryActions = [
    { id: 'execute', icon: Play, label: 'Execute', shortcut: '⌘↵' },
    { id: 'validate', icon: Zap, label: 'Validate', shortcut: '⌘K' },
    { id: 'search', icon: Search, label: 'Search', shortcut: '⌘F' },
  ];

  const secondaryActions = [
    { id: 'copy', icon: Copy, label: 'Duplicate', shortcut: '⌘D' },
    { id: 'delete', icon: Trash2, label: 'Delete', shortcut: 'Del' },
    { id: 'export', icon: Download, label: 'Export', shortcut: '⌘E' },
    { id: 'import', icon: Upload, label: 'Import', shortcut: '⌘I' },
    { id: 'settings', icon: Settings, label: 'Settings', shortcut: '⌘,' },
    { id: 'shortcuts', icon: Keyboard, label: 'Shortcuts', shortcut: '?' },
  ];

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-1 p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
        {/* Primary Actions */}
        {primaryActions.map(action => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              onClick={() => handleAction(action.id)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900"
              title={`${action.label} (${action.shortcut})`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">{action.label}</span>
            </Button>
          );
        })}

        {/* Separator */}
        <div className="w-px h-6 bg-slate-200 mx-1" />

        {/* More Actions Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowMore(!showMore);
            handleAction('more');
          }}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900"
          title="More actions"
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Dropdown Menu */}
      {showMore && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMore(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
            {secondaryActions.map((action, _index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1 text-left">{action.label}</span>
                  <span className="text-xs text-slate-400">
                    {action.shortcut}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default QuickActions;
