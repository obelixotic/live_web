var audio = new Audio('phone_message.wav');
var ping = new Audio('ping.wav');
var pop = new Audio('pop.wav');
var callinprogress = false;
var socket = io.connect();
var partner_peer_id = null;
var peer_id = null;
var peer = new Peer({
  host: 'liveweb-new.itp.io',
  port: 9000,
  path: '/'
});
var call1 = null;
var call2 = null;
var call3 = null;

var canvas;
var context;
var px = 0;
var py = 0;
var opx = 0;
var opy = 0;

var mouseIsPressed = false;

var audio_enabled = false;
var video_enabled = false;
var screen_enabled = false;
var note_enabled = false;

socket.on('connect', function() {
  console.log("Connected");
});

socket.on('calling', function() {
  console.log("calling event received");
  audio.play();
  setInterval(function() {
    if (!callinprogress && document.getElementById('answer_button').style.display == "block") {
      audio.play();
      console.log("incoming!");
    }
  }, 3000);
  document.getElementById('call_button').style.display = "none";
  document.getElementById('answer_button').style.display = "block";
  document.getElementById('hangup_button').style.display = "block";
});

socket.on('hangup', function() {
  console.log("hang up event recd");
  hangUp();
});

socket.on('answered', function() {
  callinprogress = true;
  audio.pause();
  console.log("peer answered");
  audioShare();
  // socket.emit('audioShare');
  document.getElementById("screen_button").style.display = "inline";
  document.getElementById("audio_button").style.display = "inline";
  document.getElementById("video_button").style.display = "inline";
  document.getElementById("note_button").style.display = "inline";
  document.getElementById("buttonwrapper").style.display = "inline";
  document.getElementById("hangup_button").style.display = "inline";
  document.getElementById("hangup_button").style.margin = "0% auto 20px";
  document.getElementById('answer_button').style.display = "none";
  document.getElementById("call_button").style.display = "none";
  document.getElementById("partner_peer_id").style.display = "none";
  document.getElementById("my_peer_id").style.display = "none";
});

// socket.on('position', function(pos) {
//   let m = document.getElementById("mouse");
//   m.style.display = "inline";
//   if (m.src != "mouse.png") {
//     m.src = "mouse.png";
//   }
//   m.style.top = pos.y - 50 + 'px';
//   m.style.left = pos.x - 50 + 'px';
// });

// socket.on('stopMouse', function() {
//   document.getElementById("mouse").style.display = "none";
// });

socket.on('message', function(data) {
  console.log("Got: " + data);
  let m = document.createElement('div');
  m.setAttribute("class", "otherMessages");
  m.innerHTML += data + "<br>";
  document.getElementById('messages').appendChild(m);
  ping.volume = 0.1;
  ping.play();
});

socket.on('enable_screen', function() {
  // alert("hi, please double click on the screen picture you will see once you click ok. This will allow your peer to share his screen with you");
  enable_screen_peer();
});

socket.on('disable_screen', function() {
  disable_screen();
});

socket.on('enable_audio', function() {
  enable_audio();
  // console.log("Sharing audio in response");
  document.getElementById("screen_button").style.display = "inline";
  document.getElementById("audio_button").style.display = "inline";
  document.getElementById("video_button").style.display = "inline";
  document.getElementById("note_button").style.display = "inline";
  // document.getElementById("close_button").style.display = "inline";
  // document.getElementById("start_button").style.display = "inline";
});

socket.on('disable_audio', function() {
  disable_audio();
});

socket.on('enable_video', function() {
  enable_video();
});

socket.on('disable_video', function() {
  disable_video();

});

socket.on('enable_note', function() {
  enable_note();
  document.getElementById('mycanvas').style.display = "inline";
  initcanvas();
});

socket.on('disable_note', function() {
  disable_note();
});


socket.on('drawmouse', function (data) {
  // console.log(data.x + " " + data.y);
  odraw(data.x,data.y,data.m);
});

socket.on('closeStream', function() {
  closeStream2();
  // enable_screen();
});


socket.on('peer_ids', function(data) {
  console.log(data);
  if (peer_id == data[data.length - 1]) {
    partner_peer_id = data[data.length - 2]
  } else {
    partner_peer_id = data[data.length - 1]
  }
  console.log("default partner peer id: " + partner_peer_id);
  let m = document.getElementById('partner_peer_id');
  m.value = partner_peer_id;
  enter_peer_id();
});

