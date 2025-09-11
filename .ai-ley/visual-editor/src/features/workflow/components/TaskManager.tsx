import { useState } from 'react';
import { Copy, Edit2, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';
import type { Task } from '../hooks/useTaskManager';

interface TaskManagerProps {
  tasks: Task[];
  activeTaskId: string | null;
  onCreateTask: (name: string, description?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onSwitchTask: (taskId: string) => void;
  onDuplicateTask: (taskId: string, newName?: string) => void;
  onUpdateTaskName: (taskId: string, name: string) => void;
  className?: string;
}

interface TaskTabProps {
  task: Task;
  isActive: boolean;
  onSwitch: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (newName: string) => void;
}

function TaskTab({
  task,
  isActive,
  onSwitch,
  onDelete,
  onDuplicate,
  onRename,
}: TaskTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tempName, setTempName] = useState(task.name);

  const handleRename = () => {
    if (tempName.trim() && tempName !== task.name) {
      onRename(tempName.trim());
    }
    setIsEditing(false);
    setIsMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setTempName(task.name);
      setIsEditing(false);
    }
  };

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 border-b-2 transition-all duration-200 cursor-pointer group',
          isActive
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-transparent hover:bg-slate-50 text-slate-600 hover:text-slate-800'
        )}
        onClick={onSwitch}
      >
        {isEditing ? (
          <input
            type="text"
            value={tempName}
            onChange={e => setTempName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-sm font-medium min-w-0 flex-1"
            autoFocus
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className="text-sm font-medium truncate min-w-0 flex-1">
            {task.name}
          </span>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-white/50"
            onClick={e => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Context Menu */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-20 min-w-[160px]">
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 text-left"
              onClick={() => {
                setIsEditing(true);
                setIsMenuOpen(false);
              }}
            >
              <Edit2 className="h-3 w-3" />
              Rename
            </button>
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 text-left"
              onClick={() => {
                onDuplicate();
                setIsMenuOpen(false);
              }}
            >
              <Copy className="h-3 w-3" />
              Duplicate
            </button>
            <hr className="border-slate-200" />
            <button
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 text-red-600 text-left"
              onClick={() => {
                onDelete();
                setIsMenuOpen(false);
              }}
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function TaskManager({
  tasks,
  activeTaskId,
  onCreateTask,
  onDeleteTask,
  onSwitchTask,
  onDuplicateTask,
  onUpdateTaskName,
  className,
}: TaskManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  const handleCreateTask = () => {
    if (newTaskName.trim()) {
      onCreateTask(newTaskName.trim());
      setNewTaskName('');
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateTask();
    } else if (e.key === 'Escape') {
      setNewTaskName('');
      setIsCreating(false);
    }
  };

  return (
    <div
      className={cn(
        'flex items-center bg-white border-b border-slate-200',
        className
      )}
    >
      <div className="flex items-center min-w-0 flex-1">
        {/* Task Tabs */}
        <div className="flex items-center min-w-0 flex-1 overflow-x-auto">
          {tasks.map(task => (
            <TaskTab
              key={task.id}
              task={task}
              isActive={task.id === activeTaskId}
              onSwitch={() => onSwitchTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onDuplicate={() => onDuplicateTask(task.id)}
              onRename={newName => onUpdateTaskName(task.id, newName)}
            />
          ))}

          {/* New Task Input */}
          {isCreating && (
            <div className="flex items-center gap-2 px-3 py-2 border-b-2 border-transparent">
              <input
                type="text"
                value={newTaskName}
                onChange={e => setNewTaskName(e.target.value)}
                onBlur={handleCreateTask}
                onKeyDown={handleKeyDown}
                placeholder="Task name..."
                className="text-sm font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 min-w-[120px]"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Add Task Button */}
        <div className="flex items-center px-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => {
              if (isCreating) {
                handleCreateTask();
              } else {
                setIsCreating(true);
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Task Info */}
      {activeTaskId && (
        <div className="px-4 py-2 text-xs text-slate-500 border-l border-slate-200">
          {tasks.find(t => t.id === activeTaskId)?.nodes.length || 0} nodes
        </div>
      )}
    </div>
  );
}
