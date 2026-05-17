'use client';

import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, Save, FileText, ChevronRight, Tag, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FeedbackConsoleProps {
  logs: any[];
  onSubmitted: () => void;
}

export default function FeedbackConsole({ logs, onSubmitted }: FeedbackConsoleProps) {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [correctedText, setCorrectedText] = useState('');
  const [rating, setRating] = useState<'POSITIVE' | 'NEGATIVE'>('POSITIVE');
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectLog = (log: any) => {
    setSelectedLog(log);
    setCorrectedText(log.corrected_response || log.original_response);
    setRating(log.rating === 'NEGATIVE' ? 'NEGATIVE' : 'POSITIVE');
    setTags(log.tags || []);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!selectedLog) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/echo/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trace_id: selectedLog.trace_id,
          session_id: selectedLog.session_id,
          prompt: selectedLog.prompt,
          original_response: selectedLog.original_response,
          corrected_response: correctedText,
          rating,
          tags
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        onSubmitted();
        setSelectedLog(null);
      }
    } catch (err) {
      console.error("Failed to submit feedback", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Review Queue Column */}
      <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col h-[650px]">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          Execution Review Queue
        </h3>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {logs.map((log) => {
            const isSelected = selectedLog?.trace_id === log.trace_id;
            return (
              <button
                key={log.trace_id}
                onClick={() => selectLog(log)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-4 ${isSelected ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-black/30 border-zinc-800 hover:border-zinc-700'}`}
              >
                <div className={`p-2 rounded-lg ${log.rating === 'POSITIVE' ? 'bg-emerald-500/10 text-emerald-400' : log.rating === 'NEGATIVE' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {log.rating === 'POSITIVE' ? <ThumbsUp className="w-4 h-4" /> : log.rating === 'NEGATIVE' ? <ThumbsDown className="w-4 h-4" /> : <HelpCircle className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-500 font-mono">{log.trace_id.slice(0, 8)}</span>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
                      {new Date(log.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-zinc-200 truncate">{log.prompt}</p>
                  <p className="text-xs text-zinc-500 truncate">{log.corrected_response || log.original_response}</p>
                </div>

                <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0 self-center" />
              </button>
            );
          })}

          {logs.length === 0 && (
            <div className="py-20 text-center text-zinc-600 italic text-sm">
              No executions in queue. Run agents to log them!
            </div>
          )}
        </div>
      </div>

      {/* Critic Editor Column */}
      <div className="lg:col-span-7 h-[650px]">
        <AnimatePresence mode="wait">
          {selectedLog ? (
            <motion.div
              key={selectedLog.trace_id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col h-full space-y-6"
            >
              {/* Title Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-200">Align Agent Execution</h3>
                  <p className="text-xs text-zinc-500">Provide direct feedback to correct future trajectories.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRating('POSITIVE')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${rating === 'POSITIVE' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-black/30 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    POSITIVE
                  </button>
                  <button
                    onClick={() => setRating('NEGATIVE')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${rating === 'NEGATIVE' ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-black/30 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    NEGATIVE
                  </button>
                </div>
              </div>

              {/* Prompt Visualizer */}
              <div className="p-4 bg-black/40 border border-zinc-800 rounded-2xl space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">User Input Prompt</span>
                <p className="text-sm text-zinc-300 font-semibold">{selectedLog.prompt}</p>
              </div>

              {/* Inline Response Corrector */}
              <div className="flex-1 flex flex-col min-h-0 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Aligned Execution Output</span>
                  <button 
                    onClick={() => setCorrectedText(selectedLog.original_response)}
                    className="text-[10px] font-bold text-indigo-400 hover:underline"
                  >
                    Reset to Original
                  </button>
                </div>
                <textarea
                  value={correctedText}
                  onChange={(e) => setCorrectedText(e.target.value)}
                  className="flex-1 w-full bg-black/60 border border-zinc-800 rounded-2xl p-4 text-sm text-zinc-300 font-mono focus:outline-none focus:border-emerald-500/50 resize-none custom-scrollbar"
                />
              </div>

              {/* Metadata tags */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Classification Tags</span>
                <div className="flex flex-wrap gap-2 items-center">
                  {tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-400">
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400 font-bold">×</button>
                    </span>
                  ))}
                  <form onSubmit={handleAddTag} className="inline-block">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="+ Add Tag"
                      className="bg-black/30 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-indigo-500"
                    />
                  </form>
                </div>
              </div>

              {/* Submit panel */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !correctedText.trim()}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    APPROVE ALIGNMENT PATH
                  </>
                )}
              </button>
            </motion.div>
          ) : (
            <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl h-full flex flex-col items-center justify-center text-center text-zinc-500">
              <ThumbsUp className="w-12 h-12 mb-4 opacity-15" />
              <h4 className="font-bold text-zinc-400 mb-1">Awaiting Selection</h4>
              <p className="text-xs max-w-xs leading-relaxed">Select an execution log from the queue to start rewriting neural trajectories and reinforcing aligned responses.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
