const validateOptions = require('schema-utils')

const dataBus = require('./dataBus')
const schema = require('./plugin-options.json')

const defaultOptions = {
  minify: true,
  isCSSModules: false,
}

class WebpackCSSThmemePlugin {
  constructor(options) {
    validateOptions(schema, options, 'Webpack CSS Thmeme Plugin')
    this.options = Object.assign(defaultOptions, options)
    dataBus.pluginOptions = this.options
  }

  apply(compiler) {
    const { options } = this

    compiler.hooks.beforeRun.tap('ui-component-usage-collector', (compiler) => {
      compiler.options.module.rules[0].use[2].options.lessOptions.javascriptEnabled = true
    })
  }
}

WebpackCSSThmemePlugin.loader = require.resolve('./loader')

module.exports = WebpackCSSThmemePlugin
