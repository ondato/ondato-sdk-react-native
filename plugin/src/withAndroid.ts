import {
  type ConfigPlugin,
  withAppBuildGradle,
  withProjectBuildGradle,
  WarningAggregator,
} from 'expo/config-plugins';
import { ONDATO_VERSION_ANDROID, MAVEN_REPOS } from './constants';
import { type OndatoPluginProps } from '.';

export const withAndroidConfiguration: ConfigPlugin<OndatoPluginProps> = (
  config,
  props
) => {
  config = withCustomRepository(config);
  config = withExtraDependencies(config, props);

  return config;
};

export const withCustomRepository: ConfigPlugin<void> = (configuration) => {
  return withProjectBuildGradle(configuration, (config) => {
    if (config.modResults.language !== 'groovy') {
      WarningAggregator.addWarningAndroid(
        'ondato-sdk-react-native',
        'Cannot configure project build.gradle: not Groovy.'
      );
      return config;
    }

    config.modResults.contents = addMavenRepo(config.modResults.contents);
    return config;
  });
};

export const withExtraDependencies: ConfigPlugin<OndatoPluginProps> = (
  configuration,
  props
) => {
  const enableNfc = props.enableNfc ?? false;
  const enableScreenRecorder = props.enableScreenRecorder ?? false;

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

export const addMavenRepo = (buildGradle: string): string => {
  const mavenRepoLines = MAVEN_REPOS.map((repo) => `maven { url "${repo}" }`)
    .filter((repo) => !buildGradle.includes(repo))
    .map((repo) => `    ${repo}`)
    .join('\n');

  if (mavenRepoLines === '') {
    return buildGradle;
  }

  const newBuildGradle = buildGradle.replace(
    /allprojects\s*{\s*repositories\s*{/,
    `$&
    ${mavenRepoLines}`
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
  const nfcDependency = `implementation("com.kyc.ondato:nfc-reader:${ONDATO_VERSION_ANDROID}") { exclude group: "com.squareup.okhttp3" }`;
  const screenRecorderDependency = `implementation("com.kyc.ondato:screen-recorder:${ONDATO_VERSION_ANDROID}") { exclude group: "com.squareup.okhttp3" }`;

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
