const
  path = require('path'),
  baseLogPath = path.resolve(__dirname, '../logs'),
  errorPath = '/error',
  errorFileName = 'error',
  errorLogPath = `${baseLogPath}${errorPath}/${errorFileName}`,
  responsePath = '/response',
  responseFileName = 'response',
  responseLogPath = `${baseLogPath}${responsePath}/${responseFileName}`

/**
 * log4j config setting
 */
module.exports = {
  appenders: {
    out: { type: 'console' },
    errorLogger: {
      type: 'dateFile',
      filename: errorLogPath,
      pattern: '--yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      path: errorPath,
    },
    responseLogger: {
      type: 'dateFile',
      filename: responseLogPath,
      pattern: '--yyyy-MM-dd.log',
      alwaysIncludePattern: true,
      path: responsePath,
    },
  },
  categories: {
    default: {
      appenders: ['out'],
      level: 'info',
    },
    errorLogger: {
      appenders: ['errorLogger'],
      level: 'ERROR',
    },
    responseLogger: {
      appenders: ['responseLogger'],
      level: 'ALL',
    },
  },
  baseLogPath,
}
