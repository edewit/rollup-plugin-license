'use strict'

import license from './module'

const appendExportPlugin = () => {
  return {
    name: 'append-export-default',
    transform: (code) => {
      return { code: `${code}\nplugin.default = plugin` }
    }
  }
}

export default {
  plugins: [
    license(),
    appendExportPlugin()
  ],
  input: 'module.js',
  output: {
    file: 'index.js',
    format: 'cjs'
  }
}
