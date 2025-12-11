from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Contraseña con @ debe ir URL-encoded como %40
DATABASE_URL = "postgresql+psycopg2://postgres:60809300N%40@localhost:5432/speckle_db"

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()