function enter_peer_id(){
  let m = document.getElementById('partner_peer_id');
  if (m.value.length == 16 && m.value != peer_id){
    partner_peer_id = m.value;
    console.log("Entered partner peer id: " + partner_peer_id);
  }
}

let peer_stream = null; //peer.on('call', ()=>{})
let my_stream1 = null; //screen
let my_stream2 = null; //audio
let my_stream3 = null; //video

let constraints1 = { //screen
  audio: false,
  video: true
}

let constraints2 = { //audio
  audio: true,
  video: false
}

let constraints3 = { //video
  audio: false,
  video: {
    width: 600,
    height: 400
  }
}

window.addEventListener('load', function() {

  navigator.mediaDevices.getUserMedia(constraints2).then(function(stream2) {
      var videoElement2 = document.getElementById('myaudio');
      videoElement2.srcObject = stream2;
      my_stream2 = stream2;
    })
    .catch(function(err) {
      alert(err);
    });

  navigator.mediaDevices.getUserMedia(constraints3).then(function(stream3) {
      var videoElement3 = document.getElementById('myvideo');
      videoElement3.srcObject = stream3;
      my_stream3 = stream3;
    })
    .catch(function(err) {
      alert(err);
    });

  // navigator.mediaDevices.getDisplayMedia(constraints1).then(function(stream1) {
  //     var videoElement1 = document.getElementById('myscreen');
  //     videoElement1.srcObject = stream1;
  //     my_stream1 = stream1;
  //     console.log("a");
  //   })
  //   .catch(function(err) {
  //     alert(err);
  //   });

  let t = document.getElementById("message");
  t.addEventListener('keypress', function(e) {
    if (e.keyCode == 13) {
      sendmessage();
      t.value = "";
    }
  });

});

// Get an ID from the PeerJS server
peer.on('open', function(id) {
  console.log('My peer ID is: ' + id);
  peer_id = id;
  socket.emit('peer_id', peer_id)
  document.getElementById('my_peer_id').innerHTML = "My ID: " + id;
});

peer.on('error', function(err) {
  console.log(err);
});

peer.on('call', function(incoming_call) {
  incoming_call.answer(peer_stream);
});

peer.on('close', function() {
  console.log("close!!!");
});

var sendmessage = function() {
  var message = document.getElementById('message').value;
  console.log("Sending: " + message);
  let m = document.createElement('div');
  m.setAttribute("class", "myMessages");
  m.innerHTML += message + "<br>";
  document.getElementById('messages').appendChild(m);
  let t = document.getElementById("message");
  t.value = "";
  socket.send(message);
  pop.volume = 0.3;
  pop.play();
};

// //SCREEN SHARE // //

function screenShare() {
  if (screen_enabled == false) {
    disable_video();
    socket.emit('disable_video');
    disable_note();
    socket.emit('disable_note');

    enable_screen();
    setTimeout(()=>{document.getElementById('log').style.display = "inline";},2500);
    socket.emit('enable_screen');
    console.log("enabling screen");
  } else {
    document.getElementById('log').style.display = "none";
    disable_screen();
    socket.emit('disable_screen');
    console.log("disabling screen");
  }
}

function enable_screen() {
  screen_enabled = true;
  disable_screen_button();
  navigator.mediaDevices.getDisplayMedia(constraints1).then(function(stream1) {
      var videoElement1 = document.getElementById('myscreen');
      videoElement1.srcObject = stream1;
      my_stream1 = stream1;
      console.log("a");
    })
    .then(function() {
      peer_stream = my_stream1;
      call1 = peer.call(partner_peer_id, my_stream1);
      call1.on('stream', function(remoteStream) {});
      console.log("b");
    })
    .catch(function(err) {
      alert(err);
    });
}

function enable_screen_peer() {
  screen_enabled = true;
  disable_screen_button();
  navigator.mediaDevices.getDisplayMedia(constraints1).then(function(stream1) {
      var videoElement1 = document.getElementById('myscreen');
      videoElement1.srcObject = stream1;
      my_stream1 = stream1;
    })
    .then(function() {
      let e = document.getElementById("remoteScreen");
      peer_stream = my_stream1;
      call1 = peer.call(partner_peer_id, my_stream1);
      call1.on('stream', function(remoteStream) {
        if (e == null) {
          var screenVideoElement = document.createElement('video');
          let div = document.getElementById("mediadiv");
          screenVideoElement.srcObject = remoteStream;
          screenVideoElement.id = "remoteScreen";
          screenVideoElement.setAttribute("autoplay", "true");
          screenVideoElement.play();
          div.appendChild(screenVideoElement);
          console.log("element created");
        }
        // document.getElementById("start_button").style.display = "inline";
        document.getElementsByClassName("right")[0].style.display = "none";
        document.getElementById("messages").style.visibility = "hidden";
        document.getElementById("chatbox").style.visibility = "hidden";
      });
    })
    .catch(function(err) {
      alert(err);
    });
  // screenBeingShared = true;
}

