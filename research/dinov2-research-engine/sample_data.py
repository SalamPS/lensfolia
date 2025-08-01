import os
import shutil
from pathlib import Path
import random

def reduce_class_images(input_dir, output_dir, max_per_class=10):
    """
    Reduce number of images per class to a fixed maximum
    while preserving directory structure.
    
    Args:
        input_dir: Root directory of the original dataset
        output_dir: Where to create the reduced dataset
        max_per_class: Maximum images to keep per class
    """
    input_path = Path(input_dir)
    output_path = Path(output_dir)
    
    # Create output directory
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Walk through class directories
    for class_dir in input_path.iterdir():
        if class_dir.is_dir():
            # Create corresponding class dir in output
            class_output = output_path / class_dir.name
            class_output.mkdir(exist_ok=True)
            
            # Get all images in this class
            images = [f for f in class_dir.iterdir() 
                      if f.suffix.lower() in ['.jpg', '.jpeg', '.png']]
            
            # Skip if no images
            if not images:
                continue
                
            # Select random subset
            selected = random.sample(images, min(max_per_class, len(images)))
            
            # Copy selected images to output
            for img in selected:
                shutil.copy(img, class_output / img.name)
                
            print(f"Copied {len(selected)} images from {class_dir.name}")

# Usage example
if __name__ == "__main__":
    input_dataset = "./data/PlantVillage-Dataset"
    reduced_dataset = "./data/PlantVillage-Dataset-Sample"
    
    reduce_class_images(input_dataset, reduced_dataset, max_per_class=10)
    
    print(f"Reduced dataset created at: {reduced_dataset}")