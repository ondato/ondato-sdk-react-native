jest.mock('fs-extra', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
  ensureDirSync: jest.fn(),
  copySync: jest.fn(),
}));
jest.mock('expo/config-plugins', () => ({
  ...jest.requireActual('expo/config-plugins'),
  WarningAggregator: {
    addWarningAndroid: jest.fn(),
    addWarningIOS: jest.fn(),
  },
}));
jest.mock('../src/androidLocalization', () => ({
  mergeStringsXml: jest.fn(),
}));

// Import the function we are testing.
import {
  withMergedStrings,
  getIOSFolders,
  modifyXcodeProject,
} from '../src/withCustomLocalization';
// Import the mocked function so we can check it.
import { mergeStringsXml } from '../src/androidLocalization';
import { WarningAggregator, type XcodeProject } from 'expo/config-plugins';
import fs from 'fs-extra';

// For type safety, cast the imported mock.
const mergeStringsXmlMock = mergeStringsXml as jest.Mock;

describe('withCustomLocalization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('withMergedStrings', () => {
    it('should process all valid language folders found', async () => {
      // ARRANGE: Simulate a file system where the android folder and strings.xml files exist.
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'values',
        'values-de-rDE',
      ]);

      // ACT: Run the function.
      await withMergedStrings('/fake/project', './loc');

      // ASSERT: Verify that it called our mock with the correct paths.
      expect(mergeStringsXmlMock).toHaveBeenCalledTimes(2);
      expect(mergeStringsXmlMock).toHaveBeenCalledWith(
        '/fake/project/loc/android/values/strings.xml',
        '/fake/project/android/app/src/main/res/values/strings.xml'
      );
      expect(mergeStringsXmlMock).toHaveBeenCalledWith(
        '/fake/project/loc/android/values-de-rDE/strings.xml',
        '/fake/project/android/app/src/main/res/values-de-rDE/strings.xml'
      );
    });

    it('should log a warning and skip if the source android directory does not exist', async () => {
      // ARRANGE
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // ACT
      await withMergedStrings('/fake/project', './loc');

      // ASSERT
      expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
        'ondato-sdk-react-native',
        'Custom localization path for Android not found at /fake/project/loc/android. Skipping.'
      );
      expect(mergeStringsXmlMock).not.toHaveBeenCalled();
    });

    it('should skip a language folder if it does not contain a strings.xml file', async () => {
      // ARRANGE
      (fs.existsSync as jest.Mock).mockImplementation((p: string) => {
        // Make the strings.xml for 'values-es' be missing.
        if (p.endsWith('values-es/strings.xml')) {
          return false;
        }
        return true;
      });
      (fs.readdirSync as jest.Mock).mockReturnValue(['values', 'values-es']);

      // ACT
      await withMergedStrings('/fake/project', './loc');

      // ASSERT
      expect(mergeStringsXmlMock).toHaveBeenCalledTimes(1);
      // Verify it was only called for the valid 'values' folder.
      expect(mergeStringsXmlMock).toHaveBeenCalledWith(
        expect.stringContaining('values/strings.xml'),
        expect.anything()
      );
    });
  });
});

