const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const open = require('open')

const webpackConfig = require('./webpack.config')

process.env.NODE_ENV = 'development'

const compiler = webpack(webpackConfig)
const server = new WebpackDevServer(compiler, {
  open: false,
  hot: true
})

server.listen(8089, 'localhost', (err) => {
  if (!err) {
    open('http://localhost:8089')
  }
})
