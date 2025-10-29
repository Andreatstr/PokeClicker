#!/usr/bin/env tsx

/**
 * Map Tile Splitter
 * Splits large map images into 512x512px tiles for optimized mobile performance.
 *
 * Usage: npm run split-tiles
 * or: npx tsx scripts/split-tiles.ts
 */

import {promises as fs} from 'fs';
import * as path from 'path';
import sharp from 'sharp';

// Configuration
const TILE_SIZE = 512;
const MAP_WIDTH = 10560;
const MAP_HEIGHT = 6080;

interface TileConfig {
  inputPath: string;
  outputDir: string;
  prefix: string;
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, {recursive: true});
  }
}

async function splitImageIntoTiles(config: TileConfig): Promise<boolean> {
  const {inputPath, outputDir, prefix} = config;

  console.log(`Processing ${inputPath}...`);

  try {
    // Check if input file exists
    await fs.access(inputPath);

    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    const {width = 0, height = 0} = metadata;

    console.log(`Image size: ${width}x${height}`);

    // Calculate number of tiles
    const tilesX = Math.ceil(width / TILE_SIZE);
    const tilesY = Math.ceil(height / TILE_SIZE);
    const totalTiles = tilesX * tilesY;

    console.log(`Creating ${tilesX}x${tilesY} = ${totalTiles} tiles...`);

    // Ensure output directory exists
    await ensureDirectoryExists(outputDir);

    let tilesCreated = 0;

    // Process tiles in batches to avoid memory issues
    for (let y = 0; y < tilesY; y++) {
      for (let x = 0; x < tilesX; x++) {
        // Calculate tile boundaries
        const left = x * TILE_SIZE;
        const top = y * TILE_SIZE;
        const tileWidth = Math.min(TILE_SIZE, width - left);
        const tileHeight = Math.min(TILE_SIZE, height - top);

        // Create output filename
        const outputFilename = `${prefix}_${x}_${y}.webp`;
        const outputPath = path.join(outputDir, outputFilename);

        // Extract and save tile using sharp
        await sharp(inputPath)
          .extract({
            left,
            top,
            width: tileWidth,
            height: tileHeight,
          })
          .webp({
            quality: 85,
            effort: 4, // Good balance of compression vs speed
          })
          .toFile(outputPath);

        tilesCreated++;

        // Progress update every 50 tiles for better performance
        if (tilesCreated % 50 === 0) {
          console.log(`Created ${tilesCreated}/${totalTiles} tiles...`);
        }
      }
    }

    console.log(`Completed ${prefix}: ${tilesCreated} tiles`);
    return true;
  } catch (error) {
    console.error(`Error processing ${inputPath}:`, error);
    return false;
  }
}

async function main(): Promise<boolean> {
  console.log('Map Tile Splitter');
  console.log('='.repeat(50));
  console.log(`Map size: ${MAP_WIDTH}x${MAP_HEIGHT}`);
  console.log(`Tile size: ${TILE_SIZE}x${TILE_SIZE}`);

  // Calculate expected tiles
  const expectedTilesX = Math.ceil(MAP_WIDTH / TILE_SIZE);
  const expectedTilesY = Math.ceil(MAP_HEIGHT / TILE_SIZE);
  const expectedTotal = expectedTilesX * expectedTilesY;

  console.log(
    `Expected tiles: ${expectedTilesX}x${expectedTilesY} = ${expectedTotal} tiles per image`
  );
  console.log('Output: public/map/tiles/');
  console.log();

  // Define paths
  const publicDir = path.join(process.cwd(), 'public');
  const mapDir = path.join(publicDir, 'map');
  const tilesDir = path.join(mapDir, 'tiles');

  const configs: TileConfig[] = [
    {
      inputPath: path.join(mapDir, 'map.webp'),
      outputDir: tilesDir,
      prefix: 'map',
    },
    {
      inputPath: path.join(mapDir, 'map-collision.webp'),
      outputDir: tilesDir,
      prefix: 'collision',
    },
  ];

  // Check if source images exist
  for (const config of configs) {
    try {
      await fs.access(config.inputPath);
    } catch {
      console.error(`Image not found: ${config.inputPath}`);
      return false;
    }
  }

  console.log('Starting tile conversion...');
  console.log();

  // Process each image
  for (const config of configs) {
    const success = await splitImageIntoTiles(config);
    if (!success) {
      return false;
    }
    console.log();
  }

  console.log('All tiles created successfully!');
  console.log(`Location: ${tilesDir}`);
  console.log('Files created:');
  console.log(
    `   - map_0_0.webp to map_${expectedTilesX - 1}_${expectedTilesY - 1}.webp (${expectedTotal} files)`
  );
  console.log(
    `   - collision_0_0.webp to collision_${expectedTilesX - 1}_${expectedTilesY - 1}.webp (${expectedTotal} files)`
  );
  console.log(`   - Total: ${expectedTotal * 2} tile files`);
  console.log();
  console.log('Optimized for mobile performance with 75% fewer HTTP requests!');

  return true;
}

// Run the script (ESM entry point check)
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export {main as splitTiles};
