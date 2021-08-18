const { cssDependencyCache } = require('../const')

module.exports = function getCssDependency(webpack) {
  /**
     * Prevent creation of multiple CssDependency classes to allow other
     * integrations to get the current CssDependency.
     */
  if (cssDependencyCache.has(webpack)) {
    return cssDependencyCache.get(webpack)
  }
  // eslint-disable-next-line no-shadow
  class CssDependency extends webpack.Dependency {
    constructor(
      {
        identifier, content, media, sourceMap,
      },
      context,
      identifierIndex,
      themeName
    ) {
      super()

      this.identifier = identifier
      this.identifierIndex = identifierIndex
      this.content = content
      this.media = media
      this.sourceMap = sourceMap
      this.context = context
      this.assets = undefined
      this.assetsInfo = undefined
      this.themeName = themeName
    }

    getResourceIdentifier() {
      return `css-module-${this.identifier}-${this.identifierIndex}`
    }

    // eslint-disable-next-line class-methods-use-this
    getModuleEvaluationSideEffectsState() {
      return webpack.ModuleGraphConnection.TRANSITIVE_ONLY
    }

    serialize(context) {
      const { write } = context

      write(this.identifier)
      write(this.content)
      write(this.media)
      write(this.sourceMap)
      write(this.context)
      write(this.identifierIndex)
      write(this.assets)
      write(this.assetsInfo)
      write(this.themeName)

      super.serialize(context)
    }

    deserialize(context) {
      super.deserialize(context)
    }
  }

  cssDependencyCache.set(webpack, CssDependency)

  webpack.util.serialization.register(
    CssDependency,
    'mini-css-extract-plugin/dist/CssDependency',
    null,
    {
      serialize(instance, context) {
        instance.serialize(context)
      },
      deserialize(context) {
        const { read } = context
        const dep = new CssDependency(
          {
            identifier: read(),
            content: read(),
            media: read(),
            sourceMap: read(),
          },
          read(),
          read()
        )

        const assets = read()
        const assetsInfo = read()
        const themeName = read()

        dep.assets = assets
        dep.assetsInfo = assetsInfo
        dep.themeName = themeName
        dep.deserialize(context)

        return dep
      },
    }
  )

  return CssDependency
}
