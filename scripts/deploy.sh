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

# [3/5] Build dashboard
echo -e "${CYAN}[3/5] Building backend and frontend...${NC}"
cd "$PROJECT_DIR"
make all

# [4/5] Install dashboard binary and config
echo -e "${CYAN}[4/5] Installing dashboard-server...${NC}"

# Install binary
echo -e "${YELLOW}Installing binary to /usr/local/bin...${NC}"
sudo cp "$PROJECT_DIR/build/dashboard_server" /usr/local/bin/dashboard-server
sudo chmod +x /usr/local/bin/dashboard-server

# Ensure config directory exists
echo -e "${YELLOW}Ensuring /etc/dashboard-server exists...${NC}"
sudo mkdir -p /etc/dashboard-server

# Copy config files
echo -e "${YELLOW}Syncing configuration files...${NC}"

if [ -f "$PROJECT_DIR/.env/credentials" ]; then
    sudo cp "$PROJECT_DIR/.env/credentials" /etc/dashboard-server/credentials
fi

if [ -f "$PROJECT_DIR/backend/src/config.toml" ]; then
    sudo cp "$PROJECT_DIR/backend/src/config.toml" /etc/dashboard-server/config.toml
fi

if [ -d "$PROJECT_DIR/frontend/dist" ]; then
    echo -e "${YELLOW}Syncing frontend build assets...${NC}"
    sudo mkdir -p /etc/dashboard-server/frontend/dist
    sudo cp -r "$PROJECT_DIR/frontend/dist/"* /etc/dashboard-server/frontend/dist/
fi

if [ -d "$PROJECT_DIR/logs" ]; then
    sudo mkdir -p /etc/dashboard-server/logs
    sudo cp -r "$PROJECT_DIR/logs/"* /etc/dashboard-server/logs/ 2>/dev/null || true
fi

# [5/5] Restart service
echo -e "${CYAN}[5/5] Restarting dashboard-server service...${NC}"
sudo systemctl restart dashboard-server
