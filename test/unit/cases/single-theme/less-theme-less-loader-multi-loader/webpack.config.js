const path = require('path')

const WebpackCSSThemesPlugin = require('../../../../../src')

module.exports = {
  entry: {
    app: './index.js',
  },
  module: {
    rules: [
      {
        test: /\.less$/i,
        oneOf: [
          /* config.module.rule('less').rule('css-modules') */
          {
            test: /\.module\.\w+$/,
            use: [
              {
                loader: 'css-loader',
                options: {
                  sourceMap: undefined,
                  importLoaders: 1,
                  modules: {
                    localIdentName: '[name]_[local]_[hash:base64:5]'
                  }
                }
              },
              'less-loader'
            ]
          },
          /* config.module.rule('less').rule('normal') */
          {
            use: [
              'css-loader',
              'less-loader'
            ]
          }
        ]
      }
    ],
  },
  plugins: [
    new WebpackCSSThemesPlugin({
      themes: [{
        name: 'default',
        entryPath: path.resolve(__dirname, 'theme/index.less')
      }],
    }),
  ],
}
