var
  serverEvent = require('./server'),
  socketIoEvent = require('./socketIo')

/**
 * export selecting environment config
 * default is development
 */
module.exports = {
  serverEvent: (server, port) => {
    serverEvent(server, port)
  },
  socketIoEvent: (io) => {
    socketIoEvent(io)
  }
}