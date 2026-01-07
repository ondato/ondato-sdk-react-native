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
    - [Illustrations](#illustrations)
    - [Fonts](#fonts)
    - [Localisation](#localisation)
    - [Overriding Translations](#overriding-translations)
  - [Optional Features](#optional-features)
    - [Adding Screen Recorder and/or NFC Support](#adding-screen-recorder-andor-nfc-support)
- [Usage](#usage)
- [API Reference](#api-reference)
  - [Configuration Options](#configuration-options)
  - [Handling the Result](#handling-the-result)
  - [Logging](#logging)
- [Support](#support)
- [Contributing](#contributing)
- [License](#license)

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

| React Native Version | Architecture            | Status                               |
| -------------------: | ----------------------- | :----------------------------------- |
|            **0.77+** | ✅ **New Architecture** | Fully supported                      |
|      **0.77 – 0.79** | ⚙️ **Old Architecture** | Supported via fallback legacy bridge |
|           **< 0.77** | ❌                      | Not supported                        |

## Prerequisites

**App Orientation:** We strongly recommend locking your application to **portrait** orientation for the best user experience.

## For Expo Projects

The Ondato SDK for React Native can be integrated into Expo projects using a [development build](https://docs.expo.dev/workflow/overview/#development-builds). You can configure the project using [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/) or by manually configuring the native projects (the "bare workflow," which is not recommended).

**Note**: The Ondato SDK for React Native cannot be used in the pre-compiled [Expo Go app](https://docs.expo.dev/workflow/overview/#expo-go-an-optional-tool-for-learning) because it includes native code that is not compiled into Expo Go.

To create a new Expo project, see the [Get Started](https://docs.expo.dev/get-started/create-a-project/) guide in the Expo documentation.

### Installation

Install the required dependencies:

```bash
npx expo install expo-build-properties
yarn add https://github.com/ondato/ondato-sdk-react-native/releases/download/3.2.1/osrn-v3.2.1.tgz
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
          "ios": {
            "nfcUsageDescription": "Scan NFC-enabled identification documents.",
            "cameraUsageDescription": "Capture documents and facial images.",
            "microphoneUsageDescription": "Record audio during screen recording."
          },
          "customLocalizationPath": "./localizations"
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

| Option                           | Type      | Description                                                | Default                                                                                            |
| -------------------------------- | --------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `enableNfc`                      | `boolean` | Enables NFC support for scanning identification documents. | `false`                                                                                            |
| `enableScreenRecorder`           | `boolean` | Enables screen recording with audio for verification.      | `false`                                                                                            |
| `ios.nfcUsageDescription`        | `string`  | iOS NFC usage description for `Info.plist`.                | `"This app uses NFC to scan identification documents."`                                            |
| `ios.cameraUsageDescription`     | `string`  | iOS camera usage description for `Info.plist`.             | `"Required for document and facial capture"`                                                       |
| `ios.microphoneUsageDescription` | `string`  | iOS microphone usage description for `Info.plist`.         | `"This app uses the microphone to record audio during the screen recording verification process."` |
| `customLocalizationPath`         | `string`  | Path to a directory with custom localization files.        | `undefined`                                                                                        |
| `customIllustrationsPath`        | `string`  | Path to a directory with custom illustration files.        | `undefined`                                                                                        |

---

**Note**: All options are optional. If not provided, defaults are used as shown above. The SDK now uses remote Maven repositories for Android dependencies.

#### Custom Localization with `customLocalizationPath`

To provide your own translations, you can use the optional `customLocalizationPath` property. This should be a path to a directory in your project root that contains your custom localization files. The plugin will automatically copy and configure them for each native platform.

**Required Directory Structure:**

Your localization directory must follow this exact structure:

```
/
├── localizations/
│   ├── android/
│   │   ├── values/
│   │   │   └── strings.xml
│   │   └── values-de-rDE/
│   │       └── strings.xml
│   └── ios/
│       ├── en.lproj/
│       │   └── OndatoSDK.strings
│       └── de.lproj/
│           └── OndatoSDK.strings
└── app.json
```

- **For Android**, the plugin will non-destructively merge the strings from your `strings.xml` files into the final build.
- **For iOS**, the plugin will copy the `OndatoSDK.strings` files into the Xcode project and ensure they are included in the final app bundle.

An example `strings.xml` file:

```xml
<!-- localizations/android/values/strings.xml -->
<resources>
    <string name="Document_Instructions_Passport_DataPage_Heading">Your Custom Text</string>
</resources>
```

An example `OndatoSDK.strings` file:

```swift
/* localizations/ios/en.lproj/OndatoSDK.strings */
"Document_Instructions_Passport_DataPage_Heading" = "Your Custom Text";
```

You are absolutely right. That's a critical omission. My apologies.

#### Custom Illustrations with `customIllustrationsPath`

To override the default SDK illustrations, icons, and animations in your Expo project, you can use the optional `customIllustrationsPath` property in your plugin configuration. This should be a path to a directory in your project root that contains your custom asset files.

The plugin will automatically copy and configure these assets for each native platform during the prebuild process.

**Required Directory Structure:**

Your illustrations directory must follow this exact structure:

```
/
├── illustrations/
│   ├── android/
│   │   ├── drawable/
│   │   │   └── ondato_alert_triangle.png
│   │   └── raw/
│   │       └── face_capture.json
│   └── ios/
│       └── ondato.images.backButton.png
│       └── ondato.animations.waitingScreenAnimation.json
│
└── app.json
```

- **`android/`**: This directory must contain `drawable` and/or `raw` subdirectories. The plugin will copy the contents of these folders into the corresponding native Android resource directories. The filenames must match the native SDK's asset names. **A complete list of these filenames can be found in the [Illustrations > Android](#android) section under the Bare React Native documentation.**
- **`ios/`**: This directory is a flat list of all your custom iOS assets. The plugin will intelligently handle each file based on its extension:
  - **Image files (`.png`, `.jpg`, `.jpeg`)** will be automatically added to the native Xcode project's `Images.xcassets` catalog. The filename must be the full "Conventional Asset Name".
  - **Lottie files (`.json`)** will be copied to the main native project folder and included in the app bundle. The filename must be the full conventional name.
  - **A complete list of all conventional filenames can be found in the [Illustrations > iOS](#ios) section under the Bare React Native documentation.**

**Example `app.json` Configuration:**

```json
{
  "expo": {
    "plugins": [
      [
        "ondato-sdk-react-native",
        {
          "customIllustrationsPath": "./illustrations"
        }
      ]
    ]
  }
}
```

By following this structure, you can customize the SDK's appearance without needing to manually edit any native project files.

#### Custom Fonts with `customFontsPath`

To override the default SDK fonts, you can use the optional `customFontsPath` property in your plugin configuration. This should be a path to a directory in your project root that contains your custom font files (`.ttf` or `.otf`).

The plugin will automatically handle all the necessary native project modifications for both platforms.

**Required Directory Structure:**

Your fonts directory should be a flat folder containing your font files.

```
/
├── fonts/
│   ├── MyAppFont-Bold.ttf
│   ├── MyAppFont-Regular.otf
│   └── another_font.ttf
│
└── app.json
```

**Plugin Behavior:**

- **For Android:** The plugin will copy the font files into the native `android/app/src/main/res/font` directory. It will automatically convert filenames to the required Android format (lowercase with underscores, e.g., `MyAppFont-Bold.ttf` becomes `myappfont_bold.ttf`).
- **For iOS:** The plugin will copy the font files into the native Xcode project, add them to a "Fonts" group, and automatically update the `Info.plist` with the required `UIAppFonts` entries.

**Example `app.json` Configuration:**

```json
{
  "expo": {
    "plugins": [
      [
        "ondato-sdk-react-native",
        {
          "customFontsPath": "./fonts"
        }
      ]
    ]
  }
}
```

**Important:** After adding the `customFontsPath`, you still need to provide the platform-specific font names in your `startIdentification` call, as described in the "For Bare React Native Projects" section. The plugin handles the file setup, but your JavaScript code tells the SDK which font to use for which style.

```tsx
// This is still required!
await startIdentification({
  // ...
  fonts: {
    android: {
      title: 'myappfont_bold',
    },
    ios: {
      title: {
        postScriptName: 'MyAppFont-Bold',
      },
    },
  },
});
```

## For Bare React Native Projects

### Installation

```sh
yarn add https://github.com/ondato/ondato-sdk-react-native/releases/download/3.2.1/osrn-v3.2.1.tgz
# or
yarn add https://github.com/ondato/ondato-sdk-react-native/releases/download/3.2.1/osrn-v3.2.1.tgz
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

#### Android Specific Setup

No native changes are required for the core functionality to work.

### Customization

#### Styling

Customize the SDK’s appearance using the `appearance` field in the configuration, passed as a JSON object. The SDK merges this with default styling. This applies to both iOS and Android for consistent customization.

**Example/default appearance:**

```jsonc
{
  // CORE STYLING
  "brand": {
    "colors": {
      "primaryColor": "#64749c", // Primary brand color

      "textColor": "#000000", // Text color for content
      "backgroundColor": "#FFFFFF", // Base background color for screens

      "danger": "#D04555", // Color for error states and messages
      "warning": "#F9BB42", // Color for warning elements
      "success": "#28865A", // Color for success elements

      "grey100": "", // Currently not used
      "grey200": "#F2F5F8", // Button Disabled state background, Text input readonly background
      "grey300": "", // Currently not used
      "grey400": "#BEC6D0", // Color for input element border color, also used in Text input
      "grey500": "#96A0AE", // Color for "Select card" icon, Proof of Address upload element border, Text input disabled state text color
      "grey600": "#6D7580", // Color for Proof of Address icon color, Text input Active state border
      "grey700": "#282B2F", // Color for feedback bar background color

      "statusBarColor": "#64749c" // Default: brand.colors.primaryColor
    },

    "baseComponentStyling": {
      "cornerRadius": 6, // Used for all input components (Buttons, Text inputs and other elements)
      "buttonPadding": { "top": 14, "bottom": 14, "left": 24, "right": 24 }, // Used for Primary and Secondary button paddings
      "borderWidth": 1.0 // Used for Secondary button, Text input, Selection button border
    },

    "typography": {
      "heading1": {
        "fontSize": 24,
        "fontWeight": 500,
        "lineHeight": 32,
        "alignment": "center",
        "color": "#000000" // Type: String  |  Default: brand.colors.textColor
      },
      "heading2": {
        "fontSize": 16,
        "fontWeight": 500,
        "lineHeight": 18,
        "alignment": "center",
        "color": "#000000" // Type: String  |  Default: brand.colors.textColor
      },
      "body": {
        "fontSize": 16,
        "fontWeight": 400,
        "lineHeight": 18,
        "alignment": "center",
        "color": "#000000" // Type: String  |  Default: brand.colors.textColor
      },
      "list": {
        "fontSize": 16,
        "fontWeight": 400,
        "lineHeight": 18,
        "color": "#000000" // Type: String  |  Default: brand.colors.textColor
      },
      "inputLabel": {
        "fontSize": 16,
        "fontWeight": 400,
        "lineHeight": 18,
        "color": "#000000" // Type: String  |  Default: brand.colors.textColor
      },
      "button": {
        "fontSize": 16,
        "fontWeight": 500,
        "lineHeight": 18,
        "color": "#000000" // Type: String  |  Default: brand.colors.textColor
      }
    }
  },

  // Primary and secondary button options
  "buttons": {
    "primary": {
      "base": {
        "cornerRadius": 6, // Default: brand.baseComponentStyling.cornerRadius
        "padding": { "top": 14, "bottom": 14, "left": 24, "right": 24 }, // Default: brand.baseComponentStyling.buttonPadding

        "fontSize": 16, // Type: Int  |   Default: typography.button.fontSize
        "fontWeight": 500, // Type: Int  |   Default: typography.button.fontWeight
        "lineHeight": 18, // Type: Int  |   Default: typography.button.lineHeight
        "showIcon": false // Type: Boolean
      },
      "normal": {
        "textColor": "#000000", // Type: String  |  Default: brand.colors.textColor
        "backgroundColor": "#64749c", // Type: String  |  Default: brand.colors.primaryColor
        "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        "borderColor": "#64749c", // Type: String  |  Default: colors.primaryColor
        "iconColor": "#000000", // Type: String  |  Default: colors.textColor
        "opacity": 1.0 // Type: Float
      },
      "pressed": {
        "textColor": "#000000", // Type: String  |  Default: brand.colors.textColor
        "backgroundColor": "#64749c", // Type: String  |  Default: brand.colors.primaryColor
        "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        "borderColor": "#64749c", // Type: String  |  Default: colors.primaryColor
        "iconColor": "#000000", // Type: String  |  Default: colors.textColor
        "opacity": 0.8 // Type: Float
      },
      "disabled": {
        "textColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
        "backgroundColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderWidth": 1, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        "borderColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "iconColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
        "opacity": 1.0 // Type: Float
      }
    },

    "secondary": {
      "base": {
        "cornerRadius": 6, // Default: brand.baseComponentStyling.cornerRadius
        "padding": { "top": 14, "bottom": 14, "left": 24, "right": 24 }, // Default: brand.baseComponentStyling.buttonPadding

        "fontSize": 16, // Type: Int  |   Default: typography.button.fontSize
        "fontWeight": 500, // Type: Int  |   Default: typography.button.fontWeight
        "lineHeight": 18, // Type: Int  |   Default: typography.button.lineHeight
        "showIcon": false // Type: Boolean
      },
      "normal": {
        "textColor": "#000000", // Type: String  |  Default: brand.colors.textColor
        "backgroundColor": "#FFFFFF", // Default -  colors.backgroundColor
        "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        "borderColor": "#BEC6D0", // Type: String  |  Default: brand.colors.grey400
        "iconColor": "#000000", // Type: String  |  Default: brand.colors.textColor
        "opacity": 1.0 // Type: Float
      },
      "pressed": {
        "textColor": "#000000", // Type: String  |  Default: brand.colors.textColor
        "backgroundColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        "borderColor": "#6D7580", // Type: String  |  Default: brand.colors.grey600
        "iconColor": "#000000", // Type: String  |  Default: brand.colors.textColor
        "opacity": 1.0 // Type: Float
      },
      "disabled": {
        "textColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
        "backgroundColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        "borderColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "iconColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
        "opacity": 1.0 // Type: Float
      }
    },

    // Icon buttons (e.g. in proof-of-address upload screen) customisation
    "iconButton": {
      "base": {
        "cornerRadius": 6, // Default: brand.baseComponentStyling.cornerRadius
      },
      "normal": {
        "iconColor": "#000000", // Type: String  |  Default: brand.colors.textColor
        "backgroundColor": "#FFFFFF", // Type: String  |  Default: brand.colors.backgroundColor
        "borderColor": "#FFFFFF", // Type: String  |  Default: brand.colors.backgroundColor
        "borderWidth": 0, // Type: Float  |  Default: brand.baseComponentStyling.borderWidth
      },
      "pressed": {
        "iconColor": "#000000", // Type: String  |  Default: brand.colors.textColor
        "backgroundColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderWidth": 0, // Type: Float  |  Default: brand.baseComponentStyling.borderWidth
      },
      "disabled": {
        "iconColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
        "backgroundColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderWidth": 0, // Type: Float  |  Default: brand.baseComponentStyling.borderWidth
      }
    },

    // Back and close navigation buttons customisation
    "navigationButton": {
      "base": {
        "cornerRadius": 6, // Default: brand.baseComponentStyling.cornerRadius
      },
      "normal": {
        "iconColor": "#000000", // Type: String  |  Default: brand.colors.textColor
        "backgroundColor": "#FFFFFF", // Type: String  |  Default: brand.colors.backgroundColor
        "borderColor": "#FFFFFF", // Type: String  |  Default: brand.colors.backgroundColor
        "borderWidth": 0, // Type: Float  |  Default: brand.baseComponentStyling.borderWidth
      },
      "pressed": {
        "iconColor": "#000000", // Type: String  |  Default: brand.colors.textColor
        "backgroundColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderWidth": 0, // Type: Float  |  Default: brand.baseComponentStyling.borderWidth
      },
      "disabled": {
        "iconColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
        "backgroundColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
        "borderWidth": 0, // Type: Float  |  Default: bbrand.baseComponentStyling.borderWidth
      }
    }
  },

  // Customisation options for all text types in the SDK
  "textInput": {
    "base": {
      "cornerRadius": 6, // Type: Float  |   Default: brand.baseComponentStyling.cornerRadius
      "padding": { "top": 14, "bottom": 14, "left": 24, "right": 24 }, // Default: brand.baseComponentStyling.buttonPadding

      "fontSize": 16, // Type: Int  |   Default: typography.body.fontSize
      "fontWeight": 500, // Type: Int  |   Default: typography.body.fontWeight
      "lineHeight": 22, // Type: Int  |   Default: typography.body.lineHeight

      "placeholderTextColor": "#BEC6D0" //Type: String  |  Default: brand.colors.grey400
    },

    "normal": {
      "textColor": "#000000", // Type: String  |  Default: brand.colors.textColor
      "backgroundColor": "#FFFFFF", // Type: String  |   Default: brand.colors.backgroundColor
      "borderColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
      "borderWidth": 1.0 // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
    },
    "selected": {
      "textColor": "#000000", // Type: String  |  Default: brand.colors.textColor
      "backgroundColor": "#FFFFFF", // Type: String  |   Default: brand.colors.backgroundColor
      "borderColor": "#6D7580", // Type: String  |  Default: brand.colors.grey600
      "borderWidth": 1.0 // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
    },
    "disabled": {
      "textColor": "#BEC6D0", // Type: String  |  Default: brand.colors.grey400
      "backgroundColor": "#FFFFFF", // Type: String  |  Default: brand.colors.backgroundColor
      "borderColor": "#BEC6D0", // Type: String  |  Default: brand.colors.grey400
      "borderWidth": 1.0 // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
    },
    "readOnly": {
      "textColor": "#6D7580", // Type: String  |  Default: brand.colors.grey600
      "backgroundColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
      "borderColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
      "borderWidth": 1.0 // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
    },
    "error": {
      "textColor": "#D04555", // Type: String  |  Default: brand.colors.danger
      "borderColor": "#D04555", // Type: String  |  Default: brand.colors.danger
      "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
      "backgroundColor": "#FFFFFF" // Type: String  |   Default: brand.colors.backgroundColor
    }
  },

  // Used for tinkering the document selection card UI
  "selectionCard": {
    "base": {
      "cornerRadius": 6, // Type: Float  |   Default: brand.baseComponentStyling.cornerRadius

      "fontSize": 16, // Type: Int  |   Default: typography.body.fontSize
      "fontWeight": 500, // Type: Int  |   Default: typography.body.fontWeight
      "lineHeight": 22 // Type: Int  |   Default: typography.body.lineHeight
    },
    "normal": {
      "textColor": "#000000", // Type: String  |  Default: brand.colors.textColor
      "backgroundColor": "#FFFFFF", // Type: String  |  Default: brand.colors.backgroundColor
      "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
      "borderColor": "#BEC6D0", // Type: String  |  Default: brand.colors.grey400
      "leftIconColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
      "rightIconColor": "#000000" // Type: String  |  Default: brand.colors.textColor
    },
    "pressed": {
      "textColor": "#000000", // Type: String  |  Default: brand.colors.textColor
      "backgroundColor": "#F2F5F8", // Type: String  |   Default: brand.colors.grey200
      "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
      "borderColor": "#BEC6D0", // Type: String  |  Default: brand.colors.grey400
      "leftIconColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
      "rightIconColor": "#000000" // Type: String  |  Default: brand.colors.textColor
    },
    "disabled": {
      "textColor": "#BEC6D0", // Type: String  |  Default: brand.colors.grey400
      "backgroundColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
      "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
      "borderColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
      "leftIconColor": "#BEC6D0", // Type: String  |  Default: brand.colors.grey400
      "rightIconColor": "#BEC6D0" // Type: String  |  Default: brand.colors.grey400
    }
  },

  // Used for changing the colour of the loading indicator
  "activityIndicator": {
    "color": "#64749c" // Type: String  |  Default: brand.colors.primaryColor
  },

  // Used for customising the face authorisation screen frame and feedback bar
  "faceScanUI": {
    "frame": {
      "borderColor": "#282B2F", // Type: String  |  Default: brand.colors.grey700
      "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
      "progressColor": "#64749c" // Type: String  |  Default: brand.colors.primaryColor
    },
    "feedbackBar": {
      "backgroundColor": "#282B2F", // Type: String  |  Default: brand.colors.grey700
      "textColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
      "cornerRadius": 6 // Type: Float  |   Default: brand.baseComponentStyling.cornerRadius
    }
  },

  // Used for customising the proof-of-address document upload screen
  "documentUploadConfiguration": {
    "borderColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
    "borderWidth": 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
    "cornerRadius": 6.0, // Type: Float  |   Default: brand.baseComponentStyling.cornerRadius

    "fileDescriptionTextColor": "#96A0AE", // Type: String  |  Default: brand.colors.grey500
    "fileIconColor": "#6D7580", // Type: String  |  Default: brand.colors.grey600

    "uploadAreaBackgroundOpacity": 0,
    "uploadAreaBackgroundColor": "#FFFFFF" // Type: String  |  Default: brand.colors.backgroundColor
  },

  // Used for customising the camera overlay
  "cameraScreenConfiguration": {
    "backgroundColor": "#282B2F", // Type: String  |  Default: brand.colors.grey700
    "opacity": 0.5, //  Type: Float
    "cornerRadius": 6.0 // Type: Float  |   Default: brand.baseComponentStyling.cornerRadius
  },

  // Used for elements providing in-context information
  "tooltip": {
    "backgroundColor": "#282B2F", // Type: String  |  Default: brand.colors.grey700
    "textColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
    "cornerRadius": 6, // Type: Int  |   Default: brand.baseComponentStyling.cornerRadius
    "fontSize": 16, // Type: Int  |   Default: typography.body.fontSize
    "fontWeight": 500, // Type: Int  |   Default: typography.body.fontWeight
    "lineHeight": 22 // Type: Int  |   Default: typography.body.lineHeight
  },

  // Used for the document auto-capture and face scanning
  "feedbackBar": {
    "backgroundColor": "#282B2F", // Type: String  |  Default: brand.colors.grey700
    "textColor": "#F2F5F8", // Type: String  |  Default: brand.colors.grey200
    "cornerRadius": 6 // Type: Int  |   Default: brand.baseComponentStyling.cornerRadius
    "fontSize": 16, // Type: Int  |   Default: typography.body.fontSize
    "fontWeight": 500, // Type: Int  |   Default: typography.body.fontWeight
    "lineHeight": 22 // Type: Int  |   Default: typography.body.lineHeight
  }
}
```

**Notes on Customisation**

- The `appearance` JSON is passed to the native SDK (iOS: `setWhitelabel`, Android: `setConfiguration`) and merged with default styling.
- For Android, the `colors.xml` approach from v2 is deprecated; use the `appearance` JSON instead for consistent customization across platforms.
- Ensure the JSON is valid to avoid initialization errors (`INVALID_APPEARANCE`).
- A more detailed customization document can be found [on this Confluence page](https://ondato.atlassian.net/wiki/spaces/PUB/pages/3092938754/Mobile+SDK+Whitelabeling)

#### Illustrations

##### Android

You can override the default illustrations, icons, and Lottie animations by placing your own asset files in the appropriate resource directories of your bare React Native project. The Android build system will automatically prioritize your assets over the SDK's defaults, as long as the filenames are identical.

1.  Navigate to your Android resource directory at `android/app/src/main/res/`.
2.  To override standard images (like PNGs or XML Drawables), place your files in the `drawable` folder. If the folder doesn't exist, create it.
    - Example: To replace the close icon, add your custom file at `android/app/src/main/res/drawable/ondato_ic_close.xml`.
3.  To override Lottie animations, place your JSON animation files in the `raw` folder. If this folder doesn't exist, create it.
    - Example: To replace the face capture animation, add your file at `android/app/src/main/res/raw/face_capture.json`.

The following tables list the assets you can override.

**Standard Drawables (`/res/drawable`)**

| File name                      | Description                                            |
| :----------------------------- | :----------------------------------------------------- |
| `ondato_alert_triangle`        | Triangle next to `Please make sure` bullet points      |
| `ondato_ic_close`              | Close navigation icon in navigation top bar            |
| `ondato_ic_back`               | Back arrow in navigation top bar                       |
| `ondato_ic_interrupted`        | "X" shaped icon shown on an interruption screen        |
| `ondato_ic_camera`             | Camera icon next to a primary/secondary button text    |
| `ondato_arrow_right_circle`    | Document selection screen circled right arrow icon     |
| `ondato_ic_passport`           | Document selection screen passport type icon           |
| `ondato_ic_id`                 | Document selection screen ID card type icon            |
| `ondato_ic_driving_license`    | Document selection screen driving license type icon    |
| `ondato_ic_residence_permit`   | Document selection screen residence permit type icon   |
| `ondato_ic_success_new`        | Generic checkmark icon used for success screens        |
| `ondato_ic_error`              | Generic "X" shaped error icon used for failure screens |
| `ondato_ic_upload_icon`        | Proof-of-Address file upload icon                      |
| `ondato_ic_uploaded_file_icon` | Proof-of-Address icon when a file is selected          |

**Lottie Animations (`/res/raw`)**

| File name                       | Description                                              |
| :------------------------------ | :------------------------------------------------------- |
| `passport_main_page`            | Instructions animation for a passport                    |
| `id_front`                      | Instructions animation for an ID card front              |
| `id_back`                       | Instructions animation for an ID card back               |
| `residence_permit`              | Instructions animation for a residence permit front      |
| `driving_license`               | Instructions animation for a driving license front       |
| `document_back`                 | Instructions animation for a driving license back        |
| `face_capture`                  | Instructions animation for face authentication           |
| `face_with_document`            | Instructions animation for face with document capture    |
| `proof_of_address`              | Instructions animation for proof-of-address              |
| `document_card_front_animation` | Camera frame animation for ID card/driving license front |
| `document_card_back_animation`  | Camera frame animation for ID card/driving license back  |
| `passport_main_page_animation`  | Camera frame animation for a passport                    |
| `selfie_and_document`           | Camera frame animation for a selfie with document        |
| `waiting_page_animation`        | Animation shown in the identification waiting screen     |
| `small_spinner`                 | Animated bullet points in the waiting screen             |
| `modal_question`                | Question mark icon in confirmation pop-ups               |

> **⚠️ Important Note:** If you are overriding images with your own non-vector drawables (e.g., JPG or PNG files) and also using the `appearance` JSON for styling, you must set the corresponding `iconColor` property to `"none"` in your `appearance` configuration to prevent the SDK from trying to tint your custom image. Refer to the Ondato Android SDK documentation for a detailed example.

##### iOS

For a bare React Native project, you can override the default illustrations, icons, and animations by adding files with specific, conventional names to your Xcode project. The SDK will automatically detect and use your custom assets if they are present.

**1. For Images (PNG, etc.):**

- In Xcode, open your project's `Assets.xcassets` folder. This is the standard location for all image assets in an iOS project.
- Drag your custom image file(s) from Finder into the asset list.
- **Crucially, you must rename the asset in the Asset Catalog to match the "Conventional Filename" from the table below.** Select the image in the asset list and press Enter to rename it.

**2. For Lottie Animations (JSON):**

- In Xcode, drag your custom `.json` file from Finder directly into your main project folder in the Project Navigator (the same folder that contains your `AppDelegate.mm`).
- When the "Options" dialog appears, ensure that **"Copy items if needed"** and your app's main target are both checked.
- The filename must exactly match the conventional filename from the table (e.g., `ondato.animations.waitingScreenAnimation.json`).

**Asset Filename Conventions:**

The filename you use must exactly match one of the keys in the following tables. The dot-notation is intentional and required. For any asset you do not provide, the SDK's default will be used automatically.

**Images (to be placed in `Assets.xcassets`)**

| Conventional Asset Name                                                  | Description                                          |
| :----------------------------------------------------------------------- | :--------------------------------------------------- |
| **Simple Images**                                                        |                                                      |
| `ondato.images.backButton`                                               | The back navigation arrow.                           |
| `ondato.images.closeButton`                                              | The close 'X' icon.                                  |
| `ondato.images.warning`                                                  | The warning triangle icon.                           |
| **Document Selection Icons**                                             |                                                      |
| `ondato.images.documentImages.selectionCardIcons.passport`               | Icon for the Passport selection button.              |
| `ondato.images.documentImages.selectionCardIcons.idCard`                 | Icon for the ID Card selection button.               |
| `ondato.images.documentImages.selectionCardIcons.drivingLicence`         | Icon for the Driving License selection button.       |
| `ondato.images.documentImages.selectionCardIcons.residencePermit`        | Icon for the Residence Permit selection button.      |
| `ondato.images.documentImages.selectionCardIcons.internalPassport`       | Icon for the Internal Passport selection button.     |
| `ondato.images.documentImages.selectionCardIcons.socialIdentityCard`     | Icon for the Social ID Card selection button.        |
| **Document Capture Instructions**                                        |                                                      |
| `ondato.images.documentCaptureInstructions.passport.front`               | Image for Passport front instructions.               |
| `ondato.images.documentCaptureInstructions.passport.back`                | Image for Passport back instructions.                |
| `ondato.images.documentCaptureInstructions.passport.frontCover`          | Image for Passport front cover instructions.         |
| `ondato.images.documentCaptureInstructions.passport.dataPage`            | Image for Passport data page instructions.           |
| `ondato.images.documentCaptureInstructions.passport.blankPages`          | Image for Passport blank pages instructions.         |
| `ondato.images.documentCaptureInstructions.idCard.front`                 | Image for ID Card front instructions.                |
| `ondato.images.documentCaptureInstructions.idCard.back`                  | Image for ID Card back instructions.                 |
| `ondato.images.documentCaptureInstructions.drivingLicence.front`         | Image for Driving License front instructions.        |
| `ondato.images.documentCaptureInstructions.drivingLicence.back`          | Image for Driving License back instructions.         |
| `ondato.images.documentCaptureInstructions.residencePermit.front`        | Image for Residence Permit front instructions.       |
| `ondato.images.documentCaptureInstructions.residencePermit.back`         | Image for Residence Permit back instructions.        |
| `ondato.images.documentCaptureInstructions.internalPassport.front`       | Image for Internal Passport front instructions.      |
| `ondato.images.documentCaptureInstructions.internalPassport.back`        | Image for Internal Passport back instructions.       |
| `ondato.images.documentCaptureInstructions.socialIdentityCard.front`     | Image for Social ID Card front instructions.         |
| `ondato.images.documentCaptureInstructions.socialIdentityCard.back`      | Image for Social ID Card back instructions.          |
| **Additional Document Instructions**                                     |                                                      |
| `ondato.images.additionalDocumentCaptureInstructions.proofOfAddress`     | Image for Proof of Address instructions.             |
| `ondato.images.additionalDocumentCaptureInstructions.selfieWithDocument` | Image for Selfie with Document instructions.         |
| **Face Capture Instructions**                                            |                                                      |
| `ondato.images.faceCaptureInstructions.activeLiveness`                   | Image for Active Liveness instructions.              |
| `ondato.images.faceCaptureInstructions.passiveLiveness`                  | Image for Passive Liveness (selfie) instructions.    |
| `ondato.images.faceCaptureInstructions.faceAuth`                         | Image for Face Authentication instructions.          |
| **NFC Instructions**                                                     |                                                      |
| `ondato.images.nfcCaptureInstructions.passport.mrz`                      | Image for Passport MRZ scanning (NFC flow).          |
| `ondato.images.nfcCaptureInstructions.passport.nfc`                      | Image for Passport NFC chip scanning.                |
| `ondato.images.nfcCaptureInstructions.idCard.mrz`                        | Image for ID Card MRZ scanning (NFC flow).           |
| `ondato.images.nfcCaptureInstructions.idCard.nfc`                        | Image for ID Card NFC chip scanning.                 |
| `ondato.images.nfcCaptureInstructions.drivingLicence.mrz`                | Image for Driving License MRZ scanning (NFC flow).   |
| `ondato.images.nfcCaptureInstructions.drivingLicence.nfc`                | Image for Driving License NFC chip scanning.         |
| `ondato.images.nfcCaptureInstructions.residencePermit.mrz`               | Image for Residence Permit MRZ scanning (NFC flow).  |
| `ondato.images.nfcCaptureInstructions.residencePermit.nfc`               | Image for Residence Permit NFC chip scanning.        |
| `ondato.images.nfcCaptureInstructions.internalPassport.mrz`              | Image for Internal Passport MRZ scanning (NFC flow). |
| `ondato.images.nfcCaptureInstructions.internalPassport.nfc`              | Image for Internal Passport NFC chip scanning.       |
| `ondato.images.nfcCaptureInstructions.socialIdentityCard.mrz`            | Image for Social ID Card MRZ scanning (NFC flow).    |
| `ondato.images.nfcCaptureInstructions.socialIdentityCard.nfc`            | Image for Social ID Card NFC chip scanning.          |

**Lottie Animations (to be added to the main project folder)**

| Filename                                        | Description                                          |
| :---------------------------------------------- | :--------------------------------------------------- |
| `ondato.animations.waitingScreenAnimation.json` | Lottie file for the final processing/waiting screen. |

#### Fonts

You can override the default fonts used for different text styles within the SDK. The configuration is platform-specific to handle the differences between Android and iOS.

##### Android

Applying custom fonts is a two-step process.

**Step 1: Add Font Files to Your Project**

1.  If it does not already exist, create a `font` resource directory in your Android project at `android/app/src/main/res/font`.
2.  Copy your custom font files (e.g., `.ttf` or `.otf`) into this new `font` directory.
3.  **Important:** Android requires font filenames to be lowercase and use underscores instead of spaces or dashes (e.g., `my_app_font_bold.ttf`, `roboto_regular.otf`).

**Step 2: Configure Fonts in JavaScript**

In your `startIdentification` call, provide a `fonts` object with an `android` key. The value should be an object where keys represent the text style you want to override, and the values are **strings** matching the font filename **without the extension**.

```tsx
import { startIdentification } from 'ondato-sdk-react-native';

await startIdentification({
  identityVerificationId: '<YOUR_ID>',
  // ... other config
  fonts: {
    android: {
      title: 'my_app_font_bold', // Will load R.font.my_app_font_bold
      subtitle: 'my_app_font_medium',
      body: 'my_app_font_regular',
      button: 'my_app_font_medium',
      // Any omitted keys will use the SDK's default font.
    },
  },
});
```

**Supported Keys for `android`:**

| Key          | Description                                     |
| :----------- | :---------------------------------------------- |
| `title`      | For `h1` level headings.                        |
| `subtitle`   | For `h2` level headings.                        |
| `body`       | For all other standard text (paragraphs, etc.). |
| `list`       | For bullet point list items.                    |
| `button`     | For text inside buttons.                        |
| `inputLabel` | For labels on text input fields.                |

##### iOS

Applying custom fonts on iOS is a four-step process due to the way iOS handles font discovery and loading.

**Step 1: Add Font Files to Your Xcode Project**

1.  In Xcode, drag your font files (e.g., `MyAppFont-Regular.ttf`, `MyAppFont-Bold.otf`) from Finder directly into your main project folder in the Project Navigator.
2.  When the "Options" dialog appears, ensure that **"Copy items if needed"** and your app's main target are both checked.

**Step 2: Register the Fonts in `Info.plist`**

1.  In Xcode, open your project's `Info.plist` file.
2.  Add a new key called **`Fonts provided by application`** (or `UIAppFonts` if viewing the raw keys).
3.  This key is an array. For each font file you added, create a new item in this array and set its value to the **full filename** (e.g., `MyAppFont-Regular.ttf`).

**Step 3: Find the Font's PostScript Name**

iOS does not load fonts by their filename, but by their internal **PostScript name**. You must find the correct name for each font you want to use.

- **How to find the PostScript name:** Install the font on your Mac, open the **Font Book** application, select the font, and press **Command+I** (or go to `File > Get Info`). The "PostScript name" is listed there. It often differs from the filename.

**Step 4: Configure Fonts in JavaScript**

In your `startIdentification` call, provide a `fonts` object with an `ios` key. The value should be an object where keys represent the text style. The value for each style is another object that must contain the `postScriptName` and can optionally include `size` and `weight`.

```tsx
import { startIdentification } from 'ondato-sdk-react-native';

await startIdentification({
  identityVerificationId: '<YOUR_ID>',
  // ... other config
  fonts: {
    ios: {
      title: {
        postScriptName: 'MyAppFont-Bold', // The name from Font Book
        size: 24,
      },
      subtitle: {
        postScriptName: 'MyAppFont-Bold',
        size: 18,
      },
      body: {
        postScriptName: 'MyAppFont-Regular',
        size: 16,
        weight: 'regular', // Explicitly set the weight
      },
      button: {
        postScriptName: 'MyAppFont-Bold',
        size: 16,
      },
      // Any omitted keys will use the SDK's default font.
    },
  },
});
```

**Supported Keys for `ios`:**

| Key        | Description                                     |
| :--------- | :---------------------------------------------- |
| `title`    | For `h1` level headings (maps to `heading1`).   |
| `subtitle` | For `h2` level headings (maps to `heading2`).   |
| `body`     | For all other standard text (maps to `normal`). |
| `list`     | For bullet point list items.                    |
| `button`   | For text inside buttons.                        |

**`IosFont` Object Properties:**

| Property         | Type     | Required | Description                                                                                                                                                    |
| :--------------- | :------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `postScriptName` | `string` | **Yes**  | The PostScript name of the font.                                                                                                                               |
| `size`           | `number` | No       | The font size. If omitted, a default size will be used.                                                                                                        |
| `weight`         | `string` | No       | The font weight. Accepts: `'ultralight'`, `'thin'`, `'light'`, `'regular'`, `'medium'`, `'semibold'`, `'bold'`, `'heavy'`, `'black'`. Defaults to `'regular'`. |

#### Localisation

Ondato SDK comes with out-of-the-box translations for the following locales:

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
- Catalan (ca) 🇪🇸
- Croatian (hr) 🇭🇷
- Czech (cs) 🇨🇿
- Finnish (fi) 🇫🇮
- Hungarian (hu) 🇭🇺
- Polish (pl) 🇵🇱
- Portuguese (pt) 🇵🇹🇧🇷
- Slovak (sk) 🇸🇰
- Slovenian (sl) 🇸🇮
- Swedish (sv) 🇸🇪
- Ukrainian (uk) 🇺🇦
- Vietnamese (vi) 🇻🇳

You can also **provide your own translations** by overriding Ondato's string keys in your platform-specific resources.

#### Overriding Translations

##### Android

You can override any string by adding it to your application's `strings.xml` file. The Android build system will automatically use your string instead of the SDK's default.

1.  Open or create the file `android/app/src/main/res/values/strings.xml`.
2.  Add a `<string>` element with the `name` attribute matching the key you want to override.

For example, to change the "Passport Instructions" heading in the default language:

```xml
<!-- android/app/src/main/res/values/strings.xml -->
<resources>
    <!-- Your other app strings -->
    <string name="Document_Instructions_Passport_DataPage_Heading">Your Custom Passport Instructions</string>
</resources>
```

To find the full list of available string keys that you can override, please refer to the example application `strings.xml` file in `example/android/app/src/main/res/values-de-rDE`.

To provide translations for a specific language, create a corresponding resource directory (e.g., `values-de-rDE` for German) and add a `strings.xml` file there. When you set the `language` property in the `startIdentification` configuration, the SDK will look for resources in the matching directory.

The following resource directories are available for localization:

- `values` (Default)
- `values-bg-rBG` (Bulgarian)
- `values-ca-rES` (Catalan)
- `values-cs-rCZ` (Czech)
- `values-de-rDE` (German)
- `values-el-rGR` (Greek)
- `values-es-rES` (Spanish)
- `values-et-rEE` (Estonian)
- `values-fi-rFI` (Finnish)
- `values-fr-rFR` (French)
- `values-hr-rHR` (Croatian)
- `values-hu-rHU` (Hungarian)
- `values-it-rIT` (Italian)
- `values-lt-rLT` (Lithuanian)
- `values-lv-rLV` (Latvian)
- `values-nl-rNL` (Dutch)
- `values-pl-rPL` (Polish)
- `values-pt-rBR` (Portuguese - Brazil)
- `values-ro-rRO` (Romanian)
- `values-ru-rRU` (Russian)
- `values-sk-rSK` (Slovak)
- `values-sl-rSI` (Slovenian)
- `values-sq-rAL` (Albanian)
- `values-sv-rSE` (Swedish)
- `values-uk-rUA` (Ukrainian)
- `values-vi-rVN` (Vietnamese)

For example, to provide a German translation, you would create the following file:

```xml
<!-- android/app/src/main/res/values-de-rDE/strings.xml -->
<resources>
    <string name="Document_Instructions_Passport_DataPage_Heading">Ihre benutzerdefinierten Passanweisungen</string>
</resources>
```

##### iOS

You can override the default translations on iOS by providing a custom `.strings` file in your application's main bundle. The library will automatically detect and apply the correct translations based on the `language` you pass to the `startIdentification` function (or English, if none is provided).

1.  **Create a strings file named `OndatoSDK.strings`** in your Xcode project. To do this, go to `File > New > File...` in Xcode and select the "Strings File" template.

2.  **Enable Localization for the file.** Select your new `OodatoSDK.strings` file in the Project Navigator to show the File Inspector on the right-hand side. In the "Localization" section, ensure that the file is enabled for your default language (e.g., English). If the file is not yet localized, you may need to add it to your project's localizations. This action places your file inside a language-specific folder (e.g., `en.lproj`).

3.  **Add translations for other languages.** In your project's settings, go to the "Info" tab and add any other languages you wish to support under the "Localizations" section. When you add a new language, Xcode will ask which resource files to create variants for; make sure to check the box for `OndatoSDK.strings`.

4.  **Add your custom strings.** Open the `OndatoSDK.strings` file for each language and add the key-value pairs for the text you want to override.

    For example, to provide a custom German translation for the passport instructions:

    ```swift
    // In your project's de.lproj/OndatoSDK.strings file
    "Document_Instructions_Passport_DataPage_Heading" = "Ihre benutzerdefinierten Passanweisungen";
    ```

    And a custom Spanish translation:

    ```swift
    // In your project's es.lproj/OndatoSDK.strings file
    "Document_Instructions_Passport_DataPage_Heading" = "Sus instrucciones de pasaporte personalizadas";
    ```

**That's it!** You do not need to pass any extra parameters in your JavaScript code. The library will automatically find and apply your custom translations.

To find the full list of available string keys to override, please refer to the [official Ondato iOS SDK documentation](https://gitlab.com/ondato/ondato-sdk-ios/-/tree/main?ref_type=heads) or their example project files.

### Optional Features

#### Adding Screen Recorder and/or NFC Support

##### Android

1.  Add the Ondato maven repositories to your project-level `android/build.gradle` file (skip this step for beta releases):
    ```groovy
    allprojects {
      repositories {
        // ... other repositories
        maven { url "https://gitlab.com/api/v4/projects/65297321/packages/maven" }
        maven { url "https://raw.githubusercontent.com/ondato/ondato-sdk-android/main/repos" }
      }
    }
    ```
2.  Add the required dependencies to your app-level `android/app/build.gradle` file:
    ```groovy
    dependencies {
      // ... other dependencies
      implementation("com.kyc.ondato:screen-recorder:3.2.1")
      // and/or
      implementation("com.kyc.ondato:nfc-reader:3.2.1")
      // and/or
      implementation("com.kyc.ondato:document-autoresolver:3.2.1")
    }
    ```
3.  Permissions are handled automatically via Manifest Merge.

##### iOS

1.  Add the relevant pods to your `Podfile`:
    ```ruby
    # Podfile
    pod 'OndatoNFC', '= 3.2.0'
    # and/or
    pod 'OndatoScreenRecorder', '= 3.2.0'
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
import {
  startIdentification,
  OndatoResult,
  getLogs,
} from 'ondato-sdk-react-native';

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
        language: 'en', // optional: bg, ca, cs, de, el, en, es, et, fi, fr, hr, hu, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sq, sv, uk, vi
        logLevel: 'debug', // 'error', 'info' or 'debug'
        switchPrimaryButtons: false, // iOS and Android
        enableNetworkIssuesScreen: true, // iOS and Android
        disablePdfFileUpload: false, // iOS and Android
        skipRegistrationIfDriverLicense: false, // iOS only
        showTranslationKeys: false, // iOS only
        appearance: {
          /* whitelabel JSON object, see Customization > Styling */
        },
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
    } finally {
      // Retrieve and log the SDK session logs
      const logs = getLogs();
      console.log('SDK Logs:', logs);
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
    backgroundColor: '#64749c',
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

The `startIdentification` function accepts a single configuration object. There is also a `getLogs` function to retrieve logs.

### Configuration Options

| Property                          | Type                               | Default      | Platform | Description                                                               |
| --------------------------------- | ---------------------------------- | ------------ | -------- | ------------------------------------------------------------------------- |
| **`identityVerificationId`**      | `string`                           | _(Required)_ | All      | The unique ID for the verification session, obtained from the Ondato API. |
| `mode`                            | `'test'` \| `'live'`               | `'test'`     | All      | Sets the SDK environment.                                                 |
| `language`                        | `string`                           | `'en'`       | All      | Sets the localization for the SDK (e.g., 'bg', 'ca', 'cs', etc.).         |
| `logLevel`                        | `'error'` \| `'info'` \| `'debug'` | `'info'`     | All      | Sets the verbosity of logs. See [Logging](#logging) for details.          |
| `switchPrimaryButtons`            | `boolean`                          | `false`      | All      | Switches primary buttons if true.                                         |
| `enableNetworkIssuesScreen`       | `boolean`                          | `true`       | All      | Enables network issues screen if true.                                    |
| `disablePdfFileUpload`            | `boolean`                          | `false`      | All      | Disables PDF file upload if true.                                         |
| `skipRegistrationIfDriverLicense` | `boolean`                          | `false`      | iOS      | Skips registration if driver's license is used.                           |
| `showTranslationKeys`             | `boolean`                          | `false`      | iOS      | Shows translation keys if true.                                           |
| `appearance`                      | `object`                           | `{}`         | All      | An object to customize the colors, fonts, and styles of the UI.           |

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

### Platform-Specific Error Codes

- **iOS**: `CANCELLED`, `CONSENT_DENIED`, `INVALID_SERVER_RESPONSE`, `INVALID_CREDENTIALS`, `RECORDER_PERMISSIONS`, `UNEXPECTED_INTERNAL_ERROR`, `VERIFICATION_FAILED`, `NFC_NOT_SUPPORTED`, `MISSING_MODULE`, `HOST_CANCELED`, `UNKNOWN_ERROR`.
- **Android**: `CANCELED`, `BAD_SERVER_RESPONSE`, `NFC_NOT_SUPPORTED`, `TOO_MANY_ATTEMPTS`, `NO_AVAILABLE_DOCUMENT_TYPES`, `UNKNOWN`.

### Logging

The SDK supports configurable logging levels to help with debugging and troubleshooting. Set the `logLevel` option ('error', 'info', or 'debug') when calling `startIdentification` to control the verbosity of logs generated during the identification process.

Logging behavior differs between Android and iOS due to platform-specific implementations:

#### Android

- `'error'`: Logs only application crashes and unexpected behavior from API calls or the flow itself.
- `'info'` (default): Includes general operational messages such as SDK config parameters, setup parameters, build version, and device details, plus everything from `'error'`.
- `'debug'`: Adds more detailed information useful for debugging, such as API call requests and responses, verification flow steps, and device system actions, plus everything from `'info'` and `'error'`.

Logs on Android always include "OndatoSDK" as the emitter type for easier filtering.

#### iOS

- `'info'` (default): Logs info about the OndatoSDK build version, device OS/brand/model, session ID, and OndatoFlowConfiguration settings.
- `'debug'`: Includes everything from `'info'`, plus debug details about API requests and responses, flow steps, and device state (e.g., moved to background).
- `'error'`: Includes everything from `'info'` and `'debug'`, plus error details about screen recording problems, unsuccessful API calls, and other errors.

To retrieve the logs, call `getLogs()`, which returns a newline-separated string of log entries:

```tsx
import { getLogs } from 'ondato-sdk-react-native';

const logs = getLogs(); // Returns a newline-separated string of logs
console.log('SDK Logs:', logs);
```

## Support

For any questions, queries or additional information please contact Ondato support team at [support@ondato.com](mailto:support@ondato.com) and the support team will get back to you as soon as possible.

You can also find publicly available documentation about Ondato products including the SDK at the [Confluence page](https://ondato.atlassian.net/wiki/spaces/PUB/overview?homepageId=2217672768).

We recommend to have the latest SDK version integrated within your apps so that you could get the newest features, performance improvements, bugfixes and more. You can subscribe to the SDK releases on Github so that you could be notified when a new release has been published and what changes it includes.

## Contributing

- [Development Workflow](CONTRIBUTING.md#development-workflow)
- [Sending a Pull Request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## License

MIT
