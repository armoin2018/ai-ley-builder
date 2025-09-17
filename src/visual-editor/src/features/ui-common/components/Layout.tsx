import { type ReactNode } from 'react';
import { cn } from '../../../utils';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div
      className={cn(
        'flex h-screen w-full overflow-hidden bg-background',
        className
      )}
    >
      {children}
    </div>
  );
}

interface SidebarProps {
  children: ReactNode;
  side?: 'left' | 'right';
  width?: string;
  className?: string;
}

export function Sidebar({
  children,
  side = 'left',
  width = 'w-64',
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col border-border bg-card',
        width,
        {
          'border-r': side === 'left',
          'border-l': side === 'right',
        },
        className
      )}
    >
      {children}
    </aside>
  );
}

interface MainContentProps {
  children: ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main className={cn('flex flex-1 flex-col overflow-hidden', className)}>
      {children}
    </main>
  );
}

interface HeaderProps {
  children: ReactNode;
  className?: string;
}

export function Header({ children, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'flex h-14 items-center border-b border-border bg-background px-6',
        className
      )}
    >
      {children}
    </header>
  );
}

interface ContentAreaProps {
  children: ReactNode;
  className?: string;
}

export function ContentArea({ children, className }: ContentAreaProps) {
  return (
    <div className={cn('flex flex-1 overflow-hidden', className)}>
      {children}
    </div>
  );
}

interface PanelProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function Panel({ children, title, className }: PanelProps) {
  return (
    <div
      className={cn('flex flex-col border border-border bg-card', className)}
    >
      {title && (
        <div className="border-b border-border bg-muted px-4 py-2">
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
      )}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
