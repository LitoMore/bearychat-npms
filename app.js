'use strict'

const Koa = require('koa')
const dateFormat = require('date-format')
const bodyParser = require('koa-bodyparser')

const got = require('got')

const app = new Koa()
app.use(bodyParser())

app.use(async (ctx, next) => {
  const {body} = ctx.request
  if (body.trigger_word !== 'npm') return

  const query = body.text.split(' ').slice(1).join(' ')

  if (query === '-h' || query === '--help') {
    ctx.body = JSON.stringify({text: 'Usage:\nUse `npm <package name>` to search'})
    await next()
    return
  }

  const res = await got(`https://api.npms.io/v2/search?q=${query}`, {json: true}).catch(e => {})

  if (res.body.total) {
    const resultArr = res.body.results.map(item => {
      const pkg = item.package
      return `- [${pkg.name}](${pkg.links.npm}) ${pkg.version} published at ${dateFormat('yyyy-dd-MM', new Date(pkg.date))} by ${(pkg.author && pkg.author.name) || pkg.publisher.username}`
    })

    ctx.body = JSON.stringify({text: resultArr.join('\n')})
  } else {
    ctx.body = JSON.stringify({text: 'No result'})
  }
})

app.listen(3000)
