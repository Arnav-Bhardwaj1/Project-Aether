'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TimeScrubberProps {
  timeline: any[];
  currentIdx: number;
  onChange: (idx: number) => void;
}

export default function TimeScrubber({ timeline, currentIdx, onChange }: TimeScrubberProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const progress = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    const idx = Math.round(progress * (timeline.length - 1));
    onChange(idx);
  };

  return (
    <div className="relative pt-12 pb-8">
      {/* Event Markers Overlay */}
      <div className="absolute top-0 left-0 w-full flex justify-between px-1">
        {timeline.map((frame, idx) => (
          <div 
            key={frame.id}
            className={`w-0.5 h-6 transition-all duration-300 ${
              idx <= currentIdx ? 'bg-purple-500' : 'bg-zinc-800'
            } ${
              frame.event_type === 'VIOLATION' ? 'bg-red-500 h-10 -top-4 relative shadow-[0_0_10px_rgba(239,68,68,0.5)]' : ''
            }`}
            title={frame.event_type}
          />
        ))}
      </div>

      {/* Main Track */}
      <div 
        ref={containerRef}
        className="h-2 bg-zinc-800 rounded-full relative cursor-pointer group"
        onMouseDown={(e) => { setIsDragging(true); handleInteraction(e); }}
        onMouseMove={(e) => isDragging && handleInteraction(e)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Progress Bar */}
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
          initial={false}
          animate={{ width: `${(currentIdx / (timeline.length - 1)) * 100}%` }}
        />

        {/* Scrubber Handle */}
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-4 border-purple-600 shadow-xl cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${(currentIdx / (timeline.length - 1)) * 100}% - 12px)` }}
          animate={{ scale: isDragging ? 1.2 : 1 }}
        />

        {/* Hover Tooltip Placeholder */}
        <div className="absolute -top-16 hidden group-hover:block transition-all" style={{ left: `${(currentIdx / (timeline.length - 1)) * 100}%` }}>
           <div className="bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg text-[10px] whitespace-nowrap -translate-x-1/2 shadow-2xl">
              {timeline[currentIdx]?.event_type}: {new Date(timeline[currentIdx]?.timestamp * 1000).toLocaleTimeString()}
           </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-4 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
        <span>Session Start</span>
        <span>{timeline.length} Temporal Frames</span>
        <span>Session End</span>
      </div>
    </div>
  );
}
