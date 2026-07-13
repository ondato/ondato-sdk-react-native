import { it, describe, expect, jest, beforeEach } from '@jest/globals';

type BuildGradleConfig = {
  modResults: {
    language: string;
    contents: string;
  };
};

let capturedBuildGradleCallback:
  | ((config: BuildGradleConfig) => BuildGradleConfig)
  | undefined;

jest.mock('expo/config-plugins', () => {
  const actualConfigPlugins = jest.requireActual(
    'expo/config-plugins'
  ) as Record<string, unknown>;

  return {
    ...actualConfigPlugins,
    withProjectBuildGradle: jest.fn((config, callback) => {
      capturedBuildGradleCallback = callback as (
        config: BuildGradleConfig
      ) => BuildGradleConfig;

      return config;
    }),
  };
});
jest.mock('expo-build-properties', () => ({
  withBuildProperties: jest.fn((config) => config),
}));

import { withBuildProperties } from 'expo-build-properties';
import { withProjectBuildGradle } from 'expo/config-plugins';

import {
  COMPILE_SDK_VERSION,
  DEPLOYMENT_TARGET,
  KOTLIN_VERSION,
  MIN_SDK_VERSION,
} from '../src/constants';
import { withOndatoBuildProperties } from '../src/withBuildProperties';

const withBuildPropertiesMock = withBuildProperties as jest.MockedFunction<
  typeof withBuildProperties
>;
const withProjectBuildGradleMock =
  withProjectBuildGradle as jest.MockedFunction<typeof withProjectBuildGradle>;

function runPluginAndGetGradleCallback() {
  capturedBuildGradleCallback = undefined;

  const expoConfig = {} as Parameters<typeof withOndatoBuildProperties>[0];

  withOndatoBuildProperties(expoConfig);

  expect(withProjectBuildGradleMock).toHaveBeenCalledTimes(1);
  expect(capturedBuildGradleCallback).toBeDefined();

  return capturedBuildGradleCallback!;
}

describe('withOndatoBuildProperties', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedBuildGradleCallback = undefined;
  });

  it('passes the expected Expo build properties', () => {
    runPluginAndGetGradleCallback();

    expect(withBuildPropertiesMock).toHaveBeenCalledWith(
      {},
      {
        android: {
          minSdkVersion: MIN_SDK_VERSION,
          kotlinVersion: KOTLIN_VERSION,
          compileSdkVersion: COMPILE_SDK_VERSION,
        },
        ios: {
          deploymentTarget: DEPLOYMENT_TARGET,
        },
      }
    );
  });

  it('updates kotlin gradle plugin dependency when build.gradle uses groovy syntax', () => {
    const applyBuildGradlePatch = runPluginAndGetGradleCallback();

    const config: BuildGradleConfig = {
      modResults: {
        language: 'groovy',
        contents: `buildscript {
  dependencies {
    classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin'
  }
}`,
      },
    };

    const result = applyBuildGradlePatch(config);

    expect(result.modResults.contents).toContain(
      `classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}"`
    );
    expect(result.modResults.contents).not.toContain(
      "classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin'"
    );
  });

  it('updates kotlin gradle plugin dependency when build.gradle uses kt syntax', () => {
    const applyBuildGradlePatch = runPluginAndGetGradleCallback();

    const config: BuildGradleConfig = {
      modResults: {
        language: 'kt',
        contents: `buildscript {
  dependencies {
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin")
  }
}`,
      },
    };

    const result = applyBuildGradlePatch(config);

    expect(result.modResults.contents).toContain(
      `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:${KOTLIN_VERSION}")`
    );
  });

  it('does not downgrade an existing newer kotlin gradle plugin version', () => {
    const applyBuildGradlePatch = runPluginAndGetGradleCallback();

    const config: BuildGradleConfig = {
      modResults: {
        language: 'groovy',
        contents: `buildscript {
  dependencies {
    classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:2.3.0")
  }
}`,
      },
    };

    const result = applyBuildGradlePatch(config);

    expect(result.modResults.contents).toBe(config.modResults.contents);
  });

  it('leaves non-groovy and non-kt build files unchanged', () => {
    const applyBuildGradlePatch = runPluginAndGetGradleCallback();

    const config: BuildGradleConfig = {
      modResults: {
        language: 'text',
        contents: `buildscript {
  dependencies {
    classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin'
  }
}`,
      },
    };

    const result = applyBuildGradlePatch(config);

    expect(result.modResults.contents).toBe(config.modResults.contents);
  });
});
