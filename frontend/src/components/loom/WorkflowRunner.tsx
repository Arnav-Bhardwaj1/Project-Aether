'use client';

import React, { useState } from 'react';
import { Play, Terminal, Info, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkflowRunnerProps {
  onRun: (inputVal: string) => void;
  isRunning: boolean;
  runLog: any[];
  finalOutput: string;
  nodes: any[];
}

export default function WorkflowRunner({
  onRun,
  isRunning,
  runLog,
  finalOutput,
  nodes
}: WorkflowRunnerProps) {
  const [inputVal, setInputVal] = useState('Retrieve prod AWS configuration details safely.');

  const handleStart = () => {
    if (!inputVal.trim() || isRunning) return;
    onRun(inputVal);
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl h-[680px] flex flex-col space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Play className="w-5 h-5 text-indigo-400" />
        Workflow Controller
      </h3>

      {/* Input query parameter */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Input Trigger Prompt</label>
        <textarea
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Workflow prompt input..."
          className="w-full bg-black/40 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500/50 resize-none h-16"
        />
      </div>

      {/* Execute trigger */}
      <button
        onClick={handleStart}
        disabled={isRunning || !inputVal.trim()}
        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-850 disabled:text-zinc-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 shrink-0 text-white"
      >
        {isRunning ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            EXECUTING DAG...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            EXECUTE WORKFLOW
          </>
        )}
      </button>

      {/* Step Trace Logs */}
      <div className="flex-1 flex flex-col min-h-0 space-y-3">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1 block">Live Step Telemetry</span>
        <div className="flex-1 overflow-y-auto bg-black/30 border border-zinc-850 rounded-2xl p-4 space-y-3 custom-scrollbar">
          {runLog.map((log, idx) => {
            const nodeName = nodes.find(n => n.id === log.node_id)?.data?.label || log.node_id;
            
            return (
              <div 
                key={idx} 
                className="p-3 bg-black/25 border border-zinc-850 rounded-xl space-y-2 font-mono text-[10px]"
              >
                <div className="flex justify-between items-center">
                  <span className="text-zinc-300 font-bold">{nodeName}</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                    log.status === 'RUNNING' ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' :
                    log.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                    log.status === 'VIOLATION' ? 'bg-red-500/10 text-red-400' :
                    'bg-zinc-800 text-zinc-500'
                  }`}>
                    {log.status}
                  </span>
                </div>

                {log.status === 'COMPLETED' && log.data?.output && (
                  <div className="text-zinc-500 truncate max-w-[200px]">
                    Output: {log.data.output.slice(0, 40)}...
                  </div>
                )}
                {log.status === 'VIOLATION' && log.data?.violations && (
                  <div className="text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Blocked: {log.data.violations.join(', ')}
                  </div>
                )}
              </div>
            );
          })}

          {runLog.length === 0 && (
            <div className="py-20 text-center text-zinc-650 text-xs italic">
              Workflow standby. Awaiting execution trigger...
            </div>
          )}
        </div>
      </div>

      {/* Terminus Output Panel */}
      <div className="space-y-2 shrink-0">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest ml-1 block">Final Result inspect</span>
        <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 h-28 overflow-y-auto text-xs text-zinc-300 font-mono custom-scrollbar">
          {finalOutput ? finalOutput : <span className="text-zinc-650 italic">No output collected.</span>}
        </div>
      </div>
    </div>
  );
}
