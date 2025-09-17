import { NodeType } from '../../../types/nodes';
import { cn } from '../../../utils';

interface NodePaletteItem {
  type: NodeType;
  label: string;
  description: string;
  icon: string;
  category: 'input' | 'logic' | 'output' | 'control' | 'custom';
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
];

const categoryLabels = {
  input: 'Input Nodes',
  logic: 'Logic Nodes',
  output: 'Output Nodes',
  control: 'Control Nodes',
  custom: 'Custom Nodes',
};

interface NodePaletteProps {
  className?: string;
}

export function NodePalette({ className }: NodePaletteProps) {
  const onDragStart = (
    event: React.DragEvent,
    nodeType: NodeType,
    label: string
  ) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow-label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const groupedNodes = nodeItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, NodePaletteItem[]>
  );

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
      </div>

      {/* Node Categories */}
      <div className="flex-1 p-4 space-y-6">
        {Object.entries(groupedNodes).map(([category, items]) => (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>

            {/* Category Items */}
            <div className="space-y-2">
              {items.map(item => (
                <div
                  key={item.type}
                  className={cn(
                    'p-3 border-2 border-dashed rounded-lg cursor-grab',
                    'transition-all duration-200 hover:shadow-sm',
                    'active:cursor-grabbing active:scale-95',
                    'select-none',
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
                      className="text-lg"
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
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-500 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span>Drag to add nodes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>Connect nodes to create flow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
