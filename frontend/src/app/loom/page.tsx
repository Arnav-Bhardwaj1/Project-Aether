'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardShell from '@/components/DashboardShell';
import WorkflowCanvas from '@/components/loom/WorkflowCanvas';
import WorkflowRunner from '@/components/loom/WorkflowRunner';
import NodeSidebar from '@/components/loom/NodeSidebar';
import { Layers, Play, Settings, RefreshCw, AlertCircle } from 'lucide-react';
import { useNodesState, useEdgesState, addEdge, Connection, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

// Initial nodes to give users a functional template right away
const initialNodes = [
  {
    id: 'n_input',
    type: 'inputNode',
    position: { x: 80, y: 180 },
    data: { label: 'Input Parameter', type: 'INPUT' }
  },
  {
    id: 'n_citadel',
    type: 'citadelNode',
    position: { x: 300, y: 80 },
    data: { label: 'Citadel Scan', type: 'CITADEL' }
  },
  {
    id: 'n_cortex',
    type: 'cortexNode',
    position: { x: 300, y: 280 },
    data: { label: 'Cortex Search', type: 'CORTEX', depth: 2 }
  },
  {
    id: 'n_llm',
    type: 'llmNode',
    position: { x: 550, y: 180 },
    data: { 
      label: 'LLM Reasoner', 
      type: 'LLM', 
      system_prompt: 'You are an aligned Aether agent. Produce standard reports based on context.' 
    }
  },
  {
    id: 'n_output',
    type: 'outputNode',
    position: { x: 780, y: 180 },
    data: { label: 'Workflow Output', type: 'OUTPUT' }
  }
];

const initialEdges = [
  { id: 'e1', source: 'n_input', target: 'n_citadel', animated: true },
  { id: 'e2', source: 'n_input', target: 'n_cortex', animated: true },
  { id: 'e3', source: 'n_citadel', target: 'n_llm', animated: true },
  { id: 'e4', source: 'n_cortex', target: 'n_llm', animated: true },
  { id: 'e5', source: 'n_llm', target: 'n_output', animated: true }
];

export default function LoomPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as any);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [session_id] = useState(() => `loom_session_${Math.random().toString(36).substring(7)}`);
  
  const [isRunning, setIsRunning] = useState(false);
  const [runLog, setRunLog] = useState<any[]>([]);
  const [finalOutput, setFinalOutput] = useState('');
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, string>>({}); // node_id -> 'RUNNING' | 'COMPLETED' | 'ERROR' | 'VIOLATION'

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  // Drag & Drop Nodes onto the canvas
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      if (typeof type === 'undefined' || !type) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 50,
        y: event.clientY - reactFlowBounds.top - 20
      };

      const newNode = {
        id: `node_${Math.random().toString(36).substring(5)}`,
        type: `${type.toLowerCase()}Node`,
        position,
        data: { 
          label: `${type} Processor`, 
          type: type.toUpperCase(),
          system_prompt: type === 'LLM' ? 'You are a helpful Aether agent.' : undefined,
          depth: type === 'CORTEX' ? 2 : undefined,
          limit: type === 'ECHO' ? 2 : undefined
        }
      };

      setNodes((nds) => nds.concat(newNode as any));
    },
    [setNodes]
  );

  // Live WebSockets updates for node statuses
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/trace');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'LOOM_STEP' && data.session_id === session_id) {
        setNodeStatuses(prev => ({
          ...prev,
          [data.node_id]: data.status
        }));
        
        setRunLog(prev => [
          ...prev,
          {
            node_id: data.node_id,
            status: data.status,
            data: data.data,
            timestamp: Date.now()
          }
        ]);
      }
    };
    return () => ws.close();
  }, [session_id]);

  const handleExecute = async (inputVal: string) => {
    setIsRunning(true);
    setRunLog([]);
    setFinalOutput('');
    setNodeStatuses({});

    try {
      const res = await fetch('http://localhost:8000/api/loom/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes.map(n => ({ id: n.id, type: n.data.type, data: n.data })),
          edges: edges.map(e => ({ source: e.source, target: e.target })),
          input: inputVal,
          session_id
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setFinalOutput(data.output);
      } else {
        setFinalOutput(`Workflow Halted: ${data.message}`);
      }
    } catch (err) {
      console.error("Execution failed", err);
      setFinalOutput("Fatal Error: Connection to backend failed.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#050505] text-white p-6 flex flex-col gap-6">
        {/* Header */}
        <header className="flex justify-between items-end pb-6 border-b border-zinc-900 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-transparent border border-indigo-500/30 rounded-xl shadow-lg shadow-indigo-500/10">
                <Layers className="w-6 h-6 text-indigo-400" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                Aether <span className="text-indigo-500">Loom</span>
              </h1>
            </div>
            <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed">
              Visual Agent Workflow Canvas. Drag-and-drop compliance, search pipelines, and prompt parameters into topological directed graphs.
            </p>
          </div>
        </header>

        {/* Studio Workspace */}
        <main className="flex-1 grid grid-cols-12 gap-6 min-h-0">
          {/* Node Library Sidebar */}
          <div className="col-span-2 flex flex-col">
            <NodeSidebar />
          </div>

          {/* Visual Canvas Block */}
          <div className="col-span-7 flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-3xl backdrop-blur-xl overflow-hidden h-[680px] relative" ref={reactFlowWrapper}>
            <div className="absolute top-4 left-4 z-10 bg-black/40 border border-zinc-800 px-3 py-1.5 rounded-lg text-[10px] font-bold text-zinc-500 uppercase tracking-widest pointer-events-none">
              Visual Graph Studio
            </div>
            
            <WorkflowCanvas 
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeStatuses={nodeStatuses}
              setNodes={setNodes}
            />
          </div>

          {/* Runner Column */}
          <div className="col-span-3 flex flex-col">
            <WorkflowRunner 
              onRun={handleExecute}
              isRunning={isRunning}
              runLog={runLog}
              finalOutput={finalOutput}
              nodes={nodes}
            />
          </div>
        </main>
      </div>
    </DashboardShell>
  );
}
