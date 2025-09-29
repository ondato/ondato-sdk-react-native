# Ondato SDK for React Native

A drop-in component library for React Native to capture identity documents and facial biometrics. This SDK features advanced image quality detection and direct upload to simplify identity verification integration.

## Table of contents

- [Overview](#overview)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Configuration Options](#configuration-options)
  - [Handling the Result](#handling-the-result)
- [Customization & Styling](#customization--styling)
  - [iOS Customization](#ios-customization)
  - [Android Customization](#android-customization)
- [Optional Features](#optional-features)
  - [Adding Screen Recorder and/or NFC Support](#adding-screen-recorder-andor-nfc-support)

## Overview

This SDK provides a set of pre-built screens and tools for React Native applications to allow the capturing of identity documents and face photos/videos for identity verification.

**Key Features:**

- **Intuitive UI:** A carefully designed user interface to guide your customers through the entire photo and video capturing process.
- **Modular Design:** Seamlessly integrate the verification flow into your application.
- **Advanced Image Quality Detection:** Ensures that captured images meet the requirements of the Ondato identity verification process, guaranteeing a high success rate.
- **Direct Image Upload:** Simplifies integration by handling the upload of captured data directly to the Ondato service.

> **Note:** This SDK is responsible only for the client-side process of capturing and uploading photos/videos. You must use the [Ondato API](https://ondato.atlassian.net/wiki/spaces/PUB/pages/2334359560/Customer+onboarding+KYC+mobile+SDK+integration) from your backend to create and manage verification checks.

## Requirements

- **React Native:** `*` (as per `peerDependencies`)
- **React:** `*` (as per `peerDependencies`)
- **iOS:**
  - Xcode 15 or later.
  - Targets iOS 15 or newer.
- **Android:**
  - No additional version requirements.
- **App Orientation:** We strongly recommend locking your application to **portrait** orientation for the best user experience.
- **New Architecture:** This version of the library is built for React Native's New Architecture (TurboModules).

## Installation

```sh
yarn add ondato-sdk-react-native
# or
npm install ondato-sdk-react-native
```

### iOS Specific Setup

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

### Android Specific Setup

No native changes are required for the core functionality to work.

## Usage

Before launching the SDK, you must first obtain an `identityVerificationId` from the Ondato API. This ID is essential to link the client-side session with a verification check on your backend.

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

## Customization & Styling

### iOS Customization

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

### Android Customization

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
  <color name="ondatoColorLanguagesBorder">#E2E2E2</color>>
  <color name="ondatoColorCameraFilter">#65000000</color>
  <color name="ondatoInputTextBorderColor">#808080</color>
</resources>
```

_For a complete list of overridable colors, see the `colors.xml` example in the original README._

## Optional Features

### Adding Screen Recorder and/or NFC Support

#### Android

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
      implementation("com.kyc.ondato:screen-recorder:2.6.7")
      // and/or
      implementation("com.kyc.ondato:nfc-reader:2.6.7")
    }
    ```
3.  Permissions are handled automatically via Manifest Merge.

#### iOS

1.  Add the relevant pods to your `Podfile`:
    ```ruby
    # Podfile
    pod 'OndatoSDK', '= 2.6.8'
    # and/or
    pod 'OndatoScreenRecorder', '= 2.6.8'
    ```
2.  Add the necessary permissions to your `Info.plist`:
    ```xml
    <!-- Required for NFC -->
    <key>NFCReaderUsageDescription</key>
    <string>This app uses NFC to scan identification documents.</string>
    <!-- Required by ScreenRecorder -->
    <key>NSMicrophoneUsageDescription</key>
    <string>This app uses the microphone to record audio during the screen recording verification process.</string>
    ```
3.  For NFC, enable the "Near Field Communication Tag Reading" [capability in Xcode](https://developer.apple.com/documentation/xcode/adding-capabilities-to-your-ap) under `Signing & Capabilities`, which will add the required entitlement to your `.entitlements` file.
