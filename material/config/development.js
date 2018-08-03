/**
 * development environment config setting
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
    env: 'development',
    fileUploadDestination: "uploads/",
    iv: 'cjd92fgtd7s66sky',
    JWTSecretKey : 'dev testing',
    port: '3088',
    protocol: 'http',
    saltRounds: 11,
    secret: 'ItIsTheSecret'
  }
}