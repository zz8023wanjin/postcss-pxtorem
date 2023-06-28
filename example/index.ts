const fs = require('fs')
const postcss = require('postcss')
const pxtorem = require('../dist/index.js')

const css = fs.readFileSync('main.css', 'utf8')

const processedCss = postcss(pxtorem.pxtorem()).process(css).css

fs.writeFile('main-rem.css', processedCss, function (err) {
  if (err) {
    throw err
  }
  console.log('Rem file written.')
})
