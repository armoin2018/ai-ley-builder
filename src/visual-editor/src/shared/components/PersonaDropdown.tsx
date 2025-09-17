import { useEffect, useState } from 'react';
import { ChevronDown, FileText, Loader2 } from 'lucide-react';
import { cn } from '../../utils';
import { FileSystemService, type PersonaFile } from '../../services/fileSystem';

interface PersonaDropdownProps {
  selectedPersonaId?: string;
  onSelect: (persona: PersonaFile) => void;
  placeholder?: string;
  className?: string;
}

export function PersonaDropdown({
  selectedPersonaId,
  onSelect,
  placeholder = 'Select a persona...',
  className,
}: PersonaDropdownProps) {
  const [personas, setPersonas] = useState<PersonaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPersona = personas.find(p => p.id === selectedPersonaId);

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedPersonas = await FileSystemService.getPersonaFiles();
      setPersonas(loadedPersonas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load personas');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (persona: PersonaFile) => {
    onSelect(persona);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className={cn(
        'w-full px-3 py-2 border border-slate-200 rounded-md bg-white',
        'flex items-center gap-2 text-sm text-slate-500',
        className
      )}>
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading personas...
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        'w-full px-3 py-2 border border-red-200 rounded-md bg-red-50',
        'flex items-center gap-2 text-sm text-red-600',
        className
      )}>
        <FileText className="w-4 h-4" />
        Error: {error}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full px-3 py-2 border border-slate-200 rounded-md bg-white',
          'flex items-center justify-between text-sm text-left',
          'hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'transition-colors duration-200'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className={cn(
            'truncate',
            selectedPersona ? 'text-slate-900' : 'text-slate-500'
          )}>
            {selectedPersona ? selectedPersona.name : placeholder}
          </span>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-slate-400 transition-transform duration-200',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {personas.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500 text-center">
                No personas found
              </div>
            ) : (
              <>
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => handleSelect(persona)}
                    className={cn(
                      'w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-slate-50',
                      'focus:outline-none border-b border-slate-100 last:border-b-0',
                      'transition-colors duration-150',
                      selectedPersonaId === persona.id && 'bg-blue-50 text-blue-900'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">
                          {persona.name}
                        </div>
                        <div className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                          {persona.content.slice(0, 100)}
                          {persona.content.length > 100 && '...'}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Modified: {persona.lastModified.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}