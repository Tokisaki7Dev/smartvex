from fastapi import FastAPI, UploadFile, File, Form, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from backend.core.database import get_db, Base, engine
from backend.models.video import VideoJob, JobStatus
from backend.workers.tasks import process_video_task
import os, shutil

Base.metadata.create_all(bind=engine)
app = FastAPI(title="SmartVex API")

@app.post("/api/v1/upload")
async def upload(file: UploadFile = File(...), tool: str = Form(...), db: Session = Depends(get_db)):
    path = f"backend/uploads/{file.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    job = VideoJob(original_name=file.filename, tool_used=tool, status=JobStatus.queued)
    db.add(job)
    db.commit()
    db.refresh(job)
    
    process_video_task.delay(job.id, path, f"backend/uploads/processed_{file.filename}")
    return {"job_id": job.id}
