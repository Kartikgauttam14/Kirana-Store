const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Force resolve expo-router/entry to avoid pnpm symlink issues
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-router/entry') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/expo-router/entry.js'),
      type: 'sourceFile',
    };
  }
  
  // Default resolver for everything else
  return context.resolveRequest(context, moduleName, platform);
};

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, "node_modules"),
];

module.exports = config;
