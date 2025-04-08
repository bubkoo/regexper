const fs = require('fs').promises
const path = require('path')
const express = require('express')
const chromium = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-core')

async function render(bundle, regexp) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage()
  await page.addScriptTag({ content: bundle })
  // await page.addScriptTag({ url: `https://${process.env.VERCEL_URL}/bundle.js` })
  const svg = await page.evaluate((regexp) => window.generateSVG(regexp), regexp)
  await browser.close();
  return svg
}


async function start() {
  console.log('Starting server...')
  // throw new Error(JSON.stringify({
  //   NODE_ENV: process.env.NODE_ENV,
  //   VERCEL_URL: process.env.VERCEL_URL,
  //   VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
  //   VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  //   VERCEL: process.env.VERCEL,
  //   VERCEL_ENV: process.env.VERCEL_ENV,
  //   VERCEL_REGION: process.env.VERCEL_REGION,
  //   VERCEL_GITHUB_COMMIT_SHA: process.env.VERCEL_GITHUB_COMMIT_SHA,
  //   VERCEL_GITHUB_COMMIT_MESSAGE: process.env.VERCEL_GITHUB_COMMIT_MESSAGE,
  //   VERCEL_GITHUB_COMMIT_AUTHOR_LOGIN: process.env.VERCEL_GITHUB_COMMIT_AUTHOR_LOGIN,
  // }))
  // console.log(process.env.VERCEL_URL)
  // console.log(process.env.VERCEL_BRANCH_URL)
  // console.log(process.env.VERCEL_PROJECT_PRODUCTION_URL)
  const code = await fs.readFile(path.join(__dirname, './dist/bundle.js'), 'utf8')
  const port = process.env.PORT || 3000
  const app = express();

  app.get('/', async (req, res) => {
    const qs = req.query
    console.log(qs)
    const regexp = qs.regexp
    // const theme = qs.theme
    const content = await render(code, regexp)
    res.type('image/svg+xml')
    res.send(content)
  })

  app.get('/bundle.js', (req, res) => {
    res.sendFile(path.join(__dirname, './dist/bundle.js'));
  })

  app.listen(port, () => console.log(`Server running on ${port}`))
}

start()
