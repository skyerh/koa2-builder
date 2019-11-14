const
  ApiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  config = require('../config/index'),
  crypto = require('../utils/crypto'),
  email = require('../utils/email'),
  rbacHelper = require('../utils/rbacHelper'),
  RedisInviteModel = require('../models/redisInviteModel'),
  redisInviteModel = new RedisInviteModel(),
  RedisTokenModel = require('../models/redisTokenModel'),
  redisTokenModel = new RedisTokenModel(),
  RoleModel = require('../models/roleModel'),
  roleModel = new RoleModel(),
  UserModel = require('../models/userModel'),
  userModel = new UserModel(),
  validate = require('../utils/validate')

/**
 * Grant the default role to the user
 *
 * @param {*} data {group: string}
 * @param {*} user {roles: object}
 * @returns user object
 */
const defaultRoleGrant = async (data, user) => {
  let aUser
  if (data.group
      && (!user.roles || !user.roles[data.group] || user.roles[data.group].length === 0)) {
    const group = await roleModel.groupGet(data)
    if (!group) {
      throw new ApiError(apiErrorNames.GROUP_NOT_FOUND)
    } else {
      const defaultRole = await roleModel.roleDefaultGet(data)
      if (!defaultRole) {
        throw new ApiError(apiErrorNames.ROLE_NO_DEFAULT)
      } else {
        data.staff_id = data.user_id
        data.roleName = defaultRole.roleName
        aUser = await userModel.userRoleAdd(data)
      }
    }
  } else {
    aUser = null
  }
  return aUser
}

/**
 * check user password or tempPassword and return value of passwordChanged
 * passwordChanged:true   -> pass, but tell client the temp password is used
 * passwordChanged:false  -> pass, the client password dose not need to change
 * if password is wrong, will throw the error
 *
 * @param {*} data {password: string}
 * @returns
 */
const passwordCheck = async (data, password) => {
  let passwordChanged
  const match = await crypto.bcryptCompare(data.password, password)
  if (match === false) {
    const passwordTemp = await redisInviteModel.passwordTempGet(data)
    if (!passwordTemp || passwordTemp.passwordTemp !== data.password) {
      throw new ApiError(apiErrorNames.USER_AUTH_FAIL)
    } else {
      passwordChanged = true // pass, but tell client the temp password is used
    }
  } else {
    passwordChanged = false // pass, the client password dose not need to change
  }
  return passwordChanged
}

/**
 *
 * @api {POST} /user/create Create an invited user
 * @apiName userCreate
 * @apiGroup User
 * @apiVersion  1.0.0
 * @apiPermission none
 *
 * @apiDescription Create a user by invitation code. The invitation code is used to
 *  determine the user groups and user roles of the user. Use this API to create a
 *  user in the specific groups or roles.
 *
 * @apiParam  {String} email The user's email
 * @apiParam  {String} password The user's password
 * @apiParam  {String} name The user's name
 * @apiParam  {String} invitationCode The invitation code from the invitation email
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 *
 * @apiError INVITATION_CODE_WRONG {
 *  code: -108,
 *  message: 'user creating information is incorrect to the invitation code',
 *  }
 * @apiError INVITATION_CODE_FAIL {
 *  code: -107,
 *  message: 'invitation code is either incorrect or not found',
 *  }
 * @apiError USER_EMAIL_VERIFIED {
 *  code: -105,
 *  message: 'user`s email has been registered and verified',
 *  }
 *
 * @apiParamExample  Request-Example:
  {
    "password": "123123",
    "mobile": "932916244",
    "countryCode": "886",
    "name": "Skyer",
    "group": "RD2",
    "role": "admin",
    "invitationCode": "297befbba516a5d01f014"
  }
 *
 *
 * @apiSuccessExample {type} Success-Response:
{
    "code": 0,
    "message": "success",
    "result": {
        "mobileVerified": false,
        "emailVerified": true,
        "groups": [
            "RD2"
        ],
        "email": "rhino@mailinator.com",
        "name": "Rhino",
        "roles": {
            "RD2": [
                "doctor"
            ]
        },
        "user_id": "c139c381-9ba3-4e7c-8671-a63183722b6d",
        "createdAt": "2019-05-10T10:17:40.337Z",
        "updatedAt": "2019-05-10T10:17:40.337Z"
    }
}
 *
 *
 */
