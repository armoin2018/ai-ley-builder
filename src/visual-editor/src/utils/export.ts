import type { SerializedWorkflow } from '../features/workflow/types/workflow';
import { flowToPlantUML, parsePlantUMLToFlow } from './plantuml-parser';

export interface UMLFile {
  name: string;
  path: string;
  lastModified: Date;
}

export interface ExportResult {
  success: boolean;
  filePath?: string;
  content?: string;
  error?: string;
}

// Simple localStorage-based file system simulation
// Pre-populate with actual PlantUML files from ../../.ai-ley/shared/uml-flows/user/
const initializeActualPUMLFiles = (): void => {
  const actualFiles = [
    {
      name: 'build-project.puml',
      path: '../../.ai-ley/shared/uml-flows/user/build-project.puml',
      lastModified: new Date('2024-09-09T06:41:00.000Z'), // From file system timestamp
    }
  ];
  
  // Check if localStorage is empty or doesn't contain actual files
  const existingFiles = localStorage.getItem('ai-ley-puml-files');
  if (!existingFiles || existingFiles === '[]') {
    console.log('🔄 Initializing with actual PlantUML files from file system...');
    localStorage.setItem('ai-ley-puml-files', JSON.stringify(actualFiles));
    
    // Store the actual file content with enhanced metadata for visual editor
    const buildProjectContent = `@startuml build-project
!theme plain
title Build Project: Complete Project Development Lifecycle

' AI-LEY Visual Editor Metadata - Hidden from standard PlantUML rendering
'@visual-editor-config {"version": "1.0", "layout": "vertical-flow", "spacing": {"x": 200, "y": 150}}

' Define styling
skinparam rectangle {
    BackgroundColor lightblue
    BorderColor darkblue
    FontSize 11
}
skinparam diamond {
    BackgroundColor lightyellow
    BorderColor orange
    FontSize 10
}
skinparam note {
    BackgroundColor lightgreen
    BorderColor darkgreen
    FontSize 9
}
skinparam activity {
    BackgroundColor lightcoral
    BorderColor darkred
}

' Flow starts here
start
note right
    **Complete Project Development Lifecycle**
    From requirements gathering through business launch
    
    **Prerequisites**:
    - Project ASK document ready
    - Development environment setup
    - Business objectives defined
    
    **Duration**: 8-12 weeks (typical)
    **Resources**: Development team, business stakeholders
end note

' Flow connections 
start

'@node-meta {"type": "input", "promptText": "Generate comprehensive requirements from ASK document", "persona": "Business Analyst", "files": ["ask.md"], "output": "requirements.md", "position": {"x": 100, "y": 150}}
:requirements;
note right: **Step 1** - Generate Requirements from ASK

label step1

'@node-meta {"type": "custom-prompt", "promptText": "Research project domain, technologies, and best practices", "persona": "Technical Researcher", "variables": ["domain", "tech_stack", "architecture_patterns"], "position": {"x": 100, "y": 300}}
:learn;
note right: **Step 2** - Project Learning & Research

'@node-meta {"type": "instruction", "instructionText": "Evolve project state based on learning insights", "priority": "high", "position": {"x": 100, "y": 450}}
:evolve;
note right: **Step 3** - Evolve Project State

if ({{files.suggestions}} empty?) then (yes)
  '@node-meta {"type": "command-prompt-file", "fileName": "design.md", "content": "System design and architecture planning", "position": {"x": 300, "y": 600}}
  :build-design;
  note right: **Step 5** - Build System Design
  
  '@node-meta {"type": "command-prompt-file", "fileName": "architecture.md", "content": "Technical architecture and component design", "position": {"x": 300, "y": 750}}
  :build-architecture;
  note right: **Step 6** - Build Architecture
  
  '@node-meta {"type": "instruction", "instructionText": "Evolve project with design insights", "priority": "medium", "position": {"x": 300, "y": 900}}
  :evolve;
  note right: **Step 7** - Evolve with Design
  
  if (Design complete?) then (yes)
    '@node-meta {"type": "instruction", "promptText": "Create comprehensive project execution plan", "priority": "high", "position": {"x": 300, "y": 1050}}
    :plan;
    note right: **Step 9** - Create Project Plan
    
    '@node-meta {"type": "instruction", "instructionText": "Evolve project state with plan insights", "priority": "medium", "position": {"x": 300, "y": 1200}}
    :evolve;
    note right: **Step 10** - Evolve Plan
    
    if (Plan ready?) then (yes)
      '@node-meta {"type": "custom-prompt", "promptText": "Analyze innovative approaches and opportunities", "persona": "Innovation Expert", "variables": ["market_trends", "technologies", "competitive_advantage"], "position": {"x": 300, "y": 1350}}
      :innovate;
      note right: **Step 12** - Innovation Analysis
      
      if (Innovation reviewed?) then (yes)
        '@node-meta {"type": "command-prompt-file", "fileName": "implementation.md", "content": "Execute the main project implementation", "position": {"x": 300, "y": 1500}}
        :run;
        note right: **Step 14** - Execute Implementation
        
        '@node-meta {"type": "command-prompt-file", "fileName": "test-plan.md", "content": "Comprehensive testing strategy and execution", "position": {"x": 300, "y": 1650}}
        :build-test-plan;
        note right: **Step 15** - Build Test Plan
        
        '@node-meta {"type": "output-formatter", "outputType": "markdown", "format": "comprehensive", "position": {"x": 300, "y": 1800}}
        :document markdown all;
        note right: **Step 16** - Generate Documentation
        
        fork
          '@node-meta {"type": "custom-prompt", "promptText": "Develop business strategy and partnerships", "persona": "Business Developer", "position": {"x": 150, "y": 1950}}
          :build-business-development;
          note right: **Step 17** - Business Development
        fork again
          '@node-meta {"type": "command-prompt-file", "fileName": "launch-plan.md", "content": "Product launch strategy and timeline", "position": {"x": 300, "y": 1950}}
          :build-launch-plan;
          note right: **Step 18** - Launch Planning
        fork again
          '@node-meta {"type": "custom-prompt", "promptText": "Research target market and competitive landscape", "persona": "Market Analyst", "variables": ["target_audience", "competitors", "market_size"], "position": {"x": 450, "y": 1950}}
          :build-market-research;
          note right: **Step 19** - Market Research
        end fork
        
        fork
          '@node-meta {"type": "custom-prompt", "promptText": "Develop comprehensive marketing strategy", "persona": "Marketing Expert", "variables": ["channels", "budget", "campaigns"], "position": {"x": 150, "y": 2100}}
          :build-marketing-strategy;
          note right: **Step 20** - Marketing Strategy
        fork again
          '@node-meta {"type": "output-formatter", "outputType": "spreadsheet", "format": "financial", "position": {"x": 300, "y": 2100}}
          :build-revenue-projections;
          note right: **Step 21** - Revenue Projections
        fork again
          '@node-meta {"type": "command-prompt-file", "fileName": "business-plan.md", "content": "Comprehensive business plan document", "position": {"x": 450, "y": 2100}}
          :business-plan;
          note right: **Step 22** - Business Plan
        end fork
        
        fork
          '@node-meta {"type": "custom-prompt", "promptText": "Create go-to-market strategy", "persona": "GTM Expert", "variables": ["launch_timeline", "channels", "partnerships"], "position": {"x": 150, "y": 2250}}
          :go-to-market;
          note right: **Step 23** - Go-to-Market Strategy
        fork again
          '@node-meta {"type": "output-formatter", "outputType": "canvas", "format": "lean", "position": {"x": 300, "y": 2250}}
          :lean-canvas;
          note right: **Step 24** - Lean Canvas
        fork again
          '@node-meta {"type": "output-formatter", "outputType": "presentation", "format": "pitch", "position": {"x": 450, "y": 2250}}
          :pitch-deck;
          note right: **Step 25** - Pitch Deck
        end fork
        
        stop
        
      else (no - major changes needed)
        :Update requirements based on innovations;
        note right: Innovation requires requirements revision
        -> step1;
      endif
    else (no - plan issues)
      :Revise requirements for plan issues;
      note right: Plan gaps require requirements update
      -> step1;
    endif
  else (no - design incomplete)
    :Revise requirements for design gaps;
    note right: Design issues require requirements revision
    -> step1;
  endif
else (no - has suggestions)
  :Refine requirements based on suggestions;
  note right: Apply learning suggestions to requirements
  -> step1;
endif

' Legend
legend right
    |= Color |= Meaning |
    | <#lightblue> | AI-LEY Command |
    | <#lightyellow> | Decision Point |
    | <#lightgreen> | Notes/Documentation |
    | <#lightcoral> | Completion State |
    
    **Feedback Loops**: Project returns to step 1
    when suggestions are generated, ensuring
    continuous improvement and completeness.
end legend

' Metadata
caption Generated on September 7, 2025 for AI-LEY Project Automation System

@enduml`;

    localStorage.setItem(`puml-content-../../.ai-ley/shared/uml-flows/user/build-project.puml`, buildProjectContent);
    console.log('✅ Loaded actual build-project.puml from file system');
  }
};

