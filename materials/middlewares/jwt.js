const
  jsonWebToken = require('jsonwebtoken'),
  ApiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  config = require('../config/index.js'),
  jwt = {},
  RedisTokenModel = require('../models/redisTokenModel'),
  redisTokenModel = new RedisTokenModel()

jwt.verify = async (ctx, next) => {
  if (!ctx.header.authorization) {
    throw new ApiError(apiErrorNames.USER_AUTH_NEEDED)
  }
  const token = ctx.header.authorization.replace('Bearer ', '')
  try {
    ctx.state.user = jsonWebToken.verify(token, config.server.JWTSecretKey)
  } catch (e) {
    throw new ApiError(apiErrorNames.TOKEN_IS_INVALID, e)
  }

  if (ctx.state.user && ctx.state.user.user_id) {
    ctx.header.user_id = ctx.state.user.user_id
    const data = { user_id: ctx.state.user.user_id }
    const tokenList = await redisTokenModel.tokenCacheList(data)
    const jwtInclude = tokenList.includes(ctx.header.authorization)
    if (jwtInclude === false) {
      throw new ApiError(apiErrorNames.USER_AUTH_RENEW)
    } else {
      await redisTokenModel.tokenAliveSet(data)
    }
  }
  await next()
}

module.exports = jwt.verify
