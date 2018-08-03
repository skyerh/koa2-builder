/**
 * declared for socket.io
 */
const users = []
const descs = {}
const sockets = {}
const calls = {}
const connectUsers = {}
const state = {
  users, descs, sockets, calls, connectUsers
}

module.exports = function(io) {
  io.on('connection', (socket) => {
    const generateUser = () => {
      let userId = generateRandomInteger(10000, 99999)
      while (users.includes[userId]) {
        userId = generateRandomInteger(10000, 99999)
      }
      return userId
    }
    const generateRandomInteger = (min, max) => {
      let random = Math.floor(min + Math.random() * (max + 1 - min))
      return random.toString()
    }
  
    let userId = generateUser()
    users.push(userId)
    sockets[userId] = socket
    socket.emit('user-id', {
      userId
    })
  
    console.log('client connected!', userId)
  
    const onLogout = () => {
      console.log('on logout', userId)
  
      users.splice(users.indexOf(userId), 1)
      delete sockets[userId]
    }
    const onCall = (data) => {
      console.log('on call', data)
  
      descs[userId] = data.desc
      calls[userId] = data.callee
  
      sockets[data.callee].emit('incoming-call', {
        caller: userId,
        desc: data.desc
      })
    }
    const onAnswer = (data) => {
      console.log('on answer', data)
  
      descs[userId] = data.desc
      calls[userId] = data.caller
  
      sockets[data.caller].emit('answer', {
        callee: userId,
        desc: data.desc
      })
    }
    const onHangUp = () => {
      console.log('on hang up', userId)
  
      const remote = calls[userId]
  
      delete descs[userId]
      delete descs[remote]
      delete calls[userId]
      delete calls[remote]
  
      sockets[remote].emit('hang-up', {
        userId
      })
    }
    const onCandidate = (data) => {
      console.log('on candidate', data)
  
      const remote = calls[userId]
  
      if (!remote) return
  
      sockets[remote].emit('candidate', data)
    }
    const onDisconnect = () => {
      console.log('on disconnect', userId)
  
      if (calls[userId]) {
        onHangUp()
      }
  
      onLogout()
  
      console.log(state)
    }
  
    const onPeerOffer = (data) => {
      console.log('on Peer Offer', data)
  
      descs[userId] = data.desc
      connectUsers[userId] = data.userId
  
      sockets[data.userId].emit('peer-offer', {
        userId,
        desc: data.desc
      })
    }
  
    const onPeerAnswer = (data) => {
      console.log('on Peer Answer', data)
  
      descs[userId] = data.desc
      connectUsers[userId] = data.userId
  
      sockets[data.userId].emit('peer-answer', {
        userId,
        desc: data.desc
      })
    }
  
    const onPeerCandidate = (data) => {
      console.log('on Peer Candidate', data)
  
      const connectUser = connectUsers[userId]
  
      sockets[connectUser].emit('peer-candidate', {
        userId,
        candidate: data.candidate
      })
    }
  
    socket.on('logout', onLogout)
    socket.on('call', onCall)
    socket.on('answer', onAnswer)
    socket.on('hang-up', onHangUp)
    socket.on('candidate', onCandidate)
    socket.on('disconnect', onDisconnect)
  
    socket.on('peer-offer', onPeerOffer)
    socket.on('peer-answer', onPeerAnswer)
    socket.on('peer-candidate', onPeerCandidate)
  })
}