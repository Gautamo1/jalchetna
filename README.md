# JalChetna - Expo React Native App

This is an Expo React Native application built with SDK 54.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- EAS CLI (for building APK)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Expo CLI globally (if not already installed):
```bash
npm install -g expo-cli
```

3. Install EAS CLI globally (for building native apps):
```bash
npm install -g eas-cli
```

## Development

Start the development server:
```bash
npm start
```

Run on Android:
```bash
npm run android
```

## Building Native APK

### Option 1: Using EAS Build (Recommended)

1. Login to your Expo account:
```bash
eas login
```

2. Configure your project:
```bash
eas build:configure
```

3. Build the APK:
```bash
npm run build:apk
```
or
```bash
eas build -p android --profile preview
```

The APK will be built on Expo's servers and you'll get a download link.

### Option 2: Local Build (Requires Android Studio)

1. Prebuild the native Android project:
```bash
npx expo prebuild --platform android
```

2. Build the APK locally:
```bash
cd android
.\gradlew assembleRelease
```

The APK will be located at: `android/app/build/outputs/apk/release/app-release.apk`

## Assets

Place your app icons and splash screens in the `assets/` folder:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen (1242x2436)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)
- `favicon.png` - Web favicon (48x48)

You can generate these assets using:
```bash
npx expo-asset-generator
```

## Notes

- For EAS Build, you'll need an Expo account (free tier available)
- Make sure to update the `projectId` in `app.json` after running `eas build:configure`
- The preview profile builds an APK, while production builds an AAB for Google Play Store
