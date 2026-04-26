"use client";

import React, { useState, useMemo } from "react";
import DashboardShell from "@/components/DashboardShell";
import FluxTimeline from "@/components/FluxTimeline";
import StateInspector from "@/components/StateInspector";
import AgentChat from "@/components/AgentChat";
import ScenarioComparison from "@/components/ScenarioComparison";
import BranchCreator from "@/components/BranchCreator";
import { useFlux } from "@/hooks/useFlux";
import { AnimatePresence } from "framer-motion";
import { LayoutDashboard, GitBranch, History } from "lucide-react";

export default function Home() {
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substring(7)}`);
  const { 
    snapshots, 
    activeSnapshotId, 
    setActiveSnapshotId, 
    isExecuting, 
    traces, 
    execute 
  } = useFlux(sessionId);

  const [isComparing, setIsComparing] = useState(false);
  const [compareIds, setCompareIds] = useState<{left: string | null, right: string | null}>({left: null, right: null});
  const [branchingId, setBranchingId] = useState<string | null>(null);

  const activeSnapshot = useMemo(() => 
    snapshots.find(s => s.id === activeSnapshotId) || null
  , [snapshots, activeSnapshotId]);

  const leftSnapshot = useMemo(() => 
    snapshots.find(s => s.id === compareIds.left) || null
  , [snapshots, compareIds.left]);

  const rightSnapshot = useMemo(() => 
    snapshots.find(s => s.id === compareIds.right) || null
  , [snapshots, compareIds.right]);

  const handleBranch = (id: string) => {
    setBranchingId(id);
  };

  const handleExecute = async (prompt: string, branchName: string = "Main") => {
    // Determine parent ID if we are branching or just continuing
    const parentId = branchingId || (snapshots.length > 0 ? snapshots[snapshots.length-1].id : null);
    await execute(prompt, parentId, branchName);
    setBranchingId(null);
  };

  const handleSelect = (id: string) => {
    if (isComparing) {
      if (!compareIds.left) setCompareIds(prev => ({...prev, left: id}));
      else if (!compareIds.right) setCompareIds(prev => ({...prev, right: id}));
    } else {
      setActiveSnapshotId(id);
    }
  };

  return (
    <DashboardShell>
      <div className="h-full flex flex-col gap-4">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40">
                 <LayoutDashboard size={14}/>
                 Session: <span className="text-white/80 font-mono">{sessionId}</span>
              </div>
              <div className="h-4 w-px bg-white/10"></div>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={() => {
                    setIsComparing(!isComparing);
                    setCompareIds({left: null, right: null});
                  }}
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase px-3 py-1 rounded-full border transition-all ${isComparing ? "bg-blue-500 border-blue-400 text-white" : "border-white/10 text-white/40 hover:border-white/20"}`}
                 >
                    <GitBranch size={12}/>
                    {isComparing ? "Cancel Comparison" : "Compare Scenarios"}
                 </button>
              </div>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-[#0a0a0c] bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                 ))}
              </div>
              <span className="text-[10px] text-white/40 font-bold uppercase">3 Active Nodes</span>
           </div>
        </div>

        <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
          {/* Main Timeline Area */}
          <div className="col-span-8 flex flex-col gap-4 min-h-0">
            <div className="flex-1 min-h-0">
              <FluxTimeline 
                snapshots={snapshots} 
                activeId={activeSnapshotId}
                onSelect={handleSelect}
                onBranch={handleBranch}
              />
            </div>
            
            <div className="h-1/3 min-h-[200px]">
              <AgentChat 
                onExecute={handleExecute} 
                isExecuting={isExecuting}
                traces={traces}
              />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="col-span-4 flex flex-col gap-4 min-h-0">
             <StateInspector snapshot={activeSnapshot} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isComparing && compareIds.left && compareIds.right && (
          <ScenarioComparison 
            left={leftSnapshot} 
            right={rightSnapshot} 
            onClose={() => setIsComparing(false)} 
          />
        )}
        
        {branchingId && (
          <BranchCreator 
            parent={snapshots.find(s => s.id === branchingId) || null}
            onExecute={handleExecute}
            onClose={() => setBranchingId(null)}
          />
        )}
      </AnimatePresence>
    </DashboardShell>
  );
}
