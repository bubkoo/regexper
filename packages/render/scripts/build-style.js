#!/usr/bin/env node

const fs = require('fs')

const content = fs.readFileSync('src/style.css', 'utf8').trim()
const code = `/* eslint-disable */
// Auto generated file, do not modify it!

export const style = \`
${content}
\`.trim()
`

const file = 'src/style.ts'
const old = fs.existsSync(file)
  ? fs.readFileSync(file, { encoding: 'utf8' })
  : null

if (code !== old) {
  fs.writeFile(file, code, (err) => {
    if (err) {
      throw new Error(`An error occurred while generate style file: ${err} `)
    }
  })
}
