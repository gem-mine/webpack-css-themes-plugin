# Webpack-css-themes-plugin

# Intro

一次构建，输出多份主题

- 多路口支持
- 多主题支持
- 支持主题文件内包含变量外的规则
- 自动注入loader，支持多loader
- 支持主题文件引用其他文件，包括node_modules
- 支持异步样式

## How to Use

Webpack配置参考如下

```js

const WebpackCSSThemesPlugin = require('../../src/plugin')

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
    ],
  },
  plugins: [
    new WebpackCSSThemesPlugin({
      themes: [{
        name: 'default',
        filePath: path.resolve(__dirname, 'src/theme/index.less')
      }]
    }),
  ],
}
```

注意：项目中无需引用`src/theme/index.less`, 除非你的项目样式表需要其中的变量

## Options

### themes

Type: `Array<theme>`

- theme.name(Type `string?`): 主题名称
- theme.entryPath(Type `string`): 主题文件绝对路径
- theme.distFilename(Type `string?`): 主题输出文件名，支持webpack变量`[hash]`

### pre-processor

Type: `string`

可选`less`/`sass`， 默认`less`

### publicPath

Type: `String|Function`

默认原项目的`publicPath`, 为函数时，入参数为:

- resourcePath: 资源绝对路径
- rootContext: webpack的resource Context

## WIP

- [X] plugin参数与参数校验
- [X] loader参数校验
- [X] 支持单主题构建
  - [X] 支持less-loader
  - [ ] 支持sass-loader
- [X] 支持多主题构建
  - [X] 支持less-loader
  - [ ] 支持sass-loader
  - [X] 支持postcss
  - [X] 支持css module