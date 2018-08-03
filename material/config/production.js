/**
 * production environment config setting
 */
module.exports = {
  email: {
    service: 'exchange',
    host: 'host.email.com',
    port: 587,
    secure: false,
    auth: {
      user: 'skyer',
      pass: '123123'
    }
  },
  invitation: {
    expired: 60 * 60 * 24 * 7,
    codeLength: 21
  },
  mongo: {
    mongodb_url: "mongodb://localhost:27017/example"
  },
  redis: {
    redisPort: 6379,
    redisUrl: 'localhost'
  },
  server: {
    env: 'production',
    fileUploadDestination: 'uploads/',
    iv: 'cjd92hjfd7s66sky',
    JWTSecretKey : 'tl2QO8RKES1P5cWbOwbp8hMWB50HfphX',
    port: '6688',
    protocol: 'https',
    saltRounds: 11,
    secret: 'jewelkegsuwhd823jd8dcnal1hn66sky'
  }
}