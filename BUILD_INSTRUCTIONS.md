# FoodCheck Android App Bundle Build Instructions

## Current Status

✅ Web app built successfully
✅ Android project synced
✅ App ID: `ca.foodcheck.app`
✅ Version: `1.0.0` (versionCode: 1)
✅ Gradle updated to 8.7 (Java 17 compatible)
✅ Android Gradle Plugin: 8.3.2
✅ Signing configuration added to build.gradle

## Build Methods

Choose one of the following methods to build your Android App Bundle:

### Method 1: Automated Build Script (Recommended)

The easiest way to build your AAB:

```bash
./build-android-aab.sh
```

This script will:
1. Check Java installation (requires Java 17+)
2. Generate keystore file (if not exists)
3. Build web assets
4. Sync Capacitor
5. Build the signed AAB

**Prerequisites:**
- Java JDK 17 or higher
- Node.js and npm

**Install Java:**
- Ubuntu/Debian: `sudo apt-get install openjdk-17-jdk`
- macOS: `brew install openjdk@17`
- Windows: Download from [Adoptium](https://adoptium.net/)

---

### Method 2: Docker Build (No Java Required)

If you don't have Java installed, use Docker:

```bash
./build-with-docker.sh
```

This builds everything in a containerized environment.

**Prerequisites:**
- Docker installed ([Get Docker](https://www.docker.com/get-started))

---

### Method 3: Manual Build

For full control over the build process:

#### Step 1: Install Java JDK 17+

Verify installation:
```bash
java -version
```

Should show version 17 or higher.

#### Step 2: Generate Keystore

```bash
keytool -genkey -v \
  -keystore android/app/foodcheck-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias foodcheck \
  -storepass foodcheck123 \
  -keypass foodcheck123 \
  -dname "CN=Stellnovise, O=Stellnovise, C=CA"
```

**Keystore Details:**
- File: `android/app/foodcheck-release-key.jks`
- Alias: `foodcheck`
- Password: `foodcheck123`

⚠️ **CRITICAL**: Backup the keystore file and password! You cannot update your app without it.

#### Step 3: Build Web Assets

```bash
npm run build
```

#### Step 4: Sync Capacitor

```bash
npx cap sync android
```

#### Step 5: Build AAB

```bash
cd android
chmod +x gradlew
./gradlew clean bundleRelease
```

#### Step 6: Locate AAB File

```bash
ls -lh app/build/outputs/bundle/release/app-release.aab
```

---

### Method 4: Android Studio

1. Open the `android` folder in Android Studio
2. **Build** → **Generate Signed Bundle / APK**
3. Choose **Android App Bundle**
4. Select keystore:
   - Path: `android/app/foodcheck-release-key.jks`
   - Password: `foodcheck123`
   - Alias: `foodcheck`
   - Key password: `foodcheck123`
5. Select **release** variant
6. Click **Finish**

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Uploading to Google Play Store

1. Visit [Google Play Console](https://play.google.com/console)
2. Create new app or select existing
3. Navigate to **Release** → **Production** (or Testing track)
4. Click **Create new release**
5. Upload `app-release.aab`
6. Add release notes
7. Review and roll out

---

## Technical Details

### App Configuration
- **Package Name**: `ca.foodcheck.app`
- **Version Name**: `1.0.0`
- **Version Code**: `1`
- **Min SDK**: 24 (Android 7.0)
- **Target SDK**: 36 (Android 14)
- **Compile SDK**: 36

### Build Configuration
- **Gradle**: 8.7
- **Android Gradle Plugin**: 8.3.2
- **Java**: 17
- **Capacitor**: 8.2.0

### Signing Configuration
Already configured in `android/app/build.gradle`:
```gradle
signingConfigs {
    release {
        storeFile file('foodcheck-release-key.jks')
        storePassword 'foodcheck123'
        keyAlias 'foodcheck'
        keyPassword 'foodcheck123'
    }
}
```

---

## Future Updates

For version 1.0.1, 1.1.0, etc:

1. Update `android/app/build.gradle`:
   ```gradle
   versionCode 2  // Increment by 1
   versionName "1.0.1"  // Semantic versioning
   ```

2. Rebuild:
   ```bash
   ./build-android-aab.sh
   ```

3. Upload new AAB to Google Play Console

**Important**: Always use the same keystore file!

---

## Troubleshooting

### "JAVA_HOME is not set"

**Solution**: Install Java JDK 17+
```bash
# Check if Java is installed
java -version

# Set JAVA_HOME (Linux/Mac)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin

# Set JAVA_HOME (Windows)
set JAVA_HOME=C:\Program Files\Java\jdk-17
```

### "Permission denied: ./gradlew"

**Solution**: Make gradlew executable
```bash
chmod +x android/gradlew
```

### "Could not resolve project :capacitor-android"

**Solution**: Sync Capacitor
```bash
npm run build
npx cap sync android
```

### "Unsupported class file major version"

**Solution**: Use Java 17 (not 21 or higher)
```bash
java -version  # Should show version 17.x.x
```

### Build fails with dependency errors

**Solution**: Clean and rebuild
```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

### Need APK instead of AAB

For APK (not recommended for Google Play):
```bash
cd android
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## Keystore Security Best Practices

🔒 **Critical Security Steps:**

1. **Backup Immediately**
   - Copy `android/app/foodcheck-release-key.jks` to secure location
   - Store in password manager, encrypted drive, or secure vault
   - Create multiple backups in different locations

2. **Never Share**
   - Don't commit to Git
   - Don't share passwords publicly
   - Don't email or message keystore file

3. **Add to .gitignore**
   ```bash
   echo "*.jks" >> .gitignore
   echo "*.keystore" >> .gitignore
   ```

4. **Document Location**
   - Record where backups are stored
   - Document passwords in secure password manager
   - Share with team members securely (if applicable)

⚠️ **If you lose the keystore, you CANNOT update your app on Google Play Store!**

---

## Quick Reference

### Build Commands
```bash
# Automated build
./build-android-aab.sh

# Docker build
./build-with-docker.sh

# Manual build
npm run build && npx cap sync android && cd android && ./gradlew bundleRelease
```

### Output Location
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Keystore Info
```
File: android/app/foodcheck-release-key.jks
Alias: foodcheck
Password: foodcheck123
Organization: Stellnovise
Country: CA
```

---

## Resources

- [Android App Bundle Documentation](https://developer.android.com/guide/app-bundle)
- [Upload to Google Play](https://support.google.com/googleplay/android-developer/answer/9859152)
- [App Signing Best Practices](https://developer.android.com/studio/publish/app-signing)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Gradle User Guide](https://docs.gradle.org/current/userguide/userguide.html)
