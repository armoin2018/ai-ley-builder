import { useReactFlow, type Node as FlowNode } from '@xyflow/react';
import {
    Bug,
    Calendar,
    ChevronDown,
    ChevronRight,
    Database,
    Download,
    Info,
    Play,
    Settings,
    Upload,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';

interface TabbedRightPanelProps {
  className?: string;
}

interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  content: React.ReactNode;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      {isOpen && (
        <div className="px-3 py-2 text-sm text-slate-600">{children}</div>
      )}
    </div>
  );
}

function DatastoresTab() {
  return (
    <div className="space-y-0">
      <AccordionItem title="Global" defaultOpen>
        <div className="space-y-2">
          <div className="p-2 bg-slate-50 rounded text-xs">
            <div className="font-medium mb-1">Environment Variables</div>
            <div className="text-slate-500">API_KEY, DATABASE_URL, etc.</div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem title="Flow">
        <div className="space-y-2">
          <div className="p-2 bg-slate-50 rounded text-xs">
            <div className="font-medium mb-1">Flow Variables</div>
            <div className="text-slate-500">Flow-specific context data</div>
          </div>
        </div>
      </AccordionItem>

      <AccordionItem title="Node">
        <div className="space-y-2">
          <div className="p-2 bg-slate-50 rounded text-xs">
            <div className="font-medium mb-1">Node Variables</div>
            <div className="text-slate-500">Node-specific state</div>
          </div>
        </div>
      </AccordionItem>
    </div>
  );
}

