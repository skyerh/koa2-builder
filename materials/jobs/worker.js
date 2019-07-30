const
  AWS = require('aws-sdk'),
  fs = require('fs-extra'),
  s3Stream = require('s3-upload-stream'),
  Queue = require('bee-queue'),
  config = require('../config/index'),
  avatarUploadQueue = new Queue('avatarUpload'),
  worker = {}

/**
 * process job to upload the avatar to the s3
 *
 * @param {{
 *  file.file_id: 'string',
 *  file.mimetype: 'string',
 *  file.ContentDisposition: 'string',
 *  file.path: 'string',
 *  }} job
 * @returns
 */
const avatarUploadProcess = (job) => {
  const stream = s3Stream.client(new AWS.S3({
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  }))
  AWS.config.setPromisesDependency()

  const upload = stream.upload({
    Bucket: config.s3.Bucket,
    ACL: config.s3.ACL,
    Key: `avatar/${job.data.file_id}`,
    ContentType: job.data.mime,
    CacheControl: config.s3.CacheControl,
    ContentDisposition: job.data.ContentDisposition,
  })

  const read = fs.createReadStream(job.data.path)
  read.pipe(upload)

  return new Promise((resolve, reject) => {
    upload.on('error', (err) => {
      reject(err)
    })
    upload.on('uploaded', () => {
      resolve(job.data)
    })
  })
}

worker.create = () => {
  avatarUploadQueue.process(2, async (job) => {
    const fin = await avatarUploadProcess(job)
    return fin
  })
}

module.exports = worker
