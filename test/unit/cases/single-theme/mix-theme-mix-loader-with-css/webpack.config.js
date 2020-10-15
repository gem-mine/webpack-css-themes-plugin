const path = require('path')

const WebpackCSSThemesPlugin = require('../../../../../src')

module.exports = {
  entry: {
    app: './index.js',
  },
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.sass$/i,
        use: [
          'css-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.css$/i,
        use: [
          'css-loader'
        ],
      }
    ],
  },
  plugins: [
    new WebpackCSSThemesPlugin({
      themes: [{
        name: 'default',
        entryPath: {
          sass: path.resolve(__dirname, 'theme/index.sass'),
          less: path.resolve(__dirname, 'theme/index.less'),
        }
      }],
      'pre-processor': ['sass', 'less']
    }),
  ],
}
