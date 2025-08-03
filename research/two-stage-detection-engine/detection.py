import cv2
import numpy as np
from PIL import Image
import httpx
from io import BytesIO
from ultralytics import YOLO

DETECT_CONFIDENCE = 0.30


class DetectionService:
    def __init__(self, model_path):
        self.model = YOLO(model_path)
        
    def detect(self, image_path):
        # Handle URL input
        if image_path.startswith(('http://', 'https://')):
            try:
                with httpx.Client() as client:
                    response = client.get(image_path, timeout=10.0)
                    response.raise_for_status()
                    img_array = np.frombuffer(response.content, np.uint8)
                    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
                    if img is None:
                        raise ValueError("Failed to decode downloaded image")
            except Exception as e:
                raise ValueError(f"Failed to process image from URL {image_path}: {str(e)}")
        # Handle file path input
        else:
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not load image from {image_path}")
            
        original_h, original_w = img.shape[:2]
        print(f"Original image size: {original_w}x{original_h}")

        # Run YOLOv8 inference - use image array directly if we have it (from URL)
        input_source = img if isinstance(image_path, str) and image_path.startswith(('http://', 'https://')) else image_path
        results = self.model(input_source, conf=DETECT_CONFIDENCE)
        
        boxes = []
        
        for result in results:
            for box in result.boxes:
                # Get box coordinates in (x1, y1, x2, y2) format
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                confidence = box.conf[0].item()
                
                # Convert to integers
                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                
                # Ensure coordinates are within image bounds
                x1 = max(0, min(x1, original_w))
                y1 = max(0, min(y1, original_h))
                x2 = max(0, min(x2, original_w))
                y2 = max(0, min(y2, original_h))
                
                if x2 <= x1 or y2 <= y1:
                    continue
                    
                boxes.append((x1, y1, x2, y2))

        print(f"Found {len(boxes)} detections")
        return boxes, img

# Example usage
if __name__ == "__main__":
    # Initialize detection service with default model
    detector = DetectionService("yolov8_best.pt")
    
    # Test with sample image URL
    test_url = "https://plantvillage-production-new.s3.amazonaws.com/image/99416/file/default-eb4701036f717c99bf95001c1a8f7b40.jpg"
    
    try:
        boxes, img = detector.detect(test_url)
        print(f"Detected {len(boxes)} objects")
        print("Box coordinates:")
        for i, (x1, y1, x2, y2) in enumerate(boxes):
            print(f"Box {i}: ({x1}, {y1}) to ({x2}, {y2})")
        
    except Exception as e:
        print(f"Detection error: {str(e)}")
