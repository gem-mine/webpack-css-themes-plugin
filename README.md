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
- Support HMR

This project is inpired by [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)

This should support [ant-design](https://ant.design/), [element-ui](https://element.eleme.io/), which provide source style code in dist packages

# Comparison

Compare with [Ant-Design's offical theme solution](https://ant.design/docs/react/customize-theme)

1. Support output multi-theme css in one compile
2. compile on demand, not fully compile css(`using Umi 3`)
3. use webpack build chain to get full style post-process support like `post-css` and `minify`

## Requirement

- Webpack: \^4.4.0 | \^5.0.0
- less-loader: "\^6.0.0"
- sass-loader: "\^8.0.0"

If you're using `webpack@3`, try [`webpack-css-themes-plugin-legacy`](https://www.npmjs.com/package/webpack-css-themes-plugin-legacy)

## How to Use

1. webpack config

```js

const WebpackCSSThemesPlugin = require('webpack-css-themes-plugin')

const ExcludeAssetsPlugin = require('@ianwalter/exclude-assets-plugin')
// html-webpack-plugin < 4.X
// const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin')

// if you need to enable hmr for this plugin
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

Notice

1. This plugin replaces `extract-text-plugin/mini-css-extract-plugin`, please do not use it together.
2. If you use `html-webpack-plugin`, you need to filter out the CSS injection.

Get more usage from [`test cases`](/test/unit/cases).

2. use import on demand of your component framework

Take antd for example, you must import styles as less format. A common mistake would be importing multiple copied of styles that some of them are css format to override the less styles.

If you import styles by specifying the style option of `babel-plugin-import`, change it from 'css' to true, which will import the less version of antd.

If you import styles from 'antd/dist/antd.css', change it to antd/dist/antd.less.

3. Do not to reference `theme file` in the project, it will automatic inject to every less/sass file in your project

4. load/switch built theme css file

you can use [webpack-theme-set](https://www.npmjs.com/package/webpack-theme-set)

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

or your can load it yourself. just insert/remove `style` DOM to make it work.

## Options

### themes

Type: `Array<theme>`

- theme.name(Type `string?`): name of your theme, required when using `less`/`sass` mix compile.
- theme.entryPath(Type `string`): absolute path of your theme entry, pass in object with `less: {lessThemePath}` and `sass: {sassThemePath}` when using `less`/`sass` mix compile.
- theme.distFilename(Type `string?`): output file name for your theme, default: `[name].css`.

### pre-processor

Type: `string` | `Array`

`less` or `sass`, default `less`.

pass in `['less', 'sass']` when using `less`/`sass` mix compile.

### publicPath

Type: `String|Function`

It will be the `publicPath` of the project by default.

When is a function, and the input parameters are:

- resourcePath: absolute path of resourcePath
- rootContext: webpack's resource Context
