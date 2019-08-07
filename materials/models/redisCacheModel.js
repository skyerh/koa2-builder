const
  { promisify } = require('util'),
  config = require('../config'),
  redis = require('./dbModel').redisReturn()

class redisCacheModel {
  constructor() {
    this.delAsync = promisify(redis.del).bind(redis)
    this.expireAsync = promisify(redis.expire).bind(redis)
    this.getAsync = promisify(redis.get).bind(redis)
    this.keyAsync = promisify(redis.keys).bind(redis)
    this.setAsync = promisify(redis.set).bind(redis)
    this.avatarExpired = config.cache.avatar.expired
  }

  /**
   * set the avatar cache
   *
   * @param {{buffer: buffer, user_id: string, size: string}} data size format e.g. 640x480
   * @returns
   * @memberof redisCacheModel
   */
  async cacheAvatarSet(data) {
    const
      value = data.buffer,
      time = this.avatarExpired
    let key = ''
    if (data.size) {
      key = `cache:avatar:${data.user_id}:${data.size}`
    } else {
      key = `cache:avatar:${data.user_id}`
    }
    const avatar = await this.setAsync(Buffer.from(key, 'binary'), value)
    this.expireAsync(key, time)
    return avatar
  }

  /**
   * get the avatar cache
   *
   * @param {{user_id: string, size: string}} data size format e.g. 640x480
   * @returns
   * @memberof redisCacheModel
   */
  async cacheAvatarGet(data) {
    let key = ''
    if (data.size) {
      key = `cache:avatar:${data.user_id}:${data.size}`
    } else {
      key = `cache:avatar:${data.user_id}`
    }
    const avatar = await this.getAsync(Buffer.from(key, 'binary'))
    if (avatar) {
      const time = this.avatarExpired
      this.expireAsync(key, time)
      return Buffer.from(avatar, 'binary')
    }
    return null
  }

  /**
   * drop the avatar cache
   *
   * @param {{user_id: string}} data
   * @returns
   * @memberof redisCacheModel
   */
  async cacheAvatarDrop(data) {
    const
      key = `cache:avatar:${data.user_id}*`

    const keys = await this.keyAsync(key)
    const numberAffected = keys.length
    if (keys.length > 0) {
      await this.delAsync(keys)
    }
    return numberAffected
  }
}

module.exports = redisCacheModel