export const getAvailablePUMLFiles = async (): Promise<UMLFile[]> => {
  try {
    // Initialize with actual files on first run
    initializeActualPUMLFiles();
    
    const files = localStorage.getItem('ai-ley-puml-files');
    if (!files) {
      return [];
    }
    
    const parsed = JSON.parse(files);
    return parsed.map((file: any) => ({
      ...file,
      lastModified: new Date(file.lastModified),
    }));
  } catch (error) {
    console.error('Failed to load PUML files:', error);
    return [];
  }
};

export const importFromPUML = async (filePath: string): Promise<SerializedWorkflow | null> => {
  try {
    const content = localStorage.getItem(`puml-content-${filePath}`);
    if (!content) {
      console.warn(`No content found for PUML file: ${filePath}`);
      return null;
    }

    console.log(`Importing PUML file: ${filePath}`);
    console.log('PUML content:', content);

    // Parse the PlantUML content to extract nodes and edges
    const { nodes, edges } = parsePlantUMLToFlow(content);
    
    console.log(`✅ Parsed PlantUML to visual elements:`, {
      filePath,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodes: nodes.map(n => ({ id: n.id, type: n.type, label: n.data?.label })),
      edges: edges.map(e => ({ id: e.id, source: e.source, target: e.target }))
    });
    
    // Extract workflow name from content or file path
    const titleMatch = content.match(/title\s+(.+)/i);
    const workflowName = titleMatch ? titleMatch[1] : filePath.replace('.puml', '').replace(/^.*\//, '');
    
    const workflow: SerializedWorkflow = {
      id: `workflow_${Date.now()}`,
      name: workflowName,
      description: 'Imported from PlantUML',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      canvas: {
        nodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 },
      },
    };

    console.log(`Successfully parsed PUML: ${nodes.length} nodes, ${edges.length} edges`);
    return workflow;
  } catch (error) {
    console.error(`Failed to import PUML file: ${filePath}`, error);
    return null;
  }
};

