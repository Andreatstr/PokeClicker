#!/bin/bash

# Backend management script for PokéClicker Project 2
# This script helps manage the backend service on the VM

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

show_usage() {
    echo "Usage: $0 {start|stop|restart|status|logs|setup}"
    echo ""
    echo "Commands:"
    echo "  setup     - Install dependencies and build backend"
    echo "  start     - Start the backend service"
    echo "  stop      - Stop the backend service"
    echo "  restart   - Restart the backend service"
    echo "  status    - Show backend service status"
    echo "  logs      - Show backend logs (live tail)"
    exit 1
}

check_pm2() {
    if ! command -v pm2 &> /dev/null; then
        echo -e "${RED}PM2 is not installed${NC}"
        echo "Install it with: npm install -g pm2"
        exit 1
    fi
}

setup_backend() {
    echo -e "${BLUE}Setting up backend...${NC}"

    # Install dependencies
    echo "Installing dependencies..."
    npm install

    # Build TypeScript
    echo "Building TypeScript..."
    npm run build

    # Create logs directory
    mkdir -p logs

    # Check if .env exists
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Warning: .env file not found${NC}"
        if [ -f .env.example ]; then
            echo "Copying .env.example to .env..."
            cp .env.example .env
            echo -e "${YELLOW}Please edit .env and configure your environment variables${NC}"
        else
            echo -e "${RED}Error: .env.example not found${NC}"
            exit 1
        fi
    fi

    echo -e "${GREEN}Backend setup complete!${NC}"
    echo "Next steps:"
    echo "  1. Edit .env file with your configuration"
    echo "  2. Run: $0 start"
}

start_backend() {
    check_pm2
    echo -e "${BLUE}Starting backend...${NC}"

    # Check if dist exists
    if [ ! -d "dist" ]; then
        echo -e "${RED}dist/ directory not found. Run setup first.${NC}"
        exit 1
    fi

    # Check if already running
    if pm2 list | grep -q "project2-backend"; then
        echo -e "${YELLOW}Backend is already running${NC}"
        pm2 describe project2-backend
        exit 0
    fi

    # Start with PM2
    pm2 start ecosystem.config.cjs
    pm2 save

    echo -e "${GREEN}Backend started successfully!${NC}"
    echo "Check status with: $0 status"
    echo "View logs with: $0 logs"
}

stop_backend() {
    check_pm2
    echo -e "${BLUE}Stopping backend...${NC}"

    if pm2 list | grep -q "project2-backend"; then
        pm2 stop project2-backend
        pm2 delete project2-backend
        pm2 save
        echo -e "${GREEN}Backend stopped${NC}"
    else
        echo -e "${YELLOW}Backend is not running${NC}"
    fi
}

restart_backend() {
    check_pm2
    echo -e "${BLUE}Restarting backend...${NC}"

    if pm2 list | grep -q "project2-backend"; then
        pm2 restart project2-backend
        echo -e "${GREEN}Backend restarted${NC}"
    else
        echo -e "${YELLOW}Backend is not running, starting it...${NC}"
        start_backend
    fi
}

show_status() {
    check_pm2
    echo -e "${BLUE}Backend status:${NC}"
    pm2 describe project2-backend || echo -e "${YELLOW}Backend is not running${NC}"
    echo ""
    echo -e "${BLUE}All PM2 processes:${NC}"
    pm2 list
}

show_logs() {
    check_pm2
    echo -e "${BLUE}Showing backend logs (Ctrl+C to exit)...${NC}"
    pm2 logs project2-backend
}

case "$1" in
    setup)
        setup_backend
        ;;
    start)
        start_backend
        ;;
    stop)
        stop_backend
        ;;
    restart)
        restart_backend
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    *)
        show_usage
        ;;
esac
