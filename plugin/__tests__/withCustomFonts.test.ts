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

// Import the functions we are testing.
import {
  copyAndroidFonts,
  addFontsToPList,
  addFontsToXcodeProject,
} from '../src/withCustomFonts';

// Import the mocked modules and types.
import {
  WarningAggregator,
  type XcodeProject,
  type InfoPlist,
} from 'expo/config-plugins';
import fs from 'fs-extra';

describe('withCustomFonts', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  // --- ANDROID TESTS ---
  describe('Android: copyAndroidFonts', () => {
    it('should copy and correctly rename font files', async () => {
      // ARRANGE
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'MyFont-Bold.ttf',
        'my-script.otf',
        'ignored-file.txt',
      ]);

      // ACT
      await copyAndroidFonts('/fake/project', './fonts');

      // ASSERT
      expect(fs.ensureDirSync).toHaveBeenCalledWith(
        '/fake/project/android/app/src/main/res/font'
      );
      expect(fs.copySync).toHaveBeenCalledTimes(2);
      // Verify that the file was renamed correctly (lowercase, underscores).
      expect(fs.copySync).toHaveBeenCalledWith(
        '/fake/project/fonts/MyFont-Bold.ttf',
        '/fake/project/android/app/src/main/res/font/myfont_bold.ttf',
        { overwrite: true }
      );
      expect(fs.copySync).toHaveBeenCalledWith(
        '/fake/project/fonts/my-script.otf',
        '/fake/project/android/app/src/main/res/font/my_script.otf',
        { overwrite: true }
      );
    });

    it('should warn and skip if the source path does not exist', async () => {
      // ARRANGE
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      // ACT
      await copyAndroidFonts('/fake/project', './fonts');

      // ASSERT
      expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('not found')
      );
      expect(fs.copySync).not.toHaveBeenCalled();
    });
  });

  // --- IOS TESTS ---
  describe('iOS: addFontsToPList', () => {
    it('should add new font filenames to Info.plist', () => {
      // ARRANGE
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'NewFont-Bold.ttf',
        'ExistingFont.otf',
      ]);
      const mockPlist: InfoPlist = {
        UIAppFonts: ['ExistingFont.otf'],
      };

      // ACT
      const result = addFontsToPList('/fake/project', './fonts', mockPlist);

      // ASSERT
      // Use arrayContaining because order doesn't matter.
      expect(result.UIAppFonts).toEqual(
        expect.arrayContaining(['ExistingFont.otf', 'NewFont-Bold.ttf'])
      );
      expect(result.UIAppFonts).toHaveLength(2);
    });

    it('should create the UIAppFonts array if it does not exist', () => {
      // ARRANGE
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['NewFont-Bold.ttf']);
      const mockPlist: InfoPlist = {}; // No UIAppFonts key

      // ACT
      const result = addFontsToPList('/fake/project', './fonts', mockPlist);

      // ASSERT
      expect(result.UIAppFonts).toEqual(['NewFont-Bold.ttf']);
    });
  });

  describe('iOS: addFontsToXcodeProject', () => {
    let mockPbxProject: XcodeProject;

    beforeEach(() => {
      mockPbxProject = {
        addResourceFile: jest.fn(),
        pbxGroupByName: jest.fn(),
        addPbxGroup: jest.fn(() => ({ uuid: 'MOCK_GROUP_UUID' })),
        getFirstTarget: () => ({ uuid: 'MOCK_TARGET_UUID' }),
      };
    });

    it('should copy fonts to a "Fonts" group and add them to the project', () => {
      // ARRANGE
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'MyFont-Bold.ttf',
        'script.otf',
      ]);
      (mockPbxProject.pbxGroupByName as jest.Mock).mockReturnValue({
        uuid: 'EXISTING_GROUP_UUID',
      });

      // ACT
      addFontsToXcodeProject(
        '/fake/project',
        './fonts',
        'my-app',
        mockPbxProject as XcodeProject
      );

      // ASSERT
      // It should copy both files.
      expect(fs.copySync).toHaveBeenCalledTimes(2);
      expect(fs.copySync).toHaveBeenCalledWith(
        '/fake/project/fonts/MyFont-Bold.ttf',
        '/fake/project/ios/my-app/Resources/MyFont-Bold.ttf',
        { overwrite: true }
      );
      expect(fs.copySync).toHaveBeenCalledWith(
        '/fake/project/fonts/script.otf',
        '/fake/project/ios/my-app/Resources/script.otf',
        { overwrite: true }
      );

      // It should add both files as resources.
      expect(mockPbxProject.addResourceFile).toHaveBeenCalledTimes(2);
      expect(mockPbxProject.addResourceFile).toHaveBeenCalledWith(
        'my-app/Resources/MyFont-Bold.ttf',
        { target: 'MOCK_TARGET_UUID' },
        'EXISTING_GROUP_UUID'
      );
      expect(mockPbxProject.addResourceFile).toHaveBeenCalledWith(
        'my-app/Resources/script.otf',
        { target: 'MOCK_TARGET_UUID' },
        'EXISTING_GROUP_UUID'
      );
    });

    it('should create the "Fonts" group if it does not exist', () => {
      // ARRANGE
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readdirSync as jest.Mock).mockReturnValue(['MyFont-Bold.ttf']);
      (mockPbxProject.pbxGroupByName as jest.Mock).mockReturnValue(null); // Group not found

      // ACT
      addFontsToXcodeProject(
        '/fake/project',
        './fonts',
        'my-app',
        mockPbxProject as XcodeProject
      );

      // ASSERT
      expect(mockPbxProject.addPbxGroup).toHaveBeenCalledWith(
        [],
        'Resources',
        'Resources'
      );
      expect(mockPbxProject.addResourceFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        'MOCK_GROUP_UUID' // Used the new group's UUID
      );
    });
  });
});
