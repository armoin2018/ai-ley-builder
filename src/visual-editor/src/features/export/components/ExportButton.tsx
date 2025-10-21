import { useReactFlow } from '@xyflow/react';
import { Download } from 'lucide-react';
import { Button } from '../../../shared/components';
import { cn } from '../../../utils';
import { PlantUMLExporter } from '../../../utils/export';

interface ExportButtonProps {
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function ExportButton({
  className,
  variant = 'outline',
  size = 'sm',
}: ExportButtonProps) {
  const { getNodes, getEdges } = useReactFlow();

  const handleExport = async () => {
    try {
      const nodes = getNodes();
      const edges = getEdges();

      const workflow = {
        name: 'AI-LEY Workflow',
        description: 'Visual workflow exported from AI-LEY Builder',
        nodes,
        edges,
      };

      const result = await PlantUMLExporter.exportWorkflowToPUML(workflow, {
        includeNodeProperties: true,
        formatStyle: 'detailed',
      });

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
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant={variant}
      size={size}
      className={cn('flex items-center gap-2', className)}
      title="Export workflow to PlantUML"
    >
      <Download className="w-4 h-4" />
      Export PUML
    </Button>
  );
}
