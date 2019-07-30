const
  Queue = require('bee-queue'),
  UserModel = require('../models/userModel'),
  userModel = new UserModel(),
  ApiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  dispatcher = {},
  avatarUploadQueue = new Queue('avatarUpload')

const avatarUpload = async (data) => {
  return new Promise((resolve) => {
    avatarUploadQueue.createJob(data.file).save().then((job) => {
      job.on('succeeded', async () => {
        await userModel.userAvatarUpdate(data)
        console.log(`avatarUpload: worker is done : ${data.file.file_id}`)
        resolve()
      })
    })
  })
}

/**
 * create the queue
 * @param {string} type 's3UploadQueue'...
 * @param {*} data {}
 */
dispatcher.create = async (type, data) => {
  switch (type) {
  case 'avatarUploadQueue':
    try {
      await avatarUpload(data)
    } catch (err) {
      throw new ApiError(apiErrorNames.FILE_UPLOAD_FAIL, err)
    }
    break
  default:
    throw new ApiError(apiErrorNames.NO_DISPATCHER_MATCHED)
  }
}

module.exports = dispatcher