function disable_screen() {
  screen_enabled = false;
  let l = document.getElementById('log')
  if (l.style.display != "none"){
    l.style.display = "none";
  };
  enable_screen_button();
  peer_stream = null;
  if (call1) {
    call1.close();
    call1 = null;
  }
  let r = document.getElementById("remoteScreen");
  // console.log(r);
  if (r) {
    r.parentNode.removeChild(r);
    document.getElementsByClassName("right")[0].style.display = "inline";
    document.getElementById("messages").style.visibility = "visible";
    document.getElementById("chatbox").style.visibility = "visible";
  }
  console.log("screen share disabled");
}

// //AUDIO SHARE // //

function audioShare() {
  if (audio_enabled == false) {
    enable_audio();
    socket.emit('enable_audio');
    console.log("enabling audio");
  } else {
    disable_audio();
    socket.emit('disable_audio');
    console.log("disabling audio");
  }
}

function enable_audio() {
  audio_enabled = true;
  disable_audio_button();
  peer_stream = my_stream2;
  let e = document.getElementById("remoteAudio");
  call2 = peer.call(partner_peer_id, my_stream2);
  call2.on('stream', function(remoteStream) {
    console.log("Got remote stream");
    if (!e) {
      var audioVideoElement = document.createElement('video');
      audioVideoElement.srcObject = remoteStream;
      audioVideoElement.id = "remoteAudio";
      audioVideoElement.setAttribute("autoplay", "true");
      audioVideoElement.play();
      document.body.appendChild(audioVideoElement);
    }
  });
}

function disable_audio() {
  audio_enabled = false;
  peer_stream = null;
  if (call2) {
    call2.close();
    call2 = null;
    let r = document.getElementById("remoteAudio");
    if (r) {
      r.parentNode.removeChild(r);
    }
  }
  console.log("audio disabled");
  enable_audio_button();
}


// //VIDEO SHARE // //

function videoShare() {
  if (video_enabled == false) {
    disable_screen();
    socket.emit('disable_screen');
    disable_note();
    socket.emit('disable_note');

    enable_video();
    socket.emit('enable_video');
    console.log("enabling video");
  } else {
    disable_video();
    socket.emit('disable_video');
    console.log("disabling video");
  }
}

function enable_video() {
  // if (screenBeingShared) {
  //   stopMouseShare();
  //   screenShare(); //to turn it off
  // }
  video_enabled = true;
  disable_video_button();
  peer_stream = my_stream3;
  let e = document.getElementById("remoteVideo");
  call3 = peer.call(partner_peer_id, my_stream3);
  call3.on('stream', function(remoteStream) {
    console.log("Got remote stream");
    if (!e) {
      var videoVideoElement = document.createElement('video');
      let div = document.getElementById("mediadiv");
      videoVideoElement.srcObject = remoteStream;
      videoVideoElement.id = "remoteVideo";
      videoVideoElement.controls = true;
      videoVideoElement.setAttribute("autoplay", "true");
      videoVideoElement.play();
      div.appendChild(videoVideoElement);
    }

    videoVideoElement.addEventListener('click', function() {
      console.log("clicked!");
      if (document.getElementById('myvideo').style["margin-left"] != "0%") {
        document.getElementById('myvideo').style["margin-left"] = "0%";
        console.log("moved left");
      } else if (document.getElementById('myvideo').style["margin-left"] == "0%") {
        document.getElementById('myvideo').style["margin-left"] = "53.4%";
        console.log("moved right");
      }
    });
  });

  let myvid = document.getElementById("myvideo");
  myvid.style.display = "inline";
  myvid.srcObject = peer_stream;
  myvid.setAttribute("autoplay", "true");
  myvid.play();
}

