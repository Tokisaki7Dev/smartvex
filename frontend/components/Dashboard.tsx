'use client';
import React, { useState } from 'react';
import { Upload, Zap, FileVideo, Command, Settings, Play, Clock, ChevronRight, Activity } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#030303] text-gray-100 font-sans tracking-tight">
      {/* Navbar Minimalista */}
      <nav className="px-10 py-6 flex items-center justify-between border-b border-white/5 bg-[#030303]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-[0_0_20px_-5px_rgba(99,102,241,0.6)]" />
          <span className="font-bold text-xl text-white">SmartVex</span>
        </div>
        <div className="flex items-center gap-8 text-sm">
          <a href="#" className="text-white font-medium hover:text-indigo-400 transition">Dashboard</a>
          <a href="#" className="text-gray-500 hover:text-white transition">Meus Projetos</a>
          <div className="h-6 w-px bg-white/10" />
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-emerald-400 border border-emerald-900/50">
            <Activity size={14} />
            <span className="font-mono text-xs font-semibold uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-10 grid grid-cols-12 gap-12">
        {/* Sidebar de Ferramentas */}
        <aside className="col-span-3 space-y-3">
          <p className="px-4 text-[11px] uppercase tracking-[0.2em] text-gray-600 font-semibold mb-4">Módulos de Processamento</p>
          {tools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => setActiveTab(tool.name)}
              className={`w-full group text-left px-5 py-4 rounded-2xl transition-all duration-300 border ${
                activeTab === tool.name 
                ? 'bg-white/5 border-white/10' 
                : 'border-transparent hover:border-white/5 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <tool.icon size={18} className={activeTab === tool.name ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'} />
                <span className={`font-semibold ${activeTab === tool.name ? 'text-white' : 'text-gray-400'}`}>{tool.name}</span>
              </div>
              <p className="text-[11px] text-gray-600 pl-8">{tool.desc}</p>
            </button>
          ))}
        </aside>

        {/* Área Principal */}
        <section className="col-span-9 space-y-10">
          {/* Zona de Upload */}
          <div className="relative rounded-3xl p-[1px] bg-gradient-to-b from-white/10 to-transparent">
            <div className="bg-[#050505] rounded-[22px] p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8 shadow-inner border border-white/5">
                <Upload size={32} className="text-gray-400" />
              </div>
              <h2 className="text-3xl font-semibold mb-3">Solte seu vídeo para processar</h2>
              <p className="text-gray-500 max-w-md mb-10">Suporte a formatos 4K, 8K e processamento via tecnologia Xeon otimizada para sua carga de trabalho.</p>
              <button className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-indigo-50 active:scale-95 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                Iniciar Upload
              </button>
            </div>
          </div>

          {/* Histórico Recente */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold tracking-tight">Atividade Recente</h3>
              <button className="text-[12px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition">Ver Logs</button>
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="group p-5 rounded-2xl bg-[#080808] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileVideo size={24} className="text-gray-500 group-hover:text-indigo-400 transition" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">render_sequence_0{i}_final.mp4</p>
                      <p className="text-[11px] text-gray-600 font-mono mt-0.5">ID: 0x932{i}1a • 448MB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[11px] text-gray-600 uppercase font-bold tracking-wider">Status</p>
                      <p className="text-xs text-emerald-500">Processado</p>
                    </div>
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