exports.userCreate = async (ctx) => {
  const jsonSchema = {
    properties: {
      user_id: { type: 'string' },
      email: { type: 'string' },
      countryCode: { type: 'string' },
      mobile: { type: 'string' },
      password: { type: 'string' },
      name: { type: 'string' },
      groups: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
      roles: { type: 'object' },
      invitationCode: { type: 'string' },
    },
    dependencies: {
      mobile: { required: ['countryCode'] },
    },
    required: ['name', 'password', 'invitationCode'],
    oneOf: [
      { required: ['countryCode', 'mobile'] },
      { required: ['email'] },
    ],
  }

  const data = { ...ctx.request.body }
  data.user_id = crypto.uuid()
  data.password = await crypto.bcrypt(data.password, config.server.saltRounds)

  const invitation = await redisInviteModel.invitationGet(data)
  if (!invitation) {
    throw new ApiError(apiErrorNames.INVITATION_CODE_FAIL)
  } else {
    data.groups = invitation.groups
    data.roles = invitation.roles
  }

  validate.validate(jsonSchema, data)

  if (!invitation.email || invitation.email !== data.email) {
    throw new ApiError(apiErrorNames.INVITATION_CODE_WRONG)
  }

  let user = await userModel.userGetByEmail(data)
  if (user && user.emailVerified) {
    throw new ApiError(apiErrorNames.USER_EMAIL_VERIFIED)
  } else if (!user) {
    data.emailVerified = true
    user = await userModel.userCreate(data)
    user = JSON.parse(JSON.stringify(user))
    delete user.password
    delete user._id
    delete user.__v
  }
  ctx.body = user
}

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
 * @api {GET} /user/email/verify Verify the email
 * @apiName emailVerify
 * @apiGroup User
 * @apiVersion  0.2.0
 * @apiPermission none
 *
 * @apiDescription The server will send the api url to the user. The user can use this url to
 *  tell the server the email is validated and can be verified.
 *
 * @apiParam  {String} email The email is going to verify
 * @apiParam  {String} verificationCode The code is used to verify the email
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 * @apiError VERIFICATION_CODE_ERROR {
  code: -113,
  message: 'verification code is either incorrect or not found',
}
 *
 *
 * @apiParamExample Request-Example:
{{hostname}}/api/user/email/verify
?verificationCode=661e4f8b2706842ad4938&email=parrot@mailinator.com
 *
 *
 * @apiSuccessExample Success-Response （example):
{
    "code": 0,
    "message": "success",
    "result": "Email has been verified"
}
 *
 *
 */
exports.emailVerify = async (ctx) => {
  const jsonSchema = {
    properties: {
      email: { type: 'string' },
      verificationCode: { type: 'string' },
    },
    required: ['email', 'verificationCode'],
  }
  const data = { ...ctx.request.query }
  validate.validate(jsonSchema, data)

  const verificationStr = await redisInviteModel.verifyEmailGet(data)
  const verification = JSON.parse(verificationStr)
  if (verification && verification.email === data.email) {
    data.emailVerified = true
    await userModel.userVerify(data)
    await redisInviteModel.verifyEmailBulkDel(data)
    ctx.body = 'Email has been verified'
  } else {
    throw new ApiError(apiErrorNames.VERIFICATION_CODE_ERROR)
  }
}

