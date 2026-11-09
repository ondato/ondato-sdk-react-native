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
      plist[
        'com.apple.developer.nfc.readersession.iso7816.select-identifiers'
      ] = ['A0000002471001'];
      plist['com.apple.developer.nfc.readersession.felica.systemcodes'] = [
        '12FC',
      ];
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

    config.modResults.contents = addLottieConflictFix(
      addPods(podfile, {
        enableNfc: props.enableNfc ?? false,
        enableScreenRecorder: props.enableScreenRecorder ?? false,
        enableDocumentResolver: props.enableDocumentResolver ?? false,
      })
    );

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

const LOTTIE_CONFLICT_MARKER = '# ondato-sdk-react-native: Lottie conflict fix';

// OndatoSDK-Core vendors Lottie.framework, which collides with the framework
// built by the lottie-ios pod when the app also uses lottie-react-native. Only
// one can be embedded, so keep lottie-ios and build it with library evolution
// so that OndatoSDK, which was compiled against a resilient Lottie, can link it.
const LOTTIE_CONFLICT_FIX = `    ${LOTTIE_CONFLICT_MARKER}
    if ['lottie-ios', 'OndatoSDK-Core'].all? { |name| installer.pod_targets.any? { |pod| pod.name == name } }
      installer.pods_project.targets.select { |target| target.name == 'lottie-ios' }.each do |target|
        target.build_configurations.each do |build_configuration|
          build_configuration.build_settings['BUILD_LIBRARY_FOR_DISTRIBUTION'] = 'YES'
        end
      end
      Dir.glob(File.join(installer.sandbox.root.to_s, 'Target Support Files', 'Pods-*', 'Pods-*-frameworks*')).each do |path|
        contents = File.read(path)
        filtered_contents = contents.lines.reject { |line| line.include?('OndatoSDK-Core/Lottie.framework') }.join
        File.write(path, filtered_contents) if filtered_contents != contents
      end
    end
`;

export const addLottieConflictFix = (podfile: string): string => {
  if (podfile.includes(LOTTIE_CONFLICT_MARKER)) {
    return podfile;
  }

  const insertionRegex = /post_install do \|installer\|\n/;
  if (!podfile.match(insertionRegex)) {
    WarningAggregator.addWarningIOS(
      'ondato-sdk-react-native',
      'Could not find post_install block in Podfile to resolve the Lottie framework conflict.'
    );
    return podfile;
  }

  return podfile.replace(
    insertionRegex,
    (match) => `${match}${LOTTIE_CONFLICT_FIX}`
  );
};
