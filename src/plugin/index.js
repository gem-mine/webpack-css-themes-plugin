const path = require('path')

const validateOptions = require('schema-utils')
const _ = require('lodash')

const { PluginName } = require('../const')
const schema = require('../plugin-options.json')
const multiThemeHandler = require('./multiThemeHandler')

const {
  registerCompilerHook,
  recursiveIssuer,
  recursiveChunkGroup,
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
    const preProcessorName = options['pre-processor']
    // TODO 暂时只支持less
    if (preProcessorName !== 'less') {
      throw new Error('not implemented')
    }
    registerCompilerHook(compiler, 'beforeRun', () => {
      const extReg = new RegExp(`\\.(${preProcessorName}|css)$`, 'i')
      const { rules } = compiler.options.module
      rules.push({
        test: extReg,
        enforce: 'post',
        use: {
          loader: require.resolve('../loader/index.js'),
          options,
        }
      })
      const { cacheGroups } = compiler.options.optimization.splitChunks
      Object.keys(compiler.options.entry).forEach((entryName) => {
        cacheGroups[`${entryName}`] = {
          name: entryName,
          // eslint-disable-next-line arrow-body-style
          test: (m, c, entry = entryName) => {
            return m.constructor.name === 'CssModule' && recursiveIssuer(m, entry)
          },
          // eslint-disable-next-line arrow-body-style
          chunks: (chunk) => {
            return recursiveChunkGroup(chunk, entryName)
          },
          enforce: true,
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
}

module.exports = WebpackCSSThmemePlugin