/**
 *
 * @api {POST} /user/auth Authorize the user
 * @apiName userAuth
 * @apiGroup User
 * @apiVersion  1.0.0
 * @apiPermission none
 *
 * @apiDescription Get the user's authenticated token using email and password
 *  Due to multiple groups, the token may be more than one. However, the client should
 *  use the correct token to access the specific group.
 *  <p> When the group is provided, if the user successfully log-in,
 *  the user will be given the default role and automatically join the group </p>
 *
 * @apiParam  {String} email The user's email
 * @apiParam  {String} password The user's password
 * @apiParam  {String} [group] Giving the group name will join the group
 *  and automatically grant the default role
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 *
 * @apiError USER_VERIFY_FAIL {
  code: -103,
  message: 'user verification is fail',
}
 * @apiError USER_AUTH_FAIL {
  code: -102,
  message: 'user authorization is fail',
}
 *
 * @apiParamExample Request-Example:
{
  "email": "crow@mailinator.com",
  "password": "123123"
}
 *
 *
 * @apiSuccessExample Success-Response:
{
  "code": 0,
  "message": "success",
  "result": {
    "mobileVerified": false,
    "emailVerified": true,
    "name": "Crow",
    "email": "crow@mailinator.com",
    "roles": {
      "user": [
        "user"
      ]
    },
    "user_id": "359b46ed-fb3b-4388-922b-ceefca419412",
    "createdAt": "2019-06-05T05:57:12.907Z",
    "updatedAt": "2019-06-05T06:49:23.770Z",
    "passwordChanged": false,
    "tokens": {
      "user": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
      .eyJncm91cCI6InVzZXIiLCJ1c2VyX2lkIjoiMzU5YjQ2ZWQtZmIzYi00Mzg4L
      TkyMmItY2VlZmNhNDE5NDEyIiwicm9sZXMiOlsidXNlciJdLCJpYXQiOjE1NTk3MTc1NTd9
      .QQ1nZzHm79RzDKS_kOSLgBCbrK_bar-ulh6a3-x3g8M"
    }
  }
}
 *
 *
 */
exports.userAuth = async (ctx) => {
  const
    jsonSchema = {
      properties: {
        password: { type: 'string' },
        email: { type: 'string' },
        group: { type: 'string' },
      },
      required: ['email', 'password'],
    }

  const data = { ...ctx.request.body }
  validate.validate(jsonSchema, data)

  const user = await userModel.userGetByEmail(data)

  if (!user) {
    throw new ApiError(apiErrorNames.USER_AUTH_FAIL)
  } else {
    if (user.emailVerified === false) {
      throw new ApiError(apiErrorNames.USER_VERIFY_FAIL)
    } else {
      data.user_id = user.user_id

      const fin = await Promise.all([
        passwordCheck(data, user.password),
        defaultRoleGrant(data, user),
      ])
      user.passwordChanged = fin[0]

      user.tokens = {}
      const promises = []
      Object.keys(user.roles).forEach((group) => {
        if (user.roles[group].length !== 0) {
          user.tokens[group] = crypto.jwtSign({
            group,
            user_id: user.user_id,
            roles: user.roles[group],
          })
          promises.push(redisTokenModel.tokenCacheCreate({
            user_id: user.user_id,
            jwt: `Bearer ${user.tokens[group]}`,
          }))
        }
      })
      if (fin[1]) {
        user.tokens[data.group] = crypto.jwtSign({
          group: data.group,
          user_id: fin[1].user_id,
          roles: fin[1].roles[data.group],
        })
        promises.push(redisTokenModel.tokenCacheCreate({
          user_id: fin[1].user_id,
          jwt: `Bearer ${user.tokens[data.group]}`,
        }))
      }

      promises.push(redisInviteModel.passwordTempDel(data))
      await Promise.all(promises)

      delete user.password
      delete user.__v
      delete user._id
    }
    ctx.body = user
  }
}

/**
 *
 * @api {POST} /user/update Update the user information
 * @apiName userUpdate
 * @apiGroup User
 * @apiVersion  1.0.2
 * @apiPermission normalUser, operator
 *
 * @apiDescription User can update name or password. After the user changes the password,
 * all authenticated tokens will expire.
 *
 * @apiParam  {String} [name] User's name
 * @apiParam  {String} [password] User's password
 * @apiParam  {String} [hospital] The hospital where the user work
 * @apiParam  {String} [license] User's working license
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 *
 * @apiError USER_NOT_FOUND {
  code: -101,
  message: 'user is not found',
}
 *
 * @apiParamExample Request-Example:
 {
  "name": "Giraffe",
  "password": "xxxxxxxxx"
 }
 *
 *
 * @apiSuccessExample Success-Response:
{
  "code": 0,
  "message": "success",
  "result": {
    "mobileVerified": false,
    "emailVerified": true,
    "roles": {
      "user": [
        "user",
        "admin"
      ],
      "RD2": [
        "admin"
      ],
      "phononMagic": [
        "doctor"
      ]
    },
    "email": "giraffe@mailinator.com",
    "name": "Giraffe",
    "user_id": "b13fc698-7cb4-48de-b29f-5bf5575bae7f",
    "createdAt": "2018-10-24T07:16:42.624Z",
    "updatedAt": "2019-06-12T06:32:44.844Z",
    "tokens": {
      "user": "tokenA...",
      "RD2": "tokenB...",
      "phononMagic": "tokenC..."
    }
  }
}
 *
 */
