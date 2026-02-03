import {
  type ConfigPlugin,
  withInfoPlist,
  withEntitlementsPlist,
  withPodfile,
  WarningAggregator,
} from 'expo/config-plugins';
import {
  MICROPHONE_USAGE_DESCRIPTION,
  CAMERA_USAGE_DESCRIPTION,
  NFC_USAGE_DESCRIPTION,
  ONDATO_VERSION_IOS,
} from './constants';
import { type OndatoPluginProps } from '.';

export const withIosConfiguration: ConfigPlugin<OndatoPluginProps> = (
  config,
  props
) => {
  config = withPermissions(config, props);
  config = withEntitlements(config, props);
  config = withDependencies(config, props);

  return config;
};

export const withPermissions: ConfigPlugin<OndatoPluginProps> = (
  configuration,
  props
) => {
  const nfcUsageDescription =
    props.ios?.nfcUsageDescription ?? NFC_USAGE_DESCRIPTION;
  const microphoneUsageDescription =
    props.ios?.microphoneUsageDescription ?? MICROPHONE_USAGE_DESCRIPTION;
  const cameraUsageDescription =
    props.ios?.cameraUsageDescription ?? CAMERA_USAGE_DESCRIPTION;

  return withInfoPlist(configuration, (config) => {
    const plist = config.modResults;

    plist.NSCameraUsageDescription = cameraUsageDescription;

    if (props.enableNfc) {
      plist.NFCReaderUsageDescription = nfcUsageDescription;
    }

    if (props.enableScreenRecorder) {
      plist.NSMicrophoneUsageDescription = microphoneUsageDescription;
    }

    return config;
  });
};

export const withDependencies: ConfigPlugin<OndatoPluginProps> = (
  configuration,
  props
) => {
  return withPodfile(configuration, (config) => {
    const podfile = config.modResults.contents;

    config.modResults.contents = addPods(podfile, {
      enableNfc: props.enableNfc ?? false,
      enableScreenRecorder: props.enableScreenRecorder ?? false,
      enableDocumentResolver: props.enableDocumentResolver ?? false,
    });

    return config;
  });
};

export const withEntitlements: ConfigPlugin<OndatoPluginProps> = (
  configuration,
  props
) => {
  return withEntitlementsPlist(configuration, (config) => {
    if (props.enableNfc) {
      config.modResults['com.apple.developer.nfc.readersession.formats'] = [
        'TAG',
      ];
    }
    return config;
  });
};

export const addPods = (
  podfile: string,
  {
    enableNfc,
    enableScreenRecorder,
    enableDocumentResolver,
  }: {
    enableNfc?: boolean;
    enableScreenRecorder?: boolean;
    enableDocumentResolver?: boolean;
  }
): string => {
  const insertionRegex = /use_react_native!\([^)]*\)\n/;
  if (!podfile.match(insertionRegex)) {
    WarningAggregator.addWarningIOS(
      'ondato-sdk-react-native',
      'Could not find use_react_native! block in Podfile to add dependencies.'
    );
    return podfile;
  }

  const podsToAdd = [];
  const nfcPod = `pod 'OndatoNFC', '= ${ONDATO_VERSION_IOS}'`;
  const screenRecorderPod = `pod 'OndatoScreenRecorder', '= ${ONDATO_VERSION_IOS}'`;
  const documentResolverPod = `pod 'OndatoAutocapture', '= ${ONDATO_VERSION_IOS}'`;

  if (enableNfc && !podfile.includes(nfcPod)) {
    podsToAdd.push(nfcPod);
  }
  if (enableScreenRecorder && !podfile.includes(screenRecorderPod)) {
    podsToAdd.push(screenRecorderPod);
  }
  if (enableDocumentResolver && !podfile.includes(documentResolverPod)) {
    podsToAdd.push(documentResolverPod);
  }

  if (podsToAdd.length > 0) {
    const newPods = podsToAdd.map((pod) => `  ${pod}`).join('\n');
    podfile = podfile.replace(
      insertionRegex,
      (match) => `${match}\n${newPods}\n`
    );
  }

  return podfile;
};
