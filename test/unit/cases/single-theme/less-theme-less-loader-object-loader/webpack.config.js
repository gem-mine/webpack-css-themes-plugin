const MiniCssExtractPlugin = require('mini-css-extract-plugin')
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
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'less-loader',
            options: {}
          }
        ],
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new WebpackCSSThemesPlugin({
      themes: [{
        name: 'default',
        filePath: path.resolve(__dirname, 'theme/index.less')
      }],
    }),
  ],
}
