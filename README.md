# Ondato SDK for React Native

A drop-in component library for React Native to capture identity documents and facial biometrics. This SDK features advanced image quality detection and direct upload to simplify identity verification integration.

## Table of contents

- [Overview](#overview)
- [Compatibility](#compatibility)
- [Prerequisites](#prerequisites)
- [For Expo Projects](#for-expo-projects)
  - [Installation](#installation)
  - [Configuration](#configure-ondato-sdk-with-config-plugin)
- [For Bare React Native Projects](#for-bare-react-native-projects)
  - [Installation](#installation-1)
  - [Customization](#customization)
    - [Styling](#styling)
    - [Localisation](#localisation)
  - [Optional Features](#optional-features)
    - [Adding Screen Recorder and/or NFC Support](#adding-screen-recorder-andor-nfc-support)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Configuration Options](#configuration-options)
  - [Handling the Result](#handling-the-result)

## Overview

This SDK provides a set of pre-built screens and tools for React Native applications to allow the capturing of identity documents and face photos/videos for identity verification.

**Key Features:**

- **Intuitive UI:** A carefully designed user interface to guide your customers through the entire photo and video capturing process.
- **Modular Design:** Seamlessly integrate the verification flow into your application.
- **Advanced Image Quality Detection:** Ensures that captured images meet the requirements of the Ondato identity verification process, guaranteeing a high success rate.
- **Direct Image Upload:** Simplifies integration by handling the upload of captured data directly to the Ondato service.

> **Note:** This SDK is responsible only for the client-side process of capturing and uploading photos/videos. You must use the [Ondato API](https://ondato.atlassian.net/wiki/spaces/PUB/pages/2334359560/Customer+onboarding+KYC+mobile+SDK+integration) from your backend to create and manage verification checks.

## Compatibility

| Platform     | Version |
| :----------- | :------ |
| React Native | 0.77+   |
| Expo SDK     | 53+     |

| React Native Version | Architecture              | Status                               |
| -------------------: | ------------------------- | :----------------------------------- |
|            **0.80+** | ✅ **New Architecture**   | Fully supported                      |
|      **0.77 – 0.79** | ⚙️ **New Arch (partial)** | Supported via fallback legacy bridge |
|           **< 0.77** | ❌                        | Not supported                        |

> **React Native 0.77 – 0.79**
>
> The new architecture in these versions uses an outdated TurboModule API.
> To use the Ondato SDK, you must **disable new arch** in your Podfile:
>
> ```ruby
> use_react_native!(
>   :path => config[:reactNativePath],
>   :new_arch_enabled => false # add this line
> )
> ```
>
> Then run `pod install` again.
>
> The package will automatically fall back to the legacy bridge.

## Prerequisites

**App Orientation:** We strongly recommend locking your application to **portrait** orientation for the best user experience.

## For Expo Projects

The Ondato SDK for React Native can be integrated into Expo projects using a [development build](https://docs.expo.dev/workflow/overview/#development-builds). You can configure the project using [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/) or by manually configuring the native projects (the "bare workflow," which is not recommended).

**Note**: The Ondato SDK for React Native cannot be used in the pre-compiled [Expo Go app](https://docs.expo.dev/workflow/overview/#expo-go-an-optional-tool-for-learning) because it includes native code that is not compiled into Expo Go.

To create a new Expo project, see the [Get Started](https://docs.expo.dev/get-started/create-a-project/) guide in the Expo documentation.

### Installation

Install Ondato SDK React Native:

```bash
npx expo install https://github.com/ondato/ondato-sdk-react-native/releases/download/2.6.9-newarch/osrn-v2.6.9-newarch.tgz
```

### Configure Ondato SDK with config plugin

The recommended approach is to use the [Expo Config Plugin](https://docs.expo.dev/config-plugins/introduction/). Add the `ondato-sdk-react-native` plugin to the `plugins` array in your `app.json` or `app.config.js`.

Below is an example `app.json` configuration:

```json
{
  "expo": {
    "plugins": [
      [
        "ondato-sdk-react-native",
        {
          "enableNfc": true,
          "enableScreenRecorder": true,
          "android": {
            "mavenRepoUrl": "https://custom.maven.repo",
            "colors": {
              "ondatoColorPrimary": "#fd5a28",
              "ondatoColorAccent": "#FF5A28"
            },
            "colorsNight": {
              "ondatoColorPrimary": "#fd5a28",
              "ondatoColorAccent": "#FF5A28"
            },
            "defaultTranslationOverrides": {
              "ondato_start_button": "Start"
            }
          },
          "ios": {
            "nfcUsageDescription": "Scan NFC-enabled identification documents.",
            "cameraUsageDescription": "Capture documents and facial images.",
            "microphoneUsageDescription": "Record audio during screen recording."
          }
        }
      ]
    ]
  }
}
```

After adding the Ondato SDK plugin to your `app.json` (or after making any changes to the plugin configuration), you must run `expo prebuild` to apply these changes to the native project files.

```bash
npx expo prebuild --clean
```

This command regenerates the native `android` and `ios` directories. After prebuilding, you can create a new development build with `eas build` or run the app directly on a simulator/device:

```bash
# Run on an Android emulator or connected device
npx expo run:android

# Run on an iOS simulator or connected device
npx expo run:ios
```

#### Plugin Options

| Option                                | Type      | Description                                                                  | Default                                                                                            |
| ------------------------------------- | --------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `enableNfc`                           | `boolean` | Enables NFC support for scanning identification documents.                   | `false`                                                                                            |
| `enableScreenRecorder`                | `boolean` | Enables screen recording with audio for verification.                        | `false`                                                                                            |
| `android.mavenRepoUrl`                | `string`  | Custom Maven repository URL for Android dependencies.                        | Local path (`$rootDir/../node_modules/ondato-sdk-react-native/android/local/repo`)                 |
| `android.colors`                      | `object`  | Custom colors for Android theming (partial override of default colors).      | Default colors object (see `constants.ts` for full defaults like `#fd5a28` for primary colors)     |
| `android.colorsNight`                 | `object`  | Custom colors for Android night mode theming (partial override of defaults). | Default colors object (same as `android.colors` defaults)                                          |
| `android.defaultTranslationOverrides` | `object`  | Overrides for default string translations on Android.                        | Empty object (uses defaults from `constants.ts` like `"Start"` for `ondato_start_button`)          |
| `ios.nfcUsageDescription`             | `string`  | iOS NFC usage description for `Info.plist`.                                  | `"This app uses NFC to scan identification documents"`                                             |
| `ios.cameraUsageDescription`          | `string`  | iOS camera usage description for `Info.plist`.                               | `"Required for document and facial capture"`                                                       |
| `ios.microphoneUsageDescription`      | `string`  | iOS microphone usage description for `Info.plist`.                           | `"This app uses the microphone to record audio during the screen recording verification process."` |

**Note**: All plugin options are optional. If not provided, defaults are used as shown above. For `android.colors`, `android.colorsNight`, and `android.defaultTranslationOverrides`, you only need to provide a partial object to override specific values.

## For Bare React Native Projects

### Installation

```sh
yarn add https://github.com/ondato/ondato-sdk-react-native/releases/download/2.6.9-newarch/osrn-v2.6.9-newarch.tgz
# or
npm install https://github.com/ondato/ondato-sdk-react-native/releases/download/2.6.9-newarch/osrn-v2.6.9-newarch.tgz
```

#### iOS Specific Setup

1.  **Add Permissions:** The SDK requires camera access. Add the `NSCameraUsageDescription` key to your `Info.plist` file.

    ```xml
    <!-- ios/YourApp/Info.plist -->
    <key>NSCameraUsageDescription</key>
    <string>Required for document and facial capture</string>
    ```

2.  **Install Pods:** Navigate to your `ios` directory and install the native dependencies.

    ```bash
    cd ios && pod install
    ```

3.  **Disable Flipper (if necessary):** The Ondato SDK does not currently support Flipper. You may need to comment out the Flipper configuration in your `Podfile`.

    ```ruby
    # Podfile
    # :flipper_configuration => flipper_config,
    ```

#### Android Specific Setup

No native changes are required for the core functionality to work.

### Customization

#### Styling

##### iOS

For iOS, you can customize the UI programmatically by passing an `appearance` object in the configuration. This allows you to change colors, fonts, and other elements to match your application's theme.

**Example `appearance` object:**

```javascript
const appearance = {
  progressColor: '#fd5a28',
  errorColor: '#fd5a28',
  errorTextColor: '#ffffff',
  buttonColor: '#fd5a28',
  buttonTextColor: '#ffffff',
  textColor: '#000000',
  backgroundColor: '#ffffff',
  imageTintColor: '#fd5a28',
  consentWindow: {
    // ... consent window styling
  },
};

// Pass it to the startIdentification function
startIdentification({
  identityVerificationId: '...',
  appearance: appearance,
});
```

_For a full list of available `appearance` properties, please refer to the `OndatoAppearance` type in `NativeOndatoModule.ts`._

##### Android

On Android, styling is achieved by overriding the SDK's default colors in your application's `colors.xml` file.

1.  Create a `colors.xml` file in your Android project at `android/app/src/main/res/values/colors.xml`.
2.  Add the colors you wish to override.

**Example `colors.xml`:**

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
  <!-- Ondato's Status Bar -->
  <color name="ondatoColorPrimaryDark">#fd5a28</color>

  <!-- Ondato's Primary and Accent Colors -->
  <color name="ondatoColorPrimary">#fd5a28</color>
  <color name="ondatoColorAccent">#FF5A28</color>

  <!-- Ondato's Text Colors -->
  <color name="ondatoTextColor">#000000</color>
  <color name="ondatoSecondaryTextColor">#244D50</color>

  <!-- Ondato's Primary Button with Gradient colors -->
  <color name="ondatoColorButton">#fd5a28</color>
  <color name="ondatoColorButtonFocusedStart">#fd5a28</color>
  <color name="ondatoColorButtonFocusedCenter">#FF8000</color>
  <color name="ondatoColorButtonFocusedEnd">#FF9700</color>
  <color name="ondatoColorButtonText">#ffffff</color>

  <!-- Ondato's Outlined Button Colors -->
  <color name="ondatoOutlinedButtonColor">#fd5a28</color>
  <color name="ondatoOutlinedButtonTextColor">#fd5a28</color>

  <color name="ondatoColorBackground">#ffffff</color>

  <!-- Ondato's Illustration Colors -->
  <color name="ondatoIconColor">#fd5a28</color>

  <!-- Ondato's Active Liveness Screen Colors -->
  <color name="ondatoActiveLivenessOvalProgressColor">#FF5A28</color>
  <color name="ondatoActiveLivenessOvalProgressColorSecondary">#FF5A28</color>
  <color name="ondatoActiveLivenessResultActivityIndicatorColor">#FF5A28</color>
  <color name="ondatoActiveLivenessResultAnimationBackgroundColor">#FF5A28</color>
  <color name="ondatoActiveLivenessResultUploadProgressColor">#FF5A28</color>
  <color name="ondatoActiveLivenessResultAnimationForegroundColor">#FF5A28</color>
  <color name="ondatoActiveLivenessResultUploadProgressTrackColor">#FF5A28</color>
  <color name="ondatoActiveLivenessResultForegroundColor">#FF5A28</color>
  <color name="ondatoActiveLivenessCameraFilter">#fff</color>

  <!-- Used for Active Liveness Screen Buttons -->
  <color name="ondatoDisabledButtonColor">#FAB2A5</color>
  <color name="ondatoHighlightButtonColor">#b02e16</color>

  <!-- Ondato's Error Colors -->
  <color name="ondatoColorErrorBg">#fd5a28</color>
  <color name="ondatoColorErrorText">#ffffff</color>

  <!-- Other -->
  <color name="ondatoColorSeparatorColor">#e5e6e7</color>
  <color name="ondatoColorAlmostTransparent">#70ffffff</color>
  <color name="ondatoColorAlmostTransparent2">#CCFFFFFF</color>
  <color name="ondatoColorLanguagesBorder">#E2E2E2</color>
  <color name="ondatoColorCameraFilter">#65000000</color>
  <color name="ondatoInputTextBorderColor">#808080</color>
</resources>
```

#### Localisation

##### Android

The Ondato Android SDK comes with out-of-the-box translations for the following locales:

- English (en) 🇬🇧
- Lithuanian (lt) 🇱🇹
- German (de) 🇩🇪
- Latvian (lv) 🇱🇻
- Estonian (et) 🇪🇪
- Russian (ru) 🇷🇺
- Albanian (sq) 🇦🇱
- Bulgarian (bg) 🇧🇬
- Spanish (es) 🇪🇸
- French (fr) 🇫🇷
- Italian (it) 🇮🇹
- Romanian (ro) 🇷🇴
- Greek (el) 🇬🇷
- Dutch (nl) 🇳🇱
- System ⚙️ (if the device language is not translated, everything will be in English)

You can also **provide your own translations** by overriding [Ondato's string keys](https://github.com/ondato/ondato-sdk-android/blob/main/strings/strings.xml) in your `strings.xml`.

### Optional Features

#### Adding Screen Recorder and/or NFC Support

##### Android

1.  Add the Ondato maven repository to your project-level `android/build.gradle` file:
    ```groovy
    allprojects {
      repositories {
        // ... other repositories
        maven { url "https://raw.githubusercontent.com/ondato/ondato-sdk-android/main/repos/" }
      }
    }
    ```
2.  Add the required dependencies to your app-level `android/app/build.gradle` file:
    ```groovy
    dependencies {
      // ... other dependencies
      implementation("com.kyc.ondato:recorder:2.6.7")
      // and/or
      implementation("com.kyc.ondato:nfc-reader:2.6.7")
    }
    ```
3.  Permissions are handled automatically via Manifest Merge.

##### iOS

1.  Add the relevant pods to your `Podfile`:
    ```ruby
    # Podfile
    pod 'OndatoSDK', '= 2.6.9'
    # and/or
    pod 'OndatoScreenRecorder', '= 2.6.9'
    ```
2.  Add the necessary permissions to your `Info.plist`:
    ```xml
    <!-- Required for NFC -->
    <key>NFCReaderUsageDescription</key>
    <string>This app uses NFC to scan identification documents</string>
    <!-- Required by ScreenRecorder -->
    <key>NSMicrophoneUsageDescription</key>
    <string>This app uses the microphone to record audio during the screen recording verification process</string>
    ```
3.  For NFC, enable the "Near Field Communication Tag Reading" [capability in Xcode](https://developer.apple.com/documentation/xcode/adding-capabilities-to-your-app) under `Signing & Capabilities`, which will add the required entitlement to your `.entitlements` file.

## Usage

Before launching the SDK, you must first obtain an `identityVerificationId` from the [Ondato API](https://ondato.atlassian.net/wiki/spaces/PUB/pages/2320990304/Authentication). This ID is essential for linking the client-side session with a verification check on your backend.

Here is a basic example of how to import and launch the SDK:

```tsx
import { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Alert } from 'react-native';
import { startIdentification, OndatoResult } from 'ondato-sdk-react-native';

export default function App() {
  // This ID should be fetched from your server, which gets it from the Ondato API.
  const [identityVerificationId, setIdentityVerificationId] = useState(
    '<YOUR_VERIFICATION_ID>'
  );

  const onStartPress = async () => {
    if (!identityVerificationId) {
      Alert.alert('Error', 'Identity Verification ID is missing.');
      return;
    }

    try {
      const result: OndatoResult = await startIdentification({
        identityVerificationId: identityVerificationId,
        mode: 'test', // Use 'live' for production
      });

      if (result.status === 'success') {
        // Verification was successfully submitted.
        // You can get the final status from a webhook on your server.
        Alert.alert('Success', `Verification submitted with ID: ${result.id}`);
        console.log('Success, id:', result.id);
      } else {
        // Verification failed or was cancelled by the user.
        Alert.alert('Failure', `Verification failed: ${result.error}`);
        console.error('Failed:', result.error);
      }
    } catch (e) {
      // A native exception occurred.
      console.error('Native module error:', e);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Your UI to get the identityVerificationId */}
      <Pressable
        disabled={!identityVerificationId}
        onPress={onStartPress}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Start Ondato Verification</Text>
      </Pressable>
    </View>
  );
}

// Add your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#fd5a28',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
```

A full example can be found in this repository's `example` folder.

## API Reference

The `startIdentification` function accepts a single configuration object.

### Configuration Options

| Property                          | Type                 | Default      | Platform | Description                                                               |
| --------------------------------- | -------------------- | ------------ | -------- | ------------------------------------------------------------------------- |
| **`identityVerificationId`**      | `string`             | _(Required)_ | All      | The unique ID for the verification session, obtained from the Ondato API. |
| `mode`                            | `'test'` \| `'live'` | `'test'`     | All      | Sets the SDK environment.                                                 |
| `language`                        | `OndatoLanguage`     | `'en'`       | All      | Sets the localization for the SDK. See `languages` export for options.    |
| `showStartScreen`                 | `boolean`            | `true`       | All      | If `true`, shows a welcoming screen before the flow starts.               |
| `removeSelfieFrame`               | `boolean`            | `false`      | All      | If `true`, removes the selfie frame during passive liveness checks.       |
| `skipRegistrationIfDriverLicense` | `boolean`            | `false`      | All      | If `true`, skips the registration step if a driver's license is used.     |
| `showSplashScreen`                | `boolean`            | `false`      | Android  | If `true`, shows the Ondato splash screen on launch.                      |
| `showWaitingScreen`               | `boolean`            | `false`      | Android  | If `true`, shows a waiting screen during processing.                      |
| `showIdentificationWaitingPage`   | `boolean`            | `true`       | Android  | If `true`, shows the identification waiting page.                         |
| `showSuccessWindow`               | `boolean`            | `false`      | iOS      | If `true`, displays a success window at the end of the flow.              |
| `appearance`                      | `OndatoAppearance`   | `{}`         | iOS      | An object to customize the colors, fonts, and styles of the iOS UI.       |

### Handling the Result

The `startIdentification` function returns a `Promise` that resolves with an `OndatoResult` object.

- **On Success:**
  ```typescript
  {
    status: 'success',
    id?: string // The identityVerificationId
  }
  ```
- **On Failure:**
  ```typescript
  {
    status: 'failure',
    id?: string, // The identityVerificationId
    error: string // A message describing the reason for failure
  }
  ```
