const { getUndoPath } = require('webpack/lib/util/identifier')
const getCssLoadingRuntimeModule = require('./getCssLoadingRuntimeModule')

const {
  PluginName,
  MODULE_TYPE,
  AUTO_PUBLIC_PATH
} = require('../const')
const getCssDependency = require('../CssDependency/getCssDependency')
const getCssModuleFactory = require('../CssDependency/getCssModuleFactory')
const { recursiveChunkEntryName, getChunkModules } = require('../utils/webpack')
const getCssModule = require('../CssDependency/getCssModule')

function multiThemeHandler(compiler, compilation, cssThemePlugin) {
  const { webpack } = compiler
  const CssModule = getCssModule(webpack)
  const CssDependency = getCssDependency(webpack)
  const CssModuleFactory = getCssModuleFactory(CssModule)
  class CssDependencyTemplate {
    // eslint-disable-next-line class-methods-use-this
    apply() {}
  }

  compilation.dependencyFactories.set(
    CssDependency,
    new CssModuleFactory()
  )

  compilation.dependencyTemplates.set(
    CssDependency,
    new CssDependencyTemplate()
  )

  const { options } = cssThemePlugin
  // groupBy [entryName][themeName]
  const cssModulesFromChunk = {}
  Object.keys(compilation.options.entry).forEach((entryName) => {
    cssModulesFromChunk[entryName] = {}
    options.themes.forEach((theme) => {
      cssModulesFromChunk[entryName][theme.name] = []
    })
  })

  compilation.hooks.beforeChunkAssets.tap(PluginName, () => {
    const { chunkGraph } = compilation
    const chunksForChunkTemplate = compilation.chunks
    chunksForChunkTemplate.forEach((chunk) => {
      const renderedModules = Array.from(
        getChunkModules(chunk, chunkGraph)
      ).filter(
        (module) => module.type === MODULE_TYPE
      )
      renderedModules.forEach((module) => {
        const { themeName } = module
        const entryName = recursiveChunkEntryName(chunk)
        cssModulesFromChunk[entryName][themeName].push(module)
      })
    })
  })

  compilation.hooks.renderManifest.tap(PluginName, (result, { chunk }) => {
    const { HotUpdateChunk } = webpack

    // We don't need hot update chunks for css
    // We will use the real asset instead to update
    if (chunk instanceof HotUpdateChunk) {
      return
    }

    // We don't render none entry chunk
    if (!compilation.chunkGraph.getNumberOfEntryModules(chunk)) {
      return
    }

    const entryName = recursiveChunkEntryName(chunk)
    const cssModulesForChunk = cssModulesFromChunk[entryName]

    options.themes.forEach((theme) => {
      const themeName = theme.name
      const renderedModulesByTheme = cssModulesForChunk[themeName]
      if (renderedModulesByTheme.length > 0) {
        result.push({
          render: () => renderContentAsset(
            compiler,
            compilation,
            chunk,
            renderedModulesByTheme,
            compilation.runtimeTemplate.requestShortener,
            () => options.moduleFilename(themeName),
            {
              contentHashType: MODULE_TYPE,
              chunk,
            }
          ),
          filenameTemplate: () => options.moduleFilename(themeName),
          pathOptions: {
            chunk,
            contentHashType: MODULE_TYPE,
          },
          identifier: `${PluginName}.${themeName}.${chunk.id}`,
          hash: chunk.contentHash[MODULE_TYPE],
        })
      }
    })
  })

  compilation.hooks.contentHash.tap(PluginName, (chunk) => {
    const { outputOptions, chunkGraph } = compilation
    const modules = sortModules(
      compilation,
      chunkGraph.getChunkModulesIterableBySourceType(chunk, MODULE_TYPE)
    )

    if (modules) {
      const { hashFunction, hashDigest, hashDigestLength } = outputOptions
      const { createHash } = compiler.webpack.util
      const hash = createHash(hashFunction)

      for (const m of modules) {
        hash.update(chunkGraph.getModuleHash(m, chunk.runtime))
      }

      // eslint-disable-next-line no-param-reassign
      chunk.contentHash[MODULE_TYPE] = hash
        .digest(hashDigest)
        .substring(0, hashDigestLength)
    }
  })

  const { RuntimeGlobals } = webpack
  const handler = getCssLoadingRuntimeModule(webpack, compilation, options)

  compilation.hooks.runtimeRequirementInTree
    .for(RuntimeGlobals.ensureChunkHandlers)
    .tap(PluginName, handler)
  compilation.hooks.runtimeRequirementInTree
    .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
    .tap(PluginName, handler)
}

function renderContentAsset(
  compiler,
  compilation,
  chunk,
  modules,
  requestShortener,
  filenameTemplate,
  pathData,
) {
  const usedModules = sortModules(compilation, modules)

  const { ConcatSource, SourceMapSource, RawSource } = compiler.webpack.sources
  const source = new ConcatSource()
  const externalsSource = new ConcatSource()

  for (const module of usedModules) {
    let content = module.content.toString()

    const readableIdentifier = module.readableIdentifier(requestShortener)

    if (compilation.outputOptions.pathinfo) {
      // From https://github.com/webpack/webpack/blob/29eff8a74ecc2f87517b627dee451c2af9ed3f3f/lib/ModuleInfoHeaderPlugin.js#L191-L194
      const reqStr = readableIdentifier.replace(/\*\//g, '*_/')
      const reqStrStar = '*'.repeat(reqStr.length)
      const headerStr = `/*!****${reqStrStar}****!*\\\n  !*** ${reqStr} ***!\n  \\****${reqStrStar}****/\n`

      content = headerStr + content
    }

    if (/^@import url/.test(content)) {
      // HACK for IE
      // http://stackoverflow.com/a/14676665/1458162
      if (module.media) {
        // insert media into the @import
        // this is rar
        // TODO improve this and parse the CSS to support multiple medias
        content = content.replace(/;|\s*$/, module.media)
      }

      externalsSource.add(content)
      externalsSource.add('\n')
    } else {
      if (module.media) {
        source.add(`@media ${module.media} {\n`)
      }

      const { path: filename } = compilation.getPathWithInfo(
        filenameTemplate(),
        pathData
      )

      const undoPath = getUndoPath(filename, compiler.outputPath, false)

      content = content.replace(new RegExp(AUTO_PUBLIC_PATH, 'g'), undoPath)

      if (module.sourceMap) {
        source.add(
          new SourceMapSource(
            content,
            readableIdentifier,
            module.sourceMap.toString()
          )
        )
      } else {
        source.add(new RawSource(content, readableIdentifier))
      }

      source.add('\n')

      if (module.media) {
        source.add('}\n')
      }
    }
  }

  return new ConcatSource(externalsSource, source)
}

function sortModules(compilation, modules) {
  if (modules) {
    const { moduleGraph } = compilation
    const usedModules = modules.sort(
      (a, b) => moduleGraph.getPostOrderIndex(a) - moduleGraph.getPostOrderIndex(b)
    )

    return usedModules
  }
}

module.exports = multiThemeHandler
