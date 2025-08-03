import cv2
import numpy as np
from PIL import Image
import httpx
from io import BytesIO
import onnxruntime as ort

DETECT_CONFIDENCE = 0.30

class DetectionService:
    def __init__(self, model_path, input_size=416):
        self.session = ort.InferenceSession(model_path)
        self.input_size = input_size
        
        # Get input and output details
        self.input_name = self.session.get_inputs()[0].name
        self.output_name = self.session.get_outputs()[0].name
        
    def _preprocess_image(self, img):
        """Preprocess image for YOLO ONNX model"""
        original_h, original_w = img.shape[:2]
        
        # Resize image to model input size while maintaining aspect ratio
        scale = min(self.input_size / original_w, self.input_size / original_h)
        new_w = int(original_w * scale)
        new_h = int(original_h * scale)
        
        # Resize image
        resized_img = cv2.resize(img, (new_w, new_h))
        
        # Create padded image
        padded_img = np.full((self.input_size, self.input_size, 3), 114, dtype=np.uint8)
        
        # Calculate padding offsets
        pad_x = (self.input_size - new_w) // 2
        pad_y = (self.input_size - new_h) // 2
        
        # Place resized image in center of padded image
        padded_img[pad_y:pad_y + new_h, pad_x:pad_x + new_w] = resized_img
        
        # Convert BGR to RGB and normalize
        padded_img = cv2.cvtColor(padded_img, cv2.COLOR_BGR2RGB)
        padded_img = padded_img.astype(np.float32) / 255.0
        
        # Change from HWC to CHW format
        padded_img = np.transpose(padded_img, (2, 0, 1))
        
        # Add batch dimension
        padded_img = np.expand_dims(padded_img, axis=0)
        
        return padded_img, scale, pad_x, pad_y
    
    def _postprocess_detections(self, outputs, original_w, original_h, scale, pad_x, pad_y):
        """Post-process ONNX model outputs to get bounding boxes"""
        predictions = outputs[0]  # Shape: (batch, 34, anchors)
        
        boxes = []
        confidences = []
        
        # predictions shape is (1, 34, 3549) - YOLOv8 format
        batch_predictions = predictions[0]  # Shape: (34, 3549)
        
        # Extract box coordinates (first 4 rows) and class scores (remaining rows)
        box_coords = batch_predictions[:4, :]  # (4, 3549)
        class_scores = batch_predictions[4:, :]  # (30, 3549) - assuming 30 classes
        
        # For each detection (anchor)
        num_detections = box_coords.shape[1]
        
        for i in range(num_detections):
            # Get class scores for this detection
            scores = class_scores[:, i]
            max_score = np.max(scores)
            
            # Skip low confidence detections
            if max_score < DETECT_CONFIDENCE:
                continue
                
            # Get box coordinates
            x_center, y_center, width, height = box_coords[:, i]
            
            # Convert from center format to corner format (still in model space)
            x1 = x_center - width / 2
            y1 = y_center - height / 2
            x2 = x_center + width / 2
            y2 = y_center + height / 2
            
            # Convert from model input space back to original image space
            # Scale back to original image coordinates
            x1 = (x1 - pad_x) / scale
            y1 = (y1 - pad_y) / scale
            x2 = (x2 - pad_x) / scale
            y2 = (y2 - pad_y) / scale
            
            # Convert to integers and ensure within bounds
            x1 = int(max(0, min(x1, original_w)))
            y1 = int(max(0, min(y1, original_h)))
            x2 = int(max(0, min(x2, original_w)))
            y2 = int(max(0, min(y2, original_h)))
            
            # Skip invalid boxes
            if x2 <= x1 or y2 <= y1:
                continue
                
            boxes.append((x1, y1, x2, y2))
            confidences.append(max_score)
        
        # Apply NMS to remove overlapping boxes
        if len(boxes) > 0:
            final_boxes = self._apply_nms(boxes, confidences, score_threshold=DETECT_CONFIDENCE, iou_threshold=0.5)
            return final_boxes
        
        return boxes
    
    def _apply_nms(self, boxes, scores, score_threshold=0.3, iou_threshold=0.5):
        """Apply Non-Maximum Suppression to remove overlapping boxes"""
        if len(boxes) == 0:
            return []
            
        # Convert to format expected by cv2.dnn.NMSBoxes
        boxes_array = np.array(boxes)
        scores_array = np.array(scores)
        
        # Convert from (x1, y1, x2, y2) to (x, y, w, h)
        boxes_xywh = []
        for x1, y1, x2, y2 in boxes:
            boxes_xywh.append([x1, y1, x2 - x1, y2 - y1])
        
        indices = cv2.dnn.NMSBoxes(boxes_xywh, scores_array, score_threshold, iou_threshold)
        
        if len(indices) > 0:
            indices = indices.flatten()
            return [boxes[i] for i in indices]
        else:
            return []
        
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

        # Preprocess image
        input_tensor, scale, pad_x, pad_y = self._preprocess_image(img)
        
        # Run inference
        outputs = self.session.run([self.output_name], {self.input_name: input_tensor})
        
        # Post-process results
        boxes = self._postprocess_detections(outputs, original_w, original_h, scale, pad_x, pad_y)

        print(f"Found {len(boxes)} detections")
        return boxes, img


# Example usage
if __name__ == "__main__":
    # Initialize detection service with ONNX model
    detector = DetectionService("yolov8_best.onnx", input_size=416)
    
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