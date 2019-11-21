// Database to store data
var Datastore = require('nedb');
var db_itp = new Datastore({filename: "data_itp.db", autoload: true});
var db_home = new Datastore({filename: "data_home.db", autoload: true});

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
httpServer.listen(8080);

console.log('Server listening on port 8080');

if(db_home && db_itp){
  console.log("databses inititialized");
} else {
  console.log("error inititializing databses");
}

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
