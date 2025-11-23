// Mock the direct dependencies of index.tsx at the top.
jest.mock('../NativeOndatoModule', () => ({
  // We are mocking the native module itself.
  startIdentification: jest.fn(),
  getLogs: jest.fn(),
}));

jest.mock('../appearance', () => ({
  // We are mocking the appearance helper.
  mergeAppearance: jest.fn(),
}));

// Import the functions we want to test.
import { startIdentification, getLogs } from '../index';

// Import the mocked modules so we can control and assert against them.
import Ondato, { type OndatoConfig } from '../NativeOndatoModule';
import { mergeAppearance } from '../appearance';

type Global = typeof globalThis & { __DEV__: boolean };

describe('Ondato SDK Module (index.tsx)', () => {
  // Use resetAllMocks for a clean slate before every test.
  beforeEach(() => {
    jest.resetAllMocks();
    // Set a default return value for the merge helper.
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
      // Check the native config passed to the actual native module.
      expect(Ondato.startIdentification).toHaveBeenCalledWith({
        identityVerificationId: 'test-id-123',
        mode: 'test', // Default
        language: undefined,
        switchPrimaryButtons: false, // Default
        enableNetworkIssuesScreen: true, // Default
        disablePdfFileUpload: false, // Default
        skipRegistrationIfDriverLicense: false, // Default
        showTranslationKeys: false, // Default
        logLevel: 'info', // Default
        fonts: undefined,
        appearance: undefined, // No appearance was provided
      });
      // Ensure the appearance helper was NOT called.
      expect(mergeAppearance).not.toHaveBeenCalled();
    });

    it('should pass through all valid properties and stringify the appearance object', () => {
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
      // Verify the appearance helper was called with the partial appearance object.
      expect(mergeAppearance).toHaveBeenCalledWith(fullConfig.appearance);
      // Verify the native module was called with the correct, transformed config.
      expect(Ondato.startIdentification).toHaveBeenCalledWith({
        identityVerificationId: 'test-id-456',
        mode: 'live',
        language: 'de',
        logLevel: 'debug',
        fonts: { android: { title: 'my_font' } },
        appearance: '{"merged":true}', // Correctly stringified result from the mock
        // Defaults for unspecified booleans
        switchPrimaryButtons: false,
        enableNetworkIssuesScreen: true,
        disablePdfFileUpload: false,
        skipRegistrationIfDriverLicense: false,
        showTranslationKeys: false,
      });
    });

    // ---- Validation and Error Handling ----

    it('should throw an error if identityVerificationId is missing', () => {
      // ARRANGE
      const invalidConfig = { mode: 'test' };

      // ACT & ASSERT
      // We expect this call to throw an error due to Zod validation.
      expect(() =>
        startIdentification(invalidConfig as OndatoConfig)
      ).toThrow();
    });

    it('should throw an error for an unknown property', () => {
      // ARRANGE
      const invalidConfig = {
        identityVerificationId: 'test-id',
        unknownProp: 'this-should-fail',
      };

      // ACT & ASSERT
      expect(() =>
        startIdentification(invalidConfig as OndatoConfig)
      ).toThrow();
    });

    it('should throw a detailed error in DEV mode', () => {
      // ARRANGE
      (global as Global).__DEV__ = true; // Simulate development environment
      const invalidConfig = { identityVerificationId: '' }; // Invalid ID

      // ACT & ASSERT
      expect(() => startIdentification(invalidConfig as OndatoConfig)).toThrow(
        /Invalid Ondato config:[\s\S]*identityVerificationId/
      );
    });

    it('should throw a generic error and console.error in production mode', () => {
      // ARRANGE
      (global as Global).__DEV__ = false; // Simulate production environment
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const invalidConfig = { identityVerificationId: '' };

      // ACT & ASSERT
      expect(() => startIdentification(invalidConfig as OndatoConfig)).toThrow(
        'Invalid Ondato config'
      );
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore(); // Clean up the spy
    });
  });

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
