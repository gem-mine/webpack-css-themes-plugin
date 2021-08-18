module.exports = {
  PluginName: 'webpack-css-theme-plugin',
  MODULE_TYPE: 'css/mini-extract', // to be compatible with mini-extract's other plugin
  AUTO_PUBLIC_PATH: '__MINI_CSS_EXTRACT_PLUGIN_PUBLIC_PATH__',
  CODE_GENERATION_RESULT: {
    sources: new Map(),
    runtimeRequirements: new Set(),
  },
  // weakmaps
  cssModuleCache: new WeakMap(),
  cssDependencyCache: new WeakMap(),
  registered: new WeakSet(),
}
