const NativeModule = require('module')

const path = require('path')

const loaderUtils = require('loader-utils')
const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin')
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin')
const validateOptions = require('schema-utils')

const CssDependency = require('../CssDependency')

const schema = require('../loader-options.json')

const pluginName = 'mini-css-extract-plugin'

const identifierCountMap = new Map()

async function pitch(request) {
  const callback = this.async()

  const options = loaderUtils.getOptions(this) || {}

  validateOptions(schema, options, 'Mini CSS Extract Plugin Loader')

  const loaders = this.loaders.slice(this.loaderIndex + 1)

  this.addDependency(this.resourcePath)

  const childFilename = '*'
  // eslint-disable-next-line no-nested-ternary
  const publicPath = typeof options.publicPath === 'string'
    ? options.publicPath === '' || options.publicPath.endsWith('/')
      ? options.publicPath
      : `${options.publicPath}/`
    : typeof options.publicPath === 'function'
      ? options.publicPath(this.resourcePath, this.rootContext)
      : this._compilation.outputOptions.publicPath

  const array = [0, 1]

  return Promise.all(array.map((i) => {
    const {
      childCompiler,
      compilerResult
    } = createChildCompiler(this, request, loaders, {
      filename: `${childFilename}i`,
      publicPath,
    }, `${childFilename}i`)
    return execCompiler(this, request, childCompiler, options, compilerResult)
  })).then((r) => {
    debugger
    callback(null, r[0])
  }, (e) => {
    callback(e)
  })
}


function createChildCompiler(context, request, loaders, outputOptions, childFilename) {
  const childCompiler = context._compilation.createChildCompiler(
    `${pluginName} ${request}`,
    outputOptions
  )

  new NodeTemplatePlugin(outputOptions).apply(childCompiler)
  new LibraryTemplatePlugin(null, 'commonjs2').apply(childCompiler)
  new NodeTargetPlugin().apply(childCompiler)
  new SingleEntryPlugin(context.context, `!!${request}`, pluginName).apply(
    childCompiler
  )
  new LimitChunkCountPlugin({ maxChunks: 1 }).apply(childCompiler)

  childCompiler.hooks.thisCompilation.tap(
    `${pluginName} loader`,
    (compilation) => {
      compilation.hooks.normalModuleLoader.tap(
        `${pluginName} loader`,
        (loaderContext, module) => {
          // eslint-disable-next-line no-param-reassign
          loaderContext.emitFile = context.emitFile

          if (module.request === request) {
            // eslint-disable-next-line no-param-reassign
            module.loaders = loaders.map((loader) => ({
              loader: loader.path,
              options: loader.options,
              ident: loader.ident,
            }))
          }
        }
      )
    }
  )

  const compilerResult = {}

  childCompiler.hooks.afterCompile.tap(pluginName, (compilation) => {
    compilerResult.source = compilation.assets[childFilename]
      && compilation.assets[childFilename].source()

    // Remove all chunk assets
    compilation.chunks.forEach((chunk) => {
      chunk.files.forEach((file) => {
        delete compilation.assets[file] // eslint-disable-line no-param-reassign
      })
    })
  })

  return {
    childCompiler,
    compilerResult
  }
}

async function execCompiler(context, request, childCompiler, options, compilerResult) {
  return new Promise((resolve, reject) => {
    childCompiler.runAsChild((err, entries, compilation) => {
      const addDependencies = (dependencies) => {
        if (!Array.isArray(dependencies) && dependencies != null) {
          throw new Error(
            `Exported value was not extracted as an array: ${JSON.stringify(
              dependencies
            )}`
          )
        }

        for (const dependency of dependencies) {
          const count = identifierCountMap.get(dependency.identifier) || 0

          context._module.addDependency(
            new CssDependency(dependency, dependency.context, count)
          )
          identifierCountMap.set(dependency.identifier, count + 1)
        }
      }

      if (err) {
        return reject(err)
      }

      if (compilation.errors.length > 0) {
        return reject(compilation.errors[0])
      }

      compilation.fileDependencies.forEach((dep) => {
        context.addDependency(dep)
      }, context)

      compilation.contextDependencies.forEach((dep) => {
        context.addContextDependency(dep)
      }, context)

      if (!compilerResult.source) {
        return reject(new Error("Didn't get a result from child compiler"))
      }

      let locals

      try {
        let dependencies
        let exports = evalModuleCode(context, compilerResult.source, request)
        // eslint-disable-next-line no-underscore-dangle
        exports = exports.__esModule ? exports.default : exports
        locals = exports && exports.locals
        if (!Array.isArray(exports)) {
          dependencies = [[null, exports]]
        } else {
          dependencies = exports.map(([id, content, media, sourceMap]) => {
            const module = findModuleById(compilation.modules, id)

            return {
              identifier: module.identifier(),
              context: module.context,
              content,
              media,
              sourceMap,
            }
          })
        }
        addDependencies(dependencies)
      } catch (e) {
        return reject(e)
      }

      const esModule = typeof options.esModule !== 'undefined' ? options.esModule : false
      const result = locals
        ? `\n${esModule ? 'export default' : 'module.exports ='} ${JSON.stringify(
          locals
        )};`
        : ''

      let resultSource = `// extracted by ${pluginName}`

      resultSource += options.hmr
        ? hotLoader(result, { context: context.context, options, locals })
        : result

      return resolve(resultSource)
    })
  })
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
    path.join(__dirname, 'hmr/hotModuleReplacement.js')
  )})(module.id, ${JSON.stringify({
  ...context.options,
  locals: !!context.locals,
})});
      module.hot.dispose(cssReload);
      ${accept}
    }
  `
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
  pitch
}
