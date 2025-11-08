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

# Detect OS
OS_TYPE=$(uname -s)

# Configuration based on OS
if [ "$OS_TYPE" = "Darwin" ]; then
    # macOS configuration
    DEPLOY_DIR="/Library/WebServer/Documents/project2"
    WEB_USER="$USER"
    WEB_GROUP="staff"
    echo "Detected macOS - using path: $DEPLOY_DIR"
else
    # Linux configuration
    DEPLOY_DIR="/var/www/html/project2"
    WEB_USER="www-data"
    WEB_GROUP="www-data"
    echo "Detected Linux - using path: $DEPLOY_DIR"
fi

BACKEND_DIR="$HOME/project2-backend"

echo -e "${BLUE}Step 1: Pulling Latest Changes${NC}"
echo "Running: git pull"
git pull
echo -e "${GREEN}Git pull complete!${NC}"
echo ""

echo -e "${BLUE}Step 2: Building Frontend${NC}"
echo "Running: cd frontend && pnpm install && pnpm run build"
cd frontend
pnpm install
pnpm run build
cd ..
echo -e "${GREEN}Frontend build complete!${NC}"
echo ""

echo -e "${BLUE}Step 3: Checking MongoDB and Seeding if Needed${NC}"
cd backend
echo "Checking if database needs seeding..."
# Check by directly querying MongoDB for pokemon count
pokemon_count=$(mongosh pokeclicker --quiet --eval "db.pokemon_metadata.countDocuments()" 2>/dev/null || echo "0")
if [ "$pokemon_count" -gt "0" ]; then
    echo "Database already contains $pokemon_count Pokemon, skipping seed..."
else
    echo "Database is empty. Seeding Pokemon (this will take a few minutes)..."
    pnpm run seed
fi
echo -e "${GREEN}Database check complete!${NC}"
echo ""

echo -e "${BLUE}Step 4: Building Backend${NC}"
echo "Running: pnpm install && pnpm run build"
pnpm install
pnpm run build
echo -e "${GREEN}Backend build complete!${NC}"
echo ""

echo -e "${BLUE}Step 5: Ensuring PM2 is Set Up${NC}"
if ! command -v pm2 &> /dev/null; then
    echo "PM2 not found, installing..."
    npm install -g pm2
fi

if pm2 list | grep -q "project2-backend"; then
    echo "Backend already running, restarting..."
    ./manage-backend.sh restart
else
    echo "Starting backend for the first time..."
    ./manage-backend.sh start
    pm2 save
fi
echo -e "${GREEN}Backend setup complete!${NC}"
cd ..
echo ""

echo -e "${BLUE}Step 6: Deploying Frontend to ${DEPLOY_DIR}${NC}"
if [ -d "$DEPLOY_DIR" ]; then
    echo "Removing old deployment..."
    sudo rm -rf "$DEPLOY_DIR"
fi
echo "Copying frontend build to ${DEPLOY_DIR}..."
sudo mkdir -p "$DEPLOY_DIR"
sudo cp -r frontend/dist/* "$DEPLOY_DIR/"
sudo chown -R $WEB_USER:$WEB_GROUP "$DEPLOY_DIR"
sudo chmod -R 755 "$DEPLOY_DIR"
echo -e "${GREEN}Frontend deployed!${NC}"
echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Your application is now live:"
if [ "$OS_TYPE" = "Darwin" ]; then
    echo "  Frontend: http://localhost/project2/"
    echo "  Backend: http://localhost:3001/graphql"
    echo ""
    echo "Note: Make sure Apache is running with: sudo apachectl start"
else
    echo "  Frontend: http://it2810-26.idi.ntnu.no/project2/"
    echo "  GraphQL: http://it2810-26.idi.ntnu.no/project2/graphql"
fi
echo ""
echo "To check backend status: cd backend && ./manage-backend.sh status"
