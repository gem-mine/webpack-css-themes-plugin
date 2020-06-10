const path = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExcludeAssetsPlugin = require('@ianwalter/exclude-assets-plugin')
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
      themes: [
        {
          name: 'default',
          entryPath: path.resolve(__dirname, 'theme/index.less')
        },
        {
          name: 'default2',
          entryPath: path.resolve(__dirname, 'theme/index2.less')
        }
      ]
    }),
    new HtmlWebpackPlugin({
      excludeAssets: [/\.css$/],
      template: path.resolve(__dirname, './index.html'),
    }),
    new ExcludeAssetsPlugin()
  ],
}
