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
        use: [
          'css-loader',
          'less-loader',
        ],
      }
    ],
  },
  plugins: [
    new WebpackCSSThemesPlugin({
      themes: [
        {
          name: 'theme1',
          entryPath: path.resolve(__dirname, 'theme/index.less'),
          distFilename: '[name]-test.css'
        },
        {
          name: 'theme2',
          entryPath: path.resolve(__dirname, 'theme/index2.less'),
          distFilename: '[name]-[contenthash]-test.css'
        }
      ]
    }),
  ],
}
