const loaderUtils = require('loader-utils')

const dataBus = require('./dataBus')

module.exports = function loader(request) {
  console.log(this.resourcePath)
  console.log(dataBus.pluginOptions)
  const options = loaderUtils.getOptions(this) || {}
  return request
}
