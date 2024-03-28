const { getDefaultConfig } = require('expo/metro-config');

module.exports = () => {
  const config = getDefaultConfig(__dirname);
  const { resolver } = config;

  config.resolver = {
    ...resolver,
    assetExts: [...resolver.assetExts, "html"],
  };

  return config;
};
