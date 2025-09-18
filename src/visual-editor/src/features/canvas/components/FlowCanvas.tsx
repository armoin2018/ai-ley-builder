import { useCallback, useMemo, useRef, useState } from 'react';
import {
  addEdge,
  Background,
  type Connection,
  ConnectionLineType,
  ConnectionMode,
  type Edge,
  MiniMap,
  type Node,
  ReactFlow,
  type ReactFlowInstance,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { NodeType } from '../../../types/nodes';
import { cn } from '../../../utils';
import { useWorkflow } from '../../workflow';

// Utility function to generate unique node IDs
const generateNodeId = () =>
  `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Default properties for different node types
const getDefaultNodeProperties = (nodeType: NodeType) => {
  switch (nodeType) {
    case NodeType.COMMAND_PROMPT_FILE:
      return {
        fileName: '',
        content: '',
        variables: [],
      };
    case NodeType.CUSTOM_PROMPT_TEXT:
      return {
        promptText: '',
        variables: [],
      };
    case NodeType.PERSONA:
      return {
        personaType: '',
        expertise: [],
        tone: 'professional',
        characteristics: [],
      };
    case NodeType.INSTRUCTION:
      return {
        instructionText: '',
        priority: 'medium',
      };
    case NodeType.LOGIC_CONDITION:
      return {
        condition: '',
        trueLabel: 'True',
        falseLabel: 'False',
      };
    case NodeType.LOOP:
      return {
        loopType: 'for',
        condition: '',
        maxIterations: 10,
        iteratorVariable: 'i',
      };
    case NodeType.OUTPUT_TYPE:
      return {
        outputType: 'text',
        format: 'markdown',
        template: '',
      };
    case NodeType.SHELL_SCRIPT:
      return {
        scriptType: 'shell',
        script: '#!/bin/bash\necho "Hello from shell!"',
        timeout: 30,
      };
    case NodeType.PYTHON_SCRIPT:
      return {
        scriptType: 'python',
        script: 'print("Hello from Python!")',
        timeout: 30,
      };
    case NodeType.PHP_SCRIPT:
      return {
        scriptType: 'php',
        script: 'echo "Hello from PHP!";',
        timeout: 30,
      };
    case NodeType.NODEJS_SCRIPT:
      return {
        scriptType: 'nodejs',
        script: 'console.log("Hello from Node.js!")',
        timeout: 30,
      };
    default:
      return {};
  }
};

// Import custom node components
import { CommandPromptFileNode } from './nodes/CommandPromptFileNode';
import { LogicConditionNode } from './nodes/LogicConditionNode';
import { OutputTypeNode } from './nodes/OutputTypeNode';
import { LoopNode } from './nodes/LoopNode';
import { CustomPromptTextNode } from './nodes/CustomPromptTextNode';
import { PersonaNode } from './nodes/PersonaNode';
import { InstructionNode } from './nodes/InstructionNode';
import { ShellScriptNode } from './nodes/ShellScriptNode';
import { PythonScriptNode } from './nodes/PythonScriptNode';
import { PhpScriptNode } from './nodes/PhpScriptNode';
import { NodejsScriptNode } from './nodes/NodejsScriptNode';
import { CanvasControls } from './CanvasControls';

// Node type mapping
const nodeTypes = {
  [NodeType.COMMAND_PROMPT_FILE]: CommandPromptFileNode,
  [NodeType.LOGIC_CONDITION]: LogicConditionNode,
  [NodeType.OUTPUT_TYPE]: OutputTypeNode,
  [NodeType.LOOP]: LoopNode,
  [NodeType.CUSTOM_PROMPT_TEXT]: CustomPromptTextNode,
  [NodeType.PERSONA]: PersonaNode,
  [NodeType.INSTRUCTION]: InstructionNode,
  // Script execution nodes
  [NodeType.SHELL_SCRIPT]: ShellScriptNode,
  [NodeType.PYTHON_SCRIPT]: PythonScriptNode,
  [NodeType.PHP_SCRIPT]: PhpScriptNode,
  [NodeType.NODEJS_SCRIPT]: NodejsScriptNode,
  // Additional types for PlantUML compatibility - using existing components as fallbacks
  [NodeType.CUSTOM_PROMPT]: CustomPromptTextNode,
  [NodeType.INPUT]: CommandPromptFileNode,
  [NodeType.OUTPUT]: OutputTypeNode,
  [NodeType.CONDITIONAL]: LogicConditionNode,
  [NodeType.OUTPUT_FORMATTER]: OutputTypeNode,
  [NodeType.DEFAULT]: InstructionNode,
};


// Initial nodes for demo
const initialNodes: Node[] = [
  {
    id: '1',
    type: NodeType.COMMAND_PROMPT_FILE,
    position: { x: 250, y: 100 },
    data: {
      label: 'Start Command',
      description: 'Entry point for the workflow',
      properties: {
        fileName: 'start.md',
        content: 'Begin the AI workflow process',
      },
    },
  },
  {
    id: '2',
    type: NodeType.LOGIC_CONDITION,
    position: { x: 250, y: 250 },
    data: {
      label: 'Check Input',
      description: 'Validate input parameters',
      properties: {
        condition: 'input != null',
        trueLabel: 'Valid',
        falseLabel: 'Invalid',
      },
    },
  },
  {
    id: '3',
    type: NodeType.OUTPUT_TYPE,
    position: { x: 250, y: 400 },
    data: {
      label: 'Generate Output',
      description: 'Final output generation',
      properties: {
        outputType: 'json',
        format: 'structured',
      },
    },
  },
];

// Initial edges
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: {
      stroke: '#3b82f6',
      strokeWidth: 3,
      strokeDasharray: '0',
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#3b82f6',
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    style: {
      stroke: '#10b981',
      strokeWidth: 3,
      strokeDasharray: '0',
    },
    markerEnd: {
      type: 'arrowclosed',
      color: '#10b981',
    },
  },
];

interface FlowCanvasProps {
  className?: string;
}

export function FlowCanvas({ className }: FlowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isDragOver, setIsDragOver] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Workflow state management
  const { markAsModified } = useWorkflow();

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      // Create a custom edge with enhanced styling and validation
      const newEdge: Edge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        type: 'smoothstep',
        animated: true,
        style: {
          strokeWidth: 2,
          stroke: '#3b82f6',
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#3b82f6',
        },
      };

      setEdges(eds => addEdge(newEdge, eds));
      markAsModified();
    },
    [setEdges, markAsModified]
  );

  const onConnectStart = useCallback(() => {
    // Visual feedback when starting a connection
    console.log('Connection started');
  }, []);

  const onConnectEnd = useCallback(() => {
    // Visual feedback when ending a connection
    console.log('Connection ended');
  }, []);

  // Validate connections before they are made
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      const { source, target, sourceHandle } = connection;

      // Prevent self-connections
      if (source === target) {
        return false;
      }

      // Get source and target nodes to check compatibility
      const sourceNode = nodes.find(node => node.id === source);
      const targetNode = nodes.find(node => node.id === target);

      if (!sourceNode || !targetNode) {
        return false;
      }

      // Check for existing connection between the same nodes
      const existingEdge = edges.find(
        edge => edge.source === source && edge.target === target
      );

      if (existingEdge) {
        return false; // Prevent duplicate connections
      }

      // Node-specific connection rules
      const sourceType = sourceNode.type as NodeType;

      // Logic nodes have specific handle requirements
      if (sourceType === NodeType.LOGIC_CONDITION) {
        // Logic condition nodes can only connect via true/false handles
        if (!sourceHandle || !['true', 'false'].includes(sourceHandle)) {
          return false;
        }
      }

      if (sourceType === NodeType.LOOP) {
        // Loop nodes have specific output handles
        if (!sourceHandle || !['next', 'loop'].includes(sourceHandle)) {
          return false;
        }
      }

      return true;
    },
    [edges, nodes]
  );

  const onSelectionChange = useCallback(
    ({ nodes }: { nodes: Node[] }) => {
      // Ensure only one node is selected at a time for the inspector
      const selectedNodes = nodes.filter(node => node.selected);
      if (selectedNodes.length > 1) {
        // If multiple nodes are selected, keep only the last one
        const lastSelected = selectedNodes[selectedNodes.length - 1];
        setNodes(allNodes =>
          allNodes.map(node => ({
            ...node,
            selected: node.id === lastSelected.id,
          }))
        );
      }
    },
    [setNodes]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    // Only set drag over to false if we're leaving the wrapper entirely
    if (event.currentTarget === event.target) {
      setIsDragOver(false);
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      const nodeType = event.dataTransfer.getData(
        'application/reactflow'
      ) as NodeType;
      const label = event.dataTransfer.getData('application/reactflow-label');

      // Check if the dropped element is valid
      if (typeof nodeType === 'undefined' || !nodeType) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds || !reactFlowInstance.current) {
        return;
      }

      // More precise coordinate calculation
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: generateNodeId(),
        type: nodeType,
        position,
        data: {
          label: label || `${nodeType} Node`,
          description: `New ${nodeType} node`,
          properties: getDefaultNodeProperties(nodeType),
        },
      };

      setNodes(nds => nds.concat(newNode));
      markAsModified();
    },
    [setNodes, markAsModified]
  );

  // Enhanced nodes change handler to track modifications
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);
      // Mark as modified for any non-trivial changes
      if (
        changes.some(
          (change: any) =>
            change.type !== 'select' && change.type !== 'position'
        )
      ) {
        markAsModified();
      }
    },
    [onNodesChange, markAsModified]
  );

  // Enhanced edges change handler to track modifications
  const handleEdgesChange = useCallback(
    (changes: any) => {
      onEdgesChange(changes);
      // Mark as modified for any changes
      if (changes.length > 0) {
        markAsModified();
      }
    },
    [onEdgesChange, markAsModified]
  );

  const proOptions = useMemo(
    () => ({
      hideAttribution: true,
    }),
    []
  );

  return (
    <div
      ref={reactFlowWrapper}
      className={cn(
        'h-full w-full relative',
        'bg-gradient-to-br from-white to-slate-50',
        'border border-slate-200 rounded-lg overflow-hidden',
        'transition-all duration-200',
        {
          'border-blue-400 bg-blue-50/30': isDragOver,
          'shadow-lg ring-2 ring-blue-200': isDragOver,
        },
        className
      )}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        onSelectionChange={onSelectionChange}
        onInit={onInit}
        isValidConnection={isValidConnection}
        proOptions={proOptions}
        fitView
        attributionPosition="bottom-left"
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={4}
        snapToGrid
        snapGrid={[15, 15]}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        panOnScroll
        panOnScrollSpeed={0.5}
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick
        selectNodesOnDrag={false}
        defaultEdgeOptions={{
          style: { strokeWidth: 2, stroke: '#64748b' },
          type: 'smoothstep',
          markerEnd: { type: 'arrowclosed', color: '#64748b' },
          animated: false,
        }}
        connectionLineStyle={{
          strokeWidth: 3,
          stroke: '#3b82f6',
          strokeDasharray: '8,8',
        }}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionMode={ConnectionMode.Loose}
      >
        <Background
          gap={[20, 20]}
          size={2}
          className="bg-white"
          color="#f1f5f9"
          style={{
            backgroundColor: '#ffffff',
            backgroundImage: `
              radial-gradient(circle at 1px 1px, #f1f5f9 1px, transparent 0),
              linear-gradient(90deg, rgba(241, 245, 249, 0.5) 1px, transparent 0),
              linear-gradient(rgba(241, 245, 249, 0.5) 1px, transparent 0)
            `,
            backgroundSize: '20px 20px, 20px 20px, 20px 20px',
          }}
        />
        <CanvasControls />
        <MiniMap
          className="bg-white border border-slate-200 shadow-lg rounded-lg overflow-hidden"
          style={{ backgroundColor: '#f8fafc' }}
          maskColor="rgba(240, 240, 240, 0.6)"
          nodeStrokeWidth={2}
          nodeColor="#94a3b8"
          nodeBorderRadius={4}
          pannable
          zoomable
          position="bottom-right"
        />
      </ReactFlow>

      {/* Drag Over Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-100/20 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14" />
                <path d="m19 12-7 7-7-7" />
              </svg>
              <span className="text-sm font-medium">Drop node here</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper component with ReactFlowProvider
export function FlowCanvasProvider(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
