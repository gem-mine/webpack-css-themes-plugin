const webpack = require('webpack')

class CssDependency extends webpack.Dependency {
  constructor(
    {
      identifier, content, media, sourceMap
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
    this.themeName = themeName
  }

  getResourceIdentifier() {
    return `css-module-${this.identifier}-${this.identifierIndex}`
  }
}

module.exports = CssDependency
