const
  log4js = require('log4js'),
  logConfig = require('../config/log.js'),
  logObj = {}

log4js.configure(logConfig)

const
  errorLogger = log4js.getLogger('errorLogger'),
  responseLogger = log4js.getLogger('responseLogger')

/**
 * request log construction
 * @param {Object} req request object
 * @param {Date} resTime response time
 */
const formatReqLog = (req, resTime) => {
  let
    logText = ''

  logText += `request method: ${req.method}\n`
  logText += `request originalUrl: ${req.originalUrl}\n`
  logText += `request client ip: ${req.ip}\n`

  if (req.method === 'GET') {
    logText += `request query: \n${JSON.stringify(req.query)}\n`
  } else {
    logText += `request body: \n${JSON.stringify(req.body)}\n`
  }

  logText += `response time: ${resTime}\n`
  return logText
}


/**
 * response log construction
 * @param {Object} ctx context
 * @param {Date} resTime response time
 */
const formatRes = (ctx, resTime) => {
  let logText = ''

  logText += '\n============ response log start =============\n'
  logText += formatReqLog(ctx.request, resTime)
  logText += `response status: ${ctx.status}\n`
  logText += `response body: \n${JSON.stringify(ctx.body)}\n`
  logText += '============ response log end ============\n'
  return logText
}

/**
 * error log construction
 * @param {Object} ctx context
 * @param {Object} error error object
 * @param {Date} resTime response time
 */
const formatError = (ctx, error, resTime) => {
  let logText = ''

  logText += '\n============ error log start =============\n'
  logText += formatReqLog(ctx.request, resTime)
  logText += `error status: ${ctx.status}\n`
  logText += `error name: ${error.name}\n`
  logText += `error message: ${error.message}\n`
  logText += `error stack: ${error.stack}\n`
  logText += '============ error log end ============\n'
  return logText
}


/**
 * log error request and response
 */
logObj.logError = (ctx, error, resTime) => {
  if (ctx && error) {
    errorLogger.error(formatError(ctx, error, resTime))
  }
}

/**
 * log normal request and response
 */
logObj.logResponse = (ctx, resTime) => {
  if (ctx) {
    responseLogger.info(formatRes(ctx, resTime))
  }
}

module.exports = logObj
