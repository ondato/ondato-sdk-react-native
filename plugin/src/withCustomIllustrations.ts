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

const ANDROID_RES_PATH = 'android/app/src/main/res';

export const withCustomIllustrations: ConfigPlugin<OndatoPluginProps> = (
  config,
  props
) => {
  const customIllustrationsPath = props.customIllustrationsPath;
  if (!customIllustrationsPath) {
    return config;
  }

  config = withAndroidIllustrations(config, { customIllustrationsPath });
  config = withIosIllustrations(config, { customIllustrationsPath });

  return config;
};

const withAndroidIllustrations: ConfigPlugin<{
  customIllustrationsPath: string;
}> = (config, { customIllustrationsPath }) => {
  return withDangerousMod(config, [
    'android',
    async (conf) => {
      await copyAndroidIllustrations(
        conf.modRequest.projectRoot,
        customIllustrationsPath
      );
      return conf;
    },
  ]);
};

export const copyAndroidIllustrations = async (
  projectRoot: string,
  customIllustrationsPath: string
): Promise<void> => {
  const sourcePath = path.join(projectRoot, customIllustrationsPath, 'android');

  if (!fs.existsSync(sourcePath)) {
    WarningAggregator.addWarningAndroid(
      'ondato-sdk-react-native',
      `Custom illustrations path for Android not found at ${sourcePath}. Skipping.`
    );
    return;
  }

  // Define the standard Android resource subdirectories for illustrations.
  const resourceDirs = ['drawable', 'raw'];

  for (const dir of resourceDirs) {
    const sourceDir = path.join(sourcePath, dir);
    const destDir = path.join(projectRoot, ANDROID_RES_PATH, dir);

    if (fs.existsSync(sourceDir)) {
      try {
        fs.ensureDirSync(destDir);
        fs.copySync(sourceDir, destDir, { overwrite: true });
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        WarningAggregator.addWarningAndroid(
          'ondato-sdk-react-native',
          `Could not copy Android illustrations from ${sourceDir}: ${errorMessage}`
        );
      }
    }
  }
};

const withIosIllustrations: ConfigPlugin<{
  customIllustrationsPath: string;
}> = (config, { customIllustrationsPath }) => {
  return withXcodeProject(config, (conf) => {
    copyIosIllustrations(
      conf.modRequest.projectRoot,
      customIllustrationsPath,
      conf.modRequest.projectName!,
      conf.modResults
    );
    return conf;
  });
};

export const copyIosIllustrations = (
  projectRoot: string,
  customIllustrationsPath: string,
  projectName: string,
  pbxProject: XcodeProject
) => {
  const sourcePath = path.join(projectRoot, customIllustrationsPath, 'ios');

  if (!fs.existsSync(sourcePath)) {
    WarningAggregator.addWarningIOS(
      'ondato-sdk-react-native',
      `Custom illustrations path for iOS not found at ${sourcePath}. Skipping.`
    );
    return;
  }

  // Find or create the main "Resources" group in the Xcode project.
  let resourcesGroup = pbxProject.pbxGroupByName('Resources');
  if (!resourcesGroup) {
    resourcesGroup = pbxProject.addPbxGroup([], 'Resources', 'Resources');
  }

  const files = fs.readdirSync(sourcePath);
  for (const file of files) {
    const sourceFile = path.join(sourcePath, file);

    if (file.endsWith('.json')) {
      // --- Handle Lottie Animations ---
      const destPath = path.join(projectRoot, 'ios', projectName, file);
      const projectRelativePath = path.join(projectName, file);

      try {
        fs.copySync(sourceFile, destPath, { overwrite: true });
        // Add file to the project and build phase.
        pbxProject.addResourceFile(
          projectRelativePath,
          { target: pbxProject.getFirstTarget().uuid },
          resourcesGroup.uuid
        );
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        WarningAggregator.addWarningIOS(
          'ondato-sdk-react-native',
          `Could not copy iOS Lottie animation ${file}: ${errorMessage}`
        );
      }
    } else if (
      file.endsWith('.png') ||
      file.endsWith('.jpg') ||
      file.endsWith('.jpeg')
    ) {
      // --- Handle Images ---
      // We are creating an Imageset within the Asset Catalog.
      const assetName = path.basename(file, path.extname(file));
      const assetCatalogPath = path.join(
        projectRoot,
        'ios',
        projectName,
        'Images.xcassets'
      );
      const imageSetPath = path.join(assetCatalogPath, `${assetName}.imageset`);

      try {
        // Create the .imageset folder.
        fs.ensureDirSync(imageSetPath);

        // Copy the image file into it.
        fs.copySync(sourceFile, path.join(imageSetPath, file));

        // Create the Contents.json file for the imageset.
        const contentsJson = {
          images: [
            {
              filename: file,
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
        };

        fs.writeJsonSync(
          path.join(imageSetPath, 'Contents.json'),
          contentsJson
        );
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        WarningAggregator.addWarningIOS(
          'ondato-sdk-react-native',
          `Could not copy iOS image ${file} to Asset Catalog: ${errorMessage}`
        );
      }
    }
  }
};
