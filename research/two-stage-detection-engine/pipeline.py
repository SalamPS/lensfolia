import os
import cv2
import numpy as np
import base64
import time
from PIL import Image
from detection import DetectionService
from classifier import PlantDiseaseClassifier

ENLARGE_SCALE = 1.75

def enlarge_bbox(x1, y1, x2, y2, scale, img_width, img_height):
    w = x2 - x1
    h = y2 - y1
    cx = x1 + w / 2
    cy = y1 + h / 2

    new_w = w * scale
    new_h = h * scale

    new_x1 = max(0, int(cx - new_w / 2))
    new_y1 = max(0, int(cy - new_h / 2))
    new_x2 = min(img_width, int(cx + new_w / 2))
    new_y2 = min(img_height, int(cy + new_h / 2))

    return new_x1, new_y1, new_x2, new_y2

def annotate_image_with_predictions(img, boxes, predictions=None):
    annotated_img = img.copy()
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.5
    font_thickness = 2

    for i, (x1, y1, x2, y2) in enumerate(boxes):
        color = (153, 255, 153)  # Default color for detections
        cv2.rectangle(annotated_img, (x1, y1), (x2, y2), color, 2)

        if predictions and i < len(predictions):
            text = f"{predictions[i]['label']} ({predictions[i]['confidence']}%)"
        else:
            text = f"Detection {i+1}"
        # Calculate text size and position
        (text_w, text_h), baseline = cv2.getTextSize(text, font, font_scale, font_thickness)
        text_x = x1
        text_y = y1 - 10 if y1 - 10 > text_h else y1 + text_h + 10

        # Draw text background for better visibility
        cv2.rectangle(
            annotated_img,
            (text_x, text_y - text_h - baseline),
            (text_x + text_w, text_y + baseline),
            (0, 0, 0),
            thickness=cv2.FILLED,
        )

        # Put text over rectangle
        cv2.putText(
            annotated_img, text, (text_x, text_y), font, font_scale, color, font_thickness, lineType=cv2.LINE_AA
        )

    return annotated_img

class DetectionPipeline:
    def __init__(self, detection_model_path=None, classifier_model_dir=None):
        self.detection_model_path = detection_model_path or "yolov8_best.pt"
        self.classifier_model_dir = classifier_model_dir or "mobilenet_v2"
        # Initialize detector
        self.detector = DetectionService(self.detection_model_path)
        # Initialize classifier if model dir provided
        if self.classifier_model_dir:
            self.classifier = PlantDiseaseClassifier(self.classifier_model_dir)

    def process(self, image_path, save_annotated=False):
        start_time = time.time()
        
        # Run detection
        detected_boxes, img = self.detector.detect(image_path)
        img_height, img_width = img.shape[:2]

        # Store cropped images in memory (limit to first 5 for demo)
        cropped_images = []
        for i, (x1, y1, x2, y2) in enumerate(detected_boxes[:5]):
            # Enlarge bounding box
            x1, y1, x2, y2 = enlarge_bbox(x1, y1, x2, y2, ENLARGE_SCALE, img_width, img_height)
            
            # Crop image
            crop = img[y1:y2, x1:x2]
            
            # Convert to bytes and print first few characters
            _, buffer = cv2.imencode('.jpg', crop)
            img_bytes = buffer.tobytes()
            print(f"Crop {i} first bytes:", img_bytes[:20])  # Print first 20 bytes
            
            # Convert to PIL Image for classification
            crop_rgb = cv2.cvtColor(crop, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(crop_rgb)
            
            # Classify if classifier is available
            classification = []
            if hasattr(self, 'classifier'):
                classification = self.classifier.predict(pil_image, top_k=3)
            
            # Store in memory
            cropped_images.append({
                "coordinates": (x1, y1, x2, y2),
                "size": (x2-x1, y2-y1),
                "bytes_sample": img_bytes[:20],  # Just storing a sample for demo
                "classification": classification
            })

        if not detected_boxes:
            return {
                "detection_result": "",
                "cropped_images": [],
                "metadata": {
                    "processing_time": round((time.time() - start_time) * 1000, 1),
                    "detection_count": 0,
                    "image_dimensions": {
                        "width": img_width,
                        "height": img_height
                    }
                },
                "message": "No objects detected in the image"
            }

        # Get top predictions for annotation (use first prediction if available)
        top_predictions = []
        if hasattr(self, 'classifier'):
            top_predictions = [crop['classification'][0] for crop in cropped_images if crop.get('classification')]
        
        # Create annotated image in memory
        annotated_img = annotate_image_with_predictions(img, detected_boxes, top_predictions)
        
        # Save to file if requested
        if save_annotated:
            annotated_filename = "annotated_image.jpg"
            cv2.imwrite(annotated_filename, annotated_img)
        
        # Encode the annotated image as base64
        _, buffer = cv2.imencode('.jpg', annotated_img, [cv2.IMWRITE_JPEG_QUALITY, 95])
        base64_annotated = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')
        
        # Calculate processing time
        processing_time = round((time.time() - start_time) * 1000, 1)
        
        # Format final response
        result = {
            "detection_result": base64_annotated,
            "cropped_images": cropped_images,
            "metadata": {
                "processing_time": processing_time,
                "detection_count": len(detected_boxes),
                "image_dimensions": {
                    "width": img_width,
                    "height": img_height
                }
            }
        }

        return result


if __name__ == "__main__":
    # Initialize pipeline with default model
    pipeline = DetectionPipeline()
    
    # Test with sample image URL
    test_url = "https://plantvillage-production-new.s3.amazonaws.com/image/99416/file/default-eb4701036f717c99bf95001c1a8f7b40.jpg"
    
    try:
        results = pipeline.process(test_url, save_annotated=True)
        print("\nDetection Results:")
        print(results['detection_result'][:100]) 
        print("Cropped Images:")
        for i, crop in enumerate(results['cropped_images']):
            print(f"Crop {i}: Coordinates: {crop['coordinates']}, Size: {crop['size']}, Sample Bytes: {crop['bytes_sample']}")
            if crop['classification']:
                print(f"Classification: {crop['classification']}")
        print("-" * 50)
        print(f"Detected {results['metadata']['detection_count']} objects")
        print(f"Processing time: {results['metadata']['processing_time']}ms")
        print(f"Image dimensions: {results['metadata']['image_dimensions']}")
        
    except Exception as e:
        print(f"Detection error: {str(e)}")
