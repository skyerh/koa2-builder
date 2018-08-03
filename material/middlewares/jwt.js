const
  jwt = require('koa-jwt'),
  config = require('../config')

module.exports = jwt({secret: config.server.JWTSecretKey})