function disable_video() {
  video_enabled = false;
  peer_stream = null;
  if (call3) {
    call3.close();
    call3 = null;
    let r = document.getElementById("remoteVideo");
    if (r) {
      r.parentNode.removeChild(r);
    }
  }
  let m = document.getElementById("myvideo");
  if(m){
    m.style.display = "none";
  }
  console.log("video disabled");
  enable_video_button();
}

// //NOTES SHARE // //

function noteShare() {
  if (note_enabled == false) {
    disable_video();
    socket.emit('disable_video');
    disable_screen();
    socket.emit('disable_screen');

    enable_note();
    socket.emit('enable_note');
    console.log("enabling notebook");
  } else {
    disable_note();
    socket.emit('disable_note');
    console.log("disabling notebook");
  }
}

function enable_note() {
  note_enabled = true;
  document.getElementById('mycanvas').style.display = "inline";
  initcanvas();
  disable_note_button();
}

function disable_note() {
  note_enabled = false;
  document.getElementById('mycanvas').style.display = "none";
  enable_note_button();
}

var initcanvas = function() {
  canvas = document.getElementById('mycanvas');
  context = canvas.getContext('2d');

  // context.fillStyle="#FFFFFF";
  context.clearRect(0,0,canvas.width,canvas.height);
  // context.fillRect(0,0,canvas.width,canvas.height);	
  
  canvas.addEventListener('mousedown', function(evt){
    // console.log(evt);
    mouseIsPressed = true;
  });

  canvas.addEventListener('mouseup', function(evt){
    // console.log(evt);
    mouseIsPressed = false;
  });

  canvas.addEventListener('mousemove', function(evt) {
    // console.log("mousemove " + evt.clientX + " " + evt.clientY);
    // Get the canvas bounding rect
    var canvasRect = canvas.getBoundingClientRect(); 
    // Now calculate the mouse position values
    y = evt.clientY - canvasRect.top; // minus the starting point of the canvas rect
    x = evt.clientX - canvasRect.left;  // minus the starting point of the canvas rect on the x axis
    // console.log("mousemove x:" + x + " y:" + y);
    sendmouse(x,y,mouseIsPressed);
    draw(x,y);
  }, false);				
};

var draw = function(xval,yval) {
  if(mouseIsPressed){
    // console.log("draw " + xval + " " + yval);
    context.beginPath();
    context.strokeStyle='#000000';
    context.moveTo(px,py);
    context.lineTo(xval,yval);
    context.stroke();
  }
  px = xval;
  py = yval;
};

var odraw = function(xval,yval,mouseState) {
  if(mouseState){
  // console.log("draw " + xval + " " + yval + " " + mouseState);
  context.beginPath();
  context.strokeStyle='#0000FF';
  context.moveTo(opx,opy);
  context.lineTo(xval,yval);
  context.stroke();
  }
  opx = xval;
  opy = yval;
};

var sendmouse = function(xval, yval,mouseState) {
  // console.log("sendmouse: " + xval + " " + yval);
    socket.emit('drawmouse',{ x: xval, y: yval, m: mouseState});
};

function makeCall() {
  socket.emit('calling');
  document.getElementById('call_button').value = "calling";
  disable_call_button();
  document.getElementById('hangup_button').style.display = "block";
  audio.play();
  setInterval(function() {
    if (!callinprogress && document.getElementById("call_button").value == "calling") {
      audio.play();
      console.log("outgoing!");
    }
  }, 3000);
  audio.play();
}

function answerCall() {
  console.log("answering call");
  callinprogress = true;
  audio.pause();
  socket.emit('answered');
  document.getElementById('answer_button').style.display = "none";
  document.getElementById("partner_peer_id").style.display = "none";
  document.getElementById("my_peer_id").style.display = "none";
  document.getElementById("buttonwrapper").style.display = "inline";
  document.getElementById("hangup_button").style.display = "inline";
  document.getElementById("hangup_button").style.margin = "0% auto 20px";
}

function hangUpShare() {
  socket.emit('hangup');
  hangUp();
}

