const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const validateOptions = require('schema-utils')

const ChildCompiler = require('./ChildCompiler')
const schema = require('../loader-options.json')
const { PluginName, AUTO_PUBLIC_PATH } = require('../const')

const mergeWithArray = require('../utils/mergeWithArray')

async function pitch(request) {
  const options = this.getOptions(schema)
  validateOptions(schema, options, PluginName)

  const callback = this.async()
  const childFilename = '*'

  this.addDependency(this.resourcePath)

  // eslint-disable-next-line no-nested-ternary
  let publicPath = typeof options.publicPath === 'string'
    ? options.publicPath === '' || options.publicPath.endsWith('/')
      ? options.publicPath
      : `${options.publicPath}/`
    : typeof options.publicPath === 'function'
      ? options.publicPath(this.resourcePath, this.rootContext)
      : this._compilation.outputOptions.publicPath
  if (publicPath === 'auto') {
    publicPath = AUTO_PUBLIC_PATH
  }

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
  const themePath = typeof theme.entryPath === 'string'
    ? theme.entryPath
    : theme.entryPath[options['pre-processor']]
  const preProcessorName = options['pre-processor']
  const additionalData = getAdditionalDataFn(themePath)
  let loaderOptions
  switch (preProcessorName) {
    case 'less':
      loaderOptions = {
        lessOptions: {
          paths: [
            path.dirname(themePath)
          ]
        },
        additionalData
      }
      break
    case 'sass':
      loaderOptions = {
        sassOptions: {
          includePaths: [
            path.dirname(themePath)
          ]
        },
        additionalData
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

function getAdditionalDataFn(themePath) {
  return function additionalData(content, loaderApi) {
    loaderApi.addDependency(themePath)
    const themeFileContent = fs.readFileSync(themePath, {
      encoding: 'utf-8'
    })
    return `${themeFileContent}${content}`
  }
}

function findLoaderByLoaderName(loaders, loaderName) {
  const regExp = new RegExp(`node_modules[\\/\\\\]${loaderName}`, 'i')
  return loaders.find((loader) => regExp.test(loader.path))
}

module.exports = {
  pitch
}
