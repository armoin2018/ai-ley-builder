import { useMemo, useState } from 'react';
import { NodeType } from '../../../types/nodes';
import { cn } from '../../../utils';
import { useSettings } from '../../../hooks/useSettings';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { Input } from '../../../shared/components';

interface NodePaletteItem {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  category:
    | 'input'
    | 'logic'
    | 'output'
    | 'control'
    | 'custom'
    | 'trigger'
    | 'ai-local'
    | 'ai-rest';
  color: string;
}

const nodeItems: NodePaletteItem[] = [
  {
    type: NodeType.COMMAND_PROMPT_FILE,
    label: 'Command Prompt',
    description: 'Execute command from file',
    icon: '📄',
    category: 'input',
    color: 'bg-blue-50/50 border-blue-100 hover:border-blue-200',
  },
  {
    type: NodeType.CUSTOM_PROMPT_TEXT,
    label: 'Custom Prompt',
    description: 'Custom text prompt',
    icon: '✏️',
    category: 'input',
    color: 'bg-indigo-50/50 border-indigo-100 hover:border-indigo-200',
  },
  {
    type: NodeType.PERSONA,
    label: 'AI Persona',
    description: 'Define AI behavior',
    icon: '👤',
    category: 'input',
    color: 'bg-pink-50/50 border-pink-100 hover:border-pink-200',
  },
  {
    type: NodeType.INSTRUCTION,
    label: 'Instruction',
    description: 'System instructions',
    icon: '📋',
    category: 'input',
    color: 'bg-teal-50/50 border-teal-100 hover:border-teal-200',
  },
  {
    type: NodeType.LOGIC_CONDITION,
    label: 'Condition',
    description: 'Conditional logic',
    icon: '🔀',
    category: 'logic',
    color: 'bg-purple-50/50 border-purple-100 hover:border-purple-200',
  },
  {
    type: NodeType.LOOP,
    label: 'Loop',
    description: 'Iterative processing',
    icon: '🔄',
    category: 'control',
    color: 'bg-orange-50/50 border-orange-100 hover:border-orange-200',
  },
  {
    type: NodeType.OUTPUT_TYPE,
    label: 'Output',
    description: 'Define output format',
    icon: '📤',
    category: 'output',
    color: 'bg-green-50/50 border-green-100 hover:border-green-200',
  },
  {
    type: NodeType.INJECTOR,
    label: 'Injector',
    description: 'Timer/trigger node',
    icon: '⚡',
    category: 'trigger',
    color: 'bg-red-50/50 border-red-100 hover:border-red-200',
  },
];

const categoryLabels = {
  input: 'Input Nodes',
  logic: 'Logic Nodes',
  output: 'Output Nodes',
  control: 'Control Nodes',
  trigger: 'Trigger Nodes',
  custom: 'Custom Nodes',
  'ai-local': 'Local AI Tools',
  'ai-rest': 'AI REST APIs',
};

interface NodePaletteProps {
  className?: string;
}

