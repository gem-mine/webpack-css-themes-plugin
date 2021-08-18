const { hotLoader } = require('../utils/webpack')
const { PluginName } = require('../const')
const {
  evalModuleCode,
  findModuleById
} = require('../utils/webpack')
const { getCssDependency } = require('../plugin')

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

    // The templates are compiled and executed by NodeJS - similar to server side rendering
    // Unfortunately this causes issues as some loaders require an absolute URL to
    // support ES Modules
    // The following config enables relative URL support for the child compiler
    childCompiler.options.module = { ...childCompiler.options.module }
    childCompiler.options.module.parser = {
      ...childCompiler.options.module.parser,
    }
    childCompiler.options.module.parser.javascript = {
      ...childCompiler.options.module.parser.javascript,
      url: 'relative',
    }
    const { webpack } = this.parentContext._compiler

    const { NodeTemplatePlugin } = webpack.node
    const { NodeTargetPlugin } = webpack.node

    new NodeTemplatePlugin(outputOptions).apply(childCompiler)
    new NodeTargetPlugin().apply(childCompiler)

    const { EntryOptionPlugin } = webpack

    const {
      library: { EnableLibraryPlugin },
    } = webpack

    new EnableLibraryPlugin('commonjs2').apply(childCompiler)

    EntryOptionPlugin.applyEntryOption(childCompiler, this.context, {
      child: {
        library: {
          type: 'commonjs2',
        },
        import: [`!!${request}`],
      },
    })
    const { LimitChunkCountPlugin } = webpack.optimize

    new LimitChunkCountPlugin({ maxChunks: 1 }).apply(childCompiler)

    const { NormalModule } = webpack
    childCompiler.hooks.thisCompilation.tap(
      `${PluginName} loader`,
      (compilation) => {
        const normalModuleHook = NormalModule.getCompilationHooks(compilation).loader

        normalModuleHook.tap(`${PluginName} loader`, (loaderContext, module) => {
          if (module.request === request) {
            // eslint-disable-next-line no-param-reassign
            module.loaders = loaders.map((loader) => ({
              loader: loader.path,
              options: loader.options,
              ident: loader.ident,
            }))
          }
        })
      }
    )

    childCompiler.hooks.compilation.tap(PluginName, (compilation) => {
      compilation.hooks.processAssets.tap(PluginName, () => {
        this.source = compilation.assets[childFilename]
          && compilation.assets[childFilename].source()

        // Remove all chunk assets
        compilation.chunks.forEach((chunk) => {
          chunk.files.forEach((file) => {
            compilation.deleteAsset(file)
          })
        })
      })
    })
  }

  async run(options, theme) {
    return new Promise((resolve, reject) => {
      this.childCompiler.runAsChild((err, entries, compilation) => {
        if (err) {
          return reject(err)
        }

        if (compilation.errors.length > 0) {
          return reject(compilation.errors[0])
        }

        const assets = Object.create(null)
        const assetsInfo = new Map()

        for (const asset of compilation.getAssets()) {
          assets[asset.name] = asset.source
          assetsInfo.set(asset.name, asset.info)
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

        let originalExports
        try {
          originalExports = evalModuleCode(this.parentContext, this.source, this.request)
        } catch (e) {
          return reject(e)
        }
        this.handleExports(
          originalExports,
          compilation,
          assets,
          assetsInfo,
          options,
          theme,
          resolve,
          reject
        )
      })
    })
  }

  handleExports(
    originalExports,
    compilation,
    assets,
    assetsInfo,
    options,
    theme,
    resolve,
    reject
  ) {
    const { webpack } = this.parentContext._compiler

    let locals
    let namedExport

    const esModule = true
    const addDependencies = (dependencies) => {
      if (!Array.isArray(dependencies) && dependencies != null) {
        throw new Error(
          `Exported value was not extracted as an array: ${JSON.stringify(
            dependencies
          )}`
        )
      }

      let lastDep

      for (const dependency of dependencies) {
        if (!dependency.identifier) {
          // eslint-disable-next-line no-continue
          continue
        }

        const count = identifierCountMap.get(dependency.identifier) || 0
        const CssDependency = getCssDependency(webpack)

        this.parentContext._module.addDependency(
          (lastDep = new CssDependency(dependency, dependency.context, count, theme.name))
        )
        identifierCountMap.set(dependency.identifier, count + 1)
      }

      if (lastDep && assets) {
        lastDep.assets = assets
        lastDep.assetsInfo = assetsInfo
      }
    }

    try {
      // eslint-disable-next-line no-underscore-dangle
      const exports = originalExports.__esModule
        ? originalExports.default
        : originalExports

      namedExport = originalExports.__esModule
        && !('locals' in originalExports.default)

      if (namedExport) {
        Object.keys(originalExports).forEach((key) => {
          if (key !== 'default') {
            if (!locals) {
              locals = {}
            }

            locals[key] = originalExports[key]
          }
        })
      } else {
        locals = exports && exports.locals
      }

      let dependencies

      if (!Array.isArray(exports)) {
        dependencies = [[null, exports]]
      } else {
        dependencies = exports.map(([id, content, media, sourceMap]) => {
          let identifier = id
          let context
          if (compilation) {
            const module = findModuleById(compilation, id)
            identifier = module.identifier();
            ({ context } = module)
          } else {
            // TODO check if this context is used somewhere
            context = this.parentContext.rootContext
          }

          return {
            identifier: `${identifier}?themeName=${theme.name}`,
            context,
            content: Buffer.from(content),
            media,
            sourceMap: sourceMap
              ? Buffer.from(JSON.stringify(sourceMap))
              : undefined,
          }
        })
      }

      addDependencies(dependencies)
    } catch (e) {
      return reject(e)
    }

    // eslint-disable-next-line no-nested-ternary
    const result = locals
      ? namedExport
        ? Object.keys(locals)
          .map(
            (key) => `\nexport var ${key} = ${JSON.stringify(locals[key])};`
          )
          .join('')
        : `\n${
          esModule ? 'export default' : 'module.exports ='
        } ${JSON.stringify(locals)};`
      : esModule
        ? '\nexport {};'
        : ''

    let resultSource = `// extracted by ${PluginName}`

    resultSource += process.env.NODE_ENV === 'development'
      ? hotLoader(result, {
        context: this.parentContext.context,
        options,
        locals
      })
      : result

    resolve(resultSource)
  }
}

module.exports = ChildCompiler
