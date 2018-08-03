const
  config = require('../config'),
  redis = require('./dbModel').redisReturn()

class RedisInviteModel {
  constructor () {
    this.expire = config.invitation.expired
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
  async invitationCreate (data) {
    const
      key = `invitation:${data.invitationCode}`,
      _this = this,
      value = JSON.stringify({
        email: data.email,
        countryCode: data.countryCode,
        mobile: data.mobile,
        groups: data.groups,
        roles: data.roles,
        invitedBy: data.user_id,
        createdAt: new Date()
      })
    return new Promise((resolve, reject) => {
      _this.client.set(key, value, (err) => {
        if (err) {
          reject(err)
        } else {
          _this.client.expire(key, _this.expire)
          resolve()
        }
      })
    })
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
  async invitetionGet (data) {
    const
      key = `invitation:${data.invitationCode}`,
      _this = this
    
    return new Promise((resolve, reject) => {
      _this.client.get(key, (err, value) => {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(value))
        }
      })
    })
  }
}

module.exports = RedisInviteModel