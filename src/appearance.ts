import { merge, cloneDeep } from 'lodash';

export const defaultAppearance = {
  // Whitelabeling guide can be found here - https://ondato.atlassian.net/wiki/x/AoBau?atlOrigin=eyJpIjoiMjIxZDYzZDNmZDVjNGY2MGFhOTliYmRjNDVkN2E1ODAiLCJwIjoiYyJ9
  // CORE STYLING
  brand: {
    colors: {
      primaryColor: '#64749c', // Primary brand color - used in illustration and primary button

      textColor: '#000000', // Text color for content
      backgroundColor: '#FFFFFF', // Base background color for screens

      danger: '#D04555', // Color for error states and messages
      warning: '#F9BB42', // Color for warning elements
      success: '#28865A', // Color for success elements

      grey100: '', // Currently not used
      grey200: '#F2F5F8', // Button Disabled state background, Text input readonly background
      grey300: '', // Currently not used
      grey400: '#BEC6D0', // Color for input element border color, also used in Text input
      grey500: '#96A0AE', // Color for "Select card" icon, Proof of Address upload element border, Text input disabled state text color
      grey600: '#6D7580', // Color for Proof of Address icon color, Text input Active state border
      grey700: '#282B2F', // Color for feedback bar background color

      statusBarColor: '#64749c', // Default: brand.colors.primaryColor
    },

    baseComponentStyling: {
      cornerRadius: 6, // Used for all input components (Buttons, Text inputs and other elements)
      buttonPadding: { top: 14, bottom: 14, left: 24, right: 24 }, // Used for Primary and Secondary button paddings
      borderWidth: 1.0, // Used for Secondary button, Text input, Selection button border
    },

    typography: {
      heading1: {
        fontSize: 24,
        fontWeight: 500,
        lineHeight: 32,
        alignment: 'center',
        color: '#000000', // Type: String  |  Default: brand.colors.textColor
      },
      heading2: {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 18,
        alignment: 'center',
        color: '#000000', // Type: String  |  Default: brand.colors.textColor
      },
      body: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 18,
        alignment: 'center',
        color: '#000000', // Type: String  |  Default: brand.colors.textColor
      },
      list: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 18,
        color: '#000000', // Type: String  |  Default: brand.colors.textColor
      },
      inputLabel: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 18,
        color: '#000000', // Type: String  |  Default: brand.colors.textColor
      },
      button: {
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 18,
        color: '#000000', // Type: String  |  Default: brand.colors.textColor
      },
    },
  },

  // Primary and secondary button options
  buttons: {
    primary: {
      base: {
        cornerRadius: 6, // Default: brand.baseComponentStyling.cornerRadius
        padding: { top: 14, bottom: 14, left: 24, right: 24 }, // Default: brand.baseComponentStyling.buttonPadding

        fontSize: 16, // Type: Int  |   Default: typography.button.fontSize
        fontWeight: 500, // Type: Int  |   Default: typography.button.fontWeight
        lineHeight: 18, // Type: Int  |   Default: typography.button.lineHeight
        showIcon: false, // Type: Boolean
      },
      normal: {
        textColor: '#000000', // Type: String  |  Default: brand.colors.textColor
        backgroundColor: '#64749c', // Type: String  |  Default: brand.colors.primaryColor
        borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        borderColor: '#64749c', // Type: String  |  Default: colors.primaryColor
        iconColor: '#000000', // Type: String  |  Default: colors.textColor
        opacity: 1.0, // Type: Float
      },
      pressed: {
        textColor: '#000000', // Type: String  |  Default: brand.colors.textColor
        backgroundColor: '#64749c', // Type: String  |  Default: brand.colors.primaryColor
        borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        borderColor: '#64749c', // Type: String  |  Default: colors.primaryColor
        iconColor: '#000000', // Type: String  |  Default: colors.textColor
        opacity: 0.8, // Type: Float
      },
      disabled: {
        textColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
        backgroundColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderWidth: 1, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        borderColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        iconColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
        opacity: 1.0, // Type: Float
      },
    },

    secondary: {
      base: {
        cornerRadius: 6, // Default: brand.baseComponentStyling.cornerRadius
        padding: { top: 14, bottom: 14, left: 24, right: 24 }, // Default: brand.baseComponentStyling.buttonPadding

        fontSize: 16, // Type: Int  |   Default: typography.button.fontSize
        fontWeight: 500, // Type: Int  |   Default: typography.button.fontWeight
        lineHeight: 18, // Type: Int  |   Default: typography.button.lineHeight
        showIcon: false, // Type: Boolean
      },
      normal: {
        textColor: '#000000', // Type: String  |  Default: brand.colors.textColor
        backgroundColor: '#FFFFFF', // Default -  colors.backgroundColor
        borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        borderColor: '#BEC6D0', // Type: String  |  Default: brand.colors.grey400
        iconColor: '#000000', // Type: String  |  Default: brand.colors.textColor
        opacity: 1.0, // Type: Float
      },
      pressed: {
        textColor: '#000000', // Type: String  |  Default: brand.colors.textColor
        backgroundColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        borderColor: '#6D7580', // Type: String  |  Default: brand.colors.grey600
        iconColor: '#000000', // Type: String  |  Default: brand.colors.textColor
        opacity: 1.0, // Type: Float
      },
      disabled: {
        textColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
        backgroundColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
        borderColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        iconColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
        opacity: 1.0, // Type: Float
      },
    },

    // Icon buttons (e.g. in proof-of-address upload screen) customisation
    iconButton: {
      base: {
        cornerRadius: 6, // Default: brand.baseComponentStyling.cornerRadius
      },
      normal: {
        iconColor: '#000000', // Type: String  |  Default: brand.colors.textColor
        backgroundColor: '#FFFFFF', // Type: String  |  Default: brand.colors.backgroundColor
        borderColor: '#FFFFFF', // Type: String  |  Default: brand.colors.backgroundColor
        borderWidth: 0, // Type: Float  |  Default: brand.baseComponentStyling.borderWidth
      },
      pressed: {
        iconColor: '#000000', // Type: String  |  Default: brand.colors.textColor
        backgroundColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderWidth: 0, // Type: Float  |  Default: brand.baseComponentStyling.borderWidth
      },
      disabled: {
        iconColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
        backgroundColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderWidth: 0, // Type: Float  |  Default: brand.baseComponentStyling.borderWidth
      },
    },

    // Back and close navigation buttons customisation
    navigationButton: {
      base: {
        cornerRadius: 6, // Default: brand.baseComponentStyling.cornerRadius
      },
      normal: {
        iconColor: '#000000', // Type: String  |  Default: brand.colors.textColor
        backgroundColor: '#FFFFFF', // Type: String  |  Default: brand.colors.backgroundColor
        borderColor: '#FFFFFF', // Type: String  |  Default: brand.colors.backgroundColor
        borderWidth: 0, // Type: Float  |  Default: brand.baseComponentStyling.borderWidth
      },
      pressed: {
        iconColor: '#000000', // Type: String  |  Default: brand.colors.textColor
        backgroundColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderWidth: 0, // Type: Float  |  Default: brand.baseComponentStyling.borderWidth
      },
      disabled: {
        iconColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
        backgroundColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
        borderWidth: 0, // Type: Float  |  Default: bbrand.baseComponentStyling.borderWidth
      },
    },
  },

  // Customisation options for all text types in the SDK
  textInput: {
    base: {
      cornerRadius: 6, // Type: Float  |   Default: brand.baseComponentStyling.cornerRadius
      padding: { top: 14, bottom: 14, left: 24, right: 24 }, // Default: brand.baseComponentStyling.buttonPadding

      fontSize: 16, // Type: Int  |   Default: typography.body.fontSize
      fontWeight: 500, // Type: Int  |   Default: typography.body.fontWeight
      lineHeight: 22, // Type: Int  |   Default: typography.body.lineHeight

      placeholderTextColor: '#BEC6D0', //Type: String  |  Default: brand.colors.grey400
    },

    normal: {
      textColor: '#000000', // Type: String  |  Default: brand.colors.textColor
      backgroundColor: '#FFFFFF', // Type: String  |   Default: brand.colors.backgroundColor
      borderColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
      borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
    },
    selected: {
      textColor: '#000000', // Type: String  |  Default: brand.colors.textColor
      backgroundColor: '#FFFFFF', // Type: String  |   Default: brand.colors.backgroundColor
      borderColor: '#6D7580', // Type: String  |  Default: brand.colors.grey600
      borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
    },
    disabled: {
      textColor: '#BEC6D0', // Type: String  |  Default: brand.colors.grey400
      backgroundColor: '#FFFFFF', // Type: String  |  Default: brand.colors.backgroundColor
      borderColor: '#BEC6D0', // Type: String  |  Default: brand.colors.grey400
      borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
    },
    readOnly: {
      textColor: '#6D7580', // Type: String  |  Default: brand.colors.grey600
      backgroundColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
      borderColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
      borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
    },
    error: {
      textColor: '#D04555', // Type: String  |  Default: brand.colors.danger
      borderColor: '#D04555', // Type: String  |  Default: brand.colors.danger
      borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
      backgroundColor: '#FFFFFF', // Type: String  |   Default: brand.colors.backgroundColor
    },
  },

  // Used for tinkering the document selection card UI
  selectionCard: {
    base: {
      cornerRadius: 6, // Type: Float  |   Default: brand.baseComponentStyling.cornerRadius

      fontSize: 16, // Type: Int  |   Default: typography.body.fontSize
      fontWeight: 500, // Type: Int  |   Default: typography.body.fontWeight
      lineHeight: 22, // Type: Int  |   Default: typography.body.lineHeight
    },
    normal: {
      textColor: '#000000', // Type: String  |  Default: brand.colors.textColor
      backgroundColor: '#FFFFFF', // Type: String  |  Default: brand.colors.backgroundColor
      borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
      borderColor: '#BEC6D0', // Type: String  |  Default: brand.colors.grey400
      leftIconColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
      rightIconColor: '#000000', // Type: String  |  Default: brand.colors.textColor
    },
    pressed: {
      textColor: '#000000', // Type: String  |  Default: brand.colors.textColor
      backgroundColor: '#F2F5F8', // Type: String  |   Default: brand.colors.grey200
      borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
      borderColor: '#BEC6D0', // Type: String  |  Default: brand.colors.grey400
      leftIconColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
      rightIconColor: '#000000', // Type: String  |  Default: brand.colors.textColor
    },
    disabled: {
      textColor: '#BEC6D0', // Type: String  |  Default: brand.colors.grey400
      backgroundColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
      borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
      borderColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
      leftIconColor: '#BEC6D0', // Type: String  |  Default: brand.colors.grey400
      rightIconColor: '#BEC6D0', // Type: String  |  Default: brand.colors.grey400
    },
  },

  // Used for changing the colour of the loading indicator
  activityIndicator: {
    color: '#64749c', // Type: String  |  Default: brand.colors.primaryColor
  },

  // Used for customising the face authorisation screen frame and feedback bar
  faceScanUI: {
    frame: {
      borderColor: '#282B2F', // Type: String  |  Default: brand.colors.grey700
      borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
      progressColor: '#64749c', // Type: String  |  Default: brand.colors.primaryColor
    },
    feedbackBar: {
      backgroundColor: '#282B2F', // Type: String  |  Default: brand.colors.grey700
      textColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
      cornerRadius: 6, // Type: Float  |   Default: brand.baseComponentStyling.cornerRadius
    },
  },

  // Used for customising the proof-of-address document upload screen
  documentUploadConfiguration: {
    borderColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
    borderWidth: 1.0, // Type: Float   |  Default: brand.baseComponentStyling.borderWidth
    cornerRadius: 6.0, // Type: Float  |   Default: brand.baseComponentStyling.cornerRadius

    fileDescriptionTextColor: '#96A0AE', // Type: String  |  Default: brand.colors.grey500
    fileIconColor: '#6D7580', // Type: String  |  Default: brand.colors.grey600

    uploadAreaBackgroundOpacity: 0,
    uploadAreaBackgroundColor: '#FFFFFF', // Type: String  |  Default: brand.colors.backgroundColor
  },

  // Used for customising the camera overlay
  cameraScreenConfiguration: {
    backgroundColor: '#282B2F', // Type: String  |  Default: brand.colors.grey700
    opacity: 0.5, //  Type: Float
    cornerRadius: 6.0, // Type: Float  |   Default: brand.baseComponentStyling.cornerRadius
  },

  // Used for elements providing in-context information
  tooltip: {
    backgroundColor: '#282B2F', // Type: String  |  Default: brand.colors.grey700
    textColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
    cornerRadius: 6, // Type: Int  |   Default: brand.baseComponentStyling.cornerRadius
    fontSize: 16, // Type: Int  |   Default: typography.body.fontSize
    fontWeight: 500, // Type: Int  |   Default: typography.body.fontWeight
    lineHeight: 22, // Type: Int  |   Default: typography.body.lineHeight
  },

  // Used for the document auto-capture and face scanning
  feedbackBar: {
    backgroundColor: '#282B2F', // Type: String  |  Default: brand.colors.grey700
    textColor: '#F2F5F8', // Type: String  |  Default: brand.colors.grey200
    cornerRadius: 6, // Type: Int  |   Default: brand.baseComponentStyling.cornerRadius
    fontSize: 16, // Type: Int  |   Default: typography.body.fontSize
    fontWeight: 500, // Type: Int  |   Default: typography.body.fontWeight
    lineHeight: 22, // Type: Int  |   Default: typography.body.lineHeight
  },
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Appearance = typeof defaultAppearance;

export type OptionalAppearance = DeepPartial<Appearance>;

export function mergeAppearance(partial: OptionalAppearance): Appearance {
  return merge(cloneDeep(defaultAppearance), partial);
}
