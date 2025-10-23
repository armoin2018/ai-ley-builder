import type { Edge, Node } from '@xyflow/react';

export interface ParsedFlow {
  nodes: Node[];
  edges: Edge[];
  errors?: ParseError[];
  warnings?: ParseWarning[];
}

export interface ParseError {
  line: number;
  message: string;
  context?: string;
}

export interface ParseWarning {
  line: number;
  message: string;
  context?: string;
}

// Default properties for each node type based on validation requirements
function getDefaultPropertiesForNodeType(
  nodeType: string
): Record<string, any> {
  switch (nodeType) {
    case 'command-prompt-file':
      return {
        fileName: 'prompt.md',
        content: '',
        variables: [],
      };
    case 'custom-prompt':
      return {
        promptText: '',
        variables: [],
      };
    case 'persona':
      return {
        personaType: 'Expert Assistant',
        tone: 'professional',
        expertise: '',
        background: '',
        communication_style: 'direct',
      };
    case 'instruction':
      return {
        instructionText: '',
        priority: 'medium',
      };
    case 'conditional':
      return {
        condition: '',
        trueLabel: 'True',
        falseLabel: 'False',
      };
    case 'loop':
      return {
        loopType: 'for',
        maxIterations: 10,
        condition: '',
      };
    case 'output-formatter':
      return {
        outputType: 'text',
        format: 'structured',
      };
    case 'input':
      return {
        label: 'Input Node',
        dataType: 'string',
        defaultValue: '',
      };
    case 'output':
      return {
        label: 'Output Node',
        format: 'json',
      };
    case 'injector':
      return {
        label: 'Injector',
        triggerType: 'manual',
        payload: '{}',
        payloadType: 'json',
        interval: 60,
        cronExpression: '0 * * * * *',
        autoStart: false,
        repeatCount: 0,
      };
    case 'group':
      return {
        label: 'Transform Node',
        transformType: 'map',
        customScript: '',
      };
    case 'filter':
      return {
        label: 'Filter Node',
        condition: '// Return true to pass, false to filter out\nreturn true;',
      };
    case 'join':
      return {
        label: 'Join Node',
        joinType: 'inner',
        joinKeys: [],
      };
    default:
      return {
        label: 'Default Node',
        description: '',
      };
  }
}

/**
 * Helper function to create a node with full metadata restoration
 * This ensures round-trip conversion preserves all node data
 */
function createNodeWithMetadata(
  baseNode: Partial<Node>,
  metadata: Record<string, unknown> | null,
  autoPosition: { x: number; y: number }
): Node {
  const node: Node = {
    id: (metadata?.id as string) || baseNode.id || `node_${Date.now()}`,
    type: (metadata?.type as string) || baseNode.type || 'default',
    position: (metadata?.position as { x: number; y: number }) || autoPosition,
    data: metadata?.data || baseNode.data || {},
  };

  // Restore optional metadata fields
  if (metadata?.width) node.width = metadata.width as number;
  if (metadata?.height) node.height = metadata.height as number;
  if (metadata?.selected !== undefined)
    node.selected = metadata.selected as boolean;
  if (metadata?.dragging !== undefined)
    node.dragging = metadata.dragging as boolean;

  return node;
}

