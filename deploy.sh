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

echo -e "${BLUE}Step 2: Pulling Latest Changes${NC}"
echo "Running: git pull origin main"
git pull origin main
echo -e "${GREEN}Git pull complete!${NC}"
echo ""

echo -e "${BLUE}Step 3: Building Backend${NC}"
echo "Running: cd backend && pnpm install && pnpm run build"
cd backend
pnpm install
pnpm run build
echo -e "${GREEN}Backend build complete!${NC}"
echo ""

echo -e "${BLUE}Step 4: Restarting Backend with PM2${NC}"
echo "Running: ./manage-backend.sh restart"
./manage-backend.sh restart
cd ..
echo -e "${GREEN}Backend restarted!${NC}"
echo ""

echo -e "${BLUE}Step 5: Deploying Frontend to ${DEPLOY_DIR}${NC}"
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
