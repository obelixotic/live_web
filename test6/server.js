//create Server
let port = process.env.PORT || 8080;
var express = require('express');
var fs = require('fs');
var server = require('https');
var app = express();

// app.get('/', function(req, res) {
//   res.sendFile(__dirname + '/index.html');
// });

server.createServer({
    key: fs.readFileSync('my-key.pem'),
    cert: fs.readFileSync('my-cert.pem')
  }, app)
  .listen(port, function() {
    console.log('Server listening at port: ', port);
  });

// Tell server where to look for files
app.use(express.static('.'));

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {

    console.log("We have a new client: " + socket.id);
    socket_ids.push(socket.id);

    socket.on('message', function(data) {
      console.log("message: " + data);
      socket.broadcast.emit('message', data);
    });

    socket.on('position', function(data) {
      socket.broadcast.emit('position', data);
    });

    socket.on('stopMouse', function(data) {
      socket.broadcast.emit('stopMouse', data);
    });

    socket.on('peer_id', function(data) {
      console.log("Received: peer_id " + data);
      peer_ids.push(data);
      if (peer_ids.length > 2) {
        peer_ids.shift();
      }
      io.sockets.emit('peer_ids', peer_ids);
      // console.log(peer_ids);
    });

    socket.on('screenShare', function() {
      console.log('screenShare recd and sending...');
      socket.broadcast.emit('screenShare');
    });

    socket.on('audioShare', function() {
      console.log('audioShare recd and sending...');
      socket.broadcast.emit('audioShare');
    });

    socket.on('videoShare', function() {
      console.log('videoShare recd and sending...');
      socket.broadcast.emit('videoShare');
    });

    socket.on('closeStream', function() {
      console.log('closeStream recd and sending...');
      socket.broadcast.emit('closeStream');
    });

    socket.on('tring', function() {
      console.log("calling...");
      socket.broadcast.emit('tring');
    });

    socket.on('answered', function() {
      console.log("call answered");
      socket.broadcast.emit('answered');
    });

    socket.on('hangup', function(data) {
      console.log("disconnecting...");
      let da = 0;
      socket.emit('hangup', da);
      socket.broadcast.emit('hangup', da);
    });

    socket.on('disconnect', function() {
      console.log("Client has disconnected: " + socket.id);
    });
  }
);