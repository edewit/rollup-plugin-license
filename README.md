# rollup-plugin-license-xml [![NPM version](https://badge.fury.io/js/rollup-plugin-license-xml.svg)](https://npmjs.org/package/rollup-plugin-license-xml)

## rollup-plugin-license-xml

Creates a license.xml file from all your dependencies see [template](template.handlebars)

## Install

```sh
$ npm install --save-dev rollup-plugin-license-xml
```

## Usage

### Importing or Requiring

#### Import as ES Module
```js
import license from 'rollup-plugin-license-xml'
```

#### Requiring as CJS
```js
const license = require('rollup-plugin-license-xml')
```

### Usage from rollup config
```js
export default {
  entry: 'module.js',
  dest: 'index.js',
  format: 'cjs',
  plugins: [license()]
}
```

### Usage from build script
```js
rollup({
  entry: 'main.js',
  plugins: [license()]
}).then(...)
```

### results
logged to console on rollup completion
```xml
<other>
    <description>rollup-plugin-license-xml</description>
    <locations>
        <file>/test/_fixtures/bundle-a.js</file>
    </locations>
    <licenses>
    <license>
        <name>MIT</name>
        <url>https://raw.githubusercontent.com/edewit/rollup-plugin-license/master/LICENSE</url>
    </license>
    </licenses>
</other>
<other>
  ...
```

## Options

- **root** - *optional*
  - type: String
  - default: `process.cwd()`
  - description: Application directory, used to display file paths relatively
- **writeTo** - *optional*
  - type: Function
  - default: `null`
  - description: Callback to be invoked with formatted string
  - function will be invoked with:
    - **analysisString** *(String)*
- **onAnalysis** - *optional*
  - type: Function
  - default: `null`
  - description: Callback to be invoked with analysis object
  - function will be invoked with:
    - **analysisObject** *(Object)*
      - **modules** *(Array)* - array of `module` analysis objects
        - **module** *(Object)*
          - **id** *(String)* - path of module / rollup module id
          - **files** *(Array)* - list of files

