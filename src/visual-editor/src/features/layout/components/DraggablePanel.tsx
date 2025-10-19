import React, { useCallback, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, GripVertical, X } from 'lucide-react';
import { cn } from '../../../utils';
import { useLayout } from '../context/LayoutContext';
import type { Panel } from '../types/layout';

interface DraggablePanelProps {
  panel: Panel;
  className?: string;
  onClose?: () => void;
}

export function DraggablePanel({
  panel,
  className,
  onClose,
}: DraggablePanelProps) {
  const { dragState, dispatch } = useLayout();
  const panelRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const isDragging =
    dragState.isDragging && dragState.draggedPanel?.id === panel.id;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!panelRef.current || !dragHandleRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      const offset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      dispatch({
        type: 'START_DRAG',
        panel,
        offset,
      });

      e.preventDefault();
    },
    [panel, dispatch]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragState.dragOffset) return;

      // Update dragged panel position
      if (panelRef.current) {
        panelRef.current.style.position = 'fixed';
        panelRef.current.style.left = `${e.clientX - dragState.dragOffset.x}px`;
        panelRef.current.style.top = `${e.clientY - dragState.dragOffset.y}px`;
        panelRef.current.style.zIndex = '9999';
        panelRef.current.style.pointerEvents = 'none';
      }
    },
    [isDragging, dragState.dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      dispatch({ type: 'END_DRAG' });

      // Reset panel styles
      if (panelRef.current) {
        panelRef.current.style.position = '';
        panelRef.current.style.left = '';
        panelRef.current.style.top = '';
        panelRef.current.style.zIndex = '';
        panelRef.current.style.pointerEvents = '';
      }
    }
  }, [isDragging, dispatch]);

  const handleToggleCollapse = useCallback(() => {
    if (panel.collapsible) {
      dispatch({ type: 'TOGGLE_PANEL_COLLAPSE', panelId: panel.id });
    }
  }, [panel.collapsible, panel.id, dispatch]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={panelRef}
      className={cn(
        'flex flex-col bg-white border border-slate-200 rounded-lg shadow-sm',
        isDragging && 'shadow-lg ring-2 ring-blue-500 ring-opacity-50',
        className
      )}
      style={{
        minWidth: panel.minWidth,
        minHeight: panel.minHeight,
        width: panel.defaultWidth,
        height: panel.defaultHeight,
      }}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50 rounded-t-lg">
        <div
          className={cn(
            'flex items-center gap-2 flex-1',
            panel.collapsible &&
              'cursor-pointer hover:bg-slate-100 -m-1 p-1 rounded'
          )}
          onClick={panel.collapsible ? handleToggleCollapse : undefined}
        >
          {/* Collapse/Expand Icon */}
          {panel.collapsible && (
            <div className="flex items-center justify-center w-4 h-4">
              {panel.collapsed ? (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </div>
          )}

          {panel.icon && (
            <div className="flex items-center justify-center w-4 h-4">
              {panel.icon}
            </div>
          )}
          <span className="text-sm font-medium text-slate-900">
            {panel.title}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Drag Handle */}
          <div
            ref={dragHandleRef}
            className="p-1 rounded hover:bg-slate-200 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
          >
            <GripVertical className="w-4 h-4 text-slate-500" />
          </div>

          {/* Close Button */}
          {panel.closable && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      {!panel.collapsed && (
        <div className="flex-1 overflow-hidden">{panel.content}</div>
      )}
    </div>
  );
}

// Ghost panel that follows the mouse during drag
export function DragGhost() {
  const { dragState } = useLayout();
  const ghostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dragState.isDragging && dragState.draggedPanel && ghostRef.current) {
      const handleMouseMove = (e: MouseEvent) => {
        if (ghostRef.current && dragState.dragOffset) {
          ghostRef.current.style.left = `${e.clientX - dragState.dragOffset.x}px`;
          ghostRef.current.style.top = `${e.clientY - dragState.dragOffset.y}px`;
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [dragState]);

  if (!dragState.isDragging || !dragState.draggedPanel) {
    return null;
  }

  return (
    <div
      ref={ghostRef}
      className="fixed z-50 pointer-events-none opacity-80"
      style={{
        left: 0,
        top: 0,
      }}
    >
      <div className="bg-white border-2 border-blue-500 rounded-lg shadow-xl p-3">
        <div className="flex items-center gap-2">
          {dragState.draggedPanel.icon}
          <span className="text-sm font-medium">
            {dragState.draggedPanel.title}
          </span>
        </div>
      </div>
    </div>
  );
}
