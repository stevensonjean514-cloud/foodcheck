# Build Android App for Google Play Store

## TL;DR - Quick Build

Run this single command:

```bash
./build-android-aab.sh
```

**That's it!** The script handles everything automatically.

### Requirements
- Java JDK 17+ installed ([Download](https://adoptium.net/))

### Alternative: Use Docker (No Java Required)
```bash
./build-with-docker.sh
```

---

## What You'll Get

After running the build script:

✅ **File:** `android/app/build/outputs/bundle/release/app-release.aab`
✅ **Ready for:** Google Play Store upload
✅ **Signed with:** Your release keystore
✅ **Version:** 1.0.0 (versionCode: 1)

---

## Upload to Google Play

1. Visit [Google Play Console](https://play.google.com/console)
2. Create or select your app
3. Go to **Release** → **Production** (or Testing)
4. Upload `app-release.aab`
5. Submit for review

---

## Keystore Security

Your keystore will be generated at:
```
android/app/foodcheck-release-key.jks
Password: foodcheck123
```

⚠️ **CRITICAL:**
- Backup this file immediately
- Store password securely
- Never commit to Git (already in .gitignore)
- You need this for ALL future updates

---

## Need More Details?

See comprehensive guides:
- **BUILD_INSTRUCTIONS.md** - Complete step-by-step instructions
- **ANDROID_BUILD_READY.md** - Configuration details and troubleshooting

---

## Build Commands Summary

| Method | Command | Requirements |
|--------|---------|--------------|
| **Automated** | `./build-android-aab.sh` | Java 17+ |
| **Docker** | `./build-with-docker.sh` | Docker |
| **Manual** | See BUILD_INSTRUCTIONS.md | Java 17+ |

---

## Configuration

Everything is already configured:

✅ App ID: `ca.foodcheck.app`
✅ Version: 1.0.0
✅ Gradle: 8.7 (Java 17 compatible)
✅ Signing: Configured
✅ Min SDK: 24 (Android 7.0+)
✅ Target SDK: 36 (Android 14)

**Your app is ready to build!** 🚀
