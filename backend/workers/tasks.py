import os
# Removed asyncio and websockets imports as they are not directly used in the Celery task for sending progress
from sqlalchemy.orm import Session

from backend.workers.celery_app import celery_app
from backend.utils.ffmpeg.enhancer import enhance_video # Now using the synchronous version
from backend.models.video import VideoJob, JobStatus
from backend.core.database import SessionLocal

@celery_app.task(bind=True)
def process_video_task(self, job_id: int, input_path: str, output_path: str, user_id: str):
    db: Session = SessionLocal()
    job = None # Initialize job outside try for wider scope
    try:
        job = db.query(VideoJob).filter(VideoJob.id == job_id).first()
        if not job:
            print(f"Error: Job {job_id} not found.")
            return

        job.status = JobStatus.processing
        db.commit()
        db.refresh(job)

        def update_job_progress(progress: int):
            job.progress = progress # Assuming VideoJob will have a progress field
            db.commit()
            db.refresh(job)
            self.update_state(state='PROGRESS', meta={'progress': progress}) # Update Celery's state as well

        # Call the video enhancement logic with the progress callback
        # The enhance_video function now returns the output path on success
        final_output_path = enhance_video(input_path, output_path, update_job_progress)

        job.status = JobStatus.completed
        job.output_url = final_output_path
        job.progress = 100 # Ensure 100% on completion
        db.commit()
        db.refresh(job)

    except Exception as e:
        if job:
            job.status = JobStatus.failed
            job.progress = 0 # Reset progress on failure
            db.commit()
            db.refresh(job)
        print(f"Error processing video job {job_id}: {e}")
    finally:
        db.close()
        # Clean up temporary input file if it was copied
        if os.path.exists(input_path) and "temp_" in os.path.basename(input_path): # Basic check for temporary files
            os.remove(input_path)
    
    return {"job_id": job_id, "status": job.status.value, "output_url": job.output_url if job else None}

