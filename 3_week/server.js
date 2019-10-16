//fs over remote server with add/del/rename and sync on first run capability
//node server.js ./public root@xxx.xxx.xxx.xxx live_web/week5
var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

const {
  exec
} = require('child_process');
const fs = require('fs');
// const watchdir = './public';
// const remote_server = 'root@xxx.xxx.xxx.xxx';
// const remote_dir = 'live_web/public/';
const watchdir = myArgs[0]; //arg 1
const remote_server = myArgs[1]; //arg 2
const remote_dir = myArgs[2]; //arg 3

let files_original;
let files_rename;
let mv_arg1, mv_arg2;
let everything = '*';

console.log(`Watching for file changes on ${watchdir}`);

fs.readdir(watchdir, function(err, items) {
  files_original = items;
  console.log('File list: ' + files_original);
  scpFile(everything)
});

fs.watch(watchdir, (event, filename) => {
  if (filename) {
    console.log(`${event}: ${filename}`);
    if (event == 'change') {
      scpFile(filename);
    } else if (event == 'rename') {
      fs.readdir(watchdir, function(err, items) {
        files_rename = items;
        // console.log(files_rename);
        if (files_original.length < files_rename.length) {
          //file added => scp
          for (file of files_rename) {
            console.log(file);
            if (!files_original.includes(file)) {
              scpFile(file);
            }
          }
        } else if (files_original.length > files_rename.length) {
          //file deleted => unlink
          for (file of files_original) {
            console.log(file);
            if (!files_rename.includes(file)) {
              delFile(file);
            }
          }
        } else if (files_original.length == files_rename.length) {
          //file renamed => scp + unlink
          for (file of files_original) {
            console.log(file);
            if (!files_rename.includes(file)) {
              mv_arg1 = file;
            }
          }

          for (file of files_rename) {
            console.log(file);
            if (!files_original.includes(file)) {
              mv_arg2 = file
            }
          }

          mvFile(mv_arg1, mv_arg2);
        }

        files_original = files_rename;
        console.log('updated file list: ' + files_original);
      });
    }
  }
});


function scpFile(filename) {
  exec(`scp ./${watchdir}/${filename} ${remote_server}:/root/${remote_dir}`,
    (error, stdout, stderr) => {

      if (error) {
        console.log(`There was an error ${error}`);
      } else {
        console.log('updated file sent');
      }

      // console.log(`The stdout is ${stdout}`);
      // console.log(`The stderr is ${stderr}`);
    });
}

function delFile(filename) {
  exec(`ssh root@198.211.97.177 "rm /root/live_web/public/${filename}"`,
    (error, stdout, stderr) => {

      if (error) {
        console.log(`There was an error ${error}`);
      } else {
        console.log('updated file sent');
      }
    });
}

function mvFile(mv1, mv2) {
  exec(`ssh root@198.211.97.177 "mv /root/live_web/public/${mv1} /root/live_web/public/${mv2}"`,
    (error, stdout, stderr) => {

      if (error) {
        console.log(`There was an error ${error}`);
      } else {
        console.log('updated file sent');
      }
    });
}


//fs over remote server - simple scp
// const {
//   exec
// } = require('child_process');
// const fs = require('fs');
// const watchfile = '123';
//
// console.log(`Watching for file changes on ${watchfile}`);
//
// fs.watch(watchfile, (event, filename) => {
//   if (filename) {
//     // console.log(event, filename);
//     console.log(`${filename} file Changed`);
//     scpFile(filename)
//   }
// });
//
// function scpFile(filename) {
//   exec(`scp ${filename} root@198.211.97.177:/root/live_web/`,
//     (error, stdout, stderr) => {
//
//       if (error) {
//         console.log(`There was an error ${error}`);
//       }
//
//       console.log(`The stdout is ${stdout}`);
//       console.log(`The stderr is ${stderr}`);
//     });
// }




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