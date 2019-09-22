const {
  exec
} = require('child_process');
const fs = require('fs');
const watchfile = '123';

console.log(`Watching for file changes on ${watchfile}`);

fs.watch(watchfile, (event, filename) => {
  if (filename) {
    // console.log(event, filename);
    console.log(`${filename} file Changed`);
    scpFile(filename)
  }
});

function scpFile(filename) {
  exec(`scp ${filename} root@198.211.97.177:/root/live_web/`,
    (error, stdout, stderr) => {

      if (error) {
        console.log(`There was an error ${error}`);
      }

      console.log(`The stdout is ${stdout}`);
      console.log(`The stderr is ${stderr}`);
    });
}





//fs working locally
// const fs = require('fs');
// // require('log-timestamp');
//
// const buttonPressesLogFile = './button-presses.log';
// const newfile = './public/test.html'
// console.log(`Watching for file changes on ${buttonPressesLogFile}`);
//
// fs.watch(buttonPressesLogFile, (event, filename) => {
//   if (filename) {
//     // console.log(event, filename);
//     console.log(`${filename} file Changed`);
//     readFil(filename)
//   }
// });
//
// function readFil(filename) {
//   fs.readFile(filename, function read(err, data) {
//     if (err) {
//       throw err;
//     }
//     console.log(data);
//     writeFil(data, newfile);
//   });
// }
//
// function writeFil(content, f) {
//   fs.writeFile(f, content, (err) => {
//     // throws an error, you could also catch it here
//     if (err) throw err;
//
//     // success case, the file was saved
//     console.log('file written!');
//   });
// }





// alerts when change file is saved
// const fs = require('fs');
// const buttonPressesLogFile = './button-presses.log';
//
// console.log(`Watching for file changes on ${buttonPressesLogFile}`);
//
// fs.watchFile(buttonPressesLogFile, (curr, prev) => {
//   console.log(`${buttonPressesLogFile} file Changed`);
// });


// var express = require('express')
// var app = express()
// var fs = require("fs");
// app.use(express.static('public'));

// app.get('/', function(req, res) {
//   var fileToSend = "index.html";
//   res.sendfile(fileToSend, {
//     root: '.'
//   }); // Files inside "downloads/p5" folder
// });
//
// app.listen(8000, function() {
//   console.log('Example app listening on port 8000!')
// })
//
// app.get('/getfiles', function(req, res) {
//   // res.send('Hello World!');
//   fs.readdir('.', function(err, items) {
//     // console.log(items);
//     res.send(items);
//     // for (var i=0; i<items.length; i++) {
//     //     console.log(items[i]);
//     // }
//   });
// });

//simple four line server
// var express = require('express');	        // include the express library
// var server = express();					          // create a server using express
// server.use('/',express.static('public')); // serve static files from /public
// server.listen(8080);                      // start the server