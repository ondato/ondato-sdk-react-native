import { z } from 'zod';
import Ondato, {
  type OndatoConfig,
  type Mode,
  type Language,
  type FontWeight,
} from './NativeOndatoModule';

export type { OndatoConfig, Mode as OndatoMode, Language as OndatoLanguage };

export const languages: Language[] = [
  'bg',
  'de',
  'el',
  'en',
  'es',
  'et',
  'fr',
  'it',
  'lt',
  'lv',
  'nl',
  'ro',
  'ru',
  'sq',
];
export const modes: Mode[] = ['test', 'live'];
export const fontWeights: FontWeight[] = [
  'ultralight',
  'thin',
  'light',
  'regular',
  'medium',
  'semibold',
  'heavy',
  'bold',
  'black',
];

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'must be a hex color (e.g., #FF0000)');

const withFont = <T extends z.ZodRawShape>(shape: T) =>
  z.object({
    font: fontSchema,
    ...shape,
  });

const fontSchema = z.object({
  name: z.string().optional(),
  size: z.number().min(1, 'size must be a positive number'),
  weight: z.enum(fontWeights as [FontWeight, ...FontWeight[]]).optional(),
});

const labelSchema = withFont({
  color: hexColor,
});

const textViewSchema = withFont({
  textColor: hexColor,
});

const buttonSchema = withFont({
  backgroundColor: hexColor,
  tintColor: hexColor,
  borderWidth: z.number().min(0, 'borderWidth must be non-negative'),
  borderColor: hexColor,
  cornerRadius: z.number().min(0, 'cornerRadius must be non-negative'),
});

const consentSchema = z.object({
  header: labelSchema,
  body: textViewSchema,
  acceptButton: buttonSchema,
  declineButton: buttonSchema,
});

const appearanceSchema = z.object({
  progressColor: hexColor.optional(),
  buttonColor: hexColor.optional(),
  buttonTextColor: hexColor.optional(),
  errorColor: hexColor.optional(),
  errorTextColor: hexColor.optional(),
  textColor: hexColor.optional(),
  backgroundColor: hexColor.optional(),
  imageTintColor: hexColor.optional(),
  consentWindow: consentSchema.optional(),
});

const configSchema = z
  .object({
    identityVerificationId: z
      .string()
      .min(
        1,
        'identityVerificationId is required and must be a non-empty string'
      ),
    mode: z.enum(modes as [Mode, ...Mode[]]).default('test'),
    language: z.enum(languages as [Language, ...Language[]]).optional(),
    showStartScreen: z.boolean().default(true),
    removeSelfieFrame: z.boolean().default(false),
    skipRegistrationIfDriverLicense: z.boolean().default(false),
    showSplashScreen: z.boolean().default(false),
    showWaitingScreen: z.boolean().default(false),
    showIdentificationWaitingPage: z.boolean().default(true),
    showSuccessWindow: z.boolean().default(false),
    appearance: appearanceSchema.optional(),
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

  if (__DEV__) {
    if (!result.success) {
      throw new Error(
        `Invalid Ondato config:\n${formatZodError(result.error)}`
      );
    }
  } else {
    if (!result.success) {
      console.error('Invalid Ondato config:', formatZodError(result.error));
      throw new Error('Invalid Ondato config');
    }
  }

  return Ondato.startIdentification(result.data);
}
