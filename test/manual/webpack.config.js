/* eslint-disable no-unused-vars */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const fs = require('fs')
const WebpackCSSThemesPlugin = require('../../src/plugin')

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    app: `${__dirname}/src/index.js`
  },
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          'css-loader',
          'less-loader'
        ],
      },
    ],
  },
  output: {
    path: `${__dirname}/dist`,
    filename: 'bundle-[name].js',
    library: 'xxx',
    libraryTarget: 'umd',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000,
  },
  plugins: [
    new WebpackCSSThemesPlugin({
      themes: [
        {
          name: 'theme2',
          entryPath: path.resolve(__dirname, 'src/theme/index2.less')
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ]
}
