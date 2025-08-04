"""Pydantic models for structured outputs."""

from typing import Dict, List
from pydantic import BaseModel, Field

class PlantDiseaseResponse(BaseModel):
    """Final structured response for plant disease detection"""
    
    is_plant_leaf: bool = Field(description="Whether the image contains a plant leaf")
    has_disease: bool = Field(description="Whether disease was detected on the leaf")
    plant_type: str = Field(description="Identified plant type or 'Unknown'")
    disease_name: str = Field(description="Identified disease name or 'None detected'")
    confidence_score: float = Field(description="Overall confidence in the diagnosis (0-1)")
    
    # Detection results
    total_detections: int = Field(description="Number of objects detected")
    top_predictions: List[Dict] = Field(description="Top predictions for each detected object")
    cropped_images: List[Dict] = Field(description="Cropped images with base64 data and classification", default_factory=list)
    
    # Analysis results
    image_analysis: str = Field(description="Initial image analysis results")
    overview: str = Field(description="Disease overview and information")
    treatment: str = Field(description="Treatment recommendations")
    products: str = Field(description="Recommended products with image links")
    
    # Metadata
    processed_at: str = Field(description="Processing timestamp")
    annotated_image: str = Field(description="Base64 encoded annotated image", default="")

class ImageAnalysisResult(BaseModel):
    """Structured output for image analysis"""
    is_plant_leaf: bool = Field(description="Whether the image contains a plant leaf")
    has_disease: bool = Field(description="Whether disease signs are visible on the leaf")
    plant_type: str = Field(description="Identified plant type or 'Unknown'")
    analysis: str = Field(description="Detailed visual analysis of the image")
    confidence: float = Field(description="Confidence in the analysis (0-1)", ge=0, le=1)
