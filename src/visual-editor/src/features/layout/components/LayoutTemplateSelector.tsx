import {
  Bookmark,
  ChevronDown,
  RefreshCw,
  Save,
  Settings,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';
import { useLayout } from '../context/LayoutContext';
import { type NamedView, namedViewsService } from '../services/namedViews';
import {
  getTemplatesByCategory,
  LAYOUT_TEMPLATES,
} from '../templates/layoutTemplates';
import type { LayoutTemplate } from '../types/layout';

interface LayoutTemplateSelectorProps {
  className?: string;
  showAsList?: boolean;
}

export function LayoutTemplateSelector({
  className,
  showAsList = false,
}: LayoutTemplateSelectorProps) {
  const { applyTemplate, dispatch, state } = useLayout();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string>('default');
  const [savedViews, setSavedViews] = useState<NamedView[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveViewName, setSaveViewName] = useState('');

  // Load saved views on component mount
  useEffect(() => {
    const loadSavedViews = () => {
      const viewsStorage = namedViewsService.loadViews();
      setSavedViews(viewsStorage.views);
    };
    loadSavedViews();
  }, []);

  const handleTemplateSelect = (template: LayoutTemplate) => {
    setActiveTemplate(template.id);
    applyTemplate(template);
    setIsOpen(false);
  };

  const handleSaveView = () => {
    if (saveViewName.trim()) {
      const savedView = namedViewsService.saveView(
        saveViewName.trim(),
        '',
        state
      );
      setSavedViews([...savedViews, savedView]);
      setSaveViewName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadView = (view: NamedView) => {
    const template = namedViewsService.viewToTemplate(view);
    setActiveTemplate(view.id);
    applyTemplate(template);
    setIsOpen(false);
  };

  const handleDeleteView = (viewId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    namedViewsService.deleteView(viewId);
    setSavedViews(savedViews.filter(view => view.id !== viewId));
  };

  if (showAsList) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Saved Views Section */}
        {savedViews.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-semibold text-slate-700">
                Saved Views
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSaveDialog(true)}
                className="text-xs"
              >
                <Save className="w-3 h-3 mr-1" />
                Save Current
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {savedViews.map(view => (
                <div key={view.id} className="relative">
                  <button
                    onClick={() => handleLoadView(view)}
                    className={cn(
                      'w-full flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-150 hover:shadow-md',
                      activeTemplate === view.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    )}
                    title={view.description || view.name}
                  >
                    <div className="flex items-center justify-center w-5 h-5">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium text-center leading-tight">
                      {view.name}
                    </span>
                  </button>
                  <button
                    onClick={e => handleDeleteView(view.id, e)}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                    title="Delete view"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Template Categories */}
        {Object.entries(getTemplatesByCategory()).map(
          ([category, templates]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-semibold text-slate-700">
                  {category}
                </h3>
                {category === 'Standard' && savedViews.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(true)}
                    className="text-xs"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save Current
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {templates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isActive={activeTemplate === template.id}
                    onClick={() => handleTemplateSelect(template)}
                  />
                ))}
              </div>
            </div>
          )
        )}

        {/* Save Dialog for List View */}
        {showSaveDialog && (
          <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
            <h4 className="text-sm font-medium text-slate-900">
              Save Current Layout
            </h4>
            <input
              type="text"
              placeholder="Enter view name..."
              value={saveViewName}
              onChange={e => setSaveViewName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveView}
                disabled={!saveViewName.trim()}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveViewName('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Settings className="w-4 h-4" />
        Layout
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
        />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-4 min-w-80 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Layout Templates
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              {/* Saved Views Section */}
              {savedViews.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Saved Views
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSaveDialog(true)}
                      className="text-xs px-2 py-1"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save Current
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {savedViews.map(view => (
                      <div key={view.id} className="relative">
                        <button
                          onClick={() => handleLoadView(view)}
                          className={cn(
                            'w-full flex flex-col items-center gap-2 p-2 rounded-lg border transition-all duration-150 hover:shadow-md',
                            activeTemplate === view.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          )}
                          title={view.description || view.name}
                        >
                          <div className="flex items-center justify-center w-4 h-4">
                            <Bookmark className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-medium text-center leading-tight">
                            {view.name}
                          </span>
                        </button>
                        <button
                          onClick={e => handleDeleteView(view.id, e)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center"
                          title="Delete view"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Template Categories */}
              {Object.entries(getTemplatesByCategory()).map(
                ([category, templates]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                        {category}
                      </h4>
                      {category === 'Standard' && savedViews.length === 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSaveDialog(true)}
                          className="text-xs px-2 py-1"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Save Current
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {templates.map(template => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isActive={activeTemplate === template.id}
                          onClick={() => handleTemplateSelect(template)}
                          size="sm"
                        />
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Save Dialog */}
            {showSaveDialog && (
              <div className="mt-4 p-3 border-t border-slate-200 space-y-3">
                <h4 className="text-sm font-medium text-slate-900">
                  Save Current Layout
                </h4>
                <input
                  type="text"
                  placeholder="Enter view name..."
                  value={saveViewName}
                  onChange={e => setSaveViewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveView}
                    disabled={!saveViewName.trim()}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowSaveDialog(false);
                      setSaveViewName('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface TemplateCardProps {
  template: LayoutTemplate;
  isActive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

function TemplateCard({
  template,
  isActive,
  onClick,
  size = 'md',
}: TemplateCardProps) {
  const cardSize = size === 'sm' ? 'p-2' : 'p-3';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border transition-all duration-150 hover:shadow-md',
        cardSize,
        isActive
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      )}
      title={template.description}
    >
      <div className={cn('flex items-center justify-center', iconSize)}>
        {template.icon}
      </div>
      <span className={cn('font-medium text-center leading-tight', textSize)}>
        {template.name}
      </span>
    </button>
  );
}

// Quick layout toggle buttons for the toolbar
export function LayoutQuickToggles({ className }: { className?: string }) {
  const { applyTemplate } = useLayout();
  const [activeTemplate, setActiveTemplate] = useState<string>('default');

  // Most commonly used templates for quick access
  const quickTemplates = LAYOUT_TEMPLATES.filter(template =>
    [
      'default',
      'left-sidebar-only',
      'right-sidebar-only',
      'left-right',
      'full-screen',
    ].includes(template.id)
  );

  const handleTemplateSelect = (template: LayoutTemplate) => {
    setActiveTemplate(template.id);
    applyTemplate(template);
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {quickTemplates.map(template => (
        <Button
          key={template.id}
          variant={activeTemplate === template.id ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => handleTemplateSelect(template)}
          title={template.description}
          className="p-2"
        >
          {template.icon}
        </Button>
      ))}
    </div>
  );
}

// Layout reset button
export function LayoutResetButton({ className }: { className?: string }) {
  const { applyTemplate } = useLayout();

  const handleReset = () => {
    const defaultTemplate = LAYOUT_TEMPLATES.find(t => t.id === 'default');
    if (defaultTemplate) {
      applyTemplate(defaultTemplate);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleReset}
      className={cn('flex items-center gap-2', className)}
      title="Reset to default layout"
    >
      <RefreshCw className="w-4 h-4" />
      Reset Layout
    </Button>
  );
}
