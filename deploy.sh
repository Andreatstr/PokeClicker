#!/bin/bash

# Deployment script for PokéClicker Project 2
# Builds frontend and backend, then copies to Apache directory

set -e  # Exit on any error

echo "========================================="
echo "PokéClicker Project 2 - Deployment Script"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/var/www/html/project2"
BACKEND_DIR="$HOME/project2-backend"

echo -e "${BLUE}Step 1: Building Frontend${NC}"
echo "Running: pnpm install && pnpm run build"
pnpm install
pnpm run build
echo -e "${GREEN}Frontend build complete!${NC}"
echo ""

echo -e "${BLUE}Step 2: Building Backend${NC}"
echo "Running: cd backend && npm install && npm run build"
cd backend
npm install
npm run build
cd ..
echo -e "${GREEN}Backend build complete!${NC}"
echo ""

echo -e "${BLUE}Step 3: Deploying Frontend to ${DEPLOY_DIR}${NC}"
if [ -d "$DEPLOY_DIR" ]; then
    echo "Removing old deployment..."
    sudo rm -rf "$DEPLOY_DIR"
fi
echo "Copying frontend build to ${DEPLOY_DIR}..."
sudo cp -r dist "$DEPLOY_DIR"
sudo chown -R www-data:www-data "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"
echo -e "${GREEN}Frontend deployed!${NC}"
echo ""

echo -e "${BLUE}Step 4: Deploying Backend to ${BACKEND_DIR}${NC}"
if [ ! -d "$BACKEND_DIR" ]; then
    echo "Creating backend directory..."
    mkdir -p "$BACKEND_DIR"
fi
echo "Copying backend build to ${BACKEND_DIR}..."
cp -r backend/dist "$BACKEND_DIR/"
cp -r backend/node_modules "$BACKEND_DIR/"
cp backend/package.json "$BACKEND_DIR/"
cp backend/.env.example "$BACKEND_DIR/"
echo -e "${GREEN}Backend deployed!${NC}"
echo ""

echo -e "${BLUE}Step 5: Apache Configuration${NC}"
echo "Apache configuration file: apache-config.conf"
echo "To apply the configuration:"
echo "  1. sudo cp apache-config.conf /etc/apache2/sites-available/project2.conf"
echo "  2. sudo a2enmod proxy proxy_http headers rewrite"
echo "  3. sudo a2ensite project2"
echo "  4. sudo systemctl reload apache2"
echo ""

echo -e "${BLUE}Step 6: Backend Service${NC}"
echo "To run the backend service:"
echo "  cd ${BACKEND_DIR}"
echo "  cp .env.example .env"
echo "  nano .env  # Configure your environment variables"
echo "  npm start  # Or use pm2 for production: pm2 start dist/index.js --name project2-backend"
echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Frontend: http://it2810-26.idi.ntnu.no/project2/"
echo "GraphQL: http://it2810-26.idi.ntnu.no/project2/graphql"
echo ""
echo "Don't forget to:"
echo "  1. Apply Apache configuration (see Step 5)"
echo "  2. Start the backend service (see Step 6)"
echo "  3. Configure backend .env file with MongoDB connection"
