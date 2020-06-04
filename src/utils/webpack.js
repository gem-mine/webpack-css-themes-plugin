const NativeModule = require('module')
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

function registerCompilerHook(compiler, hookName, _handlerName, _handler) {
  const handleNameForRegister = typeof _handlerName === 'function'
    ? hookName : _handlerName || hookName
  const handler = typeof _handlerName === 'function' ? _handlerName : _handler
  if (compiler.hooks) {
    compiler.hooks[hookName].tap(handleNameForRegister, handler)
  } else {
    compiler.plugin(hookName, handler)
  }
}

function registerCompilerHookAsync(compiler, hookName, _handlerName, _handler) {
  const handleNameForRegister = typeof _handlerName === 'function'
    ? hookName : _handlerName || hookName
  const handler = typeof _handlerName === 'function' ? _handlerName : _handler
  if (compiler.hooks) {
    compiler.hooks[hookName].tapAsync(handleNameForRegister, handler)
  } else {
    compiler.plugin(hookName, handler)
  }
}

function recursiveIssuer(module, entryName) {
  if (module.issuer) {
    return recursiveIssuer(module.issuer, entryName)
  } else {
    return Array.from(module._chunks)[0].name === entryName
  }
}

function recursiveChunkGroup(chunk, entryName) {
  const [chunkGroup] = chunk.groupsIterable
  return _recursiveChunkGroup(chunkGroup, entryName)
}

function _recursiveChunkGroup(chunkGroup, entryName) {
  if (chunkGroup instanceof EntryPoint) {
    return chunkGroup.name === entryName
  } else {
    const [chunkParent] = chunkGroup.getParents()
    return _recursiveChunkGroup(chunkParent, entryName)
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
  registerCompilerHookAsync,
  recursiveIssuer,
  recursiveChunkGroup,
  evalModuleCode,
  findModuleById
}
