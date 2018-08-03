module.exports = function(server, port) {
  const onError = (error) => {
    if (error.syscall !== 'listen') {
      throw error
    }
  
    var bind = typeof port === 'string'
      ? 'Pipe ' + port
      : 'Port ' + port
  
    // handle specific listen errors with friendly messages
    switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges')
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(bind + ' is already in use')
      process.exit(1)
      break
    default:
      throw error
    }
  }
  
  /**
   * Event listener for HTTP server "listening" event.
   */
  const onListening = () => {
    console.log('process.env.NODE_ENV=' + process.env.NODE_ENV)
    console.log('server is running on port: ' + port)
    console.log('server is up and running...')
  }

  server.on('error', onError) 
  server.on('listening', onListening)
}