import { useCallback, useEffect, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';
import { useSettings } from '../../../hooks/useSettings';

interface CanvasControlsProps {
  className?: string;
}

export function CanvasControls({ className }: CanvasControlsProps) {
  const {
    zoomIn,
    zoomOut,
    zoomTo,
    fitView,
    getZoom,
    getNodes,
    getEdges,
    setNodes,
  } = useReactFlow();
  const { settings } = useSettings();

  // Draggable state
  const [position, setPosition] = useState({
    x: 20,
    y: window.innerHeight - 300,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const controlsRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 300 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 300 });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({
      duration: 500,
      padding: 0.1,
      includeHiddenNodes: false,
      minZoom: 0.1,
      maxZoom: 1.5,
    });
  }, [fitView]);

  const handleZoomReset = useCallback(() => {
    zoomTo(1, { duration: 300 });
  }, [zoomTo]);

  const handleAutoArrange = useCallback(() => {
    try {
      const currentNodes = getNodes();
      const currentEdges = getEdges();

      if (currentNodes.length === 0) {
        console.log('No nodes to arrange');
        return;
      }

      // Import the auto-arrange utility dynamically
      import('../../../utils/autoArrange')
        .then(({ autoArrangeNodesWithAnimation }) => {
          const { autoArrange } = settings.umlFlows;
          const arrangedNodes = autoArrangeNodesWithAnimation(
            currentNodes,
            currentEdges,
            {
              horizontalSpacing: autoArrange.horizontalSpacing,
              verticalSpacing: autoArrange.verticalSpacing,
              connectionSpacing: autoArrange.connectionSpacing,
              enableConnectionAwareSpacing:
                autoArrange.enableConnectionAwareSpacing,
              minSpacing: autoArrange.minSpacing,
              enableCollisionDetection: autoArrange.enableCollisionDetection,
              startX: 200,
              startY: 100,
              direction: 'top-to-bottom',
            }
          );

          // Apply the new positions
          setNodes(arrangedNodes);

          console.log(`Auto arranged ${arrangedNodes.length} nodes`);
        })
        .catch(error => {
          console.error('Failed to load auto-arrange utility:', error);
        });
    } catch (error) {
      console.error('Auto arrange failed:', error);
    }
  }, [getNodes, getEdges, setNodes, settings.umlFlows.autoArrange]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!controlsRef.current) return;

    setIsDragging(true);
    const rect = controlsRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = Math.max(
        0,
        Math.min(window.innerWidth - 200, e.clientX - dragOffset.x)
      );
      const newY = Math.max(
        0,
        Math.min(window.innerHeight - 300, e.clientY - dragOffset.y)
      );

      setPosition({ x: newX, y: newY });
    },
    [isDragging, dragOffset]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global event listeners for drag
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

  const currentZoom = Math.round(getZoom() * 100);

  return (
    <div
      ref={controlsRef}
      className={cn(
        'fixed z-20 flex flex-col gap-2 p-2',
        'bg-white border border-slate-200 rounded-lg shadow-lg',
        'backdrop-blur-sm bg-white/95',
        'select-none',
        isDragging && 'cursor-grabbing',
        className
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Drag Handle */}
      <div
        className={cn(
          'w-full h-2 rounded-t bg-slate-100 hover:bg-slate-200',
          'cursor-grab active:cursor-grabbing',
          'flex items-center justify-center'
        )}
        onMouseDown={handleMouseDown}
        title="Drag to move"
      >
        <div className="w-6 h-0.5 bg-slate-400 rounded-full" />
      </div>
      {/* Zoom In */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomIn}
        className="w-10 h-10 p-0 hover:bg-blue-50"
        title="Zoom In"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <line x1="11" y1="8" x2="11" y2="14" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </Button>

      {/* Zoom Out */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomOut}
        className="w-10 h-10 p-0 hover:bg-blue-50"
        title="Zoom Out"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </Button>

      {/* Zoom Reset */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleZoomReset}
        className="w-10 h-10 p-0 hover:bg-blue-50 text-xs"
        title={`Reset Zoom (${currentZoom}%)`}
      >
        {currentZoom}%
      </Button>

      {/* Divider */}
      <div className="h-px bg-slate-200 my-1" />

      {/* Fit View */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleFitView}
        className="w-10 h-10 p-0 hover:bg-blue-50"
        title="Fit View"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      </Button>

      {/* Divider */}
      <div className="h-px bg-slate-200 my-1" />

      {/* Auto Arrange */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleAutoArrange}
        className="w-10 h-10 p-0 hover:bg-green-50"
        title="Auto Arrange Nodes"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </Button>
    </div>
  );
}
