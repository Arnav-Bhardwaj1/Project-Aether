'use client';

import React, { useState } from 'react';
import { Plus, Database, FileText, AlertTriangle, Eye, ShieldAlert, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Decoy {
  id: string;
  path: string;
  type: string;
  secret_token: string | null;
  triggered: boolean;
  triggered_count: number;
  last_triggered: number | null;
}

interface HoneypotDecoysProps {
  decoys: Decoy[];
  onAddDecoy: (path: string, type: string, secretToken: string) => Promise<void>;
  loading: boolean;
}

export default function HoneypotDecoys({ decoys, onAddDecoy, loading }: HoneypotDecoysProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [path, setPath] = useState('');
  const [type, setType] = useState('FILE');
  const [token, setToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!path) return;
    setSubmitting(true);
    try {
      await onAddDecoy(path, type, token);
      setPath('');
      setToken('');
      setShowAddForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-white/90">Honeypot Decoy Deployments</h3>
          <p className="text-zinc-500 text-xs mt-1">Deploy digital-twin landmines. Catch agents seeking to extract sensitive keys or internal files.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black px-4 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95"
        >
          <Plus size={14} />
          {showAddForm ? 'Close Portal' : 'Deploy Decoy'}
        </button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 space-y-4 max-w-xl backdrop-blur-xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Configure Simulated Honey-Asset
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Asset Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    <option value="FILE">Simulated File Path</option>
                    <option value="DB">Simulated DB Table</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Target Name/Path</label>
                  <input
                    type="text"
                    required
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder={type === 'FILE' ? '/etc/security/aws.key' : 'user_tokens_archive'}
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Honey Token (Injected Payload)</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="AWS_SECRET_KEY=... or Master Credentials String"
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-700"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl border border-zinc-700/50 hover:border-zinc-650 transition-all flex items-center justify-center gap-2"
              >
                <Send size={12} />
                {submitting ? 'Deploying...' : 'Deploy Decoy into Digital Twin'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {decoys.map((decoy, idx) => (
          <motion.div
            key={decoy.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`bg-zinc-900/40 border rounded-3xl p-6 backdrop-blur-xl transition-all relative overflow-hidden flex flex-col justify-between ${
              decoy.triggered
                ? 'border-red-500/30 bg-gradient-to-br from-red-500/5 to-transparent'
                : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {/* Visual Indicator of breach */}
            {decoy.triggered && (
              <div className="absolute top-4 right-4 animate-ping w-2 h-2 rounded-full bg-red-500" />
            )}

            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-2xl">
                  {decoy.type === 'FILE' ? (
                    <FileText className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Database className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                {decoy.triggered ? (
                  <span className="text-[9px] font-black uppercase font-mono px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                    <ShieldAlert size={10} />
                    BREACHED
                  </span>
                ) : (
                  <span className="text-[9px] font-bold uppercase font-mono px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                    ARMED
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {decoy.type === 'FILE' ? 'Virtual File Node' : 'Database Entity'}
                </p>
                <h4 className="font-mono font-bold text-white text-xs truncate max-w-full" title={decoy.path}>
                  {decoy.path}
                </h4>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800/50 space-y-3">
              <div className="flex justify-between text-[10px]">
                <span className="text-zinc-500">Access Triggers:</span>
                <span className={`font-mono font-bold ${decoy.triggered ? 'text-red-400' : 'text-zinc-300'}`}>
                  {decoy.triggered_count} hits
                </span>
              </div>

              {decoy.last_triggered && (
                <div className="flex justify-between text-[10px]">
                  <span className="text-zinc-500">Last Breached:</span>
                  <span className="text-zinc-400 font-medium">
                    {new Date(decoy.last_triggered * 1000).toLocaleTimeString()}
                  </span>
                </div>
              )}

              {decoy.secret_token && (
                <div className="mt-2 bg-zinc-950/60 border border-zinc-800/60 rounded-xl p-3 flex flex-col gap-1">
                  <span className="text-[8px] font-bold text-zinc-600 uppercase flex items-center gap-1">
                    <Eye size={8} /> Simulated Secret Payload
                  </span>
                  <span className="font-mono text-[9px] text-zinc-500 break-all select-all">
                    {decoy.secret_token}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
