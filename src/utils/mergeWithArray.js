const _ = require('lodash')

/**
 * Similar to lodash's defaultsDeep
 * 1. without mutating the source object
 * 2. no merging of arrays
 */
module.exports = function mergeWithArray(object, sources) {
  _.mergeWith(object, sources,
    // eslint-disable-next-line consistent-return
    (objValue, srcValue) => {
      if (_.isArray(objValue)) {
        return objValue.concat(srcValue)
      }
    })
  return object
}
