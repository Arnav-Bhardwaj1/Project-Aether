'use client';

import React from 'react';
import ReactFlow, { Background, Controls, Handle, Position, NodeProps } from 'reactflow';
import { Shield, BrainCircuit, Volume2, Cpu, ArrowRight, Play, Terminal } from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: any[];
  edges: any[];
  onNodesChange: any;
  onEdgesChange: any;
  onConnect: any;
  onDrop: any;
  onDragOver: any;
  nodeStatuses: Record<string, string>;
  setNodes: any;
}

// Helper to render glowing state outlines
const getStatusClasses = (status?: string) => {
  if (status === 'RUNNING') return 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse';
  if (status === 'COMPLETED') return 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
  if (status === 'VIOLATION' || status === 'ERROR') return 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.35)]';
  return 'border-zinc-800';
};

// --- Custom Nodes ---

function CustomNodeWrapper({ title, icon, status, children }: { title: string, icon: React.ReactNode, status?: string, children?: React.ReactNode }) {
  return (
    <div className={`w-[200px] bg-black/80 backdrop-blur-md border rounded-2xl p-3 text-left transition-all ${getStatusClasses(status)}`}>
      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-zinc-900">
        <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300">
          {icon}
        </div>
        <span className="text-xs font-bold text-zinc-200 tracking-tight">{title}</span>
      </div>
      {children}
    </div>
  );
}

// 1. Input Node
const InputNode = ({ data, id }: NodeProps) => (
  <CustomNodeWrapper title="Input Parameter" icon={<Terminal size={14} />} status={data.status}>
    <div className="text-[10px] text-zinc-500 leading-none">Starting Prompt context parameters</div>
    <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2 !h-2" />
  </CustomNodeWrapper>
);

// 2. Citadel Node
const CitadelNode = ({ data }: NodeProps) => (
  <CustomNodeWrapper title="Citadel Compliance" icon={<Shield size={14} className="text-emerald-400" />} status={data.status}>
    <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2 !h-2" />
    <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
      Policies: Active
    </div>
    <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2 !h-2" />
  </CustomNodeWrapper>
);

// 3. Cortex Node
const CortexNode = ({ data, id }: NodeProps) => {
  return (
    <CustomNodeWrapper title="Cortex Memory" icon={<BrainCircuit size={14} className="text-indigo-400" />} status={data.status}>
      <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2 !h-2" />
      <div className="space-y-1">
        <label className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold block">Retrieval Depth</label>
        <div className="text-[10px] font-mono font-bold text-zinc-300">2 Synapses</div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2 !h-2" />
    </CustomNodeWrapper>
  );
};

// 4. Echo Node
const EchoNode = ({ data }: NodeProps) => (
  <CustomNodeWrapper title="Echo Exemplars" icon={<Volume2 size={14} className="text-emerald-400" />} status={data.status}>
    <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2 !h-2" />
    <div className="space-y-1">
      <label className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold block">Inject Limit</label>
      <div className="text-[10px] font-mono font-bold text-zinc-300">2 Exemplars</div>
    </div>
    <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2 !h-2" />
  </CustomNodeWrapper>
);

// 5. LLM Node
const LLMNode = ({ data, id }: NodeProps) => {
  return (
    <CustomNodeWrapper title="Gemini Reasoner" icon={<Cpu size={14} className="text-indigo-400" />} status={data.status}>
      <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2 !h-2" />
      <div className="space-y-1">
        <label className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold block">Model</label>
        <span className="text-[9px] font-bold text-zinc-400">gemini-1.5-flash</span>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !w-2 !h-2" />
    </CustomNodeWrapper>
  );
};

// 6. Output Node
const OutputNode = ({ data }: NodeProps) => (
  <CustomNodeWrapper title="Workflow Output" icon={<ArrowRight size={14} />} status={data.status}>
    <Handle type="target" position={Position.Left} className="!bg-indigo-500 !w-2 !h-2" />
    <div className="text-[10px] text-zinc-500 leading-none">Collects final output responses</div>
  </CustomNodeWrapper>
);

const nodeTypes = {
  inputNode: InputNode,
  citadelNode: CitadelNode,
  cortexNode: CortexNode,
  echoNode: EchoNode,
  llmNode: LLMNode,
  outputNode: OutputNode
};

export default function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onDrop,
  onDragOver,
  nodeStatuses,
  setNodes
}: WorkflowCanvasProps) {
  
  // Dynamic linking of node status onto nodes array for React Flow updates
  const nodesWithStatus = nodes.map(n => ({
    ...n,
    data: {
      ...n.data,
      status: nodeStatuses[n.id] || 'STANDBY'
    }
  }));

  return (
    <div className="w-full h-full bg-[#07070a]">
      <ReactFlow
        nodes={nodesWithStatus}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#1f1f2e" gap={20} size={1} />
        <Controls className="!bg-zinc-900 !border-zinc-800 !text-white" />
      </ReactFlow>
    </div>
  );
}
