const NativeModule = require('module')
const path = require('path')
const loaderUtils = require('loader-utils')

const EntryPoint = require('webpack/lib/Entrypoint')


function findLoaderByLoaderName(rules, loaderName) {
  const result = []
  const regExp = new RegExp(loaderName, 'i')
  _traverseRule(rules, regExp, result)
  return result
}

function _traverseRule(rule, regExp, result) {
  if (rule instanceof Array) {
    rule.forEach((r) => _traverseRule(r, regExp, result))
  }
  if (rule.use) {
    _traverseRule(rule.use, regExp, result)
  } else if (rule.oneOf) {
    _traverseRule(rule.oneOf, regExp, result)
  } else if (rule.loader) {
    if (regExp.test(rule.loader)) {
      result.push(rule)
    }
  }
}

function recursiveIssuer(module, entryName) {
  if (module.issuer) {
    return recursiveIssuer(module.issuer, entryName)
  } else {
    return Array.from(module._chunks)[0].name === entryName
  }
}

function recursiveChunkEntryName(chunk) {
  const [chunkGroup] = chunk.groupsIterable
  return _recursiveChunkGroup(chunkGroup)
}

function _recursiveChunkGroup(chunkGroup) {
  if (chunkGroup instanceof EntryPoint) {
    return chunkGroup.name
  } else {
    const [chunkParent] = chunkGroup.getParents()
    return _recursiveChunkGroup(chunkParent)
  }
}

function evalModuleCode(loaderContext, code, filename) {
  const module = new NativeModule(filename, loaderContext)

  module.paths = NativeModule._nodeModulePaths(loaderContext.context)
  module.filename = filename
  module._compile(code, filename)

  return module.exports
}

function findModuleById(modules, id) {
  for (const module of modules) {
    if (module.id === id) {
      return module
    }
  }

  return null
}

function hotLoader(content, context) {
  const accept = context.locals
    ? ''
    : 'module.hot.accept(undefined, cssReload);'

  return `${content}
    if(module.hot) {
      // ${Date.now()}
      var cssReload = require(${loaderUtils.stringifyRequest(
    context.context,
    path.join(__dirname, '../hmr/hotModuleReplacement.js')
  )})(module.id, ${JSON.stringify({
  ...context.options,
  locals: !!context.locals,
})});
      module.hot.dispose(cssReload);
      ${accept}
    }
  `
}

module.exports = {
  findLoaderByLoaderName,
  recursiveIssuer,
  hotLoader,
  recursiveChunkEntryName,
  evalModuleCode,
  findModuleById
}
