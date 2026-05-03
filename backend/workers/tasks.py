from backend.workers.celery_app import celery_app
from backend.utils.ffmpeg.enhancer import enhance_video
from backend.models.video import VideoJob, JobStatus
from backend.core.database import SessionLocal

@celery_app.task(bind=True)
def process_video_task(self, job_id: int, input_path: str, output_path: str):
    db = SessionLocal()
    try:
        job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
        job.status = JobStatus.processing
        db.commit()

        def progress_cb(p):
            job.progress = p
            db.commit()
            self.update_state(state='PROGRESS', meta={'progress': p})

        enhance_video(input_path, output_path, progress_cb)
        
        job.status = JobStatus.completed
        job.output_url = output_path
        db.commit()
    except Exception as e:
        job.status = JobStatus.failed
        db.commit()
    finally:
        db.close()
