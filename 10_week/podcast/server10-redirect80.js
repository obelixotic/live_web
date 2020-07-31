var express = require('express');
var server = express();
var port = 80;

server.use(express.static('.'));
server.listen(80);
console.log("listening on port 80 for redirection to port 444")

server.get('/avakya', (req, res) => {
    res.redirect('https://tg1799.itp.io:444/avakya');
});