const fs = require('fs')
const path = require('path')
const globby = require('globby')
const webpack = require('webpack')


function describe(name, fn) {
  fn()
}

function it(name, fn) {
  function done() {}
  fn(done)
}

function expect(param) {
  return {
    toEqual(zz) {
      if (param !== zz) {
        console.log('not-pass')
      } else {
        console.log('pass')
      }
    },
    toBe(zz) {
      if (param !== zz) {
        console.log('not-pass')
      } else {
        console.log('pass')
      }
    }
  }
}

function compareDirectory(actual, expected) {
  const files = fs.readdirSync(expected)

  for (const file of files) {
    const absoluteFilePath = path.resolve(expected, file)

    const stats = fs.lstatSync(absoluteFilePath)

    if (stats.isDirectory()) {
      compareDirectory(
        path.resolve(actual, file),
        path.resolve(expected, file)
      )
    } else if (stats.isFile()) {
      const content = fs.readFileSync(path.resolve(expected, file), 'utf8')
      const actualContent = fs.readFileSync(path.resolve(actual, file), 'utf8')

      expect(actualContent).toEqual(content)
    }
  }
}

function compareWarning(actual, expectedFile) {
  if (!fs.existsSync(expectedFile)) {
    return
  }

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const expected = require(expectedFile)

  expect(actual.trim()).toBe(expected.trim())
}

describe('TestCases', () => {
  const casesDirectoryBase = path.resolve(__dirname, '../unit/cases')
  const outputDirectoryBase = path.resolve(__dirname, '../unit/tmp')

  const casesDirectory = globby.sync('*/*', {
    cwd: casesDirectoryBase,
    onlyDirectories: true,
  })

  for (const directory of casesDirectory) {
    if (!/^(\.|_)&/.test(directory) && directory === 'single-theme/less-theme-less-loader-theme-file-use-node_modules') {
    // eslint-disable-next-line no-loop-func
      it(`${directory} should compile to the expected result`, (done) => {
        const directoryForCase = path.resolve(casesDirectoryBase, directory)
        const outputDirectoryForCase = path.resolve(outputDirectoryBase, directory)
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const webpackConfig = require(path.resolve(
          directoryForCase,
          'webpack.config.js'
        ))

        for (const config of [].concat(webpackConfig)) {
          Object.assign(
            config,
            {
              mode: 'none',
              context: directoryForCase,
              output: {
                path: outputDirectoryForCase,
                ...config.output
              },
            },
            config
          )
        }

        webpack(webpackConfig, (err, stats) => {
          if (err) {
            done(err)
            return
          }

          if (stats.hasErrors()) {
            done(
              new Error(
                stats.toString({
                  context: path.resolve(__dirname, '..'),
                  errorDetails: true,
                })
              )
            )

            return
          }

          const expectedDirectory = path.resolve(directoryForCase, 'expected')
          const expectedDirectoryByVersion = path.join(
            expectedDirectory,
            `webpack-${webpack.version[0]}`
          )

          if (fs.existsSync(expectedDirectoryByVersion)) {
            compareDirectory(
              outputDirectoryForCase,
              expectedDirectoryByVersion
            )
          } else {
            compareDirectory(outputDirectoryForCase, expectedDirectory)
          }

          const expectedWarning = path.resolve(directoryForCase, 'warnings.js')
          const actualWarning = stats.toString({
            all: false,
            warnings: true
          })
          compareWarning(actualWarning, expectedWarning)

          done()
        })
      }, 10000)
    }
  }
})
