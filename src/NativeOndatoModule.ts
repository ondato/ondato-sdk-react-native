import { TurboModuleRegistry, type TurboModule } from 'react-native';

import type { OptionalAppearance } from './appearance';

/** Supported language codes for Ondato SDK localization */
export type Language =
  | 'bg'
  | 'ca'
  | 'cs'
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
  | 'ua'
  | 'vi';

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
  /** Switch primary buttons (shared, defaults to false) */
  switchPrimaryButtons?: boolean;
  /** Enable network issues screen (shared, defaults to true) */
  enableNetworkIssuesScreen?: boolean;
  /** Disable PDF file upload (shared, defaults to false) */
  disablePdfFileUpload?: boolean;
  /** Skip registration if driver’s license (iOS only, defaults to false) */
  skipRegistrationIfDriverLicense?: boolean;
  /** Show translation keys (iOS only, defaults to false) */
  showTranslationKeys?: boolean;
  /** Appearance customization (merged and stringified to whitelabel JSON) */
  appearance?: OptionalAppearance;
  /** Logging level for Ondato SDK (defaults to 'info') */
  logLevel?: LogLevel;
  /** An object specifying custom fonts to use */
  fonts?: Fonts;
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
};

/** Result of the identification process */
export type OndatoResult =
  | { status: 'success'; id?: string }
  | { status: 'failure'; id?: string; error: string };

export interface Spec extends TurboModule {
  /** Starts the Ondato identification flow */
  startIdentification(config: OndatoNativeConfig): Promise<OndatoResult>;
  /** Retrieves the Ondato SDK logs as a string */
  getLogs(): string;
}

export default TurboModuleRegistry.getEnforcing<Spec>('OndatoModule');
