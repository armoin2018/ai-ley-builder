import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';

interface CanvasControlsProps {
  className?: string;
}

export function CanvasControls({ className }: CanvasControlsProps) {
  const { zoomIn, zoomOut, zoomTo, fitView, getZoom } = useReactFlow();

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

  const currentZoom = Math.round(getZoom() * 100);

  return (
    <div
      className={cn(
        'absolute top-4 left-4 z-10 flex flex-col gap-2 p-2',
        'bg-white border border-slate-200 rounded-lg shadow-lg',
        'backdrop-blur-sm bg-white/95',
        className
      )}
    >
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
    </div>
  );
}
