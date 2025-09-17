// PlantUML export types

export interface PlantUMLExportOptions {
  includeNodeProperties?: boolean;
  includeValidation?: boolean;
  formatStyle?: 'simple' | 'detailed';
  outputPath?: string;
}

export interface PlantUMLNode {
  id: string;
  type: string;
  label: string;
  description?: string;
  properties?: Record<string, any>;
}

export interface PlantUMLEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface PlantUMLWorkflow {
  id: string;
  name: string;
  description?: string;
  nodes: PlantUMLNode[];
  edges: PlantUMLEdge[];
  metadata?: Record<string, any>;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
}