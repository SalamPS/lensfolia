"""Pydantic models and schemas for structured data."""

from typing import Dict, List
from pydantic import BaseModel, Field

class ImageAnalysisResult(BaseModel):
    """Structured output for image analysis"""
    is_plant_leaf: bool = Field(description="Whether the image contains a plant leaf")
    has_disease: bool = Field(description="Whether disease signs are visible on the leaf")
    plant_type: str = Field(description="Identified plant type or 'Unknown'")
    analysis: str = Field(description="Detailed visual analysis of the image")
    confidence: float = Field(description="Confidence in the analysis (0-1)", ge=0, le=1)
