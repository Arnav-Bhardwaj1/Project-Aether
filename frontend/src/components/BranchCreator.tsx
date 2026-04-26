"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  GitBranch, 
  X, 
  Send,
  Settings,
  AlertCircle
} from "lucide-react";
import { Snapshot } from "../hooks/useFlux";

interface Props {
  parent: Snapshot | null;
  onExecute: (prompt: string, branchName: string) => void;
  onClose: () => void;
}

export default function BranchCreator({ parent, onExecute, onClose }: Props) {
  const [branchName, setBranchName] = useState("");
  const [prompt, setPrompt] = useState(parent?.prompt || "");

  if (!parent) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-xl glass p-8 shadow-2xl relative"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <GitBranch size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Fork Scenario</h2>
              <p className="text-xs text-white/40">Branching from snapshot {parent.id.substring(0,8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-white/40 uppercase mb-2">Scenario Name</label>
            <input 
              type="text" 
              placeholder="e.g. Security Test 1"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition-colors"
            />
          </div>

          <div>
             <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-white/40 uppercase">Modify Prompt</label>
                <div className="flex items-center gap-1 text-[10px] text-purple-400">
                   <AlertCircle size={10}/>
                   Changes will create a new path
                </div>
             </div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm h-32 focus:border-purple-500 outline-none transition-colors resize-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-sm font-bold hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                onExecute(prompt, branchName || "New Scenario");
                onClose();
              }}
              className="flex-[2] btn-primary bg-purple-600 flex items-center justify-center gap-2 hover:bg-purple-500"
            >
              <Send size={16} />
              Launch Execution
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
