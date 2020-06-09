const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const open = require('open')

const webpackConfig = require('./webpack.config')

const compiler = webpack(webpackConfig)
const server = new WebpackDevServer(compiler, {
  logLevel: 'warn',
  clientLogLevel: 'warning',
  open: false
})

server.listen(8089, 'localhost', (err) => {
  if (!err) {
    open('http://localhost:8089')
  }
})
