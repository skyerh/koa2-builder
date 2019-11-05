const
  { promisify } = require('util'),
  config = require('../config/index'),
  redis = require('./dbModel').redisReturn()

class RedisInviteModel {
  constructor() {
    this.delAsync = promisify(redis.del).bind(redis)
    this.getAsync = promisify(redis.get).bind(redis)
    this.setAsync = promisify(redis.set).bind(redis)
    this.expireAsync = promisify(redis.expire).bind(redis)
    this.keysAsync = promisify(redis.keys).bind(redis)
    this.expire = config.email.invitation.expired
    this.client = redis
  }

  /**
   * create an invitation record with invitation code
   *
   * @param {Object} data {
   *  inviatetionCode: String
   *  email: String,  // optional
   *  mobile: String, // optional
   * }
   * @returns
   * @memberof RedisInviteModel
   */
  async invitationCreate(data) {
    const
      key = `invitation:${data.invitationCode}`,
      value = JSON.stringify({
        email: data.email,
        countryCode: data.countryCode,
        mobile: data.mobile,
        groups: data.groups,
        roles: data.roles,
        invitedBy: data.user_id,
        createdAt: new Date(),
      })
    const fin = await this.setAsync(key, value)
    await this.expireAsync(key, this.expire)
    return fin
  }

  /**
   * set the verification code for email verification
   *
   * @param {*} data
   * @returns
   * @memberof RedisInviteModel
   */
  async verifyEmailCreate(data) {
    const
      key = `verifyEmail:${data.email}:${data.verificationCode}`,
      value = JSON.stringify({
        user_id: data.user_id,
        email: data.email,
        name: data.name,
        group: data.group,
        roles: data.roles,
        createdAt: new Date(),
      })

    const verification = await this.setAsync(key, value)
    await this.expireAsync(key, this.expire)
    return verification
  }

  /**
   * get the verification in order to verify the email
   *
   * @param {*} data
   * @returns
   * @memberof RedisInviteModel
   */
  async verifyEmailGet(data) {
    const
      key = `verifyEmail:${data.email}:${data.verificationCode}`
    const verification = await this.getAsync(key)
    return verification
  }

  /**
   * get the keys list of the email
   *
   * @param {*} data {email: string}
   * @returns
   * @memberof RedisInviteModel
   */
  async verifyEmailList(data) {
    const
      keys = `verifyEmail:${data.email}:*`,
      keysList = await this.keysAsync(keys)

    return keysList
  }

  /**
   * delete all the keys of the verifyEmail
   *
   * @param {*} data {email: string}
   * @returns
   * @memberof RedisInviteModel
   */
  async verifyEmailBulkDel(data) {
    const
      keys = `verifyEmail:${data.email}:*`,
      keysList = await this.keysAsync(keys),
      del = await this.delAsync(keysList)

    return del
  }

  /**
   * get the invitation record with invitation code
   *
   * @param {any} data {
   *  invitationCode: String
   * }
   * @returns
   * @memberof RedisInviteModel
   */
  async invitationGet(data) {
    const
      key = `invitation:${data.invitationCode}`

    const value = await this.getAsync(key)
    return JSON.parse(value)
  }

  /**
   * create the reset code for the user to reset the password
   *
   * @param {*} data {resetCode: string, user_id: string}
   * @returns
   * @memberof RedisInviteModel
   */
  async resetCodeSet(data) {
    const
      key = `resetCode:${data.resetCode}`,
      value = JSON.stringify({
        email: data.email,
        user_id: data.user_id,
        createdAt: new Date(),
      }),
      { expired } = config.email.resetPwd

    const resetCode = await this.setAsync(key, value)
    await this.expireAsync(key, expired)
    return resetCode
  }

  /**
   * get the reset code information, mainly for checking if email and resetCode are correct
   *
   * @param {*} data {resetCode: string}
   * @returns
   * @memberof RedisInviteModel
   */
  async resetCodeGet(data) {
    const
      key = `resetCode:${data.resetCode}`

    const value = await this.getAsync(key)
    return JSON.parse(value)
  }

  /**
   * drop the resetCode, it is usually used after the resetCode used up
   *
   * @param {*} data {resetCode: string}
   * @returns
   * @memberof RedisInviteModel
   */
  async resetCodeDel(data) {
    const
      key = `resetCode:${data.resetCode}`

    const del = await this.delAsync(key)
    return del
  }

  /**
   * create a temparary password for the email account, only 10 minutes lift
   *
   * @param {*} data
   * @returns
   * @memberof RedisInviteModel
   */
  async passwordTempSet(data) {
    const
      key = `passwordTemp:${data.email}`,
      value = JSON.stringify({
        email: data.email,
        passwordTemp: data.passwordTemp,
        createdAt: new Date(),
      }),
      { expired } = config.email.tempPwd

    const passwordTemp = await this.setAsync(key, value)
    await this.expireAsync(key, expired)
    return passwordTemp
  }

  /**
   * retrieve the temparary password of the email
   *
   * @param {*} data
   * @returns
   * @memberof RedisInviteModel
   */
  async passwordTempGet(data) {
    const
      key = `passwordTemp:${data.email}`

    const passwordTemp = await this.getAsync(key)
    return JSON.parse(passwordTemp)
  }

  /**
   * delete the temparary password of the email
   *
   * @param {*} data
   * @returns
   * @memberof RedisInviteModel
   */
  async passwordTempDel(data) {
    const
      key = `passwordTemp:${data.email}`

    const del = await this.delAsync(key)
    return del
  }
}

module.exports = RedisInviteModel
