const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const componentRoot = path.resolve(
    __dirname,
    // this allows installing a local dev version of the pintura component
    // "../pintura-component-react-native-expo",
);

config.watchFolders = [...config.watchFolders, componentRoot];
config.resolver.nodeModulesPaths = [
    path.resolve(__dirname, "node_modules"),
    ...config.resolver.nodeModulesPaths,
];

// Preserve the existing HTML asset configuration.
config.resolver.assetExts = [...config.resolver.assetExts, "html"];

module.exports = config;
