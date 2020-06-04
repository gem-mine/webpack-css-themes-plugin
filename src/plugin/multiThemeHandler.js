const _ = require('lodash')
const webpack = require('webpack')
const sources = require('webpack-sources')

const CssDependency = require('../CssDependency')
const CssDependencyTemplate = require('../CssDependency/CssDependencyTemplate')
const CssModuleFactory = require('../CssDependency/CssModuleFactory')

const { ConcatSource, SourceMapSource, OriginalSource } = sources
const {
  util: { createHash },
} = webpack

const { PluginName, MODULE_TYPE } = require('../const')
const {
  registerCompilerHook
} = require('../utils/webpack')

const REGEXP_CHUNKHASH = /\[chunkhash(?::(\d+))?\]/i
const REGEXP_CONTENTHASH = /\[contenthash(?::(\d+))?\]/i
const REGEXP_NAME = /\[name\]/i


function multiThemeHandler(compilation, options) {
  compilation.dependencyFactories.set(
    CssDependency,
    new CssModuleFactory()
  )

  compilation.dependencyTemplates.set(
    CssDependency,
    new CssDependencyTemplate()
  )

  registerCompilerHook(
    compilation.mainTemplate,
    'renderManifest',
    `${PluginName}- renderManifest`,
    (result, { chunk }) => {
      const renderedModules = Array.from(chunk.modulesIterable).filter(
        (module) => module.type === MODULE_TYPE
      )

      if (renderedModules.length > 0) {
        const renderedModulesGroup = _.groupBy(renderedModules, 'themeName')
        Object.keys(renderedModulesGroup).forEach((themeName) => {
          const renderedModulesByTheme = renderedModulesGroup[themeName]
          result.push({
            render: () => renderContentAsset(
              compilation,
              chunk,
              renderedModulesByTheme,
              compilation.runtimeTemplate.requestShortener
            ),
            filenameTemplate: () => options.moduleFilename(themeName),
            pathOptions: {
              chunk,
              contentHashType: MODULE_TYPE,
            },
            identifier: `${PluginName}.${themeName}.${chunk.id}`,
            hash: chunk.contentHash[MODULE_TYPE],
          })
        })
      }
    }
  )

  registerCompilerHook(
    compilation.chunkTemplate,
    'renderManifest',
    `${PluginName}- renderManifest`,
    (result, { chunk }) => {
      const renderedModules = Array.from(chunk.modulesIterable).filter(
        (module) => module.type === MODULE_TYPE
      )

      if (renderedModules.length > 0) {
        const renderedModulesGroup = _.groupBy(renderedModules, 'themeName')
        Object.keys(renderedModulesGroup).forEach((themeName) => {
          const renderedModulesByTheme = renderedModulesGroup[themeName]
          result.push({
            render: () => renderContentAsset(
              compilation,
              chunk,
              renderedModulesByTheme,
              compilation.runtimeTemplate.requestShortener
            ),
            filenameTemplate: () => options.chunkFilename(themeName),
            pathOptions: {
              chunk,
              contentHashType: MODULE_TYPE,
            },
            identifier: `${PluginName}.${themeName}.${chunk.id}`,
            hash: chunk.contentHash[MODULE_TYPE],
          })
        })
      }
    }
  )

  registerCompilerHook(
    compilation.mainTemplate,
    'hashForChunk',
    `${PluginName}- hashForChunk`,
    (hash, chunk) => {
    // one theme need chunkHash is enough
      const chunkFilename = options.themes.map((theme) => theme.distChunkFilename).join('&')

      if (REGEXP_CHUNKHASH.test(chunkFilename)) {
        hash.update(JSON.stringify(chunk.getChunkMaps(true).hash))
      }

      if (REGEXP_CONTENTHASH.test(chunkFilename)) {
        hash.update(
          JSON.stringify(
            chunk.getChunkMaps(true).contentHash[MODULE_TYPE] || {}
          )
        )
      }

      if (REGEXP_NAME.test(chunkFilename)) {
        hash.update(JSON.stringify(chunk.getChunkMaps(true).name))
      }
    }
  )

  registerCompilerHook(
    compilation,
    'contentHash',
    `${PluginName}- contentHash`,
    (chunk) => {
      const { outputOptions } = compilation
      const { hashFunction, hashDigest, hashDigestLength } = outputOptions
      const hash = createHash(hashFunction)

      for (const m of chunk.modulesIterable) {
        if (m.type === MODULE_TYPE) {
          m.updateHash(hash)
        }
      }

      const { contentHash } = chunk

      contentHash[MODULE_TYPE] = hash
        .digest(hashDigest)
        .substring(0, hashDigestLength)
    }
  )
}

function renderContentAsset(compilation, chunk, modules, requestShortener) {
  modules.sort((a, b) => a.index2 - b.index2)
  const usedModules = modules

  const source = new ConcatSource()
  const externalsSource = new ConcatSource()

  for (const m of usedModules) {
    if (/^@const url/.test(m.content)) {
      // HACK for IE
      // http://stackoverflow.com/a/14676665/1458162
      let { content } = m

      if (m.media) {
        // insert media into the @import
        // this is rar
        // TODO improve this and parse the CSS to support multiple medias
        content = content.replace(/;|\s*$/, m.media)
      }

      externalsSource.add(content)
      externalsSource.add('\n')
    } else {
      if (m.media) {
        source.add(`@media ${m.media} {\n`)
      }

      if (m.sourceMap) {
        source.add(
          new SourceMapSource(
            m.content,
            m.readableIdentifier(requestShortener),
            m.sourceMap
          )
        )
      } else {
        source.add(
          new OriginalSource(
            m.content,
            m.readableIdentifier(requestShortener)
          )
        )
      }
      source.add('\n')

      if (m.media) {
        source.add('}\n')
      }
    }
  }

  return new ConcatSource(externalsSource, source)
}

module.exports = multiThemeHandler
