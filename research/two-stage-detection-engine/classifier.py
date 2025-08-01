import onnxruntime
import numpy as np
from PIL import Image
import requests
from io import BytesIO
import json
import os

class PlantDiseaseClassifier:
    def __init__(self, model_dir):
        self.model_dir = model_dir
        self.config = self._load_config('config.json')
        self.preprocessor_config = self._load_config('preprocessor_config.json')
        self.ort_session = onnxruntime.InferenceSession(os.path.join(model_dir, 'model.onnx'))
    
    def _load_config(self, filename):
        with open(os.path.join(self.model_dir, filename)) as f:
            return json.load(f)
    
    def predict(self, image_path_or_url, top_k=5):
        """
        Predict plant disease from an image
        
        Args:
            image_path_or_url: Path to local image file or URL
            top_k: Number of top predictions to return
        
        Returns:
            List of dictionaries with keys 'label' and 'confidence'
        """
        try:
            # Load image
            if image_path_or_url.startswith('http'):
                response = requests.get(image_path_or_url)
                image = Image.open(BytesIO(response.content))
            else:
                image = Image.open(image_path_or_url)
            
            # Preprocess image
            image = self._preprocess_image(image)
            
            # Run inference
            predictions = self._run_inference(image)
            
            # Process results
            return self._get_top_predictions(predictions, top_k)
        
        except Exception as e:
            raise RuntimeError(f"Prediction failed: {str(e)}") from e
    
    def _preprocess_image(self, image):
        """Apply preprocessing steps to the image"""
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize
        width, height = image.size
        size = self.preprocessor_config['size']['shortest_edge']
        ratio = float(size) / min(width, height)
        new_size = tuple([int(x * ratio) for x in (width, height)])
        image = image.resize(new_size, Image.BILINEAR)
        
        # Center crop
        if self.preprocessor_config['do_center_crop']:
            crop_height = self.preprocessor_config['crop_size']['height']
            crop_width = self.preprocessor_config['crop_size']['width']
            top = (new_size[1] - crop_height) // 2
            left = (new_size[0] - crop_width) // 2
            image = image.crop((left, top, left + crop_width, top + crop_height))
        
        return image
    
    def _run_inference(self, image):
        """Run model inference on preprocessed image"""
        # Convert to numpy array
        image_array = np.array(image).astype(np.float32)
        
        # Apply rescaling
        if self.preprocessor_config['do_rescale']:
            image_array = image_array * np.float32(self.preprocessor_config['rescale_factor'])
        
        # Apply normalization
        if self.preprocessor_config['do_normalize']:
            mean = np.array(self.preprocessor_config['image_mean'], dtype=np.float32)
            std = np.array(self.preprocessor_config['image_std'], dtype=np.float32)
            image_array = (image_array - mean) / std
        
        # Prepare tensor (add batch dim and transpose to CHW)
        image_array = np.transpose(image_array, (2, 0, 1))
        image_array = np.expand_dims(image_array, axis=0)
        
        # Run inference
        ort_inputs = {self.ort_session.get_inputs()[0].name: image_array}
        ort_outs = self.ort_session.run(None, ort_inputs)
        return ort_outs[0]
    
    def _get_top_predictions(self, predictions, top_k):
        """Process raw predictions into top results"""
        # Apply softmax to get probabilities
        probs = np.exp(predictions[0]) / np.sum(np.exp(predictions[0]))
        top_indices = np.argsort(probs)[-top_k:][::-1]
        
        # Format results
        results = []
        for idx in top_indices:
            confidence = float(probs[idx]) * 100
            label = self.config['id2label'][str(idx)]
            results.append({
                "label": label,
                "confidence": round(confidence, 2)
            })
        
        return results

# Example usage
if __name__ == "__main__":
    # Initialize classifier
    classifier = PlantDiseaseClassifier(
        model_dir="mobilenet_v2_1.0_224-plant-disease-identification_onnx"
    )
    
    # Test prediction
    sample_image_url = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ45DSHrdt0fGo5JQdiXeRAO4RVIBhDWi25g&s"
    
    try:
        predictions = classifier.predict(sample_image_url)
        print("\nTop Predictions:")
        print("-" * 50)
        for i, pred in enumerate(predictions, 1):
            print(f"{i}. {pred['label']}: {pred['confidence']}%")
            
    except Exception as e:
        print(f"Prediction error: {str(e)}")