function hangUp() {
  if (!callinprogress && document.getElementById('answer_button').style.display == "block") {
    console.log("receiver's pre call hang up func");
    enable_call_button();
    audio.pause();
    document.getElementById("hangup_button").style.display = "none";
    document.getElementById("call_button").style.display = "block";
    document.getElementById("answer_button").style.display = "none";
    // document.getElementById("partner_peer_id").style.display = "block";
    // document.getElementById("my_peer_id").style.display = "block";  
    document.getElementById("buttonwrapper").style.display = "flex";
    document.getElementById("hangup_button").style.margin = "20% auto 20px"; 
  } else if (!callinprogress && document.getElementById("call_button").value == "calling") {
    console.log("caller's pre call hang up func");
    enable_call_button();
    audio.pause();
    document.getElementById("answer_button").style.display = "none"
    document.getElementById("call_button").value = "call";
    document.getElementById("hangup_button").style.display = "none";
    // document.getElementById("partner_peer_id").style.display = "block";
    // document.getElementById("my_peer_id").style.display = "block";  
    document.getElementById("buttonwrapper").style.display = "flex";
    document.getElementById("hangup_button").style.margin = "20% auto 20px"; 

  } else if (callinprogress) {
    console.log("common post call hang up func");
    enable_call_button();
    disable_audio();
    disable_video();
    disable_screen();
    disable_note();
    callinprogress = true;
    document.getElementById("audio_button").style.display = "none";
    document.getElementById("video_button").style.display = "none";
    document.getElementById("screen_button").style.display = "none";
    document.getElementById("note_button").style.display = "none";
    document.getElementById("hangup_button").style.display = "none";
    document.getElementById("call_button").value = "call"
    document.getElementById("call_button").style.display = "block";
    document.getElementById("answer_button").style.display = "none"
    // document.getElementById("partner_peer_id").style.display = "block";
    // document.getElementById("my_peer_id").style.display = "block"; 
    document.getElementById("buttonwrapper").style.display = "flex";
    document.getElementById("hangup_button").style.margin = "20% auto 20px"; 
    document.getElementById('mycanvas').style.display = "none";
  }
}

// var startMouseShare = function() {
//   window.addEventListener('mousemove', mousePosition);
//   console.log("start");
//   document.getElementById("remoteScreen").style.cursor = "none";
//   document.getElementById("start_button").style.display = "none";
//   document.getElementById("stop_button").style.display = "inline";
// }

// var stopMouseShare = function() {
//   window.removeEventListener('mousemove', mousePosition);
//   console.log("stop");
//   socket.emit('stopMouse');
//   let r = document.getElementById("remoteScreen");
//   if (r) {
//     r.style.cursor = "auto";
//   }
//   if (screenBeingShared) {
//     document.getElementById("start_button").style.display = "inline";
//   }
//   document.getElementById("stop_button").style.display = "none";
// }

// function mousePosition(e) {
//   console.log("sending mouse position");
//   let pos = {
//     x: e.pageX,
//     y: e.pageY
//   };
//   socket.emit('position', pos);
// }

function disable_call_button() {
  // audio_button_disable = true;
  document.getElementById("call_button").classList.add("buttons_disable");
  document.getElementById("call_button").classList.remove("buttons");
}

function enable_call_button() {
  // audio_button_disable = false;
  document.getElementById("call_button").classList.add("buttons");
  document.getElementById("call_button").classList.remove("buttons_disable");
}

function disable_audio_button() {
  // audio_button_disable = true;
  document.getElementById("audio_button").classList.add("buttons_disable");
  document.getElementById("audio_button").classList.remove("buttons");
}

function enable_audio_button() {
  // audio_button_disable = false;
  document.getElementById("audio_button").classList.add("buttons");
  document.getElementById("audio_button").classList.remove("buttons_disable");
}

function disable_video_button() {
  // audio_button_disable = true;
  document.getElementById("video_button").classList.add("buttons_disable");
  document.getElementById("video_button").classList.remove("buttons");
}

function enable_video_button() {
  // audio_button_disable = false;
  document.getElementById("video_button").classList.add("buttons");
  document.getElementById("video_button").classList.remove("buttons_disable");
}

function disable_screen_button() {
  // screen_button_disable = true;
  document.getElementById("screen_button").classList.add("buttons_disable");
  document.getElementById("screen_button").classList.remove("buttons");
}

function enable_screen_button() {
  // screen_button_disable = false;
  document.getElementById("screen_button").classList.add("buttons");
  document.getElementById("screen_button").classList.remove("buttons_disable");
}

function disable_note_button() {
  document.getElementById("note_button").classList.add("buttons_disable");
  document.getElementById("note_button").classList.remove("buttons");
}

function enable_note_button() {
  document.getElementById("note_button").classList.add("buttons");
  document.getElementById("note_button").classList.remove("buttons_disable");
}
