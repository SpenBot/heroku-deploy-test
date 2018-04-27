
//// DEPENDENCIES, MODULES, CONFIGURATIONS ////////////////////////////
///////////////////////////////////////////////////////////////////////

const express = require('express')
const app = express()

// const socket = require('socket.io')
const cors = require('cors')






//// MIDDLEWWARE //////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

app.use(cors())

const http = require('http')
const socketIO = require('socket.io')
const server = http.createServer(app)
const io = socketIO.listen(server)





//// SERVER CONFIGURATIONS /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

app.set('port', process.env.PORT || 4000)

server.listen(app.get('port'), () => {
  console.log(`\n\tServer listening on port : ${app.get('port')}.\n`)
})

app.get("/", (req, res) => {
  // res.send("Hello CRST-back")
  res.json({
    test1: 1,
    test2: 2,
    test3: 3,
    test4: 4,
    test5: 5
  })
})





/////////////// GAME STATE /////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

let playerRed = null
let playerBlue = null

let canvasHeight = 360
let canvasWidth = 640

const startRedX = 30
const startRedY = ( (canvasHeight / 2) - 10 )
const startBlueX = (canvasWidth - 50)
const startBlueY = ( (canvasHeight / 2) - 10 )

let redX = startRedX
let redY = startRedY
let blueX = startBlueX
let blueY = startBlueY

const moveVal = 20






/////////////// EMIT: GAME RESET //////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function gameReset () {

    redX = startRedX
    redY = startRedY
    blueX = startBlueX
    blueY = startBlueY

    playerPositions()

}



/////////////// EMIT : PLAYER POSITIONS ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function playerPositions () {

    io.sockets.emit('playerPositions', {
      redX: redX,
      redY: redY,
      blueX: blueX,
      blueY: blueY
    })

}



/////////////// EMIT : PLAYERS CHOSEN /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function playersChosen () {

  io.sockets.emit('playerChosen', {
    playerRed: playerRed,
    playerBlue: playerBlue,
  })

}



/////////////// EMIT : RESET PLAYERS //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function resetPlayers () {

    playerRed = null
    playerBlue = null

    io.sockets.emit('playerReset', {
      player: null
    })

    playersChosen()

}









/////////////// SOCKET METHODS ////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

io.on('connection', function(socket) {


  //// LOG CONNECTION ////
  console.log(`\n\tUser Connected: ${socket.id}\n`)

  //// EMIT [ ON CONNECTION ] : PLAYER POSITIONS ////
  socket.emit('playerPositions', {
      redX: redX,
      redY: redY,
      blueX: blueX,
      blueY: blueY
  })

  //// EMIT [ ON CONNECTION ] : PLAYERS STAT ////
  playersChosen()

  //// LISTEN : CONFIRM SOCKET ////
  socket.on('confirmSocket', () => {

      socket.emit('socketConfirm', {
        socket: true
      })

  })

  //// LISTEN + EMIT : SET PLAYERS ////
  socket.on('playerSelected', function(data) {

      if (data.player === "red" && playerRed === null) {

          playerRed = socket.id
          console.log(`Player Red : ${playerRed}`)

          socket.emit('playerSet', {
            player: "red"
          })

          playersChosen()

      }

      else if (data.player === "blue" && playerBlue === null) {

          playerBlue = socket.id
          console.log(`Player Blue : ${playerBlue}`)

          socket.emit('playerSet', {
            player: "blue"
          })

          playersChosen()

      }

      gameReset()

  })




  //// LISTEN + EMIT : PLAYER MOVEMENT ////
  socket.on('movePlayer', function(data) {

    // console.log(data)

    if (data.player === "red") {
      switch(data.direction) {
          case "-x":
              redX -= moveVal
              break
          case "-y":
              redY -= moveVal
              break
          case "+x":
              redX += moveVal
              break
          case "+y":
              redY += moveVal
              break
      }
      // console.log(`Red New x-y : ${redX}-${redY}`)
    }

    else if (data.player === "blue") {
      switch(data.direction) {
          case "-x":
              blueX -= moveVal
              break
          case "-y":
              blueY -= moveVal
              break
          case "+x":
              blueX += moveVal
              break
          case "+y":
              blueY += moveVal
              break
      }
      // console.log(`Blue New x-y : ${blueX}-${blueY}`)
    }

    playerPositions()

  })



  //// LISTEN + EMIT : DISCONNECTIONS & RESETS ////
  socket.on('disconnect', () => {

      console.log(`\n\tUser Disconnected: ${socket.id}\n`)

      if (playerRed === socket.id || playerBlue === socket.id) {
          resetPlayers()
          gameReset()
      }

  })



})




// END ////////////////////////////////////////////////////////////////
