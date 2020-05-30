# Webpack-css-themes-plugin

# DemoCode

Webpack配置参考如下

```js
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const WebpackCSSThemesPlugin = require('../../src/plugin')

module.exports = {
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
                javascriptEnabled: true
              }
            },
          }
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new WebpackCSSThemesPlugin({
      themes: [{
        name: 'default',
        filePath: path.resolve(__dirname, 'src/theme/index.less')
      }],
      minify: false,
      isCSSModules: true
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),
  ],
}
```

注意：项目中无需引用`src/theme/index.less`, 除非你的项目样式表需要其中的变量

# WIP

- [X] plugin参数与参数校验
- [X] loader参数校验
- [X] 支持单主题构建
  - [X] 支持less-loader
  - [ ] 支持sass-loader
  - [X] 支持项目less
  - [ ] 支持项目sass
- [] 支持多主题构建
  - [ ] 支持less-loader
  - [ ] 支持sass-loader
  - [ ] 支持项目less
  - [ ] 支持项目sass 