export function parsePlantUMLToFlow(plantumlContent: string): ParsedFlow {
  console.log('🔍 parsePlantUMLToFlow - Starting to parse PlantUML content');
  console.log('📄 Content length:', plantumlContent.length);
  console.log(
    '📄 Content preview (first 500 chars):',
    plantumlContent.substring(0, 500)
  );

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const errors: ParseError[] = [];
  const warnings: ParseWarning[] = [];
  const lines = plantumlContent.split('\n').map(line => line.trim());

  console.log(`📋 Split into ${lines.length} lines`);

  // Handle empty content gracefully
  if (!plantumlContent || plantumlContent.trim().length === 0) {
    warnings.push({
      line: 0,
      message: 'Empty PlantUML content - using default template',
    });
    // Return a default starter node
    return {
      nodes: [
        {
          id: 'start_node',
          type: 'input',
          position: { x: 100, y: 100 },
          data: { label: 'Start', shape: 'rectangle' },
        },
      ],
      edges: [],
      errors,
      warnings,
    };
  }

  let nodeCounter = 0;
  let edgeCounter = 0;
  const nodeMap = new Map<string, string>(); // alias -> id mapping

  let currentNodeMetadata: any = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Skip empty lines
    if (!line) {
      continue;
    }

    // Parse AI-LEY metadata comments with error handling
    if (line.startsWith("'@node-meta ")) {
      try {
        const metadataJson = line.substring("'@node-meta ".length);
        currentNodeMetadata = JSON.parse(metadataJson);
        console.log('🔧 Found node metadata:', currentNodeMetadata);
        continue;
      } catch (error) {
        errors.push({
          line: lineNumber,
          message: 'Invalid node metadata JSON',
          context: line,
        });
        console.warn('⚠️ Invalid node metadata JSON:', line);
        currentNodeMetadata = null;
        continue;
      }
    }

    // Parse workflow-level metadata
    if (line.startsWith("'@workflow-meta ")) {
      try {
        const metadataJson = line.substring("'@workflow-meta ".length);
        const workflowMetadata = JSON.parse(metadataJson);
        console.log('🎯 Found workflow metadata:', workflowMetadata);
        continue;
      } catch (error) {
        console.warn('⚠️ Invalid workflow metadata JSON:', line);
        continue;
      }
    }

    // Skip other comments and PlantUML directives
    if (line.startsWith("'") || line.startsWith('!') || line.startsWith('@')) {
      continue;
    }

    // Parse activity diagram nodes - :activity_name;
    // Examples: :requirements;, :learn;, :build-design;
    const activityMatch = line.match(/^\s*:([^:;]+);/);
    if (activityMatch) {
      const [, activityName] = activityMatch;
      const nodeId = `node_${++nodeCounter}`;
      const alias = activityName.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Use metadata type or fallback to auto-detection
      const nodeType =
        currentNodeMetadata?.type || getActivityNodeType(activityName);
      nodeMap.set(alias, nodeId);

      console.log(
        `✅ Found activity node: "${activityName}" -> ${nodeType} (${nodeId})`
      );
      if (currentNodeMetadata) {
        console.log(`   🔧 Using metadata:`, currentNodeMetadata);
      }

      const defaultProps = getDefaultPropertiesForNodeType(nodeType);

      // Merge metadata with default properties
      const nodeData = currentNodeMetadata?.data || {
        label: activityName,
        alias,
        shape: 'activity',
        activityType: activityName,
        properties: {
          ...defaultProps,
          // Override with metadata properties if present
          ...(currentNodeMetadata?.data?.properties || {}),
        },
      };

      // Use metadata position or calculate grid position
      const position = currentNodeMetadata?.position || {
        x: (nodeCounter - 1) * 200,
        y: Math.floor((nodeCounter - 1) / 4) * 150,
      };

      // Create node with full metadata restoration
      const node: Node = {
        id: currentNodeMetadata?.id || nodeId,
        type: nodeType,
        position,
        data: nodeData,
      };

      // Restore optional metadata fields
      if (currentNodeMetadata?.width) node.width = currentNodeMetadata.width;
      if (currentNodeMetadata?.height) node.height = currentNodeMetadata.height;
      if (currentNodeMetadata?.selected !== undefined)
        node.selected = currentNodeMetadata.selected;
      if (currentNodeMetadata?.dragging !== undefined)
        node.dragging = currentNodeMetadata.dragging;

      nodes.push(node);

      // Reset metadata after use
      currentNodeMetadata = null;
      continue;
    }

    // Parse start node
    if (line.trim() === 'start') {
      const nodeId = `node_${++nodeCounter}`;
      const alias = 'start';
      nodeMap.set(alias, nodeId);

      const defaultProps = getDefaultPropertiesForNodeType('input');

      nodes.push({
        id: nodeId,
        type: 'input',
        position: {
          x: (nodeCounter - 1) * 200,
          y: Math.floor((nodeCounter - 1) / 4) * 150,
        },
        data: {
          label: 'Start',
          alias,
          shape: 'start',
          properties: defaultProps,
        },
      });
      continue;
    }

    // Parse stop node
    if (line.trim() === 'stop') {
      const nodeId = `node_${++nodeCounter}`;
      const alias = 'stop';
      nodeMap.set(alias, nodeId);

      const defaultProps = getDefaultPropertiesForNodeType('output');

      nodes.push({
        id: nodeId,
        type: 'output',
        position: {
          x: (nodeCounter - 1) * 200,
          y: Math.floor((nodeCounter - 1) / 4) * 150,
        },
        data: {
          label: 'Stop',
          alias,
          shape: 'stop',
          properties: defaultProps,
        },
      });
      continue;
    }

    // Parse conditional nodes - if (condition) then (yes/no)
    const ifMatch = line.match(/^\s*if\s*\(([^)]+)\)\s*then\s*\(([^)]+)\)/);
    if (ifMatch) {
      const [, condition, yesLabel] = ifMatch;
      const nodeId = `node_${++nodeCounter}`;
      const alias = `if_${nodeCounter}`;
      nodeMap.set(alias, nodeId);

      const defaultProps = getDefaultPropertiesForNodeType('conditional');

      nodes.push({
        id: nodeId,
        type: 'conditional',
        position: {
          x: (nodeCounter - 1) * 200,
          y: Math.floor((nodeCounter - 1) / 4) * 150,
        },
        data: {
          label: condition,
          alias,
          shape: 'diamond',
          condition,
          trueLabel: yesLabel,
          falseLabel: 'no',
          properties: {
            ...defaultProps,
            condition,
            trueLabel: yesLabel,
            falseLabel: 'no',
          },
        },
      });
      continue;
    }

    // Parse label nodes for loops and references
    const labelMatch = line.match(/^\s*label\s+(\w+)/);
    if (labelMatch) {
      const [, labelName] = labelMatch;
      const nodeId = `node_${++nodeCounter}`;
      const alias = labelName;
      nodeMap.set(alias, nodeId);

      const defaultProps = getDefaultPropertiesForNodeType('default');

      nodes.push({
        id: nodeId,
        type: 'default',
        position: {
          x: (nodeCounter - 1) * 200,
          y: Math.floor((nodeCounter - 1) / 4) * 150,
        },
        data: {
          label: labelName,
          alias,
          shape: 'label',
          properties: defaultProps,
        },
      });
      continue;
    }

    // Parse rectangle/component definitions (legacy support)
    // Examples:
    // rectangle "Start" as start
    // rectangle "Process Step" as process
    // component "API Call" as api
    const rectMatch = line.match(
      /^(rectangle|component|actor|database|cloud|folder|frame|package|node)\s+"([^"]+)"\s+as\s+(\w+)/
    );
    if (rectMatch) {
      const [, shape, label, alias] = rectMatch;
      const nodeId = `node_${++nodeCounter}`;
      const nodeType = getNodeType(shape);
      nodeMap.set(alias, nodeId);

      // Get default properties for this node type and merge with PlantUML data
      const defaultProps = getDefaultPropertiesForNodeType(nodeType);

      nodes.push({
        id: nodeId,
        type: nodeType,
        position: {
          x: (nodeCounter - 1) * 200,
          y: Math.floor((nodeCounter - 1) / 4) * 150,
        },
        data: {
          label,
          alias,
          shape,
          properties: defaultProps,
        },
      });
      continue;
    }

    // Parse simple rectangle without alias (legacy support)
    // Example: rectangle "Simple Node"
    const simpleRectMatch = line.match(
      /^(rectangle|component|actor|database|cloud|folder|frame|package|node)\s+"([^"]+)"/
    );
    if (simpleRectMatch) {
      const [, shape, label] = simpleRectMatch;
      const nodeId = `node_${++nodeCounter}`;
      const nodeType = getNodeType(shape);
      const alias = label.toLowerCase().replace(/[^a-z0-9]/g, '');
      nodeMap.set(alias, nodeId);

      // Get default properties for this node type and merge with PlantUML data
      const defaultProps = getDefaultPropertiesForNodeType(nodeType);

      nodes.push({
        id: nodeId,
        type: nodeType,
        position: {
          x: (nodeCounter - 1) * 200,
          y: Math.floor((nodeCounter - 1) / 4) * 150,
        },
        data: {
          label,
          alias,
          shape,
          properties: defaultProps,
        },
      });
      continue;
    }

    // Parse activity diagram connections - -> target;
    // Examples: -> step1;, -> requirements;
    const activityGotoMatch = line.match(/^\s*->\s*(\w+);/);
    if (activityGotoMatch) {
      const [, targetAlias] = activityGotoMatch;

      // Store this for later connection when we know the source context
      // For now, we'll need to track these and connect them after parsing
      // This is a simplification - real PlantUML parsing would need more context
      const targetId = nodeMap.get(targetAlias);
      if (targetId) {
        // Store goto connection for post-processing
        // For now, we'll skip these complex connections
      }
      continue;
    }

    // Parse explicit connections
    // Examples:
    // start --> process
    // process -> end
    // api --> database : "query"
    const connectionMatch = line.match(
      /^(\w+)\s*(-->|->|\.\.>|\.\.\.>)\s*(\w+)(?:\s*:\s*"([^"]+)")?/
    );
    if (connectionMatch) {
      const [, sourceAlias, arrow, targetAlias, label] = connectionMatch;

      const sourceId = nodeMap.get(sourceAlias);
      const targetId = nodeMap.get(targetAlias);

      if (sourceId && targetId) {
        edges.push({
          id: `edge_${++edgeCounter}`,
          source: sourceId,
          target: targetId,
          type: getEdgeType(arrow),
          label: label || undefined,
          data: {
            arrow,
            originalLabel: label,
          },
        });
      }
      continue;
    }

    // Parse simple node definitions (just text without quotes)
    // Example: start
    const simpleNodeMatch = line.match(/^(\w+)$/);
    if (simpleNodeMatch && !nodeMap.has(simpleNodeMatch[1])) {
      const alias = simpleNodeMatch[1];
      const nodeId = `node_${++nodeCounter}`;
      const nodeType = 'default';
      nodeMap.set(alias, nodeId);

      // Get default properties for this node type and merge with PlantUML data
      const defaultProps = getDefaultPropertiesForNodeType(nodeType);

      nodes.push({
        id: nodeId,
        type: nodeType,
        position: {
          x: (nodeCounter - 1) * 200,
          y: Math.floor((nodeCounter - 1) / 4) * 150,
        },
        data: {
          label: alias,
          alias,
          shape: 'rectangle',
          properties: defaultProps,
        },
      });
    }
  }

  // Create implicit sequential connections for activity diagrams
  // In activity diagrams, sequential activities are automatically connected
  createImplicitActivityConnections(nodes, edges, nodeMap);

  console.log(`🎯 parsePlantUMLToFlow - Parsing complete:`);
  console.log(`   📊 Total nodes found: ${nodes.length}`);
  console.log(`   🔗 Total edges found: ${edges.length}`);
  if (nodes.length > 0) {
    console.log(
      `   📝 Sample nodes:`,
      nodes.slice(0, 3).map(n => ({
        id: n.id,
        type: n.type,
        label: n.data?.label,
      }))
    );
  }

  // Log parsing summary
  if (errors.length > 0) {
    console.warn(`⚠️ Parsing completed with ${errors.length} error(s)`);
    errors.forEach(err => {
      console.warn(`  Line ${err.line}: ${err.message}`);
    });
  }

  if (warnings.length > 0) {
    console.warn(`ℹ️ Parsing completed with ${warnings.length} warning(s)`);
    warnings.forEach(warn => {
      console.warn(`  Line ${warn.line}: ${warn.message}`);
    });
  }

  return { nodes, edges, errors, warnings };
}

