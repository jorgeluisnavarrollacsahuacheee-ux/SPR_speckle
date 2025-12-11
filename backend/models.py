from sqlalchemy import Column, Integer, Float, String
from backend.database import Base

class Sample(Base):
    __tablename__ = "samples"

    id = Column(Integer, primary_key=True, index=True)
    sample_name = Column(String, index=True)       # nombre de la muestra
    liquid_label = Column(String, index=True)      # tipo de líquido
    fft = Column(Float, nullable=True)             # valor FFT
    contrast = Column(Float, nullable=True)        # contraste
    mean_intensity = Column(Float, nullable=True)  # intensidad media
    zncc = Column(Float, nullable=True)            # correlación normalizada
    rssd = Column(Float, nullable=True)            # desviación cuadrática
    n_images = Column(Integer, nullable=True)      # número de imágenes asociadas
    classification = Column(String, nullable=True) # clasificación opcional
    folder_path = Column(String, nullable=True)    # ruta de carpeta
    reference_path = Column(String, nullable=True) # ruta de referencia