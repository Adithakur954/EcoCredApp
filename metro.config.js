const { getDefaultConfig: getExpoDefaultConfig } = require('expo/metro-config');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const reactNativeConfig = getDefaultConfig(__dirname);
const expoConfig = getExpoDefaultConfig(__dirname);

module.exports = mergeConfig(reactNativeConfig, expoConfig);
