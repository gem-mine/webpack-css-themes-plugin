# Webpack-css-themes-plugin

# Intro

一次构建，输出多份主题

- 多路口支持
- 多主题支持
- 自动注入loader
- 主题文件内可以包含变量外的规则
- 主题文件可以引用其他文件，包括node_modules
- 按需构建项目代码, 主题文件会注入所有项目使用的样式文件，无需要求主题文件为所有样式入口
- 支持异步chunks

## Requirement

- Webpack: ^4.4.0 | ^5.0.0
- less-loader: "^6.0.0"


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

注意

1. 项目中无需引用`src/theme/index.less`, 除非你的项目样式表需要其中的变量
2. 此插件替代了`extract-text-plugin/mini-css-extract-plugin`， 请不要使用他们
3. 样式loader不能使用`style-loader`
3. 如果你使用了`html-webpack-plugin`, 你需要过滤掉css的注入 // TODO 自动移除

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

## Progress

- [X] plugin参数与参数校验
- [X] loader参数校验
- [X] 支持单主题构建
- [X] 支持多主题构建
- [X] 支持postcss
- [X] 支持css module
- [X] 支持less-loader
- [X] 支持sass-loader
- [X] 更好的html-webpack-plugin处理
- [ ] 主题加载器
  - [ ] 提供主题文件加载器
  - [ ] dev开发模式

## May Support

- [ ] 提供 `less`/`sass`混编