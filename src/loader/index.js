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
    .filter((loader) => !/node_modules[\\/]style-loader/.test(loader.path))
  const themePath = theme.entryPath
  const preProcessorName = options['pre-processor']

  let loaderOptions
  switch (preProcessorName) {
    case 'less':
      loaderOptions = {
        lessOptions: {
          paths: [
            path.dirname(themePath)
          ]
        },
        appendData(loaderApi) {
          loaderApi.addDependency(themePath)
          return fs.readFileSync(themePath)
        }
      }
      break
    case 'sass':
      loaderOptions = {
        sassOptions: {
          includePaths: [
            path.dirname(themePath)
          ]
        },
        prependData(loaderApi) {
          loaderApi.addDependency(themePath)
          return fs.readFileSync(themePath)
        }
      }
      break
    // no default
  }

  const loaderName = `${preProcessorName}-loader`
  const loader = findLoaderByLoaderName(themeLoaders, loaderName)
  if (loader) {
    loader.options = mergeWithArray(loader.options || {}, loaderOptions)
    return themeLoaders
  } else {
    // must be pure css-loader
    return themeLoaders
  }
}

function findLoaderByLoaderName(loaders, loaderName) {
  const regExp = new RegExp(`node_modules[\\/\\\\]${loaderName}`, 'i')
  return loaders.find((loader) => regExp.test(loader.path))
}

module.exports = {
  pitch
}
