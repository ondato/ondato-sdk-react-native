jest.mock('fs-extra', () => ({
  existsSync: jest.fn(),
  ensureDirSync: jest.fn(),
  copySync: jest.fn(),
  readdirSync: jest.fn(),
}));

jest.mock('expo/config-plugins', () => {
  // We need to keep the original implementation for things we don't mock.
  const original = jest.requireActual('expo/config-plugins');
  return {
    ...original,
    WarningAggregator: {
      addWarningAndroid: jest.fn(),
      addWarningIOS: jest.fn(), // For later
    },
  };
});

// Import the function we are testing.
import {
  copyAndroidIllustrations,
  copyIosIllustrations,
} from '../src/withCustomIllustrations';

// Import the mocked modules to control and assert against them.
import { WarningAggregator, type XcodeProject } from 'expo/config-plugins';
import fs from 'fs-extra';

describe('withCustomIllustrations Android', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should copy both drawable and raw directories if they exist', async () => {
    // ARRANGE: Simulate that the source android folder and both subdirectories exist.
    (fs.existsSync as jest.Mock).mockReturnValue(true);

    // ACT: Run the function.
    await copyAndroidIllustrations('/fake/project', './illustrations');

    // ASSERT: Verify all file operations.
    // It should create both destination directories.
    expect(fs.ensureDirSync).toHaveBeenCalledTimes(2);
    expect(fs.ensureDirSync).toHaveBeenCalledWith(
      '/fake/project/android/app/src/main/res/drawable'
    );
    expect(fs.ensureDirSync).toHaveBeenCalledWith(
      '/fake/project/android/app/src/main/res/raw'
    );

    // It should copy both directories.
    expect(fs.copySync).toHaveBeenCalledTimes(2);
    expect(fs.copySync).toHaveBeenCalledWith(
      '/fake/project/illustrations/android/drawable',
      '/fake/project/android/app/src/main/res/drawable',
      { overwrite: true }
    );
    expect(fs.copySync).toHaveBeenCalledWith(
      '/fake/project/illustrations/android/raw',
      '/fake/project/android/app/src/main/res/raw',
      { overwrite: true }
    );

    // No warnings should be logged.
    expect(WarningAggregator.addWarningAndroid).not.toHaveBeenCalled();
  });

  it('should only copy the drawable directory if raw does not exist', async () => {
    // ARRANGE: Simulate only the 'drawable' subdirectory existing.
    (fs.existsSync as jest.Mock).mockImplementation((p: string) => {
      // The main source path and the drawable path exist.
      if (
        p.endsWith('/illustrations/android') ||
        p.endsWith('/illustrations/android/drawable')
      ) {
        return true;
      }
      // The raw path does NOT exist.
      return false;
    });

    // ACT: Run the function.
    await copyAndroidIllustrations('/fake/project', './illustrations');

    // ASSERT: Verify only the 'drawable' operations occurred.
    expect(fs.ensureDirSync).toHaveBeenCalledTimes(1);
    expect(fs.ensureDirSync).toHaveBeenCalledWith(
      '/fake/project/android/app/src/main/res/drawable'
    );

    expect(fs.copySync).toHaveBeenCalledTimes(1);
    expect(fs.copySync).toHaveBeenCalledWith(
      '/fake/project/illustrations/android/drawable',
      '/fake/project/android/app/src/main/res/drawable',
      { overwrite: true }
    );
  });

  it('should log a warning and skip if the main illustrations/android directory does not exist', async () => {
    // ARRANGE: Simulate the main source path not existing.
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    // ACT: Run the function.
    await copyAndroidIllustrations('/fake/project', './illustrations');

    // ASSERT: Verify the guard clause.
    expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
      'ondato-sdk-react-native',
      'Custom illustrations path for Android not found at /fake/project/illustrations/android. Skipping.'
    );
    // No file operations should have been attempted.
    expect(fs.ensureDirSync).not.toHaveBeenCalled();
    expect(fs.copySync).not.toHaveBeenCalled();
  });

  it('should log a warning if copying fails', async () => {
    // ARRANGE: Simulate that files exist but copying throws an error.
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    const copyError = new Error('Disk is full');
    (fs.copySync as jest.Mock).mockImplementation(() => {
      throw copyError;
    });

    // ACT: Run the function.
    await copyAndroidIllustrations('/fake/project', './illustrations');

    // ASSERT: Verify the error handling.
    expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledTimes(2); // Called for each directory
    expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
      'ondato-sdk-react-native',
      'Could not copy Android illustrations from /fake/project/illustrations/android/drawable: Disk is full'
    );
  });
});

