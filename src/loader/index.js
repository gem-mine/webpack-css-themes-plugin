const MutexLock = require('mutex-lock')
const loaderUtils = require('loader-utils')

const { findLoaderByLoaderName } = require('../utils/webpack')
const { extractLessVariable } = require('../utils/less')


module.exports = async function themeLoader(request) {
  const callback = this.async()
  const options = loaderUtils.getOptions(this)

  options.dataBus = options.dataBus || {}
  const { dataBus } = options

  dataBus.appendDatalock = dataBus.appendDatalock || new MutexLock()
  const { appendDatalock } = dataBus

  if (options.themes.length === 1) {
    if (dataBus.loaderOptionsMerged) {
      return callback(null, request)
    } else {
      // 由于多个文件loader会并行，
      // 必须保证任意一个本loader callback前设置后置loader
      // so 先lock
      await appendDatalock.request()
      // 对于非首个loader此处应该得到`loaderOptionsMerged` = true
      if (!dataBus.loaderOptionsMerged) {
        await appendDataForPreProcesser(request, this, options, callback)
        dataBus.loaderOptionsMerged = true
        appendDatalock.release()
      } else {
        appendDatalock.release()
        return callback(null, request)
      }
    }
  } else {
    // TODO 暂时只支持单主题
    throw new Error('not implemented')
  }
}

async function appendDataForPreProcesser(request, loadContext, options, callback) {
  const preProcessorName = options['pre-processor']
  // TODO 暂时只支持less
  if (preProcessorName !== 'less') {
    throw new Error('not implemented')
  }
  const loaderName = `${preProcessorName}-loader`
  const loader = findLoaderByLoaderName(loadContext.loaders, loaderName)
  if (loader) {
    loader.options = loader.options || {}
    const themePath = options.themes[0].filePath
    try {
      const {
        variableStr,
        dependencies,
        warnings
      } = await extractLessVariable(themePath)
      warnings.forEach((warning) => {
        loadContext.emitWarning(warning)
      })
      Object.assign(loader.options, {
        appendData(loaderApi) {
          loaderApi.addDependency(themePath)
          dependencies.forEach((dependencyFile) => {
            loaderApi.addDependency(dependencyFile)
          })
          return variableStr
        }
      })
      callback(null, request)
    } catch (e) {
      callback(new Error(`Webpack-css-themes-plugin merge loader options for ${
        loaderName} faild: ${e.message}`))
    }
  } else {
    callback(new Error(`Webpack-css-themes-plugin merge loader options for ${
      loaderName} faild: no loader found`))
  }
}
