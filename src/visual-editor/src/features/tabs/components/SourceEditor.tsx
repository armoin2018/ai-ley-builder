import { useReactFlow } from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import { CodeEditor } from '../../../shared/components';
import { cn } from '../../../utils';
import { flowToPlantUML } from '../../../utils/plantuml-parser';
import { useTabState } from '../../tabs/hooks/useTabState';
import { useWorkflowTabsContext } from './WorkflowTabsProvider';

interface SourceEditorProps {
  className?: string;
  onUpdate?: (content: string) => void;
  refreshTrigger?: Date;
}

export function SourceEditor({
  className,
  onUpdate,
  refreshTrigger,
}: SourceEditorProps) {
  const {
    activeTab,
    saveTab,
    isLoading: tabsLoading,
    tabs,
    createNewTab,
  } = useWorkflowTabsContext();
  const { getNodes, getEdges, setNodes, setEdges, setViewport } =
    useReactFlow();

  // Initialize tab state hook - always call it, but use the ID conditionally
  // This ensures hooks are called in the same order every render
  const tabId = activeTab?.id || 'no-tab';
  const tabState = useTabState(
    tabId,
    getNodes,
    getEdges,
    setNodes,
    setEdges,
    setViewport
  );

  // Only use tab state if we have an active tab
  const effectiveTabState = activeTab ? tabState : null;

  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper: Get tab content from new storage (hook) or old storage (migration support)
  const getTabContent = useCallback((tabId: string): string | null => {
    // Try new hook storage first
    const newKey = `ailey-tab-state-${tabId}`;
    const newState = localStorage.getItem(newKey);
    if (newState) {
      try {
        const parsed = JSON.parse(newState);
        return parsed.sourceState || null;
      } catch (e) {
        console.error('Failed to parse tab state:', e);
      }
    }

    // Fall back to old storage patterns for migration
    const oldKeys = [
      `puml-content-tab-plantuml-${tabId}`,
      `puml-content-${tabId}`,
    ];

    for (const key of oldKeys) {
      const content = localStorage.getItem(key);
      if (content) {
        return content;
      }
    }

    return null;
  }, []);

  // Don't auto-create tabs in SourceEditor - let the main app handle initial tab creation

  // Convert current canvas state to PlantUML - refresh every time component mounts or refreshTrigger changes
  useEffect(() => {
    const loadContent = async () => {
      // Add small delay to let context stabilize when switching views
      await new Promise(resolve => setTimeout(resolve, 50));
      if (!activeTab) {
        if (!tabsLoading && tabs.length > 0) {
          // Tabs exist but no active tab - try to use the first available tab
          const firstTab = tabs[0];
          console.warn(
            'No active tab selected, using first available tab:',
            firstTab.name
          );

          // Use the first tab's data - check hook storage first, then old storage
          const firstTabContent = getTabContent(firstTab.id);
          if (firstTabContent) {
            console.log(
              '✅ Using PlantUML content from storage for first tab:',
              firstTab.name
            );
            setContent(firstTabContent);
            return;
          } else if (firstTab.workflow) {
            // Generate content from first tab's workflow data
            const workflowNodes =
              firstTab.workflow.canvas?.nodes || firstTab.workflow.nodes || [];
            const workflowEdges =
              firstTab.workflow.canvas?.edges || firstTab.workflow.edges || [];

            console.log('🔄 Using first tab workflow data:', {
              tabName: firstTab.name,
              nodes: workflowNodes.length,
              edges: workflowEdges.length,
            });

            const plantumlContent = flowToPlantUML(
              workflowNodes,
              workflowEdges,
              firstTab.name
            );
            setContent(plantumlContent);
            return;
          }

          setContent(
            getDefaultPlantUMLContent(
              firstTab.name || 'Creating new workflow...'
            )
          );
          return;
        }
        // Still loading or no tabs available
        setContent('');
        return;
      }

      setIsLoading(true);
      try {
        // Primary: Use tab state hook if available
        if (effectiveTabState) {
          console.log('✅ Loading content from tab state hook');
          setContent(effectiveTabState.state.sourceState);
          return;
        }

        // Fallback: Try to load from storage (hook storage or old storage)
        const storedContent = getTabContent(activeTab.id);
        if (storedContent) {
          console.log(
            '✅ Found stored PlantUML content for tab:',
            activeTab.name
          );
          setContent(storedContent);
          return;
        }

        // Last resort: Get current nodes and edges from the canvas
        const currentNodes = getNodes();
        const currentEdges = getEdges();

        console.log('🔄 Converting current canvas to PlantUML:', {
          tabName: activeTab.name,
          hasPath: !!activeTab.path,
          nodes: currentNodes.length,
          edges: currentEdges.length,
          sampleNodes: currentNodes.slice(0, 3).map(n => ({
            id: n.id,
            type: n.type,
            label: n.data?.label,
          })),
        });

        if (currentNodes.length > 0) {
          // Convert current visual workflow to PlantUML
          const plantumlContent = flowToPlantUML(
            currentNodes,
            currentEdges,
            activeTab.name
          );
          console.log(
            '✅ Generated PlantUML content from canvas:',
            `${plantumlContent.substring(0, 200)}...`
          );
          setContent(plantumlContent);
        } else if (
          activeTab.workflow &&
          (activeTab.workflow.canvas?.nodes?.length > 0 ||
            activeTab.workflow.nodes?.length > 0)
        ) {
          // Canvas is empty but workflow has nodes - use workflow data directly
          const workflowNodes =
            activeTab.workflow.canvas?.nodes || activeTab.workflow.nodes || [];
          const workflowEdges =
            activeTab.workflow.canvas?.edges || activeTab.workflow.edges || [];

          console.log('🔄 Canvas empty, converting from workflow data:', {
            nodes: workflowNodes.length,
            edges: workflowEdges.length,
          });

          const plantumlContent = flowToPlantUML(
            workflowNodes,
            workflowEdges,
            activeTab.name
          );
          console.log(
            '✅ Generated PlantUML content from workflow:',
            `${plantumlContent.substring(0, 200)}...`
          );
          setContent(plantumlContent);
        } else {
          // No nodes anywhere - show default template
          console.log(
            '📝 No nodes found in canvas or workflow, using default template'
          );
          setContent(getDefaultPlantUMLContent(activeTab.name));
        }
      } catch (error) {
        console.error('❌ Failed to convert canvas to PlantUML:', error);
        setContent(getDefaultPlantUMLContent(activeTab.name));
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [activeTab?.id, refreshTrigger]); // Re-run when tab changes or when refresh is triggered

  // Debug: Log when refreshTrigger changes
  useEffect(() => {
    console.log('📡 SourceEditor - refreshTrigger changed:', refreshTrigger);
  }, [refreshTrigger]);

  // Debug: Log activeTab and canvas state
  useEffect(() => {
    console.log('🎯 SourceEditor - activeTab changed:', {
      tabId: activeTab?.id,
      tabName: activeTab?.name,
      hasWorkflow: !!activeTab?.workflow,
      workflowStructure: activeTab?.workflow
        ? {
            hasCanvas: !!activeTab.workflow.canvas,
            hasNodes: !!activeTab.workflow.nodes,
            nodeCount:
              activeTab.workflow.canvas?.nodes?.length ||
              activeTab.workflow.nodes?.length ||
              0,
            edgeCount:
              activeTab.workflow.canvas?.edges?.length ||
              activeTab.workflow.edges?.length ||
              0,
          }
        : null,
    });

    // Also check what the canvas getters return
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    console.log('🖼️ SourceEditor - Canvas state:', {
      canvasNodeCount: currentNodes.length,
      canvasEdgeCount: currentEdges.length,
      sampleCanvasNodes: currentNodes.slice(0, 2).map(n => ({
        id: n.id,
        type: n.type,
        label: n.data?.label,
      })),
    });
  }, [activeTab, getNodes, getEdges]);

  // Manual refresh function to update PlantUML from current canvas
  const refreshFromCanvas = useCallback(async () => {
    if (!activeTab) return;

    setIsLoading(true);
    try {
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      console.log('🔄 Manually refreshing PlantUML from canvas:', {
        tabName: activeTab.name,
        nodes: currentNodes.length,
        edges: currentEdges.length,
      });

      if (currentNodes.length > 0) {
        const plantumlContent = flowToPlantUML(
          currentNodes,
          currentEdges,
          activeTab.name
        );
        setContent(plantumlContent);
      } else {
        setContent(getDefaultPlantUMLContent(activeTab.name));
      }
    } catch (error) {
      console.error('❌ Failed to refresh PlantUML from canvas:', error);
      setContent(getDefaultPlantUMLContent(activeTab.name));
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, getNodes, getEdges]);

  const getDefaultPlantUMLContent = (workflowName: string) => {
    return `@startuml ${workflowName}
!theme plain

title ${workflowName}

' Add your workflow nodes and connections here
' Example:
' rectangle "Start" as start
' rectangle "Process" as process
' rectangle "End" as end
'
' start --> process
' process --> end

@enduml`;
  };

  // PlantUML validation function
  const validatePlantUML = useCallback(
    async (content: string): Promise<boolean> => {
      try {
        // Basic validation - check for @startuml and @enduml
        const hasStart = content.includes('@startuml');
        const hasEnd = content.includes('@enduml');

        if (!hasStart || !hasEnd) {
          return false;
        }

        // Additional validation could be added here
        // For now, we'll just check basic syntax
        return true;
      } catch (error) {
        console.error('PlantUML validation error:', error);
        return false;
      }
    },
    []
  );

  // PlantUML rendering function using web service
  const renderPlantUML = useCallback(
    async (content: string): Promise<string> => {
      try {
        // Use PlantUML web service for rendering
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        const renderUrl = `https://www.plantuml.com/plantuml/svg/${encodedContent}`;
        return renderUrl;
      } catch (error) {
        console.error('PlantUML rendering error:', error);
        throw new Error('Failed to render PlantUML diagram');
      }
    },
    []
  );

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);

      // Automatically update the visual flow when PlantUML content changes
      // Use debounced update to avoid too frequent updates while typing
      if (onUpdate) {
        // Clear existing timeout
        if (
          typeof window !== 'undefined' &&
          (window as any).plantUMLUpdateTimeout
        ) {
          clearTimeout((window as any).plantUMLUpdateTimeout);
        }

        // Set new timeout for debounced update
        (window as any).plantUMLUpdateTimeout = setTimeout(() => {
          console.log('🔄 Auto-updating visual flow from PlantUML changes');
          console.log(
            '📝 PlantUML content being sent to parser:',
            `${newContent.substring(0, 200)}...`
          );

          try {
            onUpdate(newContent);
            console.log('✅ Successfully updated visual flow from PlantUML');
          } catch (error) {
            console.error('❌ Failed to auto-update visual flow:', error);
            // Continue without throwing to avoid breaking the editor
          }
        }, 800); // Increased to 800ms for better stability
      }
    },
    [onUpdate]
  );

  const handleSave = useCallback(async () => {
    if (!activeTab) {
      console.warn('Cannot save: No active tab selected');
      return;
    }

    setIsSaving(true);
    try {
      // Primary: Update through tab state hook
      if (effectiveTabState) {
        console.log('✅ Saving content through tab state hook');
        effectiveTabState.updateSourceState(content);
      } else {
        // Fallback: Direct localStorage (during migration only)
        console.warn('Tab state hook not available, using fallback storage');
        const storageKey = activeTab.path || `tab-${activeTab.id}`;
        localStorage.setItem(`puml-content-${storageKey}`, content);
      }

      // Try to call the tab save function, but don't fail if it has issues
      try {
        await saveTab(activeTab.id);
        console.log('✅ Tab workflow saved successfully');
      } catch (tabSaveError) {
        console.warn(
          'Tab workflow save had issues (but PlantUML content was saved):',
          tabSaveError
        );
        // Don't throw this error - the PlantUML content save is more important for source editing
      }

      console.log(
        '✅ PlantUML content saved successfully for tab:',
        activeTab.name
      );

      // Show user feedback
      const savedIndicator = document.createElement('div');
      savedIndicator.textContent = '✅ Saved!';
      savedIndicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        z-index: 9999;
        font-size: 14px;
      `;
      document.body.appendChild(savedIndicator);
      setTimeout(() => document.body.removeChild(savedIndicator), 2000);
    } catch (error) {
      console.error('❌ Failed to save PlantUML content:', error);
      alert('Failed to save PlantUML content. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [activeTab, content, saveTab]);

  const handleUpdate = useCallback(() => {
    onUpdate?.(content);
  }, [content, onUpdate]);

  // Show loading state while tabs are loading
  if (tabsLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-slate-50',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <div className="text-sm text-slate-500">Loading workflows...</div>
        </div>
      </div>
    );
  }

  // Show helpful message if no active tab but tabs exist
  if (!activeTab) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-slate-50',
          className
        )}
      >
        <div className="text-center">
          <div className="text-slate-500 mb-2">No active workflow</div>
          {tabs.length === 0 ? (
            <div className="text-xs text-slate-400">
              Creating new workflow...
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Select a tab to view its source
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-slate-50',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <div className="text-sm text-slate-500">Loading PlantUML...</div>
        </div>
      </div>
    );
  }

  const fileInfo = activeTab
    ? {
        path: activeTab.path || `tab-${activeTab.id}`,
        lastModified: new Date(),
        size: content.length,
      }
    : undefined;

  const plantUMLSettings = {
    validationEnabled: true,
    renderUrl: 'https://www.plantuml.com/plantuml',
    onValidate: validatePlantUML,
    onRender: renderPlantUML,
  };

  return (
    <CodeEditor
      className={className}
      title={
        activeTab ? `PlantUML Source: ${activeTab.name}` : 'PlantUML Source'
      }
      language="plantuml"
      content={content}
      onContentChange={handleContentChange}
      onSave={handleSave}
      isLoading={isLoading}
      isSaving={isSaving}
      placeholder="Enter PlantUML syntax here..."
      fileInfo={fileInfo}
      enableRichTextMode={true}
      plantUMLSettings={plantUMLSettings}
    />
  );
}
