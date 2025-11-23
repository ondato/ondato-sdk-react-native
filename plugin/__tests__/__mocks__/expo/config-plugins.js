const configPlugins = jest.requireActual('expo/config-plugins');

const WarningAggregator = {
  addWarningAndroid: jest.fn(() => {}),
  addWarningIOS: jest.fn(() => {}),
};

module.exports = {
  ...configPlugins,
  withAppBuildGradle: jest.fn((config, callback) => callback(config)),
  withProjectBuildGradle: jest.fn((config, callback) => callback(config)),
  withInfoPlist: jest.fn((config, callback) => callback(config)),
  withEntitlementsPlist: jest.fn((config, callback) => callback(config)),
  withPodfile: jest.fn((config, callback) => callback(config)),
  WarningAggregator,
};
