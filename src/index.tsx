import { z } from 'zod';
import Ondato, {
  type OndatoConfig,
  type OndatoNativeConfig,
  type Mode,
  type Language,
  type LogLevel,
  type IosFontWeight,
} from './NativeOndatoModule';
import { mergeAppearance, type OptionalAppearance } from './appearance';

export type {
  OndatoConfig,
  Mode as OndatoMode,
  Language as OndatoLanguage,
  LogLevel as OndatoLogLevel,
  IosFontWeight as OndatoIosFontWeight,
};

export const languages: Language[] = [
  'bg',
  'ca',
  'cs',
  'de',
  'el',
  'en',
  'es',
  'et',
  'fi',
  'fr',
  'hr',
  'hu',
  'it',
  'lt',
  'lv',
  'nl',
  'pl',
  'pt',
  'ro',
  'ru',
  'sk',
  'sl',
  'sq',
  'sv',
  'uk',
  'vi',
];
export const logLevels: LogLevel[] = ['error', 'info', 'debug'];
export const modes: Mode[] = ['test', 'live'];
export const iosFontWeights: IosFontWeight[] = [
  'ultralight',
  'thin',
  'light',
  'regular',
  'medium',
  'semibold',
  'bold',
  'heavy',
  'black',
];

const configSchema = z
  .object({
    identityVerificationId: z
      .string()
      .min(
        1,
        'identityVerificationId is required and must be a non-empty string'
      ),
    mode: z.enum(modes as [Mode, ...Mode[]]).default('test'),
    language: z
      .string()
      .optional()
      .transform((lang): Language | undefined => {
        if (!lang) return undefined;
        return (languages as readonly string[]).includes(lang)
          ? (lang as Language)
          : 'en';
      }),
    switchPrimaryButtons: z.boolean().default(false),
    enableNetworkIssuesScreen: z.boolean().default(true),
    disablePdfFileUpload: z.boolean().default(false),
    skipRegistrationIfDriverLicense: z.boolean().default(false),
    showTranslationKeys: z.boolean().default(false),
    logLevel: z.enum(logLevels as [LogLevel, ...LogLevel[]]).default('info'),
    fonts: z
      .object({
        android: z
          .object({
            title: z.string().optional(),
            subtitle: z.string().optional(),
            body: z.string().optional(),
            list: z.string().optional(),
            button: z.string().optional(),
            inputLabel: z.string().optional(),
          })
          .optional(),
        ios: z
          .object({
            title: z
              .object({
                postScriptName: z.string(),
                size: z.number().optional(),
                weight: z
                  .enum(iosFontWeights as [IosFontWeight, ...IosFontWeight[]])
                  .optional(),
              })
              .optional(),
            subtitle: z
              .object({
                postScriptName: z.string(),
                size: z.number().optional(),
                weight: z
                  .enum(iosFontWeights as [IosFontWeight, ...IosFontWeight[]])
                  .optional(),
              })
              .optional(),
            body: z
              .object({
                postScriptName: z.string(),
                size: z.number().optional(),
                weight: z
                  .enum(iosFontWeights as [IosFontWeight, ...IosFontWeight[]])
                  .optional(),
              })
              .optional(),
            list: z
              .object({
                postScriptName: z.string(),
                size: z.number().optional(),
                weight: z
                  .enum(iosFontWeights as [IosFontWeight, ...IosFontWeight[]])
                  .optional(),
              })
              .optional(),
            button: z
              .object({
                postScriptName: z.string(),
                size: z.number().optional(),
                weight: z
                  .enum(iosFontWeights as [IosFontWeight, ...IosFontWeight[]])
                  .optional(),
              })
              .optional(),
          })
          .optional(),
      })
      .optional(),
    appearance: z.any().optional(),
  })
  .strict();

function formatZodError(error: z.ZodError) {
  return error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('\n');
}

/** Starts the Ondato identification flow */
export function startIdentification(config: OndatoConfig) {
  const result = configSchema.safeParse(config);

  if (!result.success) {
    const errMsg = `Invalid Ondato config:\n${formatZodError(result.error)}`;
    if (__DEV__) {
      throw new Error(errMsg);
    } else {
      console.error(errMsg);
      throw new Error('Invalid Ondato config');
    }
  }

  const nativeConfig: OndatoNativeConfig = result.data;

  if (config.appearance) {
    const merged = mergeAppearance(config.appearance as OptionalAppearance);
    nativeConfig.appearance = JSON.stringify(merged);
  }

  return Ondato.startIdentification(nativeConfig);
}

/** Retrieves the Ondato SDK logs as a string */
export function getLogs(): string {
  return Ondato.getLogs();
}
