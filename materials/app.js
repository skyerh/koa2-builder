const
  bodyparser = require('koa-bodyparser'),
  cors = require('koa2-cors'),
  helmet = require('koa-helmet'),
  json = require('koa-json'),
  Koa = require('koa'),
  morgan = require('koa-morgan'),
  moment = require('moment'),
  onerror = require('koa-onerror'),
  path = require('path'),
  views = require('koa-views')  

/**
 * customized defined 
 */
const
  index = require('./routes/index'),
  logUtil = require('./utils/log_util'),
  responseFormatter = require('./middlewares/response')

/** 
 * MongoDB connected
 */
require('./models/dbModel').mongoConnect()

/**
 * create Koa web application 
 */
const app = new Koa()

/**
 * error handler
 */
onerror(app)

/**
 * middlewares
 */
app.use(cors())
app.use(helmet())
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(morgan(':req[user_id] on [:date[iso]] :method :url :status :response-time ms = :res[content-length]'))
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(path.join(__dirname, '/views'), {
  extension: 'ejs',
}))

/**
 * logger
 */
app.use(async (ctx, next) => {
  const start = moment()
  let ms
  try {
    await next()
    ms = moment() - start
    logUtil.logResponse(ctx, ms)
  } catch (error) {
    ms = moment() - start
    logUtil.logError(ctx, error, ms)
  }
})

/**
 * format response output
 */
app.use(responseFormatter())

/**
 * put jwt protected ctx.state.user.user_id to header for morgan
 */
app.use(async (ctx, next) => {
  await next()
  if (ctx.state.user && ctx.state.user.user_id) {
    ctx.header.user_id = ctx.state.user.user_id
  }
})

/**
 * routes
 */
app.use(index.routes(), index.allowedMethods())

/**
 * error-handling
 */
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
})

module.exports = app
