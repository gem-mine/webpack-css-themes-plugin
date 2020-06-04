# Webpack-css-themes-plugin

[English](./README.md) / 简体中文

# 介绍

一次构建，输出多份主题样式，每个主题一个文件。

- 支持webpack多入口
- 支持`sass`/`less`
- 主题文件支持包含变量或者样式规则
- 主题文件可以引用其他文件，包括`node_modules`中的文件
- 按需构建，主题文件会注入到每个被引用的样式文件
- 支持异步chunks

## 要求

- Webpack: \^4.4.0 | \^5.0.0
- less-loader: "\^6.0.0"
- sass-loader: "\^8.0.0"

## 范例

```js

const WebpackCSSThemesPlugin = require('webpack-css-themes-plugin')

const ExcludeAssetsPlugin = require('@ianwalter/exclude-assets-plugin')
// html-webpack-plugin < 4.X
// const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  module: {
    rules: [
      {
        test: /\.less$/i,
        use: [
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
      {
        test: /\.css$/i,
        use: 'css-loader'
      }
    ],
  },
  plugins: [
    new WebpackCSSThemesPlugin({
      themes: [{
        name: 'default',
        filePath: path.resolve(__dirname, 'src/theme/index.less')
      }]
    }),
    // exclude css inject
    new HtmlWebpackPlugin({
      excludeAssets: [/\.css$/],
      template: path.resolve(__dirname, './index.html'),
    }),
    new ExcludeAssetsPlugin()
  ],
}
```

注意

1. 项目中无需引用`src/theme/index.less`, 除非你的项目样式表需要其中的变量
2. 此插件替代了`extract-text-plugin/mini-css-extract-plugin`， 请不要一起使用
3. 样式loader链中不能使用`style-loader`
3. 如果你使用了`html-webpack-plugin`, 你需要过滤掉css的注入

更多用法请参考[`测试用例`](/test/unit/cases).

## 参数

### themes

Type: `Array<theme>`

- theme.name(Type `string?`): 主题名称
- theme.entryPath(Type `string`): 主题文件绝对路径
- theme.distFilename(Type `string?`): 主题输出文件名，默认: `[name].css`.

### pre-processor

Type: `string`

`less` or `sass`, 默认`less`.

### publicPath

Type: `String|Function`

默认原项目的`publicPath`, 

当`publicPath`为函数时，入参数为:

- resourcePath: 资源绝对路径
- rootContext: webpack的resource Context

