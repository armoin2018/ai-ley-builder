import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Clock, Search, Settings, Zap } from 'lucide-react';
import { cn } from '../../../utils';

interface Command {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon?: React.ComponentType<any>;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands?: Command[];
  className?: string;
}

const defaultCommands: Command[] = [
  {
    id: 'execute-workflow',
    title: 'Execute Workflow',
    description: 'Run the current workflow',
    category: 'Execution',
    icon: Zap,
    shortcut: '⌘↵',
    action: () => console.log('Execute workflow'),
    keywords: ['run', 'execute', 'start', 'play'],
  },
  {
    id: 'validate-workflow',
    title: 'Validate Workflow',
    description: 'Check workflow for errors',
    category: 'Validation',
    icon: Zap,
    shortcut: '⌘K',
    action: () => console.log('Validate workflow'),
    keywords: ['validate', 'check', 'verify'],
  },
  {
    id: 'save-workflow',
    title: 'Save Workflow',
    description: 'Save the current workflow',
    category: 'File',
    shortcut: '⌘S',
    action: () => console.log('Save workflow'),
    keywords: ['save', 'store'],
  },
  {
    id: 'new-workflow',
    title: 'New Workflow',
    description: 'Create a new workflow',
    category: 'File',
    shortcut: '⌘N',
    action: () => console.log('New workflow'),
    keywords: ['new', 'create', 'start'],
  },
  {
    id: 'open-settings',
    title: 'Open Settings',
    description: 'Open application settings',
    category: 'Settings',
    icon: Settings,
    shortcut: '⌘,',
    action: () => console.log('Open settings'),
    keywords: ['settings', 'preferences', 'config'],
  },
  {
    id: 'add-input-node',
    title: 'Add Input Node',
    description: 'Add an input node to the workflow',
    category: 'Nodes',
    action: () => console.log('Add input node'),
    keywords: ['add', 'input', 'node', 'source'],
  },
  {
    id: 'add-output-node',
    title: 'Add Output Node',
    description: 'Add an output node to the workflow',
    category: 'Nodes',
    action: () => console.log('Add output node'),
    keywords: ['add', 'output', 'node', 'sink'],
  },
  {
    id: 'add-transform-node',
    title: 'Add Transform Node',
    description: 'Add a transform node to the workflow',
    category: 'Nodes',
    action: () => console.log('Add transform node'),
    keywords: ['add', 'transform', 'node', 'process', 'map'],
  },
];

export function CommandPalette({
  isOpen,
  onClose,
  commands = defaultCommands,
  className,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter and sort commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Show recent commands first, then all commands
      const recent = commands.filter(cmd => recentCommands.includes(cmd.id));
      const others = commands.filter(cmd => !recentCommands.includes(cmd.id));
      return [...recent, ...others];
    }

    const searchQuery = query.toLowerCase();
    return commands
      .filter(command => {
        const titleMatch = command.title.toLowerCase().includes(searchQuery);
        const descriptionMatch = command.description
          ?.toLowerCase()
          .includes(searchQuery);
        const categoryMatch = command.category
          .toLowerCase()
          .includes(searchQuery);
        const keywordsMatch = command.keywords?.some(keyword =>
          keyword.toLowerCase().includes(searchQuery)
        );

        return titleMatch || descriptionMatch || categoryMatch || keywordsMatch;
      })
      .sort((a, b) => {
        // Prioritize exact title matches
        const aExact = a.title.toLowerCase().startsWith(searchQuery);
        const bExact = b.title.toLowerCase().startsWith(searchQuery);
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        // Then prioritize recent commands
        const aRecent = recentCommands.includes(a.id);
        const bRecent = recentCommands.includes(b.id);
        if (aRecent && !bRecent) return -1;
        if (!aRecent && bRecent) return 1;

        return a.title.localeCompare(b.title);
      });
  }, [query, commands, recentCommands]);

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  const executeCommand = (command: Command) => {
    // Add to recent commands
    setRecentCommands(prev => {
      const filtered = prev.filter(id => id !== command.id);
      return [command.id, ...filtered].slice(0, 5);
    });

    // Execute command
    command.action();

    // Close palette
    onClose();
  };

  const groupedCommands = useMemo(() => {
    const groups: Record<string, typeof filteredCommands> = {};
    filteredCommands.forEach(command => {
      const category = command.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(command);
    });
    return groups;
  }, [filteredCommands]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Palette */}
      <div
        className={cn(
          'fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-4',
          'bg-white rounded-lg shadow-xl border border-slate-200 z-50',
          'max-h-96 overflow-hidden',
          className
        )}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 outline-none text-slate-900 placeholder-slate-400"
          />
          <div className="text-xs text-slate-400">
            ↑↓ to navigate, ↵ to select, esc to close
          </div>
        </div>

        {/* Commands List */}
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No commands found for "{query}"
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category}>
                {!query && (
                  <div className="px-4 py-2 text-xs font-medium text-slate-500 bg-slate-50 border-b border-slate-100">
                    {category}
                    {category === 'Recent' && recentCommands.length > 0 && (
                      <Clock className="inline w-3 h-3 ml-1" />
                    )}
                  </div>
                )}
                {commands.map((command, _commandIndex) => {
                  const globalIndex = filteredCommands.indexOf(command);
                  const isSelected = globalIndex === selectedIndex;
                  const Icon = command.icon;
                  const isRecent =
                    !query && recentCommands.includes(command.id);

                  return (
                    <button
                      key={command.id}
                      onClick={() => executeCommand(command)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors',
                        isSelected && 'bg-blue-50 border-r-2 border-blue-500'
                      )}
                    >
                      {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                      {isRecent && !Icon && (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">
                          {command.title}
                        </div>
                        {command.description && (
                          <div className="text-sm text-slate-500 truncate">
                            {command.description}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {command.shortcut && (
                          <div className="px-2 py-1 text-xs font-mono bg-slate-100 text-slate-600 rounded">
                            {command.shortcut}
                          </div>
                        )}
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default CommandPalette;
