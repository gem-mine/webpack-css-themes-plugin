const validateOptions = require('schema-utils')

const { extractLessVariable } = require('../utils/less')
const {
  findLoaderByLoaderName,
  registerCompilerHook
} = require('../utils/webpack')

const schema = require('../plugin-options.json')

const defaultOptions = {
  minify: true,
  isCSSModules: false,
  'pre-processor': 'less'
}
const PluginName = 'WebpackCSSThmemePlugin'

class WebpackCSSThmemePlugin {
  constructor(options) {
    validateOptions(schema, options, 'Webpack CSS Thmeme Plugin')
    this.options = Object.assign(defaultOptions, options)
  }

  apply(compiler) {
    const { options } = this
    if (options.themes.length === 1) {
      const warningList = []
      registerCompilerHook(compiler, 'beforeCompile', async (compilationParams, callback) => {
        const { rules } = compilationParams.normalModuleFactory.ruleSet
        this.appendDataForPreProcesser(rules, options)
          .then(({
            warnings
          }) => {
            warningList.push(...warnings)
            callback()
          }, (e) => {
            callback(e)
          })
        // rules[]
      }, {
        handlerName: `${PluginName}-set-loader-option`,
        async: true
      })
      registerCompilerHook(compiler, 'thisCompilation', (compilation) => {
        if (warningList.length) {
          compilation.warnings.push(...warningList)
        }
      })
    } else {
      // TODO 暂时只支持单主题
      throw new Error('not implemented')
    }
    // /**
    //  * webpack 4+ comes with a new plugin system.
    //  *
    //  * Check for hooks in-order to support old plugin system
    //  */
    // if (compiler.hooks) {
    //   compiler.hooks.afterEmit.tapAsync('write-file-webpack-plugin', handleAfterEmit);
    // } else {
    //   compiler.plugin('after-emit', handleAfterEmit);
    // }
  }

  async appendDataForPreProcesser(rules, options) {
    const preProcessorName = options['pre-processor']
    // TODO 暂时只支持less
    if (preProcessorName !== 'less') {
      throw new Error('not implemented')
    }
    const loaderName = `${preProcessorName}-loader`
    const loaders = findLoaderByLoaderName(rules, loaderName)
    if (loaders.length > 0) {
      const themePath = options.themes[0].filePath
      const {
        variableStr,
        dependencies,
        warnings
      } = await extractLessVariable(themePath)
        .catch((e) => {
          throw new Error(`Webpack-css-themes-plugin merge loader options for ${
            loaderName} faild: ${e.message}`)
        })

      loaders.forEach((loader) => {
        loader.options = loader.options || {}
        Object.assign(loader.options, {
          appendData(loaderApi) {
            loaderApi.addDependency(themePath)
            dependencies.forEach((dependencyFile) => {
              loaderApi.addDependency(dependencyFile)
            })
            return variableStr
          }
        })
      })
      return {
        warnings
      }
    } else {
      throw new Error(`Webpack-css-themes-plugin merge loader options for ${
        loaderName} faild: no loader found`)
    }
  }
}

module.exports = WebpackCSSThmemePlugin
