const MutexLock = require('mutex-lock')

const dataBus = require('../dataBus')
const { findLoaderByLoaderName } = require('../utils/webpack')
const { extractLessVariable } = require('../utils/less')

let loaderOptionsMerged = false
const appendDatalock = new MutexLock()

module.exports = async function themeLoader(request) {
  const callback = this.async()
  const { pluginOptions } = dataBus
  if (pluginOptions.themes.length === 1) {
    if (loaderOptionsMerged) {
      return callback(null, request)
    } else {
      // 由于多个文件loader会并行，
      // 必须保证任意一个本loader callback前设置后置loader
      // so 先lock
      await appendDatalock.request()
      // 对于非首个loader此处应该得到`loaderOptionsMerged` = true
      if (!loaderOptionsMerged) {
        await appendDataForPreProcesser(request, this.loaders, pluginOptions, callback)
        loaderOptionsMerged = true
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

async function appendDataForPreProcesser(request, loaders, options, callback) {
  const preProcessorName = options['pre-processor']
  // TODO 暂时只支持less
  if (preProcessorName !== 'less') {
    throw new Error('not implemented')
  }
  const loaderName = `${preProcessorName}-loader`
  const loader = findLoaderByLoaderName(loaders, loaderName)
  if (loader) {
    loader.options = loader.options || {}
    const themePath = options.themes[0].filePath
    const variableStr = await extractLessVariable(themePath)
    Object.assign(loader.options, {
      appendData(loaderApi) {
        loaderApi.addDependency(themePath)
        console.log(variableStr)
        return '@primary-color: #12890f;'
      }
    })
    callback(null, request)
  } else {
    callback(new Error(`Webpack-css-themes-plugin merge loader options for ${
      loaderName} faild: no loader found`))
  }
}
