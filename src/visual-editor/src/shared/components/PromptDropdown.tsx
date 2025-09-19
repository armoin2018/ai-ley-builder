import { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileText, Search } from 'lucide-react';
import { cn } from '../../utils';
import { type PromptFile, PromptService } from '../../services/promptService';

interface PromptDropdownProps {
  onSelect: (prompt: PromptFile) => void;
  placeholder?: string;
  className?: string;
  selectedPromptId?: string;
}

export function PromptDropdown({
  onSelect,
  placeholder = 'Select a prompt...',
  className,
  selectedPromptId,
}: PromptDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptFile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const allPrompts = PromptService.getAllPrompts();
  const categories = PromptService.getCategories();

  // Update selected prompt when selectedPromptId prop changes
  useEffect(() => {
    if (selectedPromptId) {
      const prompt = PromptService.getPromptById(selectedPromptId);
      setSelectedPrompt(prompt || null);
    } else {
      setSelectedPrompt(null);
    }
  }, [selectedPromptId]);

  // Filter prompts based on search query
  const filteredPrompts = searchQuery.trim()
    ? PromptService.searchPrompts(searchQuery)
    : allPrompts;

  // Group prompts by category
  const groupedPrompts = categories.reduce(
    (acc, category) => {
      const promptsInCategory = filteredPrompts.filter(
        prompt => prompt.category === category
      );
      if (promptsInCategory.length > 0) {
        acc[category] = promptsInCategory;
      }
      return acc;
    },
    {} as Record<string, PromptFile[]>
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handlePromptSelect = (prompt: PromptFile) => {
    setSelectedPrompt(prompt);
    setIsOpen(false);
    setSearchQuery('');
    onSelect(prompt);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchQuery('');
    }
  };

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2 text-left',
          'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
          'rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-colors text-sm'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
          <span
            className={cn(
              'truncate',
              selectedPrompt
                ? 'text-slate-900 dark:text-slate-100'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {selectedPrompt ? selectedPrompt.displayName : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-1 z-50',
            'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
            'rounded-md shadow-lg max-h-80 overflow-hidden'
          )}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-3 py-2 text-sm',
                  'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600',
                  'rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  'text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500'
                )}
              />
            </div>
          </div>

          {/* Prompt List */}
          <div className="max-h-64 overflow-y-auto">
            {Object.keys(groupedPrompts).length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm">
                No prompts found for "{searchQuery}"
              </div>
            ) : (
              Object.entries(groupedPrompts).map(([category, prompts]) => (
                <div key={category}>
                  {/* Category Header */}
                  {!searchQuery && (
                    <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                      {category} ({prompts.length})
                    </div>
                  )}

                  {/* Prompts in Category */}
                  {prompts.map(prompt => (
                    <button
                      key={prompt.id}
                      onClick={() => handlePromptSelect(prompt)}
                      className={cn(
                        'w-full flex items-start gap-3 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700',
                        'focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-700',
                        'transition-colors'
                      )}
                    >
                      <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {prompt.displayName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {prompt.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
