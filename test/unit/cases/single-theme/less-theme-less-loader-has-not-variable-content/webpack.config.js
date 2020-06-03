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
      }
    ],
  },
  plugins: [
    new WebpackCSSThemesPlugin({
      themes: [{
        name: 'default',
        entryPath: path.resolve(__dirname, 'theme/index.less')
      }],
    }),
  ],
}
