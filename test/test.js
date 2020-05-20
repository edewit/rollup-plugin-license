'use strict'

const test = require('mvt')
const { run, plugin } = require('./../index')
const { resolve: resolvePath, join } = require('path')
const { rollup: rollupLatest } = require('rollup')
const { rollup: rollup60 } = require('rollup60')
const { rollup: rollup100 } = require('rollup100')

const fixtures = resolvePath(__dirname, '_fixtures')
// const importA = 'the-declaration-of-independence'

const baseOpts = {
  input: join(fixtures, 'bundle-a.js'),
  output: { format: 'cjs' }
}

// test against many versions of rollup
const rollers = [
  { rollup: rollupLatest, version: 'latest', opts: baseOpts },
  { rollup: rollup100, version: '1.0.x', opts: baseOpts }
]

test('require signature works destructured, direct, and as .default', (assert) => {
  const { plugin: destructured } = require('./../index')
  const direct = require('./../index')
  assert.true(typeof destructured === 'function')
  assert.true(typeof direct === 'function')
  assert.true(typeof direct.default === 'function')
})

// main
rollers.forEach(({ rollup, version, opts }) => {
  test(`${version}: modules returns array`, async (assert) => {
    const bundle = await rollup(opts)
    const results = await run(bundle)
    assert.truthy(Array.isArray(results.modules))
  })

  test(`${version}: license object has expected properties`, async (assert) => {
    const bundle = await rollup(opts)
    const result = await run(bundle)
    assert.truthy('modules' in result)
    const firstModule = result.modules[0]
    assert.truthy('id' in firstModule)
    assert.truthy('packageJson' in firstModule)
    assert.truthy('files' in firstModule)
  })

  // test(`${version}: root works as expected`, async (assert) => {
  //   const bundle = await rollup(opts)
  //   assert.not(
  //     join(__dirname, (await run(bundle, { root: 'fakepath' })).modules[0].files[0]),
  //     resolvePath(fixtures, `${importA}.js`)
  //   )
  //   assert.is(
  //     join(__dirname, (await run(bundle, { root: __dirname })).modules[0].files[0]),
  //     resolvePath(fixtures, `${importA}.js`)
  //   )
  // })

  test(`${version}: it works with generated bundle as well`, async (assert) => {
    const bundle = await rollup(opts)
    await bundle.generate({ format: 'cjs' })
    const results = await run(bundle)
    assert.is(typeof results, 'object')
  })

})

test('rollup < 1.0.0 prints warning about support', async (assert) => {
  let results = ''
  const oldCslErr = console.error
  console.error = (...args) => {
    results += args.join()
  }
  const rollOpts = Object.assign({ plugins: [plugin()] }, baseOpts)
  const bundle = await rollup60(rollOpts)
  await bundle.generate({ format: 'cjs' })
  const expect = 'rollup-plugin-license-xml: Rollup version not supported'
  assert.is(results.split('\n')[0], expect)
  console.error = oldCslErr
})
