"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  violations?: any[];
  status?: "pending" | "done" | "error";
}

export default function AgentChat({ onTraceUpdate }: { onTraceUpdate: (trace: any) => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Setup WebSocket for tracing
    ws.current = new WebSocket("ws://localhost:8000/ws/trace");
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onTraceUpdate(data);
    };

    return () => {
      ws.current?.close();
    };
  }, [onTraceUpdate]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/agent/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await response.json();
      
      if (data.status === "BLOCKED") {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: "Request blocked by The Sentry governance policy.", 
          violations: data.reason,
          status: "error"
        }]);
      } else {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: data.output, 
          violations: data.violations,
          status: "done"
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Error communicating with Aether core.", status: "error" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Bot size={18} className="text-blue-400" />
          Agent Session
        </h3>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Gemini 1.5 Flash Connected
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-2">
            <Bot size={48} />
            <p className="text-sm">Start a conversation with Aether</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`
              max-w-[80%] rounded-2xl p-4 
              ${m.role === "user" ? "bg-blue-600 text-white" : "bg-white/5 border border-white/10"}
            `}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {m.role === "user" ? <User size={16} /> : <Bot size={16} className="text-blue-400" />}
                </div>
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed">{m.content}</p>
                  {m.violations && m.violations.length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2 mt-2">
                      <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase mb-1">
                        <ShieldAlert size={12} />
                        Sentry Violation
                      </div>
                      {m.violations.map((v, vi) => (
                        <p key={vi} className="text-[10px] text-red-300/80">{v.message}</p>
                      ))}
                    </div>
                  )}
                  {m.role === "assistant" && !m.violations?.length && m.status === "done" && (
                    <div className="flex items-center gap-1 text-[10px] text-green-400/60">
                      <ShieldCheck size={10} />
                      Verified by Aether Sentry
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse">
              <Loader2 className="animate-spin text-blue-400" size={18} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-white/5 border-t border-white/5">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a prompt for the agent..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
