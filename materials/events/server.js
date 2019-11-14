const serverEvents = (server, port) => {
  /**
   * Event listener for error event
   *
   */
  const onError = (error) => {
    if (error.syscall !== 'listen') {
      throw error
    }

    let bind
    if (typeof port === 'string') {
      bind = `Pipe ${port}`
    } else {
      bind = `Port ${port}`
    }

    switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
    }
  }

  /**
   * Event listener for HTTP server "listening" event.
   *
   */
  const onListening = () => {
    console.log(`process.env.NODE_ENV= ${process.env.NODE_ENV}`)
    console.log(`server is running on port: ${port}`)
    console.log('server is up and running...')
  }

  /**
   * Promise is rejected and no error handler is attached go here
   *
   */
  const onUnhandledRejection = (reason, p) => {
    console.log('\n Unhandled Rejection at:', p, '\n\n reason:', reason)
  }

  server.on('error', onError)
  server.on('listening', onListening)
  process.on('unhandledRejection', onUnhandledRejection)
}

module.exports = serverEvents
