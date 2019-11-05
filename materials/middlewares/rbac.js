/**
 * Name: Role based Access Control Middleware
 * Function: To verify if the user has right to access the api
 * Usage example:
 * router.post('/create', jwt, rbac(), barcodeController.barcodeCreate)
 * router.get('/tag/:group', jwt, rbac('/api/barcode/tag/:group'), barcodeController.barcodeTagList)
 */
const
  ApiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames'),
  RBACModel = require('../models/rbacModel'),
  rbacModel = new RBACModel(),
  rbacObj = {}

rbacObj.check = (operation) => {
  return async (ctx, next) => {
    let op = operation
    const { roles } = ctx.state.user

    try {
      if (!roles) {
        throw new Error('either the user is not found, or the user role is missing')
      }

      if (!op) {
        op = ctx.request.path
      }

      const result = roles.some((role) => {
        return rbacModel.can(role, op)
      })

      if (result === false) {
        throw new Error('the role is restricted to run the api')
      }

      await next()
    } catch (err) {
      throw new ApiError(apiErrorNames.ROLE_CHECK_ERROR, err)
    }
  }
}

module.exports = rbacObj.check