exports.userUpdate = async (ctx) => {
  const jsonSchema = {
    properties: {
      name: { type: 'string' },
      password: { type: 'string' },
      license: { type: 'string' },
      hospital: { type: 'string' },
    },
  }

  const data = { ...ctx.request.body }
  data.user_id = ctx.state.user.user_id
  data.group = ctx.state.user.group
  validate.validate(jsonSchema, data)

  data.update = {}
  if (data.name) {
    data.update.name = data.name
  }
  if (data.license) {
    data.update.license = data.license
  }
  if (data.hospital) {
    data.update.hospital = data.hospital
  }
  if (data.password) {
    data.update.password = await crypto.bcrypt(data.password, config.server.saltRounds)
  }

  const user = await userModel.userUpdate(data)
  if (!user) {
    throw new ApiError(apiErrorNames.USER_NOT_FOUND)
  } else if (data.password) {
    await redisTokenModel.tokenCacheDelete(data)

    user.tokens = {}
    const promises = []
    Object.keys(user.roles).forEach((group) => {
      if (user.roles[group].length !== 0) {
        user.tokens[group] = crypto.jwtSign({
          group,
          user_id: user.user_id,
          roles: user.roles[group],
        })
        promises.push(redisTokenModel.tokenCacheCreate({
          user_id: user.user_id,
          jwt: `Bearer ${user.tokens[group]}`,
        }))
      }
    })
    await Promise.all(promises)

    delete user.password
    delete user.__v
    delete user._id
  }
  ctx.body = user
}

/**
 *
 * @api {GET} /user/list?num=20&jump=0 List all the users
 * @apiName userList
 * @apiGroup User
 * @apiVersion  0.1.0
 *
 *
 * @apiPermission JWT
 * @apiParam  {Number} [num] The number of the items you want to get at once
 * @apiParam  {Number} [jump] The paging number you want to skip
 *
 * @apiSuccess (200) {Number} code Error code
 * @apiSuccess (200) {String} message Success message
 * @apiSuccess (200) {Object} result Response result
 *
 *
 * @apiSuccessExample {type} Success-Response:
{
    "code": 0,
    "message": "success",
    "result": {
        "res": [
            {
                "updatedAt": "2017-12-04T09:51:57.810Z",
                "createdAt": "2017-11-14T08:07:52.588Z",
                "countryCode": "886",
                "mobile": "937935456",
                "email": "gary.pan@imediplus.com",
                "name": "Gary",
                "user_id": "61ccc389-9c91-4b9b-b315-71beeac7bf6f",
                "groups": [
                    "RD2",
                    "RD3"
                ],
                "roles": [
                    "root",
                    "admin"
                ],
                "isVerified": true,
                "authy_id": "58765611"
            },
            {
                "updatedAt": "2017-12-13T10:17:16.254Z",
                "createdAt": "2017-11-17T05:08:00.594Z",
                "countryCode": "886",
                "mobile": "932916244",
                "email": "skyer.hung@imediplus.com",
                "name": "Skyer",
                "user_id": "730a87b5-ba42-477e-a728-3d8d5777c14a",
                "groups": [
                    "RD2"
                ],
                "roles": [
                    "doctor",
                    "admin"
                ],
                "isVerified": true,
                "authy_id": "57700895"
            }
        ],
        "total": 2
    }
}
 *
 *
 */
