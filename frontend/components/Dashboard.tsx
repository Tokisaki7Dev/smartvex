"use client";

import React, { useState, useCallback, useEffect } from 'react'; // Added useEffect
import { 
  Scissors, Type, Minimize2, RefreshCcw, Volume2, Sparkles, 
  Upload, Play, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';

const tools = [
  { id: 'corte', name: 'Corte', icon: Scissors, desc: 'Ajuste o tempo do seu vídeo' },
  { id: 'legenda', name: 'Legenda', icon: Type, desc: 'Legendas automáticas com AI' },
  { id: 'compressao', name: 'Compressão', icon: Minimize2, desc: 'Reduza o tamanho sem perder qualidade' },
  { id: 'conversao', name: 'Conversão', icon: RefreshCcw, desc: 'Mude o formato instantaneamente' },
  { id: 'audio', name: 'Áudio', icon: Volume2, desc: 'Extraia ou substitua o áudio' },
  { id: 'enhancer', name: 'Enhancer', icon: Sparkles, desc: 'Melhoria de nitidez e cores' },
];

type JobStatusData = {
  job_id: number;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'not_found';
  progress: number;
  output_url: string | null;
};

export default function Dashboard() {
  const [activeTool, setActiveTool] = useState('enhancer');
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatusData['status']>('queued');
  const [jobProgress, setJobProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleUpload = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setJobId(null); // Reset job ID
    setJobStatus('queued');
    setJobProgress(0);
    setOutputUrl(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('tool', activeTool);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setJobId(data.job_id);
      setJobStatus(data.status);
      // setJobProgress(data.progress || 0); // Initial progress might be 0
    } catch (error) {
      console.error('Upload failed', error);
      setJobStatus('failed');
    }
  }, [activeTool]);

  useEffect(() => {
    if (!jobId) return;

    // Use a secure WebSocket connection (wss) in production
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws/job-status/${jobId}`);

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data: JobStatusData = JSON.parse(event.data);
      console.log('WebSocket message received:', data);
      setJobStatus(data.status);
      setJobProgress(data.progress);
      setOutputUrl(data.output_url);

      if (data.status === 'completed' || data.status === 'failed' || data.status === 'not_found') {
        ws.close();
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setJobStatus('failed');
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, [jobId]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleUpload(droppedFile);
  };

  const displayProcessing = jobId !== null && (jobStatus === 'queued' || jobStatus === 'processing');
  const displayCompleted = jobStatus === 'completed';
  const displayFailed = jobStatus === 'failed';

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 p-8 font-sans">
      <header className="max-w-7xl mx-auto mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            SmartVex
          </h1>
          <p className="text-gray-500 mt-2">Fundação de Processamento de Vídeo Pro</p>
        </div>
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tools */}
        <div className="lg:col-span-1 space-y-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`w-full text-left p-4 rounded-xl transition-all border ${
                activeTool === tool.id 
                ? 'bg-zinc-900 border-zinc-700 shadow-lg' 
                : 'bg-transparent border-transparent hover:bg-zinc-900/50 hover:border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-4">
                <tool.icon className={`w-5 h-5 ${activeTool === tool.id ? 'text-blue-400' : 'text-gray-500'}`} />
                <div>
                  <div className="font-semibold text-sm">{tool.name}</div>
                  <div className="text-xs text-gray-500 truncate">{tool.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Workspace */}
        <div className="lg:col-span-3 space-y-6">
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className="relative h-[400px] rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center transition-colors hover:border-zinc-700 group"
          >
            {displayProcessing ? (
              <div className="text-center space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                <div className="text-xl font-medium">
                  {jobStatus === 'queued' ? 'Enviando...' : `Processando ${file?.name}...`}
                </div>
                <div className="w-64 h-1.5 bg-zinc-800 rounded-full overflow-hidden mx-auto">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: `${jobProgress}%` }}
                  />
                </div>
                <div className="text-sm text-gray-500">{jobProgress}% completo</div>
              </div>
            ) : displayCompleted ? (
              <div className="text-center space-y-4 text-green-500">
                <CheckCircle className="w-12 h-12 mx-auto" />
                <div className="text-xl font-medium">Concluído!</div>
                {outputUrl && (
                  <a 
                    href={outputUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-400 hover:underline"
                  >
                    Baixar seu vídeo
                  </a>
                )}
              </div>
            ) : displayFailed ? (
              <div className="text-center space-y-4 text-red-500">
                <AlertCircle className="w-12 h-12 mx-auto" />
                <div className="text-xl font-medium">Falha no processamento.</div>
                <p className="text-sm text-gray-500">Por favor, tente novamente.</p>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-zinc-500" />
                </div>
                <div className="text-xl font-medium mb-2">Arraste seu vídeo aqui</div>
                <p className="text-gray-500 text-sm mb-8 text-center max-w-xs">
                  MP4, MOV, AVI ou MKV. Máximo de 2GB por arquivo.
                </p>
                <input 
                  type="file" 
                  className="hidden" 
                  id="file-upload" 
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
                <label 
                  htmlFor="file-upload"
                  className="px-8 py-3 bg-white text-black rounded-full font-semibold cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  Selecionar Arquivo
                </label>
              </>
            )}
          </div>

          {/* Recent Jobs (placeholder for now) */}
          <div className="bg-zinc-900/50 rounded-3xl border border-zinc-800 p-6">
            <h3 className="text-lg font-semibold mb-4">Trabalhos Recentes</h3>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">
                      <Play className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">projeto_final_v{i}.mp4</div>
                      <div className="text-xs text-gray-500 uppercase tracking-widest">{tools[i].name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    Concluído
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
