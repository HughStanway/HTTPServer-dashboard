#!/bin/bash
set -e

# Color definitions
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${BOLD}${CYAN}========================================${NC}"
echo -e "${BOLD}${CYAN}   Starting Docker Deployment Pipeline   ${NC}"
echo -e "${BOLD}${CYAN}========================================${NC}"

# [1/2] Pull project changes
echo -e "${CYAN}[1/2] Pulling HTTPServer-dashboard updates...${NC}"
git pull origin main

# [2/2] Build and start with Docker Compose
echo -e "${CYAN}[2/2] Rebuilding and restarting containers...${NC}"
docker compose up -d --build

echo -e "${BOLD}${GREEN}========================================${NC}"
echo -e "${BOLD}${GREEN}    Docker Deployment Complete!         ${NC}"
echo -e "${BOLD}${GREEN}========================================${NC}"
