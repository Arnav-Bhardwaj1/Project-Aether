'use client';

import React, { useRef, useEffect } from 'react';

interface LivePulseGraphProps {
  data: number[];
}

export default function LivePulseGraph({ data }: LivePulseGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    if (!data || data.length === 0) return;
    
    // Draw Pulse Wave
    ctx.beginPath();
    ctx.lineWidth = 3;
    
    // Create a glowing effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(34, 197, 94, 0.5)'; // Green glow
    ctx.strokeStyle = '#22c55e'; // Green line
    
    const step = width / (data.length - 1);
    
    ctx.moveTo(0, height / 2 + data[0] * (height / 3));
    
    for (let i = 1; i < data.length; i++) {
      const x = i * step;
      const y = height / 2 + data[i] * (height / 3);
      
      // Use bezier curves for a smooth wave
      const prevX = (i - 1) * step;
      const prevY = height / 2 + data[i - 1] * (height / 3);
      const cpX = prevX + step / 2;
      
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
    
    ctx.stroke();
    
    // Reset shadow for next draws
    ctx.shadowBlur = 0;
    
    // Draw scanning effect (vertical line moving across)
    const scanX = (Date.now() % 2000) / 2000 * width;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 2;
    ctx.moveTo(scanX, 0);
    ctx.lineTo(scanX, height);
    ctx.stroke();
    
  }, [data]);

  return (
    <div className="relative w-full h-[200px] bg-black/60 rounded-2xl overflow-hidden border border-zinc-800">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={200} 
        className="w-full h-full"
      />
      <div className="absolute top-2 right-2 flex items-center gap-2">
         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
         <span className="text-[10px] uppercase font-bold text-green-500 tracking-wider">Live</span>
      </div>
    </div>
  );
}
