export const defaultCustomization: Types.SimpleCustomization = {
  primaryColor: '#fd5a28',
  textColor: '#000000',
  buttonTextColor: '#ffffff',
};

export const getAndroidCustomization = (
  customization?: Types.SimpleCustomization
): Types.AndroidCustomization => {
  if (!customization) {
    customization = defaultCustomization;
  }

  return {
    // Ondato's Status Bar
    ondatoColorPrimaryDark: defaultCustomization.primaryColor,

    // Ondato's Primary and Accent Colors
    ondatoColorPrimary: defaultCustomization.primaryColor,
    ondatoColorAccent: defaultCustomization.primaryColor,

    // Ondato's Text Colors
    ondatoTextColor: customization.textColor,
    ondatoSecondaryTextColor: '#244D50',

    // Ondato's Primary Button with Gradient colors
    ondatoColorButton: defaultCustomization.primaryColor,
    ondatoColorButtonFocusedStart: '#fd5a28',
    ondatoColorButtonFocusedCenter: '#FF8000',
    ondatoColorButtonFocusedEnd: '#FF9700',
    ondatoColorButtonText: customization.buttonTextColor,

    // Ondato's Outlined Button Colors
    ondatoOutlinedButtonColor: '#fd5a28',
    ondatoOutlinedButtonTextColor: '#fd5a28',

    ondatoColorBackground: customization.buttonTextColor,

    // Ondato's Illustration Colors
    ondatoIconColor: '#fd5a28',

    // Ondato's Active Liveness Screen Colors
    ondatoActiveLivenessOvalProgressColor: '#FF5A28',
    ondatoActiveLivenessOvalProgressColorSecondary: '#FF5A28',
    ondatoActiveLivenessResultActivityIndicatorColor: '#FF5A28',
    ondatoActiveLivenessResultAnimationBackgroundColor: '#FF5A28',
    ondatoActiveLivenessResultUploadProgressColor: '#FF5A28',
    ondatoActiveLivenessResultAnimationForegroundColor: '#FF5A28',
    ondatoActiveLivenessResultUploadProgressTrackColor: '#FF5A28',
    ondatoActiveLivenessResultForegroundColor: '#FF5A28',
    ondatoActiveLivenessCameraFilter: '#fff',

    // Used for Active Liveness Screen Buttons
    ondatoDisabledButtonColor: '#FAB2A5',
    ondatoHighlightButtonColor: '#b02e16',

    // Ondato's Error Colors
    ondatoColorErrorBg: '#fd5a28',
    ondatoColorErrorText: customization.buttonTextColor,

    // Other
    ondatoColorSeparatorColor: '#e5e6e7',
    ondatoColorAlmostTransparent: '#70ffffff',
    ondatoColorAlmostTransparent2: '#CCFFFFFF',
    ondatoColorLanguagesBorder: '#E2E2E2',
    ondatoColorCameraFilter: '#65000000',
    ondatoInputTextBorderColor: '#808080',
  };
};

export const getIOSCustomization = (
  customization?: Types.SimpleCustomization
): Types.IOSCustomization => {
  if (!customization) {
    customization = defaultCustomization;
  }

  return {
    progressColor: customization.primaryColor,
    errorColor: customization.primaryColor,
    errorTextColor: customization.buttonTextColor,
    buttonColor: customization.primaryColor,
    buttonTextColor: customization.buttonTextColor,
    textColor: customization.textColor,
    backgroundColor: customization.buttonTextColor,
    imageTintColor: customization.primaryColor,
    consentWindow: {
      acceptButton: {
        font: {
          name: 'default',
          weight: 'regular',
          size: 15,
        },
        backgroundColor: customization.primaryColor,
        tintColor: '#ffffff',
        borderWidth: 0,
        borderColor: customization.primaryColor,
        cornerRadius: 25,
      },
      declineButton: {
        font: {
          name: 'default',
          weight: 'regular',
          size: 15,
        },
        backgroundColor: '#ffffff',
        tintColor: customization.primaryColor,
        borderWidth: 2,
        borderColor: customization.primaryColor,
        cornerRadius: 25,
      },
      header: {
        color: customization.textColor,
        font: {
          name: 'default',
          weight: 'semibold',
          size: 18,
        },
      },
      body: {
        textColor: customization.textColor,
        font: {
          name: 'default',
          weight: 'regular',
          size: 15,
        },
      },
    },
  };
};
