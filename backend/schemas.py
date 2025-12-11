from pydantic import BaseModel


class SpeckleMetricBase(BaseModel):
    sample: str
    n_value: float
    iv: float
    zncc: float
    rssd: float


class SpeckleMetricCreate(SpeckleMetricBase):
    pass


class SpeckleMetricResponse(SpeckleMetricBase):
    id: int

    class Config:
        from_attributes = True


class SpeckleMeasurementBase(BaseModel):
    sample_name: str
    liquid_label: str
    iv: float
    zncc: float
    rssd: float
    n_images: int
    classification: str
    folder_path: str
    reference_path: str


class SpeckleMeasurementResponse(SpeckleMeasurementBase):
    id: int

    class Config:
        from_attributes = True
