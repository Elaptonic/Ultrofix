const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  /\.cache\/openid-client\/.*/,
  // Firebase ships transient temp files inside its package directory while
  // installed via pnpm; metro tries to watch them and throws ENOENT.
  /node_modules\/.pnpm\/.*@firebase.*\/.*_tmp_.*/,
  /node_modules\/.*@firebase.*_tmp_.*/,
];

module.exports = config;
