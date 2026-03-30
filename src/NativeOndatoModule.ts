import { TurboModuleRegistry, type TurboModule } from 'react-native';

import type { OptionalAppearance } from './appearance';

/** Supported language codes for Ondato SDK localization */
export type Language =
  | 'bg'
  | 'ca'
  | 'cs'
  | 'da' // Android only
  | 'de'
  | 'el'
  | 'en'
  | 'es'
  | 'et'
  | 'fi'
  | 'fr'
  | 'hr'
  | 'hu'
  | 'it'
  | 'ko' // Android only
  | 'lt'
  | 'lv'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'ro'
  | 'ru'
  | 'sk'
  | 'sl'
  | 'sq'
  | 'sv'
  | 'th' // Android only
  | 'uk'
  | 'vi'
  | 'zh'; // Android only

/** Standardized error codes returned by the Ondato SDK flow */
export type OndatoError =
  | 'BAD_FLOW_SETUP'
  | 'CONSENT_DECLINED'
  | 'FAILURE_EXIT'
  | 'INVALID_ID'
  | 'UNAUTHORIZED'
  | 'INTERNAL_SERVER_ERROR'
  | 'ABORTED'
  | 'NFC_NOT_SUPPORTED'
  | 'RECORDER_FAILURE'
  | 'TOO_MANY_ATTEMPTS'
  | 'NO_AVAILABLE_DOCUMENT_TYPES'
  | 'GENERIC';

/** Supported font weights for iOS */
export type IosFontWeight =
  | 'ultralight'
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'heavy'
  | 'black';

export type IosFont = {
  postScriptName: string;
  size?: number;
  weight?: IosFontWeight;
};

export type Fonts = {
  android?: {
    title?: string;
    subtitle?: string;
    body?: string;
    list?: string;
    button?: string;
    inputLabel?: string;
  };
  ios?: {
    title?: IosFont;
    subtitle?: IosFont;
    body?: IosFont;
    list?: IosFont;
    button?: IosFont;
  };
};

/** Supported modes for Ondato SDK environment */
export type Mode = 'test' | 'live';

/** Logging levels for Ondato SDK */
export type LogLevel = 'error' | 'info' | 'debug';

/** Configuration for Ondato SDK */
export type OndatoConfig = {
  /** Required identity verification ID */
  identityVerificationId: string;
  /** SDK mode (defaults to 'test') */
  mode?: Mode;
  /** Language code for localization */
  language?: Language;
  /** Switch primary buttons (defaults to false) */
  switchPrimaryButtons?: boolean;
  /** Enable network issues screen (defaults to true) */
  enableNetworkIssuesScreen?: boolean;
  /** Disable PDF file upload (defaults to false) */
  disablePdfFileUpload?: boolean;
  /** Skip registration if driver’s license (defaults to false) */
  skipRegistrationIfDriverLicense?: boolean;
  /** Show translation keys (iOS only, defaults to false) */
  showTranslationKeys?: boolean;
  /** Appearance customization (merged and stringified to whitelabel JSON) */
  appearance?: OptionalAppearance;
  /** Logging level for Ondato SDK (defaults to 'info') */
  logLevel?: LogLevel;
  /** An object specifying custom fonts to use */
  fonts?: Fonts;
  /** Require scrolling to the end of consent text before enabling the "agree" button (Android only, defaults to true) */
  requireScrollToEnableTermsButton?: boolean;
  /** Delay in milliseconds before enabling the "agree" button (Android only, defaults to 10000) */
  termsButtonTimeout?: number;
};

/** Native configuration with defaults applied */
export type OndatoNativeConfig = {
  identityVerificationId: string;
  mode: Mode;
  language?: Language;
  switchPrimaryButtons: boolean;
  enableNetworkIssuesScreen: boolean;
  disablePdfFileUpload: boolean;
  skipRegistrationIfDriverLicense: boolean;
  showTranslationKeys: boolean;
  appearance?: string;
  logLevel: LogLevel;
  fonts?: Fonts;
  requireScrollToEnableTermsButton: boolean;
  termsButtonTimeout: number;
};

/** Result of the identification process */
export type OndatoResult =
  | { status: 'success'; id?: string }
  | { status: 'failure'; id?: string; error: OndatoError };

export interface Spec extends TurboModule {
  /** Starts the Ondato identification flow */
  startIdentification(config: OndatoNativeConfig): Promise<OndatoResult>;
  /** Retrieves the Ondato SDK logs as a string */
  getLogs(): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('OndatoModule');
