/**
 * defined API error names
 */
var apiErrorNames = {}

/* common */
apiErrorNames.NOT_FOUND = 'NotFound'
apiErrorNames.PERMISSION_IS_NOT_ALLOWED = 'PermissonIsNotAllowed'
apiErrorNames.TOKEN_IS_INVALID = 'TokenIsInvalid'
apiErrorNames.UNKNOWN_ERROR = 'UnknownError'
apiErrorNames.UNKNOWN_API = 'UnknownAPI'
apiErrorNames.USER_AUTH_NEEDED = 'UserAuthIsNeeded'
apiErrorNames.VALIDATION_ERROR = 'ValidationError'
apiErrorNames.TYPE_ERROR = 'TypeError'

/* email */
apiErrorNames.EMAIL_SEND_FAIL = 'EmailSendFail'
apiErrorNames.SMS_SEND_FAIL = 'SmsSendFail'

/* group */
apiErrorNames.GROUP_IS_EXISTED = 'GroupIsExisted'
apiErrorNames.GROUP_NOT_FOUND = 'GroupNotFound'
apiErrorNames.GROUP_UNDECIDABLE = 'GroupUndecidable'
apiErrorNames.GROUP_DIFFERENT = 'GroupDifferent'
apiErrorNames.USER_GROUP_NOT_MATCHED = 'GroupNotMatched'

/* redis */
apiErrorNames.REDIS_ERROR = 'RedisError'

/* role */
apiErrorNames.ROLE_IS_EXISTED = 'RoleIsExisted'
apiErrorNames.ROLE_NOT_FOUND = 'RoleIsFound'
apiErrorNames.ROLE_RESTRICTED = 'RoleRestricted'
apiErrorNames.ROLE_WEIGHT_FAIL = 'RoleWeightFail'

/* user */
apiErrorNames.USER_AUTH_FAIL = 'UserAuthIsFail'
apiErrorNames.USER_NOT_FOUND = 'UserIsNotFound'
apiErrorNames.USER_VERIFY_FAIL = 'UserVerifyFail'
apiErrorNames.USER_AUTHY_FAIL = 'UserAuthyFail'
apiErrorNames.USER_EMAIL_VERIFIED = 'UserEmailVerified'
apiErrorNames.USER_MOBILE_VERIFIED = 'UserMobileVerified'
apiErrorNames.INVITATION_CODE_FAIL = 'InvitationCodeFail'
apiErrorNames.INVITATION_DATA_FAIL = 'InvitationDataFail'
apiErrorNames.USER_ROLE_NOT_FOUND = 'UserRoleNotFound'
apiErrorNames.USER_AUTHY_EMPTY = 'UserAuthyEmpty'
apiErrorNames.USER_AUTHY_SMS_ERROR = 'UserAuthySmsError'

// ============================================================================
const errorMap = new Map()

/* common */
errorMap.set(apiErrorNames.UNKNOWN_ERROR, {
  code: -1,
  message: 'unknown error'
})
errorMap.set(apiErrorNames.UNKNOWN_API, {
  code: -2,
  message: 'unknown api'
})
errorMap.set(apiErrorNames.VALIDATION_ERROR, {
  code: -3,
  message: 'user data validation error'
})
errorMap.set(apiErrorNames.NOT_FOUND, {
  code: -4,
  message: 'data is not found'
})
errorMap.set(apiErrorNames.USER_AUTH_NEEDED, {
  code: -5,
  message: 'user authorization is needed'
})
errorMap.set(apiErrorNames.TOKEN_IS_INVALID, {
  code: -6,
  message: 'token is invalid'
})
errorMap.set(apiErrorNames.PERMISSION_IS_NOT_ALLOWED, {
  code: -7,
  message: 'permission is not allowed'
})
errorMap.set(apiErrorNames.TYPE_ERROR, {
  code: -8,
  message: 'type error on one or some variable'
})

/* user */
errorMap.set(apiErrorNames.USER_NOT_FOUND, {
  code: -101,
  message: 'user is not found'
})
errorMap.set(apiErrorNames.USER_AUTH_FAIL, {
  code: -102,
  message: 'user authorization is fail'
})
errorMap.set(apiErrorNames.USER_VERIFY_FAIL, {
  code: -103,
  message: 'user verification is fail'
})
errorMap.set(apiErrorNames.USER_EMAIL_VERIFIED, {
  code: -104,
  message: 'user`s email has been registered and verified'
})
errorMap.set(apiErrorNames.INVITATION_CODE_FAIL, {
  code: -105,
  message: 'invitation code is either incorrect or not found'
})
errorMap.set(apiErrorNames.INVITATION_DATA_FAIL, {
  code: -106,
  message: 'user creative data is incorrect to the invitation data'
})
errorMap.set(apiErrorNames.USER_ROLE_NOT_FOUND, {
  code: -107,
  message: 'either the user is not found, or the user role is missing'
})
errorMap.set(apiErrorNames.USER_GROUP_NOT_MATCHED, {
  code: -108,
  message: 'user group is not matched to the data'
})

/* group */
errorMap.set(apiErrorNames.GROUP_IS_EXISTED, {
  code: -301,
  message: 'the group is already existed'
})
errorMap.set(apiErrorNames.GROUP_NOT_FOUND, {
  code: -302,
  message: 'cannot find the group'
})
errorMap.set(apiErrorNames.GROUP_UNDECIDABLE, {
  code: -303,
  message: 'the file sync is aborted due to the user has none or more than one group'
})
errorMap.set(apiErrorNames.GROUP_DIFFERENT, {
  code: -304,
  message: 'the user group is different to the examination'
})

/* role */
errorMap.set(apiErrorNames.ROLE_IS_EXISTED, {
  code: -401,
  message: 'the role is already existed'
})
errorMap.set(apiErrorNames.ROLE_NOT_FOUND, {
  code: -402,
  message: 'the role is not found'
})
errorMap.set(apiErrorNames.ROLE_RESTRICTED, {
  code: -403,
  message: 'the role is restricted to run the api'
})
errorMap.set(apiErrorNames.ROLE_WEIGHT_FAIL, {
  code: -404,
  message: 'the role weight is lighter than the role weight which is able to do'
})

/* email */
errorMap.set(apiErrorNames.EMAIL_SEND_FAIL, {
  code: -601,
  message: 'fail to send email'
})
errorMap.set(apiErrorNames.SMS_SEND_FAIL, {
  code: -602,
  message: 'fail to send SMS'
})

/* redis */
errorMap.set(apiErrorNames.REDIS_ERROR, {
  code: -701,
  message: 'redis error'
})

apiErrorNames.getErrorInfo = (errorName) => {
  let errorInfo
  if (errorName) {
    errorInfo = errorMap.get(errorName)
  }
  if (!errorInfo) {
    errorName = apiErrorNames.UNKNOWN_ERROR
    errorInfo = errorMap.get(errorName)
  }
  return errorInfo
}

module.exports = apiErrorNames