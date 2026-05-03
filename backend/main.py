from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import asyncio
from typing import AsyncGenerator

from sqlalchemy.orm import Session

from backend.core.database import SessionLocal, engine, Base, get_db
from backend.models.video import VideoJob, JobStatus
from backend.workers.celery_app import celery_app
from backend.workers.tasks import process_video_task # Import the Celery task

app = FastAPI(title="SmartVex API")

# Define UPLOAD_DIR
UPLOAD_DIR = "backend/uploads"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Create database tables
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "SmartVex API is running"}

@app.post("/api/v1/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    tool: str = Form(...),
    db: Session = Depends(get_db)
):
    # Create a unique filename for the uploaded video
    # In a real app, use UUIDs or similar for robust unique naming
    unique_filename = f"{os.path.splitext(file.filename)[0]}_{os.urandom(8).hex()}{os.path.splitext(file.filename)[1]}"
    file_location = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file to disk
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create a VideoJob entry in the database
    # user_id is hardcoded for now, replace with actual user authentication
    user_id_placeholder = "test_user_123" 
    new_job = VideoJob(
        user_id=user_id_placeholder,
        original_name=file.filename,
        status=JobStatus.queued,
        tool_used=tool,
        output_url=None # Will be updated after processing
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    # Enqueue the Celery task
    # For now, output_path can be derived from input_path or a new dir
    output_path = os.path.join(UPLOAD_DIR, f"processed_{unique_filename}")
    process_video_task.delay(new_job.id, file_location, output_path, user_id_placeholder)
    
    return {
        "job_id": new_job.id,
        "status": new_job.status.value,
        "filename": new_job.original_name,
        "tool": new_job.tool_used
    }

@app.websocket("/ws/job-status/{job_id}")
async def websocket_job_status(websocket: WebSocket, job_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    try:
        while True:
            job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
            if job:
                # In a real app, you might parse Celery's progress state more deeply
                # For now, we'll send a simplified status
                status_data = {
                    "job_id": job.id,
                    "status": job.status.value,
                    "output_url": job.output_url,
                    # Placeholder for progress. Celery task would update DB with this.
                    "progress": 0 if job.status == JobStatus.queued else (100 if job.status == JobStatus.completed else 50) 
                }
                await websocket.send_json(status_data)
                
                if job.status in [JobStatus.completed, JobStatus.failed]:
                    break
            else:
                await websocket.send_json({"job_id": job_id, "status": "not_found"})
                break
            await asyncio.sleep(1) # Check every second
    except WebSocketDisconnect:
        print(f"WebSocketDisconnect for job {job_id}")
    except Exception as e:
        print(f"WebSocket error for job {job_id}: {e}")
    finally:
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
