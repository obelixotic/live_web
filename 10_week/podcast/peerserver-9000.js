var fs = require('fs');
var PeerServer = require('peer').PeerServer;

var server = PeerServer({
    port: 9000,
    ssl: {
        key: fs.readFileSync('/etc/letsencrypt/live/tg1799.itp.io/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/tg1799.itp.io/fullchain.pem')
    }
});

// console.log(server);
console.log("listening on port: 9000");