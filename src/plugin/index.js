const path = require('path')
const fs = require('fs')
const validateOptions = require('schema-utils')

const mergeWithArray = require('../utils/mergeWithArray')

const {
  findLoaderByLoaderName,
  registerCompilerHook
} = require('../utils/webpack')

const schema = require('../plugin-options.json')

const PluginName = 'webpack-css-theme-plugin'

class WebpackCSSThmemePlugin {
  constructor(options) {
    validateOptions(schema, options, PluginName)

    this.options = {
      'pre-processor': 'less',
      ...options
    }
  }

  apply(compiler) {
    const { options } = this
    if (options.themes.length === 1) {
      const warningList = []
      registerCompilerHook(compiler, 'beforeCompile', async (compilationParams, callback) => {
        const { context } = compilationParams.normalModuleFactory
        const { rules } = compilationParams.normalModuleFactory.ruleSet
        this.appendDataForPreProcesser(rules, context, options)
          .then(({
            warnings
          }) => {
            if (warnings) {
              warningList.push(...warnings)
            }
            callback()
          }, (e) => {
            callback(e)
          })
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
      registerCompilerHook(compiler, 'beforeRun', () => {
        const { rules } = compiler.options.module
        rules.push({
          test: /\.less$/i,
          enforce: 'pre',
          use: require.resolve('../loader/index.js')
        })
      }, {
        handlerName: `${PluginName}-set-post-loader`,
      })
    }
  }

  async appendDataForPreProcesser(rules, context, options) {
    const preProcessorName = options['pre-processor']
    // TODO 暂时只支持less
    if (preProcessorName !== 'less') {
      throw new Error('not implemented')
    }
    const loaderName = `${preProcessorName}-loader`
    const loaders = findLoaderByLoaderName(rules, loaderName)
    if (loaders.length > 0) {
      const themePath = options.themes[0].entryPath
      loaders.forEach((loader) => {
        loader.options = loader.options || {}
        loader.options = mergeWithArray(loader.options, {
          lessOptions: {
            paths: [
              path.dirname(themePath)
            ]
          }
        })
        Object.assign(loader.options, {
          appendData(loaderApi) {
            loaderApi.addDependency(themePath)
            return fs.readFileSync(themePath)
          }
        })
      })
      return {}
    } else {
      throw new Error(`Webpack-css-themes-plugin merge loader options for ${
        loaderName} faild: no loader found`)
    }
  }
}

module.exports = WebpackCSSThmemePlugin
