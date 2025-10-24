#!/usr/bin/env python3
"""
Map Tile Splitter
Splits large map images into 256x256px tiles for better mobile performance.
"""

import os
import sys
from PIL import Image
import math

# Configuration
TILE_SIZE = 256
MAP_WIDTH = 10560
MAP_HEIGHT = 6080

def split_image_into_tiles(image_path, output_dir, prefix):
    """Split an image into tiles and save them."""
    print(f"🖼️  Processing {image_path}...")
    
    # Open the image
    try:
        img = Image.open(image_path)
        print(f"📏 Image size: {img.width}x{img.height}")
    except Exception as e:
        print(f"❌ Error opening {image_path}: {e}")
        return False
    
    # Calculate number of tiles
    tiles_x = math.ceil(img.width / TILE_SIZE)
    tiles_y = math.ceil(img.height / TILE_SIZE)
    total_tiles = tiles_x * tiles_y
    
    print(f"🧩 Creating {tiles_x}x{tiles_y} = {total_tiles} tiles...")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    tiles_created = 0
    
    for y in range(tiles_y):
        for x in range(tiles_x):
            # Calculate tile boundaries
            left = x * TILE_SIZE
            top = y * TILE_SIZE
            right = min(left + TILE_SIZE, img.width)
            bottom = min(top + TILE_SIZE, img.height)
            
            # Extract tile
            tile = img.crop((left, top, right, bottom))
            
            # Create output filename
            output_filename = f"{prefix}_{x}_{y}.webp"
            output_path = os.path.join(output_dir, output_filename)
            
            # Save as WebP with optimization
            tile.save(output_path, "WEBP", quality=85, optimize=True)
            
            tiles_created += 1
            if tiles_created % 100 == 0:
                print(f"📦 Created {tiles_created}/{total_tiles} tiles...")
    
    print(f"✅ Completed {prefix}: {tiles_created} tiles")
    return True

def main():
    """Main function to split both map images."""
    print("🗺️  Map Tile Splitter")
    print("=" * 50)
    
    # Define paths
    map_dir = "map"
    tiles_dir = os.path.join(map_dir, "tiles")
    map_image = os.path.join(map_dir, "map.webp")
    collision_image = os.path.join(map_dir, "map-collision.webp")
    
    # Check if source images exist
    if not os.path.exists(map_image):
        print(f"❌ Map image not found: {map_image}")
        return False
    
    if not os.path.exists(collision_image):
        print(f"❌ Collision image not found: {collision_image}")
        return False
    
    print(f"📁 Output directory: {tiles_dir}")
    print(f"🧩 Tile size: {TILE_SIZE}x{TILE_SIZE}px")
    print()
    
    # Split map image
    if not split_image_into_tiles(map_image, tiles_dir, "map"):
        return False
    
    print()
    
    # Split collision image
    if not split_image_into_tiles(collision_image, tiles_dir, "collision"):
        return False
    
    print()
    print("🎉 All tiles created successfully!")
    print(f"📁 Location: {tiles_dir}")
    print("📊 Files created:")
    print("   - map_0_0.webp to map_41_23.webp (1,008 files)")
    print("   - collision_0_0.webp to collision_41_23.webp (1,008 files)")
    print("   - Total: 2,016 tile files")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n❌ Interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
