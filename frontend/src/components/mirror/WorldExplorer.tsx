"use client";

import React, { useState } from "react";
import { Folder, File, Database, ChevronRight, ChevronDown, Terminal, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WorldExplorerProps {
  files: Record<string, string>;
  database: Record<string, any[]>;
}

const WorldExplorer: React.FC<WorldExplorerProps> = ({ files, database }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["/"]));

  // Transform flat file paths into a nested tree
  const fileTree = React.useMemo(() => {
    const root: any = { name: "/", type: "folder", children: {} };
    Object.keys(files).forEach(path => {
      const parts = path.split("/").filter(Boolean);
      let current = root;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current.children[part] = { name: part, type: "file", path };
        } else {
          if (!current.children[part]) {
            current.children[part] = { name: part, type: "folder", children: {} };
          }
          current = current.children[part];
        }
      });
    });
    return root;
  }, [files]);

  const toggleFolder = (path: string) => {
    const next = new Set(expandedFolders);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedFolders(next);
  };

  const renderTree = (node: any, path: string = "") => {
    const currentPath = `${path}/${node.name}`;
    const isExpanded = expandedFolders.has(currentPath);

    return (
      <div key={currentPath} className="pl-4">
        <div 
          className={`flex items-center gap-2 py-1 cursor-pointer transition-colors ${node.type === 'file' ? 'hover:text-cyan-400' : 'hover:text-white/80'}`}
          onClick={() => node.type === 'folder' ? toggleFolder(currentPath) : setSelectedFile(node.path)}
        >
          {node.type === 'folder' ? (
            <>
              {isExpanded ? <ChevronDown size={14} className="text-white/20" /> : <ChevronRight size={14} className="text-white/20" />}
              <Folder size={14} className="text-cyan-500/50" />
            </>
          ) : (
            <File size={14} className="text-white/20" />
          )}
          <span className={`text-[11px] font-medium ${selectedFile === node.path ? "text-cyan-400" : "text-white/60"}`}>
            {node.name}
          </span>
        </div>
        {node.type === 'folder' && isExpanded && (
          <div className="border-l border-white/5 ml-1.5">
            {Object.values(node.children).map((child: any) => renderTree(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-panel h-full flex flex-col bg-[#0a0a0c]/80 border-cyan-500/10 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/2">
        <div className="flex items-center gap-3">
          <Terminal size={16} className="text-cyan-400" />
          <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Environment Explorer</h3>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[9px] font-bold text-white/20 uppercase">Simulated OS: v4.2-MIRROR</span>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar: Tree View */}
        <div className="w-1/3 border-r border-white/5 overflow-y-auto p-4 custom-scrollbar bg-black/20">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 px-2">
               <Database size={12} className="text-cyan-400" />
               <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">Datastores</span>
            </div>
            {Object.keys(database).map(table => (
              <div key={table} className="flex items-center gap-2 px-6 py-1 text-[11px] text-white/60 hover:text-cyan-400 cursor-pointer">
                <span>{table}.db</span>
                <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-white/20">{database[table].length}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mb-2 px-2">
             <Folder size={12} className="text-cyan-400" />
             <span className="text-[10px] font-black text-white/30 uppercase tracking-tighter">File System</span>
          </div>
          {renderTree(fileTree)}
        </div>

        {/* Content: File Viewer */}
        <div className="flex-1 flex flex-col min-h-0 bg-black/40 relative">
          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div 
                key={selectedFile}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col min-h-0"
              >
                <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <File size={12} className="text-cyan-400" />
                    <span className="text-[10px] font-mono text-white/60">{selectedFile}</span>
                  </div>
                  <button className="p-1.5 rounded hover:bg-white/5 text-white/20">
                    <Eye size={12} />
                  </button>
                </div>
                <div className="flex-1 p-6 overflow-y-auto font-mono text-xs leading-relaxed text-cyan-100/60 custom-scrollbar whitespace-pre-wrap">
                  {files[selectedFile]}
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-10">
                <div className="w-32 h-32 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-4">
                  <Eye size={48} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Target Selected</p>
              </div>
            )}
          </AnimatePresence>
          
          {/* Blueprint Overlay Decor */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '100px 100px' }} />
        </div>
      </div>
    </div>
  );
};

export default WorldExplorer;
