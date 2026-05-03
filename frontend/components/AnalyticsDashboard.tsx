'use client';
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../services/supabaseClient';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    async function loadStats() {
      const { data } = await supabase.from('video_jobs').select('tool_used');
      if (data) {
        const counts = data.reduce((acc: any, job: any) => {
          acc[job.tool_used] = (acc[job.tool_used] || 0) + 1;
          return acc;
        }, {});
        setStats(Object.entries(counts).map(([name, count]) => ({ name, count: count as number })));
      }
    }
    loadStats();
  }, []);

  return (
    <div className="bg-[#080808] border border-white/5 rounded-3xl p-8 mt-10">
      <h3 className="text-lg font-semibold mb-6">Métricas de Produção</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats}>
            <XAxis dataKey="name" stroke="#444" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
