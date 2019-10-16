// // HTTP Portion
// var http = require('http');
// var fs = require('fs'); // Using the filesystem module
// var httpServer = http.createServer(requestHandler);
// var url = require('url');
//
// function requestHandler(req, res) {
//
// 	var parsedUrl = url.parse(req.url);
// 	console.log("The Request is: " + parsedUrl.pathname);
//
// 	// Read in the file they requested
//
// 	fs.readFile(__dirname + parsedUrl.pathname,
// 		// Callback function for reading
// 		function (err, data) {
// 			// if there is an error
// 			if (err) {
// 				res.writeHead(500);
// 				return res.end('Error loading ' + parsedUrl.pathname);
// 			}
// 			// Otherwise, send the data, the contents of the file
// 			res.writeHead(200);
// 			res.end(data);
//   		}
//   	);
// }
//
// // Call the createServer method, passing in an anonymous callback function that will be called when a request is made
// var httpServer = http.createServer(requestHandler);
//
// // Tell that server to listen on port 8080
// httpServer.listen(8081);

var https = require('https');
var fs = require('fs'); // Using the filesystem module
var url = require('url');

var options = {
  key: fs.readFileSync('my-key.pem'),
  cert: fs.readFileSync('my-cert.pem')
};

function handleIt(req, res) {
  var parsedUrl = url.parse(req.url);

  var path = parsedUrl.pathname;
  if (path == "/") {
    path = "index.html";
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
httpServer.listen(8081);

console.log('Server listening on port 8081');

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {

    console.log("We have a new client: " + socket.id);

    // When this user "send" from clientside javascript, we get a "message"
    // client side: socket.send("the message");  or socket.emit('message', "the message");
    socket.on('message',
      // Run this function when a message is sent
      function(data) {
        console.log("message: " + data);

        // Call "broadcast" to send it to all clients (except sender), this is equal to
        // socket.broadcast.emit('message', data);
        //socket.broadcast.send(data);

        // To all clients, on io.sockets instead
        io.sockets.emit('message', data);
      }
    );


    socket.on('image', function(data) {
      io.sockets.emit('image', data);
    });


    socket.on('position', function(data) {
      io.sockets.emit('position', data);
    });

    // When this user emits, client side: socket.emit('otherevent',some data);
    socket.on('otherevent', function(data) {
      // Data comes in as whatever was sent, including objects
      console.log("Received: 'otherevent' " + data);
    });


    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);
