const
  _ = require('lodash'),
  rbacConfig = require('../config/rbac')

class RBAC {
  constructor() {
    this.init()
  }

  init() {
    this.roles = rbacConfig
    this.operationList = []
  }
  
  /**
   * Check if the role is able to access the operation
   * 
   * @param {String} role // 'admin'
   * @param {String} operation // '/api/role/list'
   * @returns Boolean
   * @memberof RBAC
   */
  can(role, operation) {
    if (_.isEmpty(this.roles[role]) === true) {
      return false
    }
    
    let _role = this.roles[role]
    if (_.includes(_role.can, operation) === true) {
      return true
    }

    if (_.isEmpty(_role.inherits) === true || _role.inherits.length < 1) {
      return false
    }

    return _.some(_role.inherits, (childRole) => {
      return this.can(childRole, operation)
    })
  }

  /**
   * get the operations which the role can run
   * 
   * @param {String} role 
   * @returns {[String]}
   * @memberof RBAC
   */
  operationGet(role) {
    
    if (_.isEmpty(this.roles[role]) === true) {
      return []
    }

    let _role = this.roles[role]
    this.operationList = _.union(this.operationList, _role.can)

    if (_.isEmpty(_role.inherits) === true || _role.inherits.length < 1) {
      return this.operationList
    }

    _.map(_role.inherits, (childRole) => {
      this.operationGet(childRole)
    })
    return this.operationList
  }
}

module.exports = RBAC