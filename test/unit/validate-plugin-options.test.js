const MiniCssExtractPlugin = require('../../src')

describe('validate options', () => {
  const tests = [{
    key: 'full options',
    type: 'success',
    value: {
      themes: [{
        name: 'xxx',
        filePath: 'testPath'
      }],
      minify: false,
      isCSSModules: true
    },
  }, {
    key: 'no boolean',
    type: 'success',
    value: {
      themes: [{
        name: 'xxx',
        filePath: 'testPath'
      }],
    }
  }, {
    key: 'no theme',
    type: 'failure',
    value: {}
  }, {
    key: 'empty theme',
    type: 'failure',
    value: {
      themes: []
    }
  }, {
    key: 'error minify type',
    type: 'failure',
    value: {
      themes: [{
        name: 'xxx',
        filePath: 'testPath'
      }],
      minify: 'xx',
    }
  }]

  function createTestCase(key, value, type) {
    it(`should ${
      type === 'success' ? 'successfully validate' : 'throw an error on'
    } the "${key}" option with "${JSON.stringify(value)}" value`, () => {
      let error

      try {
        // eslint-disable-next-line no-new
        new MiniCssExtractPlugin(value)
      } catch (errorFromPlugin) {
        if (errorFromPlugin.name !== 'ValidationError') {
          throw errorFromPlugin
        }

        error = errorFromPlugin
      } finally {
        if (type === 'success') {
          expect(error).toBeUndefined()
        } else if (type === 'failure') {
          expect(() => {
            throw error
          }).toThrowErrorMatchingSnapshot()
        }
      }
    })
  }

  tests.forEach(({
    key, value, type
  }) => {
    createTestCase(key, value, type)
  })
})
