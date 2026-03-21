# FoodCheck Android App Bundle Build Instructions

## Prerequisites
- Android Studio installed
- JDK 17 or higher installed
- All project files synced and built

## Current Status
✅ Web app built successfully (`npm run build`)
✅ Android project synced (`npx cap sync android`)
✅ App ID confirmed: `ca.foodcheck.app`
✅ Version set: `1.0.0` (versionCode: 1)

## Step 1: Generate Keystore File

Run this command in your terminal:

```bash
keytool -genkey -v -keystore foodcheck-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias foodcheck -storepass foodcheck123 -keypass foodcheck123 -dname "CN=Stellnovise, O=Stellnovise, C=CA"
```

This creates a keystore file named `foodcheck-release-key.jks` with:
- **Alias**: foodcheck
- **Organization**: Stellnovise
- **Country**: CA
- **Store Password**: foodcheck123
- **Key Password**: foodcheck123

⚠️ **IMPORTANT**: Store the keystore file and passwords securely! You'll need the same keystore for all future app updates.

## Step 2: Configure Signing in build.gradle

Add the signing configuration to `android/app/build.gradle`:

```gradle
android {
    ...

    signingConfigs {
        release {
            storeFile file('foodcheck-release-key.jks')
            storePassword 'foodcheck123'
            keyAlias 'foodcheck'
            keyPassword 'foodcheck123'
        }
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release  // Changed from debug to release
        }
    }
}
```

## Step 3: Build the Android App Bundle (AAB)

Navigate to the android directory and run:

```bash
cd android
./gradlew bundleRelease
```

This will generate the AAB file at:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## Step 4: Verify the AAB

Check the file was created:
```bash
ls -lh app/build/outputs/bundle/release/app-release.aab
```

## Alternative: Build using Android Studio

1. Open the `android` folder in Android Studio
2. Select **Build** > **Generate Signed Bundle / APK**
3. Choose **Android App Bundle**
4. Select or create your keystore:
   - Key store path: (select your foodcheck-release-key.jks)
   - Key store password: foodcheck123
   - Key alias: foodcheck
   - Key password: foodcheck123
5. Choose **release** build variant
6. Click **Finish**

The AAB will be generated at: `android/app/build/outputs/bundle/release/app-release.aab`

## Step 5: Upload to Google Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new app or select your existing app
3. Navigate to **Release** > **Production** (or Testing track)
4. Click **Create new release**
5. Upload the `app-release.aab` file
6. Fill in the release notes and other required information
7. Review and roll out the release

## Important Notes

### Keystore Security
- **NEVER** commit the keystore file to Git
- **NEVER** share the keystore passwords publicly
- Store the keystore in a secure location (password manager, secure vault)
- Make multiple backup copies of the keystore
- If you lose the keystore, you cannot update your app on Google Play Store

### App Information
- **Package Name**: ca.foodcheck.app
- **Version Name**: 1.0.0
- **Version Code**: 1

### For Future Updates
- Keep the same keystore file
- Increment versionCode by 1 for each release
- Update versionName according to semantic versioning (e.g., 1.0.1, 1.1.0, 2.0.0)

## Troubleshooting

### "JAVA_HOME is not set"
Ensure Java JDK 17 or higher is installed:
```bash
java -version
```

Set JAVA_HOME if needed:
```bash
export JAVA_HOME=/path/to/jdk
```

### "Permission denied" on gradlew
Make it executable:
```bash
chmod +x gradlew
```

### Build fails with dependency errors
Try cleaning and rebuilding:
```bash
./gradlew clean
./gradlew bundleRelease
```

### Need to build APK instead of AAB
For APK (not recommended for Play Store):
```bash
./gradlew assembleRelease
```
Output: `android/app/build/outputs/apk/release/app-release.apk`

## Quick Command Summary

```bash
# 1. Generate keystore
keytool -genkey -v -keystore foodcheck-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias foodcheck -storepass foodcheck123 -keypass foodcheck123 -dname "CN=Stellnovise, O=Stellnovise, C=CA"

# 2. Move keystore to android/app directory
mv foodcheck-release-key.jks android/app/

# 3. Build AAB
cd android
./gradlew bundleRelease

# 4. Locate the AAB file
ls -lh app/build/outputs/bundle/release/app-release.aab
```

## Resources
- [Android App Bundle Documentation](https://developer.android.com/guide/app-bundle)
- [Upload to Google Play](https://support.google.com/googleplay/android-developer/answer/9859152)
- [App Signing Best Practices](https://developer.android.com/studio/publish/app-signing)
