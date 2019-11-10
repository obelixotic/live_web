// Database to store data
var Datastore = require('nedb');
var db = new Datastore({filename: "data.db", autoload: true});

// HTTP Portion
var http = require('http');
var fs = require('fs'); // Using the filesystem module
var httpServer = http.createServer(requestHandler);
httpServer.listen(8089);

function requestHandler(req, res) {
	// Read index.html
	fs.readFile(__dirname + '/index.html', 
		// Callback function for reading
		function (err, data) {
			// if there is an error
			if (err) {
				res.writeHead(500);
				return res.end('Error loading index.html');
			}
			// Otherwise, send the data, the contents of the file
			res.writeHead(200);
			res.end(data);
  		}
  	);
}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection', 
	// We are given a websocket object in our function
	function (socket) {
	
		console.log("We have a new client: " + socket.id);
		
		// When this user emits, client side: socket.emit('otherevent',some data);
		socket.on('chatmessage', function(data) {

			// Data comes in as whatever was sent, including objects
			console.log("Received: 'chatmessage' " + data);

			// Create the JavaScript Object
			var datatosave = {
				socketid: socket.id,
				message: data
			}
		
			// Insert the data into the database
			db.insert(datatosave, function (err, newDocs) {
				console.log("err: " + err);
				console.log("newDocs: " + newDocs);
			});
			
			// Send it to all of the clients
			io.sockets.emit('chatmessage',data);
		});

		// When the history is requested, find all of the docs in the database
		socket.on('history', function() {
			db.find({}, function(err, docs) {
				// Loop through the results, send each one as if it were a new chat message
				for (var i = 0; i < docs.length; i++) {
					socket.emit('chatmessage', docs[i].message);
				}
			})
		});

		socket.on('disconnect', function() {
			console.log("Client has disconnected " + socket.id);
		});
	}
);
