const
  ApiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  config = require('../config'),
  crypto = require('../utils/crypto'),
  email = require('../utils/email'),
  rbacHelper = require('../utils/rbacHelper'),
  RedisInviteModel = require('../models/redisInviteModel'),
  redisInviteModel = new RedisInviteModel(),
  RoleModel = require('../models/roleModel'),
  roleModel = new RoleModel(),
  UserModel = require('../models/userModel'),
  userModel = new UserModel(),
  Validate = require('../utils/validate'),
  validate = new Validate()

/**
 *
 * @api {POST} /user/account/create Create an account
 * @apiName accountCreate
 * @apiGroup User
 * @apiVersion  1.0.0
 * @apiPermission none
 *
 * @apiDescription Create a normal user by providing a name, email and password.
 *  <p> After running the api, the server will send the verification mail
 *  to the user and verify the email. </p>
 *
 * @apiParam  {String} name The name of the user
 * @apiParam  {String} email The email is used as the login key. Please use the email which
 *  you can access
 * @apiParam  {String} password The password of the login password.
 * @apiParam  {String} group Group to which the user belongs
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 *
 * @apiError USER_EMAIL_VERIFIED {
  code: -105,
  message: 'user`s email has been registered and verified',
}
 * @apiError USER_CREATE_ERROR {
  code: -112,
  message: 'there is an error on user creation',
}
 * @apiError EMAIL_SEND_FAIL {
  code: -601,
  message: 'fail to send email',
}
 * @apiError GROUP_NOT_FOUND {
  code: -302,
  message: 'cannot find the group',
}
 * @apiError ROLE_NO_DEFAULT {
  code: -405,
  message: 'There is no default role found, default role not set',
}
 *
 *
 * @apiParamExample  Request-Example:
{
  "password": "1231234",
  "email": "crow@mailinator.com",
  "name":"Crow"
}
 *
 *
 * @apiSuccessExample Success-Response （example):
{
    "code": 0,
    "message": "success",
    "result": {
        "mobileVerified": false,
        "emailVerified": false,
        "email": "crow@mailinator.com",
        "name": "Crow",
        "user_id": "efa4cbf7-f890-4b78-a42d-17130ae9cd49",
        "roles": {
            "user": [
                "user"
            ]
        },
        "createdAt": "2019-05-27T09:24:29.796Z",
        "updatedAt": "2019-05-27T09:24:29.796Z"
    }
}
 *
 */
exports.accountCreate = async (ctx) => {
  const jsonSchema = {
    properties: {
      avatar: { type: 'string' },
      user_id: { type: 'string' },
      email: { type: 'string' },
      password: { type: 'string' },
      name: { type: 'string' },
      group: { type: 'string' },
      roleName: { type: 'string' },
      verificationCode: { type: 'string' },
    },
    required: ['name', 'email', 'password', 'group'],
  }

  const data = { ...ctx.request.body }
  data.verificationCode = crypto.randomString(config.email.invitation.codeLength)
  validate.validate(jsonSchema, data)

  const defaultRoleObj = await roleModel.roleDefaultGet(data)
  if (!defaultRoleObj) {
    throw new ApiError(apiErrorNames.GROUP_NOT_FOUND)
  }
  if (!defaultRoleObj.roleName) {
    throw new ApiError(apiErrorNames.ROLE_NO_DEFAULT)
  }
  const user = await userModel.userGetByEmail(data)
  data.password = await crypto.bcrypt(data.password, config.server.saltRounds)

  if (user && user.emailVerified === true) {
    throw new ApiError(apiErrorNames.USER_EMAIL_VERIFIED)
  } else if (user && user.emailVerified === false) {
    data.user_id = user.user_id
    data.roles = { [`${data.group}`]: [`${defaultRoleObj.roleName}`] }
    const ejsData = {
      email: data.email,
      verification: data.verificationCode,
    }
    try {
      await Promise.all([
        redisInviteModel.verifyEmailCreate(data),
        email.verifyEmailSend(ejsData),
      ])
    } catch (err) {
      throw new ApiError(apiErrorNames.EMAIL_SEND_FAIL, err)
    }
    const aUser = JSON.parse(JSON.stringify(user))
    delete aUser.password
    delete aUser._id
    delete aUser.__v
    ctx.body = aUser
  } else {
    data.user_id = crypto.uuid()
    data.roles = { [`${data.group}`]: [`${defaultRoleObj.roleName}`] }
    let aUser
    const ejsData = {
      email: data.email,
      verification: data.verificationCode,
    }
    try {
      aUser = await Promise.all([
        userModel.userCreate(data),
        redisInviteModel.verifyEmailCreate(data),
        email.verifyEmailSend(ejsData),
      ])
    } catch (err) {
      throw new ApiError(apiErrorNames.EMAIL_SEND_FAIL, err)
    }
    aUser[0] = JSON.parse(JSON.stringify(aUser[0]))
    delete aUser[0].password
    delete aUser[0]._id
    delete aUser[0].__v
    ctx.body = aUser[0]
  }
}

/**
 *
 * @api {GET} /user/get?user_id=xxxxx Get user information
 * @apiName userGet
 * @apiGroup User
 * @apiVersion  0.2.0
 * @apiPermission user
 *
 * @apiDescription It will return user information
 *
 * @apiParam  {String} [user_id] User id
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 *
 * @apiError NOT_FOUND {
  code: -4,
  message: 'data is not found',
}
 *
 *
 * @apiParamExample Request-Example:
 {{hostname}}/api/user/get
 *
 *
 * @apiSuccessExample Success-Response:
{
    "code": 0,
    "message": "success",
    "result": {
        "updatedAt": "2017-12-28T08:42:30.620Z",
        "createdAt": "2017-12-28T08:42:30.620Z",
        "email": "giraffe@mailinator.com",
        "name": "Giraffe",
        "user_id": "07c720ad-8ec5-4546-8d7e-3f9946344b3b",
        "groups": [
            "TEST"
        ],
        "roles": [
            "doctor"
        ],
        "emailVerified": true,
        "mobileVerified": false,
        "api": [
            "/api/file/link",
            "/api/file/download",
            "/api/file/mark/set",
            "/api/file/mark/:file_id",
            "/api/examination/:examination_id",
            "/api/examination/create",
            "/api/examination/examinadd",
            "/api/examination/history/set",
            "/api/examination/list",
            "/api/barcode/tag/:group",
            "/api/barcode/list/:group",
            "/api/barcode/create",
            "/api/file/sync",
            "/api/user/get",
            "/api/user/isVerified",
            "/api/user/update"
        ]
    }
}
 *
 *
 */
exports.userGet = async (ctx) => {
  const data = { ...ctx.request.query }
  data.user_id = ctx.state.user.user_id
  data.group = ctx.state.user.group
  if (ctx.request.query.user_id) {
    data.staff_id = ctx.request.query.user_id
  } else {
    data.staff_id = data.user_id
  }

  const user = await userModel.userGetByStaffId(data)
  if (!user) {
    throw new ApiError(apiErrorNames.NOT_FOUND)
  }
  user.api = rbacHelper.operationGet(user.roles[data.group][0])
  ctx.body = user
}