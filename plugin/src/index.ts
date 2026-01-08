import { createRunOncePlugin, type ConfigPlugin } from 'expo/config-plugins';

import { withIosConfiguration } from './withIos';
import { withAndroidConfiguration } from './withAndroid';
import { withOndatoBuildProperties } from './withBuildProperties';
import { withCustomFonts } from './withCustomFonts';
import { withCustomLocalization } from './withCustomLocalization';
import { withCustomIllustrations } from './withCustomIllustrations';

import pak from '../../package.json'; // Note: compiled code should be with the same relative path to package.json

export interface OndatoPluginProps {
  enableNfc?: boolean;
  enableScreenRecorder?: boolean;
  enableDocumentResolver?: boolean;

  customLocalizationPath?: string;
  customIllustrationsPath?: string;
  customFontsPath?: string;

  ios?: {
    nfcUsageDescription?: string;
    cameraUsageDescription?: string;
    microphoneUsageDescription?: string;
  };
}

const withOndato: ConfigPlugin<OndatoPluginProps> = (config, props = {}) => {
  // Apply Android configurations
  config = withAndroidConfiguration(config, props);

  // Apply iOS configurations
  config = withIosConfiguration(config, props);

  // Apply custom build properties (uses expo-build-properties)
  config = withOndatoBuildProperties(config);

  // Apply customizations from the provided paths
  config = withCustomFonts(config, props);
  config = withCustomLocalization(config, props);
  config = withCustomIllustrations(config, props);

  return config;
};

export default createRunOncePlugin(withOndato, pak.name, pak.version);
