const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Add shared dir to Metro watch folders
config.watchFolders = [path.resolve(__dirname, "../shared")];

// Configure resolver to handle shared package
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    "@shared": path.resolve(__dirname, "../shared/src"),
    "@app/clerk": path.resolve(__dirname, "./hooks/clerk.ts"),
    // Make sure deps resolve from mobile's node_modules
    react: path.resolve(__dirname, "node_modules/react"),
    "@tanstack/react-query": path.resolve(
      __dirname,
      "node_modules/@tanstack/react-query",
    ),
    clsx: path.resolve(__dirname, "node_modules/clsx"),
    "tailwind-merge": path.resolve(__dirname, "node_modules/tailwind-merge"),
  },
  // Explicitly block shared's node_modules and test files from being resolved
  blockList: [
    /\/clients\/shared\/node_modules\/.*/,
    /\/__tests__\/.*/,
    /.*\.test\.(js|jsx|ts|tsx)$/,
  ],
};

module.exports = withNativeWind(config, { input: "./global.css" });
