const path = require('path')

const WebpackCSSThemesPlugin = require('../../../../../src')

module.exports = {
  entry: {
    app1: './index.js',
    app2: './index2.js',
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
      themes: [
        {
          name: 'theme1',
          entryPath: path.resolve(__dirname, 'theme/index.less')
        },
        {
          name: 'theme2',
          entryPath: path.resolve(__dirname, 'theme/index2.less')
        }
      ]
    }),
  ],
}
