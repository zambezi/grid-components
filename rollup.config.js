import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'
import postcss from 'rollup-plugin-postcss'

export default {
  entry: 'src/index.js'
, dest: 'dist/grid-components.js'
, format: 'umd'
, moduleName: 'gridComponents'
, external: [
    '@zambezi/d3-utils'
  , '@zambezi/fun'
  , '@zambezi/grid'
  , 'd3-dispatch'
  , 'd3-selection'
  , 'underscore'
  ]
, sourceMap: true
, plugins: [
    postcss(
      {
        plugins: [ ]
      , extensions: ['.css', '.sss']
      }
    )
  , babel(babelrc())
  ]
, globals: {
    '@zambezi/d3-utils': 'd3Utils'
  , '@zambezi/fun': 'fun'
  , '@zambezi/grid': 'grid'
  , 'd3-dispatch': 'd3'
  , 'd3-selection': 'd3'
  , 'underscore': '_'
  }
}
