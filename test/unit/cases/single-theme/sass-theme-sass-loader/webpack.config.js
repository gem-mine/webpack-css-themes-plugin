const path = require('path')

const WebpackCSSThemesPlugin = require('../../../../../src')

module.exports = {
  entry: {
    app: './index.js',
  },
  module: {
    rules: [
      {
        test: /\.sass$/i,
        use: [
          'css-loader',
          'sass-loader'
        ],
      },
    ]
  },
  plugins: [
    new WebpackCSSThemesPlugin({
      themes: [
        {
          name: 'default',
          entryPath: path.resolve(__dirname, 'theme/index.sass')
        }
      ],
      'pre-processor': 'sass'
    }),
  ],
}
