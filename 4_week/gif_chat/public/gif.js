let gif = [];
let socket = io.connect();
let start = null;
let index = 0;
let latest;
let row = -1;

//FROM PREVIOUS SKETCH FOR SOCKET ROOMS + USERNAME
let otherUser = '';
let inputText;

//listen for event 'connect'
socket.on('connect', function() {
  console.log("Connected");
});

//listen for position
socket.on('position', function(data) {
  //console.log(data);
});

//receive from any event
socket.on('news', function(data) {
  console.log(data);
});

//recieve 'connectedUsername' data if partner is connected
socket.on('connectedUsername', function(user) {
  otherUser = user;
  console.log('connected to: ' + otherUser);
  // removeElements();
  displayUsername(`You're connected to ${otherUser}`);
});

socket.on('leave room', function() {
  console.log('(they left...)');
  displayUsername('(they left...)');
});

// GIF
socket.on('image', function(imageData) {
  //incoming image..
  console.log("image recd");
  // console.log("imageData.image: " + imageData.image);
  latest = 0;
  latest = imageData.image;
  displayFrames(latest);

  window.requestAnimationFrame(step);

  function step(timestamp) {
    //console.log("entered function, index: " + index);
    if (!start) start = timestamp;
    let progress = timestamp - start;

    //console.log("progress: " + progress);

    //if progress is greater than 0 than change otherimg.src to be the latest
    if (progress > 200 * index) {
      console.log('index: ' + index);
      // console.log('latest index: ' + latest[index]);
      document.getElementById('otherimage').src = latest[index];

      if (index < latest.length) {
        index++;
      } else if (index == latest.length) {
        index = 0;
        start = timestamp;
      }
    }
    window.requestAnimationFrame(step);
  }
});

function displayFrames(e) {
  row++;
  let frames = e;
  for (i = 0; i < 10; i++) {
    let newElem = document.createElement(`frame_${i}_row_${row}`)
    document.body.appendChild(newElem);
  }
}

// DISPLAY USERNAME
function displayUsername(data) {
  // removeElements();
  document.getElementById('usernameText').innerHTML = data;
}

// function displayImage(data) {
// removeElements();
// document.getElementById('partner-canvas').innerHTML = data;
// }


////////////  ONCE PG LOADED  //////////////
window.addEventListener('load', function() {

  //SOCKET ROOM CONNECTION

  //USERNAME
  username = document.getElementById('username');
  username.addEventListener('keypress', keyPressedUser);

  socket.on('connectedUsername', function(user) {
    otherUser = user;
    console.log('connected to: ' + otherUser);
    // removeElements();
    displayUsername(`You're connected to ${otherUser}`);
  });

  function keyPressedUser(e) {
    // console.log(e);
    if (e.keyCode == 13) {
      console.log('my username: ' + username.value);
      let myUsername = username.value;
      socket.emit('username', myUsername);

      inputText = document.getElementById('inputText');
      inputText.style.visibility = "visible";
      inputText.innerHTML = myUsername;
    }
  }

  //constrains - what do we want?
  let constraints = {
    audio: true,
    video: true
  }

  //promp the user for permission to get the stream
  navigator.mediaDevices.getUserMedia(constraints)
    .then(function(stream) {

      //attach to our video object
      video.srcObject = stream;

      //wait for the stream to load enough to play
      video.onloadedmetadata = function(e) {
        video.play();
      };
    })

    .catch(function(err) {
      /* handle the error */
      alert(err);
    });

  ///////////// VIDEO + DOM SECTION //////////

  //the video element on the page to display the webcam
  let video = document.getElementById('myvideo');

  let usernameText = document.getElementById('usernameText')
  let playBttn = document.getElementById('playbttn');
  let photoBttn = document.getElementById('photobttn');
  let canvas = document.getElementById('mycanvas');
  let context = canvas.getContext('2d');


  context.fillStyle = "#FF000";
  context.fillRect(0, 0, canvas.width, canvas.height);


  photoBttn.addEventListener('click', function(e) {
    for (i = 0; i < 10; i++) {
      setTimeout(function() {
        context.drawImage(video, 10, 10);
        gif.push(canvas.toDataURL("image/jpeg"));
      }, 200 * i);
    }
    // context.drawImage(video, 10, 10);
    //console.log(canvas.toDataURL("image/jpeg"));
    // gif.push(canvas.toDataURL("image/jpeg"));
  });

  playBttn.addEventListener('click', function(e) {
    // document.getElementsById('myvideo').src = context;
    // console.log("gif:" + gif);
    let v = {
      image: gif
    }
    displayFrames(gif);
    console.log(v);
    socket.emit('image', v);
    // console.log(gif[0]);
    //v returns array of images
    gif = [];
  });


  // Listen for img from partners
  // socket.on('img', function(data) {
  //   displayImage(data);
  // });

});



///////////////* DUMPSTER CODE *///////////////
/* FROM SHAWN EX
var sendmessage = function () {
    var message = document.getElementById('message').value;
    console.log("Sending: " + message);

    // Send a messaage
    socket.send(message);
};

var sendother = function () {
    var othermessage = document.getElementById('message').value;
    console.log("sending: " + othermessage);

    // Send any kind of data with a custom event
    //socket.emit('otherevent',{ othermessage: othermessage });
    socket.emit('otherevent', othermessage);
};
*/


/* FROM SHAWN EX
//listen for a message
socket.on('message', function (data) {
    console.log("Got: " + data);
    document.getElementById('messages').innerHTML += data;
});
*/