export function NodePalette({ className }: NodePaletteProps) {
  const { settings } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );

  const onDragStart = (
    event: React.DragEvent,
    nodeType: NodeType,
    label: string
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (category: string) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(category)) {
      newCollapsed.delete(category);
    } else {
      newCollapsed.add(category);
    }
    setCollapsedCategories(newCollapsed);
  };

  // Create script node items from settings
  const scriptNodeItems: NodePaletteItem[] = settings.umlFlows.scriptNodes
    .enablePalette
    ? settings.umlFlows.scriptNodes.executors
        .filter(executor => executor.enabled)
        .map(executor => {
          const getNodeType = (id: string): NodeType => {
            switch (id) {
              case 'shell':
                return NodeType.SHELL_SCRIPT;
              case 'python':
                return NodeType.PYTHON_SCRIPT;
              case 'php':
                return NodeType.PHP_SCRIPT;
              case 'nodejs':
                return NodeType.NODEJS_SCRIPT;
              default:
                return NodeType.SHELL_SCRIPT;
            }
          };

          return {
            type: getNodeType(executor.id),
            label: executor.name,
            description: executor.description,
            icon: executor.icon,
            category: 'custom' as const,
            color: executor.color,
          };
        })
    : [];

  // Create local AI tool node items from settings
  const localAINodeItems: NodePaletteItem[] = settings.localAI.tools
    .filter(tool => tool.enabled)
    .map(tool => {
      const getNodeType = (toolId: string): NodeType => {
        switch (toolId) {
          case 'ollama':
            return NodeType.AI_LOCAL_OLLAMA;
          case 'llamacpp':
            return NodeType.AI_LOCAL_LLAMACPP;
          case 'claude-code-cli':
            return NodeType.AI_LOCAL_CLAUDE_CODE_CLI;
          case 'github-copilot-cli':
            return NodeType.AI_LOCAL_GITHUB_COPILOT_CLI;
          case 'gemini-code-cli':
            return NodeType.AI_LOCAL_GEMINI_CODE_CLI;
          default:
            return NodeType.AI_LOCAL_OLLAMA; // fallback
        }
      };

      const getIcon = (toolId: string): string => {
        switch (toolId) {
          case 'ollama':
            return '🦙';
          case 'llamacpp':
            return '🤖';
          case 'claude-code-cli':
            return '🤖';
          case 'github-copilot-cli':
            return '🐙';
          case 'gemini-code-cli':
            return '✨';
          default:
            return '🤖';
        }
      };

      return {
        type: getNodeType(tool.id),
        label: tool.name,
        description: tool.description || `${tool.name} AI tool`,
        icon: getIcon(tool.id),
        category: 'ai-local' as const,
        color: 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200',
      };
    });

  // Create AI REST endpoint node items from settings
  const aiRestNodeItems: NodePaletteItem[] = settings.aiRest.endpoints
    .filter(endpoint => endpoint.enabled)
    .map(endpoint => {
      const getNodeType = (provider: string): NodeType => {
        switch (provider) {
          case 'openai':
            return NodeType.AI_REST_OPENAI;
          case 'anthropic':
            return NodeType.AI_REST_ANTHROPIC;
          default:
            return NodeType.AI_REST_OPENAI; // fallback
        }
      };

      const getIcon = (provider: string): string => {
        switch (provider) {
          case 'openai':
            return '🚀';
          case 'anthropic':
            return '🤖';
          case 'google':
            return '🌟';
          case 'azure':
            return '☁️';
          default:
            return '🔗';
        }
      };

      return {
        type: getNodeType(endpoint.provider),
        label: endpoint.name,
        description: `${endpoint.provider.toUpperCase()} AI API - ${endpoint.model || 'Default model'}`,
        icon: getIcon(endpoint.provider),
        category: 'ai-rest' as const,
        color: 'bg-cyan-50/50 border-cyan-100 hover:border-cyan-200',
      };
    });

  // Combine static nodes with dynamic nodes
  const allNodeItems = [
    ...nodeItems,
    ...scriptNodeItems,
    ...localAINodeItems,
    ...aiRestNodeItems,
  ];

  // Filter nodes based on search term and group by category
  const filteredAndGroupedNodes = useMemo(() => {
    const filtered = searchTerm.trim()
      ? allNodeItems.filter(
          item =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : allNodeItems;

    return filtered.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, NodePaletteItem[]>
    );
  }, [allNodeItems, searchTerm]);

  return (
    <div
      className={cn(
        'w-64 bg-white border-r border-slate-200 overflow-y-auto',
        'flex flex-col h-full shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900">Node Palette</h2>
        <p className="text-sm text-slate-600 mt-1">
          Drag nodes to the canvas to build your workflow
        </p>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 text-sm bg-white border-slate-200 focus:border-blue-300 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Node Categories */}
      <div className="flex-1 p-4 space-y-4">
        {Object.entries(filteredAndGroupedNodes).map(([category, items]) => {
          const isCollapsed = collapsedCategories.has(category);
          const categoryLabel =
            categoryLabels[category as keyof typeof categoryLabels];

          return (
            <div key={category} className="space-y-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className={cn(
                  'w-full flex items-center justify-between py-2 px-3 rounded-md',
                  'text-left font-medium text-slate-700 uppercase tracking-wide text-sm',
                  'hover:bg-slate-100 transition-colors duration-150',
                  'focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1'
                )}
              >
                <span>{categoryLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 normal-case">
                    {items.length} node{items.length !== 1 ? 's' : ''}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Category Items */}
              {!isCollapsed && (
                <div className="space-y-2 pl-2">
                  {items.map(item => (
                    <div
                      key={item.type}
                      className={cn(
                        'p-3 border-2 border-dashed rounded-lg cursor-grab',
                        'transition-all duration-200 hover:shadow-md hover:border-solid',
                        'active:cursor-grabbing active:scale-95',
                        'select-none group hover:bg-opacity-80',
                        'hover:transform hover:scale-102',
                        item.color
                      )}
                      draggable
                      onDragStart={event =>
                        onDragStart(event, item.type, item.label)
                      }
                      title={item.description}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <span
                          className="text-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                          role="img"
                          aria-label={item.label}
                        >
                          {item.icon}
                        </span>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-900 truncate">
                            {item.label}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* No Results Message */}
        {searchTerm.trim() &&
          Object.keys(filteredAndGroupedNodes).length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No nodes found matching "{searchTerm}"</p>
              <p className="text-xs mt-1">Try adjusting your search terms</p>
            </div>
          )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-500 space-y-1">
          {searchTerm.trim() ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Search className="w-3 h-3" />
                <span>
                  Showing{' '}
                  {Object.values(filteredAndGroupedNodes).reduce(
                    (sum, items) => sum + items.length,
                    0
                  )}{' '}
                  matching node
                  {Object.values(filteredAndGroupedNodes).reduce(
                    (sum, items) => sum + items.length,
                    0
                  ) !== 1
                    ? 's'
                    : ''}
                </span>
              </div>
              <div className="text-slate-400">
                Clear search to see all nodes
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>Drag to add nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Connect nodes to create flow</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                <span>Click headers to collapse/expand</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
