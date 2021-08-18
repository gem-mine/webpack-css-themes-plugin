module.exports = function getCssModuleFactory(CssModule) {
  return class CssModuleFactory {
    // eslint-disable-next-line class-methods-use-this
    create({ dependencies: [dependency] }, callback) {
      callback(null, new CssModule(dependency))
    }
  }
}
