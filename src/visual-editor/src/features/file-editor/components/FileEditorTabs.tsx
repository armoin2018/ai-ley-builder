import { useCallback, useState } from 'react';
import { Button } from '../../../shared/components/Button';
import {
  BookOpen,
  Code2,
  FileText,
  Plus,
  Settings,
  User,
  X,
} from 'lucide-react';
import { cn } from '../../../utils';
import { PlantUMLEditor } from './PlantUMLEditor';
import { PersonaEditor } from './PersonaEditor';
import { InstructionEditor } from './InstructionEditor';
import { GlobalInstructionEditor } from './GlobalInstructionEditor';
import { CommandPromptEditor } from './CommandPromptEditor';

interface FileEditorTab {
  id: string;
  title: string;
  filePath: string;
  fileType:
    | 'plantuml'
    | 'persona'
    | 'instruction'
    | 'global-instruction'
    | 'command-prompt';
  content: string;
  hasChanges: boolean;
}

interface FileEditorTabsProps {
  className?: string;
  initialTabs?: FileEditorTab[];
  onTabsChange?: (tabs: FileEditorTab[]) => void;
}

export function FileEditorTabs({
  className,
  initialTabs = [],
  onTabsChange,
}: FileEditorTabsProps) {
  const [tabs, setTabs] = useState<FileEditorTab[]>(initialTabs);
  const [activeTabId, setActiveTabId] = useState<string | null>(
    initialTabs.length > 0 ? initialTabs[0].id : null
  );

  const updateTabs = useCallback(
    (newTabs: FileEditorTab[]) => {
      setTabs(newTabs);
      onTabsChange?.(newTabs);
    },
    [onTabsChange]
  );

  const createNewTab = useCallback(
    (fileType: FileEditorTab['fileType'], title?: string) => {
      const newTab: FileEditorTab = {
        id: `tab-${Date.now()}`,
        title: title || `New ${fileType}`,
        filePath: '',
        fileType,
        content: '',
        hasChanges: false,
      };

      const newTabs = [...tabs, newTab];
      updateTabs(newTabs);
      setActiveTabId(newTab.id);
    },
    [tabs, updateTabs]
  );

  const closeTab = useCallback(
    (tabId: string) => {
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      updateTabs(newTabs);

      if (activeTabId === tabId) {
        setActiveTabId(
          newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null
        );
      }
    },
    [tabs, activeTabId, updateTabs]
  );

  const updateTabContent = useCallback(
    (tabId: string, content: string) => {
      const newTabs = tabs.map(tab =>
        tab.id === tabId
          ? { ...tab, content, hasChanges: content !== tab.content }
          : tab
      );
      updateTabs(newTabs);
    },
    [tabs, updateTabs]
  );

  const saveTab = useCallback(
    async (tabId: string) => {
      const tab = tabs.find(t => t.id === tabId);
      if (!tab) return;

      // Here you would implement actual file saving
      console.log(`Saving ${tab.fileType} file:`, tab.filePath, tab.content);

      // Mark as saved
      const newTabs = tabs.map(t =>
        t.id === tabId ? { ...t, hasChanges: false } : t
      );
      updateTabs(newTabs);
    },
    [tabs, updateTabs]
  );

  const getTabIcon = (fileType: FileEditorTab['fileType']) => {
    switch (fileType) {
      case 'plantuml':
        return Code2;
      case 'persona':
        return User;
      case 'instruction':
        return BookOpen;
      case 'global-instruction':
        return Settings;
      case 'command-prompt':
        return FileText;
      default:
        return FileText;
    }
  };

  const renderEditor = () => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);
    if (!activeTab) {
      return (
        <div className="flex-1 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="text-slate-400 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-slate-600 mb-2">
              No file open
            </h3>
            <p className="text-slate-500 mb-4">
              Create a new file or open an existing one to start editing
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => createNewTab('plantuml')}
                className="flex items-center gap-2"
              >
                <Code2 className="w-4 h-4" />
                PlantUML
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => createNewTab('persona')}
                className="flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Persona
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => createNewTab('instruction')}
                className="flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Instruction
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => createNewTab('command-prompt')}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Command Prompt
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const editorProps = {
      className: 'h-full',
      onContentChange: (content: string) =>
        updateTabContent(activeTab.id, content),
      onSave: () => saveTab(activeTab.id),
    };

    switch (activeTab.fileType) {
      case 'plantuml':
        return (
          <PlantUMLEditor
            {...editorProps}
            file={{
              name: activeTab.title,
              path: activeTab.filePath,
              content: activeTab.content,
              workflowName: activeTab.title,
            }}
          />
        );
      case 'persona':
        return (
          <PersonaEditor
            {...editorProps}
            file={{
              name: activeTab.title,
              path: activeTab.filePath,
              type: 'persona',
              tone: 'professional',
              expertise: [],
              background: '',
              communication_style: 'direct',
              content: activeTab.content,
            }}
          />
        );
      case 'instruction':
        return (
          <InstructionEditor
            {...editorProps}
            file={{
              name: activeTab.title,
              path: activeTab.filePath,
              type: 'instruction',
              priority: 'medium',
              scope: [],
              content: activeTab.content,
            }}
          />
        );
      case 'global-instruction':
        return (
          <GlobalInstructionEditor
            {...editorProps}
            file={{
              path: activeTab.filePath,
              content: activeTab.content,
              sections: [],
            }}
          />
        );
      case 'command-prompt':
        return (
          <CommandPromptEditor
            {...editorProps}
            file={{
              name: activeTab.title,
              path: activeTab.filePath,
              fileName: `${activeTab.title}.md`,
              variables: [],
              content: activeTab.content,
            }}
          />
        );
      default:
        return <div>Unknown file type: {activeTab.fileType}</div>;
    }
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Tab Bar */}
      <div className="flex items-center border-b bg-slate-50">
        <div className="flex items-center flex-1 min-w-0">
          {tabs.map(tab => {
            const Icon = getTabIcon(tab.fileType);
            return (
              <div
                key={tab.id}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 border-r cursor-pointer relative',
                  'hover:bg-white transition-colors',
                  activeTabId === tab.id
                    ? 'bg-white border-b-2 border-b-blue-500'
                    : 'bg-slate-50'
                )}
                onClick={() => setActiveTabId(tab.id)}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span className="text-sm truncate max-w-32">{tab.title}</span>
                {tab.hasChanges && (
                  <div className="w-2 h-2 bg-orange-400 rounded-full" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={e => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="w-5 h-5 p-0 hover:bg-slate-200 ml-1"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* New File Dropdown */}
        <div className="flex items-center px-4 py-2">
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New File
            </Button>
            <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => createNewTab('plantuml')}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-slate-50"
              >
                <Code2 className="w-4 h-4 text-slate-500" />
                PlantUML Workflow
              </button>
              <button
                onClick={() => createNewTab('persona')}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-slate-500" />
                Persona Definition
              </button>
              <button
                onClick={() => createNewTab('instruction')}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-slate-50"
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
                Instruction Guide
              </button>
              <button
                onClick={() => createNewTab('global-instruction')}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-slate-50"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                Global Instructions
              </button>
              <button
                onClick={() => createNewTab('command-prompt')}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-slate-50"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                Command Prompt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-h-0">{renderEditor()}</div>
    </div>
  );
}
