// Mock the direct dependencies of index.tsx at the top.
jest.mock('../NativeOndatoModule', () => ({
  startIdentification: jest.fn(),
  getLogs: jest.fn(),
}));

jest.mock('../appearance', () => ({
  mergeAppearance: jest.fn(),
}));

// Import the functions we want to test.
import { startIdentification, getLogs } from '../index';

// Import mocked modules.
import Ondato, { type OndatoConfig } from '../NativeOndatoModule';
import { mergeAppearance } from '../appearance';

type Global = typeof globalThis & { __DEV__: boolean };

describe('Ondato SDK Module (index.tsx)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (mergeAppearance as jest.Mock).mockReturnValue({ merged: true });
  });

  describe('startIdentification', () => {
    // ---- Happy Paths ----

    it('should accept a minimal valid config and apply defaults', () => {
      // ARRANGE
      const config = { identityVerificationId: 'test-id-123' };

      // ACT
      startIdentification(config);

      // ASSERT
      expect(Ondato.startIdentification).toHaveBeenCalledTimes(1);
      expect(Ondato.startIdentification).toHaveBeenCalledWith({
        identityVerificationId: 'test-id-123',
        mode: 'test',
        language: undefined,
        switchPrimaryButtons: false,
        enableNetworkIssuesScreen: true,
        disablePdfFileUpload: false,
        skipRegistrationIfDriverLicense: false,
        showTranslationKeys: false,
        logLevel: 'info',
        fonts: undefined,
        appearance: undefined,
      });
      expect(mergeAppearance).not.toHaveBeenCalled();
    });

    it('should pass through valid properties and stringify appearance', () => {
      // ARRANGE
      const fullConfig = {
        identityVerificationId: 'test-id-456',
        mode: 'live' as const,
        language: 'de' as const,
        logLevel: 'debug' as const,
        fonts: { android: { title: 'my_font' } },
        appearance: { brand: { colors: { primaryColor: 'red' } } },
      };

      // ACT
      startIdentification(fullConfig);

      // ASSERT
      expect(mergeAppearance).toHaveBeenCalledWith(fullConfig.appearance);
      expect(Ondato.startIdentification).toHaveBeenCalledWith({
        identityVerificationId: 'test-id-456',
        mode: 'live',
        language: 'de',
        logLevel: 'debug',
        fonts: { android: { title: 'my_font' } },
        appearance: '{"merged":true}',
        // Defaults for unspecified booleans
        switchPrimaryButtons: false,
        enableNetworkIssuesScreen: true,
        disablePdfFileUpload: false,
        skipRegistrationIfDriverLicense: false,
        showTranslationKeys: false,
      });
    });

    // ---- Language Normalization ----

    it('should leave language undefined when not provided', () => {
      // ARRANGE
      const config = { identityVerificationId: 'test-id' };

      // ACT
      startIdentification(config);

      // ASSERT
      expect(Ondato.startIdentification).toHaveBeenCalledWith({
        disablePdfFileUpload: false,
        enableNetworkIssuesScreen: true,
        identityVerificationId: 'test-id',
        logLevel: 'info',
        mode: 'test',
        showTranslationKeys: false,
        skipRegistrationIfDriverLicense: false,
        switchPrimaryButtons: false,
      });
    });

    it('should treat empty string language as undefined', () => {
      // ARRANGE
      const config = {
        identityVerificationId: 'test-id',
        language: '',
      };

      // ACT
      startIdentification(config as OndatoConfig);

      // ASSERT
      expect(Ondato.startIdentification).toHaveBeenCalledWith(
        expect.objectContaining({ language: undefined })
      );
    });

    it('should fall back to English for unsupported language', () => {
      // ARRANGE
      const config = {
        identityVerificationId: 'test-id',
        language: 'xx',
      };

      // ACT
      startIdentification(config as OndatoConfig);

      // ASSERT
      expect(Ondato.startIdentification).toHaveBeenCalledWith(
        expect.objectContaining({ language: 'en' })
      );
    });

    // ---- Validation and Error Handling ----

    it('should throw if identityVerificationId is missing', () => {
      // ARRANGE
      const invalidConfig = { mode: 'test' };

      // ACT + ASSERT
      expect(() =>
        startIdentification(invalidConfig as OndatoConfig)
      ).toThrow();
    });

    it('should throw for unknown property', () => {
      // ARRANGE
      const invalidConfig = {
        identityVerificationId: 'test-id',
        unknownProp: 'nope',
      };

      // ACT + ASSERT
      expect(() =>
        startIdentification(invalidConfig as OndatoConfig)
      ).toThrow();
    });

    it('should throw detailed error in DEV mode', () => {
      // ARRANGE
      (global as Global).__DEV__ = true;
      const invalidConfig = { identityVerificationId: '' };

      // ACT + ASSERT
      expect(() => startIdentification(invalidConfig as OndatoConfig)).toThrow(
        /Invalid Ondato config:[\s\S]*identityVerificationId/
      );
    });

    it('should throw generic error and log in PROD mode', () => {
      // ARRANGE
      (global as Global).__DEV__ = false;
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const invalidConfig = { identityVerificationId: '' };

      // ACT + ASSERT
      expect(() => startIdentification(invalidConfig as OndatoConfig)).toThrow(
        'Invalid Ondato config'
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  // ---- getLogs ----

  describe('getLogs', () => {
    it('should call the native getLogs method and return its value', () => {
      // ARRANGE
      const mockedNativeLogs = Ondato.getLogs as jest.Mock;
      mockedNativeLogs.mockReturnValue('Log line 1\nLog line 2');

      // ACT
      const result = getLogs();

      // ASSERT
      expect(mockedNativeLogs).toHaveBeenCalledTimes(1);
      expect(result).toBe('Log line 1\nLog line 2');
    });
  });
});
