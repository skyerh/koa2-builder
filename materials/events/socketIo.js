const ioEvents = (io) => {
  const onConnection = (socket) => {
    console.log('Client connected')
    socket.emit('Server connected')
  }
  io.on('connection', onConnection)
}

module.exports = ioEvents