describe('iOS Custom Localization', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getIOSFolders', () => {
    it('should return a list of .lproj folders and filter out others', () => {
      // ARRANGE: Simulate a directory with valid and invalid folder names.
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'en.lproj',
        'de.lproj',
        'Podfile',
        'not-a-lang-folder.txt',
      ]);

      // ACT: Run the function.
      const result = getIOSFolders('/fake/project/loc/ios');

      // ASSERT: Verify it correctly filtered the list.
      expect(result).toEqual(['en.lproj', 'de.lproj']);
      expect(WarningAggregator.addWarningIOS).not.toHaveBeenCalled();
    });

    it('should return an empty array and warn if the source path does not exist', () => {
      // ARRANGE: Simulate the .../ios folder not existing.
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // ACT: Run the function.
      const result = getIOSFolders('/fake/project/loc/ios');

      // ASSERT: Verify the guard clause.
      expect(result).toEqual([]);
      expect(WarningAggregator.addWarningIOS).toHaveBeenCalledWith(
        'ondato-sdk-react-native',
        'Custom localization path for iOS not found at /fake/project/loc/ios. Skipping.'
      );
      expect(fs.readdirSync).not.toHaveBeenCalled();
    });
  });

  describe('modifyXcodeProject', () => {
    let mockPbxProject: XcodeProject;

    beforeEach(() => {
      mockPbxProject = {
        addResourceFile: jest.fn(),
        pbxGroupByName: jest.fn(),
        addPbxGroup: jest.fn(() => ({
          // When a group is added, return a mock group object.
          uuid: 'MOCK_NEW_GROUP_UUID',
        })),
        getFirstTarget: () => ({
          // Simulate finding the main app target.
          uuid: 'MOCK_TARGET_UUID',
        }),
      };
    });

    it('should copy files and add them to an existing "Resources" group', () => {
      // ARRANGE: Simulate the filesystem where the strings files exist.
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Simulate finding an existing "Resources" group.
      (mockPbxProject.pbxGroupByName as jest.Mock).mockReturnValue({
        uuid: 'EXISTING_GROUP_UUID',
      });

      // ACT: Run the function with the mock project object.
      modifyXcodeProject(
        mockPbxProject,
        'my-app',
        '/fake/project/loc/ios',
        '/fake/project/ios/my-app',
        ['en.lproj', 'de.lproj']
      );

      // ASSERT
      // Verify destination directories were created.
      expect(fs.ensureDirSync).toHaveBeenCalledTimes(2);
      expect(fs.ensureDirSync).toHaveBeenCalledWith(
        '/fake/project/ios/my-app/en.lproj'
      );
      expect(fs.ensureDirSync).toHaveBeenCalledWith(
        '/fake/project/ios/my-app/de.lproj'
      );

      // Verify files were physically copied.
      expect(fs.copySync).toHaveBeenCalledTimes(2);
      expect(fs.copySync).toHaveBeenCalledWith(
        '/fake/project/loc/ios/en.lproj/OndatoSDK.strings',
        '/fake/project/ios/my-app/en.lproj/OndatoSDK.strings',
        { overwrite: true }
      );

      // Verify files were added to the Xcode project blueprint.
      expect(mockPbxProject.addResourceFile).toHaveBeenCalledTimes(2);
      expect(mockPbxProject.addResourceFile).toHaveBeenCalledWith(
        'my-app/en.lproj/OndatoSDK.strings', // The relative path
        { target: 'MOCK_TARGET_UUID' }, // For the main app target
        'EXISTING_GROUP_UUID' // To the "Resources" group
      );
    });

    it('should create a "Resources" group if it does not exist', () => {
      // ARRANGE
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Simulate the "Resources" group NOT being found.
      (mockPbxProject.pbxGroupByName as jest.Mock).mockReturnValue(null);

      // ACT
      modifyXcodeProject(
        mockPbxProject,
        'my-app',
        '/fake/project/loc/ios',
        '/fake/project/ios/my-app',
        ['en.lproj']
      );

      // ASSERT
      // Verify that it attempted to create the group.
      expect(mockPbxProject.addPbxGroup).toHaveBeenCalledWith(
        [],
        'Resources',
        'Resources'
      );
      // Verify that it then used the NEW group's UUID when adding the file.
      expect(mockPbxProject.addResourceFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        'MOCK_NEW_GROUP_UUID' // The UUID from our mocked addPbxGroup return value.
      );
    });

    it('should skip a language folder if it does not contain an OndatoSDK.strings file', () => {
      // ARRANGE
      (fs.existsSync as jest.Mock).mockImplementation((p: string) => {
        // Make the strings file for de.lproj be missing.
        if (p.endsWith('de.lproj/OndatoSDK.strings')) {
          return false;
        }
        return true;
      });
      (mockPbxProject.pbxGroupByName as jest.Mock).mockReturnValue({
        uuid: 'EXISTING_GROUP_UUID',
      });

      // ACT
      modifyXcodeProject(
        mockPbxProject,
        'my-app',
        '/fake/project/loc/ios',
        '/fake/project/ios/my-app',
        ['en.lproj', 'de.lproj']
      );

      // ASSERT
      // Verify it only ensured/copied/added the valid file.
      expect(fs.ensureDirSync).toHaveBeenCalledTimes(1);
      expect(fs.copySync).toHaveBeenCalledTimes(1);
      expect(mockPbxProject.addResourceFile).toHaveBeenCalledTimes(1);
      // Verify it was the correct file.
      expect(mockPbxProject.addResourceFile).toHaveBeenCalledWith(
        expect.stringContaining('en.lproj'),
        expect.anything(),
        expect.anything()
      );
    });
  });
});
