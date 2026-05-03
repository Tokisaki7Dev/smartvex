from backend.workers.celery_app import celery_app
from backend.utils.ffmpeg.enhancer import VideoProcessor
from backend.models.video import VideoJob, JobStatus
from backend.core.database import SessionLocal
import requests
import os

@celery_app.task(bind=True)
def process_video_task(self, job_id: int, input_url: str, tool_used: str):
    db = SessionLocal()
    local_input = f"/tmp/{job_id}_input"
    local_output = f"/tmp/{job_id}_output"
    
    try:
        r = requests.get(input_url)
        with open(local_input, 'wb') as f:
            f.write(r.content)

        job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
        job.status = JobStatus.processing
        db.commit()

        processor = VideoProcessor(local_input)

        if tool_used == 'Corte':
            # Implementação de corte baseada em silêncio
            processor.detect_silence() 
            processor.convert_format(local_output)
        elif tool_used == 'Conversão':
            processor.convert_format(local_output)
        else:
            # Default Enhancer
            processor.run_ffmpeg("unsharp=5:5:1.0:5:5:0.0", local_output)
        
        job.status = JobStatus.completed
        db.commit()
    except Exception as e:
        job.status = JobStatus.failed
        db.commit()
    finally:
        if os.path.exists(local_input): os.remove(local_input)
        if os.path.exists(local_output): os.remove(local_output)
        db.close()
