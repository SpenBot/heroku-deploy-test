
//// DEPENDENCIES, MODULES, CONFIGURATIONS ////////////////////////////
///////////////////////////////////////////////////////////////////////

const express = require('express')
const app = express()

const socket = require('socket.io')
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

server.listen(process.env.PORT || 4000, () => {
    console.log("\n\tServer listening on port.\n")
})

app.get("/", (req, res) => {
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

const startRedX = 1
const startRedY = 9
const startBlueX = 31
const startBlueY = 9

const startAppleX = 16
const startAppleY = 9

// const startRedX = 30
// const startRedY = ( (canvasHeight / 2) - 10 )
// const startBlueX = (canvasWidth - 50)
// const startBlueY = ( (canvasHeight / 2) - 10 )

let redX = startRedX
let redY = startRedY
let blueX = startBlueX
let blueY = startBlueY

let appleX = startAppleX
let appleY = startAppleY

const moveVal = 1

const tileCountX = 32
const tileCountY = 19

let redScore = 0
let blueScore = 0




/////////////// EMIT : GAME RESET /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function gameReset () {

    redX = startRedX
    redY = startRedY
    blueX = startBlueX
    blueY = startBlueY

    appleX = startAppleX
    appleY = startAppleY

    playerPositions()
    applePosition()
    resetScore()

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



/////////////// EMIT : APPLE POSITION /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function applePosition () {

    io.sockets.emit('applePosition', {
      appleX: appleX,
      appleY: appleY
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




/////////////// CHECK APPLE COLLISION /////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function checkAppleCol (player) {

    let playerX
    let playerY

    if (player === "red") {
      playerX = redX
      playerY = redY
    }
    else if (player === "blue") {
      playerX = blueX
      playerY = blueY
    }

    if (playerX === appleX && playerY === appleY) {

        addScore(player)

        appleX = Math.floor( Math.random() * (tileCountX - 2)) + 1
        appleY = Math.floor( Math.random() * (tileCountY - 2)) + 1

        console.log(`new apple position: ${appleX}-${appleY}`)

        applePosition()
    }

}

/////////////// PLAYER COLLIDE ////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function playerCollide () {
    io.sockets.emit('playerCollision', {
      collide: true
    })
}





/////////////// ADD SCORE /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function addScore(player) {

    if (player === "red") {
      redScore += 10
    }
    else if (player === "blue") {
      blueScore += 10
    }

    io.sockets.emit('addScore', {
      redScore: redScore,
      blueScore: blueScore
    })

}



/////////////// RESET SCORE /////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function resetScore () {

    redScore = 0
    blueScore = 0

    io.sockets.emit('addScore', {
      redScore: 0,
      blueScore: 0
    })

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

  //// EMIT [ ON CONNECTION ] : APPLE POSITION ////
  applePosition()

  //// EMIT [ ON CONNECTION ] : PLAYERS CHOSEN ////
  playersChosen()

  //// LISTEN : CONFIRM SOCKET ////
  socket.on('confirmSocket', () => {

      socket.emit('socketConfirm', {
        socket: true
      })

  })

  //// LISTEN + EMIT : PLAYER SELECTION ////
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

        let newRedX = redX
        let newRedY = redY

        switch(data.direction) {
            case "-x":
                newRedX = redX - moveVal
                break
            case "-y":
                newRedY = redY - moveVal
                break
            case "+x":
                newRedX = redX + moveVal
                break
            case "+y":
                newRedY = redY + moveVal
                break
          }

          if (newRedX === blueX && newRedY === blueY) {
              playerCollide()
          }
          else if (newRedX < 0 || newRedY < 0 || newRedX > tileCountX || newRedY >= tileCountY) {
              playerCollide()
          }
          else {
              redX = newRedX
              redY = newRedY
          }

          // console.log(`Red New x-y : ${redX}-${redY}`)
    }

    else if (data.player === "blue") {

          let newBlueX = blueX
          let newBlueY = blueY

          switch(data.direction) {
              case "-x":
                  newBlueX = blueX - moveVal
                  break
              case "-y":
                  newBlueY = blueY - moveVal
                  break
              case "+x":
                  newBlueX = blueX + moveVal
                  break
              case "+y":
                  newBlueY = blueY + moveVal
                  break
          }

          if (newBlueX === redX && newBlueY === redY) {
              playerCollide()
          }
          else if (newBlueX < 0 || newBlueY < 0 || newBlueX > tileCountX || newBlueY >= tileCountY) {
              playerCollide()
          }
          else {
              blueX = newBlueX
              blueY = newBlueY
          }

          // console.log(`Blue New x-y : ${blueX}-${blueY}`)
    }

    playerPositions()
    checkAppleCol(data.player)

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
