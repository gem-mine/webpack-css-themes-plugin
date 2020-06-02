const MiniCssExtractPlugin = require('../../src')

describe('validate options', () => {
  const tests = [{
    key: 'full options',
    type: 'success',
    value: {
      themes: [{
        name: 'xxx',
        entryPath: 'testPath'
      }]
    },
  }, {
    key: 'error pre-processor',
    type: 'success',
    value: {
      themes: [{
        name: 'xxx',
        entryPath: 'testPath'
      }],
      'pre-processor': 'sass'
    }
  }, {
    key: 'no boolean',
    type: 'success',
    value: {
      themes: [{
        name: 'xxx',
        entryPath: 'testPath'
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
    key: 'error pre-processor',
    type: 'failure',
    value: {
      themes: [{
        name: 'xxx',
        entryPath: 'testPath'
      }],
      'pre-processor': 'lessx'
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
