/* eslint-disable no-unused-vars */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const fs = require('fs')
const WebpackCSSThemesPlugin = require('../../src/plugin')

const loader = require.resolve('../../src/loader/index.js')
const Plugin2 = require('../../src/extractPlugin/index.js')

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    app: `${__dirname}/src/index.js`,
  },
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
          loader,
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
    new Plugin2({
      filename: 'app1.css'
    }),
    new WebpackCSSThemesPlugin({
      themes: [
        {
          name: 'default',
          filePath: path.resolve(__dirname, 'src/theme/index.less')
        }
      ],
      minify: false,
      isCSSModules: true
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ],
}
