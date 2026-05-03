'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { Upload, Zap, FileVideo, Command, Settings, Play, Clock, Activity } from 'lucide-react';
import { getSupabase } from '../services/supabaseClient';

const tools = [
  { name: 'Enhancer', icon: Zap, desc: 'Otimização IA' },
  { name: 'Corte', icon: FileVideo, desc: 'Edição precisa' },
  { name: 'Legenda', icon: Command, desc: 'Auto-caption' },
  { name: 'Compressão', icon: Settings, desc: 'Otimização' },
  { name: 'Conversão', icon: Play, desc: 'Transcodificação' },
  { name: 'Áudio', icon: Clock, desc: 'Restauração' }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Enhancer');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      const sb = getSupabase();
      if (!sb) return;
      const { data } = await sb.from('video_jobs').select('*').order('created_at', { ascending: false });
      if (data) setJobs(data);
    }
    init();
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-gray-100 font-sans tracking-tight">
      <nav className="px-10 py-6 flex items-center justify-between border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.6)]" />
          <span className="font-bold text-xl text-white">SmartVex</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="font-mono text-[10px] uppercase text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-900/50">Status: System Operational</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-10 grid grid-cols-12 gap-12">
        <aside className="col-span-3 space-y-3">
          {tools.map((tool) => (
            <button key={tool.name} onClick={() => setActiveTab(tool.name)} className={`w-full text-left px-5 py-4 rounded-2xl transition-all border ${activeTab === tool.name ? 'bg-white/5 border-white/10' : 'border-transparent hover:bg-white/[0.02]'}`}>
              <div className="flex items-center gap-3">
                <tool.icon size={18} className={activeTab === tool.name ? 'text-indigo-400' : 'text-gray-500'} />
                <span className={`font-semibold ${activeTab === tool.name ? 'text-white' : 'text-gray-400'}`}>{tool.name}</span>
              </div>
            </button>
          ))}
        </aside>

        <section className="col-span-9 space-y-10">
          <div className="bg-[#050505] rounded-[24px] p-12 border border-white/5 flex flex-col items-center justify-center text-center">
            <Upload size={32} className="text-gray-600 mb-6" />
            <h2 className="text-2xl font-bold mb-2">Upload de Mídia</h2>
            <p className="text-gray-500 mb-8 max-w-sm">Tecnologia Xeon otimizada para criadores de vídeo curto.</p>
            <button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-indigo-50 transition-all">Iniciar Upload</button>
          </div>

          <section>
            <h3 className="text-lg font-semibold mb-6">Atividade Recente</h3>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-5 rounded-2xl bg-[#080808] border border-white/5 flex items-center justify-between">
                  <p className="text-sm font-medium">{job.original_name}</p>
                  <span className="text-xs text-emerald-500">{job.status}</span>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
