const
  { promisify } = require('util'),
  fileType = require('file-type'),
  fs = require('fs-extra'),
  needle = require('needle'),
  sharp = require('sharp'),
  ApiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  AWSModel = require('../models/awsModel'),
  awsModel = new AWSModel(),
  RedisCacheModel = require('../models/redisCacheModel'),
  redisCacheModel = new RedisCacheModel(),
  dispatcher = require('../jobs/dispatcher'),
  validate = require('../utils/validate')

/**
 *
 * @api {POST} /thumbnail/avatar/upload Upload the avatar
 * @apiName avatarUpload
 * @apiGroup Thumbnail
 * @apiVersion  1.0.0
 * @apiPermission all
 *
 * @apiDescription Upload an image as the user's avatar
 *
 * @apiParam  {File} file Use multipart/form-data to upload the files through the field "file".
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 *
 * @apiError MISSING_UPLOAD_FILE {
  code: -204,
  message: 'the uploaded file is missing, you need to specify the file to upload',
}
 *
 * @apiParamExample  {type} Request-Example:
 * multipart/form-data : { file : image.jpg }
 *
 * @apiSuccessExample {type} Success-Response:
{
  "code": 0,
  "message": "success",
  "result": {
    "avatar": "http://localhost:3088/api/thumbnail/avatar/download?file_id=b13fc698-7cb4-48de-b29f-5bf5575bae7f_a"
  }
}
 *
 *
 */
exports.avatarUpload = async (ctx) => {
  const jsonSchema = {
    properties: {
      user_id: { type: 'string' },
    },
  }

  const data = { ...ctx.request.body }
  data.user_id = ctx.state.user.user_id

  validate.validate(jsonSchema, data)

  if (!ctx.req.file) {
    throw new ApiError(apiErrorNames.MISSING_UPLOAD_FILE)
  } else {
    data.file = ctx.req.file
    const readFile = promisify(fs.readFile)
    data.buffer = await readFile(data.file.path)
    const mimeType = fileType(data.buffer)
    if (mimeType) {
      data.file.mime = mimeType.mime
    } else {
      throw new ApiError(apiErrorNames.NOT_AN_IMAGE)
    }

    if (data.file.mime.slice(0, 5) !== 'image') {
      throw new ApiError(apiErrorNames.NOT_AN_IMAGE)
    }

    data.file.ContentDisposition = 'inline'
    data.file.file_id = `${data.user_id}_a` // eg. fileName_a
    data.avatarUrl = `${ctx.protocol}://${ctx.headers.host}/api/thumbnail/avatar/download?file_id=${data.file.file_id}`
  }
  await dispatcher.create('avatarUploadQueue', data)
  redisCacheModel.cacheAvatarDrop(data)
  ctx.body = { avatar: data.avatarUrl }
}

/**
 *
 * @api {GET} /thumbnail/avatar/download Get the avatar
 * @apiName avatarDownload
 * @apiGroup Thumbnail
 * @apiVersion  1.0.0
 * @apiPermission none
 *
 * @apiDescription Download the user's avatar at the given size. <p>
 * If no size is provided, the server will give the original avatar.
 *
 * @apiParam  {String} user_id User ID
 * @apiParam  {string} [size] The format is {number}x{number}, e.g. 300x200
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 * @apiError AVATAR_NOT_FOUND { code: -1501, message: 'cannot find the user`s avatar' }
 *
 * @apiParamExample  {type} Request-Example:
{{hostname}}/api/thumbnail/avatar/download
  ?file_id=b13fc698-7cb4-48de-b29f-5bf5575bae7f_a.jpg&size=400x400
 *
 *
 * @apiSuccessExample {type} Success-Response:
 * *ponse the image buffer
 * *
 * *
 */
exports.avatarDownload = async (ctx) => {
  const jsonSchema = {
    properties: {
      file_id: { type: 'string' },
      size: {
        type: 'string',
        pattern: '^\\d{1,3}x\\d{1,3}$',
      },
    },
    required: ['file_id'],
  }
  const data = { ...ctx.request.query }
  validate.validate(jsonSchema, data)

  const avatarPath = `tmp/${data.file_id}`
  data.user_id = data.file_id.split('.')[0].slice(0, 36)
  data.buffer = await redisCacheModel.cacheAvatarGet(data)

  if (!data.buffer) { // no cache
    data.key = `avatar/${data.file_id}`

    try {
      const awsFile = await Promise.all([
        awsModel.s3FileDownload(data),
        awsModel.s3HeadInfoGet(data),
      ])
      data.filePath = awsFile[0]
    } catch (err) {
      throw new ApiError(apiErrorNames.AVATAR_NOT_FOUND)
    }

    await needle('get', data.filePath, { output: avatarPath })

    if (data.size) {
      data.width = Number.parseInt(data.size.split('x')[0], 10)
      data.height = Number.parseInt(data.size.split('x')[1], 10)
      data.buffer = await sharp(avatarPath)
        .resize({
          width: data.width,
          height: data.height,
          fit: sharp.fit.cover,
        })
        .toBuffer()
    } else {
      const readFile = promisify(fs.readFile)
      data.buffer = await readFile(avatarPath)
    }
    await redisCacheModel.cacheAvatarSet(data)
    const mimeType = fileType(data.buffer) // {ext: 'png', mime: 'image/png'}
    ctx.set('Content-Type', mimeType.mime)
    ctx.body = data.buffer
  } else { // has cache
    const mimeType = fileType(data.buffer)
    ctx.set('Content-Type', mimeType.mime) // {ext: 'png', mime: 'image/png'}
    ctx.body = data.buffer
  }
}

/**
 *
 * @api {POST} /thumbnail/avatar/flush Flush all caches
 * @apiName avatarFlush
 * @apiGroup Thumbnail
 * @apiVersion  1.0.0
 * @apiPermission all
 *
 * @apiDescription Flush all user avatar caches,
 *  cache will be regenertated when you download the avatar
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 *
  * @apiParamExample  {type} Request-Example:
 * {}
 *
 * @apiSuccessExample {type} Success-Response:
{
  "code": 0,
  "message": "success",
  "result": {}
}
 *
 *
 */
exports.avatarFlush = async (ctx) => {
  const jsonSchema = {
    properties: {
      user_id: { type: 'string' },
    },
  }
  const data = {}
  data.user_id = ctx.state.user.user_id
  validate.validate(jsonSchema, data)

  await redisCacheModel.cacheAvatarDrop(data)
  ctx.body = {}
}
