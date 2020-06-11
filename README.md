# Webpack-css-themes-plugin

English / [简体中文](./README.zh-CN.md)

# Intro

Compile once and output multiple theme style sheets

- Support webpack multiple entries
- Support `sass`/`less`
- Theme files can contain rules other than variables
- Theme files can refer to other files, including file in `node_modules`
- Build on demand, theme file will be injected into the style files used by project
- Support asynchronous chunks

This project is inpired by [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)

## Requirement

- Webpack: \^4.4.0 | \^5.0.0
- less-loader: "\^6.0.0"
- sass-loader: "\^8.0.0"

## How to Use

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

Notice

1. There is no need to reference `src/theme/index.less` in the project unless your project style sheet needs the variables in it.
2. This plugin replaces `extract-text-plugin/mini-css-extract-plugin`, please do not use it together.
3. If you use `html-webpack-plugin`, you need to filter out the CSS injection.

Get more usage from [`test cases`](/test/unit/cases).

## Options

### themes

Type: `Array<theme>`

- theme.name(Type `string?`): name of your theme
- theme.entryPath(Type `string`): absolute path of your theme entry
- theme.distFilename(Type `string?`): output file name for your theme, default: `[name].css`.

### pre-processor

Type: `string`

`less` or `sass`, default `less`.

### publicPath

Type: `String|Function`

It will be the `publicPath` of the project by default.

When is a function, and the input parameters are:

- resourcePath: absolute path of resourcePath
- rootContext: webpack's resource Context
