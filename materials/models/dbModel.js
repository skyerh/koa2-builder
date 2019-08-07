const
  mongoose = require('mongoose'),
  redis = require('redis'),
  ApiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  config = require('../config/index'),
  db = {}

/**
 * set the mongoose configuration and start the connection between db and mongoose
 *
 */
db.mongoConnect = () => {
  mongoose.Promise = global.Promise
  mongoose.connect(config.mongo.mongodb_url, { useNewUrlParser: true })
    .then(() => {
      console.log('mongoDB is connected...')
    })
    .catch((err) => {
      console.log(err)
      throw err
    })
  mongoose.set('useCreateIndex', true)
  mongoose.set('useFindAndModify', false)
}

/**
 * return the completed mongoose object
 *
 */
db.mongoReturn = () => {
  return mongoose
}

db.redisReturn = () => {
  const
    { redisPort } = config.redis,
    { redisUrl } = config.redis,
    redisDB = redis.createClient(redisPort, redisUrl, {
      detect_buffers: true,
      auth_pass: null,
    })

  redisDB.on('error', (err) => {
    throw new ApiError(apiErrorNames.REDIS_ERROR, err)
  })

  return redisDB
}

module.exports = db
