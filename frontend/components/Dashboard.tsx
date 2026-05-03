'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Zap, FileVideo, Command, Settings, Play, Clock, ChevronRight, Activity, X } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const tools = [
  { name: 'Enhancer', icon: Zap, desc: 'Otimização de vídeo com IA' },
  { name: 'Corte', icon: FileVideo, desc: 'Edição de precisão frame a frame' },
  { name: 'Legenda', icon: Command, desc: 'Transcrição e legendagem automática' },
  { name: 'Compressão', icon: Settings, desc: 'Otimização sem perda de qualidade' },
  { name: 'Conversão', icon: Play, desc: 'Transcodificação de alta fidelidade' },
  { name: 'Áudio', icon: Clock, desc: 'Restauração e mixagem de áudio' }
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Enhancer');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    const { data } = await supabase.from('video_jobs').select('*').order('created_at', { ascending: false });
    if (data) setJobs(data);
  }

  async function handleFile(file: File) {
    if (!file) return;
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tool', activeTab);

    try {
      const response = await fetch('https://smartvex-api.onrender.com/api/v1/upload', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        alert('Upload realizado com sucesso!');
        fetchJobs();
      }
    } catch (err) {
      alert('Erro ao realizar upload.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030303] text-gray-100 font-sans tracking-tight">
      <nav className="px-10 py-6 flex items-center justify-between border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.6)]" />
          <span className="font-bold text-xl text-white">SmartVex</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-emerald-400 border border-emerald-900/50">
          <Activity size={14} />
          <span className="font-mono text-xs font-semibold uppercase tracking-widest">System Online</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-10 grid grid-cols-12 gap-12">
        <aside className="col-span-3 space-y-3">
          <p className="px-4 text-[11px] uppercase tracking-[0.2em] text-gray-600 font-semibold mb-4">Módulos</p>
          {tools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => setActiveTab(tool.name)}
              className={`w-full group text-left px-5 py-4 rounded-2xl transition-all duration-300 border ${activeTab === tool.name ? 'bg-white/5 border-white/10' : 'border-transparent hover:border-white/5'}`}
            >
              <div className="flex items-center gap-3 mb-1">
                <tool.icon size={18} className={activeTab === tool.name ? 'text-indigo-400' : 'text-gray-500'} />
                <span className={`font-semibold ${activeTab === tool.name ? 'text-white' : 'text-gray-400'}`}>{tool.name}</span>
              </div>
            </button>
          ))}
        </aside>

        <section className="col-span-9 space-y-10">
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-[#050505] rounded-[22px] p-16 flex flex-col items-center justify-center text-center">
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
              <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 shadow-inner border border-white/5 hover:bg-white/10 transition">
                {loading ? <Activity className="animate-spin text-indigo-400" size={32} /> : <Upload size={32} className="text-gray-400" />}
              </div>
              <h2 className="text-3xl font-semibold mb-3">{loading ? 'Processando...' : 'Solte seu vídeo para processar'}</h2>
              <button onClick={() => fileInputRef.current?.click()} className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-xl">
                {loading ? 'Aguarde...' : 'Selecionar Arquivo'}
              </button>
            </div>
          </div>

          <section>
            <h3 className="text-lg font-semibold tracking-tight mb-6">Histórico</h3>
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-5 rounded-2xl bg-[#080808] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <FileVideo size={24} className="text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">{job.original_name}</p>
                      <p className="text-[11px] text-gray-600 uppercase">{job.tool_used}</p>
                    </div>
                  </div>
                  <div className="text-xs text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">{job.status}</div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