function createImplicitActivityConnections(
  nodes: Node[],
  edges: Edge[],
  nodeMap: Map<string, string>
): void {
  // Create basic sequential connections between activity nodes
  // This is a simplified approach - real PlantUML has more complex flow control

  const activityNodes = nodes.filter(
    node =>
      node.data?.shape === 'activity' ||
      node.data?.shape === 'start' ||
      node.data?.shape === 'stop'
  );

  // Connect sequential activity nodes with basic flow
  for (let i = 0; i < activityNodes.length - 1; i++) {
    const currentNode = activityNodes[i];
    const nextNode = activityNodes[i + 1];

    // Skip if there's already an explicit connection
    const existingConnection = edges.find(
      edge => edge.source === currentNode.id && edge.target === nextNode.id
    );

    if (!existingConnection) {
      edges.push({
        id: `implicit_edge_${i}`,
        source: currentNode.id,
        target: nextNode.id,
        type: 'default',
        data: {
          arrow: '-->',
          implicit: true,
        },
      });
    }
  }
}

function getActivityNodeType(activityName: string): string {
  const activity = activityName.toLowerCase();

  // Map AI-LEY specific activities to appropriate node types
  if (activity.includes('requirements') || activity.includes('ask')) {
    return 'input';
  }
  if (activity.includes('learn') || activity.includes('research')) {
    return 'custom-prompt';
  }
  if (activity.includes('evolve') || activity.includes('update')) {
    return 'instruction';
  }
  if (
    activity.includes('build') ||
    activity.includes('create') ||
    activity.includes('generate')
  ) {
    return 'command-prompt-file';
  }
  if (
    activity.includes('plan') ||
    activity.includes('design') ||
    activity.includes('architecture')
  ) {
    return 'instruction';
  }
  if (activity.includes('innovate') || activity.includes('analyze')) {
    return 'custom-prompt';
  }
  if (
    activity.includes('run') ||
    activity.includes('execute') ||
    activity.includes('implement')
  ) {
    return 'command-prompt-file';
  }
  if (activity.includes('test') || activity.includes('document')) {
    return 'output-formatter';
  }
  if (
    activity.includes('business') ||
    activity.includes('marketing') ||
    activity.includes('revenue')
  ) {
    return 'custom-prompt';
  }
  if (
    activity.includes('launch') ||
    activity.includes('market') ||
    activity.includes('canvas') ||
    activity.includes('pitch')
  ) {
    return 'output-formatter';
  }
  if (
    activity.includes('trigger') ||
    activity.includes('timer') ||
    activity.includes('inject') ||
    activity.includes('schedule') ||
    activity.includes('cron')
  ) {
    return 'injector';
  }

  // Default to instruction for most activities
  return 'instruction';
}

