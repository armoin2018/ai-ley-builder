import { type ReactNode, useCallback, useState } from 'react';
import { cn } from '../../../utils';

interface ResizablePanelProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  side?: 'left' | 'right';
  className?: string;
  onResize?: (width: number) => void;
}

export function ResizablePanel({
  children,
  defaultWidth = 300,
  minWidth = 200,
  maxWidth = 600,
  side = 'left',
  className,
  onResize,
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      let newWidth: number;
      if (side === 'left') {
        newWidth = e.clientX;
      } else {
        newWidth = window.innerWidth - e.clientX;
      }

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(newWidth);
      onResize?.(newWidth);
    },
    [isResizing, side, minWidth, maxWidth, onResize]
  );

  // Add event listeners for mouse events
  useState(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  });

  return (
    <div
      className={cn('relative flex flex-col', className)}
      style={{ width: `${width}px` }}
    >
      {children}
      <div
        className={cn(
          'absolute top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-border',
          {
            'right-0': side === 'left',
            'left-0': side === 'right',
          },
          {
            'bg-border': isResizing,
          }
        )}
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}

interface ResizableLayoutProps {
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
  children: ReactNode;
  leftPanelProps?: Omit<ResizablePanelProps, 'children' | 'side'>;
  rightPanelProps?: Omit<ResizablePanelProps, 'children' | 'side'>;
  className?: string;
}

export function ResizableLayout({
  leftPanel,
  rightPanel,
  children,
  leftPanelProps,
  rightPanelProps,
  className,
}: ResizableLayoutProps) {
  return (
    <div className={cn('flex h-full w-full overflow-hidden', className)}>
      {leftPanel && (
        <ResizablePanel side="left" {...leftPanelProps}>
          {leftPanel}
        </ResizablePanel>
      )}
      <div className="flex flex-1 overflow-hidden">{children}</div>
      {rightPanel && (
        <ResizablePanel side="right" {...rightPanelProps}>
          {rightPanel}
        </ResizablePanel>
      )}
    </div>
  );
}
