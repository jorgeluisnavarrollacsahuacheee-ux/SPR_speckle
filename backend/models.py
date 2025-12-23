from sqlalchemy import (
    Column,
    Integer,
    Float,
    String,
    Boolean,
    DateTime,
    JSON,
)
from sqlalchemy.sql import func
from backend.database import Base


# ============================================================
# REFERENCE
# ============================================================
class Reference(Base):
    __tablename__ = "references"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)
    path = Column(String, nullable=False)

    iv = Column(Float, nullable=True)

    active = Column(Boolean, default=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )


# ============================================================
# SAMPLE
# ============================================================
class Sample(Base):
    __tablename__ = "samples"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)

    iv_original = Column(Float, nullable=True)
    iv_processed = Column(Float, nullable=True)
    zncc = Column(Float, nullable=True)
    rssd = Column(Float, nullable=True)

    ops = Column(JSON, nullable=True)
    params = Column(JSON, nullable=True)
    filter_metrics = Column(JSON, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )
