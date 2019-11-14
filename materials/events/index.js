const
  serverEvents = require('./server'),
  socketIoEvents = require('./socketIo')

/**
 *  export selected event
 *
 */
module.exports = {
  serverEvents: (server, port) => {
    serverEvents(server, port)
  },
  socketIoEvents: (io) => {
    socketIoEvents(io)
  },
}
