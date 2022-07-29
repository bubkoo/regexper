import config from '@bubkoo/rollup-config'

export default config({
  output: [
    {
      name: 'regexper',
      format: 'umd',
      file: 'dist/regexper.js',
      sourcemap: true,
    },
  ],
  onwarn(warning, warn) {
    if (warning.code === 'CIRCULAR_DEPENDENCY') {
      const ignore = warning.cycle.every(
        (path) => path.indexOf('node_modules/@svgdotjs/svg.js') > 0,
      )
      if (ignore) {
        return
      }
    }

    warn(warning)
  },
})
