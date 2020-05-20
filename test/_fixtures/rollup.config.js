'use strict'

import run from './../../module'

export default {
  plugins: [analyzer(), run()],
  input: 'bundle-a.js',
  output: {
    file: 'output.js',
    format: 'cjs'
  }
}
