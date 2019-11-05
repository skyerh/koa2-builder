const
  { promisify } = require('util'),
  config = require('../config'),
  redis = require('./dbModel').redisReturn()

class redisTokenModel {
  constructor() {
    this.delAsync = promisify(redis.del).bind(redis)
    this.expireAsync = promisify(redis.expire).bind(redis)
    this.saddAsync = promisify(redis.sadd).bind(redis)
    this.smembersAsync = promisify(redis.smembers).bind(redis)
    this.expired = config.cache.token.expired
  }

  /**
   * add the bearer token to the key
   *
   * @param {*} data {
   *  user_id: String,
   *  jwt: 'Bearer token...',
   * }
   * @returns
   * @memberof redisTokenModel
   */
  async tokenCacheCreate(data) {
    const
      key = `userId:${data.user_id}`,
      value = data.jwt,
      time = this.expired

    await this.saddAsync(key, value)
    return this.expireAsync(key, time)
  }

  /**
   * list all the bearer token of the key
   *
   * @param {*} data {
   *  user_id: String,
   * }
   * @returns
   * @memberof redisTokenModel
   */
  async tokenCacheList(data) {
    const
      key = `userId:${data.user_id}`

    const members = await this.smembersAsync(key)
    return members
  }

  /**
   * add ttl to the token
   *
   * @param {*} data
   * @returns
   * @memberof redisTokenModel
   */
  async tokenAliveSet(data) {
    const
      key = `userId:${data.user_id}`,
      time = config.cache.token.expired

    const expired = await this.expireAsync(key, time)
    return expired
  }

  /**
   * delete the token in the cache
   *
   * @param {*} data {user_id: string}
   * @returns
   * @memberof redisTokenModel
   */
  async tokenCacheDelete(data) {
    const
      key = `userId:${data.user_id}`

    const del = await this.delAsync(key)
    return del
  }
}

module.exports = redisTokenModel
