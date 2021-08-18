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

本插件支持所有在Dist包中提供样式源文件的组件库，比如 [ant-design](https://ant.design/), [element-ui]等

# 对比

与[Ant-Design官方的多主题解决方案](https://ant.design/docs/react/customize-theme)相比

1. 一次输出多份主题，使得线上切换成为可能
2. 按需构建主题，而不是全量构建全部组件库的主题(`using Umi 3`)
3. 使用`webpack`内置的构建链，使得`webpack`内置的后处理(`post-css`, `minify`)等可以直接支持，无需额外处理

## 要求

- Webpack: \^5.45.1
- less-loader: \^8.0.0
- sass-loader: \^12.0.0

### 老版本兼容

对于`webpack@4`, 请使用`webpack-css-themes-plugin@1.0.0`，目前发布在`tag = webpack4`上

- Webpack: \^4.4.0
- less-loader: "\^6.0.0"
- sass-loader: "\^8.0.0"

对于`webpack@3`用户, 请使用[`webpack-css-themes-plugin-legacy`](https://www.npmjs.com/package/webpack-css-themes-plugin-legacy)

## 如何使用

1. webpack配置

```js

const WebpackCSSThemesPlugin = require('webpack-css-themes-plugin')

const ExcludeAssetsPlugin = require('@ianwalter/exclude-assets-plugin')
// html-webpack-plugin < 4.X
// const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin')

// 如果需要开启HMR
process.env.NODE_ENV = 'development'

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
        entryPath: path.resolve(__dirname, 'src/theme/index.less')
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
1. 此插件替代了`extract-text-plugin/mini-css-extract-plugin`， 请不要一起使用
2. 如果你使用了`html-webpack-plugin`, 你需要过滤掉css的注入

更多用法请参考[`测试用例`](/test/unit/cases).

2. 使用组件库的按需加载

以antd为例，注意样式必须加载 less 格式，一个常见的问题就是引入了多份样式，less 的样式被 css 的样式覆盖了。

如果你在使用 babel-plugin-import 的 style 配置来引入样式，需要将配置值从 'css' 改为 true，这样会引入 less 文件。

如果你是通过 'antd/dist/antd.css' 引入样式的，改为 antd/dist/antd.less。

3. 项目代码中，不要引用主题文件，本插件会注入到任意项目引用的样式表中

4. 加载切换主题

可以使用[webpack-theme-set](https://www.npmjs.com/package/webpack-theme-set)，也可以自行实现。

原理就是注入CSS Link和修改CSS Link

```js
import themeSetter from 'webpack-theme-set'
// inital set Theme
themeSetter.setTheme('light', {
  prefix: 'main-'
}).then(() => {
   ReactDOM.render(.....)
})
// switch Theme
themeSetter.setTheme('light')
```


## 参数

### themes

Type: `Array<theme>`

- theme.name(Type `string?`): 主题名称, 当使用`sass`,`less`混合编译时，必填
- theme.entryPath(Type `string` | `object`): 主题文件绝对路径, 当使用`sass`,`less`混合编译时, 需要传入包含`less: {lessThemePath}`和`sass: {sassThemePath}`的对象
- theme.distFilename(Type `string?`): 主题输出文件名，默认: `[name].css`.

### pre-processor

Type: `string` | `Array`

`less` or `sass`, 默认`less`.

如果需要`sass`,`less`，请传入`['less', 'sass']`

### publicPath

Type: `String|Function`

默认原项目的`publicPath`, 

当`publicPath`为函数时，入参数为:

- resourcePath: 资源绝对路径
- rootContext: webpack的resource Context

