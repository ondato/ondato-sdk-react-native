jest.mock('expo/config-plugins');

import fs from 'fs/promises';
import path from 'path';
import { WarningAggregator } from 'expo/config-plugins';
import { addPods } from '../src/withIos';
import { ONDATO_VERSION_IOS } from '../src/constants';

describe('Config Plugin iOS Tests for SDK 54 - addPods', () => {
  let podfile: string;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    const podfilePath = path.resolve(
      __dirname,
      './fixtures/sdk-54/ios/Podfile'
    );
    await fs.access(podfilePath).catch(() => {
      throw new Error(`Fixture not found: ${podfilePath}`);
    });
    podfile = await fs.readFile(podfilePath, { encoding: 'utf-8' });
  });

  it('adds NFC and screen recorder pods to Podfile', async () => {
    const result = addPods(podfile, {
      enableNfc: true,
      enableScreenRecorder: true,
      enableDocumentResolver: false,
    });
    expect(result).toMatchSnapshot();
    expect(result).toContain(`pod 'OndatoNFC', '= ${ONDATO_VERSION_IOS}'`);
    expect(result).toContain(
      `pod 'OndatoScreenRecorder', '= ${ONDATO_VERSION_IOS}'`
    );
    expect(WarningAggregator.addWarningIOS).not.toHaveBeenCalled();
  });

  it('adds only NFC pod to Podfile', async () => {
    const result = addPods(podfile, {
      enableNfc: true,
      enableScreenRecorder: false,
      enableDocumentResolver: false,
    });
    expect(result).toMatchSnapshot();
    expect(result).toContain(`pod 'OndatoNFC', '= ${ONDATO_VERSION_IOS}'`);
    expect(result).not.toContain(
      `pod 'OndatoScreenRecorder', '= ${ONDATO_VERSION_IOS}'`
    );
    expect(WarningAggregator.addWarningIOS).not.toHaveBeenCalled();
  });

  it('adds only screen recorder pod to Podfile', async () => {
    const result = addPods(podfile, {
      enableNfc: false,
      enableScreenRecorder: true,
      enableDocumentResolver: false,
    });
    expect(result).toMatchSnapshot();
    expect(result).not.toContain(`pod 'OndatoNFC', '= ${ONDATO_VERSION_IOS}'`);
    expect(result).toContain(
      `pod 'OndatoScreenRecorder', '= ${ONDATO_VERSION_IOS}'`
    );
    expect(WarningAggregator.addWarningIOS).not.toHaveBeenCalled();
  });

  it('adds document resolver pod to Podfile', async () => {
    const result = addPods(podfile, {
      enableNfc: false,
      enableScreenRecorder: false,
      enableDocumentResolver: true,
    });
    expect(result).toMatchSnapshot();
    expect(result).not.toContain(`pod 'OndatoNFC', '= ${ONDATO_VERSION_IOS}'`);
    expect(result).not.toContain(
      `pod 'OndatoScreenRecorder', '= ${ONDATO_VERSION_IOS}'`
    );
    expect(result).toContain(
      `pod 'OndatoAutocapture', '= ${ONDATO_VERSION_IOS}'`
    );
    expect(WarningAggregator.addWarningIOS).not.toHaveBeenCalled();
  });

  it('adds all pods (NFC, screen recorder, document resolver) to Podfile', async () => {
    const result = addPods(podfile, {
      enableNfc: true,
      enableScreenRecorder: true,
      enableDocumentResolver: true,
    });
    expect(result).toMatchSnapshot();
    expect(result).toContain(`pod 'OndatoNFC', '= ${ONDATO_VERSION_IOS}'`);
    expect(result).toContain(
      `pod 'OndatoScreenRecorder', '= ${ONDATO_VERSION_IOS}'`
    );
    expect(result).toContain(
      `pod 'OndatoAutocapture', '= ${ONDATO_VERSION_IOS}'`
    );
    expect(WarningAggregator.addWarningIOS).not.toHaveBeenCalled();
  });

  it('skips adding pods when none are enabled', async () => {
    const result = addPods(podfile, {
      enableNfc: false,
      enableScreenRecorder: false,
      enableDocumentResolver: false,
    });
    expect(result).toMatchSnapshot();
    expect(result).toBe(podfile);
    expect(WarningAggregator.addWarningIOS).not.toHaveBeenCalled();
  });

  it('skips adding duplicate NFC pod', async () => {
    const podfileWithNfc = `${podfile}\n  pod 'OndatoNFC', '= ${ONDATO_VERSION_IOS}'`;
    const result = addPods(podfileWithNfc, {
      enableNfc: true,
      enableScreenRecorder: false,
      enableDocumentResolver: false,
    });
    expect(result).toMatchSnapshot();
    expect(result).toBe(podfileWithNfc);
    expect(WarningAggregator.addWarningIOS).not.toHaveBeenCalled();
  });

  it('skips adding duplicate document resolver pod', async () => {
    const podfileWithResolver = `${podfile}\n  pod 'OndatoAutocapture', '= ${ONDATO_VERSION_IOS}'`;
    const result = addPods(podfileWithResolver, {
      enableNfc: false,
      enableScreenRecorder: false,
      enableDocumentResolver: true,
    });
    expect(result).toMatchSnapshot();
    expect(result).toBe(podfileWithResolver);
    expect(WarningAggregator.addWarningIOS).not.toHaveBeenCalled();
  });

  it('logs warning for malformed Podfile', async () => {
    const malformedPodfile = '# Invalid Podfile';
    const result = addPods(malformedPodfile, {
      enableNfc: true,
      enableScreenRecorder: true,
    });
    expect(result).toMatchSnapshot();
    expect(result).toBe(malformedPodfile);
    expect(WarningAggregator.addWarningIOS).toHaveBeenCalledWith(
      'ondato-sdk-react-native',
      'Could not find use_react_native! block in Podfile to add dependencies.'
    );
  });

  it('logs warning for empty Podfile', async () => {
    const emptyPodfile = '';
    const result = addPods(emptyPodfile, {
      enableNfc: true,
      enableScreenRecorder: true,
    });
    expect(result).toMatchSnapshot();
    expect(result).toBe(emptyPodfile);
    expect(WarningAggregator.addWarningIOS).toHaveBeenCalledWith(
      'ondato-sdk-react-native',
      'Could not find use_react_native! block in Podfile to add dependencies.'
    );
  });
});