exports.userList = async (ctx) => {
  const jsonSchema = {
    properties: {
      num: { type: 'integer' },
      jump: { type: 'integer' },
    },
  }

  const data = { ...ctx.request.query }
  data.group = ctx.state.user.group
  data.num = Number.parseInt(data.num, 10) || 0
  data.jump = Number.parseInt(data.jump, 10) || 0
  validate.validate(jsonSchema, data)

  const userList = await userModel.userList(data)
  if (!userList) {
    throw new ApiError(apiErrorNames.NOT_FOUND)
  }
  ctx.body = userList
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

/**
 *
 * @api {POST} /api/user/pwd/forgot Forgot password
 * @apiName passwordForgot
 * @apiGroup User
 * @apiVersion  0.1.3
 * @apiPermission none
 *
 * @apiDescription Send the reset password email to the user with the recovered link
 *
 * @apiParam  {String} email The iMedi Cloud account email
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 * @apiError USER_NOT_FOUND {
  code: -101,
  message: 'user is not found',
}
 * @apiError USER_RESET_CODE_FAIL {
  code: -112,
  message: 'Set user reset code fail',
}
 * @apiError EMAIL_SEND_FAIL {
  code: -601,
  message: 'fail to send email',
}
 *
 *
 * @apiParamExample  Request-Example:
{
  "email": "giraffe@mailinator.com"
}
 *
 *
 * @apiSuccessExample Success-Response (example):
{
    "code": 0,
    "message": "success",
    "result": "email sent"
}
// The reset password link in the mail is looked like this
// http://localhost:3088/forgot/ccf2109
 *
 *
 */
exports.passwordForgot = async (ctx) => {
  const
    jsonSchema = {
      properties: {
        email: { type: 'string' },
      },
      required: ['email'],
    }

  const data = { ...ctx.request.body }
  validate.validate(jsonSchema, data)

  const user = await userModel.userGetByEmail(data)
  if (!user) {
    throw new ApiError(apiErrorNames.USER_NOT_FOUND)
  } else {
    data.user_id = user.user_id
  }

  data.resetCode = crypto.randomString(config.email.resetPwd.codeLength)
  try {
    await redisInviteModel.resetCodeSet(data)
  } catch (err) {
    throw new ApiError(apiErrorNames.USER_RESET_CODE_FAIL, err)
  }
  try {
    const ejsData = {
      email: data.email,
      url: `${ctx.request.origin}/forgot/${data.resetCode}`,
    }
    await email.resetPwdSend(ejsData)
  } catch (err) {
    throw new ApiError(apiErrorNames.EMAIL_SEND_FAIL, err)
  }
  ctx.body = 'email sent'
}

exports.passwordReset = async (ctx) => {
  const
    jsonSchema = {
      properties: {
        resetCode: { type: 'string' },
        email: { type: 'string' },
        password: { type: 'string' },
      },
      required: ['resetCode', 'email'],
    }

  const data = { ...ctx.request.body }
  validate.validate(jsonSchema, data)

  const resetCode = await redisInviteModel.resetCodeGet(data)
  if (!resetCode) {
    throw new ApiError(apiErrorNames.USER_RESET_CODE_ERROR)
  } else {
    data.user_id = resetCode.user_id
  }

  const password = await crypto.bcrypt(data.password, config.server.saltRounds)

  data.update = {
    $set: {
      password,
    },
  }

  const user = await userModel.userUpdate(data)
  if (!user) {
    throw new ApiError(apiErrorNames.USER_NOT_FOUND)
  } else {
    await redisInviteModel.resetCodeDel(data)
    await redisTokenModel.tokenCacheDelete(data)
  }

  ctx.body = 'done'
}

/**
 *
 * @api {POST} /api/user/pwd/temp Get a temparary password
 * @apiName passwordTemp
 * @apiGroup User
 * @apiVersion  0.2.0
 * @apiPermission none
 *
 * @apiDescription Send a temparary password to the email. The password exists
 *  for 10 minutes. After user login the account with the temparary password,
 *  the temparary password is destroyed.
 *
 * @apiParam  {String} email The iMedi Cloud account email
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 *
 * @apiError USER_NOT_FOUND {
  code: -101,
  message: 'user is not found',
}
 * @apiError USER_PASSWORD_TEMP_FAIL {
  code: -116,
  message: 'user temparary password set fail',
}
 * @apiError EMAIL_SEND_FAIL {
  code: -601,
  message: 'fail to send email',
}
 *
 * @apiParamExample  Request-Example:
{
  "email": "rhino@mailinator.com"
}
 *
 *
 * @apiSuccessExample {type} Success-Response:
{
    "code": 0,
    "message": "success",
    "result": "email sent"
}
 *
 *
 */
exports.passwordTemp = async (ctx) => {
  const
    jsonSchema = {
      properties: {
        email: { type: 'string' },
      },
      required: ['email'],
    }
  const data = { ...ctx.request.body }
  validate.validate(jsonSchema, data)

  const user = await userModel.userGetByEmail(data)
  if (!user) {
    throw new ApiError(apiErrorNames.USER_NOT_FOUND)
  } else {
    data.user_id = user.user_id
  }

  data.passwordTemp = crypto.randomString(config.email.tempPwd.codeLength)
  try {
    await redisInviteModel.passwordTempSet(data)
  } catch (err) {
    throw new ApiError(apiErrorNames.USER_PASSWORD_TEMP_FAIL)
  }
  try {
    const ejsData = {
      email: data.email,
      passwordTemp: data.passwordTemp,
    }
    await email.passwordTempSend(ejsData)
  } catch (err) {
    throw new ApiError(apiErrorNames.EMAIL_SEND_FAIL, err)
  }
  ctx.body = 'email sent'
}

exports.userSignOut = async (ctx) => {
  const jsonSchema = {
    properties: {
      user_id: { type: 'string' },
    },
  }
  const data = { ...ctx.request.body }
  data.user_id = ctx.state.user.user_id
  validate.validate(jsonSchema, data)
  await redisTokenModel.tokenCacheDelete(data)
  ctx.body = {}
}

/**
 *
 * @api {POST} /api/user/verification/resend Resend email verification code
 * @apiName verificationResend
 * @apiGroup User
 * @apiVersion  1.0.0
 * @apiPermission none
 *
 * @apiDescription Resend the email verification code to the email, which the user
 *  uses to verify that the email(account) is correct and accessible.
 *
 * @apiParam  {String} email The email is used as the login key. Please use the email which
 *  you can access
 *
 * @apiUse COMMON_SUCCESS
 * @apiUse COMMON_ERROR
 *
 * @apiError USER_EMAIL_VERIFIED {
  code: -105,
  message: 'user`s email has been registered and verified',
}
 * @apiError USER_NOT_FOUND {
  code: -101,
  message: 'user is not found',
}
 * @apiError EMAIL_SEND_FAIL {
  code: -601,
  message: 'fail to send email',
}
 *
 *
 * @apiParamExample  {type} Request-Example:
{
  "email": "rhino2@mailinator.com"
}
 *
 *
 * @apiSuccessExample {type} Success-Response:
{
    "code": 0,
    "message": "success",
    "result": {
        "mobileVerified": false,
        "emailVerified": false,
        "email": "rhino2@mailinator.com",
        "name": "Rhino",
        "user_id": "8ef36607-9cec-45dc-b654-01f98c3212fa",
        "roles": {
            "phononMagic": [
                "doctor"
            ]
        },
        "createdAt": "2019-06-24T07:20:16.091Z",
        "updatedAt": "2019-06-24T07:58:02.683Z"
    }
}
 *
 *
 */
exports.verificationResend = async (ctx) => {
  const
    jsonSchema = {
      properties: {
        email: { type: 'string' },
        verificationCode: { type: 'string' },
      },
      required: ['email'],
    }

  const data = { ...ctx.request.body }
  data.verificationCode = crypto.randomString(config.email.invitation.codeLength)
  validate.validate(jsonSchema, data)

  const user = await userModel.userGetByEmail(data)
  if (!user) {
    throw new ApiError(apiErrorNames.USER_NOT_FOUND)
  } else if (user && user.emailVerified === true) {
    throw new ApiError(apiErrorNames.USER_EMAIL_VERIFIED)
  } else {
    data.user_id = user.user_id
    data.email = user.email
    data.roles = user.roles
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
  }
}
