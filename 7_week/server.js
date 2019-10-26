// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');
httpServer.listen(8080);

console.log("listening on port 8080");

function requestHandler(req, res) {

  var parsedUrl = url.parse(req.url);
  console.log("The Request is: " + parsedUrl.pathname);

  fs.readFile(__dirname + parsedUrl.pathname,
    // Callback function for reading
    function(err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + parsedUrl.pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200);
      res.end(data);
    }
  );
  /*
  res.writeHead(200);
  res.end("Life is wonderful");
  */
}

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);
// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', function(socket) {
  console.log("We have a new client: " + socket.id);

  socket.on('imagedata', function(theData) {
    var searchFor = 'date:image/jpeg;base64,';
    var strippedImage = theData.slice(theData.indexOf(searchFor) + searchFor.length);
    var binaryImage = new Buffer(strippedImage, 'base64');
    fs.writeFile(__dirname + '/image_' + Date.now() + '.jpg', theData, function(err) {
      if (err) throw (err);
      console.log("saved image!");
    })
  });

  socket.on('disconnect', function() {
    console.log("Client has disconnected " + socket.id);
  });
});