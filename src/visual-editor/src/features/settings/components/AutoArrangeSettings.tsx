import React from 'react';
import { Grid3X3 } from 'lucide-react';
import { Input, Label } from '../../../shared/components';
import { useSettings } from '../../../hooks/useSettings';

export function AutoArrangeSettings() {
  const { settings, updateUMLFlowsSettings } = useSettings();
  const { umlFlows } = settings;

  const handleAutoArrangeSettingChange = (
    setting: string,
    value: number | boolean
  ) => {
    updateUMLFlowsSettings({
      autoArrange: {
        ...umlFlows.autoArrange,
        [setting]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
        <Grid3X3 className="w-5 h-5 text-green-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Auto-Arrange Settings
          </h3>
          <p className="text-sm text-slate-600">
            Configure how nodes are automatically arranged based on connections
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Connection Spacing */}
        <div className="space-y-2">
          <Label
            htmlFor="connection-spacing"
            className="text-sm font-medium text-slate-700"
          >
            Connection Spacing (px)
          </Label>
          <div className="space-y-1">
            <Input
              id="connection-spacing"
              type="number"
              value={umlFlows.autoArrange.connectionSpacing}
              onChange={e =>
                handleAutoArrangeSettingChange(
                  'connectionSpacing',
                  parseInt(e.target.value) || 50
                )
              }
              min="10"
              max="200"
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              Extra spacing between connected nodes (input/output handles)
            </p>
          </div>
        </div>

        {/* Enable Connection-Aware Spacing */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">
              Connection-Aware Spacing
            </Label>
            <p className="text-xs text-slate-500">
              Add extra spacing between nodes based on their connections
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={umlFlows.autoArrange.enableConnectionAwareSpacing}
              onChange={e =>
                handleAutoArrangeSettingChange(
                  'enableConnectionAwareSpacing',
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>

        {/* Horizontal Spacing */}
        <div className="space-y-2">
          <Label
            htmlFor="horizontal-spacing"
            className="text-sm font-medium text-slate-700"
          >
            Horizontal Spacing (px)
          </Label>
          <div className="space-y-1">
            <Input
              id="horizontal-spacing"
              type="number"
              value={umlFlows.autoArrange.horizontalSpacing}
              onChange={e =>
                handleAutoArrangeSettingChange(
                  'horizontalSpacing',
                  parseInt(e.target.value) || 300
                )
              }
              min="100"
              max="800"
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              Base horizontal spacing between node columns
            </p>
          </div>
        </div>

        {/* Vertical Spacing */}
        <div className="space-y-2">
          <Label
            htmlFor="vertical-spacing"
            className="text-sm font-medium text-slate-700"
          >
            Vertical Spacing (px)
          </Label>
          <div className="space-y-1">
            <Input
              id="vertical-spacing"
              type="number"
              value={umlFlows.autoArrange.verticalSpacing}
              onChange={e =>
                handleAutoArrangeSettingChange(
                  'verticalSpacing',
                  parseInt(e.target.value) || 150
                )
              }
              min="50"
              max="400"
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              Base vertical spacing between node layers
            </p>
          </div>
        </div>

        {/* Minimum Spacing */}
        <div className="space-y-2">
          <Label
            htmlFor="min-spacing"
            className="text-sm font-medium text-slate-700"
          >
            Minimum Spacing (px)
          </Label>
          <div className="space-y-1">
            <Input
              id="min-spacing"
              type="number"
              value={umlFlows.autoArrange.minSpacing}
              onChange={e =>
                handleAutoArrangeSettingChange(
                  'minSpacing',
                  parseInt(e.target.value) || 10
                )
              }
              min="10"
              max="100"
              className="w-full"
            />
            <p className="text-xs text-slate-500">
              Minimum spacing to prevent node overlap
            </p>
          </div>
        </div>

        {/* Enable Collision Detection */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-slate-700">
              Collision Detection
            </Label>
            <p className="text-xs text-slate-500">
              Automatically adjust positions to prevent node overlaps
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={umlFlows.autoArrange.enableCollisionDetection}
              onChange={e =>
                handleAutoArrangeSettingChange(
                  'enableCollisionDetection',
                  e.target.checked
                )
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
        </div>
      </div>

      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="text-xs text-green-700">
          <strong>Tip:</strong> Start with default values and adjust based on
          your workflow complexity. Larger workflows may benefit from increased
          spacing values.
        </div>
      </div>
    </div>
  );
}