function getNodeType(shape: string): string {
  switch (shape.toLowerCase()) {
    case 'rectangle':
      return 'default';
    case 'component':
      return 'default';
    case 'actor':
      return 'input';
    case 'database':
      return 'output';
    case 'cloud':
      return 'default';
    case 'folder':
    case 'frame':
    case 'package':
    case 'node':
      return 'group';
    default:
      return 'default';
  }
}

function getEdgeType(arrow: string): string {
  switch (arrow) {
    case '-->':
    case '->':
      return 'default';
    case '..>':
    case '...>':
      return 'straight';
    default:
      return 'default';
  }
}

/**
 * Detect circular references in the workflow graph
 * Returns true if a cycle is detected
 */
function detectCycles(nodes: Node[], edges: Edge[]): boolean {
  const adjacencyList = new Map<string, string[]>();

  // Build adjacency list
  nodes.forEach(node => adjacencyList.set(node.id, []));
  edges.forEach(edge => {
    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycleDFS(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (hasCycleDFS(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Check all nodes
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (hasCycleDFS(node.id)) {
        return true;
      }
    }
  }

  return false;
}

export function flowToPlantUML(
  nodes: Node[],
  edges: Edge[],
  workflowName: string
): string {
  const lines: string[] = [];

  lines.push(`@startuml ${workflowName}`);
  lines.push('!theme plain');
  lines.push('');
  lines.push(`title ${workflowName}`);
  lines.push('');

  // Add metadata header with execution details
  lines.push('!-- AI-LEY Workflow Execution Metadata --!');
  lines.push('!-- This PlantUML file contains all execution details --!');
  lines.push(
    '!-- Visual Editor Compatibility: Enhanced with node positions, types, and properties --!'
  );
  lines.push(
    `'@workflow-meta ${JSON.stringify({
      name: workflowName,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      generatedAt: new Date().toISOString(),
      version: '2.1.0',
    })}`
  );
  lines.push('');

  // Add nodes with complete execution details
  for (const node of nodes) {
    const shape = node.data?.shape || 'rectangle';
    const alias = node.id.replace(/[^a-z0-9]/gi, '');
    const label = node.data?.label || node.id;
    const nodeType = node.type || 'default';

    // Add metadata comment for complete roundtrip preservation
    const nodeMetadata = {
      id: node.id,
      type: nodeType,
      position: node.position,
      data: node.data,
      width: node.width,
      height: node.height,
      selected: node.selected,
      dragging: node.dragging,
    };

    // Only include metadata that has meaningful values
    const cleanMetadata = Object.fromEntries(
      Object.entries(nodeMetadata).filter(
        ([key, value]) =>
          value !== undefined &&
          value !== null &&
          !(typeof value === 'object' && Object.keys(value).length === 0)
      )
    );

    lines.push(`'@node-meta ${JSON.stringify(cleanMetadata)}`);

    // Create the basic node
    lines.push(`${shape} "${label}" as ${alias}`);

    // Add execution details as notes
    if (node.data && Object.keys(node.data).length > 0) {
      lines.push(`note right of ${alias}`);
      lines.push(`  **Node Type:** ${nodeType}`);
      lines.push(`  **ID:** ${node.id}`);

      // Add position information for layout preservation
      if (node.position) {
        lines.push(`  **Position:** ${node.position.x},${node.position.y}`);
      }

      // Add all execution properties
      const executionData = { ...node.data };
      delete executionData.label; // Already shown as node label
      delete executionData.shape; // Already used for node shape
      delete executionData.alias; // Internal use only

      for (const [key, value] of Object.entries(executionData)) {
        if (value !== undefined && value !== null && value !== '') {
          const formattedValue =
            typeof value === 'object'
              ? JSON.stringify(value)
              : String(value).replace(/\n/g, '\\n');
          lines.push(`  **${key}:** ${formattedValue}`);
        }
      }

      // Add node-type specific execution details
      switch (nodeType) {
        case 'command-prompt-file': {
          const fileName =
            ((node.data.properties as Record<string, unknown>)
              ?.fileName as string) || 'prompt.md';
          const variables =
            ((node.data.properties as Record<string, unknown>)
              ?.variables as string[]) || [];
          lines.push(`  **Execution:** Load file "${fileName}"`);
          if (variables.length > 0) {
            lines.push(`  **Variables:** ${JSON.stringify(variables)}`);
          }
          break;
        }

        case 'custom-prompt': {
          const promptVars =
            ((node.data.properties as Record<string, unknown>)
              ?.variables as string[]) || [];
          lines.push(`  **Execution:** Execute custom prompt`);
          if (promptVars.length > 0) {
            lines.push(`  **Variables:** ${JSON.stringify(promptVars)}`);
          }
          break;
        }

        case 'conditional': {
          const condition =
            ((node.data.properties as Record<string, unknown>)
              ?.condition as string) || '';
          const trueLabel =
            ((node.data.properties as Record<string, unknown>)
              ?.trueLabel as string) || 'True';
          const falseLabel =
            ((node.data.properties as Record<string, unknown>)
              ?.falseLabel as string) || 'False';
          lines.push(`  **Execution:** Evaluate condition "${condition}"`);
          lines.push(`  **True Path:** ${trueLabel}`);
          lines.push(`  **False Path:** ${falseLabel}`);
          break;
        }

        case 'loop': {
          const loopType =
            ((node.data.properties as Record<string, unknown>)
              ?.loopType as string) || 'for';
          const maxIterations =
            ((node.data.properties as Record<string, unknown>)
              ?.maxIterations as number) || 10;
          const loopCondition =
            ((node.data.properties as Record<string, unknown>)
              ?.condition as string) || '';
          lines.push(`  **Execution:** ${loopType} loop`);
          lines.push(`  **Max Iterations:** ${maxIterations}`);
          if (loopCondition) {
            lines.push(`  **Condition:** ${loopCondition}`);
          }
          break;
        }

        case 'output-formatter': {
          const outputType =
            ((node.data.properties as Record<string, unknown>)
              ?.outputType as string) || 'text';
          const format =
            ((node.data.properties as Record<string, unknown>)
              ?.format as string) || 'structured';
          lines.push(`  **Execution:** Format output as ${outputType}`);
          lines.push(`  **Format:** ${format}`);
          break;
        }

        case 'persona': {
          const personaType =
            ((node.data.properties as Record<string, unknown>)
              ?.personaType as string) || 'Expert Assistant';
          const tone =
            ((node.data.properties as Record<string, unknown>)
              ?.tone as string) || 'professional';
          const expertise =
            ((node.data.properties as Record<string, unknown>)
              ?.expertise as string) || '';
          lines.push(`  **Execution:** Apply persona "${personaType}"`);
          lines.push(`  **Tone:** ${tone}`);
          if (expertise) {
            lines.push(`  **Expertise:** ${expertise}`);
          }
          break;
        }

        case 'instruction': {
          const priority =
            ((node.data.properties as Record<string, unknown>)
              ?.priority as string) || 'medium';
          lines.push(`  **Execution:** Follow instruction`);
          lines.push(`  **Priority:** ${priority}`);
          break;
        }

        case 'injector': {
          const triggerType =
            ((node.data.properties as Record<string, unknown>)
              ?.triggerType as string) || 'manual';
          const interval =
            ((node.data.properties as Record<string, unknown>)
              ?.interval as number) || 60;
          const cronExpression =
            ((node.data.properties as Record<string, unknown>)
              ?.cronExpression as string) || '0 * * * * *';
          const autoStart =
            ((node.data.properties as Record<string, unknown>)
              ?.autoStart as boolean) || false;
          const payload =
            ((node.data.properties as Record<string, unknown>)
              ?.payload as string) || '{}';
          const payloadType =
            ((node.data.properties as Record<string, unknown>)
              ?.payloadType as string) || 'json';
          lines.push(`  **Execution:** ${triggerType} trigger`);
          if (triggerType === 'interval') {
            lines.push(`  **Interval:** ${interval} seconds`);
          }
          if (triggerType === 'cron') {
            lines.push(`  **Cron Expression:** ${cronExpression}`);
          }
          lines.push(`  **Auto Start:** ${autoStart ? 'Yes' : 'No'}`);
          lines.push(`  **Payload Type:** ${payloadType}`);
          if (payload && payload !== '{}') {
            const payloadPreview =
              payload.length > 50 ? `${payload.substring(0, 50)}...` : payload;
            lines.push(`  **Payload:** ${payloadPreview}`);
          }
          break;
        }
      }

      lines.push(`end note`);
      lines.push('');
    }
  }

  if (nodes.length > 0 && edges.length > 0) {
    lines.push('!-- Workflow Connections --!');
  }

  // Add edges with execution details
  for (const edge of edges) {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (sourceNode && targetNode) {
      const sourceAlias = sourceNode.id.replace(/[^a-z0-9]/gi, '');
      const targetAlias = targetNode.id.replace(/[^a-z0-9]/gi, '');
      const arrow = edge.data?.arrow || '-->';

      // Add edge with label and execution details
      if (edge.label) {
        lines.push(`${sourceAlias} ${arrow} ${targetAlias} : "${edge.label}"`);
      } else {
        lines.push(`${sourceAlias} ${arrow} ${targetAlias}`);
      }

      // Add edge execution metadata if present
      if (edge.data && Object.keys(edge.data).length > 1) {
        // More than just arrow
        lines.push(`note on link`);
        lines.push(`  **Edge ID:** ${edge.id}`);
        for (const [key, value] of Object.entries(edge.data)) {
          if (
            key !== 'arrow' &&
            value !== undefined &&
            value !== null &&
            value !== ''
          ) {
            lines.push(`  **${key}:** ${value}`);
          }
        }
        lines.push(`end note`);
      }
    }
  }

  lines.push('');
  lines.push('!-- End AI-LEY Workflow --!');
  lines.push('@enduml');

  return lines.join('\n');
}
