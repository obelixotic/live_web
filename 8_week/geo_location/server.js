// Database to store data
var Datastore = require('nedb');
var db_itp = new Datastore({filename: "data_itp.db", autoload: true});
var db_home = new Datastore({filename: "data_home.db", autoload: true});

// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
var url = require('url');

function requestHandler(req, res) {

  var parsedUrl = url.parse(req.url);
  console.log("The Request is: " + parsedUrl.pathname);

  // Read in the file they requested

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
}

// Call the createServer method, passing in an anonymous callback function that will be called when a request is made
var httpServer = http.createServer(requestHandler);

// Tell that server to listen on port 8080
httpServer.listen(8080);

console.log("listening on port 8080");

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 

	function (socket) {
		console.log("We have a new client: " + socket.id);

		socket.on('history_itp', function() {
			console.log("history itp event recd")
			// let items = [];
			db_itp.find({}, function(err, list) {
				socket.emit('showList', list);
				console.log(list);
			});
		});

		socket.on('history_home', function() {
			console.log("history home event recd")
			// let items = [];
			db_home.find({}, function(err, list) {
				socket.emit('showList', list);
				console.log(list);
			});
		});

		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);
