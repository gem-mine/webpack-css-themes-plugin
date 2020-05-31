const less = require('less')
const fs = require('fs')
const path = require('path')

const mergeWithArray = require('./mergeWithArray')

async function extractLessVariable(sourceFilePath, parserOptions) {
  return new Promise((resolve, reject) => {
    let paletteLess = fs.readFileSync(sourceFilePath, 'utf8')
    paletteLess = paletteLess.replace(/@import \(less\) "~/, (`@import (less) "${path.join(process.cwd(), 'node_modules')}/`))
    less.parse(paletteLess, mergeWithArray({
      paths: [
        path.dirname(sourceFilePath)
      ],
    }, parserOptions), (err, root, imports, options) => {
      if (err) {
        return reject(err)
      }
      const lessvars = {}
      let hasNoneVariable = false
      const evalEnv = new less.contexts.Eval(options)
      const evaldRoot = root.eval(evalEnv)
      const ruleset = evaldRoot.rules
      ruleset.forEach((rule) => {
        if (rule.variable === true) {
          const name = rule.name.substr(1)
          const { value } = rule
          lessvars[name] = value.toCSS()
        } else if (!rule.isLineComment) {
          hasNoneVariable = true
        }
      })
      if (hasNoneVariable) {
        console.warn(`Webpack-css-themes-plugin themeFile ${
          sourceFilePath} has not-variable content which would be ignore`)
      }
      resolve({
        variableStr: Object.keys(lessvars)
          .map((key) => `@${key}: ${lessvars[key]}`)
          .join(';\r\n')
          .concat(';\r\n'),
        dependencies: Object.keys(imports.contents)
          .filter((r) => r !== 'input')
      })
    })
  })
}

module.exports = {
  extractLessVariable
}
