const
  ApiError = require('../error/apiError.js'),
  apiErrorNames = require('../error/apiErrorNames.js')

/**
 * format ctx.body to standard response
 * @param {*} ctx Koa context
 */
const responseFormatter = async (ctx) => {
  if (ctx.body && ctx.response.status === 200) {
    if (ctx.originalUrl.includes('/api/') === true) {
      ctx.body = {
        code: 0,
        message: 'success',
        result: ctx.body,
      }
    }
  } else if (ctx.response.status === 404) {
    const error = new ApiError(apiErrorNames.UNKNOWN_API)
    ctx.response.status = 400
    ctx.body = {
      code: error.code,
      errorName: error.errorName,
      message: error.message,
    }
  } else if (ctx.response.status === 204) {
    const error = new ApiError(apiErrorNames.NOT_FOUND)
    ctx.body = {
      code: error.code,
      errorName: error.errorName,
      message: error.message,
    }
  } else if (ctx.response.status !== 200) {
    const error = new ApiError(apiErrorNames.UNKNOWN_ERROR)
    ctx.body = {
      code: error.code,
      errorName: error.errorName,
      message: error.message,
    }
  } else {
    ctx.body = {
      code: 0,
      message: 'success',
    }
  }
}

/**
 * check url and catch unhandle error
 * @param {RegExp} pattern
 */
const urlFilter = () => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      console.error(error)
      ctx.response.status = 400
      ctx.body = {
        code: error.code || -1,
        errorName: error.errorName || 'UnknownError',
        message: error.message || 'unknown error',
      }
      throw error
    }
    // if the routing path includes the "download" string,
    // skip the response formatter (so can response the binarary etc.)
    if (ctx.originalUrl.includes('download') === false) {
      responseFormatter(ctx)
    }
  }
}

module.exports = urlFilter
