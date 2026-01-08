jest.mock('expo/config-plugins');

import fs from 'fs/promises';
import path from 'path';
import { WarningAggregator } from 'expo/config-plugins';

import { addMavenRepo, addDependencies } from '../src/withAndroid';
import { MAVEN_REPOS, ONDATO_VERSION_ANDROID } from '../src/constants';

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

  it('adds maven repos to android/build.gradle', async function () {
    const result = addMavenRepo(projectBuildGradle);
    expect(result).toMatchSnapshot();
    expect(WarningAggregator.addWarningAndroid).not.toHaveBeenCalled();
  });

  it('does not add duplicate maven repos if already present', async () => {
    // Pre-add the repos to simulate existing
    const repoLines = MAVEN_REPOS.map((repo) => `maven { url "${repo}" }`).join(
      '\n    '
    );
    const modifiedGradle = projectBuildGradle.replace(
      /allprojects\s*{\s*repositories\s*{/,
      `$&\n    ${repoLines}`
    );
    const result = addMavenRepo(modifiedGradle);
    expect(result).toBe(modifiedGradle); // No change
    expect(WarningAggregator.addWarningAndroid).not.toHaveBeenCalled();
  });

  it('logs warning for missing repositories block', async () => {
    const malformedGradle = 'allprojects { }';
    const result = addMavenRepo(malformedGradle);
    expect(result).toBe(malformedGradle);
    expect(WarningAggregator.addWarningAndroid).toHaveBeenCalledWith(
      'ondato-sdk-react-native',
      'Could not find "allprojects { repositories }" block to add maven repository.'
    );
  });

  it('handles empty build.gradle', async () => {
    const emptyGradle = '';
    const result = addMavenRepo(emptyGradle);
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
      enableDocumentResolver: false,
    });
    expect(result).toMatchSnapshot();
  });

  it('adds nfc dependency to android/app/build.gradle', async function () {
    const result = addDependencies(appBuildGradle, {
      enableNfc: true,
      enableScreenRecorder: false,
      enableDocumentResolver: false,
    });
    expect(result).toMatchSnapshot();
  });

  it('adds screen recorder dependency to android/app/build.gradle', async function () {
    const result = addDependencies(appBuildGradle, {
      enableNfc: false,
      enableScreenRecorder: true,
      enableDocumentResolver: false,
    });
    expect(result).toMatchSnapshot();
  });

  it('adds nfc and screen recorder dependencies to android/app/build.gradle', async function () {
    const result = addDependencies(appBuildGradle, {
      enableNfc: true,
      enableScreenRecorder: true,
      enableDocumentResolver: false,
    });
    expect(result).toMatchSnapshot();
  });

  it('adds document resolver dependency to android/app/build.gradle', async function () {
    const result = addDependencies(appBuildGradle, {
      enableNfc: false,
      enableScreenRecorder: false,
      enableDocumentResolver: true,
    });
    expect(result).toContain(
      `implementation("com.kyc.ondato:document-autoresolver:${ONDATO_VERSION_ANDROID}")`
    );
    expect(result).toMatchSnapshot();
  });

  it('adds all dependencies (nfc, screen recorder, document resolver) to android/app/build.gradle', async function () {
    const result = addDependencies(appBuildGradle, {
      enableNfc: true,
      enableScreenRecorder: true,
      enableDocumentResolver: true,
    });
    expect(result).toContain('com.kyc.ondato:nfc-reader');
    expect(result).toContain('com.kyc.ondato:screen-recorder');
    expect(result).toContain('com.kyc.ondato:document-autoresolver');
    expect(result).toMatchSnapshot();
  });

  it('does not add duplicate dependencies if already present', async () => {
    // Pre-add the deps to simulate existing
    const nfcDep = `implementation("com.kyc.ondato:nfc-reader:${ONDATO_VERSION_ANDROID}")`;
    const screenDep = `implementation("com.kyc.ondato:screen-recorder:${ONDATO_VERSION_ANDROID}")`;
    const docDep = `implementation("com.kyc.ondato:document-autoresolver:${ONDATO_VERSION_ANDROID}")`;

    const modifiedGradle = appBuildGradle.replace(
      /dependencies\s*{/,
      `$&\n    ${nfcDep}\n    ${screenDep}\n    ${docDep}`
    );
    const result = addDependencies(modifiedGradle, {
      enableNfc: true,
      enableScreenRecorder: true,
      enableDocumentResolver: true,
    });
    expect(result).toBe(modifiedGradle);
  });
});
