const _ = require('lodash')
const webpack = require('webpack')
const sources = require('webpack-sources')

const CssDependency = require('../CssDependency')
const CssDependencyTemplate = require('../CssDependency/CssDependencyTemplate')
const CssModuleFactory = require('../CssDependency/CssModuleFactory')

const { ConcatSource, SourceMapSource, OriginalSource } = sources
const {
  Template,
  util: { createHash },
} = webpack

const { PluginName, MODULE_TYPE } = require('../const')

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

  compilation.mainTemplate.hooks.renderManifest.tap(PluginName, (result, { chunk }) => {
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
  })

  compilation.chunkTemplate.hooks.renderManifest.tap(PluginName, (result, { chunk }) => {
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
  })

  compilation.mainTemplate.hooks.hashForChunk.tap(PluginName, (hash, chunk) => {
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
  })

  compilation.hooks.contentHash.tap(PluginName, (chunk) => {
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
  })

  const { mainTemplate } = compilation

  mainTemplate.hooks.localVars.tap(PluginName, (source, chunk) => {
    const chunkMap = getCssChunkObject(chunk)

    if (Object.keys(chunkMap).length > 0) {
      return Template.asString([
        source,
        '',
        '// object to store loaded CSS chunks',
        'var installedCssChunks = {',
        Template.indent(
          chunk.ids.map((id) => `${JSON.stringify(id)}: 0`).join(',\n')
        ),
        '}',
      ])
    }

    return source
  })

  mainTemplate.hooks.requireEnsure.tap(PluginName, (source, chunk, hash) => {
    const chunkMap = getCssChunkObject(chunk)

    if (Object.keys(chunkMap).length > 0) {
      const chunkMaps = chunk.getChunkMaps()
      const { crossOriginLoading } = mainTemplate.outputOptions
      // TODO 根据theme分离
      const linkHrefPath = mainTemplate.getAssetPath(
        JSON.stringify(this.options.chunkFilename),
        {
          hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
          hashWithLength: (length) => `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
          chunk: {
            id: '" + chunkId + "',
            hash: `" + ${JSON.stringify(chunkMaps.hash)}[chunkId] + "`,
            hashWithLength(length) {
              const shortChunkHashMap = Object.create(null)

              for (const chunkId of Object.keys(chunkMaps.hash)) {
                if (typeof chunkMaps.hash[chunkId] === 'string') {
                  shortChunkHashMap[chunkId] = chunkMaps.hash[
                    chunkId
                  ].substring(0, length)
                }
              }

              return `" + ${JSON.stringify(
                shortChunkHashMap
              )}[chunkId] + "`
            },
            contentHash: {
              [MODULE_TYPE]: `" + ${JSON.stringify(
                chunkMaps.contentHash[MODULE_TYPE]
              )}[chunkId] + "`,
            },
            contentHashWithLength: {
              [MODULE_TYPE]: (length) => {
                const shortContentHashMap = {}
                const contentHash = chunkMaps.contentHash[MODULE_TYPE]

                for (const chunkId of Object.keys(contentHash)) {
                  if (typeof contentHash[chunkId] === 'string') {
                    shortContentHashMap[chunkId] = contentHash[
                      chunkId
                    ].substring(0, length)
                  }
                }

                return `" + ${JSON.stringify(
                  shortContentHashMap
                )}[chunkId] + "`
              },
            },
            name: `" + (${JSON.stringify(
              chunkMaps.name
            )}[chunkId]||chunkId) + "`,
          },
          contentHashType: MODULE_TYPE,
        }
      )

      return Template.asString([
        source,
        '',
        `// ${PluginName} CSS loading`,
        `var cssChunks = ${JSON.stringify(chunkMap)};`,
        'if(installedCssChunks[chunkId]) promises.push(installedCssChunks[chunkId]);',
        'else if(installedCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {',
        Template.indent([
          'promises.push(installedCssChunks[chunkId] = new Promise(function(resolve, reject) {',
          Template.indent([
            `var href = ${linkHrefPath};`,
            `var fullhref = ${mainTemplate.requireFn}.p + href;`,
            'var existingLinkTags = document.getElementsByTagName("link");',
            'for(var i = 0; i < existingLinkTags.length; i++) {',
            Template.indent([
              'var tag = existingLinkTags[i];',
              'var dataHref = tag.getAttribute("data-href") || tag.getAttribute("href");',
              'if(tag.rel === "stylesheet" && (dataHref === href || dataHref === fullhref)) return resolve();',
            ]),
            '}',
            'var existingStyleTags = document.getElementsByTagName("style");',
            'for(var i = 0; i < existingStyleTags.length; i++) {',
            Template.indent([
              'var tag = existingStyleTags[i];',
              'var dataHref = tag.getAttribute("data-href");',
              'if(dataHref === href || dataHref === fullhref) return resolve();',
            ]),
            '}',
            'var linkTag = document.createElement("link");',
            'linkTag.rel = "stylesheet";',
            'linkTag.type = "text/css";',
            'linkTag.onload = resolve;',
            'linkTag.onerror = function(event) {',
            Template.indent([
              'var request = event && event.target && event.target.src || fullhref;',
              'var err = new Error("Loading CSS chunk " + chunkId + " failed.\\n(" + request + ")");',
              'err.code = "CSS_CHUNK_LOAD_FAILED";',
              'err.request = request;',
              'delete installedCssChunks[chunkId]',
              'linkTag.parentNode.removeChild(linkTag)',
              'reject(err);',
            ]),
            '};',
            'linkTag.href = fullhref;',
            crossOriginLoading
              ? Template.asString([
                'if (linkTag.href.indexOf(window.location.origin + \'/\') !== 0) {',
                Template.indent(
                  `linkTag.crossOrigin = ${JSON.stringify(
                    crossOriginLoading
                  )};`
                ),
                '}',
              ])
              : '',
            'var head = document.getElementsByTagName("head")[0];',
            'head.appendChild(linkTag);',
          ]),
          '}).then(function() {',
          Template.indent(['installedCssChunks[chunkId] = 0;']),
          '}));',
        ]),
        '}',
      ])
    }

    return source
  })
}

