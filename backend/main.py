from fastapi import FastAPI, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.core.database import get_db, Base, engine
from backend.models.video import VideoJob, JobStatus
from backend.workers.tasks import process_video_task
from supabase import create_client, ClientOptions
import os
import logging
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SmartVex.API")

Base.metadata.create_all(bind=engine)
app = FastAPI(title="SmartVex API")

# Inicialização industrial com configuração de timeout
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_KEY")

options = ClientOptions(timeout=10) # 10 segundos de timeout
supabase = create_client(supabase_url, supabase_key, options) if supabase_url and supabase_key else None

async def upload_with_retry(filename, content, retries=3):
    for i in range(retries):
        try:
            return supabase.storage.from_("videos").upload(filename, content)
        except Exception as e:
            if i == retries - 1: raise e
            time.sleep(1)

@app.post("/api/v1/upload")
async def upload(file: UploadFile = File(...), tool: str = Form(...), db: Session = Depends(get_db)):
    if not supabase:
        raise HTTPException(status_code=500, detail="Storage não disponível.")
        
    try:
        content = await file.read()
        await upload_with_retry(file.filename, content)
        public_url = supabase.storage.from_("videos").get_public_url(file.filename)
        
        job = VideoJob(original_name=file.filename, tool_used=tool, status=JobStatus.queued)
        db.add(job)
        db.commit()
        db.refresh(job)
        
        process_video_task.delay(job.id, public_url, tool)
        return {"job_id": job.id, "url": public_url}
    except Exception as e:
        logger.error(f"Erro de upload persistente: {e}")
        raise HTTPException(status_code=500, detail="Falha ao processar upload industrial.")
