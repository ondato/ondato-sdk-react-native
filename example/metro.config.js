const path = require('path');
const escape = require('escape-string-regexp');
const exclusionList = require('metro-config/src/defaults/exclusionList');
const pak = require('../package.json');

const root = path.resolve(__dirname, '..');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

const {
  resolver: { sourceExts, assetExts },
} = getDefaultConfig(__dirname);

const modules = Object.keys({
  ...pak.peerDependencies,
});

const config = {
  projectRoot: __dirname,
  watchFolders: [root],

  resolver: {
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],

    blacklistRE: exclusionList(
      modules.map(
        (m) =>
          new RegExp(`^${escape(path.join(root, 'node_modules', m))}\\/.*$`)
      )
    ),

    extraNodeModules: modules.reduce((acc, name) => {
      acc[name] = path.join(__dirname, 'node_modules', name);
      return acc;
    }, {}),
  },

  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
};

module.exports = mergeConfig(defaultConfig, config);
