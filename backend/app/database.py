import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Retrieve database connection string from environment variables, defaulting to a high-speed SQLite db for lightweight standalones
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:////workspace/retail_analytics_offline.db"
)

# SQLite-specific optimization for multi-threaded access (not needed for Postgres, but good for local standalones)
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    SQLAlchemy dependency function yielding database sessions on requests and guaranteeing cleanup.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
