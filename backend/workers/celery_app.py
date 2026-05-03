from celery import Celery
import os

celery_app = Celery(
    'smartvex',
    broker=os.getenv('REDIS_URL', 'redis://redis:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://redis:6379/0')
)
celery_app.conf.update(task_track_started=True)
