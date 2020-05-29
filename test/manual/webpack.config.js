const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

const WebpackCSSThemesPlugin = require('../../src')

module.exports = {
  mode: 'development',
  devtool: false,
  entry: {
    app: `${__dirname}/src/index.jsx`,
  },
  resolve: {
    extensions: ['.jsx', '.js'],
    alias: {
      fish: '@sdp.nd/fish',
    },
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
            options: {
              lessOptions: {
                // javascriptEnabled: true
              }
            },
          },
          WebpackCSSThemesPlugin.loader
        ],
      },
      {
        test: /\.(svg)(\?.*)?$/,
        use: 'url-loader',
      },
      {
        test: /\.m?jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
            plugins: [
              ['import', {
                libraryName: 'fish',
                libraryDirectory: 'es',
                style: true,
              }],
            ],
          },
        },
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
    new MiniCssExtractPlugin(),
    new WebpackCSSThemesPlugin({
      themes: [{
        name: 'xxx',
        filePath: 'testPath'
      }],
      minify: false,
      isCSSModules: true
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ],
}
