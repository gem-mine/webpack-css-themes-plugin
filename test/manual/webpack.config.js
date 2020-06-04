const path = require('path')

const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExcludeAssetsPlugin = require('@ianwalter/exclude-assets-plugin')
// html-webpack-plugin < 4.X
// const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const baseConfig = require('./src/webpack.config')

const absoluteEntry = {}

Object.keys(baseConfig.entry).forEach((name) => {
  absoluteEntry[name] = path.resolve(__dirname, 'src', baseConfig.entry[name])
})

baseConfig.entry = absoluteEntry

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: false,
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
    new HtmlWebpackPlugin({
      excludeAssets: [/\.css$/],
      template: path.resolve(__dirname, './index.html'),
    }),
    new ExcludeAssetsPlugin()
  ]
})
