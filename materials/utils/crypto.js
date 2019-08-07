const
  bcrypt = require('bcryptjs'),
  crypto = require('crypto'),
  jwt = require('jsonwebtoken'),
  randomString = require('crypto-random-string'),
  uuid = require('uuid/v4'),
  ApiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  config = require('../config/index'),
  encryption = {}

encryption.uuid = () => {
  return uuid()
}

/**
 * use bcrypt to hash the text
 *
 */
encryption.bcrypt = async (text, salt) => {
  const hash = await bcrypt.hash(text, salt)
  return hash
}

/**
 * compare text and hash then return true or false
 *
 */
encryption.bcryptCompare = (text, hash) => {
  return bcrypt.compare(text, hash)
}

/**
 * return the text which has been hash by sha256 algorithm
 *
 */
encryption.sha256 = (text, secret) => {
  return crypto.createHmac('sha256', secret).update(text).digest('base64')
}

/**
 * return the text which has been encrypt by AES256
 * @param {String} text the text you want to encode
 */
encryption.aesEncode = (text) => {
  const algorithm = 'aes-256-ctr'

  const cipher = crypto.createCipheriv(algorithm, config.server.secret,
    Buffer.from(config.server.iv))
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

  const decipher = crypto.createDecipheriv(algorithm, config.server.secret,
    Buffer.from(config.server.iv))
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
    const jwtResult = jwt.verify(token.replace('Bearer ', ''), config.server.JWTSecretKey)
    return jwtResult.user_id
  } catch (e) {
    throw new ApiError(apiErrorNames.TOKEN_IS_INVALID)
  }
}

/**
 * use object to generate the jwt
 * @param {Object} obj {user_id: 'xxxx'}
 */
encryption.jwtSign = (obj) => {
  const token = jwt.sign(obj, config.server.JWTSecretKey)
  return token
}

/**
 * give digit for random string length
 * @param {Number} digit
 */
encryption.randomString = (digit) => {
  return randomString(digit)
}

module.exports = encryption
