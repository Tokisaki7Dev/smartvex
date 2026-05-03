from sqlalchemy import Column, Integer, String, Enum
import enum
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class JobStatus(enum.Enum):
    queued = "queued"
    processing = "processing"
    completed = "completed"
    failed = "failed"

class VideoJob(Base):
    __tablename__ = "video_jobs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    original_name = Column(String)
    status = Column(Enum(JobStatus), default=JobStatus.queued)
    tool_used = Column(String)
    output_url = Column(String, nullable=True)
    progress = Column(Integer, default=0)
