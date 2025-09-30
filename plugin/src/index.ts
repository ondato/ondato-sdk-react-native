import { type ConfigPlugin, createRunOncePlugin } from 'expo/config-plugins';

import { withAndroidConfiguration } from './withAndroid';
import { withIosConfiguration } from './withIos';

import { DEFAULT_COLORS, DEFAULT_TRANSLATIONS } from './constants';

export interface OndatoPluginProps {
  enableNfc?: boolean;
  enableScreenRecorder?: boolean;

  android?: {
    mavenRepoUrl?: string;
    colors?: Partial<typeof DEFAULT_COLORS>;
    colorsNight?: Partial<typeof DEFAULT_COLORS>;
    defaultTranslationOverrides?: Partial<typeof DEFAULT_TRANSLATIONS>;
  };

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

  return config;
};

const pkg = require('../../package.json');
export default createRunOncePlugin(withOndato, pkg.name, pkg.version);
