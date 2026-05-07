'use client';

import React from 'react';
import { Database, Zap, FileText, ChevronRight } from 'lucide-react';

interface DiffViewerProps {
  prevFrame: any;
  currentFrame: any;
}

export default function StateDiffViewer({ prevFrame, currentFrame }: DiffViewerProps) {
  if (!currentFrame) return null;

  const delta = currentFrame.state_delta;
  const agentChanges = delta.agent || {};
  const worldChanges = delta.world || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Agent Memory Mutations */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Agent Memory Mutation
        </h4>
        
        <div className="space-y-4">
          {Object.entries(agentChanges).map(([key, value]: [string, any]) => (
             <div key={key} className="bg-black/40 border border-zinc-800/50 rounded-xl p-4">
                <div className="text-xs font-bold text-purple-400 mb-2 font-mono uppercase">{key}</div>
                <div className="text-sm text-zinc-300 line-clamp-3">
                   {typeof value === 'object' ? JSON.stringify(value) : value}
                </div>
             </div>
          ))}
          {Object.keys(agentChanges).length === 0 && (
            <p className="text-zinc-600 text-sm italic py-4">No memory changes in this frame</p>
          )}
        </div>
      </div>

      {/* Environment Delta */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
        <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Database className="w-4 h-4 text-blue-500" />
          Environment Delta
        </h4>

        <div className="space-y-3">
          {Object.entries(worldChanges).map(([key, value]: [string, any]) => (
            <div key={key} className="flex items-center gap-3 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl group hover:border-blue-500/30 transition-all">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-zinc-200 truncate">{key}</div>
                <div className="text-[10px] text-zinc-500 uppercase">File Modified</div>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-blue-500 transition-colors" />
            </div>
          ))}
          {Object.keys(worldChanges).length === 0 && (
            <p className="text-zinc-600 text-sm italic py-4">Environment state remains stable</p>
          )}
        </div>
      </div>
    </div>
  );
}
