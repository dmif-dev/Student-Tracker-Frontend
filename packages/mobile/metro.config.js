const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// The monorepo workspace root (where pnpm-workspace.yaml lives)
// Expo's getMetroServerRoot() also returns this path, so we must
// use it as projectRoot to ensure bundle URLs resolve correctly.
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

// Pass the workspace root as the project root so Metro and Expo agree
// on where to resolve the entry file from.
const config = getDefaultConfig(workspaceRoot);

// 1. Watch the entire workspace
config.watchFolders = [workspaceRoot];

// 2. Resolve node_modules: mobile package first, then workspace root
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Disable hierarchical lookup to prevent duplicate React instances
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