describe('withCustomIllustrations iOS', () => {
  let mockPbxProject: XcodeProject;

  beforeEach(() => {
    jest.resetAllMocks();
    mockPbxProject = {
      addResourceFile: jest.fn(),
      pbxGroupByName: jest.fn(),
      addPbxGroup: jest.fn(() => ({ uuid: 'MOCK_GROUP_UUID' })),
      getFirstTarget: () => ({ uuid: 'MOCK_TARGET_UUID' }),
    };
  });

  it('should copy images to Assets Catalog and Lottie files to the main bundle', () => {
    // ARRANGE: Simulate a file system with one image and one Lottie file.
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue([
      'ondato.images.backButton.png',
      'ondato.animations.waitingScreenAnimation.json',
      'ignored-file.txt', // This should be skipped.
    ]);
    (fs.writeJsonSync as jest.Mock) = jest.fn(); // Mock writeJsonSync from fs-extra
    (fs.copySync as jest.Mock).mockImplementation(() => {});

    // ACT: Run the function.
    copyIosIllustrations(
      '/fake/project',
      './illustrations',
      'my-app',
      mockPbxProject
    );

    // ASSERT for the Lottie file (.json)
    expect(fs.copySync).toHaveBeenCalledWith(
      '/fake/project/illustrations/ios/ondato.animations.waitingScreenAnimation.json',
      '/fake/project/ios/my-app/ondato.animations.waitingScreenAnimation.json',
      { overwrite: true }
    );
    expect(mockPbxProject.addResourceFile).toHaveBeenCalledWith(
      'my-app/ondato.animations.waitingScreenAnimation.json',
      { target: 'MOCK_TARGET_UUID' },
      expect.any(String) // We just care that it was called with a group UUID.
    );

    // ASSERT for the image file (.png)
    const expectedImagesetPath =
      '/fake/project/ios/my-app/Images.xcassets/ondato.images.backButton.imageset';
    expect(fs.ensureDirSync).toHaveBeenCalledWith(expectedImagesetPath);
    expect(fs.copySync).toHaveBeenCalledWith(
      '/fake/project/illustrations/ios/ondato.images.backButton.png',
      `${expectedImagesetPath}/ondato.images.backButton.png`
    );
    expect(fs.writeJsonSync).toHaveBeenCalledWith(
      `${expectedImagesetPath}/Contents.json`,
      {
        images: [
          {
            filename: 'ondato.images.backButton.png',
            idiom: 'universal',
            scale: '1x',
          },
          {
            idiom: 'universal',
            scale: '2x',
          },
          {
            idiom: 'universal',
            scale: '3x',
          },
        ],
        info: {
          author: 'xcode',
          version: 1,
        },
      }
    );
    // Crucially, addResourceFile should NOT be called for Asset Catalog images.
    expect(mockPbxProject.addResourceFile).toHaveBeenCalledTimes(1);
  });

  it('should log a warning and skip if the main illustrations/ios directory does not exist', () => {
    // ARRANGE: Simulate the source path not existing.
    (fs.existsSync as jest.Mock).mockReturnValue(false);

    // ACT: Run the function.
    copyIosIllustrations(
      '/fake/project',
      './illustrations',
      'my-app',
      mockPbxProject
    );

    // ASSERT: Verify the guard clause.
    expect(WarningAggregator.addWarningIOS).toHaveBeenCalledWith(
      'ondato-sdk-react-native',
      'Custom illustrations path for iOS not found at /fake/project/illustrations/ios. Skipping.'
    );
    // No file operations should have been attempted.
    expect(fs.readdirSync).not.toHaveBeenCalled();
    expect(fs.copySync).not.toHaveBeenCalled();
  });

  it('should log a warning if copying an image fails', () => {
    // ARRANGE: Simulate that files exist but copying throws an error.
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readdirSync as jest.Mock).mockReturnValue([
      'ondato.images.backButton.png',
    ]);
    const copyError = new Error('Permission denied');
    (fs.ensureDirSync as jest.Mock).mockImplementation(() => {
      throw copyError; // Simulate error during directory creation.
    });

    // ACT: Run the function.
    copyIosIllustrations(
      '/fake/project',
      './illustrations',
      'my-app',
      mockPbxProject
    );

    // ASSERT: Verify the error handling.
    expect(WarningAggregator.addWarningIOS).toHaveBeenCalledWith(
      'ondato-sdk-react-native',
      'Could not copy iOS image ondato.images.backButton.png to Asset Catalog: Permission denied'
    );
  });
});
