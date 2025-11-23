import {
  type ConfigPlugin,
  type XcodeProject,
  type InfoPlist,
  withDangerousMod,
  withXcodeProject,
  withInfoPlist,
  WarningAggregator,
} from 'expo/config-plugins';
import path from 'path';
import fs from 'fs-extra';
import { type OndatoPluginProps } from '.';

const ANDROID_FONT_PATH = 'android/app/src/main/res/font';
const IOS_FONTS_GROUP_NAME = 'Resources';

export const withCustomFonts: ConfigPlugin<OndatoPluginProps> = (
  config,
  props
) => {
  const customFontsPath = props.customFontsPath;
  if (!customFontsPath) {
    return config;
  }
  config = withAndroidFonts(config, { customFontsPath });
  config = withIosFonts(config, { customFontsPath });
  return config;
};

const withAndroidFonts: ConfigPlugin<{ customFontsPath: string }> = (
  config,
  { customFontsPath }
) => {
  return withDangerousMod(config, [
    'android',
    async (conf) => {
      await copyAndroidFonts(conf.modRequest.projectRoot, customFontsPath);
      return conf;
    },
  ]);
};

export const copyAndroidFonts = async (
  projectRoot: string,
  customFontsPath: string
): Promise<void> => {
  const sourcePath = path.join(projectRoot, customFontsPath);

  if (!fs.existsSync(sourcePath)) {
    WarningAggregator.addWarningAndroid(
      'ondato-sdk-react-native',
      `Custom fonts path not found at ${sourcePath}. Skipping.`
    );
    return;
  }

  const destPath = path.join(projectRoot, ANDROID_FONT_PATH);
  fs.ensureDirSync(destPath);

  const fontFiles = fs
    .readdirSync(sourcePath)
    .filter((file) => file.endsWith('.ttf') || file.endsWith('.otf'));

  for (const fontFile of fontFiles) {
    const sourceFile = path.join(sourcePath, fontFile);
    // Android requires lowercase_with_underscores.
    const destFile = path.join(
      destPath,
      fontFile.replace(/-/g, '_').toLowerCase()
    );

    try {
      fs.copySync(sourceFile, destFile, { overwrite: true });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      WarningAggregator.addWarningAndroid(
        'ondato-sdk-react-native',
        `Could not copy Android font ${fontFile}: ${errorMessage}`
      );
    }
  }
};

const withIosFonts: ConfigPlugin<{ customFontsPath: string }> = (
  config,
  { customFontsPath }
) => {
  config = withIosFontPList(config, { customFontsPath });
  config = withIosFontFiles(config, { customFontsPath });
  return config;
};

const withIosFontPList: ConfigPlugin<{ customFontsPath: string }> = (
  config,
  { customFontsPath }
) => {
  return withInfoPlist(config, (conf) => {
    conf.modResults = addFontsToPList(
      conf.modRequest.projectRoot,
      customFontsPath,
      conf.modResults
    );
    return conf;
  });
};

const withIosFontFiles: ConfigPlugin<{ customFontsPath: string }> = (
  config,
  { customFontsPath }
) => {
  return withXcodeProject(config, (conf) => {
    conf.modResults = addFontsToXcodeProject(
      conf.modRequest.projectRoot,
      customFontsPath,
      conf.modRequest.projectName!,
      conf.modResults
    );
    return conf;
  });
};

export const addFontsToPList = (
  projectRoot: string,
  customFontsPath: string,
  infoPlist: InfoPlist
): InfoPlist => {
  const sourcePath = path.join(projectRoot, customFontsPath);
  if (!fs.existsSync(sourcePath)) {
    // Warning is handled by the other function, no need to repeat.
    return infoPlist;
  }
  const fontFiles = fs
    .readdirSync(sourcePath)
    .filter((file) => file.endsWith('.ttf') || file.endsWith('.otf'));

  const existingFonts = (infoPlist.UIAppFonts as string[]) || [];
  const newFonts = [...existingFonts];

  for (const fontFile of fontFiles) {
    if (!newFonts.includes(fontFile)) {
      newFonts.push(fontFile);
    }
  }

  infoPlist.UIAppFonts = newFonts;
  return infoPlist;
};

export const addFontsToXcodeProject = (
  projectRoot: string,
  customFontsPath: string,
  projectName: string,
  pbxProject: XcodeProject
): XcodeProject => {
  const sourcePath = path.join(projectRoot, customFontsPath);
  if (!fs.existsSync(sourcePath)) {
    WarningAggregator.addWarningIOS(
      'ondato-sdk-react-native',
      `Custom fonts path not found at ${sourcePath}. Skipping.`
    );
    return pbxProject;
  }

  let resourcesGroup = pbxProject.pbxGroupByName(IOS_FONTS_GROUP_NAME);
  if (!resourcesGroup) {
    resourcesGroup = pbxProject.addPbxGroup(
      [],
      IOS_FONTS_GROUP_NAME,
      IOS_FONTS_GROUP_NAME
    );
  }

  const fontFiles = fs
    .readdirSync(sourcePath)
    .filter((file) => file.endsWith('.ttf') || file.endsWith('.otf'));

  for (const fontFile of fontFiles) {
    const sourceFile = path.join(sourcePath, fontFile);
    const destPath = path.join(
      projectRoot,
      'ios',
      projectName,
      IOS_FONTS_GROUP_NAME,
      fontFile
    );
    const projectRelativePath = path.join(
      projectName,
      IOS_FONTS_GROUP_NAME,
      fontFile
    );
    try {
      fs.ensureDirSync(path.dirname(destPath));
      fs.copySync(sourceFile, destPath, { overwrite: true });

      pbxProject.addResourceFile(
        projectRelativePath,
        { target: pbxProject.getFirstTarget().uuid },
        resourcesGroup.uuid
      );
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      WarningAggregator.addWarningIOS(
        'ondato-sdk-react-native',
        `Could not copy iOS font ${fontFile}: ${errorMessage}`
      );
    }
  }
  return pbxProject;
};
