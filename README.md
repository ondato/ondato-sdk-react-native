# Ondato SDK for React Native (New Arch)

## Table of contents

- [Overview](#overview)
- [Installation](#installation)
- [Handling callbacks](#handling-callbacks)
- [Customising SDK](#customising-sdk)

## Overview

This SDK provides a drop-in set of screens and tools for React Native applications to allow capturing of identity documents and face photos/live videos for the purpose of identity verification. The SDK offers a number of benefits to help you create the best onboarding/identity verification experience for your customers:

- Carefully designed UI to guide your customers through the entire photo/video-capturing process
- Modular design to help you seamlessly integrate the photo/video-capturing process into your application flow
- Advanced image quality detection technology to ensure the quality of the captured images meets the requirement of the Ondato identity verification process, guaranteeing the best success rate
- Direct image upload to the Ondato service, to simplify integration\*

\* Note: the SDK is only responsible for capturing and uploading photos/videos. You still need to access the [Ondato API](https://ondato.atlassian.net/wiki/spaces/PUB/pages/2334359560/Customer+onboarding+KYC+mobile+SDK+integration) to create and manage checks.

## Installation

If you want to use the core functionality please install the core package only:

```sh
yarn add https://github.com/ondato/ondato-sdk-react-native/releases/download/2.6.8-newarch.0/osrn-2.6.8.tgz
or
npm install https://github.com/ondato/ondato-sdk-react-native/releases/download/2.6.8-newarch.0/osrn-2.6.8.tgz
```

## Requirements

> **_NOTE:_** We recommend you lock your app to `portrait` orientation.

### Android

No native changes are required.

### iOS

The Ondato React Native SDK requires Xcode 15 or later and is compatible with apps targeting iOS 15 or above.

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

2. Run `pod install` in your `ios` directory to install the native dependencies.

```bash
pod install --repo-update
# or
bundle exec pod install --repo-update
```

3. Comment out or remove the following line in your `Podfile` (the example is based on `React Native 0.71.4` and might have variations on different versions), this is required because `Flipper` is currently not supported by `Ondato SDK`:

```ruby
    # ...
    #:flipper_configuration => flipper_config,
    # ...
```

## Adding `Screen Recorder` and/or `NFC` support:

### Android

1. Add external maven repository to your `android/build.gradle`:

```groovy
allprojects {
  repositories {
    maven { url "https://raw.githubusercontent.com/ondato/ondato-sdk-android/main/repos/" }
  }
}
```

2. Add dependencies to your `android/app/build.gradle`:

```groovy
dependencies {
  implementation("com.kyc.ondato:screen-recorder:2.6.7")
  // and/or
  implementation("com.kyc.ondato:nfc-reader:2.6.7")
  // ...
}
```

3. Permissions and other requirements are handled by [Manifest Merge](https://developer.android.com/build/manage-manifests#merge-manifests),
   so no other native changes are required.

### iOS

1. Add relevant pods into your `Podfile` after `use_react_native!()` statement:

```ruby
  pod 'OndatoSDK', '= 2.6.8'
  # and/or
  pod 'OndatoScreenRecorder', '= 2.6.8'
```

2. Add permissions into your `Info.plist` file:

```xml
    <!-- Required for NFC -->
    <key>NFCReaderUsageDescription</key>
    <string>This app uses NFC to scan identification documents</string>

    <!-- Required by ScreenRecorder -->
    <key>NSMicrophoneUsageDescription</key>
    <string>This app uses the microphone to record audio during the screen recording verification process</string>
```

3. Add entitlement for `NFC` by using one of these ways:

1) [With the help of XCode](https://developer.apple.com/documentation/xcode/adding-capabilities-to-your-app) by selecting your application as a target, going into `Signing & Capabilities`, hitting `+` and `Near Field Communication Tag Reading`.
2) Add it directly to your `ios/AppName/AppName.entitlements`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <!-- Add this entitlement -->
	<key>com.apple.developer.nfc.readersession.formats</key>
	<array>
		<string>TAG</string>
	</array>
  <!-- ... -->
</dict>
</plist>
```

## Example

```tsx
import { useState } from 'react';
import { IdentityVerificationID } from './IdentityVerificationID';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { startIdentification } from 'ondato-sdk-react-native';

// https://ondato.atlassian.net/wiki/spaces/PUB/pages/2320990304/Authentication
const SECRET = '<Your secret that will be provided by Ondato>';

export default function App() {
  const [id, setId] = useState('');

  const disabled = !id;

  async function runOndato() {
    try {
      const result = await startIdentification({
        identityVerificationId: id,
      });

      if (result.status === 'success') {
        console.log('Success, id:', result.id);
      } else {
        console.error('Failed:', result.error);
      }
    } catch (e) {
      console.error('Native error:', e);
    }
  }

  return (
    <View style={styles.container}>
      <IdentityVerificationID secret={SECRET} id={id} setId={setId} />

      <Pressable
        disabled={disabled}
        onPress={runOndato}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          disabled && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>Start Ondato</Text>
      </Pressable>
    </View>
  );
}
```

## Styling

Currently, the SDK styling can be changed programmatically only for iOS side, in order to change the styling for Android you will need to do some extra steps.

### iOS

To change coloring for iOS side, you just need to pass one of the following properties with the config (or above if you want to customize extra styling options):

```jsx
let appearance = {
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
};
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