function InformationTab() {
  const { getNodes } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);

  // Track selected node
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const nodes = getNodes();
      const selected = nodes.find((node: FlowNode) => node.selected);
      if (selected && selected.id !== selectedNode?.id) {
        setSelectedNode(selected);
      } else if (!selected && selectedNode) {
        setSelectedNode(null);
      }
    }, 500); // Increased from 100ms to 500ms to reduce overhead

    return () => clearInterval(checkInterval);
  }, [getNodes, selectedNode]);

  if (!selectedNode) {
    return (
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
            Node Information
          </h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <div>Select a node to view details</div>
          </div>
        </div>
      </div>
    );
  }

  const nodeType = selectedNode.type || 'default';
  const nodeData = selectedNode.data || {};
  const properties = nodeData.properties || {};

  console.log('📋 InformationTab - Selected node data:', {
    nodeId: selectedNode.id,
    nodeType,
    hasData: !!nodeData,
    hasProperties: !!properties,
    propertiesKeys: Object.keys(properties),
    rawData: nodeData,
  });

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
          Node Information
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <label className="font-medium text-slate-600 dark:text-slate-400">
              ID:
            </label>
            <div className="text-slate-900 dark:text-slate-100 font-mono text-xs mt-1">
              {selectedNode.id}
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-600 dark:text-slate-400">
              Type:
            </label>
            <div className="text-slate-900 dark:text-slate-100 mt-1">
              {nodeType}
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-600 dark:text-slate-400">
              Label:
            </label>
            <div className="text-slate-900 dark:text-slate-100 mt-1">
              {String(nodeData.label || 'N/A')}
            </div>
          </div>

          <div>
            <label className="font-medium text-slate-600 dark:text-slate-400">
              Position:
            </label>
            <div className="text-slate-900 dark:text-slate-100 font-mono text-xs mt-1">
              X: {Math.round(selectedNode.position.x)}, Y:{' '}
              {Math.round(selectedNode.position.y)}
            </div>
          </div>

          {Object.keys(properties).length > 0 && (
            <div>
              <label className="font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Properties:
              </label>
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800 rounded p-3">
                {Object.entries(properties).map(([key, value]) => (
                  <div key={key}>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {key}:
                    </div>
                    <div className="text-xs text-slate-900 dark:text-slate-100 mt-1 break-all">
                      {typeof value === 'object'
                        ? JSON.stringify(value, null, 2)
                        : String(value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const handleGlobalImport = () => {
    // TODO: Implement global import functionality
    console.log('Global import');
  };

  const handleGlobalExport = () => {
    // TODO: Implement global export functionality
    console.log('Global export');
  };

  const handleManage = () => {
    // TODO: Implement workflow management functionality
    console.log('Manage workflows');
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="font-medium text-slate-700 mb-3">Flow Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-slate-600">Auto-save</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-slate-600">Debug mode</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-slate-600">Auto PlantUML export</span>
          </label>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-slate-700 mb-3">Global Actions</h3>
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleGlobalImport}
            className="w-full justify-start"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import All Workflows
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGlobalExport}
            className="w-full justify-start"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Workflows
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleManage}
            className="w-full justify-start"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Workflows
          </Button>
        </div>
      </div>
    </div>
  );
}

function DebugTab() {
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('Unknown');
  const [storageInfo, setStorageInfo] = useState<any>({});

  // Function to add debug log
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-50), `[${timestamp}] ${message}`]);
  };

  // Monitor localStorage changes and tab state
  useEffect(() => {
    const updateDebugInfo = () => {
      // Get current active tab info
      const tabs = JSON.parse(
        localStorage.getItem('workflow-tabs-state') ||
          '{"tabs":[],"activeTabId":null}'
      );
      if (tabs.activeTabId) {
        const currentTab = tabs.tabs.find(
          (t: any) => t.id === tabs.activeTabId
        );
        if (currentTab) {
          setActiveTab(currentTab.name || currentTab.id);

          // Check PlantUML content for this tab
          const storageKey = currentTab.path || `tab-plantuml-${currentTab.id}`;
          const pumlPaths = [
            `puml-content-${storageKey}`,
            `puml-content-tab-plantuml-${currentTab.id}`,
            `puml-content-${currentTab.path}`,
          ];

          const storage: any = {};
          pumlPaths.forEach(path => {
            const content = localStorage.getItem(path);
            if (content) {
              storage[path] = {
                length: content.length,
                hasStartUML: content.includes('@startuml'),
                hasEndUML: content.includes('@enduml'),
                preview:
                  content.substring(0, 100) +
                  (content.length > 100 ? '...' : ''),
              };
            }
          });
          setStorageInfo(storage);
        }
      }
    };

    // Update immediately
    updateDebugInfo();

    // Set up interval to update debug info
    const interval = setInterval(updateDebugInfo, 1000);

    // Listen for storage events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('puml-content-')) {
        addDebugLog(
          `📝 PlantUML content updated: ${e.key} (${e.newValue?.length || 0} chars)`
        );
        updateDebugInfo();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Override console.log to capture tab switching logs
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      const message = args.join(' ');
      if (
        message.includes('🎯') ||
        message.includes('🔄') ||
        message.includes('✅') ||
        message.includes('📝') ||
        message.includes('❌')
      ) {
        addDebugLog(message);
      }
      originalConsoleLog(...args);
    };

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      console.log = originalConsoleLog;
    };
  }, []);

  return (
    <div className="p-3 space-y-3 text-xs">
      <div>
        <h3 className="font-medium text-slate-700 mb-2">
          Current Tab Debug Info
        </h3>
        <div className="bg-slate-50 p-2 rounded text-xs">
          <div>
            <strong>Active Tab:</strong> {activeTab}
          </div>
          <div>
            <strong>Storage Keys Found:</strong>{' '}
            {Object.keys(storageInfo).length}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-slate-700 mb-2">PlantUML Storage</h3>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {Object.keys(storageInfo).length === 0 ? (
            <div className="text-slate-500 italic">
              No PlantUML content found in storage
            </div>
          ) : (
            Object.entries(storageInfo).map(([key, info]: [string, any]) => (
              <div key={key} className="bg-slate-50 p-2 rounded">
                <div className="font-medium text-slate-600 truncate">{key}</div>
                <div>
                  Length: {info.length} | StartUML:{' '}
                  {info.hasStartUML ? '✓' : '✗'} | EndUML:{' '}
                  {info.hasEndUML ? '✓' : '✗'}
                </div>
                <div className="text-slate-500 text-xs mt-1 font-mono">
                  {info.preview}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-slate-700 mb-2">Debug Console</h3>
        <div className="bg-slate-900 text-green-400 p-2 rounded font-mono h-32 overflow-y-auto">
          {debugLogs.length === 0 ? (
            <div className="text-slate-500">Waiting for debug logs...</div>
          ) : (
            debugLogs.map((log, index) => (
              <div key={index} className="text-xs leading-tight">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div>
        <button
          onClick={() => setDebugLogs([])}
          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 rounded text-slate-700"
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
}

function TaskManagerTab() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-medium text-slate-700 mb-2">Running Flows</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-green-50 rounded text-sm">
            <span className="text-green-700">Main Flow</span>
            <span className="text-green-600">Running</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
            <span className="text-slate-700">Background Task</span>
            <span className="text-slate-500">Stopped</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchedulerTab() {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-medium text-slate-700 mb-2">Flow Scheduler</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Schedule Type
            </label>
            <select className="w-full px-2 py-1 border border-slate-200 rounded text-sm">
              <option>Manual</option>
              <option>Interval</option>
              <option>Cron</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Interval (seconds)
            </label>
            <input
              type="number"
              min="1"
              defaultValue="60"
              className="w-full px-2 py-1 border border-slate-200 rounded text-sm"
            />
          </div>

          <Button size="sm" className="w-full">
            Save Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TabbedRightPanel({ className }: TabbedRightPanelProps) {
  const [activeTab, setActiveTab] = useState('information');

  const tabs: TabConfig[] = [
    {
      id: 'information',
      label: 'Info',
      icon: Info,
      content: <InformationTab />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      content: <SettingsTab />,
    },
    {
      id: 'datastores',
      label: 'Data',
      icon: Database,
      content: <DatastoresTab />,
    },
    {
      id: 'debug',
      label: 'Debug',
      icon: Bug,
      content: <DebugTab />,
    },
    {
      id: 'task-manager',
      label: 'Tasks',
      icon: Play,
      content: <TaskManagerTab />,
    },
    {
      id: 'scheduler',
      label: 'Schedule',
      icon: Calendar,
      content: <SchedulerTab />,
    },
  ];

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);

  return (
    <div className={cn('flex flex-col h-full bg-white dark:bg-card', className)}>
      {/* Tab Headers */}
      <div className="flex border-b border-slate-200 dark:border-border bg-slate-50 dark:bg-secondary">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 px-2 py-2 text-xs font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-700 dark:text-blue-400 bg-white dark:bg-card'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-accent'
              )}
              title={tab.label}
            >
              <Icon className="w-3 h-3" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">{activeTabConfig?.content}</div>
    </div>
  );
}
