#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

def create_download_icon(size, output_path):
    """Create a simple download manager icon"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Colors - modern blue gradient
    bg_color = (59, 130, 246)  # Blue
    arrow_color = (255, 255, 255)  # White
    
    # Draw rounded rectangle background
    margin = size // 8
    draw.rounded_rectangle(
        [(margin, margin), (size - margin, size - margin)],
        radius=size // 6,
        fill=bg_color
    )
    
    # Draw download arrow
    arrow_width = size // 3
    arrow_start_y = size // 3
    arrow_end_y = size * 2 // 3
    center_x = size // 2
    
    # Arrow shaft
    shaft_width = size // 12
    draw.rectangle(
        [(center_x - shaft_width, arrow_start_y),
         (center_x + shaft_width, arrow_end_y - arrow_width // 2)],
        fill=arrow_color
    )
    
    # Arrow head (triangle)
    arrow_head = [
        (center_x, arrow_end_y),  # Bottom point
        (center_x - arrow_width // 2, arrow_end_y - arrow_width // 2),  # Left
        (center_x + arrow_width // 2, arrow_end_y - arrow_width // 2),  # Right
    ]
    draw.polygon(arrow_head, fill=arrow_color)
    
    # Draw base line
    base_y = arrow_end_y + size // 20
    draw.rectangle(
        [(margin + size // 8, base_y),
         (size - margin - size // 8, base_y + size // 24)],
        fill=arrow_color
    )
    
    # Save image
    img.save(output_path, 'PNG')
    print(f"Created {output_path}")

# Generate different sizes
sizes = {
    'icon.png': 512,
    '16x16.png': 16,
    '24x24.png': 24,
    '32x32.png': 32,
    '48x48.png': 48,
    '64x64.png': 64,
    '128x128.png': 128,
    '256x256.png': 256,
    '512x512.png': 512,
}

base_path = os.path.dirname(os.path.abspath(__file__))

for filename, size in sizes.items():
    output_path = os.path.join(base_path, filename)
    create_download_icon(size, output_path)

print("\nAll icons created successfully!")
