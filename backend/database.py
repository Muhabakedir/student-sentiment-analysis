import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
# Always provide Base so models can be defined
Base = declarative_base()

if not DATABASE_URL:
    print("⚠️ DATABASE_URL not set - database features will be unavailable")
    engine = None
    SessionLocal = None
else:
    # SQLite needs check_same_thread=False; PostgreSQL doesn't need it
    connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

def get_db():
    if not SessionLocal:
        raise HTTPException(status_code=503, detail="Database not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
