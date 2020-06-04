const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin')
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin')
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin')
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin')
const LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin')

const CssDependency = require('../CssDependency')

const { PluginName } = require('../const')
const {
  evalModuleCode,
  findModuleById,
  registerCompilerHook,
} = require('../utils/webpack')

// share across compilers
const identifierCountMap = new Map()

class ChildCompiler {
  constructor({
    parentContext,
    request,
    loaders,
    outputOptions,
    childFilename,
  }) {
    this.parentContext = parentContext
    this.request = request
    this.identifierCountMap = identifierCountMap

    const childCompiler = parentContext._compilation.createChildCompiler(
      `${PluginName} ${request}`,
      outputOptions
    )
    this.childCompiler = childCompiler
    this.source = undefined

    new NodeTemplatePlugin(outputOptions).apply(childCompiler)
    new LibraryTemplatePlugin(null, 'commonjs2').apply(childCompiler)
    new NodeTargetPlugin().apply(childCompiler)
    new SingleEntryPlugin(parentContext.context, `!!${request}`, PluginName).apply(
      childCompiler
    )
    new LimitChunkCountPlugin({ maxChunks: 1 }).apply(childCompiler)

    registerCompilerHook(
      childCompiler,
      'thisCompilation',
      `${PluginName}-thisCompilation`,
      (compilation) => {
        registerCompilerHook(
          compilation,
          'normalModuleLoader',
          `${PluginName}-normalModuleLoader`,
          (loaderContext, module) => {
            // eslint-disable-next-line no-param-reassign
            loaderContext.emitFile = parentContext.emitFile

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

    registerCompilerHook(
      childCompiler,
      'afterCompile',
      `${PluginName}-afterCompile`,
      (compilation) => {
        this.source = compilation.assets[childFilename]
        && compilation.assets[childFilename].source()

        // Remove all chunk assets
        compilation.chunks.forEach((chunk) => {
          chunk.files.forEach((file) => {
            delete compilation.assets[file] // eslint-disable-line no-param-reassign
          })
        })
      }
    )
  }

  async run(options, theme) {
    return new Promise((resolve, reject) => {
      this.childCompiler.runAsChild((err, entries, compilation) => {
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

            this.parentContext._module.addDependency(
              new CssDependency(dependency, dependency.context, count, theme.name)
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
          this.parentContext.addDependency(dep)
        }, this.parentContext)

        compilation.contextDependencies.forEach((dep) => {
          this.parentContext.addContextDependency(dep)
        }, this.parentContext)

        if (!this.source) {
          return reject(new Error("Didn't get a result from child compiler"))
        }

        try {
          let dependencies
          let exports = evalModuleCode(this.parentContext, this.source, this.request)
          exports = exports.__esModule ? exports.default : exports
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

        return resolve(`// extracted by ${PluginName}`)
      })
    })
  }
}

module.exports = ChildCompiler
