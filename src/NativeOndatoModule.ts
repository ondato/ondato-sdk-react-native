import { TurboModuleRegistry, type TurboModule } from 'react-native';

/** Supported language codes for Ondato SDK localization */
export type Language =
  | 'bg'
  | 'de'
  | 'el'
  | 'en'
  | 'es'
  | 'et'
  | 'fr'
  | 'it'
  | 'lt'
  | 'lv'
  | 'nl'
  | 'ro'
  | 'ru'
  | 'sq';

/** Supported modes for Ondato SDK environment */
export type Mode = 'test' | 'live';

/** Supported font weights */
export type FontWeight =
  | 'ultralight'
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'heavy'
  | 'bold'
  | 'black';

/** Font configuration for UI elements */
export type Font = {
  /** Font name (e.g., 'Helvetica'); undefined for system font */
  name?: string;
  /** Font size in points (e.g., 15) */
  size: number;
  /** Font weight; defaults to 'regular' */
  weight?: FontWeight;
};

/** Label appearance configuration (iOS only) */
export type OndatoLabel = {
  /** Font settings */
  font: Font;
  /** Text color as hex (e.g., '#FF0000') */
  color: string;
};

/** Text view appearance configuration (iOS only) */
export type OndatoTextView = {
  /** Font settings */
  font: Font;
  /** Text color as hex (e.g., '#FF0000') */
  textColor: string;
};

/** Button appearance configuration (iOS only) */
export type OndatoButton = {
  /** Font settings */
  font: Font;
  /** Background color as hex (e.g., '#FF0000') */
  backgroundColor: string;
  /** Tint color as hex (e.g., '#007AFF') */
  tintColor: string;
  /** Border width in points */
  borderWidth: number;
  /** Border color as hex (e.g., '#FF0000') */
  borderColor: string;
  /** Corner radius in points */
  cornerRadius: number;
};

/** Consent window appearance configuration (iOS only) */
export type OndatoConsentWindow = {
  /** Header label appearance */
  header: OndatoLabel;
  /** Body text view appearance */
  body: OndatoTextView;
  /** Accept button appearance */
  acceptButton: OndatoButton;
  /** Decline button appearance */
  declineButton: OndatoButton;
};

/** Full appearance configuration for iOS SDK */
export type OndatoAppearance = {
  /** Progress bar color as hex (e.g., '#007AFF') */
  progressColor?: string;
  /** Error message background color as hex (e.g., '#FF0000') */
  errorColor?: string;
  /** Error message text color as hex (e.g., '#FFFFFF') */
  errorTextColor?: string;
  /** Button background color as hex (e.g., '#007AFF') */
  buttonColor?: string;
  /** Button text color as hex (e.g., '#FFFFFF') */
  buttonTextColor?: string;
  /** General text color as hex (e.g., '#000000') */
  textColor?: string;
  /** Background color as hex (e.g., '#FFFFFF') */
  backgroundColor?: string;
  /** Image tint color as hex (e.g., '#000000') */
  imageTintColor?: string;
  /** Consent window appearance */
  consentWindow?: OndatoConsentWindow;
};

/** Configuration for Ondato SDK */
export type OndatoConfig = {
  /** Required identity verification ID */
  identityVerificationId: string;
  /** SDK mode (defaults to 'test') */
  mode?: Mode;
  /** Language code for localization (defaults to 'en') */
  language?: Language;
  /** Show start screen (shared, defaults to true) */
  showStartScreen?: boolean;
  /** Remove selfie frame in passive liveness check (shared, defaults to false) */
  removeSelfieFrame?: boolean;
  /** Skip registration if driver’s license is provided (shared, defaults to false) */
  skipRegistrationIfDriverLicense?: boolean;
  /** Show splash screen (Android only, defaults to false) */
  showSplashScreen?: boolean;
  /** Show waiting screen (Android only, defaults to false) */
  showWaitingScreen?: boolean;
  /** Show identification waiting page (Android only, defaults to true) */
  showIdentificationWaitingPage?: boolean;
  /** Show success window (iOS only, defaults to false) */
  showSuccessWindow?: boolean;
  /** Appearance customization (iOS only) */
  appearance?: OndatoAppearance;
};

/** Native configuration with defaults applied */
export type OndatoNativeConfig = {
  /**
   * Shared
   */
  identityVerificationId: string;
  mode: Mode;
  language?: Language;
  showStartScreen: boolean;
  removeSelfieFrame: boolean;
  skipRegistrationIfDriverLicense: boolean;
  /**
   * Android only
   */
  showSplashScreen: boolean;
  showWaitingScreen: boolean;
  showIdentificationWaitingPage: boolean;
  /**
   * iOS only
   */
  showSuccessWindow: boolean;
  appearance?: OndatoAppearance;
};

/** Result of the identification process */
export type OndatoResult =
  | { status: 'success'; id?: string }
  | { status: 'failure'; id?: string; error: string };

export interface Spec extends TurboModule {
  /** Starts the Ondato identification flow */
  startIdentification(config: OndatoNativeConfig): Promise<OndatoResult>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('OndatoModule');
