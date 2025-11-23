import { type ConfigPlugin } from 'expo/config-plugins';
import { withBuildProperties } from 'expo-build-properties';
import { MIN_SDK_VERSION, DEPLOYMENT_TARGET } from './constants';

export const withOndatoBuildProperties: ConfigPlugin = (config) => {
  return withBuildProperties(config, {
    android: {
      minSdkVersion: MIN_SDK_VERSION,
    },
    ios: {
      deploymentTarget: DEPLOYMENT_TARGET,
    },
  });
};
