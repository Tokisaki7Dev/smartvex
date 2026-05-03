from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.core.database import get_db, Base, engine
from backend.models.video import VideoJob, JobStatus
from backend.workers.tasks import process_video_task
from supabase import create_client
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SmartVex.API")

Base.metadata.create_all(bind=engine)
app = FastAPI(title="SmartVex API")

# Inicializa cliente Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

if not supabase_url or not supabase_key:
    logger.error("Credenciais do Supabase não encontradas!")
    supabase = None
else:
    supabase = create_client(supabase_url, supabase_key)

@app.post("/api/v1/upload")
async def upload(file: UploadFile = File(...), tool: str = Form(...), db: Session = Depends(get_db)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Configuração de Storage não encontrada.")
        
    try:
        # Validação simples de formato
        if not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="Arquivo deve ser um vídeo.")

        content = await file.read()
        
        # Upload com tratamento de erro
        result = supabase.storage.from_("videos").upload(file.filename, content)
        public_url = supabase.storage.from_("videos").get_public_url(file.filename)
        
        job = VideoJob(original_name=file.filename, tool_used=tool, status=JobStatus.queued)
        db.add(job)
        db.commit()
        db.refresh(job)
        
        process_video_task.delay(job.id, public_url, tool)
        return {"job_id": job.id, "url": public_url}
        
    except Exception as e:
        logger.error(f"Erro no upload industrial: {e}")
        raise HTTPException(status_code=500, detail=str(e))
