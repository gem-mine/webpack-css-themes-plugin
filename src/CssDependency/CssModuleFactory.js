const CssModule = require('./CssModule')

class CssModuleFactory {
  create({ dependencies: [dependency] }, callback) {
    callback(null, new CssModule(dependency))
  }
}

module.exports = CssModuleFactory
