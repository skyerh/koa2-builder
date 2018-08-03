const
  _ = require('lodash'),
  apiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  config = require('../config'),
  crypto = require('../utils/crypto'),
  email = require('../utils/email'),
  RedisInviteModel = require('../models/redisInviteModel'),
  redisInviteModel = new RedisInviteModel(),
  UserModel = require('../models/userModel'),
  userModel = new UserModel(),
  Validate = require('../utils/validate'),
  validate = new Validate()

/**
 * 
 * @api {POST} /user/create Create a user
 * @apiDescription The client is need to obtain the invitation code before create an account.
 *  All the information that used to create the account differ to the data which are used to apply the invitation code will be rejected.
 *  For the invitation code applying please see the document "Send the invitation to the user"
 * @apiName userCreate
 * @apiGroup User
 * @apiVersion  0.1.0
 * 
 * 
 * @apiPermission none
 * @apiParam  {String} email The user's email
 * @apiParam  {String} password The user's password
 * @apiParam  {String} name The user's name
 * @apiParam  {String[]} groups The groups are the dealer's compnay
 * @apiParam  {String[]} roles The roles are the identity of the dealer
 * 
 * @apiSuccess (200) {Number} code Error code
 * @apiSuccess (200) {String} message Success message
 * @apiSuccess (200) {Object} result Response result
 * 
 * 
 * @apiParamExample  {type} Request-Example:
{
  "password": "password",
  "email": "skyer@email.com",
  "name": "Skyer",
  "groups": ["RD2"],
  "roles": ["admin"],
  "invitationCode": "5fa309807910364d1e0bf"
}
 * 
 * 
 * @apiSuccessExample {type} Success-Response:
{
    "code": 0,
    "message": "success",
    "result": {
        "emailVerified": true,
        "roles": [
            "admin"
        ],
        "groups": [
            "RD2"
        ],
        "email": "skyer@email.com",
        "name": "Skyer",
        "user_id": "bca3cc84-6895-48c9-ba2b-a78ee4385a16",
        "createdAt": "2018-07-06T09:33:19.628Z",
        "updatedAt": "2018-07-06T09:33:19.628Z"
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
      password: { type: 'string' },
      name: { type: 'string' },
      groups: {
        type: 'array',
        minItems: 1,
        maxItems: 1,
        items: {
          type: 'string'
        }
      },
      roles: {
        type: 'array',
        minItems: 1,
        maxItems: 1,
        items: {
          type: 'string'
        }
      },
      invitationCode: { type: 'string' }
    },
    dependencies: {
      mobile: {required: ['countryCode']}
    },
    required: ['name', 'password', 'groups', 'roles', 'email', 'invitationCode'],
  }

  const data = _.clone(ctx.request.body)
  data.user_id = crypto.uuid()
  data.password = await crypto.bcrypt(data.password, config.server.saltRounds)
  validate.validate(jsonSchema, data)

  const invitation = await redisInviteModel.invitetionGet(data)
  let userCount
  if (_.isEmpty(invitation) === true) {
    userCount = await userModel.userCount()
    if (userCount !== 0) {
      throw new apiError(apiErrorNames.INVITATION_CODE_FAIL)
    } else {
      data.groups = ['RD2']
      data.roles = ['root']
    }
  } else {
    if (_.difference(invitation.roles, data.roles).length !== 0 ||
      _.difference(invitation.groups, data.groups).length !== 0) {
      throw new apiError(apiErrorNames.INVITATION_DATA_FAIL)
    }
  }

  let user = {}
  if (!invitation || !invitation.email || invitation.email !== data.email) {
    if (userCount !== 0) {
      throw new apiError(apiErrorNames.INVITATION_DATA_FAIL)
    }
  }

  user = await userModel.userGetByEmail(data)
  if (user && user.emailVerified) {
    throw new apiError(apiErrorNames.USER_EMAIL_VERIFIED)
  } else if (_.isEmpty(user) === true) {
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
 * @api {POST} /api/user/invite Send the invitation to the user
 * @apiDescription Send the inviation link through the email to the client.
 *  The client can do the registration in iMedi Serial Number Server with the link we send.
 *  For example, the link is looked like this http://localhost:23088/signup/297befbba516a5d01f014
 * @apiName userInvite
 * @apiGroup User
 * @apiVersion  0.1.0
 * 
 * @apiPermission JWT + admin
 * @apiParam  {String} email The user's email
 * @apiParam  {String[]} roles The roles are the identity of the user
 *
 * @apiSuccess (200) {Number} code Error code
 * @apiSuccess (200) {String} message Success message
 * @apiSuccess (200) {Object} result Response result
 * 
 * @apiParamExample  {type} Email-Example:
{
	"email": "skyer@email.com",
	"groups": "RD2",
	"roles": "admin"
}
 * 
 * 
 * @apiSuccessExample {type} Success-Response:
{
    "code": 0,
    "message": "success",
    "result": "297befbba516a5d01f014"
}
//And the invitation link in email or mobile is look like this 
//http://localhost:3000/signup/297befbba516a5d01f014
 * 
 * 
 */
exports.userInvite = async (ctx) => {
  const jsonSchema = {
    properties: {
      user_id: { type: 'string' },
      email: { type: 'string' },
      invitationCode: { type: 'string' },
      groups: {
        type: 'array',
        minItems: 1,
        maxItems: 1,
        items: {
          type: 'string'
        }
      },
      roles: {
        type: 'array',
        minItems: 1,
        maxItems: 1,
        items: {
          type: 'string'
        }
      },
    },
    dependencies: {
      mobile: {required: ['countryCode']}
    },
    required: ['user_id', 'invitationCode', 'groups', 'roles', 'email']
  }

  const data = _.clone(ctx.request.body)
  data.user_id = ctx.state.user.user_id
  data.invitationCode = crypto.randomString(config.invitation.codeLength)
  validate.validate(jsonSchema, data)
  data.groupName = data.groups[0]
  data.roleName = data.roles[0]
  

  const isVerified = await userModel.isUserVerified(data)
  if (isVerified.emailVerified === true) {
    throw new apiError(apiErrorNames.USER_EMAIL_VERIFIED)
  }

  await redisInviteModel.invitationCreate(data)
  try {
    const ejsData = {
      email: data.email,
      url: `${config.server.protocol}://${ctx.request.header.host}/signup/${data.invitationCode}`,
      invitationCode: data.invitationCode
    }
    await email.invitationSend(ejsData)
  } catch (err) {
    throw new apiError(apiErrorNames.EMAIL_SEND_FAIL, err)
  }

  ctx.body = data.invitationCode
}

