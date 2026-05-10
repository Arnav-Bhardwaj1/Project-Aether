'use client';

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface AnomalyRadarProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export default function AnomalyRadar({ data }: AnomalyRadarProps) {
  // Format data for Recharts
  const formattedData = data.labels.map((label, index) => ({
    subject: label,
    A: data.values[index] * 100, // Scale to 100 for better visualization
    fullMark: 100,
  }));

  return (
    <div className="w-full h-[250px] flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formattedData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" stroke="#9ca3af" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#374151" tick={false} />
          <Radar 
            name="Metrics" 
            dataKey="A" 
            stroke="#3b82f6" 
            fill="#3b82f6" 
            fillOpacity={0.3} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
