import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/inventory_db")

connect_args = {}
if "neon.tech" in DATABASE_URL or "sslmode=require" in DATABASE_URL:
    connect_args = {"sslmode": "require"}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
