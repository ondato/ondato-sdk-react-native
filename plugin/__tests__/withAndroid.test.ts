jest.mock('expo/config-plugins');

import fs from 'fs/promises';
import path from 'path';
import { WarningAggregator } from 'expo/config-plugins';

import { addMavenRepo, addDependencies } from '../src/withAndroid';
import { ONDATO_MAVEN_REPO_URL } from '../src/constants';

describe('Config Plugin Android Tests for SDK 54', function () {
  let appBuildGradle: string;
  let projectBuildGradle: string;

  beforeAll(async function () {
    const projectPath = path.resolve(
      __dirname,
      './fixtures/sdk-54/android/build.gradle'
    );
    const appPath = path.resolve(
      __dirname,
      './fixtures/sdk-54/android/app/build.gradle'
    );
    await Promise.all([
      fs.access(projectPath).catch(() => {
        throw new Error(`Fixture not found: ${projectPath}`);
      }),
      fs.access(appPath).catch(() => {
        throw new Error(`Fixture not found: ${appPath}`);
      }),
    ]);
    projectBuildGradle = await fs.readFile(projectPath, { encoding: 'utf-8' });
    appBuildGradle = await fs.readFile(appPath, { encoding: 'utf-8' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds maven repo to android/build.gradle', async function () {
    const result = addMavenRepo(projectBuildGradle, ONDATO_MAVEN_REPO_URL);
    expect(result).toMatchSnapshot();
    expect(WarningAggregator.addWarningAndroid).not.toHaveBeenCalled();
  });

  it('adds custom maven repo to android/build.gradle', async () => {
    const customUrl = 'https://custom.maven.repo';
    const result = addMavenRepo(projectBuildGradle, customUrl);
    expect(result).toMatchSnapshot();
    expect(WarningAggregator.addWarningAndroid).not.toHaveBeenCalled();
  });

  it('logs warning for missing repositories block', async () => {
    const malformedGradle = 'allprojects { }';
    const result = addMavenRepo(malformedGradle, ONDATO_MAVEN_REPO_URL);
    expect(result).toBe(malformedGradle);
    expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
      'ondato-sdk-react-native',
      'Could not find "allprojects { repositories }" block to add maven repository.'
    );
  });

  it('handles empty build.gradle', async () => {
    const emptyGradle = '';
    const result = addMavenRepo(emptyGradle, ONDATO_MAVEN_REPO_URL);
    expect(result).toBe(emptyGradle);
    expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
      'ondato-sdk-react-native',
      'Could not find "allprojects { repositories }" block to add maven repository.'
    );
  });

  it('does not add dependencies to android/app/build.gradle', async function () {
    const result = addDependencies(appBuildGradle, {
      enableNfc: false,
      enableScreenRecorder: false,
    });
    expect(result).toMatchSnapshot();
  });

  it('adds nfc dependency to android/app/build.gradle', async function () {
    const result = addDependencies(appBuildGradle, {
      enableNfc: true,
      enableScreenRecorder: false,
    });
    expect(result).toMatchSnapshot();
  });

  it('adds screen recorder dependency to android/app/build.gradle', async function () {
    const result = addDependencies(appBuildGradle, {
      enableNfc: false,
      enableScreenRecorder: true,
    });
    expect(result).toMatchSnapshot();
  });

  it('adds nfc and screen recorder dependency to android/app/build.gradle', async function () {
    const result = addDependencies(appBuildGradle, {
      enableNfc: true,
      enableScreenRecorder: true,
    });
    expect(result).toMatchSnapshot();
  });
});
