var fs = require('fs');
var postcss = require('postcss');
var pxtorem = require('../dist/index.cjs');
var css = fs.readFileSync('main.css', 'utf8');
var processedCss = postcss(pxtorem.pxtorem()).process(css).css;
fs.writeFile('main-rem.css', processedCss, function (err) {
    if (err) {
        throw err;
    }
    console.log('Rem file written.');
});
