#!/bin/bash
set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Determine the absolute path to the project root
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${BOLD}${CYAN}========================================${NC}"
echo -e "${BOLD}${CYAN}      Starting Deployment Pipeline      ${NC}"
echo -e "${BOLD}${CYAN}========================================${NC}"

# [0/4] Pre-check: Service Existence
# Ensure the service has been installed via 'make install-service'
if [ ! -f "/etc/systemd/system/dashboard-server.service" ]; then
    echo -e "${RED}Error: dashboard-server service is not installed on this system.${NC}"
    echo -e "${YELLOW}Please run 'make install-service' once before using this script.${NC}"
    exit 1
fi

# [1/4] Pull project changes
echo -e "${CYAN}[1/4] Pulling HTTPServer-dashboard updates...${NC}"
git pull origin main

# [2/4] Handle HTTPServer Library (Fresh Clone)
echo -e "${CYAN}[2/4] Updating and installing HTTPServer library...${NC}"
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo -e "${YELLOW}Cloning fresh copy of HTTPServer library to $TMP_DIR...${NC}"
git clone https://github.com/HughStanway/HTTPServer.git "$TMP_DIR"
cd "$TMP_DIR"

# The library project provides a script to install the library
if [ -f "scripts/install_library.sh" ]; then
    echo -e "${GREEN}Running library install script...${NC}"
    chmod +x scripts/install_library.sh
    ./scripts/install_library.sh
else
    echo -e "${YELLOW}Warning: scripts/install_library.sh not found. Attempting manual build...${NC}"
    mkdir -p build && cd build
    cmake -DCMAKE_BUILD_TYPE=Release ..
    CORES=$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 1)
    cmake --build . --target httpserver_lib -j "$CORES"
    sudo cmake --install .
fi

# [3/4] Build dashboard
echo -e "${CYAN}[3/4] Building backend and frontend...${NC}"
cd "$PROJECT_DIR"
make all

# [4/4] Restart service
echo -e "${CYAN}[4/4] Restarting dashboard-server service...${NC}"
sudo systemctl restart dashboard-server

echo -e "${BOLD}${GREEN}========================================${NC}"
echo -e "${BOLD}${GREEN}         Deployment Complete!           ${NC}"
echo -e "${BOLD}${GREEN}========================================${NC}"
