const _ = require('lodash')
const validateOptions = require('schema-utils')

const schema = require('../plugin-options.json')

const defaultOptions = {
  minify: true,
  isCSSModules: false,
  'pre-processor': 'less'
}

class WebpackCSSThmemePlugin {
  constructor(options) {
    validateOptions(schema, options, 'Webpack CSS Thmeme Plugin')
    this.options = Object.assign(defaultOptions, options)
  }

  apply(compiler) {
    const { options } = this
    compiler.hooks.beforeRun.tap('webpack-css-thmeme-plugin-preprocess-appendData', () => {
      const { rules } = compiler.options.module
      rules.push({
        test: /\.less$/i,
        enforce: 'pre',
        use: {
          loader: require.resolve('../loader/index.js'),
          options: _.cloneDeep(options)
        }
      })
    })
  }
}

module.exports = WebpackCSSThmemePlugin
