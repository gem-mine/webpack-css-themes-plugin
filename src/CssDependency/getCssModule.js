const {
  cssModuleCache,
  MODULE_TYPE,
  CODE_GENERATION_RESULT
} = require('../const')

const TYPES = new Set([MODULE_TYPE])

module.exports = function getCssModule(webpack) {
  /**
   * Prevent creation of multiple CssModule classes to allow
   * other integrations to get the current CssModule.
   */
  if (cssModuleCache.has(webpack)) {
    return cssModuleCache.get(webpack)
  }
  class CssModule extends webpack.Module {
    constructor({
      context,
      identifier,
      identifierIndex,
      content,
      media,
      sourceMap,
      assets,
      assetsInfo,
      themeName,
    }) {
      super(MODULE_TYPE, context)

      this.id = ''
      this._context = context
      this._identifier = identifier
      this._identifierIndex = identifierIndex
      this.content = content
      this.media = media
      this.assets = assets
      this.assetsInfo = assetsInfo
      this.sourceMap = sourceMap
      this.themeName = themeName
      this._needBuild = true
    }

    // no source() so webpack 4 doesn't do add stuff to the bundle

    size() {
      return this.content.length
    }

    identifier() {
      return `css|${this._identifier}|${this._identifierIndex}`
    }

    readableIdentifier(requestShortener) {
      return `css ${requestShortener.shorten(this._identifier)}${
        this._identifierIndex ? ` (${this._identifierIndex})` : ''
      }`
    }

    // eslint-disable-next-line class-methods-use-this
    getSourceTypes() {
      return TYPES
    }

    // eslint-disable-next-line class-methods-use-this
    codeGeneration() {
      return CODE_GENERATION_RESULT
    }

    nameForCondition() {
      const resource = this._identifier.split('!').pop()
      const idx = resource.indexOf('?')

      if (idx >= 0) {
        return resource.substring(0, idx)
      }

      return resource
    }

    updateCacheModule(module) {
      if (
        this.content !== module.content
        || this.media !== module.media
        || this.sourceMap !== module.sourceMap
        || this.assets !== module.assets
        || this.assetsInfo !== module.assetsInfo
        || this.themeName !== module.themeName
      ) {
        this._needBuild = true

        this.content = module.content
        this.media = module.media
        this.sourceMap = module.sourceMap
        this.assets = module.assets
        this.assetsInfo = module.assetsInfo
        this.themeName = module.themeName
      }
    }

    // eslint-disable-next-line class-methods-use-this
    needRebuild() {
      return this._needBuild
    }

    // eslint-disable-next-line class-methods-use-this
    needBuild(context, callback) {
      callback(null, this._needBuild)
    }

    build(options, compilation, resolver, fileSystem, callback) {
      this.buildInfo = {
        assets: this.assets,
        assetsInfo: this.assetsInfo,
        themeName: this.themeName,
        cacheable: true,
        hash: this._computeHash(compilation.outputOptions.hashFunction),
      }
      this.buildMeta = {}
      this._needBuild = false

      callback()
    }

    _computeHash(hashFunction) {
      const hash = webpack.util.createHash(hashFunction)

      hash.update(this.content)
      hash.update(this.media || '')
      hash.update(this.sourceMap || '')

      return hash.digest('hex')
    }

    updateHash(hash, context) {
      super.updateHash(hash, context)

      hash.update(this.buildInfo.hash)
    }

    serialize(context) {
      const { write } = context

      write(this._context)
      write(this._identifier)
      write(this._identifierIndex)
      write(this.content)
      write(this.media)
      write(this.sourceMap)
      write(this.assets)
      write(this.assetsInfo)
      write(this.themeName)
      write(this._needBuild)

      super.serialize(context)
    }

    deserialize(context) {
      this._needBuild = context.read()

      super.deserialize(context)
    }
  }

  cssModuleCache.set(webpack, CssModule)

  webpack.util.serialization.register(
    CssModule,
    'mini-css-extract-plugin/dist/CssModule',
    null,
    {
      serialize(instance, context) {
        instance.serialize(context)
      },
      deserialize(context) {
        const { read } = context

        const contextModule = read()
        const identifier = read()
        const identifierIndex = read()
        const content = read()
        const media = read()
        const sourceMap = read()
        const assets = read()
        const assetsInfo = read()
        const themeName = read()

        const dep = new CssModule({
          context: contextModule,
          identifier,
          identifierIndex,
          content,
          media,
          sourceMap,
          assets,
          assetsInfo,
          themeName
        })

        dep.deserialize(context)

        return dep
      },
    }
  )

  return CssModule
}
