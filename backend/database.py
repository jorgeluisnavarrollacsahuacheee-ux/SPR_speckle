from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Contraseña con @ debe ir URL-encoded como %40
DATABASE_URL = "postgresql+psycopg2://postgres:60809300N%40@localhost:5432/speckle_db"

# Crear motor de conexión
engine = create_engine(DATABASE_URL)

# Crear sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos
Base = declarative_base()

# Crear tablas automáticamente al iniciar (Sample y Reference)
def init_db():
    import backend.models  # importa tus modelos para que se registren
    Base.metadata.create_all(bind=engine)

# Dependencia para obtener sesión en endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()