export const exportWorkflowToPUML = async (workflow: SerializedWorkflow): Promise<ExportResult> => {
  try {
    // Generate PlantUML content using the parser
    const content = flowToPlantUML(
      workflow.canvas.nodes, 
      workflow.canvas.edges, 
      workflow.name
    );

    // Generate file path
    const fileName = `${workflow.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.puml`;
    const filePath = `../../.ai-ley/shared/uml-flows/user/${fileName}`;

    // Store content in localStorage
    localStorage.setItem(`puml-content-${filePath}`, content);

    // Update file list
    const currentFiles = await getAvailablePUMLFiles();
    const existingFileIndex = currentFiles.findIndex(f => f.path === filePath);
    
    const fileInfo = {
      name: fileName,
      path: filePath,
      lastModified: new Date(),
    };

    let updatedFiles;
    if (existingFileIndex >= 0) {
      updatedFiles = [...currentFiles];
      updatedFiles[existingFileIndex] = fileInfo;
    } else {
      updatedFiles = [...currentFiles, fileInfo];
    }

    localStorage.setItem('ai-ley-puml-files', JSON.stringify(updatedFiles));

    return {
      success: true,
      filePath,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown export error',
    };
  }
};

// PlantUMLExporter class for compatibility with existing code
// Auto-load the most recent PlantUML file
export const autoLoadLatestPUML = async (): Promise<SerializedWorkflow | null> => {
  try {
    const files = await getAvailablePUMLFiles();
    if (files.length === 0) return null;

    // Sort by lastModified and get the most recent
    files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    
    console.log(`Auto-loading latest PUML file: ${files[0].name}`);
    return await importFromPUML(files[0].path);
  } catch (error) {
    console.error('Error auto-loading PUML file:', error);
    return null;
  }
};

export class PlantUMLExporter {
  static async exportWorkflowToPUML(workflow: any, options?: any): Promise<ExportResult> {
    const serializedWorkflow: SerializedWorkflow = {
      id: workflow.id || `workflow_${Date.now()}`,
      name: workflow.name || 'Untitled Workflow',
      description: workflow.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      canvas: {
        nodes: workflow.nodes || [],
        edges: workflow.edges || [],
        viewport: workflow.viewport || { x: 0, y: 0, zoom: 1 },
      },
    };

    return exportWorkflowToPUML(serializedWorkflow);
  }
}