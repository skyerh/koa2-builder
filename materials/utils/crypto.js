const
  _ = require('lodash'),
  apiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  bcrypt = require('bcrypt'),
  config = require('../config'),
  crypto = require('crypto'),
  encryption = {},
  jwt = require('jsonwebtoken'),
  randomString = require('crypto-random-string'),
  uuid = require('uuid/v4')

encryption.uuid = () => uuid()

/**
 * use bcrypt to hash the text
 * 
 */
encryption.bcrypt = async (text, salt) => await bcrypt.hash(text, salt)

/**
 * compare text and hash then return true or false
 * 
 */
encryption.bcryptCompare = async (text, hash) => await bcrypt.compare(text, hash)

/**
 * return the text which has been hash by sha256 algorithm
 * 
 */
encryption.sha256 = (text, secret) => crypto.createHmac('sha256', secret).update(text).digest('base64')

/**
 * return the text which has been encrypt by AES256
 * @param {String} text the text you want to encode
 */
encryption.aesEncode = (text) => {
  const algorithm = 'aes-256-ctr'

  let cipher = crypto.createCipheriv(algorithm, config.server.secret, new Buffer(config.server.iv))
  let encrypted

  encrypted = cipher.update(text, 'utf-8', 'base64')
  encrypted += cipher.final('base64')
  return encrypted
}

/**
 * return the text which has been decrypt by AES256
 * @param {String} text the text you want to decode
 */
encryption.aesDecode = (text) => {
  const algorithm = 'aes-256-ctr'
  
  let decipher = crypto.createDecipheriv(algorithm, config.server.secret, new Buffer(config.server.iv))
  let decrypted

  decrypted = decipher.update(text, 'base64', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

/**
 * verify the jwt and return the user_id
 * @param {String} token jwt token
 */
encryption.jwtVerify = (token) => {
  try {
    let user_id = jwt.verify(_.replace(token, 'Bearer ', ''), config.server.JWTSecretKey).user_id
    return user_id
  } catch (e) {
    throw new apiError(apiErrorNames.TOKEN_IS_INVALID)
  }
}

/**
 * use object to generate the jwt
 * @param {Object} obj {user_id: 'xxxx'}
 */
encryption.jwtSign = (obj) => jwt.sign(obj, config.server.JWTSecretKey)

/**
 * give digit for random string length
 * @param {Number} digit
 */
encryption.randomString = (digit) => randomString(digit)

module.exports = encryption