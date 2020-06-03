const path = require('path')
const fs = require('fs')

const validateOptions = require('schema-utils')
const _ = require('lodash')

const { PluginName } = require('../const')
const schema = require('../plugin-options.json')
const multiThemeHandler = require('./multiThemeHandler')

const mergeWithArray = require('../utils/mergeWithArray')
const {
  findLoaderByLoaderName,
  registerCompilerHook
} = require('../utils/webpack')

const DefaultFileName = '[name].css'
const RegPlaceHolder = /\[(name|id|chunkhash)\]/g

class WebpackCSSThmemePlugin {
  constructor(options) {
    validateOptions(schema, options, PluginName)
    this.options = {
      'pre-processor': 'less',
      ...options
    }
    this.normalizeOptions(this.options)
  }

  apply(compiler) {
    const options = _.cloneDeep(this.options)
    if (options.themes.length === 1) {
      const warningList = []
      registerCompilerHook(compiler, 'beforeCompile', async (compilationParams, callback) => {
        const { rules } = compilationParams.normalModuleFactory.ruleSet
        this.appendDataForPreProcesser(rules, options)
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
      const preProcessorName = options['pre-processor']
      // TODO 暂时只支持less
      if (preProcessorName !== 'less') {
        throw new Error('not implemented')
      }
      registerCompilerHook(compiler, 'beforeRun', () => {
        const { rules } = compiler.options.module
        rules.push({
          test: new RegExp(`\\.(${preProcessorName}|css)$`, 'i'),
          enforce: 'post',
          use: {
            loader: require.resolve('../loader/index.js'),
            options,
          }
        })
      }, {
        handlerName: `${PluginName}-set-post-loader`,
      })

      registerCompilerHook(compiler, 'thisCompilation', (compilation) => {
        multiThemeHandler(compilation, options)
      }, {
        handlerName: `${PluginName}-thisCompilation`,
      })
    }
  }

  normalizeOptions(options) {
    const { themes } = options
    // for check duplicate
    const themeNameList = []

    options.themeMap = {}
    options.themes = themes.map((theme, index) => {
      theme.name = theme.name || path.basename(theme.entryPath).replace(/(\..+)$/, '')
      options.themeMap[theme.name] = index
      if (themeNameList.includes(theme.name)) {
        throw new Error(`Webpack-css-themes-plugin verify plugin option failed: duplicate theme name "${
          theme.name
        }"`)
      } else {
        themeNameList.push(theme.name)
      }
      theme.distFilename = theme.distFilename || DefaultFileName
      if (!theme.distChunkFilename) {
        const { distFilename } = theme
        // Anything changing depending on chunk is fine
        if (distFilename.match(RegPlaceHolder)) {
          theme.distChunkFilename = distFilename
        } else {
          // Elsewise prefix '[id].' in front of the basename to make it changing
          theme.distChunkFilename = distFilename.replace(
            /(^|\/)([^/]*(?:\?|$))/,
            '$1[id].$2'
          )
        }
      }
      return theme
    })
    options.moduleFilename = (themeName) => {
      const themeIndex = options.themeMap[themeName]
      const { distFilename, name } = options.themes[themeIndex]
      if (/\.+/.test(distFilename)) {
        return distFilename.replace(/(\.)/, `-${name}.`)
      } else {
        return `${distFilename}-${name}`
      }
    }

    options.chunkFilename = (themeName) => {
      const themeIndex = options.themeMap[themeName]
      const { distChunkFilename, name } = options.themes[themeIndex]
      if (/\.+/.test(distChunkFilename)) {
        return distChunkFilename.replace(/(\.)/, `-${name}.`)
      } else {
        return `${distChunkFilename}-${name}`
      }
    }
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
