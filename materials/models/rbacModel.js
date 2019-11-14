const
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
    if (!this.roles[role]) {
      return false
    }

    const aRole = this.roles[role]
    if (aRole.can.includes(operation) === true) {
      return true
    }

    if (!aRole.inherits || aRole.inherits.length < 1) {
      return false
    }

    return aRole.inherits.some((childRole) => {
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
    if (!this.roles[role]) {
      return []
    }

    const aRole = this.roles[role]
    this.operationList = [...new Set([...this.operationList, ...aRole.can])]

    if (!aRole.inherits || aRole.inherits.length < 1) {
      return this.operationList
    }

    aRole.inherits.forEach((childRole) => {
      this.operationGet(childRole)
    })
    return this.operationList
  }
}

module.exports = RBAC
