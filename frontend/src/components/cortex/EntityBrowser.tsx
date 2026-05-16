'use client';

import React, { useState } from 'react';
import { Search, Network, Info, Link as LinkIcon } from 'lucide-react';

interface EntityBrowserProps {
  nodes: any[];
  edges: any[];
}

export default function EntityBrowser({ nodes, edges }: EntityBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = nodes.filter(n => 
    n.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Search className="w-5 h-5 text-indigo-500" />
        Knowledge Explorer
      </h3>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search entities..."
          className="w-full bg-black/40 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500/50 transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {filteredNodes.map((node) => {
          const connections = edges.filter(e => e.source === node.id || e.target === node.id);
          
          return (
            <div key={node.id} className="p-4 bg-black/40 border border-zinc-800/50 rounded-2xl group hover:border-zinc-700 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Network className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">{node.label}</h4>
                    <span className="text-[10px] text-zinc-500 font-mono uppercase">{node.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-600 bg-zinc-800/50 px-2 py-0.5 rounded">
                  <LinkIcon className="w-3 h-3" />
                  {connections.length}
                </div>
              </div>

              <div className="space-y-2">
                {connections.slice(0, 3).map((conn, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                    <div className="w-1 h-1 rounded-full bg-indigo-500" />
                    <span className="text-zinc-400">{conn.relationship}</span>
                    <span className="text-zinc-600">→</span>
                    <span className="text-zinc-300 truncate">
                      {conn.source === node.id ? conn.target : conn.source}
                    </span>
                  </div>
                ))}
                {connections.length > 3 && (
                  <div className="text-[10px] text-zinc-600 italic pl-3">
                    +{connections.length - 3} more connections
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredNodes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Info className="w-8 h-8 mb-4 opacity-20" />
            <p className="text-sm italic">No matching entities found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
