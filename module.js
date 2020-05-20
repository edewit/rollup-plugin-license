'use strict'

const path = require('path')
const fs = require('fs')
const Handlebars = require('handlebars')

const license = (bundle, opts = {}) => {
  const bundleModules = bundle.modules || (bundle.cache || {}).modules || []
  let { root, transformModuleId } = opts
  root = root || (process && process.cwd ? process.cwd() : null)

  const deps = {}

  const files = bundleModules.map((m) => {
    let { id } = m
    id = id.replace(root, '')
    if (transformModuleId) id = transformModuleId(id)

    m.dependencies.forEach((d) => {
      d = d.replace(root, '')
      if (transformModuleId) d = transformModuleId(d)
      deps[d] = deps[d] || []
      deps[d].push(id)
    })

    return { id, file: m.id.replace(root, '').replace(/\?.*/, '').replace('\u0000', '') }
  }).filter((m) => m)

  const modules = []
  files.forEach((f) => {
    const packagePath = findPackageJson(f.file)
    const packageJson = packagePath ? require(packagePath) : {}
    const id = packageJson._id ? packageJson._id : f.id
    const module = modules.filter(m => m.id === id)[0]
    if (module) {
      if (module.files.length > 5) {
        module.truncated = true
        module.files = [path.join(packagePath, '..').replace(root, '')]
      } else if (!module.truncated) {
        module.files.push(f.file)
        module.files = [...new Set(module.files)]
      }
    } else {
      modules.push({ id, packageJson, files: [f.file], truncated: false })
    }
  })

  const templateString = fs.readFileSync(path.join(__dirname, 'template.handlebars'), 'utf8')
  Handlebars.registerHelper('licenseUrl', function (url) {
    if (!url) {
      return ''
    }
    return url.replace(/^git\+/, '')
      .replace(/^git:/, 'https:').replace(/\.git/, '')
      .replace('github', 'raw.githubusercontent') + '/master/LICENSE'
  })
  const template = Handlebars.compile(templateString)

  fs.writeFileSync('./license.xml', template({ modules }))
  return { modules }
}

const packageJsonFileName = 'package.json'
const rootJsonFile = path.resolve(path.parse(process.cwd()).root, packageJsonFileName)

const findPackageJson = (id) => {
  let pathName = path.join(process.cwd(), path.join(path.dirname(id), packageJsonFileName))
  while (!fs.existsSync(pathName) && pathName !== rootJsonFile) {
    pathName = path.join(path.join(pathName, '..', '..'), packageJsonFileName)
  }

  return pathName !== rootJsonFile ? pathName : undefined
}

const run = (bundle, opts) => new Promise((resolve, reject) => {
  try {
    return resolve(license(bundle, opts))
  } catch (ex) { return reject(ex) }
})

const plugin = (opts = {}) => {
  const writeTo = opts.writeTo

  const onAnalysis = (analysis) => {
    if (typeof opts.onAnalysis === 'function') opts.onAnalysis(analysis)
    if (writeTo) writeTo(analysis, opts)
  }

  return {
    name: 'rollup-plugin-license-xml',
    buildStart: function () {
      const ctx = this || {}
      if (!ctx.meta || +(ctx.meta.rollupVersion || 0).charAt(0) < 1) {
        console.error('rollup-plugin-license-xml: Rollup version not supported\n')
      }
    },
    generateBundle: function (_outOpts, bundle) {
      const ctx = this || {}
      if (!ctx.meta || +(ctx.meta.rollupVersion || 0).charAt(0) < 1) return null
      const getDeps = (id) => {
        return ctx.getModuleInfo ? ctx.getModuleInfo(id).importedIds : []
      }

      return new Promise((resolve) => {
        resolve()

        const modules = []
        Object.entries(bundle).forEach(([_outId, { modules: bundleMods }]) => {
          bundleMods = bundleMods || {}
          Object.entries(bundleMods).forEach(([id, moduleInfo]) => {
            const dependencies = getDeps(id)
            modules.push(Object.assign({}, moduleInfo, { id, dependencies }))
          })
        })

        return run({ modules }, opts).then(onAnalysis).catch(console.error)
      })
    }
  }
}

Object.assign(plugin, { plugin, run })

export default plugin
