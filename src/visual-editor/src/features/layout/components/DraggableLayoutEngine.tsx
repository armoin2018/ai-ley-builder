import React, { useMemo } from 'react';
import { cn } from '../../../utils';
import { useLayout } from '../context/LayoutContext';
import { DraggablePanel, DragGhost } from './DraggablePanel';
import { DropZoneContainer } from './DropZone';
import type { LayoutContainer, Panel } from '../types/layout';

interface DraggableLayoutEngineProps {
  className?: string;
}

export function DraggableLayoutEngine({
  className,
}: DraggableLayoutEngineProps) {
  const { state } = useLayout();

  // Get root container
  const rootContainer = state.containers[state.rootContainer];

  if (!rootContainer) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full text-slate-500',
          className
        )}
      >
        No layout defined. Select a layout template to get started.
      </div>
    );
  }

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <LayoutRenderer container={rootContainer} />
      <DragGhost />
    </div>
  );
}

interface LayoutRendererProps {
  container: LayoutContainer;
  className?: string;
}

function LayoutRenderer({ container, className }: LayoutRendererProps) {
  const { state, dispatch } = useLayout();

  const handlePanelClose = (panelId: string) => {
    dispatch({ type: 'REMOVE_PANEL', panelId });
  };

  // Determine flex direction based on container type
  const flexDirection =
    container.type === 'horizontal' ? 'flex-row' : 'flex-col';

  // Calculate sizes for children
  const childrenWithSizes = useMemo(() => {
    return container.children.map((child, index) => {
      if (typeof child === 'object' && 'type' in child) {
        // This is a container
        const size = child.size || 100 / container.children.length;
        return { child, size, type: 'container' as const };
      } else {
        // This is a panel
        const size = 100 / container.children.length;
        return { child, size, type: 'panel' as const };
      }
    });
  }, [container.children]);

  if (container.children.length === 0) {
    return (
      <DropZoneContainer
        containerId={container.id}
        className={cn(
          'h-full w-full border-2 border-dashed border-slate-300 bg-slate-50',
          className
        )}
      >
        <div className="flex items-center justify-center h-full text-slate-500">
          <div className="text-center">
            <div className="text-lg mb-2">📋</div>
            <div className="text-sm">Drop panels here</div>
          </div>
        </div>
      </DropZoneContainer>
    );
  }

  return (
    <DropZoneContainer
      containerId={container.id}
      className={cn('flex h-full w-full', flexDirection, className)}
    >
      {childrenWithSizes.map(({ child, size, type }, index) => {
        const key = type === 'container' ? child.id : child.id;

        const sizeStyle =
          container.type === 'horizontal'
            ? { width: `${size}%` }
            : { height: `${size}%` };

        if (type === 'container') {
          return (
            <div key={key} style={sizeStyle} className="relative">
              <LayoutRenderer container={child} className="h-full" />
              {/* Resize handle */}
              {index < container.children.length - 1 && (
                <ResizeHandle
                  direction={
                    container.type === 'horizontal' ? 'vertical' : 'horizontal'
                  }
                  onResize={delta => {
                    const currentChild = child;
                    const containerRect = document
                      .querySelector(`[data-container-id="${container.id}"]`)
                      ?.getBoundingClientRect();
                    if (containerRect) {
                      const percentage =
                        container.type === 'horizontal'
                          ? (delta / containerRect.width) * 100
                          : (delta / containerRect.height) * 100;
                      const newSize = Math.max(
                        5,
                        Math.min(95, (currentChild.size || 50) + percentage)
                      );
                      dispatch({
                        type: 'RESIZE_CONTAINER',
                        containerId: currentChild.id,
                        size: newSize,
                      });
                    }
                  }}
                />
              )}
            </div>
          );
        } else {
          const panel = state.panels[child.id];
          if (!panel) return null;

          return (
            <div key={key} style={sizeStyle} className="relative">
              <DraggablePanel
                panel={panel}
                onClose={() => handlePanelClose(panel.id)}
                className="h-full"
              />
              {/* Resize handle */}
              {index < container.children.length - 1 && (
                <ResizeHandle
                  direction={
                    container.type === 'horizontal' ? 'vertical' : 'horizontal'
                  }
                  onResize={delta => {
                    const currentChild = child as LayoutContainer;
                    const containerRect = document
                      .querySelector(`[data-container-id="${container.id}"]`)
                      ?.getBoundingClientRect();
                    if (containerRect) {
                      const percentage =
                        container.type === 'horizontal'
                          ? (delta / containerRect.width) * 100
                          : (delta / containerRect.height) * 100;
                      const newSize = Math.max(
                        5,
                        Math.min(95, (currentChild.size || 50) + percentage)
                      );
                      dispatch({
                        type: 'RESIZE_CONTAINER',
                        containerId: currentChild.id,
                        size: newSize,
                      });
                    }
                  }}
                />
              )}
            </div>
          );
        }
      })}
    </DropZoneContainer>
  );
}

interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onResize: (delta: number) => void;
}

function ResizeHandle({ direction, onResize }: ResizeHandleProps) {
  const isVertical = direction === 'vertical';

  return (
    <div
      className={cn(
        'absolute bg-transparent hover:bg-blue-500 transition-colors z-10',
        isVertical
          ? 'right-0 top-0 w-1 h-full cursor-col-resize'
          : 'bottom-0 left-0 w-full h-1 cursor-row-resize'
      )}
      onMouseDown={e => {
        e.preventDefault();
        const startPosition = isVertical ? e.clientX : e.clientY;

        const handleMouseMove = (moveEvent: MouseEvent) => {
          const currentPosition = isVertical
            ? moveEvent.clientX
            : moveEvent.clientY;
          const delta = currentPosition - startPosition;
          onResize(delta);
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }}
    />
  );
}

// Tabbed container for when multiple panels are in the same container
interface TabbedContainerProps {
  panels: Panel[];
  onPanelClose: (panelId: string) => void;
  className?: string;
}

function TabbedContainer({
  panels,
  onPanelClose,
  className,
}: TabbedContainerProps) {
  const [activeTab, setActiveTab] = React.useState(0);

  if (panels.length === 0) return null;
  if (panels.length === 1) {
    return (
      <DraggablePanel
        panel={panels[0]}
        onClose={() => onPanelClose(panels[0].id)}
        className={className}
      />
    );
  }

  const activePanel = panels[activeTab];

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Tab Bar */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        {panels.map((panel, index) => (
          <button
            key={panel.id}
            onClick={() => setActiveTab(index)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm border-b-2 transition-colors',
              index === activeTab
                ? 'border-blue-500 bg-white text-blue-700'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            )}
          >
            {panel.icon && <div className="w-4 h-4">{panel.icon}</div>}
            <span>{panel.title}</span>
            {panel.closable && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onPanelClose(panel.id);
                  if (index === activeTab && activeTab > 0) {
                    setActiveTab(activeTab - 1);
                  }
                }}
                className="ml-1 p-1 rounded hover:bg-slate-200"
              >
                ✕
              </button>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">{activePanel.content}</div>
    </div>
  );
}
