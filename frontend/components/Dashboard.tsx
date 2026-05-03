'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { Upload, CheckCircle2, Loader2, Clock, FileVideo, LogIn } from 'lucide-react';
import { supabase } from '../services/supabaseClient';

const tools = ['Corte', 'Legenda', 'Compressão', 'Conversão', 'Áudio', 'Enhancer'];

type Job = {
  id: string;
  original_name: string;
  tool_used: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Enhancer');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase.from('video_jobs').select('*');
    if (data) setJobs(data);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github' });
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tool', activeTab);

    // Enviar para o seu backend FastAPI no Render
    const response = await fetch('https://smartvex-api.onrender.com/api/v1/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) fetchJobs();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-8 font-sans">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-white">SmartVex</h1>
        {user ? (
          <div className="text-sm">{user.email}</div>
        ) : (
          <button onClick={handleLogin} className="flex items-center gap-2 text-sm bg-[#111] px-4 py-2 rounded-lg">
            <LogIn className="w-4 h-4" /> Entrar
          </button>
        )}
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-2xl shadow-xl">
          <h2 className="text-lg font-medium text-white mb-6">Nova Tarefa: {activeTab}</h2>
          <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="border-2 border-dashed border-[#222] bg-[#0d0d0d] rounded-xl p-16 text-center hover:border-[#333] transition-all">
            <Upload className="w-10 h-10 mx-auto mb-4 text-gray-600" />
            <p>Arraste seu vídeo aqui</p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-8 rounded-2xl">
          <h2 className="text-lg font-medium text-white mb-6">Histórico</h2>
          <div className="space-y-4">
            {jobs.map(job => (
              <div key={job.id} className="flex items-center justify-between p-4 bg-[#111] rounded-lg border border-[#1a1a1a]">
                <div className="flex items-center gap-4">
                  <FileVideo className="text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{job.original_name}</p>
                    <p className="text-xs text-gray-500">{job.tool_used}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {job.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                  {job.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {job.status === 'queued' && <Clock className="w-5 h-5 text-gray-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
