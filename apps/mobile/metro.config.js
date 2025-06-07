const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add workspace packages to watchFolders
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Add support for resolving workspace packages
config.resolver.disableHierarchicalLookup = false;
config.resolver.alias = {
  '@scaffai/core': path.resolve(workspaceRoot, 'packages/core'),
};

module.exports = config;