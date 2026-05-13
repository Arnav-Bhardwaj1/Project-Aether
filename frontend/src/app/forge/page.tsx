'use client';

import React, { useState, useEffect } from 'react';
import { Flame, ShieldAlert } from 'lucide-react';
import AttackConfigurator from '@/components/forge/AttackConfigurator';
import SimulationMatrix from '@/components/forge/SimulationMatrix';
import VulnerabilityReport from '@/components/forge/VulnerabilityReport';

export default function ForgePage() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // Connect to WebSocket for live simulation updates
    const ws = new WebSocket('ws://localhost:8000/ws/forge');
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'FORGE_RESULT') {
        setResults(prev => [...prev, msg.data]);
      }
    };

    return () => ws.close();
  }, []);

  const handleStartSimulation = async (config: any) => {
    setIsSimulating(true);
    setResults([]); // Clear previous results
    
    try {
      const res = await fetch('http://localhost:8000/api/forge/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      setSessionId(data.session_id);
      
      // We simulate the end of the run after a delay based on iterations
      // In a real app, the backend would signal completion via WS
      const totalTests = config.categories.length * config.iterations;
      setTimeout(() => {
        setIsSimulating(false);
      }, totalTests * 2000 + 2000); // 2s per test + buffer
      
    } catch (err) {
      console.error("Failed to start Forge simulation", err);
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      {/* Header */}
      <header className="mb-12 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
              <Flame className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Aether <span className="text-red-500">Forge</span>
            </h1>
          </div>
          <p className="text-zinc-400 max-w-2xl">
            Automated adversarial red-teaming simulator. Stress-test your agent's governance layer with AI-generated payloads.
          </p>
        </div>
        
        {sessionId && (
          <div className="text-xs text-zinc-500 font-mono bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
            SESSION: {sessionId}
          </div>
        )}
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configurator & Report */}
        <div className="lg:col-span-1 space-y-8">
          <AttackConfigurator onStart={handleStartSimulation} isSimulating={isSimulating} />
          
          {!isSimulating && results.length > 0 && (
            <VulnerabilityReport results={results} />
          )}
        </div>

        {/* Right Column: Live Matrix */}
        <div className="lg:col-span-2">
          <SimulationMatrix results={results} />
        </div>
      </main>
    </div>
  );
}