function getCssChunkObject(mainChunk) {
  const obj = {}

  for (const chunk of mainChunk.getAllAsyncChunks()) {
    for (const module of chunk.modulesIterable) {
      if (module.type === MODULE_TYPE) {
        obj[chunk.id] = 1
        break
      }
    }
  }

  return obj
}

function renderContentAsset(compilation, chunk, modules, requestShortener) {
  let usedModules

  const [chunkGroup] = chunk.groupsIterable

  if (typeof chunkGroup.getModuleIndex2 === 'function') {
    // Store dependencies for modules
    const moduleDependencies = new Map(modules.map((m) => [m, new Set()]))
    const moduleDependenciesReasons = new Map(
      modules.map((m) => [m, new Map()])
    )

    // Get ordered list of modules per chunk group
    // This loop also gathers dependencies = require(the ordered lists
    // Lists are in reverse order to allow to use Array.pop()
    const modulesByChunkGroup = Array.from(chunk.groupsIterable, (cg) => {
      const sortedModules = modules
        .map((m) => ({
          module: m,
          index: cg.getModuleIndex2(m),
        }))
      // eslint-disable-next-line no-undefined
        .filter((item) => item.index !== undefined)
        .sort((a, b) => b.index - a.index)
        .map((item) => item.module)

      for (let i = 0; i < sortedModules.length; i++) {
        const set = moduleDependencies.get(sortedModules[i])
        const reasons = moduleDependenciesReasons.get(sortedModules[i])

        for (let j = i + 1; j < sortedModules.length; j++) {
          const module = sortedModules[j]
          set.add(module)
          const reason = reasons.get(module) || new Set()
          reason.add(cg)
          reasons.set(module, reason)
        }
      }

      return sortedModules
    })

    // set with already included modules in correct order
    usedModules = new Set()

    const unusedModulesFilter = (m) => !usedModules.has(m)

    while (usedModules.size < modules.length) {
      let success = false
      let bestMatch
      let bestMatchDeps

      // get first module where dependencies are fulfilled
      for (const list of modulesByChunkGroup) {
        // skip and remove already added modules
        while (list.length > 0 && usedModules.has(list[list.length - 1])) {
          list.pop()
        }

        // skip empty lists
        if (list.length !== 0) {
          const module = list[list.length - 1]
          const deps = moduleDependencies.get(module)
          // determine dependencies that are not yet included
          const failedDeps = Array.from(deps).filter(unusedModulesFilter)

          // store best match for fallback behavior
          if (!bestMatchDeps || bestMatchDeps.length > failedDeps.length) {
            bestMatch = list
            bestMatchDeps = failedDeps
          }

          if (failedDeps.length === 0) {
            // use this module and remove it = require(list
            usedModules.add(list.pop())
            success = true
            break
          }
        }
      }

      if (!success) {
        // no module found => there is a conflict
        // use list with fewest failed deps
        // and emit a warning
        const fallbackModule = bestMatch.pop()
        // TODO 保留参数支持
        if (!this.options.ignoreOrder) {
          const reasons = moduleDependenciesReasons.get(fallbackModule)
          compilation.warnings.push(
            new Error(
              [
                `chunk ${chunk.name || chunk.id} [${PluginName}]`,
                'Conflicting order. Following module has been added:',
                ` * ${fallbackModule.readableIdentifier(requestShortener)}`,
                'despite it was not able to fulfill desired ordering with these modules:',
                ...bestMatchDeps.map((m) => {
                  const goodReasonsMap = moduleDependenciesReasons.get(m)
                  const goodReasons = goodReasonsMap && goodReasonsMap.get(fallbackModule)
                  const failedChunkGroups = Array.from(
                    reasons.get(m),
                    (cg) => cg.name
                  ).join(', ')
                  const goodChunkGroups = goodReasons
                      && Array.from(goodReasons, (cg) => cg.name).join(', ')
                  return [
                    ` * ${m.readableIdentifier(requestShortener)}`,
                    `   - couldn't fulfill desired order of chunk group(s) ${failedChunkGroups}`,
                    goodChunkGroups
                        && `   - while fulfilling desired order of chunk group(s) ${goodChunkGroups}`,
                  ]
                    .filter(Boolean)
                    .join('\n')
                }),
              ].join('\n')
            )
          )
        }

        usedModules.add(fallbackModule)
      }
    }
  } else {
    // fallback for older webpack versions
    // (to avoid a breaking change)
    // TODO remove this in next major version
    // and increase minimum webpack version to 4.12.0
    modules.sort((a, b) => a.index2 - b.index2)
    usedModules = modules
  }

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
