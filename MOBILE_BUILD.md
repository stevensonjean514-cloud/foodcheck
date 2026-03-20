# FoodCheck Mobile App Build Guide

This document contains instructions for building the FoodCheck mobile app for iOS and Android platforms.

## Prerequisites

### For Android
- **Android Studio** (latest version)
- **Java Development Kit (JDK) 17** or higher
- **Android SDK** with API Level 33 or higher

### For iOS
- **macOS** (required for iOS builds)
- **Xcode 14** or later
- **CocoaPods** (installed via `sudo gem install cocoapods`)
- **Apple Developer Account** (for app store submission)

## Quick Start

### Development Build

1. **Build the web app and sync to native platforms:**
   ```bash
   npm run cap:sync
   ```

2. **Open in Android Studio:**
   ```bash
   npm run cap:open:android
   ```

3. **Open in Xcode:**
   ```bash
   npm run cap:open:ios
   ```

## Android Build Instructions

### Debug Build (APK)

1. Build the web app and sync:
   ```bash
   npm run build
   npx cap sync
   ```

2. Open Android Studio:
   ```bash
   npm run cap:open:android
   ```

3. In Android Studio:
   - Go to **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   - The APK will be generated at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build (APK)

1. Build using the npm script:
   ```bash
   npm run cap:build:android
   ```

2. The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Signed Release Build (for Google Play Store)

1. **Create a keystore:**
   ```bash
   keytool -genkey -v -keystore foodcheck-release.keystore -alias foodcheck -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Update `android/app/build.gradle`:**
   Add the signing config (replace with your keystore details):
   ```gradle
   android {
       signingConfigs {
           release {
               storeFile file("path/to/foodcheck-release.keystore")
               storePassword "your-store-password"
               keyAlias "foodcheck"
               keyPassword "your-key-password"
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

3. **Build the signed APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **Build an AAB (Android App Bundle) for Play Store:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

   The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## iOS Build Instructions

### Development Build

1. Build and sync:
   ```bash
   npm run cap:build:ios
   npx cap sync ios
   ```

2. Open in Xcode:
   ```bash
   npm run cap:open:ios
   ```

3. In Xcode:
   - Select your development team in **Signing & Capabilities**
   - Select a connected iOS device or simulator
   - Click **Run** (▶️) to build and run

### Release Build (for App Store)

1. **Configure App Store Connect:**
   - Create an app listing in [App Store Connect](https://appstoreconnect.apple.com/)
   - Set up app metadata, screenshots, and descriptions

2. **Update Version & Build Number:**
   In Xcode, select the project and update:
   - **Version**: User-facing version (e.g., 1.0.0)
   - **Build**: Build number (increment for each submission)

3. **Archive the App:**
   - In Xcode, select **Product** → **Archive**
   - Wait for the archive to complete

4. **Submit to App Store:**
   - Click **Distribute App**
   - Select **App Store Connect**
   - Choose upload method and follow prompts
   - Submit for review after upload completes

## App Configuration

### App Details
- **App ID**: `ca.foodcheck.app`
- **App Name**: FoodCheck
- **Bundle Identifier (iOS)**: `ca.foodcheck.app`
- **Package Name (Android)**: `ca.foodcheck.app`

### Permissions
The app requests the following permissions:

**iOS (Info.plist):**
- `NSCameraUsageDescription`: Camera access for taking food photos
- `NSPhotoLibraryUsageDescription`: Photo library access for uploading images
- `NSPhotoLibraryAddUsageDescription`: Permission to save photos

**Android (AndroidManifest.xml):**
- `CAMERA`: Camera access
- `READ_EXTERNAL_STORAGE`: Read photo library
- `WRITE_EXTERNAL_STORAGE`: Save photos (API < 33)
- `READ_MEDIA_IMAGES`: Read images (API 33+)

### Branding
- **Primary Color**: Red (#EF4444)
- **Secondary Color**: Orange (#F97316)
- **Icon**: Red-orange gradient with burger emoji and checkmark
- **Splash Screen**: FoodCheck logo on red-orange gradient background

## Testing

### Test on Physical Devices

**Android:**
1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. Run from Android Studio or use:
   ```bash
   cd android
   ./gradlew installDebug
   ```

**iOS:**
1. Connect iPhone/iPad via USB
2. Trust the computer on your device
3. Select device in Xcode
4. Click Run

### Test Camera Functionality
- Test taking photos with device camera
- Test selecting photos from gallery
- Test uploading photos to Supabase storage

## Troubleshooting

### Android Issues

**Gradle build fails:**
- Update Android Studio to latest version
- Update Gradle in `android/gradle/wrapper/gradle-wrapper.properties`
- Sync project with Gradle files

**Keystore issues:**
- Verify keystore path in build.gradle
- Ensure passwords are correct
- Check keystore validity period

### iOS Issues

**Signing fails:**
- Verify Apple Developer account is active
- Check certificate validity
- Update provisioning profiles in Xcode

**Pod install fails:**
- Run `pod repo update` in `ios/App` directory
- Delete `Podfile.lock` and `Pods` folder, then run `pod install`

## Environment Variables

The app uses the following environment variables (configured in `.env`):
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key

These are bundled into the app at build time.

## Store Submission Checklist

### Google Play Store
- [ ] App signed with release keystore
- [ ] AAB file generated
- [ ] App listing created in Play Console
- [ ] Screenshots uploaded (phone, tablet, 7-inch, 10-inch)
- [ ] Feature graphic added (1024x500)
- [ ] Privacy policy URL provided
- [ ] Content rating completed
- [ ] Pricing and distribution set

### Apple App Store
- [ ] App archived and uploaded
- [ ] App listing created in App Store Connect
- [ ] Screenshots uploaded (all required device sizes)
- [ ] App icon (1024x1024) uploaded
- [ ] Privacy policy URL provided
- [ ] Age rating completed
- [ ] Pricing and availability set
- [ ] Export compliance information provided

## Support

For issues or questions, refer to:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/studio/publish)
- [iOS App Distribution Guide](https://developer.apple.com/distribute/)
