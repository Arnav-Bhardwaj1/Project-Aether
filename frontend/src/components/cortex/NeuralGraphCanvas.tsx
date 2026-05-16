'use client';

import React, { useEffect, useRef, useState } from 'react';

interface NeuralGraphCanvasProps {
  data: any;
}

export default function NeuralGraphCanvas({ data }: NeuralGraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const mouseRef = useRef({ x: 0, y: 0, isDown: false, draggedNode: null as any });

  useEffect(() => {
    if (!data || !data.nodes || !data.links || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const updateSize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect() || { width: 800, height: 600 };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    // Physics constants
    const K_SPRING = 0.04;
    const L_SPRING = 140;
    const K_REPULSION = 2000;
    const DAMPING = 0.8;
    const CENTER_FORCE = 0.01;

    // Node initialization (preserving state if data changes slightly)
    const nodes = data.nodes.map((n: any) => ({
      ...n,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: 6 + (n.degree * 2.5),
      color: n.type === 'concept' ? '#818cf8' : '#6366f1'
    }));

    const links = data.links.map((l: any) => ({
      ...l,
      source: nodes.find((n: any) => n.id === l.source),
      target: nodes.find((n: any) => n.id === l.target)
    })).filter((l: any) => l.source && l.target);

    // Interaction handling
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - transform.x) / transform.scale;
      const my = (e.clientY - rect.top - transform.y) / transform.scale;
      
      mouseRef.current.isDown = true;
      mouseRef.current.draggedNode = nodes.find((n: any) => {
        const dist = Math.sqrt((n.x - mx)**2 + (n.y - my)**2);
        return dist < n.radius * 2;
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (mouseRef.current.isDown) {
        if (mouseRef.current.draggedNode) {
          mouseRef.current.draggedNode.x = (mx - transform.x) / transform.scale;
          mouseRef.current.draggedNode.y = (my - transform.y) / transform.scale;
          mouseRef.current.draggedNode.vx = 0;
          mouseRef.current.draggedNode.vy = 0;
        } else {
          setTransform(prev => ({
            ...prev,
            x: prev.x + (e.movementX),
            y: prev.y + (e.movementY)
          }));
        }
      }
    };

    const handleMouseUp = () => {
      mouseRef.current.isDown = false;
      mouseRef.current.draggedNode = null;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoom = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform(prev => ({
        ...prev,
        scale: Math.max(0.2, Math.min(5, prev.scale * zoom))
      }));
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    let animationFrameId: number;

    const render = () => {
      // Physics Step
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        if (n1 === mouseRef.current.draggedNode) continue;

        // Repulsion
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          const force = K_REPULSION / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;

          n1.vx += fx; n1.vy += fy;
          n2.vx -= fx; n2.vy -= fy;
        }

        // Center Gravity
        n1.vx += (width / 2 - n1.x) * CENTER_FORCE;
        n1.vy += (height / 2 - n1.y) * CENTER_FORCE;
      }

      // Spring Forces
      links.forEach((link: any) => {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = K_SPRING * (dist - L_SPRING);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (link.source !== mouseRef.current.draggedNode) {
          link.source.vx += fx; link.source.vy += fy;
        }
        if (link.target !== mouseRef.current.draggedNode) {
          link.target.vx -= fx; link.target.vy -= fy;
        }
      });

      // Update positions
      nodes.forEach((n: any) => {
        if (n !== mouseRef.current.draggedNode) {
          n.vx *= DAMPING;
          n.vy *= DAMPING;
          n.x += n.vx;
          n.y += n.vy;
        }
      });

      // Draw Step
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.scale, transform.scale);

      // Draw Edges with Flow Animation
      const time = Date.now() * 0.002;
      links.forEach((link: any) => {
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
        ctx.lineWidth = 2 / transform.scale;
        ctx.stroke();

        // Animated "Data Packet"
        const dotX = link.source.x + (link.target.x - link.source.x) * (time % 1);
        const dotY = link.source.y + (link.target.y - link.source.y) * (time % 1);
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2 / transform.scale, 0, Math.PI * 2);
        ctx.fillStyle = '#818cf8';
        ctx.fill();
      });

      // Draw Nodes
      nodes.forEach((n: any) => {
        // Shadow/Glow
        ctx.beginPath();
        const glow = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 2.5);
        glow.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
        glow.addColorStop(1, 'rgba(99, 102, 241, 0)');
        ctx.fillStyle = glow;
        ctx.arc(n.x, n.y, n.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1 / transform.scale;
        ctx.stroke();

        // Label
        if (transform.scale > 0.6) {
          ctx.fillStyle = '#e4e4e7';
          ctx.font = `${12 / transform.scale}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(n.label, n.x, n.y + n.radius + (15 / transform.scale));
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', updateSize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [data, transform]);

  return (
    <div className="relative w-full h-full cursor-grab active:cursor-grabbing">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button 
          onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 1.2 }))}
          className="p-2 bg-zinc-800/80 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors text-white text-xs font-bold"
        >
          +
        </button>
        <button 
          onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale / 1.2 }))}
          className="p-2 bg-zinc-800/80 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors text-white text-xs font-bold"
        >
          -
        </button>
        <button 
          onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
          className="p-2 bg-zinc-800/80 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors text-white text-[10px] font-bold"
        >
          RESET
        </button>
      </div>
    </div>
  );
}
