#!/bin/bash

# Map Tile Splitter
# Splits large map images into 256x256px tiles for better mobile performance.

set -e

# Configuration
TILE_SIZE=256
MAP_WIDTH=10560
MAP_HEIGHT=6080
TILES_X=$(( (MAP_WIDTH + TILE_SIZE - 1) / TILE_SIZE ))
TILES_Y=$(( (MAP_HEIGHT + TILE_SIZE - 1) / TILE_SIZE ))

echo "🗺️  Map Tile Splitter"
echo "=================================================="
echo "📏 Map size: ${MAP_WIDTH}x${MAP_HEIGHT}"
echo "🧩 Tile size: ${TILE_SIZE}x${TILE_SIZE}"
echo "📊 Total tiles: ${TILES_X}x${TILES_Y} = $((TILES_X * TILES_Y)) tiles per image"
echo "📁 Output: map/tiles/"
echo

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found. Installing..."
    if command -v brew &> /dev/null; then
        brew install imagemagick
    else
        echo "Please install ImageMagick manually: https://imagemagick.org/script/download.php"
        exit 1
    fi
fi

# Create tiles directory
mkdir -p map/tiles
echo "✅ Created directory: map/tiles/"

# Function to split an image into tiles
split_image() {
    local image_path="$1"
    local prefix="$2"
    
    echo "🖼️  Processing $image_path..."
    
    if [ ! -f "$image_path" ]; then
        echo "❌ Image not found: $image_path"
        return 1
    fi
    
    local tiles_created=0
    local total_tiles=$((TILES_X * TILES_Y))
    
    echo "🧩 Creating ${TILES_X}x${TILES_Y} = $total_tiles tiles..."
    
    for ((y=0; y<TILES_Y; y++)); do
        for ((x=0; x<TILES_X; x++)); do
            local left=$((x * TILE_SIZE))
            local top=$((y * TILE_SIZE))
            local width=$TILE_SIZE
            local height=$TILE_SIZE
            
            # Adjust for edge tiles
            if [ $((left + width)) -gt $MAP_WIDTH ]; then
                width=$((MAP_WIDTH - left))
            fi
            if [ $((top + height)) -gt $MAP_HEIGHT ]; then
                height=$((MAP_HEIGHT - top))
            fi
            
            local output_file="map/tiles/${prefix}_${x}_${y}.webp"
            
            # Use ImageMagick to extract and convert tile
            convert "$image_path" \
                -crop "${width}x${height}+${left}+${top}" \
                -quality 85 \
                -define webp:lossless=false \
                "$output_file"
            
            tiles_created=$((tiles_created + 1))
            if [ $((tiles_created % 100)) -eq 0 ]; then
                echo "📦 Created $tiles_created/$total_tiles tiles..."
            fi
        done
    done
    
    echo "✅ Completed $prefix: $tiles_created tiles"
}

# Split map image
echo "🚀 Starting tile conversion..."
echo
split_image "map/map.webp" "map"

echo

# Split collision image
split_image "map/map-collision.webp" "collision"

echo
echo "🎉 All tiles created successfully!"
echo "📁 Location: map/tiles/"
echo "📊 Files created:"
echo "   - map_0_0.webp to map_$((TILES_X-1))_$((TILES_Y-1)).webp ($((TILES_X * TILES_Y)) files)"
echo "   - collision_0_0.webp to collision_$((TILES_X-1))_$((TILES_Y-1)).webp ($((TILES_X * TILES_Y)) files)"
echo "   - Total: $((TILES_X * TILES_Y * 2)) tile files"
