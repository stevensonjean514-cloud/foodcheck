#!/bin/bash

# FoodCheck Android App Bundle Build Script
# This script builds a signed AAB file for Google Play Store submission

set -e

echo "========================================"
echo "FoodCheck Android AAB Build Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
KEYSTORE_FILE="foodcheck-release-key.jks"
KEYSTORE_PATH="android/app/$KEYSTORE_FILE"
KEYSTORE_ALIAS="foodcheck"
KEYSTORE_PASSWORD="foodcheck123"
KEY_PASSWORD="foodcheck123"
ORGANIZATION="Stellnovise"
COUNTRY="CA"

# Step 1: Check Java installation
echo -e "${YELLOW}Step 1: Checking Java installation...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}Error: Java is not installed!${NC}"
    echo "Please install Java JDK 17 or higher:"
    echo "  Ubuntu/Debian: sudo apt-get install openjdk-17-jdk"
    echo "  macOS: brew install openjdk@17"
    echo "  Windows: Download from https://adoptium.net/"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo -e "${RED}Error: Java 17 or higher is required. Current version: $JAVA_VERSION${NC}"
    echo "Note: The build is configured for Java 17 with Gradle 8.7"
    exit 1
fi
echo -e "${GREEN}✓ Java version $JAVA_VERSION detected${NC}"
echo ""

# Step 2: Generate keystore if it doesn't exist
echo -e "${YELLOW}Step 2: Checking keystore file...${NC}"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "Generating keystore file: $KEYSTORE_PATH"
    keytool -genkey -v \
        -keystore "$KEYSTORE_PATH" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -alias "$KEYSTORE_ALIAS" \
        -storepass "$KEYSTORE_PASSWORD" \
        -keypass "$KEY_PASSWORD" \
        -dname "CN=$ORGANIZATION, O=$ORGANIZATION, C=$COUNTRY"

    echo -e "${GREEN}✓ Keystore generated successfully${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Backup this file and password!${NC}"
    echo "   Keystore: $KEYSTORE_PATH"
    echo "   Password: $KEYSTORE_PASSWORD"
else
    echo -e "${GREEN}✓ Keystore file already exists${NC}"
fi
echo ""

# Step 3: Build web assets
echo -e "${YELLOW}Step 3: Building web assets...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Web build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Web assets built successfully${NC}"
echo ""

# Step 4: Sync Capacitor
echo -e "${YELLOW}Step 4: Syncing Capacitor to Android...${NC}"
npx cap sync android
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Capacitor sync failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Capacitor synced successfully${NC}"
echo ""

# Step 5: Build Android App Bundle
echo -e "${YELLOW}Step 5: Building Android App Bundle...${NC}"
cd android
chmod +x gradlew
./gradlew clean bundleRelease
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Android build failed!${NC}"
    cd ..
    exit 1
fi
cd ..
echo -e "${GREEN}✓ Android App Bundle built successfully${NC}"
echo ""

# Step 6: Locate the AAB file
AAB_FILE="android/app/build/outputs/bundle/release/app-release.aab"
if [ -f "$AAB_FILE" ]; then
    FILE_SIZE=$(ls -lh "$AAB_FILE" | awk '{print $5}')
    echo "========================================"
    echo -e "${GREEN}SUCCESS!${NC}"
    echo "========================================"
    echo ""
    echo "Your Android App Bundle is ready for Google Play Store!"
    echo ""
    echo "File location: $AAB_FILE"
    echo "File size: $FILE_SIZE"
    echo ""
    echo "Next steps:"
    echo "1. Go to Google Play Console: https://play.google.com/console"
    echo "2. Create a new app or select your existing app"
    echo "3. Navigate to Release > Production (or Testing)"
    echo "4. Upload the AAB file: $AAB_FILE"
    echo ""
    echo -e "${YELLOW}⚠️  Remember to backup your keystore file!${NC}"
    echo "   Location: $KEYSTORE_PATH"
    echo "   Password: $KEYSTORE_PASSWORD"
    echo ""
else
    echo -e "${RED}Error: AAB file not found at expected location!${NC}"
    exit 1
fi
