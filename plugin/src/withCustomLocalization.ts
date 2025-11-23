import {
  type ConfigPlugin,
  type XcodeProject,
  withDangerousMod,
  withXcodeProject,
  WarningAggregator,
} from 'expo/config-plugins';
import path from 'path';
import fs from 'fs-extra';
import { type OndatoPluginProps } from '.';
import { mergeStringsXml } from './androidLocalization';

const ANDROID_RES_PATH = 'android/app/src/main/res';

export const withCustomLocalization: ConfigPlugin<OndatoPluginProps> = (
  config,
  props
) => {
  const customLocalizationPath = props.customLocalizationPath;
  if (!customLocalizationPath) {
    return config;
  }

  config = withAndroidLocalization(config, { customLocalizationPath });
  config = withIosLocalization(config, { customLocalizationPath });

  return config;
};

const withAndroidLocalization: ConfigPlugin<{
  customLocalizationPath: string;
}> = (config, { customLocalizationPath }) => {
  return withDangerousMod(config, [
    'android',
    async (conf) => {
      await withMergedStrings(
        conf.modRequest.projectRoot,
        customLocalizationPath
      );
      return conf;
    },
  ]);
};

export const withMergedStrings = async (
  projectRoot: string,
  customLocalizationPath: string
): Promise<void> => {
  const sourcePath = path.join(projectRoot, customLocalizationPath, 'android');

  if (!fs.existsSync(sourcePath)) {
    WarningAggregator.addWarningAndroid(
      'ondato-sdk-react-native',
      `Custom localization path for Android not found at ${sourcePath}. Skipping.`
    );
    return;
  }

  const langFolders = fs
    .readdirSync(sourcePath)
    .filter((file) => file.startsWith('values'));

  for (const langFolder of langFolders) {
    const sourceStringsPath = path.join(sourcePath, langFolder, 'strings.xml');
    if (!fs.existsSync(sourceStringsPath)) continue;

    const destStringsPath = path.join(
      projectRoot,
      ANDROID_RES_PATH,
      langFolder,
      'strings.xml'
    );

    try {
      await mergeStringsXml(sourceStringsPath, destStringsPath);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      WarningAggregator.addWarningAndroid(
        'ondato-sdk-react-native',
        `Could not merge Android localization file ${sourceStringsPath}: ${errorMessage}`
      );
    }
  }
};

const withIosLocalization: ConfigPlugin<{ customLocalizationPath: string }> = (
  config,
  { customLocalizationPath }
) => {
  return withXcodeProject(config, (conf) => {
    const projectRoot = conf.modRequest.projectRoot;
    const sourcePath = path.join(projectRoot, customLocalizationPath, 'ios');

    const langFolders = getIOSFolders(sourcePath);
    if (langFolders.length === 0) {
      return conf;
    }

    const pbxProject = conf.modResults;
    const projectGroupName = conf.modRequest.projectName!;
    const targetPath = path.join(projectRoot, 'ios', projectGroupName);

    modifyXcodeProject(
      pbxProject,
      projectGroupName,
      sourcePath,
      targetPath,
      langFolders
    );

    return conf;
  });
};

export const getIOSFolders = (sourcePath: string): string[] => {
  if (!fs.existsSync(sourcePath)) {
    WarningAggregator.addWarningIOS(
      'ondato-sdk-react-native',
      `Custom localization path for iOS not found at ${sourcePath}. Skipping.`
    );
    return [];
  }

  return fs
    .readdirSync(sourcePath)
    .filter((folder) => folder.endsWith('.lproj'));
};

export const modifyXcodeProject = (
  pbxProject: XcodeProject,
  projectGroupName: string,
  sourcePath: string,
  targetPath: string,
  langFolders: string[]
) => {
  let resourcesGroup = pbxProject.pbxGroupByName('Resources');
  if (!resourcesGroup) {
    resourcesGroup = pbxProject.addPbxGroup([], 'Resources', 'Resources');
  }

  for (const langFolder of langFolders) {
    const stringsFileName = 'OndatoSDK.strings';
    const sourceStringsPath = path.join(
      sourcePath,
      langFolder,
      stringsFileName
    );

    if (!fs.existsSync(sourceStringsPath)) continue;

    const destLprojPath = path.join(targetPath, langFolder);
    fs.ensureDirSync(destLprojPath);
    fs.copySync(sourceStringsPath, path.join(destLprojPath, stringsFileName), {
      overwrite: true,
    });

    const projectRelativePath = path.join(
      projectGroupName,
      langFolder,
      stringsFileName
    );

    pbxProject.addResourceFile(
      projectRelativePath,
      { target: pbxProject.getFirstTarget().uuid },
      resourcesGroup.uuid
    );
  }
};
