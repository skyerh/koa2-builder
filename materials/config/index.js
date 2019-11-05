const
  developmentEnv = require('./development.js'),
  productionEnv = require('./production.js')

/**
 * export selecting environment config
 * default is development
 */
module.exports = {
  development: developmentEnv,
  production: productionEnv,
  test: developmentEnv,
}[process.env.NODE_ENV || 'development']
