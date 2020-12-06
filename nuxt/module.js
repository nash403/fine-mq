import path from 'path'

const fineMqModule = function module(moduleOptions) {
  const options = this.options.fineMq || moduleOptions

  this.addPlugin({
    src: path.resolve(__dirname, './templates/plugin.js'),
    fileName: 'fine-mq.js',
    options,
  })
}

module.exports = fineMqModule
