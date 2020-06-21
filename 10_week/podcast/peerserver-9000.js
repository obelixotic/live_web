var fs = require('fs');
var PeerServer = require('peer').PeerServer;

var server = PeerServer({
    port: 9000,
    ssl: {
        key: fs.readFileSync('my-key.pem'),
        cert: fs.readFileSync('my-cert.pem')
    }
});

// console.log(server);
console.log("listening on port: 9000");