const { generateSVG } = require('@regexper/render')
window.generateSVG = function (regex) {
  return generateSVG(regex).then(svg => svg.outerHTML)
}
