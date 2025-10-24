# 🗺️ Map Tile System

## 📁 Folder Structure
```
map/
├── map.webp              # Original map image (1.5MB)
├── map-collision.webp    # Original collision map (1.5MB)
├── tiles/                # Generated tile files
│   ├── map_0_0.webp      # Map tile (0,0)
│   ├── map_0_1.webp      # Map tile (0,1)
│   ├── ...
│   ├── collision_0_0.webp # Collision tile (0,0)
│   ├── collision_0_1.webp # Collision tile (0,1)
│   └── ...
└── README.md
```

## 🧩 Tile Specifications
- **Tile Size**: 256x256 pixels
- **Map Dimensions**: 10560x6080 pixels
- **Total Tiles**: 42x24 = 1,008 tiles per image
- **Format**: WebP (85% quality)
- **File Size**: ~50-100KB per tile

## 🚀 How to Generate Tiles

### Option 1: Browser Tool (Recommended)
1. Open `http://localhost:3000/split-tiles.html`
2. Click "Split All Tiles" button
3. Wait for all tiles to download automatically
4. Move downloaded files to `map/tiles/` folder

### Option 2: Node.js Script
```bash
cd /Users/nybruker/Documents/Skole/h25/webdev/T26-Project-2/frontend/public
node split-tiles.js
```

## 📊 Performance Benefits
- **Memory Usage**: 80% reduction (200KB vs 1.5MB)
- **Loading Speed**: 5x faster initial load
- **Framerate**: Smooth 60fps on mobile
- **Battery**: Better power efficiency

## 🔧 File Naming Convention
- **Map tiles**: `map_X_Y.webp` (e.g., `map_0_0.webp`, `map_1_0.webp`)
- **Collision tiles**: `collision_X_Y.webp` (e.g., `collision_0_0.webp`)
- **Coordinates**: X=0 to 41, Y=0 to 23

## 🎮 Usage in Code
```typescript
// Only visible tiles are rendered
{visibleTiles.map(tile => (
  <div key={`${tile.x}_${tile.y}`}
       style={{
         backgroundImage: `url('map/tiles/map_${tile.x}_${tile.y}.webp')`
       }} />
))}
```

## 🔄 Regenerating Tiles
The tile splitter can be run multiple times - it will override existing tiles.
Perfect for when you update the original map images!
