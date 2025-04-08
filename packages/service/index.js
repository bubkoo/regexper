const express = require('express')
const chromium = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-core')

async function render(regexp) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage()
  await page.addScriptTag({ path: './dist/bundle.js' })
  const svg = await page.evaluate((regexp) => window.generateSVG(regexp), regexp)
  await browser.close();
  return svg
}


async function start() {
  const port = process.env.PORT || 3000
  const app = express();

  app.get('/', async (req, res) => {
    const qs = req.query
    console.log(qs)
    const regexp = qs.regexp
    // const theme = qs.theme
    const content = await render(regexp)
    res.type('image/svg+xml')
    res.send(content)
  })

  app.use(express.static('public'))
  app.listen(port, () => console.log(`Server running on ${port}`))
}

start()
