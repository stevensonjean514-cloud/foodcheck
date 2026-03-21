#!/bin/bash

# Build Android AAB using Docker
# This script builds the app in a containerized environment

set -e

echo "========================================"
echo "FoodCheck Docker-based Android Build"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed!"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

echo -e "${YELLOW}Building Docker image...${NC}"
docker build -f Dockerfile.android-build -t foodcheck-android-builder .

echo ""
echo -e "${YELLOW}Running build in Docker container...${NC}"
docker run --rm -v "$(pwd)/android/app/build:/app/android/app/build" foodcheck-android-builder

echo ""
echo -e "${GREEN}Build complete!${NC}"
echo "The AAB file should be in: android/app/build/outputs/bundle/release/app-release.aab"
