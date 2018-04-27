
/////////////// CONFIGURATION //////////////////////////////////////
////////////////////////////////////////////////////////////////////

const express = require('express')
const app = express()
const cors = require('cors')

app.use(cors())

/////////////// SOCKET CONFIG /////////////////////////////////////
const http = require('http')
const socketIO = require('socket.io')
const server = http.createServer(app)
const io = socketIO.listen(server)


server.listen(process.env.PORT || 4000, () => {
// server.listen(4000, () => {
    console.log("\n\tServer active. Listening on port 4000\n")
})





/////////////// INDEX ROUTE ///////////////////////////////////////
app.get("/", (req, res) => {
  res.send("Hello Monkey")
})




/////////////// SOCKET EVENTS //////////////////////////////////////
////////////////////////////////////////////////////////////////////

io.on('connection', (socket) => {
  console.log('\n\tUser Connected')

/////////////// CHAT MESSAGES //////////////////////////////////////

  socket.on('chat message', (msg) => io.emit('chat message', msg))

/////////////// PLAYERS ////////////////////////////////////////////

  socket.on('new player1', (player1) => {
    io.emit('new player1', player1)
  })
  socket.on('new player2', (player2) => {
    io.emit('new player2', player2)
  })

/////////////// TURNS ////////////////////////////////////////////
  socket.on('new Turn', (newTurn, newP1Coin, newP1OP, newP2Coin, newP2OP) => {
    io.emit(`new Turn`, newTurn, newP1Coin, newP1OP, newP2Coin, newP2OP)
  })

/////////////// SLAP ///////////////////////////////////////////////

  socket.on('P1 slaps', (slapP2Health, slapP1Coin, slapP1OP) => {
    io.emit(`P1 slaps`, slapP2Health, slapP1Coin, slapP1OP)
  })

  socket.on('P2 slaps', (slapP1Health, slapP2Coin, slapP2OP) => {
    io.emit(`P2 slaps`, slapP1Health, slapP2Coin, slapP2OP)
  })

/////////////// PUNCH ///////////////////////////////////////////////

  socket.on('P1 punches', (punchP2Health, punchP1Coin, punchP1OP) => {
    io.emit(`P1 punches`, punchP2Health, punchP1Coin, punchP1OP)
  })
  socket.on('P2 punches', (punchP1Health, punchP2Coin, punchP2OP) => {
    io.emit(`P2 punches`, punchP1Health, punchP2Coin, punchP2OP)
  })

/////////////// MUD ///////////////////////////////////////////////
  socket.on('P1 muds', (mudP2Health, mudP1Coin, mudP1OP) => {
    io.emit(`P1 muds`, mudP2Health, mudP1Coin, mudP1OP)
  })

  socket.on('P2 muds', (mudP1Health, mudP2Coin, mudP2OP) => {
    io.emit(`P2 muds`, mudP1Health, mudP2Coin, mudP2OP)
  })

/////////////// OVERFLOW //////////////////////////////////////
  socket.on('P1 overflows', (overflowP1Coin, overflowP1OP) => {
    io.emit('P1 overflows', overflowP1Coin, overflowP1OP)
  })

  socket.on('P2 overflows', (overflowP2Coin, overflowP2OP) => {
    io.emit('P2 overflows', overflowP2Coin, overflowP2OP)
  })

/////////////// CACHE //////////////////////////////////////
  socket.on('P1 coinrestore', (coinrestoreP1Coin, coinrestoreP1OP) => {
    io.emit('P1 coinrestore', coinrestoreP1Coin, coinrestoreP1OP)
  })

  socket.on('P2 coinrestore', (coinrestoreP2Coin, coinrestoreP2OP) => {
    io.emit('P2 coinrestore', coinrestoreP2Coin, coinrestoreP2OP)
  })





  socket.on('disconnect', () => console.log('\n\tUser Disconnected'))
})
