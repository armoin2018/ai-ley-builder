import React, { useEffect } from 'react';
import { useLayout } from '@features/layout';
import type { Panel as LayoutPanel } from '@features/layout';
import {
  FlowCanvas,
  NodeInspector,
  NodePalette,
} from '@features/canvas/components';
import { ValidationPanel } from '@features/validation/components/ValidationPanel';
import { ExecutionPanel } from '@features/execution/components/ExecutionPanel';
import { SourceEditor, TabbedRightPanel } from '@features/tabs';
import { CheckSquare, Code, Layers, Palette, Play, Search } from 'lucide-react';

interface LayoutInitializerProps {
  nodes: any[];
  edges: any[];
  isSourceView: boolean;
  onPlantUMLUpdate: (content: string) => void;
  lastSaved: Date;
}

export function LayoutInitializer({
  nodes,
  edges,
  isSourceView,
  onPlantUMLUpdate,
  lastSaved,
}: LayoutInitializerProps) {
  const { state, dispatch } = useLayout();

  // Use a ref to track if we've already initialized
  const initializedRef = React.useRef(false);

  useEffect(() => {
    // Only initialize once by checking if we've already done so
    if (initializedRef.current) {
      return; // Already initialized
    }

    // Check if panels already exist (in case context was restored)
    if (Object.keys(state.panels).length > 0) {
      initializedRef.current = true;
      return; // Panels already exist
    }

    // Define sample panels with existing components
    const samplePanels: LayoutPanel[] = [
      {
        id: 'node-palette',
        title: 'Node Palette',
        icon: <Palette className="w-4 h-4" />,
        content: <NodePalette />,
        closable: false,
        collapsible: true,
        collapsed: false,
      },
      {
        id: 'main-canvas',
        title: isSourceView ? 'Source Editor' : 'Canvas',
        icon: isSourceView ? (
          <Code className="w-4 h-4" />
        ) : (
          <Layers className="w-4 h-4" />
        ),
        content: isSourceView ? (
          <SourceEditor
            onUpdate={onPlantUMLUpdate}
            className="flex-1"
            refreshTrigger={lastSaved}
          />
        ) : (
          <div className="flex-1 bg-muted/50 p-4 h-full">
            <FlowCanvas />
          </div>
        ),
        closable: false,
        collapsible: false,
        collapsed: false,
      },
      {
        id: 'node-inspector',
        title: 'Tools',
        icon: <Search className="w-4 h-4" />,
        content: <TabbedRightPanel />,
        closable: true,
        collapsible: true,
        collapsed: false,
      },
      {
        id: 'validation-panel',
        title: 'Validation',
        icon: <CheckSquare className="w-4 h-4" />,
        content: (
          <div className="p-4 h-full">
            <ValidationPanel
              nodes={nodes}
              edges={edges}
              isOpen={true}
              onClose={() => {}}
              onNodeSelect={nodeId => console.log('Selected node:', nodeId)}
            />
          </div>
        ),
        closable: true,
        collapsible: true,
        collapsed: false,
      },
      {
        id: 'execution-panel',
        title: 'Execution',
        icon: <Play className="w-4 h-4" />,
        content: (
          <div className="p-4 h-full">
            <ExecutionPanel
              nodes={nodes}
              edges={edges}
              isOpen={true}
              onClose={() => {}}
            />
          </div>
        ),
        closable: true,
        collapsible: true,
        collapsed: false,
      },
    ];

    // Mark as initialized first to prevent re-runs
    initializedRef.current = true;

    // Add all panels to the layout system
    samplePanels.forEach(panel => {
      dispatch({ type: 'ADD_PANEL', panel, containerId: 'root' });
    });

    // Apply default template after adding panels
    setTimeout(() => {
      dispatch({
        type: 'APPLY_TEMPLATE',
        template: {
          id: 'default',
          name: 'Default',
          description: 'Default layout',
          layout: {
            id: 'default-root',
            type: 'horizontal',
            children: [
              {
                id: 'left-sidebar',
                type: 'vertical',
                children: [{ id: 'node-palette' }],
                size: 15,
              },
              {
                id: 'main-content',
                type: 'vertical',
                children: [{ id: 'main-canvas' }],
                size: 70,
              },
              {
                id: 'right-panel',
                type: 'vertical',
                children: [{ id: 'node-inspector' }],
                size: 15,
              },
            ],
          },
          defaultPanels: [],
        },
      });
    }, 100);
  }, [dispatch]); // Remove the other dependencies to prevent re-initialization

  // Separate effect to update the main-canvas panel when isSourceView changes
  useEffect(() => {
    // Only update if we've already initialized
    if (!initializedRef.current) {
      return;
    }

    // Update the main-canvas panel content based on isSourceView
    const updatedPanel: LayoutPanel = {
      id: 'main-canvas',
      title: isSourceView ? 'Source Editor' : 'Canvas',
      icon: isSourceView ? (
        <Code className="w-4 h-4" />
      ) : (
        <Layers className="w-4 h-4" />
      ),
      content: isSourceView ? (
        <SourceEditor
          onUpdate={onPlantUMLUpdate}
          className="flex-1"
          refreshTrigger={lastSaved}
        />
      ) : (
        <div className="flex-1 bg-muted/50 p-4 h-full">
          <FlowCanvas />
        </div>
      ),
      closable: false,
      collapsible: false,
      collapsed: false,
    };

    dispatch({ type: 'UPDATE_PANEL', panel: updatedPanel });
  }, [isSourceView, onPlantUMLUpdate, lastSaved, dispatch]);

  return null; // This component only initializes, doesn't render anything
}
