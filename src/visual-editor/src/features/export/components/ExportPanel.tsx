import { useReactFlow } from '@xyflow/react';
import { Download, FileText, Settings } from 'lucide-react';
import { useState } from 'react';
import { Button, Card } from '../../../shared/components';
import type { PlantUMLExportOptions } from '../../../types/export';
import { cn } from '../../../utils';
import { PlantUMLExporter } from '../../../utils/export/index';

interface ExportPanelProps {
  className?: string;
}

export function ExportPanel({ className }: ExportPanelProps) {
  const { getNodes, getEdges } = useReactFlow();
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<PlantUMLExportOptions>({
    includeNodeProperties: true,
    formatStyle: 'detailed',
    outputPath: PlantUMLExporter.getDefaultExportPath(),
  });

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const nodes = getNodes();
      const edges = getEdges();

      const workflow = {
        name: 'AI-LEY Workflow',
        description: 'Visual workflow exported from AI-LEY Builder',
        nodes,
        edges,
      };

      const result = await PlantUMLExporter.exportWorkflowToPUML(
        workflow,
        options
      );

      if (result.success) {
        console.log(`Workflow exported successfully to ${result.filePath}`);
      } else {
        console.error('Export failed:', result.error);
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(
        `Export error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = () => {
    try {
      const nodes = getNodes();
      const edges = getEdges();

      const workflow = {
        name: 'AI-LEY Workflow Preview',
        description: 'Preview of PlantUML export',
        nodes,
        edges,
      };

      const pumlContent = PlantUMLExporter.convertWorkflowToPlantUML(
        workflow,
        options
      );

      // Show preview in a modal or new window
      const previewWindow = window.open(
        '',
        'PlantUML Preview',
        'width=800,height=600'
      );
      if (previewWindow) {
        previewWindow.document.write(`
          <html>
            <head><title>PlantUML Preview</title></head>
            <body>
              <h1>PlantUML Preview</h1>
              <pre style="background: #f5f5f5; padding: 16px; border-radius: 4px; font-family: monospace;">${pumlContent}</pre>
            </body>
          </html>
        `);
        previewWindow.document.close();
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert(
        `Preview error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  return (
    <Card className={cn('p-4 space-y-4', className)}>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-slate-900">
          PlantUML Export
        </h3>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Export Options
          </label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.includeNodeProperties || false}
                onChange={e =>
                  setOptions(prev => ({
                    ...prev,
                    includeNodeProperties: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">
                Include node properties
              </span>
            </label>

            <div>
              <label className="text-sm text-slate-600">Format Style:</label>
              <select
                value={options.formatStyle || 'simple'}
                onChange={e =>
                  setOptions(prev => ({
                    ...prev,
                    formatStyle: e.target.value as 'simple' | 'detailed',
                  }))
                }
                className="ml-2 px-2 py-1 text-sm border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="simple">Simple</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Output Location
          </label>
          <div className="mt-1 text-sm text-slate-600 bg-slate-50 p-2 rounded border">
            {options.outputPath || PlantUMLExporter.getDefaultExportPath()}
            *.puml
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Files will be downloaded to your browser's default download location
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-200">
        <Button
          onClick={handlePreview}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Preview
        </Button>

        <Button
          onClick={handleExport}
          disabled={isExporting}
          size="sm"
          className="flex items-center gap-2 flex-1"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Export to PUML'}
        </Button>
      </div>
    </Card>
  );
}
