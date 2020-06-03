const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const loaderUtils = require('loader-utils')
const validateOptions = require('schema-utils')

const ChildCompiler = require('./ChildCompiler')
const schema = require('../loader-options.json')
const { PluginName } = require('../const')

const mergeWithArray = require('../utils/mergeWithArray')

async function pitch(request) {
  const options = loaderUtils.getOptions(this) || {}
  validateOptions(schema, options, PluginName)

  const callback = this.async()
  const childFilename = '*'

  this.addDependency(this.resourcePath)

  // eslint-disable-next-line no-nested-ternary
  const publicPath = typeof options.publicPath === 'string'
    ? options.publicPath === '' || options.publicPath.endsWith('/')
      ? options.publicPath
      : `${options.publicPath}/`
    : typeof options.publicPath === 'function'
      ? options.publicPath(this.resourcePath, this.rootContext)
      : this._compilation.outputOptions.publicPath

  const parentLoaders = this.loaders.slice(this.loaderIndex + 1)
  const outputOptions = {
    filename: childFilename,
    publicPath,
  }
  const { themes } = options

  return Promise.all(themes.map(async (theme) => {
    const themeLoaders = getLoadersForTheme(parentLoaders, theme, options)
    const childCompiler = new ChildCompiler({
      parentContext: this,
      request,
      loaders: themeLoaders,
      outputOptions,
      childFilename,
    })
    return childCompiler.run(options, theme)
  })).then(([
    resultSource
  ]) => {
    // return which one does not matters
    callback(null, resultSource)
  }, (e) => {
    callback(e)
  })
}

function getLoadersForTheme(loaders, theme, options) {
  const themeLoaders = _.cloneDeep(loaders)
  const preProcessorName = options['pre-processor']
  // TODO 暂时只支持less
  if (preProcessorName !== 'less') {
    throw new Error('not implemented')
  }
  const loaderName = `${preProcessorName}-loader`
  const loader = findLoaderByLoaderName(themeLoaders, loaderName)
  if (loader) {
    loader.options = loader.options || {}
    const themePath = theme.entryPath
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
    return themeLoaders
  } else {
    throw new Error(`Webpack-css-themes-plugin merge loader options for ${
      loaderName} faild: no loader found`)
  }
}

function findLoaderByLoaderName(loaders, loaderName) {
  const regExp = new RegExp(`node_modules[\\/\\\\]${loaderName}`, 'i')
  return loaders.find((loader) => regExp.test(loader.path))
}

module.exports = {
  pitch
}
