"use client";

import { useState, useEffect, useCallback } from 'react';

export interface Snapshot {
  id: string;
  parent_id: string | null;
  session_id: string;
  branch_name: string;
  prompt: string;
  response: string;
  input_audit: any;
  output_audit: any;
  metadata: any;
  timestamp: number;
}

export interface TraceStep {
  step: string;
  status: string;
  snapshot_id?: string;
  data?: any;
}

export function useFlux(sessionId: string | null) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [traces, setTraces] = useState<TraceStep[]>([]);

  const fetchTree = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/flux/tree/${sessionId}`);
      const data = await res.json();
      setSnapshots(data.snapshots);
    } catch (err) {
      console.error("Failed to fetch flux tree:", err);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  useEffect(() => {
    if (!sessionId) return;

    const ws = new WebSocket('ws://localhost:8000/ws/trace');
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.session_id === sessionId) {
        if (msg.type === "TRACE_STEP") {
          setTraces(prev => {
            const exists = prev.findIndex(t => t.step === msg.step);
            if (exists !== -1) {
              const next = [...prev];
              next[exists] = msg;
              return next;
            }
            return [...prev, msg];
          });

          if (msg.status === "COMPLETED" || msg.status === "REDACTED") {
             // If the last step is done, refresh the tree
             if (msg.step === "OUTPUT_AUDIT") {
               setIsExecuting(false);
               fetchTree();
             }
          }
        }
      }
    };

    return () => ws.close();
  }, [sessionId, fetchTree]);

  const execute = async (prompt: string, parentId?: string | null, branchName: string = "Main") => {
    setIsExecuting(true);
    setTraces([]);
    try {
      const res = await fetch('http://localhost:8000/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          session_id: sessionId,
          parent_id: parentId,
          branch_name: branchName
        })
      });
      const data = await res.json();
      if (data.snapshot_id) {
        setActiveSnapshotId(data.snapshot_id);
      }
      return data;
    } catch (err) {
      console.error("Execution failed:", err);
      setIsExecuting(false);
    }
  };

  return {
    snapshots,
    activeSnapshotId,
    setActiveSnapshotId,
    isExecuting,
    traces,
    execute,
    fetchTree
  };
}
