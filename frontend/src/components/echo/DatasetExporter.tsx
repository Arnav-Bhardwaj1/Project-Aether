'use client';

import React, { useState } from 'react';
import { FileSpreadsheet, Download, RefreshCw, Copy, Check } from 'lucide-react';

interface DatasetExporterProps {
  logs: any[];
}

export default function DatasetExporter({ logs }: DatasetExporterProps) {
  const [format, setFormat] = useState<'GEMINI' | 'OPENAI' | 'RAW'>('GEMINI');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledOutput, setCompiledOutput] = useState('');
  const [copied, setCopied] = useState(false);

  // Extract unique tags from logs
  const allTags = Array.from(
    new Set(logs.flatMap(log => log.tags || []))
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompiledOutput('');
    try {
      const res = await fetch('http://localhost:8000/api/echo/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          tags: selectedTags.length > 0 ? selectedTags : null
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        setCompiledOutput(data.jsonl);
      }
    } catch (err) {
      console.error("Compilation failed", err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownload = () => {
    if (!compiledOutput) return;
    const blob = new Blob([compiledOutput], { type: 'application/x-jsonlines' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aether_tune_${format.toLowerCase()}_${Date.now()}.jsonl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!compiledOutput) return;
    navigator.clipboard.writeText(compiledOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls panel */}
      <div className="lg:col-span-5 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl space-y-6 flex flex-col h-[650px]">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
          Fine-Tuning Compiler
        </h3>

        {/* Formats Selection */}
        <div className="space-y-3">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Export Format Target</span>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: 'GEMINI', name: 'Gemini Chat JSONL', desc: 'System/User message turn format.' },
              { id: 'OPENAI', name: 'OpenAI Chat JSONL', desc: 'Standard ChatGPT Messages role structure.' },
              { id: 'RAW', name: 'Raw JSONL Prompt-Completion', desc: 'Flat key-value prompt and completions.' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id as any)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${format === f.id ? 'bg-emerald-500/10 border-emerald-500/40 text-white' : 'bg-black/30 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
              >
                <div className="text-xs font-bold">{f.name}</div>
                <div className="text-[10px] text-zinc-500 mt-0.5 leading-none">{f.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex-1 flex flex-col min-h-0 space-y-3">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Filter Dataset by Tags</span>
          <div className="flex-1 overflow-y-auto border border-zinc-800/50 bg-black/30 rounded-2xl p-4 space-y-2 custom-scrollbar">
            {allTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition-all ${isSelected ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 font-bold' : 'bg-black/20 border-zinc-850 text-zinc-500 hover:border-zinc-750'}`}
                >
                  <span>{tag}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                </button>
              );
            })}
            {allTags.length === 0 && (
              <div className="text-center text-zinc-600 text-xs italic py-10">
                No tags found in database yet.
              </div>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={handleCompile}
          disabled={isCompiling}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          {isCompiling ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <RefreshCw className="w-5 h-5" />
              COMPILE TUNE PAYLOAD
            </>
          )}
        </button>
      </div>

      {/* Output compiler preview */}
      <div className="lg:col-span-7 bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 backdrop-blur-xl flex flex-col h-[650px] space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-zinc-200">Compiled Output Preview</h3>
            <p className="text-xs text-zinc-500">Valid JSON Lines output for training.</p>
          </div>
          {compiledOutput && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="p-2 bg-black/30 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-zinc-400" />}
                <span className="text-[10px] font-bold text-zinc-400">{copied ? 'COPIED!' : 'COPY'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="text-[10px] font-bold">DOWNLOAD</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 border border-zinc-800 bg-black/60 rounded-2xl overflow-hidden relative">
          <textarea
            readOnly
            value={compiledOutput}
            placeholder="Click 'COMPILE TUNE PAYLOAD' to build fine-tuning training records..."
            className="w-full h-full bg-transparent p-6 text-xs text-zinc-400 font-mono focus:outline-none resize-none custom-scrollbar"
          />
        </div>
      </div>
    </div>
  );
}
