const
  AJV = require('ajv'),
  ajv = new AJV({useDefaults: true}),
  apiError = require('../error/apiError'),
  apiErrorNames = require('../error/apiErrorNames')

class validation {
  constructor (jsonSchema, data) {
    this.jsonSchema = jsonSchema
    this.data = data
  }

  /**
   * use AJV to validate the user's json schema
   * last modified on 2017/10/17
   * @param {Object} jsonSchema used to validate data
   * @param {Object} data used to be validated
   * @memberof validation
   */
  validate (jsonSchema, data) {
    let validating = ajv.compile(jsonSchema)
    let valid = validating(data)
    if (!valid) {
      throw new apiError(apiErrorNames.VALIDATION_ERROR, ajv.errorsText(validating.errors))
    } else {
      return
    }
  }
}

module.exports = validation