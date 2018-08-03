const
  apiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  config = require('../config'),
  db = {},
  mongoose = require('mongoose'),
  redis = require('redis')

db.mongoConnect = () => {
  mongoose.Promise = global.Promise
  mongoose.connect(config.mongo.mongodb_url, {useNewUrlParser: true})
    .then(() => {
      console.log('mongoDB is connected...')
    })
    .catch((err) => {
      throw err
    })
}

db.mongoReturn = () => {
  return mongoose
}

db.redisReturn = () => {
  const
    redisPort = config.redis.redisPort,
    redisUrl = config.redis.redisUrl,
    redisDB = redis.createClient(redisPort, redisUrl, {db: 1}, {
      detect_buffers: true,
      auth_pass: null
    })

  redisDB.on('error', (err) => {
    throw new apiError(apiErrorNames.REDIS_ERROR, err)
  })

  return redisDB
}

module.exports = db
