const pxtorem = require('../../dist/index.js')

module.exports = {
  plugins: [
    pxtorem.pxtorem({
      propList: ['*'],
      exclude: (file) => {
        return file.includes('node_modules/antd-mobile')
      },
    }),
  ],
}
