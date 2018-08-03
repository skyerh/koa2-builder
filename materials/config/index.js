var
  development_env = require('./development.js'),
  production_env = require('./production.js')

/**
 * export selecting environment config
 * default is development
 */
module.exports = {
  development: development_env,
  production: production_env,
  test: development_env
}[process.env.NODE_ENV || 'development']