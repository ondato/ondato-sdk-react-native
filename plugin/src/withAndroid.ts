import {
  AndroidConfig,
  withAppBuildGradle,
  withProjectBuildGradle,
  withAndroidColors,
  withAndroidColorsNight,
  withStringsXml,
  WarningAggregator,
  type ConfigPlugin,
} from 'expo/config-plugins';
import {
  ONDATO_MAVEN_REPO_URL,
  ONDATO_VERSION_ANDROID,
  DEFAULT_COLORS,
} from './constants';
import { type OndatoPluginProps } from '.';
import { merge } from 'lodash';

const { Colors, Strings, Resources } = AndroidConfig;

export const withAndroidConfiguration: ConfigPlugin<OndatoPluginProps> = (
  config,
  props
) => {
  config = withCustomRepository(config, props);
  config = withExtraDependencies(config, props);
  config = withTheming(config, props);
  config = withLocalization(config, props);

  return config;
};

export const withCustomRepository: ConfigPlugin<OndatoPluginProps> = (
  configuration,
  props
) => {
  let mavenRepoUrl = props.android?.mavenRepoUrl ?? ONDATO_MAVEN_REPO_URL;

  return withProjectBuildGradle(configuration, (config) => {
    if (config.modResults.language !== 'groovy') {
      WarningAggregator.addWarningAndroid(
        'ondato-sdk-react-native',
        'Cannot configure project build.gradle: not Groovy.'
      );
      return config;
    }

    config.modResults.contents = addMavenRepo(
      config.modResults.contents,
      mavenRepoUrl
    );
    return config;
  });
};

export const withExtraDependencies: ConfigPlugin<OndatoPluginProps> = (
  configuration,
  props
) => {
  let enableNfc = props.enableNfc ?? false;
  let enableScreenRecorder = props.enableScreenRecorder ?? false;

  return withAppBuildGradle(configuration, (config) => {
    if (config.modResults.language !== 'groovy') {
      WarningAggregator.addWarningAndroid(
        'ondato-sdk-react-native',
        'Cannot configure app/build.gradle: not Groovy.'
      );
      return config;
    }

    config.modResults.contents = addDependencies(config.modResults.contents, {
      enableNfc,
      enableScreenRecorder,
    });
    return config;
  });
};

export const addMavenRepo = (
  buildGradle: string,
  mavenRepoUrl: string
): string => {
  const mavenRepoLine = `maven { url "${mavenRepoUrl}" }`;

  if (buildGradle.includes(mavenRepoUrl)) {
    return buildGradle;
  }

  const newBuildGradle = buildGradle.replace(
    /allprojects\s*{\s*repositories\s*{/,
    `$&
    ${mavenRepoLine}`
  );

  if (newBuildGradle === buildGradle) {
    WarningAggregator.addWarningAndroid(
      'ondato-sdk-react-native',
      'Could not find "allprojects { repositories }" block to add maven repository.'
    );
  }

  return newBuildGradle;
};

export const addDependencies = (
  buildGradle: string,
  {
    enableNfc,
    enableScreenRecorder,
  }: { enableNfc: boolean; enableScreenRecorder: boolean }
): string => {
  const dependenciesToAdd = [];
  const nfcDependency = `implementation "com.kyc.ondato:nfc-reader:${ONDATO_VERSION_ANDROID}"`;
  const screenRecorderDependency = `implementation "com.kyc.ondato:recorder:${ONDATO_VERSION_ANDROID}"`;

  if (enableNfc && !buildGradle.includes('com.kyc.ondato:nfc-reader')) {
    dependenciesToAdd.push(nfcDependency);
  }
  if (
    enableScreenRecorder &&
    !buildGradle.includes('com.kyc.ondato:screen-recorder')
  ) {
    dependenciesToAdd.push(screenRecorderDependency);
  }

  if (dependenciesToAdd.length === 0) {
    return buildGradle;
  }

  const dependencyLines = dependenciesToAdd
    .map((dep) => `    ${dep}`)
    .join('\n');

  return buildGradle.replace(/dependencies\s*{/, `$&\n${dependencyLines}`);
};

export const withTheming: ConfigPlugin<OndatoPluginProps> = (config, props) => {
  config = withColors(config, props);
  config = withColorsNight(config, props);

  return config;
};

export const withColors: ConfigPlugin<OndatoPluginProps> = (
  configuration,
  props
) => {
  return withAndroidColors(configuration, (config) => {
    const colors = merge(DEFAULT_COLORS, props.android?.colors ?? {});

    if (Object.keys(colors).length === 0) {
      return config;
    }

    for (const [colorName, colorValue] of Object.entries(colors)) {
      Colors.assignColorValue(config.modResults, {
        name: colorName,
        value: colorValue,
      });
    }

    return config;
  });
};

export const withColorsNight: ConfigPlugin<OndatoPluginProps> = (
  configuration,
  props
) => {
  return withAndroidColorsNight(configuration, (config) => {
    const colors = merge(DEFAULT_COLORS, props.android?.colors ?? {});

    if (Object.keys(colors).length === 0) {
      return config;
    }

    for (const [colorName, colorValue] of Object.entries(colors)) {
      Colors.assignColorValue(config.modResults, {
        name: colorName,
        value: colorValue,
      });
    }

    return config;
  });
};

export const withLocalization: ConfigPlugin<OndatoPluginProps> = (
  configuration,
  props
) => {
  return withStringsXml(configuration, (config) => {
    const translations = props.android?.defaultTranslationOverrides ?? {};

    if (Object.keys(translations).length === 0) {
      return config;
    }

    const stringItems: AndroidConfig.Resources.ResourceItemXML[] = [];
    for (const [name, value] of Object.entries(translations)) {
      stringItems.push(
        Resources.buildResourceItem({
          name,
          value,
          translatable: true,
        })
      );
    }

    config.modResults = Strings.setStringItem(stringItems, config.modResults);
    return config;
  });
};
