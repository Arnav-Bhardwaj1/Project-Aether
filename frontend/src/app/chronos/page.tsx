'use client';

import React, { useState, useEffect } from 'react';
import { Clock, GitBranch, History, Play, Rewind, FastForward, Info, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TimeScrubber from '@/components/chronos/TimeScrubber';
import StateDiffViewer from '@/components/chronos/StateDiffViewer';
import SessionTree from '@/components/chronos/SessionTree';

export default function ChronosPage() {
  const [session_id, setSessionId] = useState<string>('');
  const [timeline, setTimeline] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0);
  const [branches, setBranches] = useState<any[]>([]);

  const fetchTimeline = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/api/chronos/timeline/${id}`);
      const data = await res.json();
      setTimeline(data.timeline);
      setStats(data.stats);
      setCurrentFrameIdx(data.timeline.length - 1);
      
      const bRes = await fetch(`http://localhost:8000/api/chronos/branches/${id}`);
      setBranches(await bRes.json());
    } catch (err) {
      console.error("Chronos fetch failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Aether <span className="text-purple-500">Chronos</span>
            </h1>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Temporal state & debugging engine. Travel through an agent's history and fork new session realities.
          </p>
        </div>

        <div className="flex gap-4">
           <input 
              type="text" 
              placeholder="Enter Session ID..." 
              value={session_id}
              onChange={(e) => setSessionId(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm focus:border-purple-500 outline-none w-64"
           />
           <button 
              onClick={() => fetchTimeline(session_id)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2"
           >
             <History className="w-4 h-4" /> Load Timeline
           </button>
        </div>
      </header>

      {timeline.length > 0 ? (
        <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Playback Area */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                   <div className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-bold rounded-full border border-purple-500/20">
                     FRAME {currentFrameIdx + 1} / {timeline.length}
                   </div>
                   <span className="text-zinc-500 text-sm">
                     {new Date(timeline[currentFrameIdx]?.timestamp * 1000).toLocaleString()}
                   </span>
                </div>
                <div className="flex gap-2">
                   <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"><Rewind className="w-4 h-4" /></button>
                   <button className="p-2 bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors"><Play className="w-4 h-4" /></button>
                   <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"><FastForward className="w-4 h-4" /></button>
                </div>
              </div>

              <TimeScrubber 
                timeline={timeline} 
                currentIdx={currentFrameIdx} 
                onChange={setCurrentFrameIdx} 
              />
            </div>

            <StateDiffViewer 
              prevFrame={currentFrameIdx > 0 ? timeline[currentFrameIdx - 1] : null}
              currentFrame={timeline[currentFrameIdx]}
            />
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-500" />
                Session Lineage
              </h3>
              <SessionTree branches={branches} currentSessionId={session_id} />
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Temporal Stats
              </h3>
              {stats && (
                <div className="space-y-4">
                  <StatRow label="Session Duration" value={`${stats.duration}s`} />
                  <StatRow label="Total Mutations" value={stats.frame_count} />
                  <StatRow label="Action Count" value={stats.event_distribution?.ACTION || 0} />
                </div>
              )}
            </div>
          </div>
        </main>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 opacity-20">
           <Database className="w-20 h-20 mb-6" />
           <p className="text-xl">Enter a Session ID to begin temporal reconstruction</p>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value }: any) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className="text-zinc-200 font-medium">{value}</span>
    </div>
  );
}
