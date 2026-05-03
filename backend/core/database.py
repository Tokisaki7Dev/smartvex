from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Database URL from environment variable
SQLALCHEMY_DATABASE_URL = os.getenv("SUPABASE_DB_URL", "postgresql://postgres:Tokisakibr1$@db.nvdnuwtnewnkoknmhkif.supabase.co:5432/postgres")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
