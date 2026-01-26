const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.watchFolders = [path.resolve(__dirname, "../shared")];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
  path.resolve(__dirname, "../shared/node_modules"),
];

config.resolver.alias = {
  "@shared": path.resolve(__dirname, "../shared/src"),
};

module.exports = withNativeWind(config, { input: "./global.css" });