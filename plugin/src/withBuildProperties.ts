import { type ConfigPlugin, withProjectBuildGradle } from 'expo/config-plugins';
import { withBuildProperties } from 'expo-build-properties';
import {
  MIN_SDK_VERSION,
  DEPLOYMENT_TARGET,
  KOTLIN_VERSION,
  COMPILE_SDK_VERSION,
} from './constants';

export const withOndatoBuildProperties: ConfigPlugin = (config) => {
  config = withBuildProperties(config, {
    android: {
      minSdkVersion: MIN_SDK_VERSION,
      kotlinVersion: KOTLIN_VERSION,
      compileSdkVersion: COMPILE_SDK_VERSION,
    },
    ios: {
      deploymentTarget: DEPLOYMENT_TARGET,
    },
  });
  config = withKotlinGradlePluginPatch(config);

  return config;
};

const withKotlinGradlePluginPatch: ConfigPlugin = (configuration) => {
  return withProjectBuildGradle(configuration, (config) => {
    if (
      config.modResults.language === 'groovy' ||
      config.modResults.language === 'kt'
    ) {
      const kotlinVersion = KOTLIN_VERSION;

      // Matches: classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
      const searchRegex =
        /classpath\s*\(\s*['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin(?::([0-9]+(?:\.[0-9]+)*))?['"]\s*\)/g;
      const replacement = `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}")`;

      // Matches: classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin' (no parentheses)
      const searchRegexNoParens =
        /classpath\s+['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin(?::([0-9]+(?:\.[0-9]+)*))?['"]/g;
      const replacementNoParens = `classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:${kotlinVersion}"`;

      let newContents = config.modResults.contents.replace(
        searchRegex,
        (match, existingVersion?: string) => {
          if (
            existingVersion &&
            compareVersions(existingVersion, kotlinVersion) >= 0
          ) {
            return match;
          }

          return replacement;
        }
      );
      newContents = newContents.replace(
        searchRegexNoParens,
        (match, existingVersion?: string) => {
          if (
            existingVersion &&
            compareVersions(existingVersion, kotlinVersion) >= 0
          ) {
            return match;
          }

          return replacementNoParens;
        }
      );

      config.modResults.contents = newContents;
    }
    return config;
  });
};

function compareVersions(firstVersion: string, secondVersion: string): number {
  const firstParts = firstVersion.split('.').map(Number);
  const secondParts = secondVersion.split('.').map(Number);
  const partsLength = Math.max(firstParts.length, secondParts.length);

  for (let index = 0; index < partsLength; index += 1) {
    const firstPart = firstParts[index] ?? 0;
    const secondPart = secondParts[index] ?? 0;

    if (firstPart > secondPart) {
      return 1;
    }

    if (firstPart < secondPart) {
      return -1;
    }
  }

  return 0;
}
