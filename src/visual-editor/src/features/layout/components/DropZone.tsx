import React, { useCallback, useEffect, useRef } from 'react';
import { cn } from '../../../utils';
import { useLayout } from '../context/LayoutContext';
import type { DropZone as DropZoneType } from '../types/layout';

interface DropZoneProps {
  zone: DropZoneType;
  className?: string;
  children?: React.ReactNode;
}

export function DropZone({ zone, className, children }: DropZoneProps) {
  const { dragState, dispatch } = useLayout();
  const zoneRef = useRef<HTMLDivElement>(null);
  const isHovered = dragState.hoveredDropZone === zone.id;
  const isDragActive = dragState.isDragging;

  const handleMouseEnter = useCallback(() => {
    if (isDragActive) {
      dispatch({ type: 'SET_HOVERED_DROP_ZONE', zoneId: zone.id });
    }
  }, [isDragActive, zone.id, dispatch]);

  const handleMouseLeave = useCallback(() => {
    if (isDragActive && dragState.hoveredDropZone === zone.id) {
      dispatch({ type: 'SET_HOVERED_DROP_ZONE', zoneId: undefined });
    }
  }, [isDragActive, dragState.hoveredDropZone, zone.id, dispatch]);

  const handleDrop = useCallback(() => {
    if (isDragActive && dragState.draggedPanel && isHovered) {
      dispatch({
        type: 'DROP_PANEL',
        panelId: dragState.draggedPanel.id,
        zoneId: zone.id,
      });
    }
  }, [isDragActive, dragState.draggedPanel, isHovered, zone.id, dispatch]);

  useEffect(() => {
    const element = zoneRef.current;
    if (!element) return;

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseup', handleDrop);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseup', handleDrop);
    };
  }, [handleMouseEnter, handleMouseLeave, handleDrop]);

  return (
    <div
      ref={zoneRef}
      className={cn(
        'relative transition-all duration-150',
        isDragActive && 'ring-2 ring-transparent',
        isHovered && isDragActive && getDropZoneStyles(zone.type),
        className
      )}
      data-drop-zone={zone.id}
      data-drop-type={zone.type}
    >
      {children}

      {/* Drop Zone Indicator */}
      {isDragActive && (
        <DropZoneIndicator type={zone.type} isHovered={isHovered} />
      )}
    </div>
  );
}

interface DropZoneIndicatorProps {
  type: DropZoneType['type'];
  isHovered: boolean;
}

function DropZoneIndicator({ type, isHovered }: DropZoneIndicatorProps) {
  const getIndicatorStyles = () => {
    const baseStyles =
      'absolute pointer-events-none transition-all duration-150 inset-0';
    const hoveredStyles = 'bg-blue-500 opacity-30 border-2 border-blue-600';
    const defaultStyles = 'border-2 border-blue-400 border-dashed opacity-60';

    // Since we're using a 3x3 grid, each zone takes up its full allocated space
    return cn(baseStyles, isHovered ? hoveredStyles : defaultStyles);
  };

  return (
    <div className={getIndicatorStyles()}>
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium shadow-lg">
            Drop here
          </div>
        </div>
      )}
    </div>
  );
}

function getDropZoneStyles(type: DropZoneType['type']): string {
  switch (type) {
    case 'left':
    case 'right':
    case 'top':
    case 'middle':
    case 'bottom':
      return 'ring-blue-400 bg-blue-50';
    case 'center':
    case 'tab':
      return 'ring-green-400 bg-green-50';
    default:
      return 'ring-gray-400 bg-gray-50';
  }
}

// Container component that automatically creates drop zones
interface DropZoneContainerProps {
  containerId: string;
  className?: string;
  children?: React.ReactNode;
  enableDropZones?: boolean;
}

export function DropZoneContainer({
  containerId,
  className,
  children,
  enableDropZones = true,
}: DropZoneContainerProps) {
  const { dragState } = useLayout();
  const containerRef = useRef<HTMLDivElement>(null);

  // Create drop zones for this container
  const createDropZones = useCallback(() => {
    if (!enableDropZones || !dragState.isDragging || !containerRef.current) {
      return [];
    }

    const rect = containerRef.current.getBoundingClientRect();

    // Create a 3x3 grid of drop zones
    const zones: DropZoneType[] = [
      // Top row (left, center, right)
      {
        id: `${containerId}-top-left`,
        type: 'left',
        parentId: containerId,
        position: {
          x: rect.left,
          y: rect.top,
          width: rect.width / 3,
          height: rect.height / 3,
        },
      },
      {
        id: `${containerId}-top-center`,
        type: 'top',
        parentId: containerId,
        position: {
          x: rect.left + rect.width / 3,
          y: rect.top,
          width: rect.width / 3,
          height: rect.height / 3,
        },
      },
      {
        id: `${containerId}-top-right`,
        type: 'right',
        parentId: containerId,
        position: {
          x: rect.left + (2 * rect.width) / 3,
          y: rect.top,
          width: rect.width / 3,
          height: rect.height / 3,
        },
      },
      // Middle row (left, center, right)
      {
        id: `${containerId}-middle-left`,
        type: 'left',
        parentId: containerId,
        position: {
          x: rect.left,
          y: rect.top + rect.height / 3,
          width: rect.width / 3,
          height: rect.height / 3,
        },
      },
      {
        id: `${containerId}-middle-center`,
        type: 'center',
        parentId: containerId,
        position: {
          x: rect.left + rect.width / 3,
          y: rect.top + rect.height / 3,
          width: rect.width / 3,
          height: rect.height / 3,
        },
      },
      {
        id: `${containerId}-middle-right`,
        type: 'right',
        parentId: containerId,
        position: {
          x: rect.left + (2 * rect.width) / 3,
          y: rect.top + rect.height / 3,
          width: rect.width / 3,
          height: rect.height / 3,
        },
      },
      // Bottom row (left, center, right)
      {
        id: `${containerId}-bottom-left`,
        type: 'left',
        parentId: containerId,
        position: {
          x: rect.left,
          y: rect.top + (2 * rect.height) / 3,
          width: rect.width / 3,
          height: rect.height / 3,
        },
      },
      {
        id: `${containerId}-bottom-center`,
        type: 'bottom',
        parentId: containerId,
        position: {
          x: rect.left + rect.width / 3,
          y: rect.top + (2 * rect.height) / 3,
          width: rect.width / 3,
          height: rect.height / 3,
        },
      },
      {
        id: `${containerId}-bottom-right`,
        type: 'right',
        parentId: containerId,
        position: {
          x: rect.left + (2 * rect.width) / 3,
          y: rect.top + (2 * rect.height) / 3,
          width: rect.width / 3,
          height: rect.height / 3,
        },
      },
    ];

    return zones;
  }, [containerId, enableDropZones, dragState.isDragging]);

  const zones = createDropZones();

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      data-container-id={containerId}
    >
      {children}

      {/* Render drop zones when dragging - position them in a 3x3 grid */}
      {dragState.isDragging &&
        zones.map((zone, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          const gridPositionClasses = `absolute z-10`;
          const sizeClasses = 'w-1/3 h-1/3';
          const positionClasses = {
            top: `${row * 33.333}%`,
            left: `${col * 33.333}%`,
          };

          return (
            <DropZone
              key={zone.id}
              zone={zone}
              className={`${gridPositionClasses} ${sizeClasses}`}
              style={positionClasses}
            />
          );
        })}
    </div>
  );
}
