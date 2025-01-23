import { ViewStyle } from 'react-native';

declare global {
  namespace Types {
    type OndatoSdkStatus =
      | 'Dormant'
      | 'Ready'
      | 'Succeeded'
      | 'Failed'
      | 'Cancelled'
      | 'Unknown';

    type OndatoSdkLoad = {
      identificationId: string;
    };

    type OndatoSdkStateRaw = {
      status: OndatoSdkStatus;
      message?: string;
      load?: string;
    };

    type OndatoSdkState = {
      status: OndatoSdkStatus;
      message?: string;
      load?: OndatoSdkLoad;
    };

    type OndatoSdkLanguage =
      | 'en'
      | 'lt'
      | 'de'
      | 'lv'
      | 'et'
      | 'ru'
      | 'sq'
      | 'bg'
      | 'es'
      | 'fr'
      | 'it'
      | 'ro'
      | 'el'
      | 'nl';
    type OndatoSdkMode = 'test' | 'live';

    type OndatoSdkBaseConfig = {
      identityVerificationId: string;
      mode?: OndatoSdkMode;
      language?: OndatoSdkLanguage;
      showStartScreen?: boolean;
      showSelfieFrame?: boolean;
      skipRegistrationIfDriverLicense?: boolean;
      simpleCustomization?: SimpleCustomization;
    };
    type OndatoSdkIOSOnlyConfig = {
      showSuccessWindow?: boolean;
      iosCustomization?: IOSCustomization;
    };
    type OndatoSdkIOSConfig = OndatoSdkBaseConfig & OndatoSdkIOSOnlyConfig;
    type OndatoSdkAndroidOnlyConfig = {
      showIdentificationWaitingScreen?: boolean;
      // Coming soon:
      //androidCustomization?: AndroidCustomization;
    };
    type OndatoSdkAndroidConfig = OndatoSdkBaseConfig &
      OndatoSdkAndroidOnlyConfig;
    type OndatoSdkConfig = OndatoSdkBaseConfig &
      OndatoSdkAndroidOnlyConfig &
      OndatoSdkIOSOnlyConfig;

    type OndatoSdkNativeProps = {
      ref?: any;
      style?: ViewStyle;
      configuration: string;
      onUpdate?: (status: OndatoSdkState) => void;
    };

    type OndatoSdkRef = { open: () => void; close: () => void };

    type OndatoSdkViewProps = {
      config: OndatoSdkConfig;
      onStateUpdate: (status: OndatoSdkState) => void;
    };
    type OndatoSdkProps = {
      config: Partial<OndatoSdkConfig>;
      onStateUpdate: (status: OndatoSdkState) => void;
    };

    type IOSFont = {
      name: string;
      size: Number;
      weight:
        | 'ultralight'
        | 'thin'
        | 'light'
        | 'regular'
        | 'medium'
        | 'semibold'
        | 'heavy'
        | 'bold'
        | 'black';
    };

    type IOSConsentButton = {
      font?: IOSFont;
      backgroundColor?: string;
      tintColor?: string;
      borderWidth?: Number;
      borderColor?: string;
      cornerRadius?: Number;
    };

    type IOSConsentWindowHeader = {
      font?: IOSFont;
      color?: string;
    };
    type IOSConsentWindowBody = {
      font?: IOSFont;
      textColor?: string;
    };

    type IOSConsentWindow = {
      header: IOSConsentWindowHeader;
      body: IOSConsentWindowBody;
      acceptButton: IOSConsentButton;
      declineButton: IOSConsentButton;
    };

    type IOSCustomization = {
      progressColor: string;
      errorColor: string;
      errorTextColor: string;
      buttonColor: string;
      buttonTextColor: string;
      textColor: string;
      backgroundColor: string;
      imageTintColor: string;
      consentWindow: IOSConsentWindow;
    };

    export type SimpleCustomization = {
      primaryColor: string;
      textColor: string;
      buttonTextColor: string;
    };

    export type AndroidCustomization = {
      ondatoColorPrimaryDark: string;
      ondatoColorPrimary: string;
      ondatoColorAccent: string;
      ondatoTextColor: string;
      ondatoSecondaryTextColor: string;
      ondatoColorButton: string;
      ondatoColorButtonFocusedStart: string;
      ondatoColorButtonFocusedCenter: string;
      ondatoColorButtonFocusedEnd: string;
      ondatoColorButtonText: string;
      ondatoOutlinedButtonColor: string;
      ondatoOutlinedButtonTextColor: string;
      ondatoColorBackground: string;
      ondatoIconColor: string;
      ondatoActiveLivenessOvalProgressColor: string;
      ondatoActiveLivenessOvalProgressColorSecondary: string;
      ondatoActiveLivenessResultActivityIndicatorColor: string;
      ondatoActiveLivenessResultAnimationBackgroundColor: string;
      ondatoActiveLivenessResultUploadProgressColor: string;
      ondatoActiveLivenessResultAnimationForegroundColor: string;
      ondatoActiveLivenessResultUploadProgressTrackColor: string;
      ondatoActiveLivenessResultForegroundColor: string;
      ondatoActiveLivenessCameraFilter: string;
      ondatoDisabledButtonColor: string;
      ondatoHighlightButtonColor: string;
      ondatoColorErrorBg: string;
      ondatoColorErrorText: string;
      ondatoColorSeparatorColor: string;
      ondatoColorAlmostTransparent: string;
      ondatoColorAlmostTransparent2: string;
      ondatoColorLanguagesBorder: string;
      ondatoColorCameraFilter: string;
      ondatoInputTextBorderColor: string;
    };
  }
}
