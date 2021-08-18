const NativeModule = require('module')
const path = require('path')

const EntryPoint = require('webpack/lib/Entrypoint')

function trueFn() {
  return true
}

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

function findModuleById(compilation, id) {
  const { modules, chunkGraph } = compilation

  for (const module of modules) {
    const moduleId = typeof chunkGraph !== 'undefined'
      ? chunkGraph.getModuleId(module)
      : module.id

    if (moduleId === id) {
      return module
    }
  }

  return null
}

function getChunkModules(chunk, chunkGraph) {
  return typeof chunkGraph !== 'undefined'
    ? chunkGraph.getOrderedChunkModulesIterable(
      chunk,
      compareModulesByIdentifier
    )
    : chunk.modulesIterable
}

function hotLoader(content, context) {
  const accept = context.locals
    ? ''
    : 'module.hot.accept(undefined, cssReload);'
  /* eslint-disable indent */
  return `${content}
    if(module.hot) {
      // ${Date.now()}
      var cssReload = require(${stringifyRequest(
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
  /* eslint-enable indent */
}

const RELATIVE_PATH_REGEXP = /^\.\.?[/\\]/

function isRelativePath(str) {
  return RELATIVE_PATH_REGEXP.test(str)
}

function isAbsolutePath(str) {
  return path.posix.isAbsolute(str) || path.win32.isAbsolute(str)
}

function stringifyRequest(loaderContext, request) {
  const splitted = request.split('!')
  const { context } = loaderContext

  return JSON.stringify(
    splitted
      .map((part) => {
        // First, separate singlePath from query, because the query might contain paths again
        const splittedPart = part.match(/^(.*?)(\?.*)/)
        const query = splittedPart ? splittedPart[2] : ''
        let singlePath = splittedPart ? splittedPart[1] : part

        if (isAbsolutePath(singlePath) && context) {
          singlePath = path.relative(context, singlePath)

          if (isAbsolutePath(singlePath)) {
            // If singlePath still matches an absolute path,
            //  singlePath was on a different drive than context.
            // In this case, we leave the path platform-specific without replacing any separators.
            // @see https://github.com/webpack/loader-utils/pull/14
            return singlePath + query
          }

          if (isRelativePath(singlePath) === false) {
            // Ensure that the relative path starts at least with ./
            // otherwise it would be a request into the modules directory (like node_modules).
            singlePath = `./${singlePath}`
          }
        }

        return singlePath.replace(/\\/g, '/') + query
      })
      .join('!')
  )
}

function compareIds(a, b) {
  if (typeof a !== typeof b) {
    return typeof a < typeof b ? -1 : 1
  }

  if (a < b) {
    return -1
  }

  if (a > b) {
    return 1
  }

  return 0
}

function compareModulesByIdentifier(a, b) {
  return compareIds(a.identifier(), b.identifier())
}

module.exports = {
  findLoaderByLoaderName,
  recursiveIssuer,
  hotLoader,
  recursiveChunkEntryName,
  evalModuleCode,
  findModuleById,
  trueFn,
  compareModulesByIdentifier,
  getChunkModules
}
