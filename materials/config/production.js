/**
 * production environment config setting
 */
module.exports = {
  cache: {
    token: {
      expired: 60 * 60 * 24 * 30,
    },
    avatar: {
      expired: 60 * 60 * 24 * 30,
    },
  },
  email: {
    service: 'exchange',
    host: 'mail.imediplus.com',
    port: 587,
    secure: false,
    auth: {
      user: 'cloud',
      pass: '281135955',
    },
    invitation: {
      expired: 60 * 60 * 24 * 7,
      codeLength: 6,
    },
    resetPwd: {
      expired: 60 * 60 * 1,
      codeLength: 21,
    },
    tempPwd: {
      expired: 60 * 10,
      codeLength: 8,
    },
  },
  mongo: {
    mongodb_url: 'mongodb://localhost:27017/example',
  },
  redis: {
    redisPort: 6379,
    redisUrl: 'localhost',
  },
  s3: {
    accessKeyId: 'your-s3-accessKeyId',
    ACL: 'private',
    Bucket: 'your-s3-bucket',
    CacheControl: 'max-age=31536000, public',
    ContentType: 'application/octet-stream',
    ContentDisposition: 'attachment',
    secretAccessKey: 'your-s3-secretAccessKey',
  },
  server: {
    env: 'production',
    fileUploadDestination: 'uploads/',
    iv: 'cjd92hjfd7s66sky',
    JWTSecretKey: 'tl2QO8RKES1P5cWbOwbp8hMWB50HfphX',
    port: '6188',
    protocol: 'https',
    saltRounds: 11,
    secret: 'jewelkegsuwhd823jd8dcnal1hn66sky',
  },
  worker: {
    arena: {
      queues: [{
        name: 'avatarUpload',
        hostId: 'My Worker',
        type: 'bee',
      }],
      address: {
        port: '3299',
        host: '127.0.0.1',
        basePath: '/arena',
        disableListen: false,
      },
    },
  },
}
