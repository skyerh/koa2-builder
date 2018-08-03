/**
 * Name: Role based Access Control Middleware
 * Function: To verify if the user has right to access the api
 * Usage example:
 * router.post('/create', jwt, rbac(), barcodeController.barcodeCreate)
 * router.get('/tag/:group', jwt, rbac('/api/barcode/tag/:group'), barcodeController.barcodeTagList)
 */
const
  _ = require('lodash'),
  apiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  RBACModel = require('../models/rbacModel'),
  rbacModel = new RBACModel(),
  rbacObj = {},
  UserModel = require('../models/userModel'),
  userModel = new UserModel()

rbacObj.check = (operation) => {
  return async (ctx, next) => {
    let userRoles = await userModel.userRolesList({user_id: ctx.state.user.user_id})
    
    if (_.isEmpty(userRoles) === true) {
      throw new apiError(apiErrorNames.USER_ROLE_NOT_FOUND)
    } else {
      userRoles = userRoles.roles
    }

    if (_.isEmpty(operation) === true) {
      operation = ctx.request.path
    }

    let result = _.some(userRoles, (role) => {
      return rbacModel.can(role, operation)
    })

    if (result === false) {
      throw new apiError(apiErrorNames.ROLE_RESTRICTED)
    }

    await next()
  }
}

module.exports = rbacObj.check