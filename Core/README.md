# Ondato SDK for React Native

## Table of contents

- [Overview](#overview)
- [Installation](#installation)
- [Handling callbacks](#handling-callbacks)
- [Customising SDK](#customising-sdk)

## Overview

This SDK provides a drop-in set of screens and tools for iOS applications to allow capturing of identity documents and face photos/live videos for the purpose of identity verification. The SDK offers a number of benefits to help you create the best onboarding/identity verification experience for your customers:

- Carefully designed UI to guide your customers through the entire photo/video-capturing process
- Modular design to help you seamlessly integrate the photo/video-capturing process into your application flow
- Advanced image quality detection technology to ensure the quality of the captured images meets the requirement of the Ondato identity verification process, guaranteeing the best success rate
- Direct image upload to the Ondato service, to simplify integration\*

\* Note: the SDK is only responsible for capturing and uploading photos/videos. You still need to access the [Ondato API](https://ondato.atlassian.net/wiki/spaces/PUB/pages/2334359560/Customer+onboarding+KYC+mobile+SDK+integration) to create and manage checks.

## Installation

```sh
yarn add https://github.com/ondato/ondato-sdk-react-native/releases/download/2.5.10/ondato-sdk-react-native-2.5.11.tgz
or
npm install https://github.com/ondato/ondato-sdk-react-native/releases/download/2.5.10/ondato-sdk-react-native-2.5.11.tgz
```

## Requirements

> **_NOTE:_** We recommend you lock your app to `portrait` orientation.

### Android

1. Add a below repository to your `android/build.gradle`:

```groovy
// ...
allprojects {
    repositories {
        // ...
        // Add this to your project
        maven {
            url "$rootDir/../../android/local/repo"
        }
        maven {
            url "$rootDir/../node_modules/ondato-sdk-react-native/android/local/repo"
        }
    }
}
```

2. Add camera permissions to your `AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- ... -->
    <uses-permission android:name="android.permission.CAMERA" />
    <!-- ... -->
</manifest>

```

### iOS

The Stripe React Native SDK requires Xcode 13.2.1 or later and is compatible with apps targeting iOS 13 or above.

1. Add the following to your `Info.plist` file, this is required by `Ondato SDK` to work properly:

```xml
<!-- ... -->
<plist>
    <dict>
        <!-- Add these two lines below -->
        <key>NSCameraUsageDescription</key>
        <string>Required for document and facial capture</string>
        <!-- ... -->
    </dict>
</plist>
```

2. Turn on `Near Field Communication Tag Reading` under the Capabilities tab for the project’s target. Official documentation can be found [here](https://help.apple.com/xcode/mac/current/#/dev88ff319e7).

3. Comment out or remove the following line in your `Podfile` (the example is based on `React Native 0.71.4` and might have variations on different versions), this is required because `Flipper` is currently not supported by `Ondato SDK`:

```ruby
    # ...
    #:flipper_configuration => flipper_config,
    # ...
```

4. Run `pod install` in your `ios` directory to install the native dependencies.

## Example

```tsx
import React, { useCallback, useRef, useState } from 'react';
import { Button, StyleSheet, View } from 'react-native';
import {
  OndatoSdk,
  OndatoSdkState,
  OndatoSdkRef,
  OndatoSdkConfig,
} from 'ondato-sdk-react-native';

export default () => {
  const ondatoSdkRef = useRef<OndatoSdkRef>(null);

  const [config] = useState<OndatoSdkConfig>({
    mode: 'test',
    identityVerificationId: 'your-identity-verification-id',
    language: 'en',
    showSplashScreen: true,
    showStartScreen: true,
    showIdentificationWaitingScreen: true,
    showSelfieFrame: true,
    skipRegistrationIfDriverLicense: true,
    showSuccessWindow: true,
  });

  const onStateUpdate = useCallback((state: OndatoSdkState) => {
    console.log(JSON.stringify(state, null, 2));
  }, []);

  return (
    <View style={styles.container}>
      <Button
        disabled={!config?.identityVerificationId}
        title="Start"
        onPress={() => ondatoSdkRef.current?.open()}
      />
      <OndatoSdk
        ref={ondatoSdkRef}
        config={config}
        onStateUpdate={onStateUpdate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#eee',
  },
});
```

## Styling

Currently, the SDK styling can be changed programmatically only for iOS side, in order to change the styling for Android you will need to do some extra steps.

### iOS

To change coloring for iOS side, you just need to pass one of the following properties with the config (or above if you want to customize extra styling options):

```jsx
<OndatoSdk
  ref={ondatoSdkRef}
  config={{
    // ...

    // This sets the general styling of the SDK
    simpleCustomization: {
      primaryColor: '#fd5a28',
      textColor: '#000000',
      buttonTextColor: '#ffffff',
    },
    // You can change specific styling by passing this customization object,
    // which overrides the simpleCustomization object, you can change as many
    // values as you want and leave the rest as they are, because
    // they are merged with the simpleCustomization object anyhow
    iosCustomization: {
      progressColor: '#fd5a28',
      errorColor: '#fd5a28',
      errorTextColor: '#ffffff',
      buttonColor: '#fd5a28',
      buttonTextColor: '#ffffff',
      textColor: '#000000',
      backgroundColor: '#ffffff',
      imageTintColor: '#fd5a28',
      consentWindow: {
        acceptButton: {
          font: {
            name: 'default',
            weight: 'regular',
            size: 15,
          },
          backgroundColor: '#00000000',
          tintColor: '#0000ff',
          borderWidth: 0,
          borderColor: '#00000000',
          cornerRadius: 0,
        },
        declineButton: {
          font: {
            name: 'default',
            weight: 'regular',
            size: 15,
          },
          backgroundColor: '#00000000',
          tintColor: '#0000ff',
          borderWidth: 0,
          borderColor: '#00000000',
          cornerRadius: 0,
        },
        header: {
          color: '#000000',
          font: {
            name: 'default',
            weight: 'semibold',
            size: 15,
          },
        },
        body: {
          textColor: '#000000',
          font: {
            name: 'default',
            weight: 'regular',
            size: 15,
          },
        },
      },
    },
  }}
  onStateUpdate={onStateUpdate}
/>
```

### Android

In order to add custom styling to the SDK, you need to create a `colors.xml` file in your `res/values` folder and add the following code:

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
