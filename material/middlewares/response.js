const
  _ = require('lodash'),
  apiError = require('../error/apiError.js'),
  apiErrorNames = require('../error/apiErrorNames.js')

/**
 * format ctx.body to standard response
 * @param {*} ctx Koa context
 */
var responseFormatter = async function (ctx) {
  if (ctx.body && ctx.response.status === 200) {
    if (_.includes(ctx.originalUrl, '/api/') === true) {
      ctx.body = {
        code: 0,
        message: 'success',
        result: ctx.body
      }
    }
  } else if (ctx.response.status === 404) {
    let error = new apiError(apiErrorNames.UNKNOWN_API)
    ctx.response.status = 400
    ctx.body = {
      code: error.code,
      errorName: error.errorName,
      message: error.message
    }
  } else if (ctx.response.status === 204) {
    let error = new apiError(apiErrorNames.NOT_FOUND)
    ctx.body = {
      code: error.code,
      errorName: error.errorName,
      message: error.message
    }
  } else if (ctx.response.status !== 200) {
    let error = new apiError(apiErrorNames.UNKNOWN_ERROR)
    ctx.body = {
      code: error.code,
      errorName: error.errorName,
      message: error.message
    }
  } else {
    ctx.body = {
      code: 0,
      message: 'success'
    }
  }
}

/**
 * check url and catch unhandle error
 * last modified on 2017/10/17
 * @param {RegExp} pattern 
 */
var urlFilter = () => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      
      console.error(error)
      
      ctx.response.status = 400
      ctx.body = {
        code: error.code || -1,
        errorName: error.errorName || 'UnknownError',
        message: error.message || 'unknown error'
      }
      throw error
    }
    if (!ctx.originalUrl.includes('download')) {
      responseFormatter(ctx)
    }
  }
}

module.exports = urlFilter