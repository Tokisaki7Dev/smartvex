from backend.workers.celery_app import celery_app
from backend.utils.ffmpeg.enhancer import enhance_video
from backend.models.video import VideoJob, JobStatus
from backend.core.database import SessionLocal
import requests
import os

@celery_app.task(bind=True)
def process_video_task(self, job_id: int, input_url: str, output_filename: str):
    db = SessionLocal()
    local_input = f"/tmp/{job_id}_input"
    local_output = f"/tmp/{job_id}_output"
    
    try:
        # Download do Supabase
        r = requests.get(input_url)
        with open(local_input, 'wb') as f:
            f.write(r.content)

        job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
        job.status = JobStatus.processing
        db.commit()

        def progress_cb(p):
            job.progress = p
            db.commit()
            self.update_state(state='PROGRESS', meta={'progress': p})

        enhance_video(local_input, local_output, progress_cb)
        
        # Opcional: Upload do resultado de volta para o Supabase Storage aqui
        
        job.status = JobStatus.completed
        job.output_url = "PROCESSAMENTO_CONCLUIDO" 
        db.commit()
    except Exception as e:
        job.status = JobStatus.failed
        db.commit()
    finally:
        if os.path.exists(local_input): os.remove(local_input)
        if os.path.exists(local_output): os.remove(local_output)
        db.close()
