const path = require('path')

const validateOptions = require('schema-utils')
const _ = require('lodash')

const { PluginName } = require('../const')
const schema = require('../plugin-options.json')
const multiThemeHandler = require('./multiThemeHandler')

const DefaultFileName = '[name].css'

class WebpackCSSThmemePlugin {
  constructor(options) {
    validateOptions(schema, options, PluginName)
    this.validateOptions(options)
    this.options = {
      'pre-processor': 'less',
      ...options
    }
    this.normalizeOptions(this.options)
  }

  apply(compiler) {
    const options = _.cloneDeep(this.options)
    const preProcessorNames = options['pre-processor']

    preProcessorNames.forEach((preProcessorName, index) => {
      compiler.hooks.afterEnvironment.tap(`${PluginName}_afterEnvironment`, () => {
        const extRegStr = preProcessorName === 'less'
          ? preProcessorName
          : 's[a|c]ss'
        const extReg = index === 0
          ? new RegExp(`\\.(${extRegStr}|css)$`, 'i')
          : new RegExp(`\\.${extRegStr}$`, 'i')

        const { rules } = compiler.options.module
        rules.push({
          test: extReg,
          enforce: 'post',
          use: {
            loader: require.resolve('../loader/index.js'),
            options: {
              ...options,
              'pre-processor': preProcessorName
            },
          }
        })
      }, {
        handlerName: `${PluginName}-set-post-loader`,
      })
    })

    compiler.hooks.thisCompilation.tap(`${PluginName}_thisCompilation`, (compilation) => {
      multiThemeHandler(compilation, options)
    }, {
      handlerName: `${PluginName}-thisCompilation`,
    })
  }

  validateOptions(options) {
    // mix less and sass
    if (options['pre-processor'] instanceof Array
      && options['pre-processor'].length > 1) {
      const { themes } = options
      themes.forEach((theme) => {
        if (!(typeof theme.entryPath === 'object')) {
          const error = new Error('WebpackCSSThmemePlugin Options Error: should provide sass/less entryPath both for mix pre-processor')
          error.name = 'ValidationError'
          throw error
        }

        if (!theme.name) {
          const error = new Error('WebpackCSSThmemePlugin Options Error: should provide theme.name for mix pre-processor')
          error.name = 'ValidationError'
          throw error
        }
      })
    }
  }

  normalizeOptions(options) {
    // convert pre-processor to array
    if (typeof options['pre-processor'] === 'string') {
      options['pre-processor'] = [...options['pre-processor']]
    }

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
  }
}

module.exports = WebpackCSSThmemePlugin
