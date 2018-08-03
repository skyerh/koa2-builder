const
  _ = require('lodash'),
  rbacConfig = require('../config/rbac')

let operationList = []


exports.operationGet = (role, loop) => {
  if (_.isBoolean(loop) === false) {
    operationList = []
  }

  if (_.isEmpty(rbacConfig[role]) === true) {
    return operationList
  }

  let _role = rbacConfig[role]
  operationList = _.union(operationList, _role.can)
  
  if (_.isEmpty(_role.inherits) === true || _role.inherits.length < 1) {
    return operationList
  }

  _.map(_role.inherits, (childRole) => {
    this.operationGet(childRole, true)
  })

  return operationList
}

