const path = require('path');

module.exports = function override(config) {
  // 1. Fix 'util' polyfill required by ag-psd (used by @eternalheart/react-file-preview)
  config.resolve = config.resolve || {};
  config.resolve.fallback = {
    ...(config.resolve.fallback || {}),
    util: false,  // ag-psd uses util but doesn't need it in browser — use empty module
    buffer: false,
    stream: false,
    assert: false,
    path: false,
    crypto: false,
    fs: false,
  };

  // 2. Fix three.js ESM imports that need .js extension (fullySpecified issue)
  //    @eternalheart imports three/examples/jsm/... without .js extension
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  config.module.rules.push({
    test: /\.m?js$/,
    resolve: {
      fullySpecified: false,  // allow extensionless imports inside ESM modules
    },
  });

  // 3. Ensure .mjs files are handled properly
  config.resolve.extensions = [
    ...(config.resolve.extensions || []),
    '.mjs',
    '.cjs',
  ];

  // 4. Allow importing .mjs files from node_modules (needed for the library chunks)
  const oneOfRule = config.module.rules.find((r) => r.oneOf);
  if (oneOfRule) {
    oneOfRule.oneOf.unshift({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
      resolve: { fullySpecified: false },
    });
  }

  // 5. Version-specific entry point resolution
  // Webpack will ONLY compile and bundle the active version (e.g. src/v1 or src/v2),
  // ensuring unused versions are completely excluded and build size remains minimal.
  let activeVersion = process.env.REACT_APP_VERSION;
  if (!activeVersion) {
    try {
      const versionJson = require('./src/version.json');
      activeVersion = versionJson.activeVersion;
    } catch (_) {
      activeVersion = 'v1';
    }
  }

  const targetEntry = path.resolve(__dirname, `src/${activeVersion}/index.js`);

  if (Array.isArray(config.entry)) {
    config.entry = config.entry.map((entryPath) =>
      typeof entryPath === 'string' && (entryPath.endsWith('index.js') || entryPath.includes('src'))
        ? targetEntry
        : entryPath
    );
  } else if (typeof config.entry === 'string') {
    config.entry = targetEntry;
  }

  return config;
};