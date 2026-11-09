import {
  it,
  describe,
  expect,
  jest,
  beforeEach,
  beforeAll,
} from '@jest/globals';

jest.mock('expo/config-plugins');

import fs from 'fs/promises';
import path from 'path';
import { WarningAggregator } from 'expo/config-plugins';
import {
  addLottieConflictFix,
  addPods,
  withEntitlements,
  withPermissions,
} from '../src/withIos';
import { ONDATO_VERSION_IOS } from '../src/constants';

describe('Config Plugin iOS NFC configuration', () => {
  it('adds the TAG reader session entitlement when NFC is enabled', () => {
    const config = { modResults: {} };

    withEntitlements(config as never, { enableNfc: true });

    expect(config.modResults).toEqual({
      'com.apple.developer.nfc.readersession.formats': ['TAG'],
    });
  });

  it('adds eMRTD and FeliCa identifiers to Info.plist when NFC is enabled', () => {
    const config = { modResults: {} as Record<string, unknown> };

    withPermissions(config as never, { enableNfc: true });

    expect(
      config.modResults[
        'com.apple.developer.nfc.readersession.iso7816.select-identifiers'
      ]
    ).toEqual(['A0000002471001']);
    expect(
      config.modResults[
        'com.apple.developer.nfc.readersession.felica.systemcodes'
      ]
    ).toEqual(['12FC']);
  });

  it('does not add NFC configuration when NFC is disabled', () => {
    const entitlements = { modResults: {} };
    const infoPlist = { modResults: {} as Record<string, unknown> };

    withEntitlements(entitlements as never, { enableNfc: false });
    withPermissions(infoPlist as never, { enableNfc: false });

    expect(entitlements.modResults).toEqual({});
    expect(Object.keys(infoPlist.modResults)).not.toContain(
      'com.apple.developer.nfc.readersession.iso7816.select-identifiers'
    );
  });
});

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

describe('Config Plugin iOS Tests for SDK 56 - addPods', () => {
  let podfile: string;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    const podfilePath = path.resolve(
      __dirname,
      './fixtures/sdk-56/ios/Podfile'
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

describe('Config Plugin iOS Tests - addLottieConflictFix', () => {
  const podfileWithPostInstall = `post_install do |installer|
    react_native_post_install(installer)
  end
`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds the fix at the start of post_install', () => {
    const result = addLottieConflictFix(podfileWithPostInstall);

    expect(result.startsWith('post_install do |installer|\n    # ondato')).toBe(
      true
    );
    expect(result).toContain("'BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'YES'");
    expect(result).toContain('OndatoSDK-Core/Lottie.framework');
    expect(result).toContain('react_native_post_install(installer)');
  });

  it('does not add the fix twice', () => {
    const once = addLottieConflictFix(podfileWithPostInstall);

    expect(addLottieConflictFix(once)).toBe(once);
  });

  it('logs a warning when there is no post_install block', () => {
    expect(addLottieConflictFix('')).toBe('');
    expect(WarningAggregator.addWarningIOS).toHaveBeenCalledWith(
      'ondato-sdk-react-native',
      expect.stringContaining('post_install')
    );
  });
});
