// React import removed
import {
  Columns,
  Grid2X2,
  Layout,
  Monitor,
  PanelBottom,
  PanelLeft,
  PanelRight,
  PanelTop,
  RectangleHorizontal,
  RectangleVertical,
  Sidebar,
  Square,
} from 'lucide-react';
import type { LayoutContainer, LayoutTemplate, Panel } from '../types/layout';

// VSCode-style layout templates
export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'default',
    name: 'Default',
    description:
      'Standard three-panel layout with left sidebar, main content, and right panel',
    icon: <Layout className="w-4 h-4" />,
    layout: {
      id: 'default-root',
      type: 'horizontal',
      children: [
        {
          id: 'left-sidebar',
          type: 'vertical',
          children: [],
          size: 20, // 20% width
        },
        {
          id: 'main-content',
          type: 'vertical',
          children: [],
          size: 60, // 60% width
        },
        {
          id: 'right-panel',
          type: 'vertical',
          children: [],
          size: 20, // 20% width
        },
      ],
    },
    defaultPanels: [],
  },

  {
    id: 'left-sidebar-only',
    name: 'Left Sidebar',
    description: 'Simple layout with left sidebar and main content area',
    icon: <PanelLeft className="w-4 h-4" />,
    layout: {
      id: 'left-only-root',
      type: 'horizontal',
      children: [
        {
          id: 'left-sidebar',
          type: 'vertical',
          children: [],
          size: 25,
        },
        {
          id: 'main-content',
          type: 'vertical',
          children: [],
          size: 75,
        },
      ],
    },
    defaultPanels: [],
  },

  {
    id: 'right-sidebar-only',
    name: 'Right Sidebar',
    description: 'Simple layout with main content and right sidebar',
    icon: <PanelRight className="w-4 h-4" />,
    layout: {
      id: 'right-only-root',
      type: 'horizontal',
      children: [
        {
          id: 'main-content',
          type: 'vertical',
          children: [],
          size: 75,
        },
        {
          id: 'right-sidebar',
          type: 'vertical',
          children: [],
          size: 25,
        },
      ],
    },
    defaultPanels: [],
  },

  {
    id: 'top-bottom',
    name: 'Top/Bottom Split',
    description: 'Horizontal split with top and bottom panels',
    icon: <RectangleHorizontal className="w-4 h-4" />,
    layout: {
      id: 'top-bottom-root',
      type: 'vertical',
      children: [
        {
          id: 'top-panel',
          type: 'horizontal',
          children: [],
          size: 50,
        },
        {
          id: 'bottom-panel',
          type: 'horizontal',
          children: [],
          size: 50,
        },
      ],
    },
    defaultPanels: [],
  },

  {
    id: 'left-right',
    name: 'Left/Right Split',
    description: 'Vertical split with left and right panels',
    icon: <RectangleVertical className="w-4 h-4" />,
    layout: {
      id: 'left-right-root',
      type: 'horizontal',
      children: [
        {
          id: 'left-panel',
          type: 'vertical',
          children: [],
          size: 50,
        },
        {
          id: 'right-panel',
          type: 'vertical',
          children: [],
          size: 50,
        },
      ],
    },
    defaultPanels: [],
  },

  {
    id: 'grid-2x2',
    name: '2x2 Grid',
    description: 'Four-panel grid layout',
    icon: <Grid2X2 className="w-4 h-4" />,
    layout: {
      id: 'grid-root',
      type: 'vertical',
      children: [
        {
          id: 'top-row',
          type: 'horizontal',
          children: [
            {
              id: 'top-left',
              type: 'vertical',
              children: [],
              size: 50,
            },
            {
              id: 'top-right',
              type: 'vertical',
              children: [],
              size: 50,
            },
          ],
          size: 50,
        },
        {
          id: 'bottom-row',
          type: 'horizontal',
          children: [
            {
              id: 'bottom-left',
              type: 'vertical',
              children: [],
              size: 50,
            },
            {
              id: 'bottom-right',
              type: 'vertical',
              children: [],
              size: 50,
            },
          ],
          size: 50,
        },
      ],
    },
    defaultPanels: [],
  },

  {
    id: 'three-columns',
    name: 'Three Columns',
    description: 'Three equal columns layout',
    icon: <Columns className="w-4 h-4" />,
    layout: {
      id: 'three-col-root',
      type: 'horizontal',
      children: [
        {
          id: 'left-column',
          type: 'vertical',
          children: [],
          size: 33.33,
        },
        {
          id: 'center-column',
          type: 'vertical',
          children: [],
          size: 33.33,
        },
        {
          id: 'right-column',
          type: 'vertical',
          children: [],
          size: 33.34,
        },
      ],
    },
    defaultPanels: [],
  },

  {
    id: 'full-screen',
    name: 'Full Screen',
    description: 'Single full-screen panel',
    icon: <Monitor className="w-4 h-4" />,
    layout: {
      id: 'fullscreen-root',
      type: 'vertical',
      children: [],
    },
    defaultPanels: [],
  },

  {
    id: 'zen-mode',
    name: 'Zen Mode',
    description: 'Distraction-free single panel view',
    icon: <Square className="w-4 h-4" />,
    layout: {
      id: 'zen-root',
      type: 'vertical',
      children: [],
    },
    defaultPanels: [],
  },

  {
    id: 'editor-focus',
    name: 'Editor Focus',
    description: 'Large central editor with minimal sidebars',
    icon: <Layout className="w-4 h-4" />,
    layout: {
      id: 'editor-focus-root',
      type: 'horizontal',
      children: [
        {
          id: 'minimal-left',
          type: 'vertical',
          children: [],
          size: 15,
        },
        {
          id: 'editor-main',
          type: 'vertical',
          children: [],
          size: 70,
        },
        {
          id: 'minimal-right',
          type: 'vertical',
          children: [],
          size: 15,
        },
      ],
    },
    defaultPanels: [],
  },

  {
    id: 'terminal-bottom',
    name: 'Terminal Bottom',
    description: 'Main content with terminal at bottom',
    icon: <PanelBottom className="w-4 h-4" />,
    layout: {
      id: 'terminal-root',
      type: 'vertical',
      children: [
        {
          id: 'main-area',
          type: 'horizontal',
          children: [
            {
              id: 'sidebar',
              type: 'vertical',
              children: [],
              size: 25,
            },
            {
              id: 'editor',
              type: 'vertical',
              children: [],
              size: 75,
            },
          ],
          size: 70,
        },
        {
          id: 'terminal',
          type: 'horizontal',
          children: [],
          size: 30,
        },
      ],
    },
    defaultPanels: [],
  },

  {
    id: 'debug-layout',
    name: 'Debug Layout',
    description:
      'Optimized for debugging with variables, watch, and call stack',
    icon: <PanelTop className="w-4 h-4" />,
    layout: {
      id: 'debug-root',
      type: 'horizontal',
      children: [
        {
          id: 'debug-sidebar',
          type: 'vertical',
          children: [],
          size: 20,
        },
        {
          id: 'debug-main',
          type: 'vertical',
          children: [
            {
              id: 'debug-editor',
              type: 'horizontal',
              children: [],
              size: 70,
            },
            {
              id: 'debug-console',
              type: 'horizontal',
              children: [],
              size: 30,
            },
          ],
          size: 60,
        },
        {
          id: 'debug-info',
          type: 'vertical',
          children: [],
          size: 20,
        },
      ],
    },
    defaultPanels: [],
  },
];

// Helper function to get template by ID
export function getLayoutTemplate(id: string): LayoutTemplate | undefined {
  return LAYOUT_TEMPLATES.find(template => template.id === id);
}

// Helper function to get template categories
export function getTemplateCategories(): string[] {
  return ['Basic', 'Split', 'Grid', 'Focus', 'Debug'];
}

// Helper function to group templates by category
export function getTemplatesByCategory(): Record<string, LayoutTemplate[]> {
  return {
    Basic: LAYOUT_TEMPLATES.filter(t =>
      [
        'default',
        'left-sidebar-only',
        'right-sidebar-only',
        'full-screen',
      ].includes(t.id)
    ),
    Split: LAYOUT_TEMPLATES.filter(t =>
      ['top-bottom', 'left-right', 'three-columns'].includes(t.id)
    ),
    Grid: LAYOUT_TEMPLATES.filter(t => ['grid-2x2'].includes(t.id)),
    Focus: LAYOUT_TEMPLATES.filter(t =>
      ['zen-mode', 'editor-focus'].includes(t.id)
    ),
    Debug: LAYOUT_TEMPLATES.filter(t =>
      ['terminal-bottom', 'debug-layout'].includes(t.id)
    ),
  };
}
