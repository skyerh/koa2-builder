const apiErrorNames = require('./apiErrorNames.js')

/**
 * defined error format
 */
class ApiError extends Error {
  constructor(errorName, errorMessage) {
    super()
    var errorInfo = apiErrorNames.getErrorInfo(errorName)
    this.errorName = errorName
    this.code = errorInfo.code
    if (errorMessage) {
      this.message = `${errorInfo.message}, ${errorMessage}`
    } else {
      this.message = errorInfo.message
    }
  }
}

module.exports = ApiError