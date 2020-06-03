/* eslint-disable no-unused-vars */
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const fs = require('fs')
const WebpackCSSThemesPlugin = require('../../src/plugin')

const loader = require.resolve('../../src/loader/index.js')

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
    // new Plugin2({
    //   filename: 'app.css'
    // }),
    new WebpackCSSThemesPlugin({
      themes: [
        {
          name: 'default',
          entryPath: path.resolve(__dirname, 'src/theme/index.less')
        },
        {
          name: 'default2',
          entryPath: path.resolve(__dirname, 'src/theme/index2.less')
        }
      ]
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ],
}
