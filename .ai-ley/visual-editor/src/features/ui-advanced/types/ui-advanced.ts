export interface StatusBarProps {
  className?: string;
  nodeCount?: number;
  connectionCount?: number;
  lastSaved?: Date;
  validationStatus?: 'valid' | 'invalid' | 'pending';
  executionStatus?: 'idle' | 'running' | 'completed' | 'failed';
  isOnline?: boolean;
}

export interface QuickActionsProps {
  className?: string;
  onAction?: (action: string) => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands?: Command[];
  className?: string;
}

export interface Command {
  id: string;
  title: string;
  description?: string;
  category: string;
  icon?: React.ComponentType<any>;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}
