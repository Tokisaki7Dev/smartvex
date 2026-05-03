from fastapi import FastAPI, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session
from backend.core.database import get_db, Base, engine
from backend.models.video import VideoJob, JobStatus
from backend.workers.tasks import process_video_task
from supabase import create_client
import os

Base.metadata.create_all(bind=engine)
app = FastAPI(title="SmartVex API")

# Inicializa cliente Supabase
supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

@app.post("/api/v1/upload")
async def upload(file: UploadFile = File(...), tool: str = Form(...), db: Session = Depends(get_db)):
    # Upload para Supabase Storage
    content = await file.read()
    supabase.storage.from_("videos").upload(file.filename, content)
    public_url = supabase.storage.from_("videos").get_public_url(file.filename)

    # Cria job no DB
    job = VideoJob(original_name=file.filename, tool_used=tool, status=JobStatus.queued)
    db.add(job)
    db.commit()
    db.refresh(job)

    # Enfileira tarefa (passando a URL do storage em vez do caminho local)
    process_video_task.delay(job.id, public_url, f"processed_{file.filename}")
    return {"job_id": job.id, "url": public_url}
