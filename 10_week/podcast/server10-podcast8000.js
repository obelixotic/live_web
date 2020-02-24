// // HTTP Portion
// var http = require('http');
// var fs = require('fs'); // Using the filesystem module
// var httpServer = http.createServer(requestHandler);
// var url = require('url');
//
// function requestHandler(req, res) {
//
//   var parsedUrl = url.parse(req.url);
//   console.log("The Request is: " + parsedUrl.pathname);
//
//   // Read in the file they requested
//
//   fs.readFile(__dirname + parsedUrl.pathname,
//     // Callback function for reading
//     function(err, data) {
//       // if there is an error
//       if (err) {
//         res.writeHead(500);
//         return res.end('Error loading ' + parsedUrl.pathname);
//       }
//       // Otherwise, send the data, the contents of the file
//       res.writeHead(200);
//       res.end(data);
//     }
//   );
// }
//
// // Call the createServer method, passing in an anonymous callback function that will be called when a request is made
// var httpServer = http.createServer(requestHandler);
//
// // Tell that server to listen on port 8000
// httpServer.listen(8000);

var https = require('https');
var fs = require('fs'); // Using the filesystem module
var url = require('url');

var socket_ids = [];
var peer_ids = [];

var options = {
    key: fs.readFileSync('my-key.pem'),
    cert: fs.readFileSync('my-cert.pem')
};

function handleIt(req, res) {
    var parsedUrl = url.parse(req.url);

    var path = parsedUrl.pathname;
    if (path == "/avakya") {
        path = "/index.html";
    }

    fs.readFile(__dirname + path,

        // Callback function for reading
        function(err, fileContents) {
            // if there is an error
            if (err) {
                res.writeHead(500);
                return res.end('Error loading ' + req.url);
            }
            // Otherwise, send the data, the contents of the file
            res.writeHead(200);
            res.end(fileContents);
        }
    );

    // Send a log message to the console
    console.log("Got a request " + req.url);
}

var httpServer = https.createServer(options, handleIt);
httpServer.listen(443);

console.log('Server listening on port 8000');

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

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

        socket.on('enable_screen', function() {
            console.log('screenShare recd and sending...');
            socket.broadcast.emit('enable_screen');
        });

        socket.on('disable_screen', function() {
            console.log('disabling screen share stream...');
            socket.broadcast.emit('disable_screen');
        });

        socket.on('enable_audio', function() {
            console.log('audioShare recd and sending...');
            socket.broadcast.emit('enable_audio');
        });

        socket.on('disable_audio', function() {
            console.log('disabling audio stream...');
            socket.broadcast.emit('disable_audio');
        });

        socket.on('enable_video', function() {
            console.log('videoShare recd and sending...');
            socket.broadcast.emit('enable_video');
        });

        socket.on('disable_video', function() {
            console.log('disabling video stream...');
            socket.broadcast.emit('disable_video');
        });

        socket.on('enable_note', function() {
            console.log('noteShare recd and sending...');
            socket.broadcast.emit('enable_note');
        });

        socket.on('disable_note', function() {
            console.log('disabling notebook...');
            socket.broadcast.emit('disable_note');
        });

        socket.on('drawmouse', function(data) {
            // console.log("Received: " + data.x + " " + data.y);			
            socket.broadcast.emit('drawmouse', data);
        });


        socket.on('closeStream', function() {
            console.log('closeStream recd and sending...');
            socket.broadcast.emit('closeStream');
        });

        socket.on('calling', function() {
            console.log("calling...");
            socket.broadcast.emit('calling');
        });

        socket.on('answered', function() {
            console.log("call answered");
            socket.broadcast.emit('answered');
        });

        socket.on('hangup', function() {
            console.log("hanging up...");
            socket.broadcast.emit('hangup');
        });

        socket.on('disconnect', function() {
            console.log("Client has disconnected: " + socket.id);
        });
    }
);