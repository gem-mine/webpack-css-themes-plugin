const path = require('path')
const NativeModule = require('module')

const loaderUtils = require('loader-utils')

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

function registerCompilerHook(compiler, hookName, handler, {
  handlerName,
  async = false
} = {}) {
  const handleNameForRegister = handlerName || hookName
  if (compiler.hooks) {
    if (async) {
      compiler.hooks[hookName].tapAsync(handleNameForRegister, handler)
    } else {
      compiler.hooks[hookName].tap(handleNameForRegister, handler)
    }
  } else {
    compiler.plugin(hookName, handler)
  }
}

function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer)
  } else {
    return Array.from(m._chunks)[0].name
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

module.exports = {
  findLoaderByLoaderName,
  registerCompilerHook,
  recursiveIssuer,
  evalModuleCode,
  findModuleById
}
