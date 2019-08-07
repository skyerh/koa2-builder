// =====================================================================
// Error
// =====================================================================
/**
 * @apiDefine COMMON_ERROR
 * @apiVersion 1.0.0
 *
 * @apiError UNKNOWN_ERROR {
  code: -1,
  message: 'unknown error',
}
 * @apiError UNKNOWN_API {
  code: -2,
  message: 'unknown api',
}
 * @apiError VALIDATION_ERROR {
  code: -3,
  message: 'user data validation error',
}
 * @apiError USER_AUTH_NEEDED {
  code: -5,
  message: 'user authorization is needed',
}
 * @apiError TOKEN_IS_INVALID {
  code: -6,
  message: 'token is invalid',
}
 * @apiError USER_AUTH_RENEW {
  code: -7,
  message: 'need to re-log-in due to the authentication has been renew',
}
 * @apiError ROLE_RESTRICTED {
  code: -403,
  message: 'the role is restricted to run the api',
}
 *
 * @apiErrorExample  Response (example):
  HTTP/1.1 400 Bad Request
  {
    "code": -403,
    "errorName": "RoleRestricted",
    "message": "the role is restricted to run the api"
  }
 */

// =====================================================================
// Success
// =====================================================================
/**
 * @apiDefine COMMON_SUCCESS
 * @apiVersion 0.1.0
 *
 * @apiSuccess {Number} code Error code
 * @apiSuccess {String} message Success message
 * @apiSuccess {Object} result Response result
 */

// =======================================================================
// History
// =======================================================================
